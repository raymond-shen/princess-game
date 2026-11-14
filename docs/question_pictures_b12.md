# 第十二批：Lily 第一批8張題圖（僅副本）

## 固定詞號與載入
- 基線：`4796fcbb22e16d355dcf1a645c2040dd4a9b6d5c`，detached HEAD；本批不commit／push／deploy，push URL維持`no_push`。
- `data/question_word_ids_b12.json`保存全部82詞雙向固定映射（`byId`／`byWord`）；這是圖片ID，不是MOE音檔ID。內部中文word.id與149個Leitner／舊存檔ID不改，不因CSV、詞庫排序或篩選重編圖片ID。
- `data/question_assets_b12.json`是48個runtime檔的相對路徑、尺寸、bytes及SHA256；來源與runtime的readiness旗標仍false。`data/question_pictures_b12.json`保留舊審核紀錄，僅對這8詞換成已核對的專圖。
- 圖檔根目錄：`assets/art/questions/`；檔名為`1280x800/word_<word_id>.webp`、`640x400/word_<word_id>.webp`、`320x200/word_<word_id>.webp`，各自以同名`.png`備援。沒有中文檔名／跨詞預設圖。
- `js/question-pictures.js`依顯示大小×實際canvas CSS縮放×DPR選320／640／1280：需求寬>640px就選1280；1280未列入manifest／缺檔／兩格式均失敗時維持640，不變更顯示尺寸、不借別詞圖。WebP失敗換同名PNG。
- 啟動先載需要的320／640（最多16張、10.24MB像素解碼估算）；大主圖按需升級1280，高解析度LRU保留最多3張，已銷毀的題卡釋放引用後可淘汰。正常穩態最多19張、22.528MB，升級瞬間多一張時上限估算26.624MB；不是Safari程序總RAM。角色LRU／14層預算另計且不變。48檔共19,826,105 bytes（WebP 8,417,690、PNG 11,408,415）；正常只取支援格式與當前需要尺寸。
- 圖主體及每個圖片選項均記錄中文`pictureWordId`與數字`pictureId`，必須符合固定映射。無圖、兩格式都壞、映射錯位時不顯示替代圖，停用該詞的圖題；hear／drag安全顯示詞語與注音。


## 最終大圖排版（32_*，取代31_*有框圖）
- pic2spell主圖 **512×320 logical px**，16:10、水平置中，佔800px題卡寬 **64%**；位置(512,306)，範圍(256,146)–(768,466)。DPR2時實際載1280x800；frameless_v2主manifest已列齊三尺寸，另與`1280x800/SHA256.txt`逐欄交叉核對，未改來源。
- 指令22px、單行置中於y=94；第幾個音標籤y=128；重聽仍108×90。教學示意退為左側120×75（原240×150），不再比真正題圖大。
- 三個注音答案各 **560×60**、字型34px，中心y=508／576／644；圖底到第一鈕12px、鈕間8px。最小768px寬直向仍有45px CSS高熱區；67個可出圖題目標的答案文字均測量無裁切。答錯提示移到右側空欄，不蓋第三個答案。
- spell2pic每張圖片及答案cell皆 **240×150 logical px**（精確8:5），圖片填滿cell、零內襯，沒有上下粉紅條；三張並排、間隔8px，圖片與大注音不重疊。無圖hear／drag仍用48px詞語、52–56px注音，不補錯圖。

| viewport CSS px | pic2spell實際顯示CSS px | spell2pic每張CSS px |
|---|---|---|
|1024×768|512×320|240×150|
|1180×820|546.7×341.7|256.3×160.2|
|1366×1024|682.7×426.7|320×200|
|820×1180（直向）|410×256.3|192.2×120.1|
|768×1024（直向）|384×240|180×112.5|

- 五種viewport均實測DOM/canvas縮放與實際GameObject邊界；圖、指令、示意、重聽、三答案不重疊且均在面板內。直向沿用等比FIT與上下留邊，不拉伸圖。
- 無圖實拍：`shots_p0/32_11_large_text_hear.png`、`32_12_large_text_drag.png`；另有32_13／15／16／17的橫向／直向實拍，最終結果見下方與CHANGES_P0追記。

## 來源檢查與內容
`tools/import_question_pictures_b12.py`先核對完整48檔的來源SHA256、bytes、三種尺寸及24對PNG／WebP像素一致，全部通過才複製；僅讀manifest的正式files，沒有複製src、rejected或預覽，沒有改Lily來源。

