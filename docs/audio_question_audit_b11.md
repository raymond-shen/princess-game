# 第十一批：聲音與題意稽核（2026-11-11，新加坡時間 UTC+8）

## 範圍
只更動 `/workspace/princess-game-p0/`，基準 d7d14e2；沒有 commit、push、部署／新公開測試網址；push URL 保持 `no_push`。未修改 Lily 源檔、原遊戲或 v1。

## 原版為什麼可能全靜音
1. **確定缺功能**：沒有任何背景音樂；原本有 pop/chime/soft/hit/fanfare 合成音效，但非所有互動控制都有按鍵音。
2. **確定的可靠性缺陷**：Phaser pointerdown 中另建自訂 AudioContext，與 Phaser 自己的 context 分開；`resume()` 不等待／不處理失敗，就直接標示 unlocked=true。沒有 HTMLAudio 手勢 priming、沒有依真實 running/interrupted 狀態恢復、語音 priming 為可能被忽略的空白 utterance；MOE 下載失敗會永遠快取 null。這些在 iOS 的手勢限制／切到背景後尤其脆弱。
3. **不能冒稱已還原 Raymond 裝置原因**：在公開 live d7d14e2 上以 Chromium 觸控測試，Phaser mute=false、volume=1；點開始時 userActivation=true，兩個 context 都 running，不能在這個瀏覽器重現全靜音。裝置靜音／音量／藍牙路由、Safari 的中斷或缺中文系統語音，仍需真 iPad 分辨。修正已處理程式端可確認的解鎖缺陷，而非宣稱一定是音檔壞掉。
4. **不是查到的 404 或 MIME 問題**：39 個線上 MOE 路徑全部一般 GET=200、`audio/wav`、RIFF/WAVE 正確（另有全部 range GET=206 與三個完整下載樣本）。原檔未轉檔或改動。證據：`tests_p0/b11_live_audio_http.json`、`b11_old_live_diagnosis.json`。

## 新音訊流程
- 原生 HTML「點我開始冒險」按鈕在同一次 click/touchend 的同步路徑呼叫 Phaser unlock、共用 AudioContext.resume、非空白靜音 speechSynthesis 與 silent HTMLAudio.play；只有實際 state=running 才算成功。
- 手勢後啟動 16 秒柔和循環旋律，題目播音時自動降低音樂音量。瀏覽器**不能保證未點一下就開站有聲**，不繞過 Safari 政策。
- 所有 Phaser 互動物件／原生按鈕的 tap，及答對、答錯、攻擊、命中、取得寶物音效；不改戰鬥／學習規則。
- 右上角聲音設定：音樂／音效分開開關並保存 `kx_audio_settings_v1`；音效關不會關掉教學語音。可測試語音／重啟通道；背景暫停，回前景按一下恢復，離開戰鬥取消舊題語音。

## 四種題型：原狀與修正
| 題型 | 原本顯示／播音 | 現在明確指令（也會念） |
|---|---|---|
| hear | 圖＋黃框缺聲調的注音＋四聲按鍵；只念詞 | 聽聽看，黃色框的音是第幾聲？ |
| pic2spell | 圖＋三組注音；只念詞 | 看圖聽讀音，選出正確的注音。 |
| spell2pic | 完整注音＋三張圖；沒有自動念題 | 看注音聽讀音，點選正確的圖片。 |
| drag | 圖＋黃框＋箭頭＋四聲拖曳；只念詞 | 把正確的聲調拖到黃色框，也可以點一下聲調。 |

四類均在顯示後自動依序「指令 → MOE 原音／缺檔 TTS 詞語」，提供 108×90「🔊 重聽」，可重播完整題目；有黃框者另顯示第幾個音。拖曳保留，也補上點聲調作答。取消／換題／離場會取消過時語音；錯誤提示移開以免蓋住指令。

