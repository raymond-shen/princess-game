# Wearables batch 1 / v4 接入備註

## 範圍
只整合至 P0 副本。`productionReady`、`runtimeUseAllowed` 保留 false；Lily 的 manifest／圖檔完全只讀。以 `HANDOFF_BATCH01.md` 為準，沒有套用舊 v3 假定的「武器加握點位移」。

## 匯入與入口
`python3 tools/import_character_v4.py`
- 入口來源是 `production_wearables_01/character_complete_manifest_v4.json`（sha256 `b261fae7…18a35`）。
- 複製 manifest 參照的 189 個 half WebP 和 full PNG 備援，以及 256/128 縮圖、tiara icon，至 `assets/art/princess/v4/`。不讀／複製 work 或 rejected_prototypes。
- 產生 `data/character_runtime_v4.json`，Boot 已切換；`Char.v3` 這個舊 JS 變數名暫時保留給其他場景相容，但內容已是 v4。
- `data/assets_manifest.json` 的 treasure_crown 改指向本批 `icons/treasure_crown.png` 副本，sha256 `b3aa467a…8ae87`。圖鑑及存檔卡底列共用此來源，不再載舊高金冠。
- 選單的服裝縮圖優先 `thumbV4`。戴 crown／flower_crown 時，髮型分頁優先用 `batch01Thumbnails.hairHeadwear`。

## 解析順序
1. 頭飾用玩家的選項 key，null 明確表示不戴，缺省才採服裝預設帽。
2. 先按選項 key 找 hairPairs 的 hatVariant，再以 `headwear_asset || headwear[key].asset || key` 找實際頭飾圖。A1 花圈用 compact 小花冠、保留原髮；A6 花圈改用去髮帶的 B7 變體。tiara 直接用原髮。
3. 武器由 `weaponId`（單槽）指定；缺省才讀 weaponDefaultsByOutfit，null 明確表示不拿。手由 weaponHand 或 defaultHand 決定。
4. 有武器就使用 requiresPoseByHand；沒有武器時可選 poseId，預設 neutral。fists_both 的 defaultExpression 是 expr_cheer，明確 expression:null 可以關閉。
5. **requiredAlways 先整組套 replaceAssets**，body 與 arm_front 同時替代；outfits.parts 再整組套 outfitReplacements。原開掌身體／前臂／袖片不會一起留在 ids。
6. 使用 layersByHand 的武器圖層（85），每張是完整 1000×1100、offset0，直接疊，**不再額外加上 grip 座標，也不重新套 sourceGrip／旋轉縮放**。資料的 grip point 是 left (344,582)、right (651,582)；舊 hand_center 是量測值，不再拿來當新握柄點。
7. 表情 70 → 瀏海 75 → 頭飾 80 → 武器 85 → 握拳前臂 90 → 袖／盾 92。按 drawOrder、tieRank、id 防禦性第三鍵排序。
8. deprecated 的腰側 toy_sword 不再來自 defaultAccessories。B1 固定依 v4 parts 選 safeV4 main/front，握拳亦選 safeV4 cuff，未回退到原有 151px 安全衣例外。

## 排除規則及缺件
- v4 的右手武器／盾互斥目前只寫在 slotRules／resolveRules 與 HANDOFF 的文字中，沒有獨立結構化排除表。
- 匯入器將這條已明訂的規則轉成 runtime `assemblyConstraints`（註明來源 §3），renderer／UI 都讀該資料，根據 asset.slot==='shield' 判斷，不限於某一武器或某一盾 id。
- 選右手時如盾仍開啟，**拒絕新選擇、保留原先的左手與盾，並顯示中文原因**；不暗自關盾。玩家自己關盾後可以選右手；在右手狀態重新打開盾也會被拒絕。
- 直接匯入不合法配置時，renderer 回安全 neutral 預覽而不疊出非法雙手；Creator 顯示問題，確認存檔按鈕會阻擋，請玩家修改。練習進度不受影響。
- **實際缺件：`poses.grip_screen_right.outfitReplacements.B4` 不存在，assets 也沒有 B4 right cuff。** 左手與雙拳都有 B4，右手只有 11 套。雖然 HANDOFF 說 12 套左右袖相容，此項缺件使「B4＋右手」目前保守拒絕，即使關盾也一樣；不能猜用左手袖片或帶回張開手。
- 請 Lily 確認 B4 右手是否可沿用原片（若可，請在 manifest 明確宣告），否則補對應 cuff／outfitReplacements。也建議後續提供結構化 exclusion 表，免去文字規則轉接。

## 遷移與佔位
- 新增一次完整備份 `kx_save_v2_before_wardrobe4`，保留 outfit/hair alias、進度、明確 headwear:null。
- 舊 v3 若把 prop_B3_toy_sword 關閉，映射成 weaponId:null；舊 heldItem toy sword 若有實際值則對應 sword。未指定新武器欄位的舊服裝採用 v4 的預設武器＋左手。
- 新欄位 weaponId／weaponHand／poseId 目前走存檔壓縮器「保留未知欄位」的通道，仍可完整 round-trip，舊 KXZ2／KX2- 仍可讀。
- 項鍊、髮飾蝴蝶結、翅膀、星星披風四件仍是 manifest 的 wornLayer:false，繼續原佔位，不把武器 bow 和髮飾 bow 混為同一槽。
- 原本 generic gameHooks 保留作相容性，但這版直接讀 Lily 已定名的 poses／weapons，不再使用空的假握持橋接。

## 驗證
`tests_p0/p0e_v4_playtest.py` 驗證六種武器／手、所有已宣告袖片對映、A1/A4/A6 頭飾、右手與盾的拒絕／自行關盾後啟用、B4 缺件拒絕、遷移、一般與 149 筆 QR、60 次換裝快取及 PNG fallback。
`tests_p0/validate_character_v4.py` 核對全部複製圖層 sha、尺寸、相對路徑、來源 manifest 未變、safeV4 與四件佔位。
既有 battle、jobs、album/parent gate/fallback、audio/import/QR 另重跑。實際 iPad Safari 仍未測。

### 本次結果
- 22 項斷言全過；60 次換裝峰值快取 8，結束 refs/liveDecoded/sources 都是 0；沒有 JS／console error。
- 一般碼 466 字、大碼 2788 字（149 筆），OpenCV 直接／放大均解碼一致，角色欄位完整還原。
- 來源 manifest 雜湊未變，189 層 378 圖層雜湊與 1101 個相對路徑檢查通過。四支既有回歸腳本重跑完成。
