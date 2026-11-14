# P0 改版紀錄（Chloe，2026-11-09）

- **基準版本**：`raymond-shen/princess-game` 的 `main` 分支，commit `1ed3e6dd9874fa037bf30f9e801d608c86243498`。這個版本已經包含 `eab76e5`（修好「寶物拿齊後過關會卡在勝利畫面」）。複製方式是在已登入的 `gh` 環境下 `git clone`，再用 `git rev-parse HEAD` 確認版本號一致。
- **工作副本**：`/workspace/princess-game-p0/`。只改了本機檔案，**沒有 commit、沒有 push、也沒有部署**。另外把這份副本的 push 網址設成 `no_push`，避免不小心推上去。
- `/workspace/princess-game` 和 `/workspace/princess-game-v1` 都沒有動。

## 改動的檔案和函式

### `js/battle.js`（主要改動）
| P0 項目 | 內容 | 函式／常數 |
|---|---|---|
| 1 城堡愛心＋溫和的失敗 | 城堡有 5 顆 ❤️。怪物走到城堡會扣一顆愛心，城堡搖晃、畫面震動，並飄出 💔。愛心歸零時跳出「城堡累了～小精靈幫你修好了！」畫面，有「🔄 再試一次」（馬上重開這一關）和「🗺️ 回地圖」兩個按鈕。寶石、星星和學習紀錄都保留，也會提示她「都還在喔」 | `HEARTS`、`reachCastle()`、`defeat()`、`retry()`、`checkEnd()`、`updHud()`（顯示愛心） |
| 2 答題時怪物慢速前進 | 原本答題時整個畫面會停住，現在題目或選塔畫面開著時，怪物、塔和主角都以 25% 速度繼續動。這段期間不會出新怪 | `SLOW=0.25`、getter `busy`、`update()`、`spawn()` |
| 3 主角參戰 | 主角站在城堡前方，會依職業自動攻擊：<br>・戰士：近戰衝刺，加劍光弧線，有停頓和震動，射程 200，傷害 2<br>・弓箭手：射箭，射程 480，傷害 1，攻擊最快<br>・魔法師：連鎖魔法，最多同時打 3 隻，射程 340<br>每答對一題，主角會額外放一次「強力一擊」，用職業圖示的子彈，傷害 +2，有大震動和停頓 | `HERO_JOBS`、`HERO_POS`、`heroJob()`、`heroAttack()` |
| 4 3 種塔，每種可升 2 級 | 🌸花花塔（讓怪物變慢）、⭐星星塔（單體傷害高）、🫧泡泡塔（範圍攻擊）。點空塔位會先選塔種，再答題；**答對才會蓋好**。點已經蓋好的塔要再答對一題才能升到 Lv2（★★）。到滿級時只會提示「滿級 ✨」。拿掉原本「充能用完就停火」的設計，塔蓋好後會一直攻擊。題目卡片最上方會寫「蓋／升級 哪一座塔」；左下角有 ✖ 可以取消，取消就不蓋 | `TOWER_TYPES`、`tapSlot()`、`openPicker()`、`closePicker()`、`buildTower()`、`upgradeTower()`、`towerFire()`、`closeQ()`、`cancelQ()`、`ask()`、`buildQ()` |
| 打擊感 | `hit()` 改成可以帶參數：停頓時間、震動、緩速、擊退。命中時怪物會壓扁再彈回，被緩速時血條變藍。只有主角和彩虹大招會觸發畫面停頓和大震動，塔的攻擊不會，避免畫面一直卡卡的 | `hit()`、`shoot()`、`drawHp()`、`bigAttack()` |
| 5 修正 spell2pic | 把錯誤選項換成「目標音節聲調不同」的詞，並把選中那張圖的詞的聲調傳進 `answer()`，所以答錯時跟其他題型一樣會寫進 `toneStats`（`正確>誤選`）和 Leitner 複習盒 | `buildQ()` 裡的 spell2pic 段落 |
| 其他 | 星數改成只算「第一次就答錯」的題數，這是提案裡 P0 的第 7 項。換寶物後主角會在原位重新畫。`win()` 會先關掉還開著的題目或選塔畫面。勝利後 `toMap()` 會先存檔 | `answer()`、`win()`、`dropTreasure()`、`toMap()` |

### `js/learn.js`
- 新增 `Learn.toneAt(word,i)`：取得某個詞第 i 個音節的聲調。
- 新增 `Learn.toneDistractPics(item,n)`：挑錯誤選項時，優先選目標音節聲調不同、音節數相同的詞。
- `Learn.record()`：如果「答錯但選到的聲調剛好和正確答案一樣」，就不寫進 `toneStats`，避免家長報表把它算成答對。Leitner 照樣記錄這次答錯。

### 沒有改的部分
- 服裝全部開放（沿用原本設定）。
- 題庫 `data/vocab.json` 沒有改。
- 15 分鐘休息提醒原本就有（`checkRest()`），沿用。
- `save.js` 的存檔格式沒有改。城堡愛心是單場戰鬥的狀態，不寫進存檔。

### 新增的檔案（測試用，不影響遊戲）
- `tests_p0/p0_playtest.py`、`tests_p0/p0_hero_jobs.py`、`tests_p0/p0_playtest_result.json`
- `shots_p0/*.png`

## 測試結果
- **測試環境**：本機 `python3 -m http.server`，加上 Playwright 的無頭 Chromium。視窗大小 1180×820，有觸控（`has_touch`、`is_mobile`），user agent 設成 iPad。點擊都用 `touchscreen.tap`。

| 項目 | 結果 | 證據 |
|---|---|---|
| 進入戰鬥（從開始畫面 → 地圖 → 點第 1 關） | ✅ 通過 | `battle_started: true` |
| 點空塔位會跳出選塔畫面 | ✅ 通過 | `picker_open: true`，截圖 1 |
| 題目開著時怪物繼續前進 | ✅ 通過 | 2 秒內怪物前進約 9px（127.6→136.6）；正常速度 18px/s，等於約 25% 速度。截圖 2 |
| 答對才會蓋塔 | ✅ 通過 | `towers[0]` 變成 `flower/lv1` |
| 答對才會升級 | ✅ 通過 | 再點同一座塔會出現升級題，答對後變成 `lv: 2` |
| 3 種塔都能蓋 | ✅ 通過 | `{"0":"flower/lv2","1":"bubble/lv1","3":"star/lv1"}` |
| 主角自動攻擊和強力一擊 | ✅ 通過 | 自動攻擊 3 次，答對後的強力一擊 3 次。截圖 3b |
| 三種職業的攻擊 | ✅ 通過 | 戰士 2 次，打掉 4 點血。魔法師 3 次，每次連鎖打中 3 隻怪物。弓箭手 4 次。結束後 `heroBusy` 都是 false，主角也回到原位 |
| spell2pic 答錯會被記錄 | ✅ 通過 | 例如「貓咪#0」：localStorage 的 `toneStats["1>4"]` 從 0 變成 1，Leitner 紀錄 `wrong:1, box:1, miss:2`。截圖 4 |
| 怪物到城堡會扣愛心 | ✅ 通過 | 愛心 5→4 |
| 愛心歸零時出現再試一次畫面 | ✅ 通過 | `defeat_shown: true`，截圖 5 |
| 失敗不會損失進度 | ✅ 通過 | 失敗前後 localStorage 的寶石都是 4、星星都是 5 |
| 按「再試一次」會重新開始 | ✅ 通過 | 重開後愛心 5、`defeated: false`、塔清空、怪物重新出現。截圖 6 |
| Console 錯誤 | ✅ 沒有錯誤 | `pageerror`、`console.error` 和 `window.__errs` 都是空的 |

### 沒有測到、或要注意的地方
- **沒有在真的 iPad Safari 上試玩**。聲音解鎖、zh-TW 語音和觸控手感，都還需要在 iPad 上確認。
- 為了加快測試，有些步驟是用腳本直接設定狀態的，包括：
  - 指定題型（`forceType`）。
  - 把怪物直接移到城堡門口。
  - 把愛心設成 1。
  - 讓怪物出現在主角射程內。

  答題、選塔和按「再試一次」都是真的觸控點擊。
- 拖曳題（drag）這次沒有自動化測試，程式也沒有改到這段。
- 平衡（怪物速度 18、血量、塔的傷害）只是第一版的猜測，建議讓女兒實際玩一兩關再調整。

---

# P0 第二批（2026-11-09 晚上）：寶物圖鑑、給爸爸看、美術接口、Lily 防禦塔

同樣只改 `/workspace/princess-game-p0/` 這份副本：沒有 commit、push 或部署，也沒有動其他資料夾。

## 改動的檔案和函式

| 檔案 | 內容 |
|---|---|
| `js/scenes.js` | **新增 `Album` 場景（寶物圖鑑）**<br>・8 件寶物：已收集的顯示彩色圖加名字（`TREASURE_INFO`），正在穿戴的會標 👚；還沒拿到的顯示剪影（`setTintFill`）和「???」<br>・上方有進度條「已收集 x / 8」<br>・點卡片會唸出寶物名字，或提示「連續答對三題就有機會拿到」<br>・資料直接讀 `Save.data.inventory` 和 `equipped`<br>**新增 `albumButton()`**：大顆的「🏆 寶物圖鑑」按鈕，右上角有 x/8 徽章，放在地圖右下和小屋右上<br>**新增 `parentGate()`**：右下角一個小小、半透明的 ⚙️。按住會出現一圈進度環和「家長請按住 2 秒」，按滿 2 秒才進入，輕點不會進去<br>**`Report` 改成「給爸爸看」**：最近常錯的字（附注音、目標音節、她選了哪個聲調、錯幾次／練幾次）、最容易搞混的聲調組合（例如 一聲↔二聲，含兩個方向的次數）、各聲調正確率、各課正確率（第 1–9 課，看第一次作答）、複習盒分布。匯出、匯入和返回按鈕保留，統計集中在 `Stats` 物件<br>**`Boot`**：載入 `data/assets_manifest.json`，再交給 `Art.queue()`<br>**`MONSTERS`**：每隻怪物加上 `art` 鍵<br>**地圖**：原本的 👨‍👧 按鈕換成 ⚙️ 家長入口和寶物圖鑑按鈕 |
| `js/art.js`（新檔） | **`Art`**：讀取美術清單，只載入 `ready:true` 的檔案；如果載入失敗會記成 `failed`，自動改用 emoji。`Art.make()` 依 manifest 的 origin 和大小產生圖片，沒有圖就用 emoji。`Art.fxKey()` 在沒有粒子圖時，由程式產生星星和四芒星的貼圖<br>**`fxStarsAway()`**：怪物被打倒時壓扁消失，變成 7 顆彩色星星往上飛散，加上閃光粒子；魔王是 12 顆<br>**`fxSparkle()`**：答對時出現光圈、旋轉的四芒星粒子，四周還會閃出 4 顆星 |
| `js/battle.js` | 怪物改用 `Art.make`（沒有圖時維持原本的 emoji）。所有縮放動畫改成乘上 `baseScale`，圖片和 emoji 兩種都能用<br>新增 `towerSprite()`：有美術圖時，用錨點對準塔位落地點（`TOWER_GROUND=30`），以 160px（0.625 倍）顯示，塔位圓圈改成地面陰影。用 `topY` 算出圖片實際的頂端，讓「蓋好了／升級／滿級」的文字放在塔頂上方，不會壓到星星塔 Lv2 的旗子<br>`buildTower()`、`upgradeTower()` 改成換圖：Lv1 換成 Lv2，並加上彈跳和閃光<br>`hit()` 在擊倒時呼叫 `fxStarsAway`。`answer()` 答對時呼叫 `fxSparkle`<br>新增 `heroExpr()`：有表情圖層就換上（答對歡呼 1.2 秒，平常是開心），沒有圖時在頭上冒出 🎉 或 😊 |
| `js/character.js` | `Char.build(..., expr)` 支援表情圖層（`princess_expr_*`，drawOrder 44） |
| `js/learn.js` | `record()` 多記 `last`、`lastWrong`、`lastChosen`，給家長頁排序「最近錯的字」，並顯示「她選了哪個聲調」 |
| `js/main.js` | 註冊 `Album` 場景 |
| `index.html` | 載入 `js/art.js` |
| `data/assets_manifest.json`（新檔） | 單一美術清單，共 23 個鍵。每個鍵有 file、ready、w、h、origin、fallback、displayPx 和說明 |
| `assets/art/towers/*.png`（新檔） | Lily 的 towers_v001，6 張 256×256 圖，從 `/workspace/princess-game/art/towers_v001/png_256/` 複製過來，已設為 ready。錨點用 Lily manifest 裡的 `anchor_bottom_center`，約 (128.5, 251) |
| `tools/update_assets_manifest.py`（新檔） | 檢查每個素材檔是否存在、尺寸和 RGBA 是否正確，並自動更新 `ready`。加 `--dry` 只檢查、不寫入 |
| `tests_p0/p0b_playtest.py`、`p0b_playtest_result.json` | 這一批的自動測試和測試結果 |

## 測試結果
環境和上一批一樣：無頭 Chromium，1180×820，觸控，iPad user agent。測了三種情境：有 Lily 的塔圖（art）、完全沒有美術檔（fallback）、清單標 ready 但檔案不存在（missing）。

| 項目 | 結果 | 證據 |
|---|---|---|
| 從地圖大按鈕進入寶物圖鑑 | ✅ 通過 | 存檔裡有 3 件寶物，畫面顯示「已收集 3 / 8」；皇冠、蝴蝶翅膀、小貓咪是彩色，其餘 5 件是剪影加「???」。截圖 `7_album.png` |
| 從小屋進入圖鑑，返回時回到小屋 | ✅ 通過 | `from: Home` |
| 家長入口：輕點不會進去 | ✅ 通過 | `gate_short_tap_opens: false` |
| 家長入口：按住 2.4 秒會進去 | ✅ 通過 | `gate_hold_opens: true` |
| 答錯幾題後，家長頁顯示資料 | ✅ 通過 | 3 題第一次都答錯（hear、spell2pic、pic2spell）後，常錯的字列出 2 個詞（其中一個詞錯了兩次）；搞混的聲調顯示「一聲↔二聲 2 次、一聲↔四聲 1 次」；各課正確率顯示「第 2 課 2/5」。截圖 `10_parent_page.png` |
| 塔使用 Lily 的圖，升級時換成 Lv2 | ✅ 通過 | 花花塔 Lv2、泡泡塔 Lv1、星星塔 Lv2 都換成 `art_tower_*` 圖片；顯示框 160px，塔身實際高度約 94–126px。截圖 `8_towers_lily_art.png` |
| 沒有美術檔時改用 emoji | ✅ 通過 | 塔、怪物和寶物都是 emoji，粒子用程式產生的貼圖，console 沒有錯誤。截圖 `8_towers_fallback.png` |
| 清單標 ready 但檔案不存在 | ✅ 遊戲照常運作 | 自動改用 emoji。瀏覽器會留下「404 Failed to load resource」的網路紀錄，這是預期的，沒有 JavaScript 錯誤。截圖 `8_towers_missing.png` |
| 怪物被打倒時變星星飛走 | ✅ 通過 | `fxStarsAway` 觸發 3–4 次。截圖 `9_star_effect.png` |
| 答對時的閃亮特效 | ✅ 通過 | `fxSparkle` 觸發 3 次 |
| 上一批 P0 測試重跑（回歸測試） | ✅ 通過 | 答題時怪物慢速前進、蓋塔、升級、主角攻擊、扣愛心、再試一次、spell2pic 錯題記錄全部通過，console 沒有錯誤 |
| JavaScript 錯誤 | ✅ 沒有 | art 和 fallback 兩種情境的 console error 和 `window.__errs` 都是空的 |

