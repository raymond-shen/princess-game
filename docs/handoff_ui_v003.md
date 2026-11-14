# 楷芯公主冒險・塔防介面美術 ui_v003（給 Chloe）

製作：Lily 美術長｜日期：2026-11-13（台北時間，UTC+8）
狀態：第一版塔防介面美術，可直接換掉佔位圖。還沒做 iPad 實測。
這批只放在 `/workspace/princess-game/art/ui_v003_tower_defense/`，**沒有改遊戲程式、沒有寫入 princess-game-p0、沒有 commit / push / 上傳 / 部署。**

座標都用遊戲畫布 **1×（1024×768）**，原點在左上角。2× 圖請縮放到下面寫的顯示尺寸。
檔名規則（Chloe 指定）：`ui_<name>[_<state>]_1x.png` / `ui_<name>[_<state>]_2x.png`，同名還有無損 WebP。
全部是 RGBA 透明 PNG（轉橫提示是滿版半透明紫底＋中間白卡，畫布本身仍是 RGBA）。
中文一律用 **Noto Sans CJK TC Bold** 畫上，不是 AI 內嵌字。含字版與空白版都有，空白版給程式疊字。

---

## 一、怎麼接上（對齊 Chloe 2026-11-13 的佔位規格）

顏色沿用開場 ui_v002：文字 `#5a2d6e`、選取 `#ff6fae`、淡粉框 `#ffc1dc`、淡綠確認 `#b9f6ca`、白卡 `#fff8fc`、取消淡紫 `#f3e9ff`。

| 元件 | 1× 檔案（各有 `_2x` 與 `.webp`） | 1× 位置 | 顯示尺寸 | 錨點 | 狀態 / 備註 |
|---|---|---|---|---|---|
| 金幣圖示 | `coin/ui_coin_1x.png` | (28, 22) | 36×36 | 左上 0,0 | 金色圓幣，中間粉心。數字請程式寫在右側，圖上沒有數字。 |
| 波次條外框 | `wave_bar/ui_wave_bar_frame_1x.png` | (240, 16) | 400×44，圓角 16 | 左上 | 空白，沒有文字。內側凹槽已留 4px，給填色用。 |
| 波次條填色（滿） | `wave_bar/ui_wave_bar_fill_1x.png` | (244, 20) | 392×36，圓角 18（膠囊） | 左上 | 見下方「填色怎麼裁」。 |
| 填色左／右端帽 | `ui_wave_bar_fill_cap_left` / `_right` | — | 18×36 | — | 9-slice 用。 |
| 填色中段 | `ui_wave_bar_fill_mid_1x.png` | — | 16×36 | — | 可水平拉長。只有直向漸層，橫拉不會花。 |
| 十心條底圖 | `hearts/ui_hearts_bar_1x.png` | (20, 62) | 280×26 | 左上 | 淺粉膠囊底。 |
| 愛心（滿／空） | `hearts/ui_heart_full_1x.png`、`ui_heart_empty_1x.png` | 見下 | 24×18 | 左上 | 空心是淡粉描邊，不是破碎或發抖的心。 |
| 蓋塔位 | `build_slot/ui_build_slot_{available,greyed,selected}_1x.png` | 佔位圖中心見下 | 90×90，圓半徑 40 | 正中 0.5,0.5 | 一般／錢不夠灰階／選取（熱粉框 `#ff6fae`）。 |
| 飛入金幣 | `coin_fly/ui_coin_fly_1x.png` | 飛向 (48, 40) | 32×32 | 正中 | (48, 40) 正好是 HUD 金幣的中心。 |
| 飛入精靈圖 | `ui_coin_fly_sheet_1x.png`（含幣）、`ui_coin_fly_trail_sheet_1x.png`（只有星光） | — | 384×48，8 格每格 48×48，由左到右 | 格中心 | 建議每格 70ms，循環。48 畫布比 32 金幣多一圈星光。 |
| 波次橫幅 | `wave_banner/ui_wave_banner_{blank,wave1,wave2,wave3,boss}_1x.png` | 中心 (512, 200) | 640×140，圓角 24 | 正中 0.5,0.5 | 空白版無字；含字版見下。魔王版是金粉邊，不可怕。 |
| 戰敗卡 | `lose/ui_lose_card_blank_1x.png` | (212, 164) | 600×440 | 左上 | 只有頂部裝飾（心＋星），**中間和底部文字區是空的**。標題請程式寫。卡片外圍有約 8px 陰影留白，可見卡身約 584×424。 |
| 再試一次 | `lose/ui_btn_retry_{normal,pressed}[_blank]_1x.png` | 中心 (512, 494) | 280×100 | 正中 | 淡綠確認鈕。含字「馬上再試一次」與空白兩套，各有一般／按下。 |
| 回地圖 | `lose/ui_btn_map_{normal,pressed}[_blank]_1x.png` | 中心 (512, 584) | 230×72 | 正中 | 淡紫。**鈕的下緣 y=620，比戰敗卡下緣 y=604 多出 16px。** |
| 過關卡 | `win/ui_win_card_blank_1x.png` | 建議 (212, 164)（規格沒寫，我按戰敗卡對齊） | 600×440 | 左上 | 頂部中央留空給三星，左右有小裝飾。 |
| 彩帶 | `win/ui_win_confetti_1x.png` | 與過關卡對齊 | 600×440 | 左上 | 透明底，只有四周碎彩，中間文字區是空的。可疊在卡上面。 |
| 三星組 | `win/ui_win_stars_3_1x.png` | 中心 (512, 200) | 400×140 | 正中 | 三顆亮星，中間那顆稍高稍大。 |
| 單顆星 | `win/ui_star_full_1x.png`、`ui_star_empty_1x.png` | 自行排列 1–3 星 | 96×96 | 正中 | 用來做 1／2／3 星評分。 |
| 轉橫提示（橫） | `rotate/ui_rotate_landscape[_blank]_1x.png` | (0, 0) | 1024×768 | 左上 | 滿版。含字「請把畫面轉橫」與空白。 |
| 轉橫提示（直） | `rotate/ui_rotate_portrait[_blank]_1x.png` | (0, 0) | 768×1024 | 左上 | 給直拿的裝置。見下方「轉橫比例」。 |

