# 第十三批 Part A：Raymond「看注音選圖」錯圖根因

時間：Raymond 2026-11-11 11:28（新加坡時間 UTC+8）於 iPad 玩正式網址 `raymond-shen.github.io/princess-game`。截圖：`feedback/raymond_1128_spell2pic_wuzhi.png`。同日另有 `feedback/raymond_1257_hear_swan.png`（12:57，「五隻」主圖仍是天鵝 emoji）。

## 證據

1. 截圖題目是「ㄨˇ ㄓ」（五隻）的看注音選圖，三個選項是天鵝、合掌、鼓的 emoji，沒有五隻小鴨，也沒有第 11 批以後應出現的說明文字、「怎麼玩」示意與「重聽」標籤。這是更早、直接使用 `vocab.pic` 裝飾 emoji 的版面，不是當天 07:48 SGT 上線的 4796fcb（第 11 批）應有的畫面。
2. 當天正式站 `index.html`、`js/learn.js`、`js/battle.js` 於 11:32 實抓（`tests_p0/b13_live_*`）：
   - 腳本路徑沒有 `?v=` 快取破壞參數。
   - GitHub Pages／Fastly 回覆 `Cache-Control: max-age=600`。
   - 第 11 批 `Learn.picture()` 只放行目錄中 `status=matched` 且帶 glyph 的 22 詞；「五隻」在 `question_pictures_b11.json` 是 `mismatched`（🦢 數量不符），照理不該出看注音選圖。
   - 因此截圖中的天鵝／合掌／鼓，不是第 11 批目錄誤放行，而是裝置仍在執行「把 `vocab.json` 的 pic 當題圖」的舊 JS。
3. 副本第 12 批已為「五隻」接上 `word_0028` 專圖，且不走 `vocab.pic`。該批尚未上線，所以即使 iPad 載到最新的 4796fcb，也還不會看到五隻小鴨；但也不該再看到天鵝。兩者同時出現，更能印證是舊快取。

## 修正（僅副本）

- 硬規則：題圖只接受目錄 `status=matched` 且 `wordId` 相符的 Lily 點陣圖，或那 22 個已審核 emoji；永不讀 `vocab.pic`，永不顯示 🦢 等錯配／裝飾符號。
- 全 596 種詞／音節×題型自動走訪，圖物件必須屬於該詞；「五隻」的看注音選圖正解必須是 `word_0028`。
- 所有 script／Phaser load／fetch／自行 `Image`／音效 UI 路徑加 `?v=b13-20261113`；開始畫面、地圖與左下角 HTML 標籤顯示同一版本號。
- 直向且寬度 < 700px 時顯示「把手機橫過來」；iPad 橫向不顯示。