### 還沒測、要注意的地方
- 沒有在真的 iPad 上測。2 秒長按在 Safari 上可能會跳出系統的放大鏡或選字。頁面已經設定 `-webkit-user-select:none`、`-webkit-touch-callout:none`，但還是建議實機試一下。
- 測試時寶物掉落視窗會蓋住畫面，所以截圖前有用腳本按「🏠 收起來」。這個視窗在戰鬥中不會暫停遊戲，這是原本就有的行為，沒有改。
- 怪物、表情、寶物和粒子的正式美術還沒交，目前只驗證了「沒有圖時改用 emoji」這條路。表情圖層的程式已經寫好，但還沒有真的圖可以測。

## 請 Lily 交付的檔案（PNG、RGBA、straight alpha、sRGB、8-bit，尺寸要完全一致）
| 鍵 | 路徑 | 尺寸 | 錨點和用途 |
|---|---|---|---|
| tower_{flower,star,bubble}_lv{1,2} | `assets/art/towers/tower_<種類>_lv<級>.png` | 256×256 | ✅ 已交（towers_v001）。底部置中，約 (128.5, 251) |
| princess_expr_happy／princess_expr_cheer | `assets/art/princess/princess_expr_happy.png`、`princess_expr_cheer.png` | 1000×1100 | 跟角色規格同一張畫布，原點 (0,0)，不裁切。只畫臉部表情（眼、眉、嘴、腮紅），疊在 body_safe_main 上、hair_front 下（drawOrder 44）。happy 是平常和過關時用，cheer 是答對時用 |
| monster_slime／monster_mush／monster_bat／monster_ghost | `assets/art/monsters/monster_<名字>.png` | 256×256 | Q 版，底部置中，腳底貼齊畫布底部。面向畫面左邊（怪物從左邊走來）。遊戲裡約 72px 高 |
| monster_black_dragon | `assets/art/monsters/monster_black_dragon.png` | 512×512 | 黑龍魔王，可愛不嚇人。底部置中。遊戲裡約 160px 高 |
| treasure_crown／flower_crown／bow／necklace／wings／cat／unicorn／star_cape | `assets/art/treasures/treasure_<id>.png` | 256×256 | 寶物圖鑑用的圖示，置中。剪影由程式自動產生，不用另外畫 |
| fx_star | `assets/art/fx/fx_star.png` | 128×128 | 單顆星星粒子，白色或淡黃，中心最亮，置中。程式會再上色 |
| fx_sparkle | `assets/art/fx/fx_sparkle.png` | 128×128 | 四芒星閃光粒子，白色為主，置中。程式會再上色 |

檔案放好後，執行 `python3 tools/update_assets_manifest.py`，程式會自動把 `ready` 改成 true。如果錨點不是底部置中，要另外修改 manifest 裡的 `origin`（用比例表示，例如 [0.5, 0.98]）。

---

# 第三批：(A) 教育部發音音檔、(B) 存檔碼備份、(D) 整合 Lily 的 extras_v001

## (A) 教育部《國語辭典簡編本》音檔

### 授權查核結論：可以放進免費家庭遊戲（GitHub Pages），但有條件
- **授權**：創用CC「姓名標示－禁止改作 3.0 臺灣」（CC BY-ND 3.0 TW）。可以重製和散布，商業用途也可以，但**不可以改作**。
  - 教育部語文成果授權頁：https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/index.html
  - 簡編本下載頁：https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/dict_concised_download.html
  - 使用說明 PDF：https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/download/conciseddict_10312.pdf
- **必要的姓名標示**（已原文放進「版權與音檔來源」頁）：
  > 中華民國教育部（Ministry of Education, R.O.C.）。《國語辭典簡編本》（版本編號：2014_20260929）網址：https://dict.concised.moe.edu.tw/
- **必須完整附上使用說明**：已放在 `assets/audio/words/conciseddict_10312_使用說明.pdf`，另附文字版 `MOE_使用說明.txt`。
- **禁止改作**：音檔一律保持**原檔**，沒有剪輯、轉檔或重新壓縮。遊戲播放時只用 WebAudio 從原檔的指定時間點播一段（`start(0, 起點, 長度)`），檔案本身沒有改。
- **注意**：國家教育研究院 FAQ（https://www.naer.edu.tw/eng/PageFaq）說不可以用程式爬取網頁或 App 的內容，而且有一則較舊的說明寫「限非商業使用」。所以這次**只用官方的整包下載檔**，沒有爬網站。這個遊戲是免費、非商業的，兩種說法都符合。

### 下載結果：82 個詞裡找到 39 個（共 27MB）
- 來源是官方分割壓縮檔，只用 HTTP Range 讀出需要的 WAV，沒有下載整包 14.7GB：
  - `dict_concised_music_www_2014_20260929.zip.001–005`（詞目全文聲音檔）
  - `dict_concised_music_word_2014_20260929.zip`（單字聲音檔）
- 存放位置是 `assets/audio/words/moe_www_<id>.wav` 或 `moe_word_<id>.wav`。清單在 `data/audio_words.json`，記錄每個詞的檔名、播放起點和終點、教育部 id、壓縮檔內路徑和 sha256。
- 教育部的音檔是「整個詞條」的朗讀，會一路唸到釋義，長度 11–78 秒。遊戲用靜音偵測找到第一段，也就是詞目本身，再多留 0.15 秒。**這些起點和終點是程式判斷的，沒有人工逐一聽過**，建議找時間聽一輪。
- 播放順序：先播音檔。沒有音檔或載入失敗時，自動改用 `speechSynthesis`。
- **缺少的 43 個詞**（原因有兩種：簡編本沒有同音的詞條，或有詞條但官方沒有錄音）：
  貓咪、寶寶、河馬、河狸、翹翹板、小紅花、一朵、烏龜、黃牛、浣熊、兔子、菜園、媽媽、得意、孵出、五隻、泡澡、手拉手、好朋友、一起、高高低低、小鳥、謝謝、畫畫、比賽、領先、氣餒、後面、蘿蔔、拉著、嘿唷、小熊、大球、孔雀、魔術、合唱、嗶、忙著、背著、跟在、哈哈笑、長出、表演

## (B) 存檔碼備份（公主存檔卡）
- **入口**：齒輪 ⚙️（家長入口，要按住 2 秒）→「給爸爸看」→「💾 公主存檔卡（匯出）」或「📥 匯入存檔碼」。
- **存檔碼格式**：`KXZ2.<lz-string 壓縮內容>.<4 碼檢查碼>`。練習紀錄壓成陣列，時間改用「分鐘差」記錄，讓存檔碼夠短，放得進 QR。舊的 `KX2-` 格式也還能匯入。
- **QR 完全在本機產生，不連網**：用 qrcode-generator（MIT）加上 lz-string（MIT），兩個都放在 `js/vendor/`，授權檔也一起附上。
  - 卡片上的 QR 用整數像素畫格子。
  - 點一下 QR 會開啟全螢幕版。這一版用裝置解析度產生 GIF，存檔很大時也掃得到。
  - 如果存檔大到 QR 放不下，卡片會顯示「請用『複製存檔碼』」。
- **匯入流程**：貼上存檔碼 →「檢查存檔碼」會檢查版本、檢查碼和格式，並用表格比較「存檔碼裡的進度」和「這台 iPad 目前的進度」→ 按「確定取代」才會覆蓋。覆蓋前會先把舊進度備份到 `kx_save_v2_before_import`。
- **錯誤訊息**：
  - 「請先貼上存檔碼」
  - 「存檔版本不符：這是 v3 的存檔碼，這個遊戲版本只能讀 v2」
  - 「存檔碼不完整或打錯了（檢查碼不符）」
  - 「這不是公主冒險的存檔碼」
- **為「公主存檔卡」預留的設計**：
  - 卡片上有角色本人（用 `Char.build` 畫出選好的造型）、日期、職業、星星、寶石、寶物、練過的音和過關數。
  - 卡框目前用程式畫的。之後 Lily 交 `assets/art/ui/savecard_frame.png`（880×600）就會自動換上，manifest 鍵是 `savecard_frame`，目前 `ready:false`。

## (D) Lily extras_v001 整合
- 17 個檔案複製進 p0 後，已執行 `tools/update_assets_manifest.py`。這個工具現在也會檢查色彩模式，相簿背景允許用 RGB。
  - 怪物 4 隻（256，原點 128,247）
  - 黑龍（512，原點 256,496）
  - 寶物 8 件
  - fx_star、fx_sparkle
  - 相簿 8 格背景
  - 表情 happy、cheer
- **怪物**：
  - 顯示高度約 84px，黑龍約 180px，血條位置跟著圖片高度調整。
  - 怪物是往右走的，所以蝙蝠、幽靈、黑龍往右移動時會自動水平翻轉。
  - 史萊姆和蘑菇照指示不翻轉（牠們只是微微朝左）。
  - 蝙蝠和幽靈會上下飄。
- **相簿**：用 `album_bg_8slots` 書本背景和它的 8 個格子座標。已收集的寶物顯示彩色，未收集的顯示剪影加「???」。
- **特效**：星星飛走和答對閃光都改用 Lily 的粒子圖，大小以 64px 為基準自動換算。
- **表情**：
  - drawOrder 70，在衣服前層（65）上面、前髮（75）下面。cheer 只有臉。
  - **這兩張表情是照 Lily 的 v003/m02 母版畫的**，p0 目前用的是暫代母版 `m01_pending_approval`，硬疊上去五官會對不準。
  - 所以 manifest 設了 `requiresMaster: girl01_m02_candidate_pose01`，母版不符時不顯示，主角頭上改顯示 🎉／😊 泡泡。
  - 網址加 `?forceExpr=1` 可以強制疊上去檢查（截圖 17）。
  - 換成 m02 母版或重畫對應的皮膚補丁之後才會正式啟用。
- **沒有整合** `production_batch_01`（服裝），照指示等它可以上線再說。

## 第三批測試結果
測試方式：Playwright 加 headless Chromium，模擬 iPad，1180×820 觸控畫面。測試腳本是 `tests_p0/p0c_playtest.py`，結果在 `tests_p0/p0c_playtest_result.json`。

| 項目 | 結果 | 說明 |
|---|---|---|
| 版權與音檔來源頁 | ✅ | 首頁和家長頁都有「ⓘ」連結。截圖 `11_credits.png` |
| 有音檔的詞播原音 | ✅ | 老師（詞目檔）、跑（單字檔）的 `lastSource` 是 `moe` |
| 沒有音檔時改用 TTS | ✅ | 貓咪（沒有音檔）改用 `tts` |
| 音檔載入失敗時改用 TTS | ✅ | 測試時故意讓大象的音檔回 404，結果改用 `tts`，沒有 JavaScript 錯誤 |
| 存檔卡和 QR | ✅ | 69×69 格的 QR，存檔碼 421 字。**用 OpenCV 從截圖解碼出來的內容和存檔碼完全一致**。截圖 `12_savecard.png` |
| 大存檔（149 個音全練過） | ✅ | 存檔碼 2923 字，QR 177 格。點一下 QR 開全螢幕版，解碼結果一致；匯出再解析後 149 筆完整。截圖 `12b_savecard_big_qr.png` |
| 匯入：版本不符、檢查碼錯 | ✅ | 跳出對應的中文錯誤訊息。截圖 `13b_import_error.png` |
| 匯入：確認前不覆蓋，確認後還原 | ✅ | 確認前星星還是 999；確認後還原成 20 星、12 寶石，而且有備份。截圖 `13_import_confirm.png` |
| 相簿用書本背景 | ✅ | 顯示 4/8，8 個圖示都是 Lily 的圖。截圖 `14_album_lily.png` |
| 怪物和黑龍 | ✅ | 都用 `art_` 貼圖，翻轉規則正確。截圖 `15_monsters_dragon.png` |
| 粒子特效 | ✅ | 用 `art_fx_star` 和 `art_fx_sparkle`。截圖 `16_fx_lily.png` |
| 表情疊圖 | ⚠️ 依設計關閉 | 母版不符，所以 `exprOK=false`。強制疊圖的截圖是 `17_expr_overlay_on_placeholder.png` |
| JavaScript 錯誤 | ✅ 沒有 | 唯一的 console 404 是上面故意製造的大象音檔 404 |

### 已知限制
- 沒有在真的 iPad 上測。iOS Safari 要等使用者點過畫面才能播 WebAudio；遊戲在開始畫面點擊時會解鎖，但還是要實機確認。
- 音檔的起點和終點是程式判斷的，沒有人工聽過。
- 存檔碼的上限大約 2950 字。目前把全部 149 個音都練過、資料很完整時是 2923 字，已經接近上限。之後如果存檔再加欄位，要再壓縮，或改成兩張 QR。
- 用相機掃 QR 會得到一段文字，要再貼到「匯入存檔碼」裡。遊戲本身沒有掃描功能（要掃描就得開相機權限，所以刻意不做）。

### 回歸測試（換上 Lily 的新圖之後重跑）
- `p0_playtest.py`、`p0b_playtest.py`、`p0_hero_jobs.py` 全部通過，沒有 JavaScript 錯誤。
- p0b 的「清單標 ready 但檔案不存在」情境會刻意讓所有圖片回 404，所以 console 會出現多筆 404 網路紀錄，這是預期的。遊戲照常運作，自動改用 emoji。
- 截圖 1–10 也都用新版重新產生。

---

# 第四批：公主存檔卡換上 Lily 的卡框 ui_v001
- `savecard_frame.png`（880×600，RGBA）已複製到 `assets/art/ui/`，manifest 的 `ready` 已改成 true。版面座標照 `savecard_layout.json`，參考副本放在 `data/savecard_layout.json`。如果卡框圖缺少，會改用程式畫的卡框，各區位置和 Lily 的版面一樣。
- **容器**：用 880×600 的整張畫布當容器，所以四角的櫻花和上面的蝴蝶結都不會被裁掉。容器會等比例縮小到放得進遊戲畫面（1024×768，目前縮放比例是 1），整個遊戲再由 Phaser 的 Scale.FIT 縮放到 iPad 螢幕。卡片在畫面上的位置是 (72,42)–(952,642)。
- **各區內容**：
  - 標題：「👑 公主的冒險存檔」。
  - 角色：contain、水平置中、底部對齊，四周內縮 8px。
  - 中欄：存檔日期、職業、星星、寶石、練過的音、過關數。
  - QR 下方說明區：掃描說明和存檔碼字數。
  - 寶物列：Lily 的版面有 11 格，這裡只用 8 格，置中排列。格子大小 48px，間距 60.6px 和她的建議一樣。已收集的顯示彩色，沒收集的顯示剪影。
- **QR**：
  - 放在 (572,152)–(808,388)，純白底，深色格子是 #3A2F4A。
  - 每一格都是整數像素，QR 置中；四周 24px 的白色面板就是 QR 需要的空白邊。
  - 每格的螢幕大小小於 3px 時，說明區會改成粉紅色的「👆 點 QR 放大後再掃描」。點 QR 會開全螢幕版。
