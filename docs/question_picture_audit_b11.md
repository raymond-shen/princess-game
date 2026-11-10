# 第十一批：題目圖片與語音逐詞稽核

## 根因與修正

- 不是索引錯位／全站預設天鵝：`data/vocab.json` 的 82 個 `pic` 全是手配 emoji，含章節聯想、動作物件、抽象裝飾；原 `Battle.buildQ()` 不經語義或 owner 驗證就直接使用 `w.pic`／`pw.pic`。
- 29_02／29_05 的詞其實是 **五隻（ㄨˇ ㄓ）**，原欄位只有單一 🦢；聲音路由是 TTS「五隻」，並非「天鵝」音檔。另「鵝」原用 Unicode SWAN，也列物種不精確，沒有默認放行。
- 新 `data/question_pictures_b11.json` 逐詞保守審核。22 詞可用直接對應的系統 emoji（不是 Lily 已交專圖）；20 詞明確不符、40 詞只是聯想／裝飾，一律不當作題目圖。大小形容詞的常見具體名詞可暫以該物體表示；數量／動作／親屬關係／方向不能靠聯想猜。
- 無核對圖：hear／drag 顯示較大的詞語與注音，不顯示圖片、空框、問號圖或別詞替代圖；pic2spell／spell2pic 的選題池排除該詞。149 個原學習目標／舊 Leitner ID 全數保留。
- 所有主圖 `pictureWordId == question.word.id`；選圖題每個選項 `pictureWordId == option.wordId`，正解再等於題目 word.id。干擾圖必須也通過審核，且三圖 glyph 互異；不把所有干擾選項錯誤地標成主詞。
- Lily hints_v2 仍只是明標「怎麼玩（示意）」的教學圖，不計入題目的主圖／答案圖；語音仍先指令後完整詞語，可按大聲音鍵重聽。
- 圖目錄缺失／owner 不同時 fail-closed：停用圖題，退 hear；沒有舊 `vocab.pic` fallback。家長錯詞列表也不再顯示不符圖示。

## 數量（以詞為單位，另列音節／題型）

| 階段 | 總詞 | 可用對應圖 | 明確錯配 | 裝飾代理 | 無可用專圖 |
|---|---:|---:|---:|---:|---:|
| 原資料 | 82 | 22 | 20 | 40 | 60（前兩類合計；原始 pic 空值為 0） |
| 修後顯示 | 82 | 22 | 0 | 0 | 60（不顯示圖） |

- 149 個可出題音節 × 原 4 題型 = **596** 組，已逐組稽核。44 個有圖音節可用四型；另 105 個只用 hear／drag。修後 **386** 組可出題、**210** 組無圖選圖型停用。
- 完整 596 列（包含每個 target 字／音節、原圖、理由、型別、音檔路徑／TTS 文字、時間區間）：`question_picture_audit_b11_items.csv`。

## 語音核對與限制

- **獨立官方詞目核對39/39**：唯讀原下載 `/tmp/moe/dict_concised_2014_20260929.xlsx`（45,178筆），以「字詞號」對MOE音檔ID；39個詞名與完整注音皆逐一吻合，包含多音字正確詞號。39列證據與原xlsx SHA256見 `question_audio_identity_b11.json`，沒有只相信遊戲自己標的檔名。原下載未修改。
- 39 個 MOE 詞：檔案存在、對應 word ID 的路由、來源／修復後 SHA256、播放 start/end 均核對；未改任何 PCM、音檔或時間範圍。先前全39實際瀏覽器解碼與runtime40嚴格格式測試仍保留。
- 另 43 詞沒有固定錄音，`speechSynthesis` 呼叫文字逐詞等於 word.word，不會拿圖片名稱念；zh-TW 聲音、聲調與多音字最終仍需真 iPad 聽驗。
- 額外以本機 base ASR、**不提示正解**，轉寫遊戲真正播放的切片；不確定者再看整段來源音檔上下文。ASR 尤其不擅長 0.5 秒單字／同音字，不能把未識別當成錯音，也不能聲稱做過真人聽音。模型／轉寫僅在 ignored tests_p0，沒有送音檔到外站，沒有把模型加入遊戲。
- ASR 機器覆核：39/39；切片文字同音推測相符 17，其餘保留人工聽驗標記。沒有只因檔案能解碼便聲稱語音語義正確；**不宣稱所有詞的實際發音已人工驗證**。
- ASR 尚不能確定的22詞：鵝、笑嘻嘻、賽跑、拔、狂歡、跑、半路、築巢、忙、書包、歡喜、教、落後、追、慶祝、馴鹿、去、午覺、快、敲、滾、變。這些是待核對標記，不是已證實錯音；43個裝置TTS的多音字／聲調也待真機。

