// Batch 13 Part C: Lily tower-defense UI (ui_v003). 1x/2x by DPR, WebP then PNG, cache-busted via Build.url.
// productionReady / sourceReady stay false until Raymond signs off.
const TdUI={m:null,textures:null,scale:'1x',webp:true,failed:new Set(),files:new Map(),stats:{fallbacks:0,requests:[]},
 init(m){this.m=m||{items:{},layout:{}};},
 density(sc){const c=sc?.game?.canvas,r=c?.getBoundingClientRect();return(window.devicePixelRatio||1)*(r?.width&&c?r.width/(sc.scale.gameSize.width||1024):1);},
 pickScale(sc){return(this.density(sc)>=1.5||(window.devicePixelRatio||1)>=1.5)?'2x':'1x';},
 has(name){return!!(this.textures&&this.textures.exists(this.key(name)));},
 key(name){return 'td_'+name;},
 url(name,scale,ext){const it=this.m?.items?.[name],f=it?.files?.[scale||this.scale]?.[ext];if(!f)return'';const path=(this.m.assetRoot||'')+f.relpath;return (typeof Build!=="undefined"?Build.url(path):path);},
 htmlUrl(name){const scale=(window.devicePixelRatio||1)>=1.5?'2x':'1x';const prefer=this.webp!==false;const a=this.url(name,scale,prefer?'webp':'png')||this.url(name,scale,'png')||this.url(name,'1x','png');return a;},
 loadOne(sc,name){const key=this.key(name),it=this.m?.items?.[name];if(!it)return Promise.resolve(null);if(sc.textures.exists(key))return Promise.resolve(key);if(this.failed.has(key))return Promise.resolve(null);
  const scale=this.scale,formats=(typeof Char!=='undefined'&&Char.webp===false)?['png']:['webp','png'];
  return new Promise(resolve=>{const next=i=>{if(i>=formats.length){this.failed.add(key);resolve(null);return;}
    const ext=formats[i],meta=it.files?.[scale]?.[ext];if(!meta){next(i+1);return;}
    const path=(this.m.assetRoot||'')+meta.relpath,im=new Image();this.stats.requests.push(path);
    im.onload=()=>{if(meta.width&&meta.height&&(im.naturalWidth!==meta.width||im.naturalHeight!==meta.height)){if(ext==='webp')this.stats.fallbacks++;next(i+1);return;}
     if(!sc.textures.exists(key))sc.textures.addImage(key,im);this.files.set(key,path);resolve(key);};
    im.onerror=()=>{if(ext==='webp')this.stats.fallbacks++;next(i+1);};
    im.src=(typeof Build!=="undefined"?Build.url(path):path);};next(0);});},
 async loadAll(sc){this.scene=sc;this.textures=sc.textures;this.scale=this.pickScale(sc);this.webp=typeof Char==='undefined'||Char.webp!==false;
  const names=Object.keys(this.m.items||{});
  await Promise.all(names.map(n=>this.loadOne(sc,n)));
  this._prepSheets(sc);this.applyRotate();},
 _prepSheets(sc){const key=this.key('coin_fly_sheet');if(!sc.textures.exists(key))return;const tex=sc.textures.get(key),src=tex.getSourceImage();if(!src)return;
  const frames=8,fw=Math.round(src.width/frames),fh=src.height;if(tex.has('0'))return;
  for(let i=0;i<frames;i++)tex.add(String(i),0,i*fw,0,fw,fh);
  if(sc.anims&&!sc.anims.exists('td_coin_fly'))sc.anims.create({key:'td_coin_fly',frames:Array.from({length:frames},(_,i)=>({key,frame:String(i)})),frameRate:Math.round(1000/70),repeat:-1});},
 img(sc,name,x,y,origin,size){if(!this.has(name))return null;const it=this.m.items[name],d=size||it.display||[0,0];
  const im=sc.add.image(x,y,this.key(name));if(origin)im.setOrigin(origin[0],origin[1]);if(d[0]&&d[1])im.setDisplaySize(d[0],d[1]);return im;},
 nineslice(sc,name,x,y,width,height,left,right,top,bottom){if(!this.has(name)||!sc.add.nineslice)return null;
  try{const ns=sc.add.nineslice(x,y,this.key(name),undefined,width,height,left,right,top||0,bottom||0);ns.setOrigin(0,0);return ns;}catch(e){return null;}},
 fillWidth(prog){if(prog<=0)return 0;return Math.max(36,Math.round(392*Math.min(1,prog)));},
 btn(sc,kind,x,y,w,h,label,cb,fs){// kind: 'retry' | 'map'. Blank art + code label. selected/pressed share the pressed art.
  const c=sc.add.container(x,y),normal=this.has('btn_'+kind+'_normal_blank')?this.key('btn_'+kind+'_normal_blank'):null,pressed=this.has('btn_'+kind+'_pressed_blank')?this.key('btn_'+kind+'_pressed_blank'):normal;
  let im=null;
  if(normal){im=sc.add.image(0,0,normal).setDisplaySize(w,h);c.add(im);}
  else{const g=sc.add.graphics();g.fillStyle(kind==='retry'?0xb9f6ca:0xf3e9ff).fillRoundedRect(-w/2,-h/2,w,h,Math.min(22,h/2));c.add(g);}
  const t=sc.add.text(0,0,label,{fontFamily:FONT,fontSize:(fs||28)+'px',color:'#5a2d6e',align:'center'}).setOrigin(0.5);c.add(t);
  c.setSize(w,h).setInteractive({useHandCursor:true});c.label=t;c.bg=im;
  const show=p=>{if(im&&pressed){im.setTexture(p?pressed:normal).setDisplaySize(w,h);im.y=p?3:0;t.y=p?3:0;}};
  c.on('pointerdown',()=>{show(true);if(typeof Sound!=='undefined'&&Sound.pop)Sound.pop();});
  c.on('pointerup',()=>{show(false);cb&&cb();});
  c.on('pointerout',()=>show(false));
  c.on('pointerupoutside',()=>show(false));
  return c;},
 applyRotate(){const root=document.getElementById('kx-rotate'),img=document.getElementById('kx-rotate-art');if(!root||!img||!this.m)return;
  const portrait=innerWidth<innerHeight,name=portrait?'rotate_portrait_blank':'rotate_landscape_blank';
  const src=this.htmlUrl(name);if(!src)return;img.hidden=false;
  const png=this.url(name,(window.devicePixelRatio||1)>=1.5?'2x':'1x','png');
  img.onerror=()=>{if(png&&img.src!==png)img.src=png;};
  img.src=src;},
};
