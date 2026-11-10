// Lily character-complete-0.7 / POLISH01 adapter. 1000x1100 logical canvas, half runtime.
// Composite cache is bounded; decoded layer Images only live while composing.
const Char={m:null,v3:null,webp:false,cache:new Map(),pending:new Map(),sources:new Map(),failedAssets:new Set(),maxCache:8,serial:0,
 stats:{fetches:[],composites:0,liveDecoded:0,peakDecoded:0,liveDecodedBytes:0,peakDecodedBytes:0,peakLayers:0,fallbacks:0},
 init(v){this.v3=v;this.memoryBudget={maxLayers:v.loadEstimate?.layers?.max||14,halfLayerBytes:1100000,halfDecodedComboBytes:15400000,fullDecodedComboBytes:61600000,compositeBytes:1100000,cacheBytes:this.maxCache*1100000};this.m=Object.assign({},v.gameUI,{masterId:v.masterId,anchorsPx:v.anchorsPx,runtime:v.runtime,assets:v.assets});return this.detectWebP().then(ok=>this.webp=ok);},
 detectWebP(){if(typeof URLSearchParams!=='undefined'&&new URLSearchParams(location.search).get('png')==='1')return Promise.resolve(false);
  // Test a real half-size alpha WebP, not the user-agent. Used as detection only; reuse not required.
  const body=this.v3.requiredAlways.find(id=>this.v3.assets[id].part==='body'),a=this.v3.assets[body];return new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i.width===500&&i.height===550);i.onerror=()=>resolve(false);i.src=a.runtime50.path;});},
 normalize(sel){const c=Object.assign({},sel||{}),v=this.v3;if(!v)return c;
  c.job=this.m.jobs.some(j=>j.id===c.job)?c.job:'warrior';
  c.hair=c.hair||c.hairStyleId||'A1';c.hairColor=c.hairColor||c.hairColorId||'brown';c.outfit=c.outfit||c.outfitId||'B1';
  if(!v.selection.hairStyleId.includes(c.hair))c.hair='A1';if(!v.selection.hairColorId.includes(c.hairColor))c.hairColor='brown';if(!v.outfits[c.outfit])c.outfit='B1';
  delete c.hairStyleId;delete c.hairColorId;delete c.outfitId;
  if(c.headwear!==undefined&&c.headwear!==null&&!v.headwear[c.headwear])delete c.headwear;
  if(c.accessoriesOff)c.accessoriesOff=Array.isArray(c.accessoriesOff)?[...new Set(c.accessoriesOff.map(id=>v.B3B4GhostAmendment?.replacements[id]||id).filter(id=>!!v.assets[id]))]:[];
  if(v.weapons){
   if(c.weaponId===undefined&&c.heldItem){const legacy={prop_B3_toy_sword:'sword',sword:'sword',bow:'bow',wand:'wand'};if(legacy[c.heldItem])c.weaponId=legacy[c.heldItem];}
   if(c.weaponId===undefined&&(c.accessoriesOff||[]).includes('prop_B3_toy_sword'))c.weaponId=null;
   if(c.weaponId!==undefined&&c.weaponId!==null&&!v.weapons[c.weaponId])c.weaponId=null;
   if(c.weaponHand&&!v.selection.weaponHand.includes(c.weaponHand))delete c.weaponHand;
   if(c.poseId===undefined&&v.poses[c.pose])c.poseId=c.pose;
   if(c.poseId!==undefined&&!v.poses[c.poseId])delete c.poseId;
  }return c;},
 migrateSave(d){if(!d||!this.v3)return d;const old=JSON.stringify(d);if(d.character)d.character=this.normalize(d.character);
  // Preserve illegal legacy back-equipment combinations for explicit correction;
  // never silently pick wings/cape when importing an old placeholder-era save.
  const eq=Array.isArray(d.equipped)?d.equipped:[];d.equipped=[];eq.forEach(id=>{const e=this.m.equipment.find(q=>q.id===id);if(!e||d.equipped.includes(id))return;if(e.slot!=='back_equipment')d.equipped=d.equipped.filter(k=>this.m.equipment.find(q=>q.id===k)?.slot!==e.slot);d.equipped.push(id);});
  if(d.character&&d.character.headwear===undefined){const crown=d.equipped.find(id=>this.v3.headwear[id]);if(crown)d.character.headwear=crown;}
  const version=this.v3.polish01?7:this.v3.batch03Compatibility?6:this.v3.treasureSelection?5:this.v3.poses?4:3;if(d.wardrobeVersion!==version){try{const key='kx_save_v2_before_wardrobe'+version;if(!localStorage.getItem(key))localStorage.setItem(key,old);}catch(e){}d.wardrobeVersion=version;}
  return d;},
 headwear(sel,equipped){const s=this.normalize(sel);if(s.headwear!==undefined)return s.headwear;
  const worn=(equipped||[]).find(id=>this.v3.headwear[id]);if(worn)return worn;
  return(this.v3.outfits[s.outfit].defaultAccessories||[]).find(id=>this.v3.assets[id].slot==='headwear')||null;},
 resolve(sel,equipped,expr){return this.v3.poses?this.resolveV4(sel,equipped,expr):this.resolveV3(sel,equipped,expr);},
 resolveV3(sel,equipped,expr){const v=this.v3,s=this.normalize(sel),eq=equipped||[],hat=this.headwear(s,eq),off=s.accessoriesOff||[];
  const pair=v.hairPairs[s.hair+'_'+s.hairColor],hair=pair.hatVariants&&pair.hatVariants[hat]||pair;
  let ids=[...v.requiredAlways,hair.hair_back,hair.hair_front,...v.outfits[s.outfit].parts];
  ids.push(...(v.outfits[s.outfit].defaultAccessories||[]).filter(id=>v.assets[id].slot!=='headwear'&&!off.includes(id)));
  const placeholders=[];const addWear=id=>{const e=v.headwear[id]||v.wearableTreasures[id]||{},ui=this.m.equipment.find(x=>x.id===id);
   if(e.wornLayer===true){const ls=e.layers||e.parts||(e.assetId?[e.assetId]:v.assets[id]?[id]:[]);ids.push(...ls);if(e.frontLayers)ids.push(...e.frontLayers);}
   else if(ui)placeholders.push(ui);};
  if(hat)addWear(hat);eq.filter(id=>!v.headwear[id]).forEach(addWear);
  const eid=expr&&v.expressionLayer.options.find(id=>id==='expr_'+expr||id===expr);if(eid&&v.assets[eid].requiresMaster===v.masterId)ids.push(eid);
  // Adapter-owned bridge for the upcoming spec: null until Lily supplies IDs/rules.
  // No weapon shape is invented. A manifest record declares ONE grip anchor,
  // arm replacement + pose/hand variant + attached weapon layers + exclusions.
  const hook=v.gameHooks&&v.gameHooks.heldItem,attachments=[];
  const held=hook&&s.heldItem&&hook.items&&hook.items[s.heldItem];
  let pose=s.pose||null,handVariant=s.handVariant||null;
  if(held){const spec=(held.variants&&held.variants[s.handVariant])||held;const anchor=spec.gripAnchor||hook.gripAnchor;
   const valid=anchor&&v.anchorsPx[anchor]&&spec.armReplacement&&v.assets[spec.armReplacement]&&(spec.weaponLayers||[]).every(id=>!!v.assets[id]);
   if(valid){ids=ids.filter(id=>v.assets[id].part!=='arm_front');ids.push(spec.armReplacement);pose=spec.pose||pose;handVariant=spec.handVariant||handVariant;
    (spec.weaponLayers||[]).forEach(id=>attachments.push({id,anchor,originPx:spec.originPx||v.assets[id].originPx||[0,0]}));}}
  // Explicit data-driven selection exclusions. Rules can match outfit/hair/headwear/
  // heldItem/pose/handVariant and suppress asset IDs or treasure IDs, not source files.
  const state={outfit:s.outfit,hair:s.hair,headwear:hat,heldItem:s.heldItem||null,pose,handVariant};
  const rules=[...((v.gameHooks&&v.gameHooks.exclusions)||[]),...((held&&held.exclusions)||[])];
  for(const r of rules){if(Object.entries(r.when||{}).every(([k,values])=>[].concat(values).includes(state[k]))){ids=ids.filter(id=>!(r.assets||[]).includes(id));for(let i=placeholders.length-1;i>=0;i--)if((r.treasures||[]).includes(placeholders[i].id))placeholders.splice(i,1);}}
  ids=[...new Set(ids)].filter(id=>!!v.assets[id]);
  const order=id=>[v.assets[id].drawOrder,v.tieRank[v.assets[id].part]||0,id];
  ids.sort((a,b)=>{const A=order(a),B=order(b);return A[0]-B[0]||A[1]-B[1]||A[2].localeCompare(B[2]);});
  placeholders.sort((a,b)=>a.drawOrder-b.drawOrder||(v.tieRank[a.part]||0)-(v.tieRank[b.part]||0)||a.id.localeCompare(b.id));
  return{ids,placeholders,hat,attachments,pose,handVariant,selection:s,expr:eid||null};},
 // V4: source pose replacements are atomic. Weapons are already registered to
 // the grip points on a full canvas, so do NOT attach/translate them a second time.
 config(sel){const s=this.normalize(sel),v=this.v3,weapon=s.weaponId===undefined?(v.weaponDefaultsByOutfit[s.outfit]||null):s.weaponId,w=weapon&&v.weapons[weapon],hand=w?(s.weaponHand||w.defaultHand):null;
  const pose=w?w.requiresPoseByHand[hand]:(s.poseId||'neutral');return{s,weapon,hand,pose};},
 // Wearable position/exclusion tables remain distinct from hairPairs.hatVariants.
 wearableLabel(id){return {necklace:'項鍊',bow:'髮上蝴蝶結',wings:'翅膀',star_cape:'星星披風',crown:'公主小皇冠',flower_crown:'花圈'}[id]||'飾品';},
 wearableLayers(id,sel,equipped){const v=this.v3,s=this.normalize(sel),hat=this.headwear(s,equipped||[]),e=v.headwear[id]||v.wearableTreasures[id]||{};
  if(e.backAsset&&e.frontAssetsByOutfit)return e.frontAssetsByOutfit[s.outfit]?[e.backAsset,e.frontAssetsByOutfit[s.outfit]]:[];
  if(e.assetsByOutfit)return e.assetsByOutfit[s.outfit]?[e.assetsByOutfit[s.outfit]]:[];
  if(e.assetsByHairStyle){const aid=e.headwearVariantsByHair?.[s.hair]?.[hat]||e.assetsByHairStyle[s.hair];return aid?[aid]:[];}
  const hp=v.hairPairs[s.hair+'_'+s.hairColor],hv=hp.hatVariants?.[hat]||hp,aid=id===hat?(hv.headwear_asset||e.asset||e.assetId||id):(e.asset||e.assetId||id);
  return [...(e.layers||e.parts||[aid]),...(e.frontLayers||[])];},
 wearableIssues(id,sel,equipped){const v=this.v3,s=this.normalize(sel),e=v.headwear[id]||v.wearableTreasures[id];if(!e)return[];
  const name=this.wearableLabel(id),reason=e.exclusiveWithOutfits?.[s.outfit];if(reason)return[name+'與 '+s.outfit+' 互斥：'+reason];
  for(const other of equipped||[]){if(other===id)continue;const conflict=e.exclusiveWithTreasures?.[other]||v.wearableTreasures[other]?.exclusiveWithTreasures?.[id];if(conflict)return[name+'與'+this.wearableLabel(other)+'互斥：'+conflict];}
  if(e.allowedHeadwear&&!e.allowedHeadwear.includes(this.headwear(s,equipped||[])))return['這件飾品與目前頭飾不相容。'];
  if(e.wornLayer&&(!this.wearableLayers(id,s,equipped).length||this.wearableLayers(id,s,equipped).some(a=>!v.assets[a])))return['這件飾品尚未交付目前搭配的圖層。'];
  return[];},
 wearableThumb(id,sel,equipped,size=128){const aid=this.wearableLayers(id,sel,equipped)[0];return this.v3.assets[aid]?.thumb?.[String(size)];},
 selectionIssues(sel,equipped){const v=this.v3;if(!v.poses)return[];const {s,weapon,hand,pose}=this.config(sel),off=s.accessoriesOff||[];
  const acc=v.outfits[s.outfit].defaultAccessories.filter(id=>!off.includes(id)),issues=[];
  for(const rule of v.assemblyConstraints||[]){const state={weaponHand:hand,weaponId:weapon,outfit:s.outfit,hair:s.hair,headwear:this.headwear(s,equipped||[]),poseId:pose};
   if((!rule.requiresWeapon||weapon)&&Object.entries(rule.when||{}).every(([k,vs])=>[].concat(vs).includes(state[k]))&&acc.some(id=>(rule.forbidSlots||[]).includes(v.assets[id].slot)))issues.push(rule.message);}
  const p=v.poses[pose],map=p?.outfitReplacements?.[s.outfit],reason=p?.noOutfitReplacementRequired?.[s.outfit];
  if(v.poseOutfitCoverageRule?(!p||!!(map&&Object.keys(map).length)===!!(typeof reason==='string'&&reason.trim())):(pose!=='neutral'&&!map))issues.push('這套服裝尚未交付此姿勢的袖口變體，暫時不能使用。');
  for(const id of equipped||[])issues.push(...this.wearableIssues(id,s,equipped));
  return issues;},
 resolveV4(sel,equipped,expr){const v=this.v3,eq=equipped||[],cfg=this.config(sel),s=cfg.s,off=s.accessoriesOff||[],hat=this.headwear(s,eq),issues=this.selectionIssues(s,eq);
  // Reject invalid requests as a whole: neutral safe preview, visible message in
  // Creator, and save button blocked. Never silently remove shields from a choice.
  const pose=issues.length?'neutral':cfg.pose,weapon=issues.length?null:cfg.weapon,hand=weapon?cfg.hand:null,p=v.poses[pose];
  const pair=v.hairPairs[s.hair+'_'+s.hairColor],hair=pair.hatVariants[hat]||pair,replace=p.replaceAssets||{},outfitReplace=(p.outfitReplacements||{})[s.outfit]||{};
  let ids=[...v.requiredAlways.map(id=>replace[id]||id),hair.hair_back,hair.hair_front,...v.outfits[s.outfit].parts.map(id=>outfitReplace[id]||id)];
  ids.push(...v.outfits[s.outfit].defaultAccessories.filter(id=>v.assets[id].slot!=='headwear'&&!off.includes(id)));
  const placeholders=[];const addWear=id=>{const e=v.headwear[id]||v.wearableTreasures[id]||{},ui=this.m.equipment.find(q=>q.id===id);
   if(e.wornLayer){if(!this.wearableIssues(id,s,eq).length)ids.push(...this.wearableLayers(id,s,eq));}
   else if(ui)placeholders.push(ui);};if(hat)addWear(hat);eq.filter(id=>!v.headwear[id]).forEach(addWear);
  if(weapon)ids.push(...[].concat(v.weapons[weapon].layersByHand[hand]));
  const requested=expr===undefined?(s.expression===undefined?p.defaultExpression:s.expression):expr;
  const eid=requested&&v.expressionLayer.options.find(id=>id===requested||id==='expr_'+requested);if(eid&&v.assets[eid].requiresMaster===v.masterId)ids.push(eid);
  ids=[...new Set(ids)].filter(id=>!!v.assets[id]);ids.sort((a,b)=>v.assets[a].drawOrder-v.assets[b].drawOrder||(v.tieRank[v.assets[a].part]||0)-(v.tieRank[v.assets[b].part]||0)||a.localeCompare(b));
  return{ids,placeholders,hat,attachments:[],pose,handVariant:null,weapon,weaponHand:hand,selection:s,expr:eid||null,issues};},
 comboKey(r){return 'cc7_'+JSON.stringify([r.ids,r.placeholders.map(e=>[e.id,e.drawOrder,e.posPx,e.sizePx]),r.attachments,r.pose,r.handVariant,r.issues||[]]);},
 // Compatibility metadata for tests/debugging. Loader never preloads an entire wardrobe.
 layerFiles(sel,equipped,expr){return this.resolve(sel,equipped||[],expr).ids.map(id=>({key:id,file:this.webp?this.v3.assets[id].runtime50.path:this.v3.assets[id].path,order:this.v3.assets[id].drawOrder}));},
 image(path){if(this.sources.has(path))return this.sources.get(path);this.stats.fetches.push(path);
  const p=new Promise((res,rej)=>{const i=new Image();i.onload=()=>{this.stats.liveDecoded++;this.stats.peakDecoded=Math.max(this.stats.peakDecoded,this.stats.liveDecoded);this.stats.liveDecodedBytes+=i.width*i.height*4;this.stats.peakDecodedBytes=Math.max(this.stats.peakDecodedBytes,this.stats.liveDecodedBytes);res(i);};i.onerror=()=>rej(new Error('Character image failed: '+path));i.src=path;});
  this.sources.set(path,p);return p;},
 async assetImage(id){if(this.failedAssets.has(id))return {im:null,path:null};const a=this.v3.assets[id];if(this.webp&&a.runtime50){try{return {im:await this.image(a.runtime50.path),path:a.runtime50.path};}catch(e){this.sources.delete(a.runtime50.path);this.stats.fallbacks++;}}
  try{return{im:await this.image(a.path),path:a.path};}catch(e){this.sources.delete(a.path);this.failedAssets.add(id);console.warn('Character layer unavailable (using safe princess fallback):',id);return{im:null,path:null};}},
 async prepare(scene,sel,equipped,expr){const r=this.resolve(sel,equipped,expr),key=this.comboKey(r);if(this.cache.has(key)){const e=this.cache.get(key);e.used=++this.serial;return e;}
  if(this.pending.has(key))return this.pending.get(key);
  this.stats.peakLayers=Math.max(this.stats.peakLayers,r.ids.length);const promise=(async()=>{const layers=[];try{for(const id of [...r.ids,...r.attachments.map(a=>a.id)])layers.push({id,...await this.assetImage(id)});
    const cv=document.createElement('canvas');cv.width=500;cv.height=550;const x=cv.getContext('2d');
    const degraded=r.ids.some(id=>{const p=this.v3.assets[id].part;return ['body','outfit_main','arm_front'].includes(p)&&!layers.find(l=>l.id===id)?.im;});
    const all=r.ids.map(id=>({id,order:this.v3.assets[id].drawOrder,tie:this.v3.tieRank[this.v3.assets[id].part]||0}));
    r.placeholders.forEach(e=>all.push({e,order:e.drawOrder,tie:this.v3.tieRank[e.part]||0}));
    r.attachments.forEach(a=>all.push({attachment:a,id:a.id,order:this.v3.assets[a.id].drawOrder,tie:this.v3.tieRank[this.v3.assets[a.id].part]||0}));
    all.sort((a,b)=>a.order-b.order||a.tie-b.tie||String(a.id||a.e.id).localeCompare(String(b.id||b.e.id)));
    if(degraded){x.font='220px "Noto Color Emoji",sans-serif';x.textAlign='center';x.textBaseline='bottom';x.fillText('👸',250,515);}
    for(const z of (degraded?[]:all)){if(z.e){const e=z.e;x.save();x.font=`${e.sizePx*0.5}px "Apple Color Emoji","Noto Color Emoji",sans-serif`;x.textAlign='center';x.textBaseline='middle';if(e.id==='wings')x.globalAlpha=0.85;x.fillText(e.emoji,e.posPx[0]*0.5,e.posPx[1]*0.5);x.restore();}
     else{const im=layers.find(q=>q.id===z.id)?.im;if(!im)continue;if(z.attachment){const a=z.attachment,at=this.v3.anchorsPx[a.anchor];const logical=this.v3.assets[a.id].canvas||[1000,1100];x.drawImage(im,(at[0]-a.originPx[0])*0.5,(at[1]-a.originPx[1])*0.5,logical[0]*0.5,logical[1]*0.5);}
      else x.drawImage(im,0,0,500,550);}}
    const tex='char_combo_'+(++this.serial);scene.textures.addCanvas(tex,cv);const entry={key,tex,refs:0,used:this.serial,ids:r.ids,hat:r.hat,expr:r.expr,pose:r.pose,weapon:r.weapon||null,weaponHand:r.weaponHand||null,issues:r.issues||[],canvas:cv,degraded};this.cache.set(key,entry);this.stats.composites++;return entry;
   }finally{for(const l of layers){if(this.sources.has(l.path)){this.sources.delete(l.path);this.stats.liveDecoded=Math.max(0,this.stats.liveDecoded-1);this.stats.liveDecodedBytes=Math.max(0,this.stats.liveDecodedBytes-(l.im?l.im.width*l.im.height*4:0));}}this.pending.delete(key);}})();
  this.pending.set(key,promise);return promise;},
 trim(scene){if(this.cache.size<=this.maxCache)return;const candidates=[...this.cache.values()].filter(e=>e.refs===0).sort((a,b)=>a.used-b.used);while(this.cache.size>this.maxCache&&candidates.length){const e=candidates.shift();scene.textures.remove(e.tex);this.cache.delete(e.key);}},
 ensure(scene,sel,cb,equipped,expr){if(equipped===undefined)equipped=typeof Save!=='undefined'&&Save.data?Save.data.equipped:[];
  let alive=true;const stop=()=>alive=false;scene.events.once('shutdown',stop);const done=()=>{scene.events.off('shutdown',stop);if(alive&&scene.sys&&scene.sys.displayList)cb();};this.prepare(scene,sel,equipped,expr).then(done).catch(e=>{console.error(e);done();});},
 build(scene,x,y,h,sel,equipped,expr){const c=scene.add.container(x,y),s=h/1100;let entry=null,dead=false;
  c.logicalHeight=h;c.logicalScale=s;c.setSize(1000*s,1100*s);
  const attach=e=>{if(dead||!c.scene||!scene.sys.displayList)return;c.removeAll(true);entry=e;e.refs++;const im=scene.add.image(-500*s,-1030*s,e.tex).setOrigin(0,0).setScale(h/550);c.add(im);c.compositeKey=e.tex;c.layerIds=e.ids;c.headwear=e.hat;c.expression=e.expr;c.pose=e.pose;c.weapon=e.weapon;c.weaponHand=e.weaponHand;c.selectionIssues=e.issues;c.rejected=!!e.issues.length;if(c.rejected)c.add(scene.add.text(0,8,'裝備衝突：請到換裝頁調整',{fontFamily:'sans-serif',fontSize:Math.max(9,Math.round(h/35))+'px',color:'#c2185b',backgroundColor:'#fff7fb',padding:{x:3,y:2}}).setOrigin(0.5,0));c.rendered=true;this.trim(scene);};
  const r=this.resolve(sel,equipped||[],expr),e=this.cache.get(this.comboKey(r));if(e)attach(e);else c.ready=this.prepare(scene,sel,equipped||[],expr).then(attach).catch(err=>console.error(err));
  c.once('destroy',()=>{dead=true;if(entry)entry.refs=Math.max(0,entry.refs-1);this.trim(scene);});return c;},
 exprOK(k){const id='expr_'+k,a=this.v3&&this.v3.assets[id];return !!(a&&a.requiresMaster===this.v3.masterId);},
 thumb(which,id,color,size=128,hat=null){let e;if(which==='hair'){const c=color||'brown';e=(this.v3.batch01Thumbnails&&this.v3.batch01Thumbnails.hairHeadwear[id+'_'+c+'_'+hat])||this.v3.hairPairs[id+'_'+c].thumb;}else if(which==='outfit')e=this.v3.outfits[id].thumbV6||this.v3.outfits[id].thumbV4||this.v3.outfits[id].thumb;else if(which==='weapon')e=this.v3.weapons[id].thumb;else if(which==='pose')e=this.v3.poses[id].thumb;else e=this.v3.menuThumbnails&&this.v3.menuThumbnails.hairSwatch&&this.v3.menuThumbnails.hairSwatch[id];
  return e&&e[String(size)];},
 ensureThumbs(scene,entries,cb){const list=entries.filter(e=>e&&e.meta&&!scene.textures.exists(e.key));if(!list.length){cb();return;}
  let left=list.length;for(const e of list){const file=this.webp?e.meta.webp:e.meta.png;const im=new Image();im.onload=()=>{if(!scene.textures.exists(e.key))scene.textures.addImage(e.key,im);if(--left===0&&scene.sys.displayList)cb();};im.onerror=()=>{if(this.webp&&im.src.indexOf(e.meta.png.path)<0)im.src=e.meta.png.path;else if(--left===0)cb();};im.src=file.path;}},
 wear(d,id){const e=this.m.equipment.find(q=>q.id===id);if(!e)return{ok:false,issues:['找不到這件飾品。']};const on=d.equipped.includes(id),character={...d.character};if(e.slot==='headwear')character.headwear=on?null:id;
  // Check the full candidate BEFORE same-slot replacement. A back-slot conflict
  // must reject, not secretly remove the item the player previously selected.
  const candidate=on?d.equipped.filter(k=>k!==id):[...d.equipped,id],issues=!on?this.selectionIssues(character,candidate):[];
  if(issues.length)return{ok:false,issues};d.equipped=on?candidate:candidate.filter(k=>k===id||this.m.equipment.find(q=>q.id===k)?.slot!==e.slot);
  if(d.character&&e.slot==='headwear')d.character.headwear=character.headwear;return{ok:true,issues:[]};}
};