### 愛心位置

`spacing: 27` 我當成**左緣間距**（pitch），不是心與心之間的空隙。10 顆 × 24 寬 + 9 個 3px 縫 = 267，在 280 寬的底圖裡左右各留 6px，上下各 4px：

```
heart i 的左上角 = (20 + 6 + i * 27, 62 + 4)    i = 0..9
```

### 波次條填色怎麼裁（請用 9-slice，不要直接從右邊裁滿版填色）

滿版填色 `ui_wave_bar_fill` 是兩端都圓的膠囊。如果只用 `setCrop(0,0,width,36)` 從右邊裁，右端會變成平的切邊。

建議做法（擇一）：

1. **9-slice（建議）**：對 `ui_wave_bar_fill` 設 left=18、right=18、top=0、bottom=0，只水平拉中段。目標高度固定 36，寬度 = `392 * (remaining / total)`，**最小寬度 36**（兩端帽子剛好靠在一起，仍是圓的）。
2. **三切片組合**：左帽 `ui_wave_bar_fill_cap_left`（18×36）＋ 中段 `ui_wave_bar_fill_mid` 拉到 `width-36` ＋ 右帽 `ui_wave_bar_fill_cap_right`（18×36）。中段只有直向漸層，橫拉不會出現接縫。
3. 若進度小於 36px，請把整段膠囊**等比縮小寬度**（高度仍 36 的話看起來會變成橢圓；也可以暫時維持 36 寬的完整小膠囊）。不要裁成細長方塊。

填色放在外框內側 (244, 20)，也就是外框 (240, 16) 往內各 4px。

### 蓋塔位座標

規格只給了「點擊範圍 90×90、圓半徑 40」，沒有六個格子的 x/y。預覽裡的位置是我從佔位截圖 `34_08` 量的中心，**只給對稿，請以你程式裡的真實座標為準**：

`[ (180,369), (379,330), (639,359), (899,359), (419,559), (699,560) ]`

圖是 90×90，圓本體半徑 40（直徑 80），四周各留 5px 給選取光暈。請用錨點 0.5, 0.5 對準格子中心。

狀態對照：

| 檔名狀態 | 什麼時候用 |
|---|---|
| `available` | 金幣夠、可以點來蓋塔 |
| `greyed` | 金幣不夠（不是壞掉，只是灰色） |
| `selected` | 按下／目前選中，熱粉框 `#ff6fae` |

規格寫的是「pressed/selected」一個狀態，所以我沒有再拆 pressed。若點下去還要更暗的回饋，跟我說我再補。

### 波次橫幅含字

| 檔案 | 圖上的字 |
|---|---|
| `ui_wave_banner_blank` | （無） |
| `ui_wave_banner_wave1` | 第 1 波，準備！ |
| `ui_wave_banner_wave2` | 第 2 波，準備！ |
| `ui_wave_banner_wave3` | 第 3 波，準備！ |
| `ui_wave_banner_boss` | 魔王來了！ |

佔位截圖寫的是「第 1 波，開始！」，我改依你這次規格用「準備」。若要改回「開始」或再加「第 2 波，準備！」以外的句子，用空白版疊字最快。

橫幅本體略內縮約 5px 放陰影，可見區域約 630×130。用錨點 0.5, 0.5 放在 (512, 200) 即可。

### 戰敗／過關按鈕與卡片

