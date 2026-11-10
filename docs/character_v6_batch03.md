# Wearables batch 3 / v6 接入備註

## 範圍及資產
- 只改 `/workspace/princess-game-p0/` 副本。原遊戲／v1／Lily來源未修改；沒有commit、push、deploy或線上網址。
- `HANDOFF_BATCH03.md`優先。productionReady=false、runtimeUseAllowed=false保持原值，m02母版／表情全畫布對齊規則不變。
- `tools/import_character_v6.py`從來源226筆asset中排除8筆deprecated圖層，產生218筆active的`data/character_runtime_v6.json`。8筆替換關係保留作存檔遷移；不再包／載舊盾影衣片。
- 複製1180檔／46,919,867 bytes，half唯一檔合計3,939,712 bytes至`assets/art/princess/v6/`；保留WebP懶載入、PNG按需備援、256/128縮圖及共用cuff alias去重。新盾的sourceArt屬work生圖溯源，不是runtime資產，從投影移除，沒有複製work原圖。
- 來源manifest SHA-256：`1fa56aa101ddced90e5741b80f1365f743351a8c8fb9f6562c0f5b8f4d619fa2`。靜態驗證218個active id／436層雜湊、1539個相對path及full/half尺寸，來源v5 SHA也保持不變。

## 六件實體穿戴與互斥
- 皇冠、花圈、項鍊、髮上蝴蝶結、翅膀、星星披風六件均wornLayer:true；合法配置沒有穿戴emoji佔位。cat/unicorn原有寵物UI不屬於這六件美術批次。
- wings讀assetsByHairStyle：A2/A3用longhair_flare，其餘petite，drawOrder10，仍在頭髮／身體後方。
- star_cape完整成對讀backAsset18＋frontAssetsByOutfit68/rank1；不能單獨選前扣，不將parts的語意part名稱誤當asset id。
- 翼／披風共用back_equipment單槽，彼此互斥；披風／項鍊互斥，B3–B6與任一新背裝備互斥。項鍊原B5/B6/B8限制保留。
- 互斥讀exclusiveWithOutfits及exclusiveWithTreasures，且雙向檢查：即使necklace自身未重複列cape規則，cape宣告仍能拒絕反向選擇。
- 換裝新增背裝備頁，灰化非法選項並顯示原文理由；換裝、Home、戰鬥掉寶共用驗證。**先驗證完整候選，再處理單槽**，不會為了開披風偷偷關翅膀／項鍊；玩家須先自行取下。移除時只拿掉指定物件，便於修正舊衝突。
- 服裝選單帶裝備互斥標籤，非法服裝切換也拒絕，不改原裝備。頭飾／bow仍可與合法背裝備共存，原帽髮變體與表情70排序不變。

## B3/B4修補與存檔
- outfits.parts、defaultAccessories及poses.outfitReplacements全部取v6原生資料；B4同時使用noShieldGhostV4 back與noShieldArc main，不是只換背片。
- B3四種pose的front取ghostCleanV3，兩個新盾使用manifest canonical id所指completePlateV5，不載早期平塗候選。服裝縮圖優先thumbV6。
- 已目視檢查遊戲實際合成的B4淺／深底放大圖：舊透明橢圓缺口、盾形金框與main殘弧不再出現，未見原白塊殘影。B3保留原奶油色馬甲尾片設計，不把正常白衣料當殘影整片刪掉。腕根色差等原candidate polish限制仍適用。
- wardrobeVersion6，首次遷移前完整備份`kx_save_v2_before_wardrobe6`。舊accessoriesOff透過B3B4GhostAmendment.replacements改成新canonical盾id，舊存檔關盾不會因換id而突然重開。
- 舊v5若同時穿翼／披風佔位，不在遷移時按單槽悄悄丟掉一件：保留兩者、進度及星寶，解析器明確回issues、UI禁止確認，讓玩家自行修正。
- Save格式仍v2/KXZ2，舊碼可讀，沒有更換壓縮格式；匯入仍確認後覆蓋及覆蓋前備份。

