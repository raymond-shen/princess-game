# Lily v3：P0 副本整合說明

只獲准本機 P0 副本測試；原始 `productionReady=false`、`runtimeUseAllowed=false` 兩個旗標保留。沒有更動 Lily 的任何檔案。

## 匯入
`python3 tools/import_character_v3.py`
- 讀 Lily 的 v3 manifest，核對 sha256，複製到 `assets/art/princess/v3/`。
- 123 個 runtime_50 WebP、256/128 PNG+WebP 縮圖；全尺寸 PNG 作為 fallback 包裝，但只在不支援 WebP／某層 WebP 載入失敗時才讀。
- 產生 `data/character_runtime_v3.json`。所有執行期網址都是 p0 相對路徑，沒有 `/workspace` 網址。
- 434 個檔案，約 18.1 MB；其中分層 WebP 合計 2.25 MB。不另複製 full WebP。

## 繪製與快取
- 使用 `requiredAlways`、`hairPairs`／`hatVariants`、`outfits.parts`、預設配件、headwear 單槽和 expression 單槽。
- `(drawOrder, tieRank, id)` 明確排序；目前沒有同組同值歧義，最後的 id 是防禦性第三鍵。
- 原點是 1000×1100 完整邏輯畫布，地面線 y=1030。讀 half 圖不會把錨點重複縮小；placeholder 位置都是 full 邏輯座標，合成時乘 0.5。
- 一次只載目前組合的分層；以 canvas 合成為一張 500×550 Phaser texture（包含表情和穿戴佔位圖）。分層 Image 解碼參照在合成後釋放。
- LRU 最多 8 張 composite（活躍引用不會被刪）。每張 RGBA canvas 理論 1.1 MB；canvas＋GPU upload 可能各佔一份，**不是宣稱整個遊戲只用 1.1 MB**。
- 選單只讀 Lily 縮圖，不載未裝備的全尺寸圖層。切換選項不會讓過時的非同步請求蓋過新選項。
- 真正的 WebP 圖片解碼能力偵測，不靠 UA。`?png=1` 是測試 PNG 備援用的開關。兩種格式都讀不到時用安全的公主 emoji，不會當機。

## 穿戴寶物的無程式碼接入
六件 `wornLayer:false` 留 emoji：皇冠／花圈在 headwear 單槽，項鍊 68、翅膀 10、星星披風 18、髮飾蝴蝶結 100。
下一版 manifest 若宣告 `wornLayer:true`，並提供 `layers`（或 `parts`／`assetId`）指向 `assets`，resolver 自動改畫那些層，不再畫 emoji。可選 `frontLayers` 用於披風扣等 68 前片。匯入腳本會複製 assets 的圖，不需改 resolver。

## 尚未交付的握持姿勢：空的 normalized bridge
Lily 的握拳手臂＋武器 spec 尚未命名。**沒有假造她的資產 id 或宣稱她已定義新欄位**；`gameHooks` 是這個遊戲轉接器自己的正規化資料，不是 Lily 的 schema。
目前 runtime manifest：
```
"gameHooks": {"heldItem": null, "exclusions": []}
```
所以角色沒有職業向量弓／劍／魔杖，也沒有自動握拳。B3 原本已交的玩具劍／盾仍依服裝預設配件顯示；不宣稱它有握姿。

等 Lily 給出真正的名稱後，匯入器將其映射為：
- `heldItem.gripAnchor`：引用已存在的單一 `anchorsPx` 錨點；
- `heldItem.items[實際武器id]`：`armReplacement`、`weaponLayers[]`，可選 `pose`、`handVariant`、`variants`、`originPx`；
- 握持有效時**移除正常 arm_front**，加入替代手臂，武器層附在共用握點；少資產／少握點就完全不啟動，不以假圖取代；
- `exclusions[]`：`when` 比對 outfit／hair／headwear／heldItem／pose／handVariant；`assets[]` 和 `treasures[]` 排除不相容的圖層／穿戴物。也可放在各武器的條目內。
- `character.heldItem`、`pose`／`handVariant` 只有資料實際提供時才使用，沒有先填一套未經 Lily 確認的 enum。

測試以**記憶體內**已存在的 id 注入一份假規則，驗證替代手臂、單一錨點附件、頭髮／服裝條件和寶物排除規則；沒有寫回 manifest 或 Lily 的檔案。請 Lily 提供正式欄位、替代手臂 id、握點名稱、武器圖層 id／origin 和互斥表後再接。

## 存檔與存檔卡
- 保持 v2 localStorage 與 KXZ2 格式；alias `hairStyleId/hairColorId/outfitId` → 既有 hair/hairColor/outfit。舊值先完整備份 `kx_save_v2_before_wardrobe3`，星星、寶石、練習不變。
- headwear 缺省＝服裝預設帽子；null＝明確不戴；id＝明確指定。皇冠／花圈單槽，舊寶物裝備會轉成對應 headwear。
- 新匯出把重複字詞分組，縮短角色欄位；保留舊 KXZ2（L.l）及 KX2 原始碼的讀取能力。時間沿用分鐘精度，並非新增損失。
- 存檔卡固定完整畫布高度 348.48、比例 0.3168、腳線對齊。戴 B7 不會重算 alphaBBox，不會把身體縮小；無帽時視覺約 90%。

## 驗證與待辦
`tests_p0/p0d_v3_playtest.py`（18 項明確斷言）、既有 battle/jobs/album/parent gate/fallback 回歸。
`shots_p0/20_*.png` 是這批截圖。實際 iPad Safari、GPU 記憶體和長時間換裝壓力測試仍需實機，這次只有 headless Chromium 的證據。
