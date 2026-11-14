#!/usr/bin/env python3
"""Batch 13 economy / wave balance simulation.

Models the live BALANCE numbers, path, towers, archer hero, quiz slow, missed
spawn ticks during questions, kill/correct coin income, 3 waves, and mercy.
Tune only unpublished HP / speed; never the announced coin amounts.
"""
from __future__ import annotations
import json, math, random, statistics, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
B = json.loads(subprocess.check_output(
    ["node", "-e", "console.log(JSON.stringify(require('./js/balance.js')))"],
    cwd=ROOT, text=True))

PATH = [tuple(p) for p in B["path"]]
SLOTS = [tuple(p) for p in B["slots"]]
HERO = tuple(B["heroPos"])
TOWERS = B["towers"]
ARCHER = B["heroes"]["archer"]
COIN = B["coins"]
M = B["monster"]

def dist(a, b):
    return math.hypot(a[0] - b[0], a[1] - b[1])

SEGS, PATH_LEN = [], 0.0
for i in range(1, len(PATH)):
    d = dist(PATH[i - 1], PATH[i])
    SEGS.append(d)
    PATH_LEN += d

def pos_at(d):
    d = max(0.0, min(d, PATH_LEN))
    rem = d
    for i, seg in enumerate(SEGS):
        if rem <= seg:
            f = rem / seg if seg else 0
            x = PATH[i][0] + (PATH[i + 1][0] - PATH[i][0]) * f
            y = PATH[i][1] + (PATH[i + 1][1] - PATH[i][1]) * f
            return x, y
        rem -= seg
    return PATH[-1]

def wave_size(stage_n, w):
    return min(B["waveCountCap"], B["waveBaseCount"] + (stage_n - 1) + (w - 1))

def spawn_delay(stage_n):
    n = min(stage_n, B.get("spawnStageCap", stage_n))
    return max(B["spawnMinMs"], B["spawnStartMs"] - (n - 1) * B["spawnStepMs"]) / 1000.0

def goal_for(stage_n):
    return sum(wave_size(stage_n, w) for w in (1, 2, 3))


class Mon:
    def __init__(self, hp, speed, boss, wave):
        self.hp = hp
        self.hp_max = hp
        self.speed = speed
        self.boss = boss
        self.wave = wave
        self.d = 0.0
        self.alive = True
        self.slow_t = 0.0
        self.slow_mul = 1.0
        self.x, self.y = pos_at(0)


