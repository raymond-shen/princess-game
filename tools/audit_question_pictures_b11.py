#!/usr/bin/env python3
"""Rebuild the word/syllable/type audit and Lily's prioritized UTF-8 CSV, copy only."""
import csv,hashlib,io,json,pathlib,wave
from collections import Counter
ROOT=pathlib.Path(__file__).resolve().parents[1];D=ROOT/'docs';D.mkdir(exist_ok=True)
v=json.loads((ROOT/'data/vocab.json').read_text())['words'];catalog=json.loads((ROOT/'data/question_pictures_b11.json').read_text())['words'];a=json.loads((ROOT/'data/audio_words.json').read_text())['words']
reviewpath=ROOT/'tests_p0/b11_audio_semantic_review.json';asr={x['word']:x for x in json.loads(reviewpath.read_text()).get('rows',[])}if reviewpath.exists()else{}
identity=json.loads((D/'question_audio_identity_b11.json').read_text());assert len(identity['rows'])==39 and all(x['wordMatches'] and x['zhuyinMatches'] and a[x['word']]['moe']['id']==x['moeId'] and a[x['word']]['file']==x['file'] for x in identity['rows'])
tones={0:'˙',1:'',2:'ˊ',3:'ˇ',4:'ˋ'}
def spell(w):return ' '.join(z+tones[t]for z,t in zip(w['zhuyin'],w['tones']))
def targets(w):return [i for i,t in enumerate(w['tones'])if t>0 and i not in w.get('skipSyllables',[])]
def voice(w):
 e=a.get(w['id'])
 if not e:return 'TTS（zh-TW）','speechSynthesis: '+w['word'],'文字路由完全相符；實際裝置聲音／多音字待真 iPad 聽驗'
 p=ROOT/e['file'];expected=e.get('runtimeHeaderRepair',{}).get('fileSHA256',e['moe']['sha256']);actual=hashlib.sha256(p.read_bytes()).hexdigest();assert actual==expected,(w['word'],'source/runtime SHA mismatch')
 with wave.open(str(p),'rb')as f:duration=f.getnframes()/f.getframerate()
 assert 0<=e['start']<e['end']<=duration,(w['word'],'clip outside source')
 r=asr.get(w['word']);semantic='切片 ASR 音近相符（非人工／聲調驗證）'if r and r.get('phoneticMatch')else '短切片 ASR 不確定，保留人工聽驗；不能據此判為錯音'
 return 'MOE',f"{e['file']} [{e['start']:.2f}–{e['end']:.2f}s]",f"來源metadata／修復後 SHA、路由詞 ID 與範圍相符；{semantic}"
voices={w['id']:voice(w)for w in v}
counts=Counter(p['status']for p in catalog.values());nt=sum(len(targets(w))for w in v);pt=sum(len(targets(w))for w in v if catalog[w['id']]['status']=='matched')
# Frequency is the static bank multiplicity, NOT fabricated player telemetry.
missing=sorted([w for w in v if catalog[w['id']]['status']!='matched'],key=lambda w:(-len(targets(w))*4,w['lesson'],w['id']))
p=D/'question_picture_art_needed_b11.csv'
with p.open('w',encoding='utf-8-sig',newline='')as f:
 out=csv.writer(f);out.writerow(['詞語','注音','需補圖題型','題庫出現頻次（音節×原4題型）']);out.writerows([w['word'],spell(w),'pic2spell;spell2pic',len(targets(w))*4]for w in missing)
with p.open(encoding='utf-8-sig',newline='')as f:
 roundtrip=list(csv.DictReader(f));assert len(roundtrip)==len(missing)and [x['詞語']for x in roundtrip]==[w['word']for w in missing]
fields=['word_id','word','zhuyin','lesson','item_id','target_index_1based','target_character','target_zhuyin','tone','question_type','legacy_picture','legacy_status','reason','eligible_now','approved_picture','picture_role','audio_kind','spoken_file_or_text','audio_verification']
rows=[]
for w in v:
 p=catalog[w['id']];kind,file,verified=voices[w['id']]
 for i in targets(w):
  for typ in ['hear','pic2spell','spell2pic','drag']:
   eligible=p['status']=='matched'or typ in ['hear','drag']
   rows.append([w['id'],w['word'],spell(w),w['lesson'],w['id']+'#'+str(i),i+1,w['word'][i]if i<len(w['word'])else w['word'],w['zhuyin'][i],w['tones'][i],typ,w['pic'],p['status'],p['reason'],str(eligible).lower(),p['glyph']if eligible and p['status']=='matched'else '',('correct_option'if typ=='spell2pic'else'target')if eligible and p['status']=='matched'else 'none',kind,file,verified])