- **修正一個 bug**：角色圖片如果已經有快取，角色會在 create() 裡同步建立；這時原本的 `isActive()` 檢查會擋掉，角色就不會出現。已改成檢查 displayList。
- **測試結果**（`tests_p0/p0c_playtest.py`）：
  - 一般存檔：存檔碼 419 字，QR 69 格、每格 3px。OpenCV 從截圖直接解碼，內容和存檔碼完全一致 ✅
  - 大存檔：149 個音全練過，存檔碼 2917 字，QR 177 格、每格 1px。卡片上的小 QR 解不出來，這是預期的，所以說明區會顯示「點 QR 放大」。點開全螢幕版後解碼內容完全一致 ✅
  - 匯入、錯誤訊息、確認後覆蓋都通過，沒有 JavaScript 錯誤。唯一的 404 是測試時故意讓大象音檔載入失敗。
  - 截圖：`shots_p0/18_savecard_lily.png`（一般存檔）、`18b_savecard_lily_large.png`（大存檔）、`12b_savecard_big_qr.png`（全螢幕 QR）。`12_savecard.png` 也已更新成新版。
- **小調整（角色大小）**：存檔卡左欄的角色會先算出看得到的範圍（圖層的不透明區域，加上 emoji 皇冠），再縮放到欄位高度的 90%（317/352px），水平置中、底部對齊（離底 8px）。皇冠和弓的佔位圖不變，等 Lily 的換裝清單交來再換。重拍了 `18_savecard_lily.png`；一般存檔的 QR 從截圖解碼一致，大存檔（2910 字）點開放大後解碼也一致。

---

# 第五批：Lily v3 換裝／髮型／m02 表情（2026-11-10，新加坡時間 UTC+8）

## 範圍與核准
Raymond 經 Yuki 核准只整合到 `/workspace/princess-game-p0/` 副本。沒有更動 `/workspace/princess-game`、`princess-game-v1` 或 Lily 的來源素材；沒有 commit、push、deploy，也沒有建立任何線上測試網址。原 manifest 的 `productionReady=false`、`runtimeUseAllowed=false` **照樣保留**；這次是副本測試，不代表正式上線核准。

## 匯入工具與資料
- 新增 `tools/import_character_v3.py`，來源預設為 Lily 的 `character_complete_manifest_v3.json`。逐檔核對 sha256，只讀來源，複製到 `assets/art/princess/v3/`。
- 123 個 half WebP（500×550）、Lily 的 256/128 選單縮圖（PNG＋WebP）、全尺寸 PNG 備援，共 434 檔、約 18.1 MB；half 圖層總計 2.25 MB。不重複包 full WebP。
- 全尺寸 PNG 只在 WebP 偵測失敗或個別 WebP 載入失敗時才載入；不是啟動時把整套圖都讀一遍。
- 產生 `data/character_runtime_v3.json`（相對路徑、masterId、圖層、帽髮變體、thumbs、遊戲專用 jobs/equipment 與空的握持擴充欄位）。來源 sha256 保留 `05c13e2a…330a6`，兩個核准旗標仍是 false。
- `tests_p0/validate_character_v3.py` 驗證 246 個 PNG／WebP 雜湊，608 個 manifest path 全可讀，尺寸、六件 wornLayer:false 和 drawOrder 都通過。

## 角色組裝與選單
- 改寫 `js/character.js`，照 v3 的 requiredAlways、hairPairs／hatVariants、outfits.parts、defaultAccessories 組裝，按 drawOrder＋tieRank＋防禦性 id 第三鍵排序。
- 換用 m02 母版，錨點改成 hand_center_screen_left/right、head_center、neck_center、waist_center；固定完整 1000×1100 邏輯畫布和 y=1030 腳線，不把 half 座標再縮一次。
- A4／A6 戴 B7 時前後髮兩片一起換；拿掉帽子還原。B8 不換髮。皇冠／花圈與兩頂帽子是同一個 headwear 單槽。
- 選單使用 Lily 的縮圖，只有可見分頁的縮圖會載入；新增帽子頁，並可以單獨關掉服裝預設劍／盾。
- 每個目前裝備組合先合成成一張 500×550 Phaser canvas texture（含穿戴佔位圖和表情）。分層 Image 參照合成後釋放；LRU 最多 8 張 composite，活躍圖不會被刪。
- 啟動時只讀一張 WebP 作能力偵測，不讀整套衣櫃。主測試合成後 liveDecoded=0、sources=0；30 次換裝壓力測試快取上限維持 8，銷毀角色後 refs=0。
- 修正快取縮圖同步回呼會碰到上一版已銷毀物件的問題，並讓舊的非同步換裝請求不能蓋掉新選擇。
- 若 WebP 和 PNG 都不存在，安全降級成公主 emoji，遊戲不會當機。

## 表情、寶物與握持擴充
- happy、cheer 以 v3 的 expressionLayer／requiresMaster 啟用，不再靠 forceExpr。都在 drawOrder 70，衣服前片／道具之上、瀏海之下。
- 像素比對：happy 有 3240 個變動像素、cheer 3242 個；**兩者在表情 alpha 遮罩外的變動都是 0**。m02 母版／表情 requiresMaster 一致。
- 六件穿戴寶物仍是佔位圖：皇冠、花圈、項鍊、翅膀、星星披風、髮飾蝴蝶結。項鍊 68、披風後層 18，未來披風扣前層 68。
- manifest 宣告 `wornLayer:true`，並用 layers／parts／assetId 指向新圖層時，會自動取代 emoji；frontLayers 可放披風扣等前片。測試以記憶體內資料驗證，沒有修改 Lily 的 manifest。
- 按最新 steering 預留**替代正常手臂的握拳層＋共用握點＋各武器圖層**的正規化接點；可附 pose／handVariant 和依寶物、頭髮、服裝條件的排除表。
- Lily 還沒提供握持 spec 的正式名稱，因此沒有猜任何新資產 id、握點 id 或 enum。`gameHooks.heldItem=null`，沒有畫假的握拳或職業向量弓／劍／魔杖。B3 已交的玩具劍／盾仍是原本的配件，**不宣稱有握姿**。
- 接點設計與未來對映方式見 `docs/character_v3_integration.md`。測試用既有資產 id 在記憶體內注入規則，證實會移除 normal arm_front、使用單一握點附件、套用頭髮／服裝條件與寶物排除。

## 存檔與公主存檔卡
- 舊 hairStyleId／hairColorId／outfitId 能轉回遊戲內的 hair／hairColor／outfit；保留原值的完整備份在 `kx_save_v2_before_wardrobe3`，進度／星星／寶石不變。原本就用 A1–A6／B1–B12 的存檔沿用。
- headwear 缺省＝服裝預設；null＝明確不戴；id＝指定帽子或皇冠／花圈。原裝備皇冠會遷移到 headwear。
- 保持 v2 與 `KXZ2.` 外框。改把重複字詞的練習紀錄分組，並縮短角色欄位；舊 `KXZ2` 的 L.l 格式和 `KX2-` 原始碼仍可讀。
- 149 筆練習＋v3 角色／配件開關的大存檔約 **2740 字**，低於 QR 2950 字上限；額外帶 pose／handVariant／完整帽子 id 的獨立容量測試也能放入。仍保留過大時改用複製碼的處理。
- 匯入前先比較、按確認才覆蓋，覆蓋前備份仍正常（999 星→確認後 20 星）。
- 存檔卡改成**固定整張畫布**比例 0.3168（canvasH 348.48），不再量每套 alphaBBox。無帽的視覺仍接近欄高 90%，戴 B7 尖帽身體不會縮小；兩張卡的比例完全相同，四角花／蝴蝶結和 QR 都保持完整。

## 測試與截圖
`tests_p0/p0d_v3_playtest.py` 的 18 項斷言全過：懶載入、遷移／備份、單 sprite composite、兩組帽髮變體、頭飾互斥、未來接點、表情像素對位、一般 QR、固定肖像比例、舊碼、大碼容量＋解碼、角色 round-trip、確認覆蓋、有限快取、旗標不變、PNG 備援、個別 WebP 故障備援、無 JavaScript 錯誤。
- **OpenCV 解碼**：一般存檔直接從卡片截圖解碼正確；149 筆大存檔點 QR 放大後解碼內容完全一致。
- 既有 `p0_playtest.py`（愛心／蓋塔／升級／慢速答題／重試）、`p0_hero_jobs.py`（三職業攻擊）、`p0b_playtest.py`（圖鑑／家長長按／粒子／缺檔備援）回歸正常。故意把整個 assets/art 回 404 的情境會有預期網路 404，但沒有 JavaScript 錯誤，也能保留安全角色。
- `p0c_playtest.py` 另重跑音檔、TTS 備援、版權、匯入與 QR；輸出 `tests_p0/p0c_regression_v3.json`。
- 詳細輸出：`p0d_v3_result.json`、`validate_character_v3_result.json`、`stress_character_v3_result.json`、各個 `*_regression_v3.json`。

| 檔案（都在 shots_p0/） | 內容 |
|---|---|
| 20_01_dressup_hair.png | 髮型縮圖選單 |
| 20_02_dressup_outfits.png | 12 套服裝縮圖選單 |
| 20_03_A4_B7.png | A4 丸子頭＋B7 尖帽變體 |
| 20_04_A6_B7.png | A6 金髮＋B7 尖帽變體 |
| 20_05_A3_B8.png | A3 紫髮＋B8 貝雷帽 |
| 20_06_B3_sword_shield.png | B3 服裝與原有玩具劍／盾（非握姿） |
| 20_07_headwear_menu.png | 帽子與皇冠／花圈單槽 |
| 20_08_expressions_happy_cheer.png | 母版、happy、cheer 同比例並排 |
| 20_09_battle.png | v3 主角、三塔與表情在戰鬥內 |
| 20_10_album.png | 寶物圖鑑 |
| 20_11_parent.png | 家長頁 |
| 20_12_savecard_hatless.png | 無帽存檔卡，一般 QR 解碼 |
| 20_13_savecard_B7.png | 戴 B7 存檔卡，固定比例 |
| 20_14_large_save_qr.png | 149 筆大存檔的放大 QR |
| 20_15_dressup_colors.png | Lily 髮色色票縮圖 |

### 限制與請 Lily 補的內容
- **實機 iPad Safari 仍未測試**。這次是 headless Chrome 觸控／iPad UA，不是 Safari；GPU 記憶體只列理論值，未量測真機。
- 要等 Lily 交握持 spec 的正式欄位、握拳手臂 id、共用握點／武器 origin、pose／handVariant，以及穿戴／頭髮／服裝排除表，才能讓空的 hook 真正畫出握持。
- 六件寶物的 worn layers 沒交之前維持佔位。沒有其他阻塞本次副本測試的問題，沒有順便把母版 candidate 旗標改成正式。

---

# 第六批：Lily wearables batch 1／v4（2026-11-10，新加坡時間 UTC+8）

## 範圍、來源及旗標
- 只接入 `/workspace/princess-game-p0/` 副本；沒有修改原遊戲、v1 或 Lily 的來源。沒有 commit、push、deploy，也沒有建立線上網址。
- 以 `production_wearables_01/HANDOFF_BATCH01.md` 為準，來源 manifest SHA-256 為 `b261fae74ebefe0955f8f40992cd40d8426fb0f7a987ab8d71a5c3ee7a718a35`；`productionReady=false`、`runtimeUseAllowed=false` 保持原值。
- 新增 `tools/import_character_v4.py`，複製 manifest 參照的 189 層 half WebP、full PNG 備援、256/128 縮圖與 tiara icon 至 `assets/art/princess/v4/`，生成 `data/character_runtime_v4.json`。共 892 檔／39,601,556 bytes；half 圖層總計 3,776,364 bytes，不複製 full WebP，也不讀 work/rejected_prototypes。
- Boot 改讀 v4。只有裝備組合的圖層按需解碼，PNG 仍只在 WebP 不支援／失敗時請求；選單讀 Lily 的縮圖。延續單張 half composite 與最多 8 張的 LRU 快取。

## 握持、頭飾與圖鑑
- 新增武器頁與劍／無箭弓／魔杖單槽、畫面左右手、無武器與雙拳 cheer。預設武器讀 `weaponDefaultsByOutfit`；有武器就讀 `requiresPoseByHand`，不允許張開手握武器。
- pose 同時取代 `body_safe_main`、`arm_front`，並套用該服裝的整組袖口／裙前／overarm 對映；不是在原張開手上疊拳頭。B1 依 v4 safeV4 衣片及握拳袖片，沒有回到舊安全衣例外。
- 共用握點讀 full (344,582)／(651,582)，但武器檔已對齊、offset0，因此直接全畫布疊圖，**不重複加握點位移／旋轉／縮放**。武器 85、拳臂 90、袖／盾 92；維持 drawOrder＋tieRank＋id 第三鍵排序。
- 右手武器與盾互斥：保留當前合法裝備，拒絕新選擇並顯示原因；玩家先自行關盾才能選右手。在右手狀態開盾同樣拒絕。這條文字規格轉成帶來源註記的 runtime `assemblyConstraints`，UI 與 renderer 共用，不綁死盾／武器 id。
- crown、flower_crown、B7、B8 仍共用頭飾單槽。先讀髮對的 hatVariant，再讀 `headwear_asset || headwear.asset || key`；A1 花圈用 compact 版，A6 花圈用無髮帶 B7 髮對，tiara 保留原髮。
- crown 改為低矮公主 tiara；`treasure_crown` 指向本批 `icons/treasure_crown.png` 副本（SHA `b3aa467ae78a50e806bb4745f7db4f0082f9c304fcf3fdd71c9c06769148ae87`）。圖鑑及卡片底列不再顯示舊高金冠。
- 四件未交的項鍊、髮上蝴蝶結、翅膀、星星披風維持 wornLayer:false 佔位。武器 bow 和髮飾 bow 是不同槽，不混用。雙拳 cheer 是原垂臂的握拳版，不宣稱是雙臂高舉新姿勢。

## 存檔、容量與卡片
- 升級 wardrobeVersion 4，改動前完整備份至 `kx_save_v2_before_wardrobe4`；沿用舊 outfit／hair alias 遷移，星星、寶石及練習紀錄不變。舊版明確關閉 toy_sword 的存檔會保留「不拿武器」，而非重新給預設劍。
- weaponId／weaponHand／poseId／配件開關完整壓縮與 round-trip；保留原 v2 外框及舊存檔解析，沒有換成不相容的新格式。匯入仍須確認，覆蓋前保留備份。
- 本次一般存檔 466 字；149 筆完整練習＋v4 右手武器／pose／頭飾／關盾大存檔 2788 字，低於 2950 字上限，無須額外改壓縮器。時間欄位會讓字數有小幅浮動，以測試輸出為準。
- OpenCV：一般卡片直接解碼一致；大碼點開放大後解碼一致，149 筆及角色欄位語義 round-trip 相同。存檔卡沿用完整畫布固定比例、置中貼底，不因帽子／武器的 alpha 範圍改變身體大小。

## 測試、證據與限制
- `tests_p0/validate_character_v4.py`：189 層／378 個圖層雜湊、1101 個相對路徑、full/half 尺寸、來源 manifest 未變、B1 safeV4、四件佔位與旗標全部通過。
- `tests_p0/p0e_v4_playtest.py`：**22 項斷言全通過**；武器三種×左右手、35 組已宣告袖片對映、頭飾條件、盾互斥雙向拒絕、B4 缺件阻擋、舊檔備份、一般／大碼 OpenCV、匯入確認、PNG fallback、60 次組合壓力測試與 JS 錯誤檢查。結果存 `tests_p0/p0e_v4_result.json`。
- 壓力測試快取最高 8 張，60 次換裝後 refs=0、liveDecoded=0、sources=0，沒有 JavaScript／console error。
- 既有 `p0_playtest.py`、`p0_hero_jobs.py`、`p0b_playtest.py`、`p0c_playtest.py` 全重跑完成，輸出各 `*_regression_v4.json`。戰鬥／三職業／圖鑑／家長長按／音檔及匯入正常；故意缺檔情境的 404 網路紀錄屬預期，沒有 JS 例外。
- **實機 iPad Safari 仍未測試**；目前僅 headless Chrome 的 iPad UA／觸控模擬。腕部接縫等放大 polish 限制沿用 Lily 的交接，不視為放大級完稿。

