// Frozen Chinese word <-> picture ID bridge. Only declared, decoded, owned art is usable.
const QuestionArt={map:null,manifest:null,textures:null,pending:new Map(),failed:new Set(),files:new Map(),highUse:new Map(),highRefs:new Map(),maxHigh:3,stats:{requests:[],fallbacks:0},
 init(map,manifest){this.map=map;this.manifest=manifest;},
 id(w){const id=this.map?.byWord?.[w?.id];return /^\d{4}$/.test(id||'')&&this.map.byId[id]===w.id?id:null;},
 density(sc){const c=sc?.game?.canvas,r=c?.getBoundingClientRect();return(window.devicePixelRatio||1)*(r?.width&&c? r.width/(sc.scale.gameSize.width||1024):1);},
 resolution(sc,width,height){const d=this.density(sc);return width*d<=320&&height*d<=200?'320x200':width*d<=640&&height*d<=400?'640x400':'1280x800';},
 key(id,size){return 'question_'+id+'_'+size;},
 texture(w,sc,width=512,height=320){const id=this.id(w),entry=this.manifest?.items?.[id];if(!id||entry?.wordId!==w.id||entry.pictureId!==id)return null;const preferred=this.resolution(sc,width,height),sizes=[preferred,...['1280x800','640x400','320x200'].filter(s=>s!==preferred)];return sizes.map(s=>this.key(id,s)).find(k=>this.textures?.exists(k))||null;},
 has(w){return!!this.texture(w,this.scene);},
 loadOne(sc,id,size){const key=this.key(id,size);if(sc.textures.exists(key))return Promise.resolve(key);if(this.failed.has(key))return Promise.resolve(null);if(this.pending.has(key))return this.pending.get(key);
  const entry=this.manifest.items[id],formats=Char.webp?['webp','png']:['png'];let index=0;
  const job=new Promise(resolve=>{const next=()=>{const ext=formats[index++],m=entry?.files?.[size]?.[ext];if(!ext){this.failed.add(key);resolve(null);return;}const expected=size+'/word_'+id+'.'+ext;if(!m||m.relpath!==expected){next();return;}const url='assets/art/questions/'+expected,i=new Image();this.stats.requests.push(url);
   i.onload=()=>{if(i.naturalWidth!==m.width||i.naturalHeight!==m.height){next();return;}if(!sc.textures.exists(key))sc.textures.addImage(key,i);this.files.set(key,url);if(size==='1280x800')this.highUse.set(key,Date.now());resolve(key);this.trimHigh();};i.onerror=()=>{if(ext==='webp')this.stats.fallbacks++;next();};i.src=Build.url(url);};next();}).finally(()=>this.pending.delete(key));this.pending.set(key,job);return job;},
 async loadAll(sc){this.scene=sc;this.textures=sc.textures;const sizes=new Set([[140.8,88],[512,320],[240,150]].map(([w,h])=>{const r=this.resolution(sc,w,h);return r==='1280x800'?'640x400':r;}));await Promise.all(Object.entries(this.manifest?.items||{}).map(async([id,e])=>{if(this.map?.byId?.[id]!==e.wordId||this.map?.byWord?.[e.wordId]!==id)return;await Promise.all([...sizes].map(size=>this.loadOne(sc,id,size)));if(!['320x200','640x400','1280x800'].some(s=>sc.textures.exists(this.key(id,s))))await this.loadOne(sc,id,[...sizes][0]==='320x200'?'640x400':'320x200');}));},
 trimHigh(){const candidates=[...this.highUse].sort((a,b)=>a[1]-b[1]);for(const[k]of candidates){if(this.highUse.size<=this.maxHigh)break;if(this.highRefs.get(k)>0)continue;if(this.textures.exists(k))this.textures.remove(k);this.files.delete(k);this.highUse.delete(k);this.highRefs.delete(k);}},
 image(sc,w,x,y,width,height){const key=this.texture(w,sc,width,height);if(!key)return null;// Full-bleed bitmap only: no white backing, inset outline, crop or corner mask.
  const im=sc.add.image(x,y,key).setDisplaySize(width,height);let pinned=null;
  const pin=k=>{if(pinned===k)return;if(pinned){this.highRefs.set(pinned,Math.max(0,(this.highRefs.get(pinned)||0)-1));pinned=null;}if(k?.endsWith('_1280x800')){pinned=k;this.highRefs.set(k,(this.highRefs.get(k)||0)+1);this.highUse.set(k,Date.now());}};
  pin(key);im.once('destroy',()=>{pin(null);this.trimHigh();});im.setData({pictureId:this.id(w),pictureFile:this.files.get(key)});const wanted=this.resolution(sc,width,height);
  if(key!==this.key(this.id(w),wanted))this.loadOne(sc,this.id(w),wanted).then(k=>{if(k&&im.scene&&im.active&&this.textures.exists(k)){pin(k);im.setTexture(k).setDisplaySize(width,height);im.setData('pictureFile',this.files.get(k));}this.trimHigh();});return im;}
};
