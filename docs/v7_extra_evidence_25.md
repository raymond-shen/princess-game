# v7 補充截圖／四項穿戴規則

Chromium：1180×820、DPR2、iPad UA、touch／is_mobile。17張實際遊戲畫面，無遊戲程式或美術變更；未commit／push／deploy。

| 穿戴規則 | 結果 | 實測 | 證據 |
|---|---|---|---|
| 翅膀 ↔ 披風互斥 | PASS | 雙向拒絕、不卸下原裝備；灰化且顯示理由 | 25_03、25_04 |
| 披風 ↔ 項鍊互斥 | PASS | 雙向拒絕、不卸下原裝備；灰化且顯示理由 | 25_01、25_02 |
| B3–B6 禁止翅膀／披風 | PASS | 4套逐一驗證，兩按鈕皆禁用且有理由 | 25_05–25_08 |
| B5／B6／B8 禁止項鍊 | PASS | 3套逐一驗證，按鈕禁用且有理由 | 25_09–25_11 |

四種寶物配裝皆無issues／placeholder。戰鬥為實際Battle場景：角色已繪製、3活怪／3座塔、已出招；家長頁含6筆常錯詞與9課統計。JS／console錯誤皆0。

## 截圖路徑
- `shots_p0/25_01_necklace_blocks_cape.png`
- `shots_p0/25_02_cape_blocks_necklace.png`
- `shots_p0/25_03_wings_blocks_cape.png`
- `shots_p0/25_04_cape_blocks_wings.png`
- `shots_p0/25_05_B3_wings_cape_blocked.png`
- `shots_p0/25_06_B4_wings_cape_blocked.png`
- `shots_p0/25_07_B5_wings_cape_blocked.png`
- `shots_p0/25_08_B6_wings_cape_blocked.png`
- `shots_p0/25_09_B5_necklace_blocked.png`
- `shots_p0/25_10_B6_necklace_blocked.png`
- `shots_p0/25_11_B8_necklace_blocked.png`
- `shots_p0/25_12_archer_B2_wings.png`
- `shots_p0/25_13_magician_B7_cape.png`
- `shots_p0/25_14_archer_B5_flower_crown_ribbon.png`
- `shots_p0/25_15_warrior_B3_tiara_necklace.png`
- `shots_p0/25_16_battle_dressed_midfight.png`
- `shots_p0/25_17_parent_page.png`

## 武器左右手證據（已清楚，不重拍）
- `shots_p0/24_01_warrior_B3_poses.png`：畫面明示一般、雙拳、左手武器、右手武器。
- `shots_p0/24_02_archer_B5_poses.png`：畫面明示一般、雙拳、左手武器、右手武器。
- `shots_p0/24_03_magician_B7_poses.png`：畫面明示一般、雙拳、左手武器、右手武器。

結果詳 `tests_p0/p0j_v7_extra_shots_result.json`。
