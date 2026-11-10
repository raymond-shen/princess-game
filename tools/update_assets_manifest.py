#!/usr/bin/env python3
"""檢查 data/assets_manifest.json 裡每個素材檔：檔案存在且尺寸、RGBA 正確就設 ready=true，否則 ready=false。
用法：在專案根目錄執行 python3 tools/update_assets_manifest.py（加 --dry 只檢查不寫入）"""
import json,os,sys
from PIL import Image
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));p=os.path.join(root,'data','assets_manifest.json')
m=json.load(open(p,encoding='utf-8'));changed=0
for k,a in m['assets'].items():
    f=os.path.join(root,a['file']);ok=False;msg='缺檔'
    if os.path.exists(f):
        im=Image.open(f);ok=im.size==(a['w'],a['h']) and im.mode==a.get('mode','RGBA')
        msg='OK' if ok else f'尺寸/模式不符：{im.size} {im.mode}，應為 {a["w"]}x{a["h"]} {a.get("mode","RGBA")}'
    if a.get('ready')!=ok:a['ready']=ok;changed+=1
    print(f"{'✔' if ok else '·'} {k:24s} {a['file']}  {msg}")
if '--dry' not in sys.argv and changed:
    json.dump(m,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=1);print(f'已更新 {changed} 筆 ready')