| ID | 詞語 | 目視內容 | 實拍 |
|---|---|---|---|
|0039|上上下下|彈簧床上下跳，圖形上下箭頭|`../shots_p0/32_01_0039_pic2spell.png`|
|0040|高高低低|五朵花高矮交錯，不是一路變矮|`../shots_p0/32_02_0040_pic2spell.png`|
|0035|手拉手|兩個小朋友牽手並肩走|`../shots_p0/32_03_0035_pic2spell.png`|
|0037|好朋友|兩個女孩開心擁抱|`../shots_p0/32_04_0037_pic2spell.png`|
|0007|翹翹板|兩端一高一低的翹翹板，不是溜滑梯|`../shots_p0/32_05_0007_pic2spell.png`|
|0028|五隻|**逐隻確認正好五隻黃色幼鳥／小鴨，無第六隻**|`../shots_p0/32_06_0028_pic2spell.png`|
|0029|泡澡|小熊浴帽泡泡浴、只有頭臉，不用rejected小女孩版|`../shots_p0/32_07_0029_pic2spell.png`|
|0032|築巢|小鳥銜枝在巢邊築巢|`../shots_p0/32_08_0032_pic2spell.png`|

- 小備註同Lily HANDOFF：「五隻」嘴型偏小鴨、不是寫實小鵝；數量正確，詞語只有「五隻」而非「五隻鵝」，本批沒有擅改物種。「好朋友」人物比例較其他圖稍成熟，無文字／數字洩題；未發現其他內容不符。
- `shots_p0/32_09_all8_ingame_contact.png`：全8張大型主圖的完整遊戲題卡實拍，非Lily預覽或源圖拼貼；舊30_*／31_*保留作初版／有框比較，不再作最終驗收圖。
- `shots_p0/33_10_0028_spell2pic.png`：五隻的注音選圖，cell已改8:5滿版；正解與干擾圖皆依自己的詞ID核對。`32_10`保留作修改前對照。

## 題庫／CSV
- 可用題圖由22詞增加至**30詞**，圖題目標音節由44增至**67**；全部149個學習目標保留。596種詞／音節×題型組合中432可出、164無圖圖題不出；剩52詞仍無核對圖。
- `docs/question_picture_art_needed_b11.csv`保留B11原始60列與排序，不因本批交圖刪列／重編；本批8詞完成狀態以B12 manifest為準。CSV生成器改讀固定映射，保留首欄word_id；缺少固定ID時在覆寫前拒絕。
- 生成器在ignored臨時fixture中實際重跑，檢查60個ID、原有欄／列內容與順序完全相同，不改主CSV或歷史B11稽核報告。

## 無框 v2 重匯入（32_*）
- 全48檔重新核對來源manifest、1280獨立SHA、bytes、尺寸及24對PNG/WebP完整RGBA bytes相同（亦確認整張alpha=255），全部通過後覆寫副本。runtime標示`sourceVersion:frameless_v2`、`frameless:true`，兩readiness仍false；只取正式三尺寸，未讀取／匯入`src/framed_v1_backup/`、`src/rejected/`或預覽。
- 白色矩形的根因是v1圖片本身含米白留邊與圓角白卡，JS並無另一塊主圖背板；以滿版圖取代後直接顯示單一Image，不加底板、外框、crop或mask。保留粉紅題卡與spell2pic選項cell自身邊框，沒有白色inset。新增檢查主圖無多餘背板、沒有crop/mask，選圖每格只有原cell的Graphics。
- 仍使用完整16:10影格，沒有因換圖改構圖或縮放規則。0028目視正好五隻，頭／身／腳均可辨，左右外翼貼到源圖邊緣；遊戲沒有再裁掉任何像素。0040五花高矮交錯；依HANDOFF重畫的是0040與0028，0007只是原圖去框裁切，並非第三張重畫。
- Lily註明0039拳頭近上緣、0029缸底貼下緣；遊戲完整顯示源圖，人物臉／牽手／小鳥與巢等重點不被UI或其他圖片遮住。沒有自行修美術或加圓角遮罩。

## 驗證
實際最終結果見CHANGES_P0第十二批與`tests_p0/b12_preflight_result.json`、`tests_p0/b12_question_art_result.json`。Chromium iPad觸控／DPR2是模擬，仍需真iPad Safari確認清晰度、音量、旋轉及長時間記憶體。

初版驗收（2026-11-11 08:07 SGT，排版已由31_*取代）：16支runner全PASS；回歸9/9、角色27/27、音訊17/17、聲調3/3、所有權8/8、新圖片11/11；JS與console錯誤0。43,200組／96次壓測通過；149筆大碼2818/2950、OpenCV逐字相符；question textures峰值16／10.24MB，角色預算不變。

