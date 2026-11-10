# production_hair_02 相容性檢查（唯讀）

- 檢查者：Chloe
- 時間：2026-11-10 00:40（台北時間，UTC+8）
- 檢查對象：`/workspace/princess-game/art/production_hair_02/character_complete_manifest_v2.json`（sha256 `c6aeb731…2d174`，和 HANDOFF.md 寫的一致）
- 比對對象：p0 的 `js/character.js`、`js/art.js`、`data/character_manifest.json`、`data/assets_manifest.json`
- 範圍：**只讀，沒有整合**。遊戲程式和 Lily 的檔案都沒有改動，也沒有 commit、push 或部署。

## 0. 結論
- **素材本身品質很好，可以接**：
  - 121 個圖層的 PNG 和 WebP 都存在，sha256 和位元組數全部相符。
  - WebP 全都是 1000×1100 的 VP8X（無損，含 alpha）。抽查 5 張，WebP 解碼後和 PNG 的像素完全相同。
  - 188 個縮圖路徑全部存在，所有 id 的參照都找得到。
- **還不能接的原因**：
  - 素材本身標示 `productionReady=false`、`runtimeUseAllowed=false`。
  - 我們的載入程式跟 v2 的結構差很多，不能直接換 manifest，要寫一層轉接器（見第 2 節）。
- **m02 母版有了**：v2 的 `body_safe_main` 就是 `production_pilot_v003/layers/body_safe_main.png`，sha256 是 `4bf372c0…7616`。v003 manifest 寫明這張的 `masterId` 是 `girl01_m02_candidate_pose01`，和 extras_v001 兩張表情的 `requiresMaster` 一致。所以接上 v2 以後，表情疊圖的對位就成立了。
  - 不過 v2 manifest 頂層**沒有 `masterId` 欄位**，而 `Art.exprOK` 是讀 `Char.m.masterId` 判斷的。
  - v2 的 `expressionLayer` 寫的是 `reserved_not_produced`，但 extras_v001 其實已經交了 happy 和 cheer 兩張表情。兩份文件互相不知道對方。
- **沒有真的皇冠和蝴蝶結圖層**：v2 只有兩頂帽子（B7 星月尖帽、B8 月亮貝雷帽）、B3 玩具劍、B3 盾、B4 愛心盾。遊戲用到的這些東西都還是 emoji 或向量佔位圖：
  - 寶物：皇冠、花圈、髮飾蝴蝶結、項鍊、翅膀、披風、小貓、獨角獸；
  - 職業道具：弓箭手的弓、魔法師的魔杖。

## 1. 檔案與大小
| 項目 | 結果 |
|---|---|
| 圖層數 | 121 個（`runtime_webp/` 裡也是 121 個檔案） |
| 檔案存在、sha256 相符 | ✅ PNG 121 個和 WebP 121 個全部相符；`webp.bytes` 和實際檔案大小一致 |
| PNG 的存放位置 | 有 41 個 PNG 在其他資料夾：`production_pilot_v003/layers`、`production_batch_01/layers`、`production_batch_02/layers`、`production_batch_02/layers_b01fix`。**WebP 全部集中在 `runtime_webp/`**，所以執行期只需要複製這一個資料夾 |
| 路徑格式 | 全部都是絕對路徑 `/workspace/...`，GitHub Pages 上不能用。整合時要改成相對路徑 |
| 預設附配件的組合（360 種） | WebP 最小 313 KB／中位數 414 KB／最大 498 KB（A1_brown_B11），每組 6–10 層。**和 Lily 說的「約 410 KB」相符** |
| 把帽子換掉或拿掉的組合（1440 種） | 中位數 423 KB，最大 534 KB（A1_brown_B11 加 B7 帽），最多 11 層 |
| 預設組合 A1 棕髮＋B1 | 427 KB（6 層），和 HANDOFF 寫的一致 |
| 全部圖層 | WebP 5.08 MB／PNG 8.72 MB |
| 解碼後的記憶體 | 每層 1000×1100×4 ≈ 4.4 MB，一個組合 7 層約 31 MB。p0 現在用 50% 的執行期副本（`runtime.scale=0.5`，每層約 1.1 MB），**直接改用 Lily 的全尺寸檔，記憶體會變成 4 倍** |

