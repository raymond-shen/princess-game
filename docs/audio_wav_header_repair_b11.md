# 第十一批追記：MOE WAV 標頭修復與聲調按鈕

## 範圍與保留證據

只處理 `/workspace/princess-game-p0/`；未修改任何原始下載、`/workspace/princess-game/art`、原遊戲或 v1；未 commit／push／deploy，push URL 保持 no_push。

13 檔先複製至 ignored `tests_p0/b11_wav_header_originals/` 保存，再拷到獨立暫存 inode 修復，確認 PCM 與其餘所有 bytes 後原子替換副本 runtime 檔，避免任何硬連結牽連來源。

## 修復欄位與逐檔 PCM 證明

- **只有 RIFF chunk size（offset 4–7）需要修復**，改為實體檔長 − 8。13 檔 data chunk size 原本就正確，fmt 長度均16，沒有其他 chunk，不作不必要改寫。
- PCM 全為 mono／16-bit／22,000Hz；檔長、取樣率、聲道、音量、取樣 bytes 與順序完全不變。**13/13 PCM SHA256 相同，重編碼0檔**；並確認 offset 4–7 以外所有 bytes 一致。
- `data/audio_words.json` 的 `moe.sha256` 保留官方原檔雜湊；新增 `runtimeHeaderRepair` 區分修復後整檔 hash、PCM hash 與來源 hash。授權／教育部使用說明原文保留，遊戲來源頁據實披露技術標頭修復。

| 詞 | runtime 檔名（assets/audio/words/） | RIFF size 原值 → 正值 | PCM SHA256（前後相同） |
|---|---|---|---|
| 拔 | `moe_word_0012.wav` | 3238002687 → 445376 | `689bdc4a33397029c7cd217f45bfaa8f61411ecedb1df4dcb574fef641f4fa09` |
| 變 | `moe_word_0250.wav` | 1955595776 → 430196 | `9ae6572f90b7d2fdafcf7537bd2966b97f00e325c10962efa47a480e6cc92bb6` |
| 跑 | `moe_word_0353.wav` | 1208813056 → 396616 | `34507749973aa8ac3d1ae92c656816923746f63ce45058ce0521d465d330c8fc` |
| 忙 | `moe_word_0666.wav` | 2432696319 → 438416 | `3562f53dc90ffa4c10e0d42f38aa00b23ae71adff75dce1e9c412592b366fc4c` |
| 飛 | `moe_word_0824.wav` | 2768240639 → 410276 | `c9f54ece284aeb92f1e416f1000cb5d506aa706ee6048204b00ce3192fba9348` |
| 滾 | `moe_word_2458.wav` | 2566914047 → 413336 | `08da0fd54b94ce4b6162103a89ae15cab277e82e07dde564f24fcef58801626b` |
| 快 | `moe_word_2598.wav` | 2701131775 → 390816 | `2b8f4dd5ec1f525630feda43db3eccd71dffbe496ace34758f4d6c7e1fb82b62` |
| 教 | `moe_word_3194.wav` | 141231616 → 420616 | `1e701e84b735e0e802ed6ba06b4452e13c3cc8a7bf112b9d7152afff1ed0dfa2` |
| 敲 | `moe_word_3606.wav` | 1214711296 → 419656 | `def5caaff571f3d41304c501230323f05d52b6dd9729f35e5d489f64d32d507c` |
| 去 | `moe_word_3770.wav` | 3841982463 → 409316 | `c7e07308acb9a21f965dd1fe4088b176057e561891d805b13c0e28f9e79043fc` |
| 追 | `moe_word_4567.wav` | 1345783296 → 407376 | `568445e9baf8bb50cf102de177f3ef69a1315f5a2e0f6a5a9bc646a385a7869e` |
| 送 | `moe_word_5706.wav` | 3774873599 → 414176 | `b2bb20a2a130aedbf5a0b58141005cfc7f2ef3465ca165d467b6de98e9f0ac8c` |
| 鵝 | `moe_word_5726.wav` | 3103784959 → 387256 | `c7c893fcd673b4dd82cf752fa66bafb0e453063314dbc99a500ae1aaa51769e5` |

## 全部音訊嚴格掃描

- 全副本共 **92 個 WAV** 均跑自訂嚴格 RIFF/chunk/frame 邊界解析＋Python wave 逐 frame 完整讀取＋`ffprobe -v error`＋`ffmpeg -v error -f null -` 全解碼。
- **實際 runtime 40檔（39 MOE＋1 silent priming）全部PASS**：無 RIFF/data/fmt 長度錯誤、無截斷 frame、無 ffprobe stderr、無 full-decode 錯誤；沒有其他格式異常、沒有重編碼。
- 其餘52檔是39份既有 detached baseline 與13份本次原始備份，不是遊戲載入資產，保持位元不變；baseline的13個原始壞RIFF加13份原始備份，26個已知RIFF不符刻意保留作證，沒有其他異常。
- 詳細 machine-readable 前後檔案hash、PCM hash、所有 chunk／ffprobe 欄位：`tests_p0/b11_wav_header_repair_result.json`；重掃：`b11_wav_header_audit_result.json`。工具：`tools/repair_wav_headers_b11.py`（預設只掃描，`--apply`只修副本runtime，拒絕未確認的深層問題）。
- 13檔總共只改了 **52 個 byte**（全部落在 RIFF size 的4-byte欄位）；全runtime檔案總位元組數不變。

## Lily 聲調按鈕與畫面

- `hear` 與 `drag` 都移除舊手勢線；fallback每顆只剩單一大聲調 ˉ ˊ ˇ ˋ。
- 接入Lily `tone_buttons/` 的 **24張 @2x**（兩套×四聲×normal/pressed/selected），逐檔對過更新SHA清單，未改來源。圖置中對準原中心：drag顯示完整136×136（鈕身／hitbox仍120×120）；hear顯示176×166（鈕身／hitbox仍160×150），不把帶8px透明邊的畫布硬縮成鈕身。
- 觸下用pressed、放開有效選擇用selected；hear改為有效放開才作答，拖曳／點選均保留。`data/ui_audio_v002.json` 宣告每題型每聲的normal/pressed/selected檔與display，未來換圖不需改問答邏輯；缺圖安全回退單一字型聲調。
- 正常畫面已重拍 `shots_p0/29_02_question_hear.png`、`shots_p0/29_05_question_drag.png`；另實拍 `29_09_hear_pressed.png`、`29_10_hear_selected.png`、`29_11_drag_pressed.png`、`29_12_drag_selected.png`，不是Lily預覽拼圖。
- 狀態QA用真CDP觸控按住／放開：按住時不作答，放開後實際+星並顯示selected；只暫停答對450ms關卡計時以拍清楚狀態，沒有偽造選取圖。

## 最終測試

最終 2026-11-11 01:43 SGT：完整14支runner全部PASS；音訊/UI17/17、聲調狀態3/3、通用回歸9/9、角色27/27、43,200組／96次壓測；修復後39 MOE全部瀏覽器解碼，runtime40嚴格掃描零異常，大碼2829/2950且OpenCV逐字相同，正常流程JS/console錯誤0。修正移除已知格式風險，但不是宣稱已在真iPad驗過聲音。