| 檔案（都在 shots_p0/） | 內容 |
|---|---|
| 21_01_sword_screen_left.png／21_02_sword_screen_right.png | 劍左右手 |
| 21_03_bow_screen_left.png／21_04_bow_screen_right.png | 無箭弓左右手 |
| 21_05_wand_screen_left.png／21_06_wand_screen_right.png | 魔杖左右手 |
| 21_07_tiara_A1_A4_A6.png | 三髮型低 tiara |
| 21_08_flower_A1_A4_A6.png | 三髮型花圈與 A1/A6 條件變體 |
| 21_09_fists_both_cheer.png | 雙拳＋預設 cheer |
| 21_10_right_hand_shield_rejected.png | 盾開啟時拒絕右手 |
| 21_11_right_hand_shield_off.png | 自行關盾後右手合法 |
| 21_12_album_new_tiara.png | 圖鑑新版 tiara icon |
| 21_13_savecard_tiara.png | tiara 存檔卡／一般 QR |
| 21_14_large_save_QR.png | 149 筆大存檔放大 QR |

### 規格缺件／請 Lily 確認
- **B4 的右手袖片未交**：source `poses.grip_screen_right.outfitReplacements` 只有 11 套，沒有 B4；assets 也只有 B4 left／fists_both cuff。這與 HANDOFF「12 套左右袖相容」有落差。目前保守阻擋 B4＋右手，即使關盾亦然，其他有效組合可用；沒有猜袖片或疊回張開手。
- 請補 B4 right cuff 和 manifest 對映；若確實可沿用原片，也請明確宣告。建議下批把 slotRules 的互斥文字升級成結構化 exclusion 表。詳細接入說明見 `docs/character_v4_batch01.md`。

---

# 第七批：Lily wearables batch 2／v5（2026-11-10，新加坡時間 UTC+8）

## 範圍與資產
- 只整合到 `/workspace/princess-game-p0/`；原遊戲、v1 及 Lily 來源只讀，沒有 commit／push／deploy／線上網址。manifest 的 productionReady、runtimeUseAllowed 保持 false。
- 新增 `tools/import_character_v5.py`，Boot 讀 `data/character_runtime_v5.json`。依 `HANDOFF_BATCH02.md` 複製 207 個 asset id（206 組唯一圖檔）、256/128縮圖及新版三個 icon，總共1006檔／43,766,315 bytes。half圖層按唯一檔合計3,806,714 bytes。
- 匯入器逐檔驗證SHA、將來源共用路徑去重；full PNG仍是WebP不支援／單檔失敗時的按需備援，不預載整套衣櫃或full WebP，不複製work/rejected prototypes。

## B4右手修正與組裝
- B4右手劍、無箭弓、魔杖已解除阻擋，嚴格讀 `outfit_B4_front_grip_screen_right_cuffV2`。Lily明訂此id alias共用原left cuffV2檔，**不是退回原B4袖片**；ids保留right id，原outfit_B4_front／正常body／張開手均不會混入握姿。
- 延續body+arm_front+outfitReplacements整組取代，武器85、手臂90、袖/盾92；武器全畫布已對齊grip，不重複加位移。右手仍需先自行關盾。
- 新增48格pose×outfit覆蓋檢查：非空replacement與非空明確理由恰擇一。neutral12格理由、三握拳pose36格對映全齊；刪B4右手、刪neutral理由、空白理由、兩者同時宣告四個負例全部拒絕。

## 項鍊、蝴蝶結與UI
- 項鍊68/tieRank0，讀 `exclusiveWithOutfits` 原文原因與9套 `assetsByOutfit`。B5/B6/B8灰化且顯示不適用理由；已戴項鍊切入這三套服裝時保留原合法裝備並拒絕變更，要求先取下，不默默關閉。
- 髮上蝴蝶結100，依6髮型位置與A4+B7/B8兩個專用變體。bow專用位置表與hairPairs.hatVariants分開，不破壞原A1緞帶／A6無髮帶規則，可與tiara、花圈及兩帽共存，也不與武器bow85混用。
- 新增換裝的獨立飾品頁，取Lily實際位置縮圖；未收集鎖定，新存檔項鍊／蝴蝶結預設關閉，兩件不套髮色濾鏡。
- 共用 `Char.wear` 驗證換裝、Home、戰鬥掉寶穿戴入口；拒絕皆顯示原因。中文長理由啟用advanced word wrap，不超出iPad比例畫布。取下飾品可直接操作以修正舊配置。
- 圖鑑及存檔卡改用本批 `treasure_necklace.png`、`treasure_bow.png`，tiara icon沿用新版。翅膀、星星披風繼續wornLayer:false佔位，沒有假裝第三批已完成。

## 存檔與快取
- wardrobeVersion5；第一次轉換前完整備份至 `kx_save_v2_before_wardrobe5`。outfit/hair alias、已穿戴意圖、進度／星星／寶石不變；不強制清掉舊已戴項鍊或bow。
- 舊檔若有B5/B6/B8+項鍊，回傳明確issues與安全neutral預覽／衝突文字，保留原穿戴狀態但禁止Creator確認，需玩家取下或改合法裝備；不是靜默省略圖層。
- 快取key納入issues防止非法配置借用合法neutral的錯誤狀態。只合成當前裝備的一張500×550 texture，LRU最多8張，合成後釋放分層參照。
- 存檔外框／壓縮器不變，沿用equipped id，舊KXZ2/KX2碼仍可讀；匯入維持確認後覆蓋與覆蓋前備份。

## 驗證與截圖
- `tests_p0/validate_character_v5_result.json`：207資產、414層雜湊、1283相對path、所有full/half尺寸、來源SHA未變、flags false、兩件佔位、48格覆蓋與4個負例全部通過。
- `tests_p0/p0f_v5_playtest.py`／`p0f_v5_result.json`：B4三右手武器、9項鍊與3互斥、6+2 bow位置、頭飾共存、三入口拒絕、舊存檔、7200個合法registry組合、B4右手90組、一般／大存檔OpenCV、90次實際合成壓測與PNG fallback。
- 四支既有 `p0_playtest.py`、`p0_hero_jobs.py`、`p0b_playtest.py`、`p0c_playtest.py` 重跑，結果在各 `*_regression_v5.json`；故意缺圖／音檔的網路404屬預期，不是JavaScript例外。

| 截圖（shots_p0/） | 內容 |
|---|---|
| 22_01–22_03 | B4右手劍／無箭弓／魔杖 |
| 22_04–22_12 | 9套允許服裝的實體項鍊 |
| 22_13–22_15 | B5/B6/B8項鍊禁用與理由 |
| 22_16–22_21 | A1–A6髮上蝴蝶結位置 |
| 22_22–22_23 | A4+B7/B8帽的bow專用位置 |
| 22_24–22_25 | A4+tiara／花圈+bow共存 |
| 22_26_album_batch02_icons.png | 新項鍊／bow／tiara圖鑑圖示 |
| 22_27_savecard_batch02.png | 佩戴項鍊、bow、tiara和右手杖的存檔卡 |
| 22_28_large_save_QR.png | 149筆大存檔放大QR |

### 尚需Lily確認／實機限制
- 沒有阻擋本次v5副本接入的缺件。B4右手袖片已由明確alias解決。
- **B4關盾仍可見一段橢圓金邊／透明孔輪廓**，來自來源 `outfit_B4_back`，不是遊戲仍有載入prop_B4_heart_shield。Lily交付的 `batch02_B4_right_grip_normal_and_zoom.png` 也相同；本次不塗改素材，請確認是否要清理殘留盾形輪廓。
- **HANDOFF最多13層的估算需修正**：合法B3/B4左武器+盾+頭飾+兩飾品+表情可達14層（half暫態RGBA約15.4MB，不含composite/GPU副本；快取仍單張約1.1MB）。實測registry最大值14，沒有因此堆載全套素材。
- 實機iPad Safari尚未測；headless Chrome觸控／iPad UA不等於Safari。細鍊／粉髮對比、腕根放大polish限制沿用Lily備註。
- 詳細接入說明：`docs/character_v5_batch02.md`。

### 最終實測結果
- 26項主驗收斷言全過，7200合法registry組合、B4右手90組無違規；另check_v5_edges.py的8項邊界檢查（含實際頭飾切換、中文理由範圍、40次快速refresh）全過。
- 一般完整配飾碼578字：卡片小QR直接解碼=False，放大後=True；149筆大碼2854字，小於2950上限，放大OpenCV解碼一致，角色／穿戴完整還原。
- 小QR格子太密時保留既有「點QR放大」提示／入口；一般完整配飾碼亦可能需要放大，不宣稱236px小卡在所有內容下皆可直接掃。額外截圖22_27b_normal_QR_enlarged.png，總共29張22_*證據。
- 90次實際合成：快取峰值8、結束refs/liveDecoded/sources全0；主驗收JavaScript及console errors均為空，既有回歸亦無JavaScript例外。
- v5來源manifest SHA-256：473cb2ae86236c6574fbf54ea39bd81838c0c274d636292ffbdf286d4365ae37（驗證未改）。

---

# 第八批：Lily wearables batch 3／v6及殘影修補（2026-11-10，新加坡時間 UTC+8）

## 範圍及資產
- 只改 `/workspace/princess-game-p0/` 副本。原遊戲／v1／Lily來源未修改；沒有commit、push、deploy或線上網址。
- `HANDOFF_BATCH03.md`優先。productionReady=false、runtimeUseAllowed=false保持原值，m02母版／表情全畫布對齊規則不變。
- `tools/import_character_v6.py`從來源226筆asset中排除8筆deprecated圖層，產生218筆active的`data/character_runtime_v6.json`。8筆替換關係保留作存檔遷移；不再包／載舊盾影衣片。
- 複製1180檔／46,919,867 bytes，half唯一檔合計3,939,712 bytes至`assets/art/princess/v6/`；保留WebP懶載入、PNG按需備援、256/128縮圖及共用cuff alias去重。新盾的sourceArt屬work生圖溯源，不是runtime資產，從投影移除，沒有複製work原圖。
- 來源manifest SHA-256：`1fa56aa101ddced90e5741b80f1365f743351a8c8fb9f6562c0f5b8f4d619fa2`。靜態驗證218個active id／436層雜湊、1539個相對path及full/half尺寸，來源v5 SHA也保持不變。

## 六件實體穿戴與互斥
- 皇冠、花圈、項鍊、髮上蝴蝶結、翅膀、星星披風六件均wornLayer:true；合法配置沒有穿戴emoji佔位。cat/unicorn原有寵物UI不屬於這六件美術批次。
- wings讀assetsByHairStyle：A2/A3用longhair_flare，其餘petite，drawOrder10，仍在頭髮／身體後方。
- star_cape完整成對讀backAsset18＋frontAssetsByOutfit68/rank1；不能單獨選前扣，不將parts的語意part名稱誤當asset id。
- 翼／披風共用back_equipment單槽，彼此互斥；披風／項鍊互斥，B3–B6與任一新背裝備互斥。項鍊原B5/B6/B8限制保留。
- 互斥讀exclusiveWithOutfits及exclusiveWithTreasures，且雙向檢查：即使necklace自身未重複列cape規則，cape宣告仍能拒絕反向選擇。
- 換裝新增背裝備頁，灰化非法選項並顯示原文理由；換裝、Home、戰鬥掉寶共用驗證。**先驗證完整候選，再處理單槽**，不會為了開披風偷偷關翅膀／項鍊；玩家須先自行取下。移除時只拿掉指定物件，便於修正舊衝突。
- 服裝選單帶裝備互斥標籤，非法服裝切換也拒絕，不改原裝備。頭飾／bow仍可與合法背裝備共存，原帽髮變體與表情70排序不變。

## B3/B4修補與存檔
- outfits.parts、defaultAccessories及poses.outfitReplacements全部取v6原生資料；B4同時使用noShieldGhostV4 back與noShieldArc main，不是只換背片。
- B3四種pose的front取ghostCleanV3，兩個新盾使用manifest canonical id所指completePlateV5，不載早期平塗候選。服裝縮圖優先thumbV6。
- 已目視檢查遊戲實際合成的B4淺／深底放大圖：舊透明橢圓缺口、盾形金框與main殘弧不再出現，未見原白塊殘影。B3保留原奶油色馬甲尾片設計，不把正常白衣料當殘影整片刪掉。腕根色差等原candidate polish限制仍適用。
- wardrobeVersion6，首次遷移前完整備份`kx_save_v2_before_wardrobe6`。舊accessoriesOff透過B3B4GhostAmendment.replacements改成新canonical盾id，舊存檔關盾不會因換id而突然重開。
- 舊v5若同時穿翼／披風佔位，不在遷移時按單槽悄悄丟掉一件：保留兩者、進度及星寶，解析器明確回issues、UI禁止確認，讓玩家自行修正。
- Save格式仍v2/KXZ2，舊碼可讀，沒有更換壓縮格式；匯入仍確認後覆蓋及覆蓋前備份。

## 14層與快取預算
- loadEstimate/ decodeMemory讀入runtime，maxLayers=14；新增liveDecodedBytes/peakDecodedBytes/peakLayers邏輯計數。
- half每層500×550×4=1,100,000 bytes，14層15,400,000 bytes；PNG備援full14層61,600,000 bytes。單張half composite再加1.1MB，8張LRU約8.8MB RGBA。
- 這是影像尺寸計算與引用生命週期統計，不是實機heap/GPU量測。瀏覽器GC、WebGL副本、POT對齊及UI縮圖額外記憶體另計；若補到512×1024，來源列的14層約29.36MB情境仍須計入真機預算。
- 只按裝備組合解碼，合成後釋放分層參照；不預載全部218圖層。14層例採B3左手劍＋盾＋tiara＋happy＋necklace＋bow，不非法硬加翼／披風。

## 自動驗收及截圖
- `validate_character_v6.py`：active圖檔／相對path／SHA、六件實體、48格pose×衣、4個負例、canonical修補、thumbV6及14層預算。
- `p0h_v6_playtest.py`：8套翼、8套成對披風、長髮變體、4種雙向互斥、B3–B6禁用、三穿戴入口、舊檔／關盾遷移、修補圖、14層實際合成、43,200組合法／非法解析、96次換裝壓測、PNG備援、普通／149筆大碼OpenCV與確認覆蓋。
- 另重跑四支既有gameplay/jobs/album-parent-fallback/audio-import-QR回歸，輸出各`*_regression_v6.json`。缺圖／音檔的刻意404情境和正常流程分開看，不把預期404說成JS例外。
- `shots_p0/23_01`–`23_19`，加17b/18b放大QR，共21張：翼／披風8套總覽、A2/A3、4種互斥、4套禁用、B4雙底放大、B3四pose、14層、圖鑑、兩張存檔卡及大QR。