## 2. 結構和欄位名稱跟我們的載入程式比較
| 我們的程式現在讀的欄位 | v2 的寫法 | 影響 |
|---|---|---|
| `m.assets` 是陣列，用 `.find(a=>a.part==='body_safe_main')` 找 | `assets` 是物件，用 id 當鍵；body 的 `part` 是 `"body"` | ❌ 會找不到母版 |
| `m.fileTemplates.{hair_front,…}` 用 `{style}`、`{color}`、`{outfit}` 代入檔名 | 沒有樣板；改成 `hairPairs["A1_brown"].hair_back/front`、`outfits.B1.parts[]` 查 id，再到 `assets[id].webp.path` 取檔 | ❌ 解析方式要重寫 |
| `m.runtime.{dir,scale}` | 沒有這個欄位 | 要自己定執行期副本的資料夾和縮放比例 |
| `m.masterId` | 沒有這個欄位（v003 的 manifest 裡才有） | ⚠️ 表情閘門會一直判定為不符 |
| `m.hairStyles[]`、`m.hairColors[]`，帶 label 和 thumb | `selection.hairStyleId[]`、`hairColorId[]`；名稱和縮圖放在 `hairPairs[*].name`、`.thumb` | 換裝畫面的資料要改接 |
| `m.jobs[]`、`m.equipment[]`、`m.handheld[]` | v2 沒有，這三個是遊戲自己的資料 | 要保留在我們自己的 manifest 裡，再跟 v2 合併 |
| `anchorsPx.grip_screen_left/right` | 改名成 `hand_center_screen_left/right`，座標是 (330,583) 和 (653,591) | ❌ 直接替換的話，`P(...undefined)` 會讓 `Char.build` 出錯 |
| `anchorsPx.head` (500,275)、`neck` (500,405) | `head_center` (489,182)、`neck_center` (500,301) | 皇冠、項鍊這些 emoji 的 `posPx` 是照舊的佔位圖定的，**全部要重新定位** |
| 腳底原點在畫布 (500,1000) | 腳底在 y≈1023–1035 | 照現在的程式，角色會往下沉大約 30×s px。要把原點改成 y≈1030 |
| 寫死的 drawOrder：20、30、40、60、65、75 | 多了 handheld 66、headwear 80、arm_front 90、outfit_overarm 和 shield 都是 92 | `arm_front` 是**一定要載的圖層**，我們目前沒有載 |

## 3. drawOrder 和衝突
v2 的順序：outfit_back 20 → hair_back 30 → body 40 → outfit_main 60 → outfit_front 65 → handheld 66 → **expression 70** → hair_front 75 → headwear 80 → arm_front 90 → outfit_overarm 92 → shield 92。

遊戲自己的 emoji 配件（`character_manifest.json`）：wings 10、star_cape 20、**necklace 70**、crown 和 flower_crown 80（headwear 槽）、bow_accessory 100、pet 110。職業道具佔位是 95。

衝突有三個：
1. **necklace 70 和 expression 70 同值**：原本的規格書把 70 定為 neck_accessory／cape_front，HANDOFF 第 6 節也提到了。項鍊在下巴下面，表情只在眼、眉、嘴，畫面上不會重疊，但排序結果會不固定。
2. **star_cape 20 和 outfit_back 20 同值**：B7、B8 這類有披風後片的服裝，誰蓋誰會不固定。
3. **皇冠和花圈也是 headwear 80**，跟 B7／B8 兩頂帽子搶同一個槽。`hatVariants` 只為 B7 定義了 A4、A6 的換髮規則；皇冠戴在 A4 丸子頭或 A6 髮帶上會怎樣，沒有規則。

**建議**：
- 表情固定在 **70**。這樣它在 outfit_front 65 和 handheld 66 上面、hair_front 75 下面，瀏海和帽子可以蓋住表情，這是 Lily 的原意。
- neck_accessory 和 cape_front 改成 **68**（在衣服 65、66 上面、表情下面）。不用「同值再定先後」的規則，排序就是固定的。
- star_cape 改成 **18**。
- 皇冠和花圈算 headwear 槽，跟帽子互斥；請 Lily 確認 A4、A6 戴皇冠時要不要另做 hatVariant。

