// Art hooks: data/assets_manifest.json maps keys -> files. Only entries with ready:true are loaded;
// anything missing (or failing to load) falls back to the emoji / generated particle textures.
const Art={m:{assets:{}},failed:{},
 init(m){this.m=m&&m.assets?m:{assets:{}};},
 entry(k){return this.m.assets[k]||{};},
 queue(sc){sc.load.on('loaderror',f=>{if(f&&f.key&&f.key.startsWith('art_')){this.failed[f.key.slice(4)]=true;console.warn('art missing, using fallback:',f.key);}});
  for(const[k,a]of Object.entries(this.m.assets)){if(a.ready&&a.file&&!k.startsWith('princess_expr_')&&!sc.textures.exists('art_'+k))sc.load.image('art_'+k,a.file);}},
 has(sc,k){return sc.textures.exists('art_'+k)&&!this.failed[k];},
 // expression overlays are drawn for one specific master; skip them (emoji bubble instead) on other masters
 exprOK(sc,k){return typeof Char!=='undefined'&&Char.exprOK(k);},
 fxMul(sc,k){return this.has(sc,k)?64/sc.textures.get('art_'+k).getSourceImage().width:1;},
 // Image (manifest origin, fit into `size` px) or emoji text fallback (bottom-center unless origin given).
 make(sc,x,y,k,size,fallback,origin){const a=this.entry(k);const o=origin||a.origin||[0.5,1];let g;
  if(this.has(sc,k)){g=sc.add.image(x,y,'art_'+k).setOrigin(o[0],o[1]);const s=size/Math.max(g.width,g.height);g.setScale(s);g.baseScale=s;g.isArt=true;}
  else{g=sc.add.text(x,y,fallback||a.fallback||'❔',{fontSize:Math.round(size*0.8)+'px',padding:{top:6,bottom:6}}).setOrigin(o[0],o[1]);g.baseScale=1;g.isArt=false;}
  return g;},
 // particle texture key for fx_star / fx_sparkle: real art if present, else a generated shape
 fxKey(sc,k){if(this.has(sc,k))return'art_'+k;const gk=k==='fx_star'?'gen_star':'gen_sparkle';if(!sc.textures.exists(gk)){const g=sc.make.graphics({x:0,y:0,add:false});g.fillStyle(0xffffff);
   if(gk==='gen_star'){const pts=[];for(let i=0;i<10;i++){const r=i%2?13:32,a=-Math.PI/2+i*Math.PI/5;pts.push(new Phaser.Geom.Point(32+r*Math.cos(a),32+r*Math.sin(a)));}g.fillPoints(pts,true);}
   else{const p=(a,b,c,d)=>g.fillPoints([a,b,c,d].map(q=>new Phaser.Geom.Point(q[0],q[1])),true);p([32,0],[38,26],[32,64],[26,26]);p([0,32],[26,26],[64,32],[26,38]);g.fillCircle(32,32,7);}
   g.generateTexture(gk,64,64);g.destroy();}return gk;}};
// ---------- shared effects (work with or without art) ----------
// Defeated monster turns into stars that fly away.
function fxStarsAway(sc,x,y,n){const key=Art.fxKey(sc,'fx_star'),k1=Art.fxMul(sc,'fx_star'),k2=Art.fxMul(sc,'fx_sparkle');const cols=[0xfff176,0xffd54f,0xff9ec4,0xb39ddb,0x80deea];n=n||7;
 for(let i=0;i<n;i++){const s=sc.add.image(x,y,key).setDepth(42).setTint(cols[i%cols.length]).setScale(0.15*k1);const ang=-Math.PI/2+(i-(n-1)/2)*0.38+Phaser.Math.FloatBetween(-0.12,0.12);
  const dist=Phaser.Math.Between(170,280);sc.tweens.add({targets:s,x:x+Math.cos(ang)*dist,y:y+Math.sin(ang)*dist-40,angle:Phaser.Math.Between(240,540),scale:{from:0.15*k1,to:Phaser.Math.FloatBetween(0.45,0.7)*k1},
   duration:Phaser.Math.Between(650,900),delay:i*35,ease:'Cubic.easeOut',onComplete:()=>sc.tweens.add({targets:s,alpha:0,scale:0.1,y:s.y-40,duration:300,onComplete:()=>s.destroy()})});}
 const p=sc.add.particles(x,y,Art.fxKey(sc,'fx_sparkle'),{speed:{min:60,max:180},scale:{start:0.35*k2,end:0},lifespan:500,tint:cols,quantity:10,emitting:false}).setDepth(41);p.explode(10);sc.time.delayedCall(700,()=>p.destroy());
 sc.__fxStarsCount=(sc.__fxStarsCount||0)+1;}
// Sparkle burst on a correct answer.
function fxSparkle(sc,x,y,depth){const key=Art.fxKey(sc,'fx_sparkle'),k2=Art.fxMul(sc,'fx_sparkle');const d=depth||110;
 const ring=sc.add.circle(x,y,20,0xffffff,0).setStrokeStyle(6,0xfff59d,1).setDepth(d);sc.tweens.add({targets:ring,radius:110,alpha:0,duration:450,onComplete:()=>ring.destroy()});
 const p=sc.add.particles(x,y,key,{speed:{min:100,max:300},scale:{start:0.6*k2,end:0},rotate:{start:0,end:360},lifespan:650,tint:[0xffffff,0xfff59d,0xff9ec4,0x80deea],quantity:16,emitting:false}).setDepth(d);
 p.explode(16);sc.time.delayedCall(800,()=>p.destroy());
 for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4,t=sc.add.image(x+Math.cos(a)*70,y+Math.sin(a)*55,key).setScale(0).setDepth(d+1).setTint(0xfff59d);
  sc.tweens.add({targets:t,scale:0.7*k2,angle:180,duration:220,delay:80+i*70,yoyo:true,onComplete:()=>t.destroy()});}
 sc.__fxSparkleCount=(sc.__fxSparkleCount||0)+1;}
