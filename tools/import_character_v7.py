#!/usr/bin/env python3
"""Copy approved-for-P0-copy Lily v7 POLISH01. Sources read-only; flags retained, no git/deploy.
Full PNGs are packaged as fallback, but fetched by the browser only if WebP is
unsupported or fails. No full-size WebP duplicate is copied.
"""
import argparse, copy, hashlib, json, pathlib, shutil
ROOT=pathlib.Path(__file__).resolve().parents[1]
P=argparse.ArgumentParser();P.add_argument('--source',default='/workspace/princess-game/art/production_polish_01/character_complete_manifest_v7.json');args=P.parse_args()
source=pathlib.Path(args.source);original=json.loads(source.read_text());m=copy.deepcopy(original);srcroot=pathlib.Path(m['assetRoot']['local']).resolve()
# Keep archival IDs as replacement metadata, but do not package/draw deprecated layers.
m['assets']={k:v for k,v in m['assets'].items() if k not in m['deprecatedAssetsById']}
m['props']={m['B3B4GhostAmendment']['replacements'].get(k,k):v for k,v in m['props'].items()}
# Canonicalize archival alias metadata through the approved replacement chain.
replacements={**m['B3B4GhostAmendment']['replacements'],**m['polish01']['replacements']}
for a in m['assets'].values():
    if 'aliasOf' in a:
        old=a['aliasOf']; seen=set()
        while a['aliasOf'] in replacements:
            assert a['aliasOf'] not in seen;seen.add(a['aliasOf']);a['aliasOf']=replacements[a['aliasOf']]
        if old!=a['aliasOf']:a['aliasOfSource']=old
dest=ROOT/'assets/art/princess/v7';copied={};sourceCopies={}
def copyfile(rel,target,sha=None):
    src=(srcroot/rel).resolve()
    if not src.is_relative_to(srcroot):raise ValueError('Source escapes assetRoot')
    if not src.is_file():raise FileNotFoundError(src)
    data=src.read_bytes()
    if sha and hashlib.sha256(data).hexdigest()!=sha:raise ValueError(f'SHA mismatch: {rel}')
    if str(src) in sourceCopies:return sourceCopies[str(src)]
    out=dest/target;out.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,out)
    path=out.relative_to(ROOT).as_posix();copied[path]=len(data);sourceCopies[str(src)]=path;return path
for aid,a in m['assets'].items():
    a['runtime50']['path']=copyfile(a['runtime50']['path'],f'runtime_50/{aid}.webp',a['runtime50']['sha256'])
    a['path']=copyfile(a['path'],f'fallback/{aid}.png',a.get('sha256'))
    # Do not ship/load full WebP as well as half WebP; record full PNG fallback size.
    a.pop('webp',None)
    a.pop('sourceArt',None) # generated work reference is provenance, not a runtime asset
def thumbs(o):
    if isinstance(o,dict):
        if 'path' in o and '/thumbs/' in o['path']:
            rel=o['path'];o['path']=copyfile(rel,'thumbs/'+rel.split('/thumbs/',1)[0]+'/'+rel.split('/thumbs/',1)[1],o.get('sha256'))
        for v in o.values():thumbs(v)
    elif isinstance(o,list):
        for v in o:thumbs(v)
thumbs(m)
# The runtime manifest is a deliberate projection, not a renamed source manifest.
keys=['schemaVersion','masterId','masterSha256','canvas','anchorsPx','anchorsPxHalf','drawOrder','tieRank','requiredAlways','selection','slotRules','hairPairs','outfits','menuThumbnails','props','headwear','hatCompatibility','expressionLayer','wearableTreasures','assets','poses','poseCatalog','gripPointsPx','gripPointsPxHalf','weapons','weaponDefaultsByOutfit','headwearCompatibility','batch01Thumbnails','treasureSelection','batch02Compatibility','batch02Thumbnails','poseOutfitCoverageRule','B4RightGripAmendment','batch03Compatibility','batch03PoseCompatibility','batch03Thumbnails','deprecatedAssetsById','B3B4GhostAmendment','decodeMemory','loadEstimate','polish01','productionReady','runtimeUseAllowed','outOfScope']
r={k:m[k] for k in keys}
# iconOnly is album art (already shipped), not a wearable layer.
for section in ['headwear','wearableTreasures']:
    for aid,entry in r[section].items():
        if 'iconOnly' in entry:
            entry['iconOnly']['path']='assets/art/treasures/treasure_'+aid+'.png'