## 4. 戴帽子時換髮型的規則
- 規則很清楚：如果戴的 headwear id 在 `hairPairs[pair].hatVariants` 裡，`hair_back` 和 `hair_front` 就**兩片一起**換成 variant；拿掉帽子就換回來。
- 實際內容：A4 和 A6 共 5 色 × 只對 B7 = 10 組，20 個條件圖層，全部都找得到。B8 不需要換。
- 我們的程式目前完全沒有 headwear 槽的概念，皇冠只是 emoji 疊上去，這段要新寫，大約 20 行。
- HANDOFF 第 3 節的排序範例，在同值 92 時用 `part==='shield'` 讓 shield 排後面，這是對的。不過不能依賴 JavaScript 的 sort 是穩定排序這件事，要用明確的第二鍵。

## 5. 畫布、錨點、怎麼放進角色框
- 1000×1100、offset 0、不裁切，和我們的假設一致 ✅
- HANDOFF 第 7 節建議用「整張畫布 contain、貼底」，**不要依 alphaBBox 裁切**，否則換帽子會跳位置。
  - 剛剛存檔卡為了讓角色佔欄高 90%，我是用看得到的範圍來縮放。這個做法在戴上 B7 尖帽（alphaBBox 最高到 y=7）時，角色會整體變小。
  - 正式接 v2 時，建議改成固定比例：整張畫布 contain，再補上腳底留白的 `(1100−1035)·s`。

## 6. iPad Safari 的 WebP 支援
- Safari 14（iOS／iPadOS 14，2020 年）開始支援 WebP，包括有損、無損和 alpha 透明。來源：
  - https://webkit.org/blog/11340/new-webkit-features-in-safari-14/
  - https://developers.google.com/speed/webp/faq
  - https://caniuse.com/webp （iOS Safari 14 以上支援）
- 停在 iPadOS 12 的舊 iPad（iPad Air 1、mini 2／3）**不支援 WebP**。整合時要先在程式裡測一個 1×1 的 WebP data URI，失敗就改載 PNG（Lily 每層都有 PNG）。
- Phaser 3.80 的載入器沒有自動選格式的功能，要在 Boot 場景自己判斷。
- 記憶體比檔案大小更要緊，見第 1 節。建議：
  - 我們自己另外產生 50% 的執行期副本（500×550，有損 q90 或無損都可以）；
  - 或者每個組合先合成成一張 RenderTexture，再把各分層釋放掉，這也是 HANDOFF 的建議。

## 7. 請 Lily 回覆的問題
1. **表情和配件的順序**：我建議表情固定 70，neck_accessory 和 cape_front 改 68，遊戲的 star_cape 改 18。同不同意？
2. **masterId**：能不能在 v2 頂層加 `"masterId": "girl01_m02_candidate_pose01"`？`expressionLayer` 也請改成指向 extras_v001 的 happy、cheer（或說明它們只是試做）。
3. **皇冠、花圈、髮飾蝴蝶結**：有沒有排進圖層化的製作？如果有，皇冠和花圈算不算 headwear 單槽（跟 B7、B8 帽子互斥）？A4、A6 戴皇冠時需不需要 hatVariant？
4. **職業道具**：弓箭手的弓、魔法師的魔杖目前都沒有。B3 玩具劍是 `heldInHand:false`。手的錨點改名成 `hand_center_*`，我們會照新名稱接。請確認新名稱已經定案。
5. **執行期尺寸**：iPad 上要用全尺寸 1000×1100 嗎？還是可以由我們產生 50% 的副本（只縮小，不修改內容）？
6. **路徑**：能不能另外給一份 web 用的相對路徑（例如 `runtime_webp/<id>.webp`）？還是由我們用腳本改寫？

## 8. 核准後的整合工作量（估計 1.5–2 個工作天）
1. 寫 `tools/import_character_v2.py`，約半天：
   - 複製 `runtime_webp/` 和必要的 PNG（當 fallback）、需要的縮圖；
   - 產生 50% 的執行期副本；
   - 輸出 `data/character_v2.json`：改成相對路徑，補上 `masterId`、`runtime` 欄位，再合併遊戲自己的 jobs、equipment。
2. 重寫 `character.js` 的解析，約半天：
   - 照 resolveRules 處理 requiredAlways、hairPairs、hatVariants、outfits.parts、defaultAccessories；
   - 加上 headwear 單槽、排序用明確的第二鍵；
   - 改用新錨點，並重新定位 emoji 配件；
   - Boot 場景加 WebP 偵測和 PNG fallback；
   - 每個組合合成一張 RenderTexture 快取。