## Lily 補圖清單與排序

- `question_picture_art_needed_b11.csv`：60 詞，UTF-8 BOM，欄位「詞語、注音、需補圖題型、題庫出現頻次」。優先補 pic2spell／spell2pic；完成後同圖也可用在 hear／drag。
- 「頻次」明確採 **可出題音節數 × 原四題型** 的題庫靜態出現數，遞減排序，同分依課別／詞 ID；高高低低、上上下下優先。沒有玩家遙測／Raymond 裝置紀錄，隨機／Leitner 實際出現次數未知，不偽造使用頻率。
- Lily 交正確圖後只需在圖登錄表填對應 wordId、資產／審核狀態（目前支援 glyph；若交 PNG/WebP 則需另加圖片 texture 載入），不可只把舊 emoji 改成 matched。這批沒有製作或修改 Lily 原圖。

## 逐詞結果（全部 82 詞）

| 詞語／ID | 注音 | 目標音節 | 原圖 → 修後 | 判定／原因 | 聲音與區間／文字 | 語音覆核 |
|---|---|---|---|---|---|---|
| 貓咪 | ㄇㄠ ㄇㄧ | 1,2 | 🐱 → 🐱 | matched：貓臉直接對應貓咪 | TTS（zh-TW） `speechSynthesis: 貓咪` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 鵝 | ㄜˊ | 1 | 🦢 → 不顯示 | mismatched：🦢 是天鵝（swan），不能當作家鵝的專屬圖 | MOE `assets/audio/words/moe_word_5726.wav [0.00–0.53s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音 |
| 寶寶 | ㄅㄠˇ ㄅㄠ˙ | 1 | 👶 → 👶 | matched：嬰兒直接對應寶寶 | TTS（zh-TW） `speechSynthesis: 寶寶` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 河馬 | ㄏㄜˊ ㄇㄚˇ | 1,2 | 🦛 → 🦛 | matched：河馬 | TTS（zh-TW） `speechSynthesis: 河馬` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 河狸 | ㄏㄜˊ ㄌㄧˊ | 1,2 | 🦫 → 🦫 | matched：河狸 | TTS（zh-TW） `speechSynthesis: 河狸` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 笑嘻嘻 | ㄒㄧㄠˋ ㄒㄧ ㄒㄧ | 1,2,3 | 😄 → 😄 | matched：微笑露齒臉直接呈現笑嘻嘻 | MOE `assets/audio/words/moe_www_397400010.wav [0.00–1.03s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音 |
| 翹翹板 | ㄑㄧㄠˋ ㄑㄧㄠˋ ㄅㄢˇ | 1,2,3 | 🛝 → 不顯示 | mismatched：🛝 是溜滑梯，不是翹翹板 | TTS（zh-TW） `speechSynthesis: 翹翹板` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 老師 | ㄌㄠˇ ㄕ | 1,2 | 🧑‍🏫 → 🧑‍🏫 | matched：教師形象 | MOE `assets/audio/words/moe_www_179200095.wav [0.00–0.99s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；切片 ASR 音近相符（非人工／聲調驗證） |
| 小紅花 | ㄒㄧㄠˇ ㄏㄨㄥˊ ㄏㄨㄚ | 1,2,3 | 🌺 → 🌺 | matched：紅色花朵 | TTS（zh-TW） `speechSynthesis: 小紅花` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 一朵 | ㄧˋ ㄉㄨㄛˇ | 2 | 🌸 → 不顯示 | mismatched：單一花朵沒有明確量詞／計數情境，不能等同「一朵」 | TTS（zh-TW） `speechSynthesis: 一朵` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 送 | ㄙㄨㄥˋ | 1 | 🎁 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_word_5706.wav [0.00–0.71s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；切片 ASR 音近相符（非人工／聲調驗證） |
| 烏龜 | ㄨ ㄍㄨㄟ | 1,2 | 🐢 → 🐢 | matched：烏龜 | TTS（zh-TW） `speechSynthesis: 烏龜` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 賽跑 | ㄙㄞˋ ㄆㄠˇ | 1,2 | 🏃 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_www_560200001.wav [0.03–1.43s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音 |
| 拔 | ㄅㄚˊ | 1 | 🥕 → 不顯示 | mismatched：🥕 只有胡蘿蔔，未呈現「拔」的動作 | MOE `assets/audio/words/moe_word_0012.wav [0.00–0.57s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音 |
| 大象 | ㄉㄚˋ ㄒㄧㄤˋ | 1,2 | 🐘 → 🐘 | matched：大象 | MOE `assets/audio/words/moe_www_101500324.wav [0.00–0.85s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；切片 ASR 音近相符（非人工／聲調驗證） |
| 黃牛 | ㄏㄨㄤˊ ㄋㄧㄡˊ | 1,2 | 🐂 → 不顯示 | mismatched：🐂 公牛圖未明確表達黃牛物種／顏色 | TTS（zh-TW） `speechSynthesis: 黃牛` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 浣熊 | ㄏㄨㄢˋ ㄒㄩㄥˊ | 1,2 | 🦝 → 🦝 | matched：浣熊 | TTS（zh-TW） `speechSynthesis: 浣熊` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 兔子 | ㄊㄨˋ ㄗ˙ | 1 | 🐰 → 🐰 | matched：兔子 | TTS（zh-TW） `speechSynthesis: 兔子` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 菜園 | ㄘㄞˋ ㄩㄢˊ | 1,2 | 🥬 → 不顯示 | mismatched：🥬 是葉菜，不是菜園 | TTS（zh-TW） `speechSynthesis: 菜園` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 動物 | ㄉㄨㄥˋ ㄨˋ | 1,2 | 🐾 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_www_131600050.wav [0.00–0.81s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；切片 ASR 音近相符（非人工／聲調驗證） |
| 狂歡 | ㄎㄨㄤˊ ㄏㄨㄢ | 1,2 | 🎉 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_www_265400007.wav [0.00–1.01s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音 |
| 弟弟 | ㄉㄧˋ ㄉㄧ˙ | 1 | 👦 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_www_114800003.wav [0.00–0.57s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；切片 ASR 音近相符（非人工／聲調驗證） |
| 第一 | ㄉㄧˋ ㄧ | 1,2 | 🥇 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_www_115000011.wav [0.00–0.83s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；切片 ASR 音近相符（非人工／聲調驗證） |
| 跑 | ㄆㄠˇ | 1 | 🏃 → 🏃 | matched：奔跑中的人 | MOE `assets/audio/words/moe_word_0353.wav [0.00–0.67s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音 |
| 媽媽 | ㄇㄚ ㄇㄚ˙ | 1 | 👩 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | TTS（zh-TW） `speechSynthesis: 媽媽` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 得意 | ㄉㄜˊ ㄧˋ | 1,2 | 😊 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | TTS（zh-TW） `speechSynthesis: 得意` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 孵出 | ㄈㄨ ㄔㄨ | 1,2 | 🐣 → 🐣 | matched：小雞破殼孵出 | TTS（zh-TW） `speechSynthesis: 孵出` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 五隻 | ㄨˇ ㄓ | 1,2 | 🦢 → 不顯示 | mismatched：🦢 只有一隻天鵝，與「五隻」數量不符 | TTS（zh-TW） `speechSynthesis: 五隻` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 泡澡 | ㄆㄠˋ ㄗㄠˇ | 1,2 | 🛁 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | TTS（zh-TW） `speechSynthesis: 泡澡` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 半路 | ㄅㄢˋ ㄌㄨˋ | 1,2 | 🛤️ → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_www_012400010.wav [0.00–0.67s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音 |
| 遇到 | ㄩˋ ㄉㄠˋ | 1,2 | 🤝 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_www_650000001.wav [0.00–0.85s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；切片 ASR 音近相符（非人工／聲調驗證） |
| 築巢 | ㄓㄨˊ ㄔㄠˊ | 1,2 | 🪹 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_www_451300003.wav [0.00–0.81s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音 |
| 忙 | ㄇㄤˊ | 1 | 🛠️ → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_word_0666.wav [0.00–0.53s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音 |
| 書包 | ㄕㄨ ㄅㄠ | 1,2 | 🎒 → 🎒 | matched：背包形書包 | MOE `assets/audio/words/moe_www_511200001.wav [0.00–0.99s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音 |
| 手拉手 | ㄕㄡˇ ㄌㄚ ㄕㄡˇ | 1,2,3 | 🤝 → 不顯示 | mismatched：🤝 是握手，不是手拉手同行 | TTS（zh-TW） `speechSynthesis: 手拉手` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 歡喜 | ㄏㄨㄢ ㄒㄧˇ | 1,2 | 😊 → 😊 | matched：喜悅笑臉 | MOE `assets/audio/words/moe_www_292500007.wav [0.00–1.09s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音 |
| 好朋友 | ㄏㄠˇ ㄆㄥˊ ㄧㄡˇ | 1,2,3 | 👭 → 不顯示 | mismatched：👭 兩人牽手不保證是好朋友關係 | TTS（zh-TW） `speechSynthesis: 好朋友` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 一起 | ㄧˋ ㄑㄧˇ | 2 | 👭 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | TTS（zh-TW） `speechSynthesis: 一起` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 上上下下 | ㄕㄤˋ ㄕㄤˋ ㄒㄧㄚˋ ㄒㄧㄚˋ | 1,2,3,4 | ↕️ → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_www_508000065.wav [0.00–1.57s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；切片 ASR 音近相符（非人工／聲調驗證） |
| 高高低低 | ㄍㄠ ㄍㄠ ㄉㄧ ㄉㄧ | 1,2,3,4 | 📊 → 不顯示 | mismatched：📊 是圖表，未清楚呈現高低比較 | TTS（zh-TW） `speechSynthesis: 高高低低` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 小鳥 | ㄒㄧㄠˇ ㄋㄧㄠˇ | 1,2 | 🐦 → 🐦 | matched：小鳥 | TTS（zh-TW） `speechSynthesis: 小鳥` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 飛 | ㄈㄟ | 1 | 🪽 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_word_0824.wav [0.00–0.59s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；切片 ASR 音近相符（非人工／聲調驗證） |
| 謝謝 | ㄒㄧㄝˋ ㄒㄧㄝ˙ | 1 | 🙏 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | TTS（zh-TW） `speechSynthesis: 謝謝` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 讀書 | ㄉㄨˊ ㄕㄨ | 1,2 | 📚 → 不顯示 | mismatched：📚 只有書本，未呈現閱讀動作 | MOE `assets/audio/words/moe_www_124100007.wav [0.00–0.77s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；切片 ASR 音近相符（非人工／聲調驗證） |
| 畫畫 | ㄏㄨㄚˋ ㄏㄨㄚˋ | 1,2 | 🎨 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | TTS（zh-TW） `speechSynthesis: 畫畫` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 教 | ㄐㄧㄠ | 1 | 🧑‍🏫 → 不顯示 | mismatched：🧑‍🏫 是老師職業圖，未清楚呈現教學動作 | MOE `assets/audio/words/moe_word_3194.wav [0.00–0.59s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音 |
| 比賽 | ㄅㄧˇ ㄙㄞˋ | 1,2 | 🏁 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | TTS（zh-TW） `speechSynthesis: 比賽` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 領先 | ㄌㄧㄥˇ ㄒㄧㄢ | 1,2 | 🥇 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | TTS（zh-TW） `speechSynthesis: 領先` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 落後 | ㄌㄨㄛˋ ㄏㄡˋ | 1,2 | 🏃 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_www_212800020.wav [0.00–0.85s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音 |
| 氣餒 | ㄑㄧˋ ㄋㄟˇ | 1,2 | 😞 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | TTS（zh-TW） `speechSynthesis: 氣餒` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 後面 | ㄏㄡˋ ㄇㄧㄢˋ | 1,2 | ⬅️ → 不顯示 | mismatched：⬅️ 是向左，不是物體後面 | TTS（zh-TW） `speechSynthesis: 後面` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 追 | ㄓㄨㄟ | 1 | 🏃 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_word_4567.wav [0.00–0.63s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音 |
| 蘿蔔 | ㄌㄨㄛˊ ㄅㄛ˙ | 1 | 🥕 → 不顯示 | mismatched：🥕 是胡蘿蔔，不可擅自作白蘿蔔／蘿蔔詞目的專圖 | TTS（zh-TW） `speechSynthesis: 蘿蔔` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 拉著 | ㄌㄚ ㄓㄜ˙ | 1 | 🤝 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | TTS（zh-TW） `speechSynthesis: 拉著` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 嘿唷 | ㄏㄟ ㄧㄛ | 1,2 | 💪 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | TTS（zh-TW） `speechSynthesis: 嘿唷` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 山崖 | ㄕㄢ ㄧㄞˊ | 1,2 | ⛰️ → 不顯示 | mismatched：⛰️ 是山峰，不是懸崖 | MOE `assets/audio/words/moe_www_501500051.wav [0.00–0.97s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；切片 ASR 音近相符（非人工／聲調驗證） |
| 開心 | ㄎㄞ ㄒㄧㄣ | 1,2 | 😊 → 😊 | matched：開心笑臉 | MOE `assets/audio/words/moe_www_252100069.wav [0.00–0.91s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；切片 ASR 音近相符（非人工／聲調驗證） |
| 慶祝 | ㄑㄧㄥˋ ㄓㄨˋ | 1,2 | 🎉 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_www_374300005.wav [0.00–1.25s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音 |
| 小熊 | ㄒㄧㄠˇ ㄒㄩㄥˊ | 1,2 | 🐻 → 🐻 | matched：熊臉 | TTS（zh-TW） `speechSynthesis: 小熊` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 大球 | ㄉㄚˋ ㄑㄧㄡˊ | 1,2 | ⚽ → ⚽ | matched：球 | TTS（zh-TW） `speechSynthesis: 大球` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 馴鹿 | ㄒㄩㄣˊ ㄌㄨˋ | 1,2 | 🦌 → 不顯示 | mismatched：🦌 是泛稱鹿，沒有馴鹿特徵 | MOE `assets/audio/words/moe_www_419500002.wav [0.00–0.75s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音 |
| 大鼓 | ㄉㄚˋ ㄍㄨˇ | 1,2 | 🥁 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_www_101500195.wav [0.00–0.95s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；切片 ASR 音近相符（非人工／聲調驗證） |
| 孔雀 | ㄎㄨㄥˇ ㄑㄩㄝˋ | 1,2 | 🦚 → 🦚 | matched：孔雀 | TTS（zh-TW） `speechSynthesis: 孔雀` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 魔術 | ㄇㄛˊ ㄕㄨˋ | 1,2 | 🪄 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | TTS（zh-TW） `speechSynthesis: 魔術` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 青蛙 | ㄑㄧㄥ ㄨㄚ | 1,2 | 🐸 → 🐸 | matched：青蛙 | MOE `assets/audio/words/moe_www_372600026.wav [0.00–0.79s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；切片 ASR 音近相符（非人工／聲調驗證） |
| 合唱 | ㄏㄜˊ ㄔㄤˋ | 1,2 | 🎶 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | TTS（zh-TW） `speechSynthesis: 合唱` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 嗶 | ㄅㄧ | 1 | 📣 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | TTS（zh-TW） `speechSynthesis: 嗶` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 去 | ㄑㄩˋ | 1 | 🚶 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_word_3770.wav [0.00–0.55s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音 |
| 忙著 | ㄇㄤˊ ㄓㄜ˙ | 1 | 🛠️ → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | TTS（zh-TW） `speechSynthesis: 忙著` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 背著 | ㄅㄟ ㄓㄜ˙ | 1 | 🎒 → 不顯示 | mismatched：🎒 是書包，沒有背著的動作與人物 | TTS（zh-TW） `speechSynthesis: 背著` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 好像 | ㄏㄠˇ ㄒㄧㄤˋ | 1,2 | 💭 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_www_272700015.wav [0.09–0.97s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；切片 ASR 音近相符（非人工／聲調驗證） |
| 午覺 | ㄨˇ ㄐㄧㄠˋ | 1,2 | 😴 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_www_624700002.wav [0.00–0.87s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音 |
| 跟在 | ㄍㄣ ㄗㄞˋ | 1,2 | 🚶 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | TTS（zh-TW） `speechSynthesis: 跟在` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 快 | ㄎㄨㄞˋ | 1 | 💨 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_word_2598.wav [0.00–0.51s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音 |
| 哈哈笑 | ㄏㄚ ㄏㄚ ㄒㄧㄠˋ | 1,2,3 | 😄 → 😄 | matched：露齒笑臉呈現笑 | TTS（zh-TW） `speechSynthesis: 哈哈笑` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 用力 | ㄩㄥˋ ㄌㄧˋ | 1,2 | 💪 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_www_661700005.wav [0.00–0.79s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；切片 ASR 音近相符（非人工／聲調驗證） |
| 長出 | ㄓㄤˇ ㄔㄨ | 1,2 | 🌱 → 不顯示 | mismatched：🌱 是幼苗，沒有表達由無到有長出的過程 | TTS（zh-TW） `speechSynthesis: 長出` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 表演 | ㄅㄧㄠˇ ㄧㄢˇ | 1,2 | 🎭 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | TTS（zh-TW） `speechSynthesis: 表演` | 文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗 |
| 精采 | ㄐㄧㄥ ㄘㄞˇ | 1,2 | ✨ → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_www_337700038.wav [0.00–0.67s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；切片 ASR 音近相符（非人工／聲調驗證） |
| 敲 | ㄑㄧㄠ | 1 | 🥁 → 不顯示 | mismatched：🥁 只有鼓，沒有敲擊動作 | MOE `assets/audio/words/moe_word_3606.wav [0.00–0.71s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音 |
| 滾 | ㄍㄨㄣˇ | 1 | ⚽ → 不顯示 | mismatched：⚽ 只有球，沒有滾動動作 | MOE `assets/audio/words/moe_word_2458.wav [0.00–0.57s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音 |
| 變 | ㄅㄧㄢˋ | 1 | 🪄 → 不顯示 | decorative：章節聯想／泛用情境符號，不能單憑此圖辨識完整詞義；未核准當作本詞專圖 | MOE `assets/audio/words/moe_word_0250.wav [0.00–0.49s]` | 來源metadata／修復後 SHA、路由詞 ID 與範圍相符；短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音 |

## 測試與畫面

- `tests_p0/b11_picture_playtest.py` 逐一實際建出596組問答，檢查264個顯示圖物件 owner/glyph、無圖大字、圖題選題池、所有82詞音訊路由；另偽造錯 owner 與缺目錄均不得露出替代圖。
- 完整結果以 `tests_p0/b11_preflight_result.json` 與 CHANGES_P0 第十一批最新紀錄為準。
- 重拍 `29_02_question_hear.png`（五隻第1音）、`29_05_question_drag.png`（五隻第2音），均不再出現天鵝；`29_03_question_pic2spell.png`（貓咪）、`29_04_question_spell2pic.png`（青蛙）為有圖的正例。09–12按下／選定狀態也重拍。
- 僅副本，無commit／push／deploy；HEAD仍d7d14e2，push URL no_push。
