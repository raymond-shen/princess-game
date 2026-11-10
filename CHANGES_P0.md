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