3. 換裝畫面改用 `menuThumbnails`；存檔的 `character` 欄位加上 `headwear` 和 `accessoriesOff`，並寫舊存檔的轉換。約半天。
4. 回歸測試、表情閘門要通過（`exprOK=true`）、截圖（戰鬥、小屋、存檔卡、換裝），再加上記憶體檢查。約半天。

範圍外：皇冠、蝴蝶結、弓、魔杖的正式圖層要等 Lily 交，在那之前繼續用佔位圖。

---

# v3 複查（唯讀）

- 時間：2026-11-10 00:50（台北時間，UTC+8）
- 檢查對象：`production_hair_02/character_complete_manifest_v3.json`（sha256 `05c13e2a…330a6`，和 HANDOFF_v3.md 寫的一致）、`HANDOFF_v3.md`、`runtime_50/`
- 範圍：**只讀**。遊戲程式和 Lily 的檔案都沒改，也沒有 commit、push 或部署。
- Lily 的自我檢查 `work/complete_manifest_v3_selfcheck.json` 結果是 PASS。我另外寫腳本獨立重算了一次，結果如下。

## 先前發現的問題，v3 處理得如何
| 項目 | v3 結果 | 判定 |
|---|---|---|
| `masterId` | 頂層新增 `masterId: girl01_m02_candidate_pose01`。`masterFile` 實際檔案的 sha256 等於 `masterSha256`，也等於 `assets.body_safe_main.sha256`（`4bf372c0…7616`）。`expr_happy`、`expr_cheer` 的 `requiresMaster` 也一致 | ✅ |
| 路徑 | 770 個路徑欄位，**沒有一個是絕對路徑**，全部相對於 `assetRoot.local`（`/workspace/princess-game/art`）。另外有 13 個 sha256 欄位全數相符，涵蓋 masterFile、faceLock 遮罩、supersededChain 和 iconOnly 寶物圖示 | ✅ |
| 檔案是否存在 | **沒有缺檔**：123 個圖層（多了 `expr_happy`、`expr_cheer`），每個都有 PNG、full WebP、`runtime50` 三份；thumbs 3 個子資料夾全在；`masterFile`、遮罩、selfcheck、polish_list 都在。`runtime_50/` 裡的 123 個檔案都有被引用，沒有多出來的；位元組數和 manifest 寫的一致 | ✅ |
| 部署要複製的資料夾 | 執行期圖層：`production_hair_02/runtime_50`；縮圖：`production_hair_02/thumbs`；舊 iPad 的 PNG fallback 要另外帶 `production_pilot_v003/layers`、`production_batch_01/layers`、`production_batch_02/layers`、`layers_b01fix`、`production_hair_02/layers` 和 `headwear`、`extras_v001/game_ready` | ℹ️ 匯入腳本照 `assetRoot` 的相對結構複製即可 |
| drawOrder | 和群組的決定一致：expression 70、neck_accessory／cape_front 68、star_cape 18、wings 10、bow_accessory 100、pet 110。每個 asset 的 `drawOrder` 都等於 `drawOrder[part]`，沒有不一致 | ✅ |
| 同值時的排序 | 同值的只剩兩組：68（neck_accessory 0、cape_front 1）和 92（outfit_overarm 0、shield 1），兩組的 `tieRank` 都不重複。我窮舉了 **4320 種組合**（6 髮型 × 5 色 × 12 服裝 × 4 種帽子設定 × 3 種表情），**沒有任何一組出現兩個圖層的 (drawOrder, tieRank) 完全相同** | ✅ 排序是固定的 |
| 戴帽子時換髮型 | 還是 10 組（A4、A6 × 5 色），都只對 B7；目標圖層全部存在，前後片的 part 正確 | ✅ 規則沒變 |
| 手部錨點名稱 | 定案為 `hand_center_screen_left/right`，半尺寸座標在 `anchorsPxHalf`。**p0 的 `character.js` 還在用 `grip_screen_left/right`，以及 `head`、`neck`、`waist`**；v3 對應的名稱是 `head_center`、`neck_center`、`waist_center` | ⚠️ 名稱還是不一樣，但這是我們這邊要改的，Lily 不用改 |
| 六件寶物 | `headwear.crown`、`headwear.flower_crown`、`wearableTreasures.necklace`、`wings`、`star_cape`、`bow` **全部是 `wornLayer:false`**，只有 256×256 圖示（iconOnly 的 sha256 都相符） | ✅ |