## WebKit／iPad狀態（未宣稱通過）
- 官方Playwright WebKit27.2/build2370瀏覽器下載成功，沒有移除其他瀏覽器。
- `playwright install --with-deps --no-remove webkit`的系統依賴步驟被Debian套件庫HTTP500阻擋；未停用簽章檢查或改走不安全套件來源。
- browser-only官方安裝成功後仍嘗試launch，因缺libevent-2.1、libgstgl、libgstcodecparsers、libavif16、libmanette及libenchant而失敗，尚未建立iPad觸控context、未跑到遊戲頁。因此**沒有WebKit遊戲功能通過的證據**。
- 擬用1180×820、has_touch、is_mobile、DPR2參數；失敗詳`tests_p0/webkit_v6_result.json`及兩個install log。Chrome的iPad viewport/touch測試不是Safari；實機iPad仍需驗收。

### 最終驗收數據
- 主驗收26項斷言全過；43,200候選中26,400合法、16,800非法，全數按規則處理，沒有錯誤接受／漏畫，最大14層。
- 14層fresh-page只請求14張裝備層，half壓縮payload 209,112 bytes；邏輯peakDecoded=14、peakDecodedBytes=15,400,000，合成後liveDecodedBytes=0，單張composite快取。
- 96次換裝實際產生96張composite，LRU峰值8張，結束refs/sources/liveDecoded/liveDecodedBytes均0；PNG備援涵蓋新翼、成對披風及B4修補片。
- 翼／披風普通卡分別516／516字，OpenCV放大解碼一致；149筆含新canonical關盾id的大碼2819字，低於2950，放大解碼／角色與穿戴round-trip／確認覆蓋前備份全部正確。
- 主流程JS與console errors均空；四支既有回歸均完成且無JS例外，刻意404案例仍安全降級。
- 21張23_*截圖已目視檢查；WebKit狀態仍是「binary已下載、系統依賴不足導致launch失敗」，沒有冒稱Safari驗收。

- 補驗：兩張普通卡516字的小QR也直接從完整截圖經OpenCV解碼成功，且與各自放大QR逐字相同；結果見`tests_p0/qr_inline_v6_result.json`。

---

# 第九批：Lily POLISH01／v7（2026-11-10，新加坡時間 UTC+8）

## 來源差異與接入
- 只修改 P0 副本。未改原遊戲、v1 或 Lily 源檔，未 commit／push／deploy，未建立可供 iPad 連線的測試網址。兩個 readiness 旗標仍 false。
- v6 的 226 筆 asset 紀錄完全不變；v7 **新增 69 筆替換 ID**（body 4、arm_front 4、outfit_front 42、outfit_overarm 19），不是覆寫舊筆。排除替換鏈上的 77 個舊 ID，runtime 仍 218 active。
- masterId、母版 SHA、1000×1100 畫布、anchors、握點、drawOrder／tieRank、帽髮變體、表情與互斥逐欄一致；把核准 ID 對照套用到 v6 後，requiredAlways／outfits／poses 與 v7 完全相同。無規格阻擋差異。
- 1,974 個來源引用檔案存在，雜湊與標示大小一致；全部圖層 full PNG／WebP 1000×1100、runtime_50 WebP 500×550；新層縮圖 256×256／128×128。69 層逐像素比對：兩個核准腕口矩形外 **0 個 RGBA 改變像素**，臉／安全衣未動。
- 小型 metadata 差異：B4 右袖新紀錄的 aliasOf／reuseNote 沿用舊 ID。組裝實際已引用 v7；匯入器僅將 runtime aliasOf 沿核准 replacement 鏈正規化，新左右袖 SHA 相同，**不修改來源**。整角選單縮圖沿 v6 是交接明訂，非漏接。
- `tools/import_character_v7.py`／`data/character_runtime_v7.json`／`assets/art/princess/v7/`：1,458 檔、48,647,564 bytes，half 唯一檔合計 3,973,826 bytes；full PNG 只在 WebP 不支援或失敗時載入，不另外包 full WebP。
- WebP 偵測改從 requiredAlways 的 body 取得，不再硬編已淘汰 body_safe_main。啟動改 v7 manifest，cache key cc7、wardrobeVersion 7，首次升級前完整備份 `kx_save_v2_before_wardrobe7`；存檔碼格式 KXZ2 不變。

## 大小與記憶體
- 交接列 half 每角色 min／median／max = 127,164／203,718／277,800 bytes；full WebP = 314,398／531,372／759,718 bytes（full WebP 僅來源稽核，不打包）。這是來源全組合統計，本次重算 14 層代表 payload 並驗證所有單檔大小，未冒稱重跑其 1,296,000 全組合像素檢查。
- 14 層代表實際 half payload 208,058 bytes（v6 為 209,112）；解碼仍 15.4MB half／61.6MB full PNG；一張 composite 1.1MB、8 張 LRU 約 8.8MB。這是 RGBA 尺寸／生命週期估算，不是 iPad heap／GPU 實測。

## 測試與證據
- 原版通用測試以相同程式重新執行，僅將截圖輸出隔離到 `tests_p0/regression_v7_shots/`；先前 18–23 圖不覆蓋。v3–v6 專屬快照／佔位假設留作歷史；由 v7 同版驗收涵蓋 acceptance、組合解析、壓力與回歸，不將過時斷言冒稱已適用。
- 主驗收 `tests_p0/p0i_v7_playtest.py`；靜態 `validate_character_v7.py`；只讀差異 `audit_character_v7.py`。完整執行結果另見本節最終數據。
- Playwright WebKit 僅快速重試啟動一次：仍缺 libevent／GStreamer／avif／manette／enchant 系統依賴，未進遊戲；不再花時間安裝。改用 Chromium 1180×820、DPR2、iPad UA、touch／is_mobile。**真 iPad Safari 尚未測**。
- 實機步驟：`docs/ipad_safari_test_checklist.md`；Raymond 先批准可連線入口是先決條件，本次不建立／分享入口。

## 24_* 截圖（★建議優先展示）
- ★ `shots_p0/24_01_warrior_B3_poses.png` — 戰士一般／雙拳／左右劍
- `shots_p0/24_02_archer_B5_poses.png` — 弓箭手一般／雙拳／左右弓
- `shots_p0/24_03_magician_B7_poses.png` — 魔法師一般／雙拳／左右魔杖
- ★ `shots_p0/24_04_max14_loadout.png` — 合法 14 層全裝備
- `shots_p0/24_05_B4_clean_zoom.png` — B4 關盾乾淨背片與袖口放大
- `shots_p0/24_06_savecard_polish01.png` — 全畫布比例存檔卡
- `shots_p0/24_06b_QR_enlarged.png` — 普通卡放大 QR
- `shots_p0/24_07_album.png` — 全寶物圖鑑
- `shots_p0/24_08_large_save_QR.png` — 149 筆大存檔放大 QR
- `shots_p0/24_09_wings_QR_enlarged.png` — 另一普通配裝放大 QR
- ★ `shots_p0/24_10_before_after_layers.png` — 舊 v6／新 v7 拳腕與 B5 袖口簡短對照

## 最終實測數據
- v7 主驗收 **27/27** 斷言通過；43,200 候選（26,400 合法／16,800 非法）解析 0 錯誤，最大 14 層；三職業各四姿勢只有一個 body、一個 arm_front，沿 manifest 換片。
- 96 次實際換裝／96 張合成，LRU 峰值 8；結束 refs／sources／liveDecoded／liveDecodedBytes 全 0。fresh-page 的 14 層只請求 14 張，208,058 bytes，peakDecodedBytes=15,400,000；合成後來源解碼引用歸零，記憶體／快取估算不變。
- 普通翼／披風卡 **525／527 字**，149 筆大碼 **2827/2950 字**；三者 OpenCV 放大解碼與輸出逐字相同，角色／裝備往返及確認前不覆蓋、覆蓋前備份均通過。普通 527 字小 QR 直接解碼失敗，既有「點 QR 放大」支援路徑成功，沒有宣稱所有小 QR 皆可直掃。
- 四支既有通用回歸完成，9 組摘要斷言通過；另換裝 8 項邊界（含 40 次快速 refresh）通過。正常主流程 JS／console errors 均 0；故意擋音檔／圖檔的 404 已單獨核對，沒有 JS 例外。
- 11 張 24_* 證據完成：已目視三職業、14 層、B4 放大、圖鑑、存檔卡與簡短前後對照；B4 無舊盾形白塊／殘弧。來源像素僅核准區域改動，無新增美術修改需求。
- 結果：`tests_p0/p0i_v7_result.json`、`regression_summary_v7.json`、`audit_character_v7_result.json`、`qr_inline_v7_result.json`、`webkit_v7_result.json`。WebKit 仍是環境依賴阻擋，未宣稱 Safari 已測；實機待核准入口後照清單驗收。

### 第九批補圖：25_*
- 17張補充證據：11張禁用／理由UI、4種寶物配裝、實際戰鬥與家長頁。四項穿戴規則全PASS，JS／console錯誤0；劍／弓／杖左右手已由24_01–03明確涵蓋。
- 路徑及規則表：`docs/v7_extra_evidence_25.md`；只新增測試與證據，未改遊戲程式／來源美術，無commit／push／deploy。

## 已核准上線：P0／v7
- 2026-11-10（新加坡時間 UTC+8）收到「確定上線」核准，目標 main／https://raymond-shen.github.io/princess-game/。不修改 Lily productionReady=false／runtimeUseAllowed=false。
- 提交前重新跑完目前適用的 tests_p0：來源／runtime驗證、27項驗收、43,200組解析、96次換裝、17張補圖及四支通用回歸／8項邊界，全數通過；正常流程無JS錯誤，刻意404備援案例另列。
- 僅封裝目前runtime引用資產、PNG備援、圖示、MOE原音及授權說明；不包含shots_p0、tests_p0產物、node_modules、舊v3–v6資產快照或scratch。實機iPad Safari仍待清單驗收，不以Chromium模擬冒充。


---

# 第十批：Lily POLISH02／v8・B3 腰裙白霧修正（2026-11-11，新加坡時間 UTC+8）

## 精確差異與副本接入
- 只處理 `/workspace/princess-game-p0/`；未修改原遊戲、v1 或 Lily 源檔。v7 的 295 筆來源紀錄完全不變，v8 僅新增 **5 個替換 ID**：B3 四個姿勢前片＋共用背片；300 筆歷史來源投影成 218 個 active，82 個 deprecated 不打包／不畫。
- masterId／母版 SHA、1000×1100 畫布、offset、anchors、握點、drawOrder／tieRank、帽髮、武器／姿勢／互斥及 readiness 逐欄一致。套用五筆對照後 requiredAlways／outfits／poses 精確相同；其餘 **213 筆 runtime active 紀錄連部署路徑也完全相同**。沒有規格差異。
- 1,981 個唯一 SHA 路徑（2,344 次帶 SHA 引用）以及其餘交接／來源引用，共 2,023 個唯一來源檔案存在；SHA／標示大小／尺寸核對通過。master/full PNG/full WebP 1000×1100，runtime_50 WebP 500×550，縮圖 256／128 齊全。
- 五層 full PNG 改變 68,607 個 RGBA 像素（背片 1,979、四前片各 16,657）；核准矩形 `[505,474,627,753]` 外 0。沒有改 B4 或其他服裝；歷史整角選單縮圖沿用交接指定版本，新層縮圖已拷入。
- `tools/import_character_v8.py` 增量匯入：**30 新檔／729,210 bytes**（5 half WebP、5 full PNG 備援、20 張分層縮圖），沿用原有 1,432 檔，不複製 full WebP。新 `data/character_runtime_v8.json`、啟動入口 v8、cache key cc8；舊 v7 檔保留供已快取舊入口相容。
- 純美術替換不改存檔 schema／裝備 ID，wardrobeVersion **仍 7**，既有舊檔備份／遷移與 KXZ2 保持；productionReady=false／runtimeUseAllowed=false 保持。

## 像素與畫面證據
- 以當時真正線上 d402dc3/v7（核對 manifest SHA）作 before，不拿 Lily 預覽假充線上。B3 一般、雙拳、劍／弓／杖各左右、原生背披風、合法 14 層寶物共 **10 情境**：已知皮帶白霧檢查全部 **313→0 px**，實際 Chromium 半尺寸畫面亦目視確認。
- 非 B3 全 11 套 × 四姿勢：實際遊戲 WebP 與 PNG fallback 88 組 500×550 逐像素對比，加 44 組 full PNG 1000×1100 對比，**132 組／0 改變像素**。其餘組合由相同組裝規則、順序、位移與逐位相同來源紀錄作分解證明；未冒稱執行百萬張像素渲染。
- `shots_p0/27_01`–`27_10` 各有原比例 before/after 與 `z` 腰裙 3×，另 `27_11_B3_star_cape_still_blocked.png`，共 **21 張**。B3 自帶背片可見於 27_09；穿戴星星披風仍與 B3 互斥，沒有為拍照放寬規則／偽造非法配裝。
- ★ `shots_p0/27_01z_B3_neutral_waist_zoom.png`
- ★ `shots_p0/27_03_B3_sword_left_before_after.png`
- ★ `shots_p0/27_10_B3_treasures_max14_before_after.png`

## 測試、記憶體與發佈停止線
- `tests_p0/v8_preflight.py`：來源與 runtime 驗證、主驗收 **27/27**、補充穿戴 UI、43,200 組（26,400 合法／16,800 非法）與 96 次實際換裝均通過。LRU 峰值 8，結束 refs／sources／liveDecodedBytes 全 0；14 層 half payload 208,980 bytes，比 v7 多 922 bytes，解碼估算仍 15.4MB／PNG full 61.6MB、8 張 composite 8.8MB。
- 普通翼／披風卡 514／519 字、149 筆大碼 **2825/2950**；OpenCV 放大解碼逐字相符，角色／配裝 round-trip、確認後覆蓋及覆蓋前備份通過。正常流程 JS／console errors 0；刻意缺圖／缺音檔 404 安全降級另列。
- **整體 release gate 尚未通過：通用回歸摘要 8/9。** `three_job_attacks` 的固定時間截圖恰取到 magician `heroBusy=true`（2 次攻擊、敵血已降、JS 錯誤 0）；其他職業 false。看起來是攻擊中取樣的脆弱斷言，但未擅自忽略／放寬，也未把它宣稱為通過。原始失敗證據保留在 `p0_hero_jobs_regression_v8.json`／`regression_summary_v8.json`／`v8_preflight_result.json`。
- 依「任何檢查失敗就不要 push」停止：**未 commit、未 push、未部署**。只讀 fetch 確認 origin/main 與 HEAD 均仍 d402dc3c86dc2ed9e23ca41f1823a761392bc10c；push URL 維持 no_push，Pages 原版仍 built。沒有 28_live_*，也沒有假稱線上 v8 已驗收；`tests_p0/v8_live_verify.py` 僅備妥，未執行。
- Chromium iPad 1180×820／DPR2／touch／mobile 是模擬，非真 iPad Safari。未重新折騰既有缺系統依賴的 WebKit。Lily 已註記的 B3 胸甲上緣、B4 中縫與 B8 袖邊未擅自擴修。