- 戰敗卡、過關卡都是空白卡，標題與副標請程式寫（預覽裡的「城堡累了，沒關係！」「過關了！」只畫在 mock 上，不在交付檔裡）。
- 含字按鈕與空白按鈕都有。若文字要由程式寫，請用 `*_blank`。
- 按下態顏色較深、鈕身下移約 3px。
- **回地圖鈕會超出戰敗卡下緣 16px**（中心 584、高 72 → 底在 620；卡片底在 604）。這是規格上的數字，我沒有擅自改按鈕或卡片尺寸。若要整顆鈕都落在卡裡，建議把卡片加高到約 460，或把回地圖中心上移到 568。
- 過關卡的位置規格沒寫，我建議與戰敗卡同一組 (212, 164)。三星組中心仍依規格在 (512, 200)，會疊在過關卡頂部（卡片頂是 y=164）。卡片上方中央已留空。

### 轉橫提示比例

- 橫向：1024×768，剛好蓋住遊戲畫布。
- 直向：768×1024（4:3）。
- 現在 iPad／iPhone 直拿的畫面更長（截圖 `34_04` 是 1170×2532，約 9:19.5）。768×1024 在長螢幕上會上下留邊。若要滿版鋪滿，請用 `cover` 縮放直向圖，或跟我說目標解析度我再補一套（例如 768×1280／1170×2532）。
- 插圖是粉色 iPad 正在轉橫，有彎箭頭，沒有任何文字。含字版只在卡片下緣寫「請把畫面轉橫」。

---

## 二、檔案清單

根目錄：`/workspace/princess-game/art/ui_v003_tower_defense/`

### 金幣 `coin/`

| 檔案 | 尺寸 |
|---|---|
| `ui_coin_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 36×36；2× 各邊×2 |

### 波次條 `wave_bar/`

| 檔案 | 尺寸 |
|---|---|
| `ui_wave_bar_fill_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 392×36；2× 各邊×2 |
| `ui_wave_bar_fill_cap_left_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 18×36；2× 各邊×2 |
| `ui_wave_bar_fill_cap_right_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 18×36；2× 各邊×2 |
| `ui_wave_bar_fill_mid_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 16×36；2× 各邊×2 |
| `ui_wave_bar_frame_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 400×44；2× 各邊×2 |

### 十心條 `hearts/`

| 檔案 | 尺寸 |
|---|---|
| `ui_heart_empty_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 24×18；2× 各邊×2 |
| `ui_heart_full_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 24×18；2× 各邊×2 |
| `ui_hearts_bar_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 280×26；2× 各邊×2 |

### 蓋塔位 `build_slot/`

| 檔案 | 尺寸 |
|---|---|
| `ui_build_slot_available_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 90×90；2× 各邊×2 |
| `ui_build_slot_greyed_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 90×90；2× 各邊×2 |
| `ui_build_slot_selected_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 90×90；2× 各邊×2 |

### 金幣飛入 `coin_fly/`

| 檔案 | 尺寸 |
|---|---|
| `ui_coin_fly_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 32×32；2× 各邊×2 |
| `ui_coin_fly_sheet_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 384×48；2× 各邊×2 |
| `ui_coin_fly_trail_sheet_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 384×48；2× 各邊×2 |

### 波次橫幅 `wave_banner/`

| 檔案 | 尺寸 |
|---|---|
| `ui_wave_banner_blank_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 640×140；2× 各邊×2 |
| `ui_wave_banner_boss_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 640×140；2× 各邊×2 |
| `ui_wave_banner_wave1_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 640×140；2× 各邊×2 |
| `ui_wave_banner_wave2_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 640×140；2× 各邊×2 |
| `ui_wave_banner_wave3_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 640×140；2× 各邊×2 |

### 戰敗卡與按鈕 `lose/`

| 檔案 | 尺寸 |
|---|---|
| `ui_btn_map_normal_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 230×72；2× 各邊×2 |
| `ui_btn_map_normal_blank_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 230×72；2× 各邊×2 |
| `ui_btn_map_pressed_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 230×72；2× 各邊×2 |
| `ui_btn_map_pressed_blank_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 230×72；2× 各邊×2 |
| `ui_btn_retry_normal_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 280×100；2× 各邊×2 |
| `ui_btn_retry_normal_blank_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 280×100；2× 各邊×2 |
| `ui_btn_retry_pressed_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 280×100；2× 各邊×2 |
| `ui_btn_retry_pressed_blank_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 280×100；2× 各邊×2 |
| `ui_lose_card_blank_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 600×440；2× 各邊×2 |

### 過關卡、星星、彩帶 `win/`

| 檔案 | 尺寸 |
|---|---|
| `ui_star_empty_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 96×96；2× 各邊×2 |
| `ui_star_full_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 96×96；2× 各邊×2 |
| `ui_win_card_blank_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 600×440；2× 各邊×2 |
| `ui_win_confetti_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 600×440；2× 各邊×2 |
| `ui_win_stars_3_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 400×140；2× 各邊×2 |