## runtime_50 的大小和記憶體
- 123 個都是 500×550（有 VP8L 也有 VP8X，都是無損加 alpha），總共 2.25 MB。
- 單一組合的載入大小：

| 範圍 | 組合數 | 最小 | 中位數 | 最大 | 層數 |
|---|---|---|---|---|---|
| 預設配件、不加表情 | 360 | 127 KB | **165 KB** | 211 KB（A2 棕＋B5） | 6–10 |
| 含換帽子和表情 | 4320 | 127 KB | 173 KB | 232 KB（A2 棕＋B5＋B7 帽＋cheer） | 6–12 |

- 預設 A1 棕＋B1 是 157 KB（6 層）。**和 Lily 說的「約 165 KB」相符。**
- **解碼記憶體**：每層 500×550×4 = 1.1 MB，一個角色 6–12 層約 **6.6–13.2 MB**。
  - Lily 寫的是 6–11 層、最多 12.1 MB。我窮舉的結果最多是 12 層：B5 的 6 層，加上 B7 帽、表情，B5 再有 overarm。差距不大，記一下就好。
  - 合成成一張 RenderTexture 快取後，每個角色只剩約 1.1 MB；WebGL 補成 2 的次方的話約 2.1 MB。
  - 比全尺寸版（26–48 MB）少了 4 倍。

## 小地方（不影響整合）
- `resolveRules` 的文字還是 v2 的 5 條，沒有提到 tieRank 和表情；HANDOFF_v3 第 3 節寫的才是完整的 7 條。整合時以 HANDOFF_v3 和 `drawOrderTieBreak` 為準。
- `selection.headwear` 只列了 B7、B8 兩頂帽子，沒有 crown 和 flower_crown。這和它們 `wornLayer:false` 是一致的，等戴上圖層交了再補。
- `loadEstimate` 的主欄位還是全尺寸的數字，半尺寸的數字在 `loadEstimate.half` 和 `decodeMemory`。
- 50% 版沒有 PNG。不支援 WebP 的 iPadOS 13 以下只能載全尺寸 PNG，記憶體會變 4 倍。這類舊 iPad 很少，可以接受，但要記下來。

## 還剩下的卡點
1. **核准**：`productionReady=false`、`runtimeUseAllowed=false`，要等 Raymond 和美術長核准。
2. **還沒在瀏覽器上實測**：Lily 只在 Pillow 裡驗證過合成。Chrome canvas 和 iPad Safari 都還沒測，整合時要用 p0 的 Playwright 做逐像素比對，再找一台 iPad 實機確認。
3. **我們這邊的程式要改**：錨點名稱，assets 從陣列改成物件，用 hairPairs／outfits 查圖層，tieRank 排序，headwear 單槽。這是整合工作本身，不是 Lily 的問題。
4. **六件寶物沒有戴上圖層**，弓和魔杖不在這版範圍內：遊戲繼續用 emoji 或向量佔位圖，不算卡點，但畫面上會一直看到佔位圖。

## 更新後的整合工作量：約 1–1.5 個工作天（原本估 1.5–2 天）
v3 已經補上相對路徑、`masterId`、`runtime50`、`anchorsPxHalf`、`tieRank`，匯入和解析都簡單很多。
1. `tools/import_character_v3.py`，約 2–3 小時：
   - 照 assetRoot 的相對結構複製 runtime_50、thumbs 和 PNG fallback；
   - 檢查 sha256；
   - 輸出 `data/character_v3.json`，合併遊戲自己的 jobs 和 equipment。
2. 重寫 `character.js` 的解析，約半天：
   - 照 resolveRules 處理 requiredAlways、hatVariants、defaultAccessories、headwear 單槽、tieRank；
   - 錨點改用 `anchorsPxHalf`，重新定位 emoji 和向量佔位圖，地面線 y=515；
   - 加 WebP 偵測，不支援就退回 PNG；
   - 合成成 RenderTexture 快取；
   - 表情閘門改讀 v3 的 `masterId`，預期 `exprOK=true`。
3. 換裝畫面改用 thumbs；存檔加 headwear 和配件開關，並轉換舊存檔。約 2–3 小時。
4. 回歸測試、合成結果和 Pillow 參考圖逐像素比對、截圖、記憶體量測。約 2–3 小時。