### 第十批追記：快照時序診斷與測試修正（2026-11-11，新加坡時間 UTC+8）
- 另建 ignored `tests_p0/baseline_d402dc3/` detached worktree，基準與 v8 各跑原始固定時間快照 **5 次**，未 stash／改動待發佈副本。兩版皆 0/5 原快照通過：主要取到正常戰士近身動作；magician busy 樣本 v8 1/5、基準 2/5。兩版 30 個職業樣本皆已攻擊／造成傷害、皆自然回 idle，JS 錯誤 0；battle.js 逐位相同。因此是 harness 對「任意時間必須閒置」的錯誤時序假設，不是 v8 美術的專屬回歸。
- 只修 `tests_p0/p0_hero_jobs.py`：保留原攻擊／傷害斷言，改為等 `heroBusy=false`，在同一個 JS callback 原子捕獲 idle 快照；最長 8 秒，真正卡 busy 仍會失敗。未更動任何遊戲邏輯，也未靠忽略 busy 或反覆重跑碰運氣。原始 10 次結果、首次失敗 gate 與 before/after patch 均留在 ignored 測試目錄。
- 原始診斷：`tests_p0/v8_flake_diagnosis.json`；harness patch：`tests_p0/v8_hero_harness_change.patch`。完整 v8 suite 重新執行，最終結果以下續記；測試與截圖產物不納入發佈。

- 修正 harness 後完整 suite 重跑成功：**回歸 9/9、主驗收 27/27**，43,200 組解析、96 次換裝、17 張補充穿戴 UI、PNG 備援及來源／runtime 稽核均 PASS；正常流程 JS／console errors 0。大碼 2823/2950 字、兩張普通卡 534／528 字，OpenCV 放大解碼均逐字相同。
- 診斷前後 34 個遊戲／runtime／匯入工具路徑 SHA 全相同（只另加本紀錄、修 ignored 測試 harness）。原始首次失敗紀錄仍保留 `_before_idle_fix.json`，未刪除／粉飾。


---

# 第十一批：聲音啟動／柔和音樂音效／四類題意＋Lily ui_v002（2026-11-11，新加坡時間 UTC+8）

## 診斷與修正
- 確認原版**沒有 BGM**，有少量合成 SFX 但沒有覆蓋所有按鍵；自訂 AudioContext 與 Phaser 分開，resume 未等結果就 unlocked=true、空白 speech priming、無 HTMLAudio priming／真實 context 狀態與手勢恢復。這些是程式端明確缺陷，不把 Chromium 無法重現的「Raymond 真 iPad 全靜音」硬說已證實是哪個裝置設定。
- 公開線上 d7d14e2 只讀檢測：39 MOE 路徑均 **HTTP GET 200、audio/wav、RIFF/WAVE**；mute=false／volume=1。Chromium 實際觸控開始後兩個舊 context 皆 running，因此不是已查到的 404/MIME／程式 mute；Safari 手勢／中斷／靜音與輸出路由仍待真機確認。
- 新原生「點我開始冒險」於同一次手勢同步解鎖 Phaser、共用 AudioContext、非空白靜音 speechSynthesis 與 silent HTMLAudio；狀態真 running 才標成功。手勢後循環柔和 16 秒 BGM，念題時降音量；切背景暫停、再點恢復。**未點一下的強制開站自動出聲不符合 Safari 政策**，沒有嘗試繞過。
- 增補所有 Phaser 互動物件／原生按鈕 tap，以及實際答對／錯、攻擊、命中、得寶物 SFX。右上角設定有獨立音樂／音效開關、持久化、語音測試與恢復；關 SFX 不會關教學語音。
- 四類題型 hear／pic2spell／spell2pic／drag 均有明確大字指令，依序自動「指令＋詞語」，108×90 重聽熱區；原本 spell2pic 完全未自動念題已補。拖曳保留並支援點聲調，取消／換題／離開戰鬥會取消過時語音。完整 before/after 題型表與診斷：`docs/audio_question_audit_b11.md`。

## Lily 正式 UI 與小體積音訊
- 18 張 `ui_v002_start_audio` runtime 圖 SHA 同源，複製共 **1,814,841 bytes**；沒有碰源檔。接上城堡天空、v8 公主、標題、normal/pressed 無字開始圖；開始鈕 **(670,500)、600×180**，不疊雙重文字，提醒卡移右下不遮裙腳。
- 四類真題卡均有 **240×150** 提示圖＋「怎麼玩（示意）」標籤，speaker normal/pressed／三幀 playing、音樂音符／SFX 鈴鐺 on/off 已接入。`data/ui_audio_v002.json` 可替換 hint 檔與排版；已換 Lily hints_v2：單格單聲調、一聲單橫槓、drag 同時示範拖或點、pic2spell 手指不出框；保留完整文字指令，未擅改原圖。
- 新音樂／SFX 原創 WebAudio 合成，CC0 1.0，無第三方歌曲／錄音；**唯一新增音訊檔 silence.wav＝1,644 bytes**，BGM/SFX 不下載音檔，低於新增音訊 2MB 預算。16 秒 buffer 1,411,200 bytes RAM、重複使用；原有39 MOE WAV **27,947,818 bytes** 保持原檔及 CC BY-ND 3.0 TW，並非宣稱整個既有音庫也 <2MB。授權：`LICENSES/audio_generated_CC0.md`。
- 學習詞共82＝39 MOE＋**43 TTS-only**；MOE 失敗可重試，不永久快取 null。角色美術／互斥／存檔 schema／readiness flags 不變。

## 測試與證據
- 新測試用真正 WebAudio／HTMLAudio、實際非零 PCM、原生 touch start、真正拖曳與答對／錯／攻擊／命中／得寶物事件；只 mock 桌面不可靠的 speechSynthesis，以驗證四類指令先於詞語、43 個 TTS-only 請求、取消、開關保存及18張 UI實際接線；不假稱桌面已真人聽驗中文。
- 首輪回歸8/9：castle-arrival fixture 使用可能被其他攻擊打死的怪物，再固定等500ms，觀察到 hearts 5→5，但後續失敗／重試與所有遊戲斷言正常；保留原始失敗證據。**只修測試**：受測怪物給足血防競態，仍由真 update/reachCastle 扣心，等待實際 hearts 下降（最多5秒），不改遊戲扣心邏輯，也不放寬扣心斷言。最終結果以下續記。
- `shots_p0/29_01_start_audio_gate.png`；`29_02_question_hear.png`；`29_03_question_pic2spell.png`；`29_04_question_spell2pic.png`；`29_05_question_drag.png`；`29_06_audio_settings_on.png`；`29_07_audio_settings_off.png`。
- **只改副本，未 commit／push／deploy，push URL no_push**。真 iPad 仍須確認可聽音量、中文系統聲音／43詞、四類自動念題與重聽、切背景／鎖屏恢復、觸控與轉向；公開 live 未更動。

- 第二輪 8/9 的 `three_job_attacks` 是另一個原有 fixture 競態：戰士 attacks=0／HP均60、無JS錯誤；幾何核對舊位置距主角 **353／323／293px**，全部超過戰士200px射程，固定4秒不足保證走進範圍。只修 harness：等角色真正載入、三靶擺在合法射程內並停止移動，等待實際自動攻擊造成傷害且回 idle 再原子快照（8秒逾時）；仍保留 attacks>0、扣血、idle與JS斷言，不改職業／射程／傷害遊戲碼。兩輪失敗原始資料均另存，沒有靠多跑碰運氣。

### 第十一批最終 gate：PASS（2026-11-11 01:27 SGT）
- 完整 `tests_p0/b11_preflight.py` **11支 runner全部 exit 0**；通用回歸 **9/9**、主驗收 **27/27**、新音訊/UI **15/15**、43,200組解析、96次換裝、8項邊界、缺圖/缺音負向案例與PNG備援全通過。正常流程 pageerror/console.error **0**；刻意404案例按預期降級，沒有JS例外。
- 嚴格 `document-user-activation-required`：開始前 Phaser context **suspended**，原生點擊後共用 context **running**、HTMLAudio play成功、speech priming在手勢內、循環BGM analyser RMS **0.004255** 非零；四類指令先於詞、43個TTS-only詞皆有請求；實際觸控拖曳、五類戰鬥回饋、偏好重載保存、縱橫轉向600×180開始熱區對齊皆通過。
- 普通翼/披風卡 **521/522字**、149筆大碼 **2825/2950**；OpenCV放大解碼逐字相同，角色/配裝round-trip、確認才匯入與備份通過。角色LRU峰值 **8**、14層峰值解碼 **15.4MB**，結束refs/sources/liveDecodedBytes **0**；角色預算不變，BGM另加1.4112MB可重用buffer。
- 39原始MOE WAV **39/39 真瀏覽器解碼成功**。格式均mono/16-bit PCM/22,000Hz；另查13檔既有RIFF長度欄不符，Chrome容忍，**Safari兼容風險未經真機證實**；未修改/轉檔原音，詳稽核文。真機請特別驗鵝/送/拔/跑/忙/飛/教/追/去/快/敲/滾/變及43 TTS詞。
- Lily hints_v2四檔已取代v1、18張runtime UI逐檔符合更新後SHA清單；本次共 **8張29_*實拍**（加縱向29_08），四類均可見v2圖示與重聽。最佳三張：`29_01_start_audio_gate.png`、`29_05_question_drag.png`、`29_06_audio_settings_on.png`。
- 最終HEAD仍 `d7d14e224eef4232a13bd659493c8555faad0ed6`，push URL `no_push`；未stage/commit/push/deploy、未改live或任何源美術，角色readiness仍false。


### 第十一批追加：核准修正MOE WAV標頭＋Lily聲調按鈕（2026-11-11，新加坡時間 UTC+8）
- 副本13個MOE WAV先備份／拷入新inode，**僅修offset4–7的RIFF總長**；data size／fmt size原本正確、沒有其他chunk。全數保持原始mono／16-bit／22,000Hz、檔長及PCM bytes，**13/13 PCM SHA256相同、重編碼0**。其餘27個runtime音訊完全不變；官方來源／下載檔未動。`moe.sha256`仍是來源hash，另加修復後runtime與PCM hash，來源頁與授權備註據實說明。
- 全副本**92 WAV**逐檔strict chunk/frame解析＋Python wave＋ffprobe -v error＋ffmpeg全解碼；**runtime40/40合規，無其他異常**。52個ignored歷史／原始備份保持原狀（其中26個已知原始壞頭刻意留存，不由遊戲載入），沒有其他異常。
- hear與drag都取消多畫的一條手勢線；接上Lily兩套 **24張@2x normal/pressed/selected**，SHA完全同源。drag136×136畫布／120×120鈕身，hear176×166畫布／160×150鈕身，原中心與hitbox不變；觸下pressed、有效放開／拖放後selected。檔案與display由ui_audio_v002.json宣告，未來可換圖；缺圖仍只有一個大聲調。
- 重拍29_02、29_05，新增29_09–12觸下／選取證據。逐檔PCM完整hash與實際檔名、工具、嚴格掃描範圍：`docs/audio_wav_header_repair_b11.md`；機器證據：`tests_p0/b11_wav_header_repair_result.json`，原始備份留在ignored tests_p0，不納入發布。
- 本次無commit／push／deploy，no_push不變；完整音訊/UI＋regression重跑結果以下續記。

### WAV／正式聲調圖最終驗收：PASS（2026-11-11 01:43 SGT）
- 全套 **14支 runner 全 exit 0**：音訊/UI **17/17**、聲調normal/pressed/selected真觸控與尺寸 **3/3**、通用回歸 **9/9**、角色驗收 **27/27**；43,200組解析、96次壓測、149筆大碼 **2829/2950** 並OpenCV逐字解碼、PNG/缺圖/缺音備援與備份還原全PASS。正常流程pageerror/console.error **0**。
- 修復後MOE **39/39瀏覽器解碼成功**；全副本92 WAV重掃，runtime **40/40** 完整chunk/PCM/ffprobe/full-decode合規；13份原檔備份SHA不變，13份runtime PCM hash全部相同，只改RIFF 4-byte欄位共52 bytes，無重編碼、無其他runtime異常。
- 所有42張UI runtime圖（含24張tone @2x）逐檔同Lily來源SHA；圖身/觸控範圍不變且保留完整透明邊，已重看29_02／29_05與29_09–12，單一調號、按下及選取框清楚。真iPad Safari仍待實際聽驗；此批未部署，live未變。


### 第十一批追加：題圖逐詞／音節／題型稽核與正確對應：PASS（2026-11-11 02:03 SGT）
- 根因不是圖片索引錯：舊vocab直接拿章節聯想emoji當主圖／選項，沒有語義審核與word owner gate。「五隻 ㄨˇ ㄓ」被配成單一🦢，語音實際要求TTS「五隻」，不是天鵝音檔；「鵝」的SWAN物種不精確也不放行。
- 全**82詞／149目標音節×4型＝596組**稽核：**22詞圖義可用、20明確錯配、40裝飾代理**（原pic空值0，但**60詞沒有可用圖**）。新question_pictures_b11.json只放行核對且wordId相等的22詞emoji。其餘hear／drag不顯示圖，改大字詞語／注音；無圖詞不進pic2spell／spell2pic。修後錯圖／裝飾主圖均0，**386組可出、210組無圖圖題排除**；149個Leitner ID與舊存檔全部保留。
- 主圖owner必須等於題目word.id；選圖每個選項必須等於其represented word ID、正解再等於主詞。干擾圖亦須通過審核且glyph互異。缺目錄／偽造錯owner皆fail-closed退hear，不會回退舊pic。家長錯詞列也移除不符符號；Lily提示圖保留明確「怎麼玩（示意）」標籤。
- 語音**39/39**獨立對照原下載MOE字典xlsx的詞號、詞名與完整注音（含多音字），檔案來源／修復後SHA及播放範圍一致；**43 TTS**逐詞呼叫文字一致。未改音檔、PCM或start/end。另本機無正解提示ASR檢查39切片，17音近相符、22短片／同音字仍不確定，已逐詞標人工聽驗；**不把能解碼／來源標籤當真人發音驗證**，43詞裝置TTS仍須真iPad聽驗。
- 文檔：`docs/question_picture_audit_b11.md`；596列完整矩陣`docs/question_picture_audit_b11_items.csv`；39條官方音檔詞號／注音證據`docs/question_audio_identity_b11.json`。Lily補圖清單**60詞**：`docs/question_picture_art_needed_b11.csv`（UTF-8 BOM、讀回驗證），依可出題音節×原4型的**題庫靜態頻次**降序，不偽稱Raymond真實遊玩頻率；優先補pic2spell／spell2pic，圖完成後也可用hear／drag。
- 完整`b11_preflight.py` **15支runner全部exit0**，回歸**9/9**、角色驗收**27/27**、音訊/UI**17/17**、聲調真觸控**3/3**；新增圖片／路由測試先7/7，補入獨立官方詞號驗證後再跑**8/8**。逐一實際建596種題目，核對**264個圖物件**owner／glyph、420個無圖防守排版與各關選題池；正常JS／console錯誤**0**。43,200組解析、96換裝壓測、PNG／缺圖／缺音備援全部PASS；149筆大碼**2816/2950**、OpenCV放大解碼逐字相符。角色LRU峰8、14層15.4MB解碼峰值不變，結束refs／sources／liveDecodedBytes皆0。
- 四型真題重拍：`shots_p0/29_02_question_hear.png`（五隻第1音、無天鵝）、`29_03_question_pic2spell.png`（貓咪）、`29_04_question_spell2pic.png`（青蛙）、`29_05_question_drag.png`（五隻第2音、無天鵝）；29_09–12按下／選取亦重拍並目視檢查。大詞、目標框、正確圖、提示圖及重聽鍵都清楚。
- 僅副本；**無stage／commit／push／deploy**，HEAD仍d7d14e224eef4232a13bd659493c8555faad0ed6、push URL no_push。原始美術／下載檔未改，live未變，readiness flags不變。模型／轉寫／測試與截圖皆ignored artifacts，不納入遊戲runtime。


---