def simulate(stage_n, acc, rng, mercy=False, job="archer", dt=0.05, time_limit=420.0):
    is_boss_stage = stage_n >= 5
    hearts = B["hearts"]
    coins = COIN["start"] + (B["assist"]["coins"] if mercy else 0)
    speed_mul = B["assist"]["speedMul"] if mercy else 1.0
    waves = B["waves"]
    wave = 1
    wave_spawned = 0
    spawned = 0
    killed = 0
    passed = 0
    goal = goal_for(stage_n)
    mons = []
    # slot, type, lv, cd
    towers = []
    hero_cd = 0.8
    hit_stop = 0.0
    t = 0.0
    next_spawn = 0.0  # first monster at t=0
    breaking = False
    break_until = 0.0
    quiz = None  # dict: remain, kind, slot, typ, retries
    correct_total = 0
    mistakes = 0
    busy = False
    done = False
    win = False

    preferred = ["flower", "star", "bubble"]
    slot_order = [0, 3, 1, 4, 2, 5]

    def remaining():
        return max(0, goal - killed - passed)

    def give(n):
        nonlocal coins
        coins += n

    def maybe_start_quiz():
        nonlocal quiz, busy
        if quiz or busy or done:
            return
        built = {tw["slot"] for tw in towers}
        empty = [i for i in slot_order if i not in built]
        if empty and coins >= COIN["build"]:
            typ = preferred[min(len(built), len(preferred) - 1)]
            quiz = {"remain": 2.4 + rng.random() * 1.4, "kind": "build", "slot": empty[0], "typ": typ}
            busy = True
            return
        up = next((tw for tw in towers if tw["lv"] < 2), None)
        if up and coins >= COIN["upgrade"] and len(towers) >= 1 and (len(towers) >= 2 or coins < COIN["build"] * 2):
            quiz = {"remain": 2.4 + rng.random() * 1.4, "kind": "up", "slot": up["slot"], "typ": up["type"]}
            busy = True

    def finish_correct(q):
        nonlocal coins, correct_total, busy, quiz, hero_cd
        correct_total += 1
        give(COIN["correct"])
        if q["kind"] == "build" and not any(tw["slot"] == q["slot"] for tw in towers):
            coins -= COIN["build"]
            towers.append({"slot": q["slot"], "type": q["typ"], "lv": 1, "cd": 0.3})
        elif q["kind"] == "up":
            for tw in towers:
                if tw["slot"] == q["slot"] and tw["lv"] < 2:
                    coins -= COIN["upgrade"]
                    tw["lv"] = 2
                    tw["cd"] = 0
                    break
        # power shot: +2 dmg bonus, nearest
        tgt = nearest(HERO[0], HERO[1] - 70, 1e9)
        if tgt:
            apply_hit(tgt, ARCHER["dmg"] + 2, knock=30)
        quiz = None
        busy = False

    def nearest(x, y, r):
        best, bd = None, r
        for m in mons:
            if not m.alive:
                continue
            d = dist((x, y), (m.x, m.y))
            if d < bd:
                bd, best = d, m
        return best

    def apply_hit(m, dmg, knock=14, slow_ms=0, slow_mul=1, splash=0):
        nonlocal killed, coins, hit_stop
        if not m.alive or done:
            return
        targets = [m]
        if splash:
            for o in mons:
                if o.alive and o is not m and dist((o.x, o.y), (m.x, m.y)) <= splash:
                    targets.append(o)
        for tgt in targets:
            if not tgt.alive:
                continue
            tgt.hp -= dmg
            tgt.d = max(0.0, tgt.d - knock)
            if slow_ms:
                tgt.slow_t = max(tgt.slow_t, slow_ms / 1000.0)
                tgt.slow_mul = slow_mul
            if tgt.hp <= 0:
                tgt.alive = False
                killed += 1
                give(COIN["boss"] if tgt.boss else COIN["kill"])

    def do_spawn():
        nonlocal spawned, wave_spawned
        if done or busy or breaking:
            return False
        if spawned >= goal or wave_spawned >= wave_size(stage_n, wave):
            return False
        if sum(1 for m in mons if m.alive) >= B["maxAlive"]:
            return False
        last = is_boss_stage and spawned == goal - 1
        hpN = min(stage_n, M.get("hpStageCap", stage_n))
        spN = min(stage_n, M.get("speedStageCap", stage_n))
        hp = M["bossHP"] if last else M["hpBase"] + (hpN - 1) * M["hpPerStage"]
        spd = (M["bossSpeed"] if last else M["speedBase"] + (spN - 1) * M["speedPerStage"]) * speed_mul
        mons.append(Mon(hp, spd, last, wave))
        spawned += 1
        wave_spawned += 1
        return True

    def start_break():
        nonlocal breaking, break_until
        breaking = True
        break_until = t + B["breakMs"] / 1000.0

    def check_end():
        nonlocal done, win, wave, wave_spawned, breaking
        if done or hearts <= 0:
            return
        wave_done = wave_spawned >= wave_size(stage_n, wave) and not any(m.alive and m.wave == wave for m in mons)
        if wave_done and not breaking:
            if wave >= waves and killed + passed >= goal:
                done, win = True, True
            elif wave < waves:
                start_break()
            elif killed + passed >= goal:
                done, win = True, True
        elif killed + passed >= goal:
            done, win = True, True

    def reach(m):
        nonlocal passed, hearts, done, win
        m.alive = False
        passed += 1
        hearts = max(0, hearts - (B["bossLeak"] if m.boss else B["leak"]))
        if hearts <= 0:
            done, win = True, False
        else:
            check_end()

    # opening quiz as soon as the stage starts (player can afford one tower)
    maybe_start_quiz()

    steps = int(time_limit / dt)
    spawn_iv = spawn_delay(stage_n)
    for _ in range(steps):
        if done:
            break
        t += dt
        if breaking:
            if t >= break_until:
                wave += 1
                wave_spawned = 0
                breaking = False
                next_spawn = t  # spawn immediately
            else:
                # still tick quiz? no monsters to fight; allow nothing
                continue

        if t >= next_spawn:
            if do_spawn():
                next_spawn = t + spawn_iv
            else:
                next_spawn = t + spawn_iv  # missed tick (busy / cap)

        # quiz
        if quiz:
            quiz["remain"] -= dt
            if quiz["remain"] <= 0:
                if rng.random() < acc:
                    finish_correct(quiz)
                else:
                    mistakes += 1
                    quiz["remain"] = 1.6 + rng.random() * 1.2  # try another option; stay in quiz

        if not quiz:
            maybe_start_quiz()

        f = B["quizSlow"] if busy else 1.0
        sdt = dt * f
        if hit_stop > 0:
            hit_stop = max(0.0, hit_stop - dt)
            continue

        for m in mons:
            if not m.alive:
                continue
            sp = m.speed
            if m.slow_t > 0:
                m.slow_t -= sdt
                sp *= m.slow_mul
            m.d += sp * sdt
            if m.d >= PATH_LEN:
                reach(m)
                if done:
                    break
                continue
            m.x, m.y = pos_at(m.d)
        if done:
            break

        for tw in towers:
            tw["cd"] -= sdt
            if tw["cd"] > 0:
                continue
            st = TOWERS[tw["type"]]["lv"][tw["lv"] - 1]
            sx, sy = SLOTS[tw["slot"]]
            tgt = nearest(sx, sy, st["range"])
            if tgt:
                apply_hit(tgt, st["dmg"], knock=6 if tw["type"] == "flower" else 14,
                          slow_ms=st.get("slowMs", 0), slow_mul=st.get("slowMul", 1),
                          splash=st.get("splash", 0))
                tw["cd"] = st["rate"] / 1000.0
            else:
                tw["cd"] = 0

        hero_cd -= sdt
        if hero_cd <= 0:
            tgt = nearest(HERO[0], HERO[1] - 60, ARCHER["range"])
            if tgt:
                apply_hit(tgt, ARCHER["dmg"], knock=16)
                hero_cd = ARCHER["rate"] / 1000.0
            else:
                hero_cd = 0

        check_end()

    if not done:
        # timeout = defeat
        win = False
        hearts = 0

    return {
        "win": win, "hearts": hearts, "coins": coins, "killed": killed, "passed": passed,
        "towers": len(towers), "upgraded": sum(1 for tw in towers if tw["lv"] >= 2),
        "correct": correct_total, "mistakes": mistakes, "t": round(t, 1),
        "spawned": spawned, "goal": goal, "wave": wave, "mercy": mercy, "acc": acc, "stage": stage_n,
    }