## 素材、容量與授權
- 無外部取樣／下載第三方音樂：本批原創 WebAudio 五聲旋律與短音效，CC0 1.0；詳 `LICENSES/audio_generated_CC0.md`。
- **新增音訊檔僅 1,644 bytes**：0.1 秒單聲道靜音 WAV 作 HTMLAudio priming；BGM/SFX 全部程式產生、沒有音檔下載，低於本批 2MB 預算。16 秒音樂 buffer 為 1,411,200 bytes RAM。
- 原有 39 份 MOE WAV 已是 **27,947,818 bytes**，保留 CC BY-ND 3.0 TW 原音／署名；不把整個既有音庫誤報低於 2MB。若要求連舊音庫合計也 <2MB，需另外核准來源／授權與交付方案，這批沒有擅自破壞原音。

## 驗證與真機停止線
- Chromium iPad 尺寸／觸控、自動播放需手勢模式；真正 WebAudio/HTMLAudio，不 mock 音樂或音效。以 analyser 非零 PCM 驗證循環音樂；只 mock speechSynthesis（桌面無可保證的中文聲音），驗證請求與指令先於詞的順序，不能視作真人已聽到中文。
- 新測試與完整 acceptance／43,200 combos／96 swaps／通用回歸／QR 的結果，見 CHANGES_P0 第十一批及 `tests_p0/b11_preflight_result.json`。
- 真 iPad 待驗：一次點開始後音樂／MOE 原音／82 詞（39 MOE＋43 TTS 備援）實際可聽、四類自動念題／重聽、硬體靜音與藍牙、切背景／鎖屏後點擊恢復、開關與音量不壓過語音；不以 Chromium 模擬冒充 Safari。

參考（本次查閱）：[WebKit AudioContext](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/Modules/webaudio/AudioContext.cpp)、[WebKit SpeechSynthesis](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/Modules/speech/SpeechSynthesis.cpp)、[Phaser Audio](https://docs.phaser.io/phaser/concepts/audio)。

## Lily ui_v002 與 hints_v2 接入
- 18 張正式 runtime UI 圖複製至 `assets/art/ui/start_audio_v002/`，共 1,814,841 bytes，逐檔 SHA256 與來源相同，沒有複製 raw/previews/build 檔或修改源檔。交接副本：`docs/ui_v002_handoff.md`。
- 城堡天空、v8 固定公主、正式標題已接入；原生開始鈕正確對應 **(670,500)、600×180**，使用無字 normal/pressed 圖，DOM 只疊一次字。靜音提醒移右下避免遮公主裙腳。
- 實際四類題卡均顯示 **240×150** 提示圖，標成「怎麼玩（示意）」避免跟本題混淆；仍保留大字指令、自動念題及 108×90 重聽熱區（80px speaker 圖），含按下與播放中三幀動畫。音樂使用音符、SFX 使用鈴鐺，不混為重聽圖。
- 透過 `data/ui_audio_v002.json` 更換 hints 路徑／位置／尺寸，不把提示內容烙進問答邏輯；**已改用 Lily hints_v2**：單格單聲調、一聲單橫槓、drag 畫出拖或點、pic2spell 手指入框；完整指令仍寫「也可以點一下聲調」，沒有自改 Lily 源圖。

## 原音格式附查（不改檔）
39 檔均為單聲道 22,000Hz／16-bit PCM。13 個單字原檔的 RIFF 總長欄位與實體長度不符（鵝、送、拔、跑、忙、飛、教、追、去、快、敲、滾、變），Python 可讀；**這是既有原檔的兼容性風險，不是已證實的 Safari 根因**。未擅自改錄音／header或轉檔；Chromium 全39/39已實際解碼成功，補充結果見 `tests_p0/b11_all_moe_decode.json`，真 Safari 應特別點這13詞確認，失敗則走已解鎖的 TTS備援。結構證據：`tests_p0/b11_wav_format_audit.json`。

最終驗收：2026-11-11 01:27 SGT，完整suite PASS；回歸9/9、角色27/27、新聲音/UI15/15，39原音解碼39/39，QR大碼2825/2950且OpenCV逐字一致；正常流程JS錯誤0。

## 2026-11-11 SGT 核准後追記（取代上文修復前狀態）
副本13檔已完成僅RIFF長度欄修復，PCM SHA256前後一致、0重編碼；全runtime40檔嚴格掃描無異常。原始下載／來源未動，live仍未變；詳 `docs/audio_wav_header_repair_b11.md`。hear／drag已用Lily兩套24張normal/pressed/selected按鈕，沒有雙橫線；先前單字型fallback仍保留以防缺圖。
