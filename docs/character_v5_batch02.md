# Wearables batch 2 / v5 接入備註

## 範圍與匯入
- 只修改 P0 副本；以 `HANDOFF_BATCH02.md` 為準，來源 manifest／素材只讀。`productionReady=false`、`runtimeUseAllowed=false` 保持原值，沒有 commit／push／deploy 或線上網址。
- `tools/import_character_v5.py` 生成 `data/character_runtime_v5.json`，Boot 改讀 v5；保留舊 v3/v4 檔作歷史證據。
- 207 個 asset id（206 個唯一 full/half 圖檔對），連同 256/128 PNG/WebP 縮圖和三個新版圖鑑 icon，共複製 1006 檔、43,766,315 bytes 至 `assets/art/princess/v5/`。half 圖層按唯一檔案合計 3,806,714 bytes。
- 匯入器用來源路徑去重；B4 right alias 不會重包同一張袖片。所有圖檔先比對來源 SHA，保留相對路徑，full PNG 只供 WebP 不支援／失敗時按需載入，不載 full WebP、work 或 rejected prototypes。

## B4 右手與 pose 完整性
- 直接讀 `poses.grip_screen_right.outfitReplacements.B4.outfit_B4_front=outfit_B4_front_grip_screen_right_cuffV2`，解除上一批的 B4 right 缺件阻擋。
- 此 id 是 Lily 明確交付的 `aliasOf=outfit_B4_front_grip_screen_left_cuffV2`，PNG SHA `31a000617d8705c45ce55fb140a8257d48dbcfda387b0f0d92262ce438cbafe4`；重用來源 cuffV2 是規格，不是退回原 B4 sleeve。組裝 ids 保留 right id，原 `outfit_B4_front` 不出現。
- 劍／弓／杖仍強制對應握持 pose，整組替換 body、arm_front、outfit mapping；grip 全畫布對齊規則不變，右手仍須先自行關盾。
- 新增 manifest 的 48 格 pose×outfit 覆蓋檢查：非空 replacement 與非空 noOutfitReplacementRequired 理由必須恰好擇一。匯入、驗證器與 runtime 都會拒絕缺漏／兩者並存。neutral 用 12 個明確理由，不靠隱含特例。

## 項鍊／髮上蝴蝶結
- 角色穿戴狀態沿用 `equipped`（necklace、bow），新存檔兩者預設關閉。項鍊 slot=neck_accessory、drawOrder68/tieRank0，髮上 bow slot=bow_accessory、drawOrder100；與武器 bow85 完全分開，也不與 headwear 單槽互斥。
- 項鍊先查 `exclusiveWithOutfits`，B5/B6/B8 回傳 manifest 原因；其餘9套取 `assetsByOutfit`。不猜項鍊位置，不移掉服裝固有領扣。
- bow 先取 `assetsByHairStyle`，有 `headwearVariantsByHair[hair][headwear]` 時才改位置。A4+B7/B8 各用專用 bow；此表與 hairPairs.hatVariants 分開解析，原髮型／帽髮變體、A1 compact花冠、A6無髮帶規則均不受破壞。
- 沒有為飾品套髮色 tint；tiara／花圈／兩頂帽可與 bow 同時使用。翅膀及星星披風仍是 wornLayer:false 佔位。
- 選單新增獨立飾品頁，使用 Lily 的實際位置縮圖；未收集鎖定，項鍊互斥時按鈕灰化並顯示原文理由。已戴項鍊時切到 B5/B6/B8 會拒絕服裝變更，要求先取下，不能悄悄關掉項鍊。
- `Char.wear` 是共用驗證入口：換裝、Home 與戰鬥掉寶的穿戴按鈕都顯示拒絕理由，不會誤稱已穿上。關閉飾品可直接操作，便於修正舊的違規配置。
- 圖鑑／卡片改用本批 necklace／bow icon，加上第一批 tiara icon；原 extras_v001 圖示未動。

## 舊存檔與效能
- wardrobeVersion5，首次轉換前完整備份 `kx_save_v2_before_wardrobe5`。保留舊的 outfit/hair alias 遷移及原先「已戴」意圖，進度、星星、寶石不變；不是把每份舊存檔強制切成預設關閉。
- 若舊檔曾把項鍊佔位戴在 B5/B6/B8，不刪穿戴狀態或進度；解析器明確回傳 issues，顯示安全 neutral 預覽及衝突文字，Creator 禁止確認，須取下或換成合法配置。不是靜默漏畫。
- 快取 key 納入 issues，避免非法組合與合法 neutral 預覽共用錯誤狀態。仍是按需合成一張500×550 texture，分層解碼後釋放，LRU最多8張。
- `KXZ2` 存檔外框與壓縮器不變；新寶物沿用 equipped id，舊碼可讀，匯入確認與覆蓋前備份不變。

## 自動驗收
- `tests_p0/validate_character_v5.py`：207 id／414層雜湊、1283相對path、full/half尺寸、48格pose coverage、4個缺漏／空白／矛盾負例、B4 right alias去重、9項鍊／6+2 bow位置、來源未改與旗標false。
- `tests_p0/p0f_v5_playtest.py`：B4三武器右手、9套項鍊及3互斥UI、6髮型bow、A4兩帽位置、tiara/花圈共存、換裝/Home/掉寶拒絕、舊檔、7200合法registry組合、B4 right90組、一般／149筆大碼OpenCV、90次實際合成壓測、PNG fallback及JS錯誤。
- 截圖 `shots_p0/22_01`–`22_28`：三個B4右手、9項鍊、3互斥、6髮型bow、A4 B7/B8/tiara/花圈、圖鑑、存檔卡、大QR。
- 實機 iPad Safari 尚未測試；目前是 headless Chrome＋觸控／iPad UA。Lily 已列出的細鍊對比、粉髮粉bow及腕根放大polish限制保留。

## 請Lily確認（非本次接入阻擋）
- B4關盾後仍有橢圓金邊／透明孔輪廓，定位在來源outfit_B4_back；Lily自己的B4右握預覽亦有。prop_B4_heart_shield未載入，沒有擅改來源或複製層的像素，請Lily確認是否清理背層殘留盾形輪廓。
- 合法B3/B4左手武器+盾+頭飾+necklace+bow+expression實際14層，較HANDOFF的最多13層多一層。half分層暫態RGBA理論15.4MB；合成後單張1.1MB，GPU雙份另計。請調整交接記憶體估算。

### 最終實測結果
- 26項主驗收斷言全過，7200合法registry組合、B4右手90組無違規；另check_v5_edges.py的8項邊界檢查（含實際頭飾切換、中文理由範圍、40次快速refresh）全過。
- 一般完整配飾碼578字：卡片小QR直接解碼=False，放大後=True；149筆大碼2854字，小於2950上限，放大OpenCV解碼一致，角色／穿戴完整還原。
- 小QR格子太密時保留既有「點QR放大」提示／入口；一般完整配飾碼亦可能需要放大，不宣稱236px小卡在所有內容下皆可直接掃。額外截圖22_27b_normal_QR_enlarged.png，總共29張22_*證據。
- 90次實際合成：快取峰值8、結束refs/liveDecoded/sources全0；主驗收JavaScript及console errors均為空，既有回歸亦無JavaScript例外。
- v5來源manifest SHA-256：473cb2ae86236c6574fbf54ea39bd81838c0c274d636292ffbdf286d4365ae37（驗證未改）。