def run_batch(acc, n=40, stages=(1, 2, 3, 4, 5), seed=13):
    out = {}
    for st in stages:
        rng = random.Random(seed + st * 1000 + int(acc * 100))
        rows = [simulate(st, acc, rng, mercy=False) for _ in range(n)]
        wins = sum(1 for r in rows if r["win"])
        hearts = [r["hearts"] for r in rows if r["win"]]
        # mercy: if first attempt fails, two more defeats already assumed? We model
        # a player who already has 2 defeats (mercy on) as a separate batch.
        out[st] = {
            "n": n,
            "win_rate": wins / n,
            "avg_hearts_when_win": round(statistics.mean(hearts), 2) if hearts else 0,
            "avg_towers": round(statistics.mean(r["towers"] for r in rows), 2),
            "avg_time": round(statistics.mean(r["t"] for r in rows), 1),
            "avg_leaks": round(statistics.mean(r["passed"] for r in rows), 2),
            "timeouts": sum(1 for r in rows if r["t"] >= 419),
            "sample": rows[0],
        }
        # mercy cohort
        rng2 = random.Random(seed + 9000 + st)
        mrows = [simulate(st, acc, rng2, mercy=True) for _ in range(n)]
        mw = sum(1 for r in mrows if r["win"])
        out[st]["mercy_win_rate"] = mw / n
        out[st]["mercy_avg_hearts"] = round(statistics.mean((r["hearts"] for r in mrows if r["win"])), 2) if any(r["win"] for r in mrows) else 0
    return out


def evaluate(report):
    """Targets (kids tower defense):
    - 80% player should reliably clear stages 1-4 (>=85%) and usually the boss (>=70%).
    - 50% player may struggle later, but stage 1 should be winnable often (>=50%),
      and mercy after 2 defeats should lift stage 1/2 to >=70%.
    """
    p80 = report["p80"]
    p50 = report["p50"]
    issues = []
    if p80[1]["win_rate"] < 0.85:
        issues.append(f"80% stage1 win {p80[1]['win_rate']:.0%} < 85%")
    if min(p80[s]["win_rate"] for s in (1, 2, 3, 4)) < 0.85:
        issues.append("80% not reliable on stages 1-4")
    if p80[5]["win_rate"] < 0.70:
        issues.append(f"80% boss win {p80[5]['win_rate']:.0%} < 70%")
    if p50[1]["win_rate"] < 0.50:
        issues.append(f"50% stage1 win {p50[1]['win_rate']:.0%} < 50%")
    if p50[1]["mercy_win_rate"] < 0.70:
        issues.append(f"50% stage1 mercy win {p50[1]['mercy_win_rate']:.0%} < 70%")
    # 50% should not steamroll the boss
    return issues


def main():
    p80 = run_batch(0.80)
    p50 = run_batch(0.50)
    report = {
        "balance": {k: B[k] for k in B if k not in ("path", "slots", "heroPos", "towers", "heroes")},
        "pathLen": round(PATH_LEN, 1),
        "waveSizes": {n: [wave_size(n, w) for w in (1, 2, 3)] for n in range(1, 6)},
        "p80": p80,
        "p50": p50,
    }
    # JSON keys were ints; convert
    report["p80"] = {str(k): v for k, v in p80.items()}
    report["p50"] = {str(k): v for k, v in p50.items()}
    issues = evaluate({ "p80": p80, "p50": p50 })
    report["issues"] = issues
    report["pass"] = not issues
    out = ROOT / "tests_p0/b13_balance_sim.json"
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(json.dumps({
        "pass": report["pass"],
        "issues": issues,
        "p80": {str(k): {"win": v["win_rate"], "hearts": v["avg_hearts_when_win"], "mercy": v["mercy_win_rate"]} for k, v in p80.items()},
        "p50": {str(k): {"win": v["win_rate"], "hearts": v["avg_hearts_when_win"], "mercy": v["mercy_win_rate"]} for k, v in p50.items()},
        "waves": report["waveSizes"],
        "pathLen": report["pathLen"],
    }, ensure_ascii=False, indent=2))
    return 0 if report["pass"] else 1

if __name__ == "__main__":
    raise SystemExit(main())