r['assetRoot']='.';r['runtime']={'recommended':'half','half':{'scale':0.5,'size':[500,550]},'fallback':{'scale':1,'size':[1000,1100]}}
r['source']={'manifest':source.name,'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'approvalScope':'P0 local copy only; not release approval'}
ui=json.loads((ROOT/'data/character_manifest.json').read_text())
# Keep game-specific jobs/equipment metadata separate from Lily's schema.
r['gameUI']={k:ui[k] for k in ['hairStyles','hairColors','jobs','equipment']}
r['gameUI']['outfits']=[{'id':k,'label':v['name']} for k,v in r['outfits'].items()]
anchors=r['anchorsPx'];positions={'crown':([489,80],145,'head_center'),'flower_crown':([489,100],135,'head_center'),'bow':([640,165],100,'head_center'),'necklace':([500,316],72,'neck_center'),'wings':([500,430],430,'waist_center'),'star_cape':([500,550],320,'waist_center'),'cat':([790,1000],165,'sole_screen_right'),'unicorn':([790,1000],165,'sole_screen_right')}
for e in r['gameUI']['equipment']:
    e['posPx'],e['sizePx'],e['anchor']=positions[e['id']]
    if e['id']=='necklace':e.update(drawOrder=68,part='neck_accessory')
    elif e['id']=='star_cape':e.update(drawOrder=18,part='star_cape')
    else:e['part']={'bow':'bow_accessory','wings':'wings','cat':'pet','unicorn':'pet'}.get(e['id'],'headwear')
    if e['id'] in r['wearableTreasures'] and 'slot' in r['wearableTreasures'][e['id']]:e['slot']=r['wearableTreasures'][e['id']]['slot']
    e['wornLayer']=(r['headwear'].get(e['id']) or r['wearableTreasures'].get(e['id']) or {}).get('wornLayer',False)
# The source only describes right-weapon/shield exclusion in slotRules text.
# Normalize that explicit HANDOFF_BATCH01 section 3 constraint; never infer from IDs.
r['assemblyConstraints']=[{'when':{'weaponHand':'screen_right'},'requiresWeapon':True,'forbidSlots':['shield'],'message':'右手武器與盾牌互斥，請先關閉盾牌再選右手。','source':'HANDOFF_BATCH01 §3 / slotRules.weapon'}]
r['gameHooks']={'heldItem':None,'exclusions':[]}
# New tiara / necklace / ribbon icons replace old album images. Copy, never edit sources.
am=json.loads((ROOT/'data/assets_manifest.json').read_text())
for tid in ['crown','necklace','bow','wings','star_cape']:
    icon=(r['headwear'].get(tid) or r['wearableTreasures'][tid])['icon']
    icon['path']=copyfile(icon['path'],f'icons/treasure_{tid}.png',icon['sha256'])
    if 'webp' in icon:icon['webp']['path']=copyfile(icon['webp']['path'],f'icons/treasure_{tid}.webp',icon['webp']['sha256'])
    am['assets']['treasure_'+tid].update(file=icon['path'],ready=True,source='Lily production_wearables_01 batch03',sha256=icon['sha256'])
(ROOT/'data/assets_manifest.json').write_text(json.dumps(am,ensure_ascii=False,indent=1)+'\n')
r['loadStats']={'files':len(copied),'bytes':sum(copied.values()),'runtime50Bytes':sum(copied[p] for p in {a['runtime50']['path'] for a in r['assets'].values()})}
for pose,p in r['poses'].items():
    for outfit in r['outfits']:
        mapping=p.get('outfitReplacements',{}).get(outfit,{})
        reason=p.get('noOutfitReplacementRequired',{}).get(outfit,'')
        assert bool(mapping) != bool(isinstance(reason,str) and reason.strip()), f'Invalid pose coverage: {pose}/{outfit}'
assert r['productionReady'] is False and r['runtimeUseAllowed'] is False
out=ROOT/'data/character_runtime_v7.json';out.write_text(json.dumps(r,ensure_ascii=False,indent=1)+'\n')
print(json.dumps({'manifest':str(out),'copied':len(copied),'bytes':sum(copied.values()),'runtime50':r['loadStats']['runtime50Bytes'],'productionReady':r['productionReady']},ensure_ascii=False))