### 大圖／1280最終驗收：PASS（2026-11-11 08:22:20 SGT）
- 完整`tests_p0/b12_preflight.py` **17支runner全部exit0**；通用回歸9/9、角色27/27、音訊/UI17/17、聲調3/3、圖所有權8/8、B12匯入/載入11/11、新排版9/9，正常pageerror／console.error **0**。五種viewport、全部67個圖題目標文字／答案均無裁切或重疊，8張主圖DPR2實載1280。
- 43,200組解析、96次換裝、PNG／缺圖／缺音及舊存檔回復全PASS；149筆大碼 **2815/2950**、OpenCV逐字相符。角色LRU8／14層解碼峰15.4MB、結束refs／sources／liveDecodedBytes皆0；題圖穩態實測19張／22,528,000 bytes、pending0。
- 另以真正HTTP404同時攔1280 WebP/PNG：正確640圖仍維持512×320，pageerror0，僅2個預期HTTP404資源log；證據`tests_p0/b12_high_missing_http_result.json`。沒有修改遊戲來迎合測試。
- 已目視大圖、五隻計數、泡澡、三選圖、無圖大字、直向及8圖contact；舊30_*保留。僅副本，未stage／commit／push／deploy，no_push不變；真iPad Safari仍待確認。

### 無框v2最終驗收：PASS（2026-11-11 08:40:01 SGT）
- 全部17支runner exit0；回歸9/9、角色27/27、音訊/UI17/17、聲調3/3、所有權8/8、B12圖片12/12、無框/排版10/10。五種橫直向、67個圖題目標、1280清晰度與640/PNG降級全PASS；正常pageerror/console.error 0。
- 48檔新SHA／尺寸全部符合兩份來源清單，24對PNG/WebP完整RGBA bytes相同、全畫布alpha=255；無框圖片直接在粉紅面板中顯示，選圖只有cell外框、沒有白色inset，GameObject無crop/mask。嚴格匯入器最後重跑，51個runtime圖／資料檔與剛通過全套測試的bytes完全一致。
- 43,200組／96次換裝與舊存檔全PASS；149筆QR 2813/2950、OpenCV逐字相符。角色LRU峰8／14層15.4MB、題圖峰19張／22.528MB，預算不變。四張交接重點：`shots_p0/32_06_0028_pic2spell.png`、`32_02_0040_pic2spell.png`、`32_10_0028_spell2pic.png`、`32_09_all8_ingame_contact.png`；已目視檢查。
- 未stage/commit/push/deploy；HEAD仍detached4796fcb、push URL no_push，Lily來源與ready=false未改。真iPad Safari仍待實機確認。


### 第十二批微調：spell2pic答案格改8:5滿版（33_10）
- 答案cell由244×220改 **240×150 logical px**（精確8:5），圖片由232×145改 **240×150**直接填滿cell，零內襯、無上下粉紅留條；不裁圖／不加mask／不改來源。中心仍(264,450)、(512,450)、(760,450)，cell間隔8px，不與注音／指令重疊。
- CSS cell／圖片尺寸：1024×768→240×150；1180×820→256.3×160.2；1366×1024→320×200；820×1180→192.2×120.1；768×1024→180×112.5。最小觸控高度112.5 CSS px，遠高於44；pic2spell尺寸／題庫／聲音／存檔／美術與快取上限不變。
- 排版runner新增所有橫直向cell與圖逐邊完全相同、8:5與>=44px熱區斷言；新的`shots_p0/33_10_0028_spell2pic.png`，保留32_10修改前畫面。完整尺寸表：`docs/question_pictures_b12.md`。
- 僅副本；未stage／commit／push／deploy，push URL維持no_push，readiness=false不變。全套重跑結果以下續記。

### 8:5答案格最終驗收：PASS（2026-11-11 08:47:22 SGT）
- `tests_p0/b12_preflight.py`17支runner全exit0；回歸9/9、角色27/27、音訊17/17、B12圖片12/12、排版10/10；正常pageerror／console.error 0。43,200組解析、96次換裝、舊存檔與PNG備援全PASS，149筆QR 2832/2950、OpenCV逐字相符。
- 五種viewport實測cell與圖片逐邊同為240×150 logical、8:5滿版，沒有上下留條／重疊，最小直向CSS為180×112.5（高>44）。已目視`shots_p0/33_10_0028_spell2pic.png`；完整尺寸表如上。
- `CHANGES_P0.md`及`docs/question_pictures_b12.md`已更新；未stage／commit／push／deploy，HEAD／no_push／readiness=false不變。