with(D/'question_picture_audit_b11_items.csv').open('w',encoding='utf-8-sig',newline='')as f:
 out=csv.writer(f);out.writerow(fields);out.writerows(rows)
assert len(rows)==nt*4==596
summary=dict(words=len(v),targetSyllables=nt,originalWordTypeVariants=len(rows),matched=counts['matched'],mismatched=counts['mismatched'],decorative=counts['decorative'],rawMissing=0,usableArtMissing=len(missing),picturedTargets=pt,allowedVariants=pt*4+(nt-pt)*2,excludedPictureVariants=(nt-pt)*2,moeFiles=len(a),ttsWords=len(v)-len(a),asrReviewed=len(asr),asrPhoneticMatches=sum(x.get('phoneticMatch',False)for x in asr.values()),frequency='Static original-bank target syllables × 4 types. Actual randomized/spaced-repetition player frequencies are unknown; no telemetry was fabricated.')
(D/'question_picture_audit_b11_summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
lines=['# 第十一批：題目圖片與語音逐詞稽核','', '## 根因與修正', '', '- 不是索引錯位／全站預設天鵝：`data/vocab.json` 的 82 個 `pic` 全是手配 emoji，含章節聯想、動作物件、抽象裝飾；原 `Battle.buildQ()` 不經語義或 owner 驗證就直接使用 `w.pic`／`pw.pic`。', '- 29_02／29_05 的詞其實是 **五隻（ㄨˇ ㄓ）**，原欄位只有單一 🦢；聲音路由是 TTS「五隻」，並非「天鵝」音檔。另「鵝」原用 Unicode SWAN，也列物種不精確，沒有默認放行。', '- 新 `data/question_pictures_b11.json` 逐詞保守審核。22 詞可用直接對應的系統 emoji（不是 Lily 已交專圖）；20 詞明確不符、40 詞只是聯想／裝飾，一律不當作題目圖。大小形容詞的常見具體名詞可暫以該物體表示；數量／動作／親屬關係／方向不能靠聯想猜。', '- 無核對圖：hear／drag 顯示較大的詞語與注音，不顯示圖片、空框、問號圖或別詞替代圖；pic2spell／spell2pic 的選題池排除該詞。149 個原學習目標／舊 Leitner ID 全數保留。', '- 所有主圖 `pictureWordId == question.word.id`；選圖題每個選項 `pictureWordId == option.wordId`，正解再等於題目 word.id。干擾圖必須也通過審核，且三圖 glyph 互異；不把所有干擾選項錯誤地標成主詞。', '- Lily hints_v2 仍只是明標「怎麼玩（示意）」的教學圖，不計入題目的主圖／答案圖；語音仍先指令後完整詞語，可按大聲音鍵重聽。', '- 圖目錄缺失／owner 不同時 fail-closed：停用圖題，退 hear；沒有舊 `vocab.pic` fallback。家長錯詞列表也不再顯示不符圖示。', '', '## 數量（以詞為單位，另列音節／題型）', '', '| 階段 | 總詞 | 可用對應圖 | 明確錯配 | 裝飾代理 | 無可用專圖 |', '|---|---:|---:|---:|---:|---:|',f'| 原資料 | {len(v)} | {counts["matched"]} | {counts["mismatched"]} | {counts["decorative"]} | {len(missing)}（前兩類合計；原始 pic 空值為 0） |',f'| 修後顯示 | {len(v)} | {counts["matched"]} | 0 | 0 | {len(missing)}（不顯示圖） |','',f'- {nt} 個可出題音節 × 原 4 題型 = **596** 組，已逐組稽核。{pt} 個有圖音節可用四型；另 {nt-pt} 個只用 hear／drag。修後 **{summary["allowedVariants"]}** 組可出題、**{summary["excludedPictureVariants"]}** 組無圖選圖型停用。', '- 完整 596 列（包含每個 target 字／音節、原圖、理由、型別、音檔路徑／TTS 文字、時間區間）：`question_picture_audit_b11_items.csv`。', '', '## 語音核對與限制', '', '- **獨立官方詞目核對39/39**：唯讀原下載 `/tmp/moe/dict_concised_2014_20260929.xlsx`（45,178筆），以「字詞號」對MOE音檔ID；39個詞名與完整注音皆逐一吻合，包含多音字正確詞號。39列證據與原xlsx SHA256見 `question_audio_identity_b11.json`，沒有只相信遊戲自己標的檔名。原下載未修改。', f'- {len(a)} 個 MOE 詞：檔案存在、對應 word ID 的路由、來源／修復後 SHA256、播放 start/end 均核對；未改任何 PCM、音檔或時間範圍。先前全39實際瀏覽器解碼與runtime40嚴格格式測試仍保留。',f'- 另 {len(v)-len(a)} 詞沒有固定錄音，`speechSynthesis` 呼叫文字逐詞等於 word.word，不會拿圖片名稱念；zh-TW 聲音、聲調與多音字最終仍需真 iPad 聽驗。', '- 額外以本機 base ASR、**不提示正解**，轉寫遊戲真正播放的切片；不確定者再看整段來源音檔上下文。ASR 尤其不擅長 0.5 秒單字／同音字，不能把未識別當成錯音，也不能聲稱做過真人聽音。模型／轉寫僅在 ignored tests_p0，沒有送音檔到外站，沒有把模型加入遊戲。', f'- ASR 機器覆核：{len(asr)}/39；切片文字同音推測相符 {summary["asrPhoneticMatches"]}，其餘保留人工聽驗標記。沒有只因檔案能解碼便聲稱語音語義正確；**不宣稱所有詞的實際發音已人工驗證**。', '- ASR 尚不能確定的22詞：'+ '、'.join(x['word'] for x in asr.values() if not x.get('phoneticMatch'))+'。這些是待核對標記，不是已證實錯音；43個裝置TTS的多音字／聲調也待真機。', '', '## Lily 補圖清單與排序', '', '- `question_picture_art_needed_b11.csv`：60 詞，UTF-8 BOM，欄位「詞語、注音、需補圖題型、題庫出現頻次」。優先補 pic2spell／spell2pic；完成後同圖也可用在 hear／drag。', '- 「頻次」明確採 **可出題音節數 × 原四題型** 的題庫靜態出現數，遞減排序，同分依課別／詞 ID；高高低低、上上下下優先。沒有玩家遙測／Raymond 裝置紀錄，隨機／Leitner 實際出現次數未知，不偽造使用頻率。', '- Lily 交正確圖後只需在圖登錄表填對應 wordId、資產／審核狀態（目前支援 glyph；若交 PNG/WebP 則需另加圖片 texture 載入），不可只把舊 emoji 改成 matched。這批沒有製作或修改 Lily 原圖。', '', '## 逐詞結果（全部 82 詞）', '', '| 詞語／ID | 注音 | 目標音節 | 原圖 → 修後 | 判定／原因 | 聲音與區間／文字 | 語音覆核 |', '|---|---|---|---|---|---|---|']
for w in v:
 p=catalog[w['id']];kind,file,verified=voices[w['id']];lines.append(f"| {w['word']} | {spell(w)} | {','.join(str(i+1)for i in targets(w))} | {w['pic']} → {p['glyph']or'不顯示'} | {p['status']}：{p['reason']} | {kind} `{file}` | {verified} |")
lines+=['','## 測試與畫面','','- `tests_p0/b11_picture_playtest.py` 逐一實際建出596組問答，檢查264個顯示圖物件 owner/glyph、無圖大字、圖題選題池、所有82詞音訊路由；另偽造錯 owner 與缺目錄均不得露出替代圖。','- 完整結果以 `tests_p0/b11_preflight_result.json` 與 CHANGES_P0 第十一批最新紀錄為準。','- 重拍 `29_02_question_hear.png`（五隻第1音）、`29_05_question_drag.png`（五隻第2音），均不再出現天鵝；`29_03_question_pic2spell.png`（貓咪）、`29_04_question_spell2pic.png`（青蛙）為有圖的正例。09–12按下／選定狀態也重拍。','- 僅副本，無commit／push／deploy；HEAD仍d7d14e2，push URL no_push。','']
(D/'question_picture_audit_b11.md').write_text('\n'.join(lines))
print(json.dumps(summary,ensure_ascii=False,indent=2))