## 14層與快取預算
- loadEstimate/ decodeMemory讀入runtime，maxLayers=14；新增liveDecodedBytes/peakDecodedBytes/peakLayers邏輯計數。
- half每層500×550×4=1,100,000 bytes，14層15,400,000 bytes；PNG備援full14層61,600,000 bytes。單張half composite再加1.1MB，8張LRU約8.8MB RGBA。
- 這是影像尺寸計算與引用生命週期統計，不是實機heap/GPU量測。瀏覽器GC、WebGL副本、POT對齊及UI縮圖額外記憶體另計；若補到512×1024，來源列的14層約29.36MB情境仍須計入真機預算。
- 只按裝備組合解碼，合成後釋放分層參照；不預載全部218圖層。14層例採B3左手劍＋盾＋tiara＋happy＋necklace＋bow，不非法硬加翼／披風。

## 自動驗收及截圖
- `validate_character_v6.py`：active圖檔／相對path／SHA、六件實體、48格pose×衣、4個負例、canonical修補、thumbV6及14層預算。
- `p0h_v6_playtest.py`：8套翼、8套成對披風、長髮變體、4種雙向互斥、B3–B6禁用、三穿戴入口、舊檔／關盾遷移、修補圖、14層實際合成、43,200組合法／非法解析、96次換裝壓測、PNG備援、普通／149筆大碼OpenCV與確認覆蓋。
- 另重跑四支既有gameplay/jobs/album-parent-fallback/audio-import-QR回歸，輸出各`*_regression_v6.json`。缺圖／音檔的刻意404情境和正常流程分開看，不把預期404說成JS例外。
- `shots_p0/23_01`–`23_19`，加17b/18b放大QR，共21張：翼／披風8套總覽、A2/A3、4種互斥、4套禁用、B4雙底放大、B3四pose、14層、圖鑑、兩張存檔卡及大QR。

## WebKit／iPad狀態（未宣稱通過）
- 官方Playwright WebKit27.2/build2370瀏覽器下載成功，沒有移除其他瀏覽器。
- `playwright install --with-deps --no-remove webkit`的系統依賴步驟被Debian套件庫HTTP500阻擋；未停用簽章檢查或改走不安全套件來源。
- browser-only官方安裝成功後仍嘗試launch，因缺libevent-2.1、libgstgl、libgstcodecparsers、libavif16、libmanette及libenchant而失敗，尚未建立iPad觸控context、未跑到遊戲頁。因此**沒有WebKit遊戲功能通過的證據**。
- 擬用1180×820、has_touch、is_mobile、DPR2參數；失敗詳`tests_p0/webkit_v6_result.json`及兩個install log。Chrome的iPad viewport/touch測試不是Safari；實機iPad仍需驗收。

### 最終驗收數據
- 主驗收26項斷言全過；43,200候選中26,400合法、16,800非法，全數按規則處理，沒有錯誤接受／漏畫，最大14層。
- 14層fresh-page只請求14張裝備層，half壓縮payload 209,112 bytes；邏輯peakDecoded=14、peakDecodedBytes=15,400,000，合成後liveDecodedBytes=0，單張composite快取。
- 96次換裝實際產生96張composite，LRU峰值8張，結束refs/sources/liveDecoded/liveDecodedBytes均0；PNG備援涵蓋新翼、成對披風及B4修補片。
- 翼／披風普通卡分別516／516字，OpenCV放大解碼一致；149筆含新canonical關盾id的大碼2819字，低於2950，放大解碼／角色與穿戴round-trip／確認覆蓋前備份全部正確。
- 主流程JS與console errors均空；四支既有回歸均完成且無JS例外，刻意404案例仍安全降級。
- 21張23_*截圖已目視檢查；WebKit狀態仍是「binary已下載、系統依賴不足導致launch失敗」，沒有冒稱Safari驗收。

- 補驗：兩張普通卡516字的小QR也直接從完整截圖經OpenCV解碼成功，且與各自放大QR逐字相同；結果見`tests_p0/qr_inline_v6_result.json`。