### 轉橫提示 `rotate/`

| 檔案 | 尺寸 |
|---|---|
| `ui_rotate_landscape_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 1024×768；2× 各邊×2 |
| `ui_rotate_landscape_blank_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 1024×768；2× 各邊×2 |
| `ui_rotate_portrait_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 768×1024；2× 各邊×2 |
| `ui_rotate_portrait_blank_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 768×1024；2× 各邊×2 |

### 預覽（不當遊戲貼圖） `previews/`

| 檔案 | 尺寸 |
|---|---|
| `ui_v003_mock_rotate_1x.png`（另有 `_2x.png` 與同名 `.webp`） | 1× 1640×848；2× 各邊×2 |
| `ui_v003_mock_greyed_slot.png` | 1024×768 |
| `ui_v003_mock_hud.png` | 1024×768 |
| `ui_v003_mock_lose.png` | 1024×768 |
| `ui_v003_mock_rotate.png` | 1170×2532 |
| `ui_v003_mock_rotate_1x.png` | 1640×848 |
| `ui_v003_mock_wave_banner.png` | 1024×768 |
| `ui_v003_mock_win.png` | 1024×768 |
| `ui_v003_overview.png` | 2000×2680 |

其他：

- `HANDOFF_UI_V003.md`：本說明
- `layout_ui_v003.json`：座標與清單
- `SHA256.txt`：校驗
- `build_ui_v003.py`：可重跑的建圖腳本
- `raw/rotate_ipad_raw.jpg`、`raw/rotate_ipad_keyed.png`：轉橫插圖原圖與去背，不是遊戲載入檔

預覽說明：

- `previews/ui_v003_overview.png`：全部元件總覽
- `previews/ui_v003_mock_hud.png`：疊在 `34_08` 上（金幣、波次條、十心、空地）
- `previews/ui_v003_mock_greyed_slot.png`：疊在 `34_06` 上（灰色空地）
- `previews/ui_v003_mock_wave_banner.png`：疊在 `34_07` 上（「第 1 波，準備！」）
- `previews/ui_v003_mock_lose.png`：用 `34_08` 戰場加上遮罩再疊戰敗卡與兩顆按鈕（不用 `34_11`，避免舊的紫橫幅露出）。mock 上的安慰句不是交付檔的一部分
- `previews/ui_v003_mock_win.png`：用 `34_08` 戰場再疊過關卡、彩帶與三星（不用 `34_12`，避免舊的 emoji 星星／禮炮露出）。mock 上的「過關了！」不是交付檔的一部分
- `previews/ui_v003_mock_rotate.png`：疊在 `34_04` 直向截圖上（直向 4:3 圖在長螢幕上下會留邊）
- `previews/ui_v003_mock_rotate_1x.png`：橫向／直向轉橫圖並排

---

## 三、已知問題與規格上不清楚的地方

1. **回地圖鈕超出戰敗卡 16px**，見上。我沒有改規格尺寸。
2. **蓋塔位沒有給 x/y**，預覽座標只從佔位截圖量出，接程式時請用你自己的格子中心。
3. **過關卡位置、單顆星與三星組的具體像素尺寸**規格只寫「星星中心在 (512, 200)」。三星組我做成 400×140，單顆星 96×96。若要更大或改成弧度不同，跟我說。
4. **過關後的「下一關」按鈕**這次規格沒列尺寸，所以這批沒做。需要的話我可以做成跟「馬上再試一次」同一套 280×100 淡綠鈕。
5. **波次橫幅用「準備」不是佔位圖的「開始」。**
6. **轉橫直向是 4:3**，在長螢幕手機會留上下邊，見上。
7. 戰敗／過關／橫幅外圍有 5–8px 陰影留白，可見本體略小於標稱尺寸。請用規格給的錨點放，不要再往外加陰影。
8. 轉橫插圖是生成後去背的，放大看邊緣可能有極細的色差；在 1×／2× 遊戲尺寸下看起來是平的。
9. 沒有在真機 iPad Safari 試過。高解析螢幕請用 2× 圖（遊戲畫布 2× 是 2048×1536）。
10. 這批美術本身沒有 `productionReady` 旗標，要等 Raymond 看過截圖同意才上正式網址。

---

## 四、授權與來源（簡記）

- 金幣、愛心、波次條、空地、按鈕、卡片、星星、彩帶：向量／程式繪製（Pillow，高解析再縮小）。
- 中文：Noto Sans CJK TC Bold。
- 轉橫提示裡的 iPad 插圖：生成後去背，圖上沒有文字。
- 配色與圓角白卡風格對齊 `ui_v002_start_audio`。