# 第十二批：Lily第一批8張題圖＋固定圖片詞號／WebP–PNG載入（2026-11-11 08:07 SGT）

## 匯入、內容與映射
- 基線為已核准上線的`4796fcbb22e16d355dcf1a645c2040dd4a9b6d5c`，本批只改副本。讀Lily HANDOFF與manifest後，**32/32檔來源SHA256、bytes、兩尺寸、16對PNG/WebP解碼像素一致**才複製至`assets/art/questions/{640x400,320x200}/word_<word_id>.{webp,png}`。沒有copy src、rejected、工作JPEG或總覽；來源未改，productionReady／runtimeUseAllowed仍false。
- 正式檔共4,678,984 bytes（WebP 1,998,026、PNG 2,680,958）；`tools/import_question_pictures_b12.py`可重現核對／匯入，runtime manifest用相對路徑。保留中文word.id與149個Leitner／存檔ID不變，另以`data/question_word_ids_b12.json`固定82詞雙向圖片ID，絕不按CSV排序重編。
- 8詞逐一對圖：0039上上下下、0040高高低低、0035手拉手、0037好朋友、0007翹翹板、0028五隻、0029泡澡、0032築巢。**五隻逐隻數過，正好5隻黃色幼鳥／小鴨，沒有第6隻**；嘴型偏鴨與HANDOFF相同，詞語本身未限定鵝，未擅改。高低花朵確為交錯、翹翹板不是溜滑梯、浴缸用小熊安全版，未發現其他內容不符。

## 載入、題庫與CSV
- 新`js/question-pictures.js`依實際canvas CSS縮放×DPR×顯示大小選320/640，WebP解碼失敗自動同名PNG；低DPR只需320，DPR2大圖／選圖用640、小主圖可用320。共用texture最多16張、10,240,000 bytes（9.77MiB），與角色LRU分開；旋轉後新題按需求補較高解析度。
- 8詞恢復pic2spell／spell2pic；可用圖由22→**30詞**、圖題目標音節44→**67**，仍完整保留全部149目標。596種詞音節×4型組合中**432可出、164無圖圖型排除**。主圖與各選項同時核對中文owner、固定數字pictureId；圖失敗／映射錯位不會借別詞圖或退舊emoji，安全改hear／drag的大字詞語。
- CSV生成器讀固定映射，保留首欄word_id；未分配ID時先拒絕，不可覆寫半份CSV或重新編號。B11原交接60列／原欄內容／排序不刪改，本批8詞完成狀態見B12manifest，剩52詞待圖；ignored fixture實際重跑生成器，60個ID、列／欄內容完全一致。CSV僅統一LF行尾，UTF-8 BOM保留。

## 完整驗收：PASS
- `tests_p0/b12_preflight.py` **16支runner全exit0**；通用回歸**9/9**、角色**27/27**、音訊/UI**17/17**、正式聲調觸控**3/3**、原圖片／路由**8/8**，新增B12圖片載入／CSV／DPR／fallback **11/11**。正常與新負向解碼場景JS／console錯誤**0**。
- 實際建出全部596組，核對**402個圖物件**的owner／圖號／內容來源；8張新圖在真遊戲題卡實拍。強制PNG＋低DPR、壞WebP改PNG、兩格式都壞退無圖hear、錯誤雙向ID拒用均PASS。
- 43,200組角色解析、96次換裝壓測、14層、PNG備援及舊存檔／還原檢查全PASS；角色LRU峰8、15.4MB解碼峰值不變，結束refs／sources／liveDecodedBytes皆0。149筆大碼**2818/2950**，OpenCV放大QR解碼逐字相符；題圖不寫入save code。
- `shots_p0/30_01_0039_pic2spell.png`、`30_02_0040_pic2spell.png`、`30_03_0035_pic2spell.png`、`30_04_0037_pic2spell.png`、`30_05_0007_pic2spell.png`、`30_06_0028_pic2spell.png`、`30_07_0029_pic2spell.png`、`30_08_0032_pic2spell.png`；全8張遊戲圖＋題卡contact：**`30_09_all8_ingame_contact.png`**；另`30_10_0028_spell2pic.png`。已目視檢查接圖與五隻計數。詳細規格／完整路徑：`docs/question_pictures_b12.md`。
- **未stage／commit／push／deploy**；HEAD仍detached 4796fcb、push URL no_push，live保持batch11；所有測試／截圖為ignored artifacts。Chromium iPad觸控／DPR模擬不是真iPad Safari，仍待真機清晰度、聲音、旋轉與長時間記憶體確認。


### 第十二批追加：題圖改為主視覺＋1280清晰度（31_*）
- 以上30_*為初版，主圖偏小問題已修正；pic2spell改 **512×320 logical px**（800px面板的64%）、置中16:10，實拍全部8圖。指令22px、目標序號16px、三個注音答案 **560×60／34px** 全可見；「怎麼玩」示意縮為120×75置側欄，答錯提示亦移側欄，均不蓋圖／答案。
- spell2pic三個選項主圖各 **232×145 logical px**、卡片244×220；無圖hear／drag保留48px詞語及52–56px注音。1024×768、1180×820、1366×1024的主圖實際CSS為512×320、546.7×341.7、682.7×426.7；820×1180與768×1024直向為410×256.3、384×240，最小答案熱區45px CSS高。完整尺寸表及31_*路徑：`docs/question_pictures_b12.md`。
- Lily1280x800已到貨：主來源manifest仍列舊兩尺寸，故匯入工具讀HANDOFF與獨立`1280x800/SHA256.txt`，只在副本合併新tier；**48/48來源SHA／尺寸、24對PNG-WebP像素全部相同**。三尺寸共15,380,784 bytes（WebP6,390,696、PNG8,990,088），未拷來源／rejected工作檔、未動來源及readiness=false。
- 顯示寬×canvas CSS比例×DPR>640時按需載1280；WebP失敗同名PNG，1280缺metadata／缺檔維持640同尺寸，絕不借詞圖。啟動只載320／640基礎fallback；1280有獨立3張LRU及GameObject引用釋放，穩態至多19張／22.528MB像素解碼（升級瞬間26.624MB估算，不是Safari總RAM），角色預算不變。
- 新排版runner檢查五種橫直向、全部8圖、67個圖題目標答案不裁切、重聽／提示／指令／三答案及答錯回饋不重疊、DPR2實載1280與缺高階時640降級；音訊hint測試只調整pic2spell新120×75預期。重跑舊畫面runner輸出導到ignored歷史測試目錄，保留30_*初版對照，不覆寫新31_*。
- 新圖：`shots_p0/31_01_0039_pic2spell.png`～`31_08_0032_pic2spell.png`、**`31_09_all8_ingame_contact.png`**、`31_10_0028_spell2pic.png`、`31_11_large_text_hear.png`、`31_12_large_text_drag.png`；另有31_13／15／16／17橫直向實拍。
- 僅副本；無stage／commit／push／deploy，HEAD仍4796fcb、push URL no_push。真iPad Safari尚未實機測試。

### 大圖／1280最終驗收：PASS（2026-11-11 08:22:20 SGT）
- 完整`tests_p0/b12_preflight.py` **17支runner全部exit0**；通用回歸9/9、角色27/27、音訊/UI17/17、聲調3/3、圖所有權8/8、B12匯入/載入11/11、新排版9/9，正常pageerror／console.error **0**。五種viewport、全部67個圖題目標文字／答案均無裁切或重疊，8張主圖DPR2實載1280。
- 43,200組解析、96次換裝、PNG／缺圖／缺音及舊存檔回復全PASS；149筆大碼 **2815/2950**、OpenCV逐字相符。角色LRU8／14層解碼峰15.4MB、結束refs／sources／liveDecodedBytes皆0；題圖穩態實測19張／22,528,000 bytes、pending0。
- 另以真正HTTP404同時攔1280 WebP/PNG：正確640圖仍維持512×320，pageerror0，僅2個預期HTTP404資源log；證據`tests_p0/b12_high_missing_http_result.json`。沒有修改遊戲來迎合測試。
- 已目視大圖、五隻計數、泡澡、三選圖、無圖大字、直向及8圖contact；舊30_*保留。僅副本，未stage／commit／push／deploy，no_push不變；真iPad Safari仍待確認。


### 第十二批追加：Lily滿版無框frameless_v2（32_*）
- 三尺寸48檔重新驗證主manifest SHA／bytes／尺寸，1280獨立SHA清單亦與主manifest逐欄相符，24對PNG/WebP像素完全相同後才覆寫副本。runtime記錄sourceVersion=frameless_v2、frameless=true；productionReady／runtimeUseAllowed仍false。僅正式runtime檔，沒有匯入備份／rejected／預覽或改來源。
- 圖片實體共19,826,105 bytes（WebP8,417,690、PNG11,408,415）；1280/640/320依顯示×DPR選用、WebP→PNG與高階缺檔→640備援及有界快取不變，並非開站一次下載全部格式。
- 31_*白矩形原來是源圖烘焙的米白留邊／圓角卡；遊戲本來沒有額外主圖底板。換滿版圖後直接顯示單一Image，不加白底、內框、裁切或mask；spell2pic只保留粉紅答案cell自身邊框。主圖512×320 logical（面板64%）、選圖232×145及五種橫直向排版均不改。
- 目視0028正好五隻，頭身腳可見；兩端外翼貼到源圖邊緣，遊戲沒有額外裁圖。HANDOFF實際重畫0040／0028；0007是去框裁切，沒有誤換詞號。0039拳頭近上緣、0029缸底貼下緣是來源構圖，臉／黃鴨等題意重點完整。
- 新實拍32_01–08逐張真題、`shots_p0/32_09_all8_ingame_contact.png`、`32_10_0028_spell2pic.png`，另有無圖大字及橫直向32_11–17。舊30／31保留對照；測試和截圖仍ignored artifacts。僅副本，無stage／commit／push／deploy，push URL no_push。

### 無框v2最終驗收：PASS（2026-11-11 08:40:01 SGT）
- 全部17支runner exit0；回歸9/9、角色27/27、音訊/UI17/17、聲調3/3、所有權8/8、B12圖片12/12、無框/排版10/10。五種橫直向、67個圖題目標、1280清晰度與640/PNG降級全PASS；正常pageerror/console.error 0。
- 48檔新SHA／尺寸全部符合兩份來源清單，24對PNG/WebP完整RGBA bytes相同、全畫布alpha=255；無框圖片直接在粉紅面板中顯示，選圖只有cell外框、沒有白色inset，GameObject無crop/mask。嚴格匯入器最後重跑，51個runtime圖／資料檔與剛通過全套測試的bytes完全一致。
- 43,200組／96次換裝與舊存檔全PASS；149筆QR 2813/2950、OpenCV逐字相符。角色LRU峰8／14層15.4MB、題圖峰19張／22.528MB，預算不變。四張交接重點：`shots_p0/32_06_0028_pic2spell.png`、`32_02_0040_pic2spell.png`、`32_10_0028_spell2pic.png`、`32_09_all8_ingame_contact.png`；已目視檢查。
- 未stage/commit/push/deploy；HEAD仍detached4796fcb、push URL no_push，Lily來源與ready=false未改。真iPad Safari仍待實機確認。


### 第十二批微調：spell2pic答案格改8:5滿版（33_10）
- 答案cell由244×220改 **240×150 logical px**（精確8:5），圖片由232×145改 **240×150**直接填滿cell，零內襯、無上下粉紅留條；不裁圖／不加mask／不改來源。中心仍(264,450)、(512,450)、(760,450)，cell間隔8px，不與注音／指令重疊。
- CSS cell／圖片尺寸：1024×768→240×150；1180×820→256.3×160.2；1366×1024→320×200；820×1180→192.2×120.1；768×1024→180×112.5。最小觸控高度112.5 CSS px，遠高於44；pic2spell尺寸／題庫／聲音／存檔／美術與快取上限不變。
- 排版runner新增所有橫直向cell與圖逐邊完全相同、8:5與>=44px熱區斷言；新的`shots_p0/33_10_0028_spell2pic.png`，保留32_10修改前畫面。完整尺寸表：`docs/question_pictures_b12.md`。
- 僅副本；未stage／commit／push／deploy，push URL維持no_push，readiness=false不變。全套重跑結果以下續記。

### 8:5答案格最終驗收：PASS（2026-11-11 08:47:22 SGT）
- `tests_p0/b12_preflight.py`17支runner全exit0；回歸9/9、角色27/27、音訊17/17、B12圖片12/12、排版10/10；正常pageerror／console.error 0。43,200組解析、96次換裝、舊存檔與PNG備援全PASS，149筆QR 2832/2950、OpenCV逐字相符。
- 五種viewport實測cell與圖片逐邊同為240×150 logical、8:5滿版，沒有上下留條／重疊，最小直向CSS為180×112.5（高>44）。已目視`shots_p0/33_10_0028_spell2pic.png`；完整尺寸表如上。
- `CHANGES_P0.md`及`docs/question_pictures_b12.md`已更新；未stage／commit／push／deploy，HEAD／no_push／readiness=false不變。


---

# 第十三批 Part A：錯圖根因、快取破壞、版本號、直向提示（2026-11-13，新加坡時間 UTC+8）

本節在塔防經濟改版（Part B）開始前寫下，避免進度再次中斷遺失。只改副本，無 stage／commit／push／deploy，push URL 維持 no_push，Lily readiness 仍 false。

## 根因（證據）
- Raymond 11:28 正式站截圖：看注音選圖考「ㄨˇ ㄓ」，選項卻是天鵝／合掌／鼓 emoji，且沒有第 11 批的說明、「怎麼玩」與「重聽」。詳見 `docs/b13_emoji_root_cause.md` 與 `feedback/raymond_1128_spell2pic_wuzhi.png`。
- 11:32 實抓正式站：`Cache-Control: max-age=600`、腳本無 `?v=`；第 11 批目錄已把「五隻」標為 mismatched，照理不出此題。截圖與當天程式不一致，判定 iPad Safari 仍在跑會讀 `vocab.pic` 的舊 JS。第 12 批五隻專圖當時尚未上線，即使快取正確也不會看到小鴨，但也不該看到天鵝。

## 副本修正
- 保留 11:34 已寫好的 `js/build.js`、index 快取標頭與 script `?v=`、角色／題圖 `Build.url`、直向遮罩；版本號改為可見的 **b13-20261113**（開始畫面右下、地圖、左下角 `#kx-build`）。fetch、Phaser loader、音效 UI 路徑一併加版本參數。遊戲本身沒有 Service Worker，僅在本站 scope 解除舊註冊。
- 硬規則：`Learn.picture()` 只接受目錄已核對且 wordId 相符的 Lily 圖（8 詞）或 22 個已審核 emoji；不讀 `vocab.pic`，錯配／裝飾符號一律不算圖。`battle.js` 只在 `kind==='image'|'emoji'` 時畫題圖。看圖／選圖題需有屬於該詞的圖，否則改出聽辨／拖曳大字。
- 新測試 `tests_p0/b13_part_a_playtest.py`：**8/8 PASS**，JS／console 錯誤 0。596 組走訪 0 個未核准 emoji；圖題目標 67×2=134；「五隻」正解為 `word_0028`、畫面無天鵝。腳本與資料請求帶 `v=b13-20261113`；390×844 顯示轉橫提示，1180×820 不顯示。
- 截圖：`shots_p0/34_01_start_version_label.png`、`34_02_spell2pic_0028_real_art.png`、`34_03_pic2spell_0028_no_swan.png`、`34_04_portrait_rotate_prompt.png`。
- 第 12 批題圖放大與 8:5 答案格維持不變。塔防經濟改版見下節 Part B。真 iPad Safari 仍須在上線後確認版本號與題圖。

