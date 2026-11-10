# 新增音樂／音效：原創程序合成，CC0 1.0

本專案新增的 16 秒循環背景旋律、按鍵／答對／答錯／攻擊／命中／寶物短音效，以及 `assets/audio/generated/silence.wav`，均由本批程式原創合成，未取樣任何錄音，未引用既有歌曲。這些產生的音訊以 CC0 1.0 公眾領域貢獻宣告釋出，可免權利金使用，無第三方署名要求。

- 產生器／樂譜：`js/audio.js`（五聲音階，低音量柔和 sine；非第三方素材包）
- 靜音 WAV：PCM mono 8kHz、0.1 秒，1,644 bytes，只供手勢內 HTMLAudio 解鎖。
- 背景音樂與 SFX 不額外下載音檔；16 秒 mono 22,050Hz buffer 約 1.41MB RAM，不是網路素材量。
- CC0 1.0：https://creativecommons.org/publicdomain/zero/1.0/

本宣告只涵蓋本批原創程序音訊，不改變教育部原音、Lily 美術、遊戲或其他函式庫授權。既有 39 份教育部 WAV 共 27,947,818 bytes，保持原音 PCM 與 CC BY-ND 3.0 TW 署名，不剪輯／重編碼；副本13檔經核准僅校正RIFF長度欄，原始下載與PCM雜湊留存，詳 docs/audio_wav_header_repair_b11.md。新增音樂／SFX 網路音訊只有 1,644 bytes，低於 2MB；不將既有教育部原音謊稱也低於 2MB。
