# POLISH01／v7 副本接入（第九批）

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