---

# 第十三批 Part B：塔防經濟、三波、十顆心、重試與助手（2026-11-13 08:00，新加坡時間 UTC+8）

只改副本，無 stage／commit／push／deploy，HEAD 仍 detached `4796fcb`，push URL 維持 no_push，Lily readiness 仍 false。第 12 批題圖／8:5 格與 Part A 快取、版本號、硬圖片規則均不變。

## 經濟與波次
- 所有可調數字集中在 `js/balance.js`（開局／蓋塔／升級／擊殺／Boss／答對金幣、愛心、波數與數量、出怪間隔、破關漏心、兩次戰敗後的助手）。戰鬥不再硬編碼舊的 5 心、免費蓋塔、5500ms 出怪。
- 開局 20 金幣，剛好蓋一座塔；擊殺 +5（Boss +20）、答對 +3；升級 30。空槽在金幣不足時變灰。答對與擊殺有金幣飛向左上角（佔位 🪙）。
- 三波，HUD「第 X/3 波　還剩 N 隻」，開場與波間有橫幅（第 1 波開始／第 2、3 波準備，波間 6 秒）。出怪較快：第 1 關 3.2 秒，之後每關快 0.2 秒，最快 2.2 秒；同場最多 5 隻。
- 城堡 10 心，一般漏 1、Boss 漏 3。戰敗不扣星星寶石，大顆「馬上再試一次」立刻重開關卡。`window.StageFails`（不進存檔／QR）滿 2 次後給助手：再開 +20 金幣、怪物速度 ×0.85；過關清零。
- `spawnTimer.paused` 仍只停自動出怪，測試可手動 `spawn()`。

## 平衡模擬（未改已對外金幣數字）
- `tools/sim_balance_b13.py`，40 局×五關，答對率 80%／50%。路徑長 1356px。關卡規模：第1關 4+5+6=15，第2關 17，第3–5關各 18，第5關最後一隻為 Boss。
- 未公布的血量／速度調為：`hpBase 11`、`hpPerStage 1`、`hpStageCap 4`、`bossHP 36`、`speedBase 65`、`speedPerStage 2`、`speedStageCap 4`、`bossSpeed 40`、`spawnStageCap 4`。後期一般怪不再比第 4 關更快更厚，第 5 關只多 Boss。
- 結果（無助手／有助手勝率）：80% 玩家 1–5 關皆 100%，剩餘心約 9.9／8／5.3／1.9／2。50% 玩家 1–3 關 100%、4–5 關 95%，助手後亦 100%。答慢時出怪暫停、怪物變慢，擊殺金幣仍能養塔，故 50% 與 80% 接近；難度主要隨關卡血量／速度上升，第 4–5 關剩約 2 心。完整數字在 `tests_p0/b13_balance_sim.json`。

## Lily 介面佔位（1024×768 邏輯像素，待 1x／2x 美術）

| 元件 | 位置 (x,y) | 尺寸 (寬×高) | 備註 |
|---|---|---|---|
| 金幣圖示 | 28, 22 | 36×36 | 左上，現為 🪙 |
| 金幣數字 | 74, 26 | 字 28px，左對齊 | 描邊紫 |
| 波次條底 | 240, 16 | 400×44，圓角 16 | 白底粉框 |
| 波次條進度 | 244, 20 | 最長 392×36，圓角 12 | 粉填 |
| 波次文字 | 440, 26 | 字 24px，水平置中 | 「第 X/3 波　還剩 N 隻」 |
| 十心城堡條 | 20, 62 | 280×26，圓角 10 | 白底 |
| 心格 i（0–9） | 26+i×27, 66 | 24×18，圓角 5 | 滿心粉、空心灰紫 |
| 蓋塔槽（6 個） | `BALANCE.slots`： (180,370)、(380,330)、(420,560)、(640,360)、(700,560)、(900,360) | 點擊 90×90；圓半徑 40 | 可蓋：白＋粉框；不夠錢：灰底 `#b0b0b0`、灰框 `#9e9e9e`、透明度 0.35 |
| 金幣飛入 | 起點為獎勵處，飛向 48, 40 | 32px | 450ms，Cubic.easeIn |
| 波次橫幅 | 容器中心 512, 200 | 640×140，圓角 24，相對容器 -320,-70 | 深紫半透明＋粉框，字 36px |
| 戰敗卡片 | 212, 164（W/2-300, H/2-220） | 600×440，圓角 36 | 現有佔位 |
| 重試鈕 | 512, 494（W/2, H/2+110） | 280×100 | 「馬上再試一次」 |
| 回地圖鈕（戰敗） | 512, 584（W/2, H/2+200） | 230×72 | |
| 過關星星字 | 512, 200 | 字 80px，置中 | 現有過關佔位，隨後寶箱 |
| 轉橫提示 | HTML `#kx-rotate` 全螢幕 | 100vw×100vh | 直向且寬度 <700 才顯示，非畫布 |
| 版本號 | HTML `#kx-build` 左下（含安全區） | 內距 4×8 | 「v b13-20261113」，非 Lily 稿 |

## 測試與截圖
- `tests_p0/b13_part_b_playtest.py`：**13/13 PASS**，JS／console 錯誤 0。涵蓋開局 20 金與可蓋一塔、灰槽、三波 HUD 與橫幅、10 心、擊殺／答對給金、波間橫幅、即時重試、280×100 重試鈕、兩敗助手（40 金、速度 0.85）、過關清失敗、paused 計時器。
- 既有 `p0`／`p0b`／`p0c`／額外截圖在測試裡改用 `coins=999`（避免連續蓋塔）、重試點改到新鈕中心、愛心斷言改 10；`spawnTimer.paused` 語意不變。因 `?v=` 快取破壞，題圖／音檔／manifest 的 Playwright 攔截改為允許 query（邏輯不變）。
- 全套：b12 17 支 runner 與 `validate_regressions_b11.py` 9/9、Part A 8/8、Part B 13/13、平衡模擬皆 PASS；正常 pageerror／console.error 0。紀錄 `tests_p0/b13_preflight_result.json`。
- 截圖：`shots_p0/34_05_start_20_coins.png`、`34_06_greyed_slot.png`、`34_07_wave_banner.png`、`34_08_hud_wave_remaining.png`、`34_09_10_hearts.png`、`34_10_coin_flyin.png`、`34_11_retry.png`、`34_12_win.png`、`34_13_mercy.png`（另 Part A 的 34_01–04 仍在）。
- 真 iPad Safari 仍須在上線後確認版本號、題圖與新 HUD。未碰 Lily 源目錄。

---

# 第十三批 Part C：接上 Lily 塔防 UI 美術 ui_v003（2026-11-13 08:43，新加坡時間 UTC+8）

只改副本 `/workspace/princess-game-p0`，無 stage／commit／push／deploy，HEAD 仍 detached `4796fcb`，push URL 維持 no_push。Lily 源目錄 `/workspace/princess-game/art/ui_v003_tower_defense/` 只讀、原檔複製進來，未改源檔。`productionReady`／`sourceReady` 仍為 false。第 12 批題圖／8:5 格與 Part A／B 行為不變。

## 美術接入
- 152 張遊戲檔（38 件 × 1x／2x × WebP／PNG）複製到 `assets/art/ui/td_v003/`（coin、coin_fly、wave_bar、hearts、build_slot、wave_banner、lose、win、rotate）。 provenance：`docs/handoff_ui_v003.md`、`data/layout_ui_v003.json`、`data/ui_td_v003_SHA256.txt`（SHA 全數相符）。未複製 previews／raw／建置腳本。
- 執行期目錄 `data/ui_td_v003.json`：`assetRoot assets/art/ui/td_v003/`，`productionReady: false`、`sourceReady: false`。
- 新 `js/ui-td.js`（TdUI）：Boot 載入；DPR≥1.5 用 2x，否則 1x；優先 WebP、失敗改 PNG；路徑經 `Build.url`（`?v=b13-20261113`）。注意 `const Build` 不是 `window.Build`，URL 幫手用 `typeof Build!=="undefined"?Build.url(path):path`。金幣飛入為 8 幀、70ms 的 spritesheet。
- `index.html` 加入 `js/ui-td.js?v=b13-20261113`。數字與標題在 Lily 空白底板／按鈕上由程式繪製（字體 PingFang TC 系，HUD／卡片字色 `#5a2d6e`）。

## HUD、槽位、卡片
- 金幣圖 (28,22) 36×36，數字 (74,26)。波次框 (240,16) 400×44；進度條為 NineSlice，左右 cap 各 18px、高 36、最小寬 36，起點 (244,20)，寬度 `prog<=0` 時隱藏，否則 `max(36, round(392*prog))`，從不從右側裁切。波次文字 (440,26)。心條 (20,62)；心圖位置 **(26+i×27, 66)**，24×18，分滿／空。
- 蓋塔槽美術置中於程式的 `BALANCE.slots`，點擊範圍 90×90；選取態兼作按下態，金幣不足顯示灰色版。建塔後隱藏槽圖、留下陰影圓當地基。`paintSlots` 曾誤把已蓋塔的 `so.t` 設為不可見（花塔只剩影子與星），已修正，只藏槽圖。
- 開場／波間橫幅用空白 640×140 底板，中心 (512,200)，文案「第 N 波，準備！」（與 Lily 稿一致，不再寫「開始」），顯示 6 秒；戰敗／過關會先拆掉橫幅，避免蓋住卡片與星星。
- 戰敗卡 `lose_card_blank` 在 (212,164) 600×440；重試鈕中心 (512,494) 280×100「馬上再試一次」；「回地圖」中心改為 **(512,568)** 230×72（Lily 稿 584 會超出卡片下緣約 16px，依本次指定改 568）。
- 過關卡 `win_card_blank` 在 **(212,164)**，星星在 (512,200)。現有過關流程沒有「下一關」動作（過關後掉寶箱，先前會自動回地圖），因此**不需要「下一關」按鈕**。卡片加上既有的「回地圖」鈕（中心 512,568），並在 `winUI` 存在時略過自動回地圖，讓玩家看完卡片。未做 280×100 綠色佔位「下一關」。

## 轉橫提示
- `#kx-rotate` 使用 Lily 直向空白圖（同樣 1x／2x、WebP／PNG、`?v=`），文案「把手機橫過來，一起守護城堡！」畫在卡片下方 letterbox（白字＋陰影），避免疊在淺色卡片上對比不足；`word-break:keep-all` 避免「城堡」被拆行。下方另保留一句「橫向畫面會更大、更好點喔。」

## 測試與截圖
- `tests_p0/b13_part_c_playtest.py`：**13/13 PASS**，JS／console 錯誤 0。涵蓋 Boot 載入、NineSlice、心與槽座標、DPR1→1x WebP／DPR2→2x WebP、快取破壞、灰槽、戰敗／過關位置、無下一關、轉橫圖帶 `v=`、readiness 仍 false。灰槽截圖前會拆掉波次橫幅。
- 回歸：Part A 8/8、Part B 13/13、`p0_playtest.py`／`p0_hero_jobs.py`／`p0b_playtest.py`／`p0c_playtest.py` 皆 exit 0。`p0_playtest.py` 的漏心模擬改為同時重設 `busy`／`breaking`／`waveSpawned`，避免波間或波次額滿時 `spawn()` 早退（遊戲規則未改）。
- `tests_p0/b12_preflight.py` 17 支 runner 全 exit 0，`validate_regressions_b11.py` **9/9 PASS**。正常 pageerror／console.error 0（故意缺檔情境的 HTTP 404 屬預期）。紀錄 `tests_p0/b13_preflight_result.json`、`tests_p0/b13_part_c_result.json`。
- 截圖：`shots_p0/35_01_hud.png`（dsf=1）、`35_02_grey_slot.png`、`35_03_wave_banner.png`、`35_04_coin_flyin.png`、`35_05_defeat_card.png`、`35_06_win_card.png`、`35_07_rotate_prompt.png`、`35_08_hud_dpr2.png`（dsf=2）。對照 Lily `previews/ui_v003_mock_*.png`：HUD、灰槽、橫幅、飛幣、戰敗卡、過關卡、轉橫整體相符。

## 與 Lily 規格的差異（刻意或待確認）
- 戰敗「回地圖」中心用 (512,568)，不是稿上的 (512,584)，以免按鈕超出 600×440 卡片。
- 過關卡多了「回地圖」（Lily 此次過關 mock 無按鈕）；**不需要「下一關」**，因流程沒有下一關動作。若之後要關卡串接，再請 Lily 補 280×100 綠色「下一關」。
- 蓋塔槽座標用 `BALANCE.slots`，不是 mock 量到的點。
- 波次進度 0 時隱藏填充，對齊空條 mock。
- 開場橫幅用「準備」而非舊文案「開始」；`35_01_hud` 拍到開場橫幅尚未結束，與 `35_03` 畫面接近。
- 轉橫畫面在 Lily 卡片下方另有一行說明文字。
- 版本號 `#kx-build` 仍為 HTML 左下角，非 Lily 稿。readiness 旗標未打開。未碰 Lily 源目錄。

---

# 第十三批 Part C 補：戰敗／過關按鈕重疊與貼邊修正（2026-11-13 08:54，新加坡時間 UTC+8）

只改副本，無 stage／commit／push／deploy，HEAD 仍 detached `4796fcb`，push URL 維持 no_push，Lily readiness 仍 false，未碰源目錄。

## 問題
`shots_p0/35_05_defeat_card.png` 中，「馬上再試一次」（中心 494、高 100，y 444–544）與「回地圖」（中心 568、高 72，y 532–604）重疊 12px，且回地圖下緣恰在卡片底 y=604，沒有留白。過關卡僅有「回地圖」，同樣貼在 y=604。

## 修正（卡片仍為 (212,164) 600×440，底邊 y=604）
- 戰敗：「馬上再試一次」中心 **(512, 462)**，280×100，矩形 y 412–512、x 372–652。
- 戰敗／過關：「回地圖」中心 **(512, 560)**，230×72，矩形 y 524–596、x 397–627。
- 兩鈕垂直間距 12px；回地圖距卡片底 8px。副標「再試一次就好～」底約 y=395，距重試鈕頂 17px，無重疊。過關副標「楷芯好棒！」底約 y=430.5，距回地圖 93px。星星仍在卡片上緣，不與標題或按鈕重疊。
- `TdUI.btn` 的 `setSize` 點擊範圍與美術顯示尺寸同為 280×100／230×72，保持對齊。`p0_playtest.py` 重試點改打 (512,462)。

## 測試與截圖
- `tests_p0/b13_part_c_playtest.py` 新增 `card_buttons_do_not_overlap_or_overflow`：戰敗／過關卡上所有按鈕矩形不得互疊、不得超出卡片、兩鈕間距至少 12px、距卡片底至少 8px，且 hit 與美術尺寸一致；標題／副標亦不得壓到按鈕。失敗時寫入 `issues`。座標斷言改為 462／560。
- 重跑：Part C 14/14（含新檢查）、Part A 8/8、Part B 13/13、`p0`／`p0_hero_jobs`／`p0b`／`p0c` 皆 exit 0；`b12_preflight.py` 17 支 runner 全過，`validate_regressions_b11.py` 9/9。JS／console 錯誤 0。
- 新截圖：`shots_p0/35_05b_defeat_card.png`、`shots_p0/35_06b_win_card.png`（同步更新 `35_05_defeat_card.png`、`35_06_win_card.png` 為修正後畫面）。
