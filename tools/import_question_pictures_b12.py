#!/usr/bin/env python3
"""Verify Lily's explicit runtime list, copy only verified runtime files, freeze picture IDs."""
import csv,hashlib,json,pathlib,re,shutil
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parents[1];SOURCE=pathlib.Path('/workspace/princess-game/art/question_pictures_b01');DEST=ROOT/'assets/art/questions'
m=json.loads((SOURCE/'question_pictures_b01_manifest.json').read_text());v=json.loads((ROOT/'data/vocab.json').read_text())['words']
mp=ROOT/'data/question_word_ids_b12.json'
if mp.exists():mapping=json.loads(mp.read_text())
else:
 mapping={'schemaVersion':1,'policy':'Frozen picture IDs; never renumber on CSV/vocabulary reorder. Chinese word IDs and saves stay unchanged.','byId':{f'{i:04d}':w['id']for i,w in enumerate(v,1)}};mapping['byWord']={w:i for i,w in mapping['byId'].items()}
assert len(mapping['byId'])==len(mapping['byWord'])==82 and len(set(mapping['byId'].values()))==82
for id,word in mapping['byId'].items():assert re.fullmatch(r'\d{4}',id)and mapping['byWord'][word]==id
with(ROOT/'docs/question_picture_art_needed_b11.csv').open(encoding='utf-8-sig',newline='')as f:
 for row in csv.DictReader(f):assert mapping['byId'][row['word_id']]==row['詞語']
expected={'0039':'上上下下','0040':'高高低低','0035':'手拉手','0037':'好朋友','0007':'翹翹板','0028':'五隻','0029':'泡澡','0032':'築巢'}
assert {x['word_id']:x['word']for x in m['items']}==expected
# Optional high-resolution handoff has its own authoritative SHA256 list.
high=SOURCE/'1280x800/SHA256.txt'
if high.exists():
 hashes={line.split()[1]:line.split()[0]for line in high.read_text().splitlines()if line.strip()}
 assert set(hashes)=={f'1280x800/word_{id}.{ext}'for id in expected for ext in ['png','webp']}
 for item in m['items']:
  fs={}
  for ext in ['png','webp']:
   rel=f"1280x800/word_{item['word_id']}.{ext}";b=(SOURCE/rel).read_bytes();assert hashlib.sha256(b).hexdigest()==hashes[rel]
   fs[ext]={'relpath':rel,'width':1280,'height':800,'bytes':len(b),'sha256':hashes[rel]}
  if '1280x800'in item['files']:
   for ext,meta in fs.items():assert all(item['files']['1280x800'][ext][k]==v for k,v in meta.items()),('manifest/high SHA mismatch',item['word_id'],ext)
  else:item['files']['1280x800']=fs

out={'schemaVersion':1,'batch':m['batch'],'sourceVersion':m.get('version'),'frameless':m.get('spec',{}).get('frameless',False),'productionReady':m['productionReady'],'runtimeUseAllowed':m['runtimeUseAllowed'],'assetRoot':'assets/art/questions/','naming':'{size}/word_{pictureId}.{webp|png}','items':{}};checked=[]
# Validate EVERY source file, dimensions, bytes, SHA and lossless equivalence before copying any.
for item in m['items']:
 id,word=item['word_id'],item['word'];assert mapping['byId'][id]==word
 for size,formats in item['files'].items():
  assert size in ['640x400','320x200','1280x800'];decoded={}
  for ext,meta in formats.items():
   rel=f'{size}/word_{id}.{ext}';assert ext in ['png','webp']and meta['relpath']==rel
   p=SOURCE/rel;b=p.read_bytes();assert len(b)==meta['bytes']and hashlib.sha256(b).hexdigest()==meta['sha256'],rel
   im=Image.open(p).convert('RGBA');assert im.size==tuple(map(int,size.split('x')))==(meta['width'],meta['height']);decoded[ext]=im
   checked.append((rel,meta))
  assert decoded['webp'].tobytes()==decoded['png'].tobytes(),(id,size)
 assert len(item['files'])==(3 if high.exists()else 2)
assert len(checked)==(48 if high.exists()else 32)
for rel,meta in checked:
 p=DEST/rel;p.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(SOURCE/rel,p);assert hashlib.sha256(p.read_bytes()).hexdigest()==meta['sha256']
for item in m['items']:
 out['items'][item['word_id']]={'wordId':item['word'],'pictureId':item['word_id'],'files':{size:{ext:{k:meta[k]for k in ['relpath','width','height','bytes','sha256']}for ext,meta in fs.items()}for size,fs in item['files'].items()}}
mp.write_text(json.dumps(mapping,ensure_ascii=False,indent=2)+'\n');(ROOT/'data/question_assets_b12.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
catalog=json.loads((ROOT/'data/question_pictures_b11.json').read_text());catalog['batch']='12';catalog['productionReady']=False;catalog['runtimeUseAllowed']=False
for word,p in catalog['words'].items():
 p['pictureId']=mapping['byWord'][word]
 if p['pictureId']in expected:p.update(status='matched',kind='image',glyph=None,reason='Lily batch01 專圖：已核對詞號、檔案、無損像素與內容，僅在副本啟用')
(ROOT/'data/question_pictures_b12.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'verifiedCopied':len(checked),'webpBytes':sum(x['bytes']for r,x in checked if r.endswith('.webp')),'pngBytes':sum(x['bytes']for r,x in checked if r.endswith('.png')),'totalBytes':sum(x['bytes']for r,x in checked),'flags':[out['productionReady'],out['runtimeUseAllowed']]},indent=2))
