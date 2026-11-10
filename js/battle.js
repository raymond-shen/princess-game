// ---------- Battle: tower defense + tone quiz (P0: hearts, slow-mo quiz, hero, 3 tower types) ----------
const PATH=[[0,250],[200,250],[260,420],[480,440],[540,250],[760,250],[800,470],[900,520]];
const SLOTS=[[180,370],[380,330],[420,560],[640,360],[700,560],[900,360]];
const SLOW=0.25;// monster/tower/hero speed while a question or picker is open
const HEARTS=5;
const HERO_POS=[800,665];
const MON_GROUND=18;// art monsters: feet anchor sits 18px below the path centre line
const TOWER_ART_PX=160,TOWER_GROUND=30;// art shown at 160px (0.625x of 256); anchor sits 30px below slot centre
// 3 tower types x 2 levels. Building or upgrading needs a correct answer.
const TOWER_TYPES={
 flower:{e:'🌸',name:'花花塔',desc:'變慢',color:0xff9ec4,lv:[{dmg:1,rate:1300,range:230,slowMul:0.45,slowMs:1500},{dmg:2,rate:1050,range:270,slowMul:0.3,slowMs:2200}]},
 star:{e:'⭐',name:'星星塔',desc:'超痛',color:0xffd54f,lv:[{dmg:2,rate:1500,range:260},{dmg:4,rate:1200,range:310}]},
 bubble:{e:'🫧',name:'泡泡塔',desc:'一群',color:0x80deea,lv:[{dmg:1,rate:1700,range:230,splash:95},{dmg:2,rate:1400,range:270,splash:130}]}};
// Hero auto-attack per job.
const HERO_JOBS={
 warrior:{icon:'⚔️',range:200,dmg:2,rate:1300,kind:'melee'},
 archer:{icon:'🏹',range:480,dmg:1,rate:850,kind:'arrow'},
 magician:{icon:'⭐',range:340,dmg:1,rate:1500,kind:'chain',chain:3,chainR:170}};
function toneGesture(sc,x,y,tone,w,h,col){const g=sc.add.graphics();const pts={1:[[0,.2],[1,.2]],2:[[0,.8],[1,.1]],3:[[0,.45],[.45,.9],[1,.15]],4:[[0,.1],[1,.9]]}[tone];
 const P=pts.map(([u,v])=>[x-w/2+u*w,y-h/2+v*h]);const o={t:0};
 sc.tweens.add({targets:o,t:1,duration:700,onUpdate:()=>{g.clear();g.lineStyle(10,col||0xff6fae);g.beginPath();g.moveTo(P[0][0],P[0][1]);
  const segs=P.length-1,tt=o.t*segs;for(let i=0;i<segs;i++){const f=Math.min(1,Math.max(0,tt-i));if(f<=0)break;g.lineTo(P[i][0]+(P[i+1][0]-P[i][0])*f,P[i][1]+(P[i+1][1]-P[i][1])*f);}g.strokePath();}});return g;}
function toneIcon(sc,x,y,tone,s){const c=sc.add.container(x,y);const g=sc.add.graphics();const pts={1:[[0,.25],[1,.25]],2:[[0,.85],[1,.15]],3:[[0,.45],[.45,.9],[1,.15]],4:[[0,.15],[1,.85]]}[tone];
 g.lineStyle(5,0x9a6ab8);g.beginPath();pts.forEach(([u,v],i)=>{const px=-s/2+u*s,py=-s/2+v*s;i?g.lineTo(px,py):g.moveTo(px,py);});g.strokePath();c.add(g);return c;}

class Battle extends Phaser.Scene{constructor(){super('Battle');}
 init(d){this.stage=d.stage;this.goal=this.stage.boss?8:5+this.stage.n*2;this.killed=0;this.passed=0;this.spawned=0;this.mons=[];this.towers={};this.streak=0;this.rainbow=0;
  this.hearts=HEARTS;this.mistakes=0;this.qOpen=false;this.picking=false;this.picker=null;this.pending=null;this.hitStop=0;this.lastItem=null;this.done=false;this.defeated=false;
  this.correctTotal=0;this.t0=Date.now();this.hero=null;this.heroWrap=null;this.heroCd=800;this.heroBusy=false;this.answering=false;this.q=null;}
 get busy(){return this.qOpen||this.picking;}
 create(){sky(this,0xa8e6cf,0xdcedc1);const g=this.add.graphics();g.lineStyle(70,0xf4e1b5);g.beginPath();g.moveTo(...PATH[0]);PATH.forEach(p=>g.lineTo(...p));g.strokePath();
  g.lineStyle(8,0xffffff,0.45);g.beginPath();g.moveTo(...PATH[0]);PATH.forEach(p=>g.lineTo(...p));g.strokePath();
  [[80,120],[330,130],[650,110],[90,600],[300,700],[560,700],[980,700],[620,470],[350,520]].forEach(([x,y],i)=>this.add.text(x,y,i%2?'🌳':'🌲',{fontSize:'58px'}).setOrigin(0.5,1));
  this.castle=this.add.text(930,560,'🏰',{fontSize:'120px'}).setOrigin(0.5,1);
  this.segs=[];let tot=0;for(let i=1;i<PATH.length;i++){const d=Phaser.Math.Distance.Between(...PATH[i-1],...PATH[i]);this.segs.push(d);tot+=d;}this.pathLen=tot;
  this.slotObjs=SLOTS.map(([x,y],i)=>{const c=this.add.container(x,y).setDepth(7);const base=this.add.circle(0,0,40,0xffffff,0.6).setStrokeStyle(5,0xff9ec4);const t=this.add.text(0,0,'✨',{fontSize:'36px'}).setOrigin(0.5);
   const lv=this.add.text(0,40,'',{fontFamily:FONT,fontSize:'20px',color:'#ffb300',stroke:'#fff',strokeThickness:4}).setOrigin(0.5);
   c.add([base,t,lv]);c.setSize(90,90).setInteractive();c.on('pointerdown',()=>this.tapSlot(i));const pulse=this.tweens.add({targets:base,scale:1.1,duration:600,yoyo:true,repeat:-1});return{c,t,base,lv,pulse};});
  // HUD
  this.hud=this.add.text(20,16,'',{fontFamily:FONT,fontSize:'28px',color:'#fff',stroke:'#7a3d9a',strokeThickness:6}).setDepth(20);
  this.heartTxt=this.add.text(20,58,'',{fontSize:'30px'}).setDepth(20);
  this.rbBg=this.add.graphics().setDepth(20);this.rbBtn=btn(this,W-90,H-60,140,80,'🌈',0xffffff,()=>this.bigAttack(),44).setDepth(21).setAlpha(0.5);
  btn(this,W-50,40,70,60,'🗺️',0xffe0f0,()=>{Save.write();this.scene.start('Map');},30).setDepth(20);
  const sd=Save.data;Char.ensure(this,sd.character,()=>{if(this.heroWrap)return;this.heroWrap=this.add.container(...HERO_POS).setDepth(8);
   this.hero=Char.build(this,0,0,190,sd.character,sd.equipped,'happy');this.heroWrap.add(this.hero);this.tweens.add({targets:this.hero,y:-8,duration:800,yoyo:true,repeat:-1});});
  this.spawnTimer=this.time.addEvent({delay:5500,loop:true,callback:()=>this.spawn()});this.spawn();
  this.time.addEvent({delay:20000,loop:true,callback:()=>checkRest(this)});
  Sound.say('點一點亮晶晶的地方，選一座塔，回答問題就能蓋好！');this.updHud();}
 // princess expression: art layer (princess_expr_*) if delivered, else a small emoji bubble over her head
 heroExpr(k,ms){if(!this.heroWrap)return;const sd=Save.data;
  if(Art.exprOK(this,k)){const y=this.hero.y;this.hero.destroy();this.hero=Char.build(this,0,0,190,sd.character,sd.equipped,k);this.hero.y=y;this.heroWrap.add(this.hero);
   this.tweens.add({targets:this.hero,y:-8,duration:800,yoyo:true,repeat:-1});
   if(ms)this.time.delayedCall(ms,()=>{if(!this.heroWrap||this.done)return;this.hero.destroy();this.hero=Char.build(this,0,0,190,sd.character,sd.equipped,'happy');this.heroWrap.add(this.hero);this.tweens.add({targets:this.hero,y:-8,duration:800,yoyo:true,repeat:-1});});return;}
  const e=this.add.text(0,-215,Art.entry('princess_expr_'+k).fallback||'😊',{fontSize:'40px'}).setOrigin(0.5).setScale(0);this.heroWrap.add(e);
  this.tweens.add({targets:e,scale:1,y:-235,duration:250,ease:'Back.easeOut'});this.time.delayedCall(ms||1000,()=>this.tweens.add({targets:e,alpha:0,duration:250,onComplete:()=>e.destroy()}));}
 heroJob(){const j=Save.data.character&&Save.data.character.job;return HERO_JOBS[j]||HERO_JOBS.warrior;}
 updHud(){this.hud.setText(`👾 ${this.killed}/${this.goal}   💎 ${Save.data.gems}   🔥 ${this.streak}`);
  this.heartTxt.setText('❤️'.repeat(Math.max(0,this.hearts))+'🤍'.repeat(Math.max(0,HEARTS-this.hearts)));
  this.rbBg.clear();this.rbBg.fillStyle(0xffffff,0.8).fillRoundedRect(W-330,H-80,160,40,20);const cols=[0xff8a80,0xffd180,0xfff59d,0xa5d6a7,0x90caf9,0xce93d8];
  const w=150*this.rainbow;for(let i=0;i<6;i++){const x0=W-325+i*25;const ww=Math.max(0,Math.min(25,w-i*25));if(ww>0)this.rbBg.fillStyle(cols[i]).fillRect(x0,H-75,ww,30);}
  this.rbBtn.setAlpha(this.rainbow>=1?1:0.45);}
 posAt(d){d=Phaser.Math.Clamp(d,0,this.pathLen);for(let i=0;i<this.segs.length;i++){if(d<=this.segs[i]){const f=d/this.segs[i];return[PATH[i][0]+(PATH[i+1][0]-PATH[i][0])*f,PATH[i][1]+(PATH[i+1][1]-PATH[i][1])*f];}d-=this.segs[i];}return PATH[PATH.length-1];}
 spawn(){if(this.done||this.busy)return;if(this.spawned>=this.goal||this.mons.filter(m=>m.alive).length>=3)return;
  const last=this.stage.boss&&this.spawned===this.goal-1;const kind=last?MONSTERS[4]:MONSTERS[Math.min(3,Math.floor(Math.random()*(1+this.stage.n)))];
  this.spawned++;const c=this.add.container(...this.posAt(0)).setDepth(6);const shadow=this.add.ellipse(0,26,50,14,0x000000,0.15);
  const ae=Art.entry(kind.art),art=Art.has(this,kind.art),disp=art?(ae.displayPx||(last?180:84)):0,gy=MON_GROUND-(art?(ae.floatPx||0):0);
  const t=art?Art.make(this,0,gy,kind.art,disp,kind.e):this.add.text(0,0,kind.e,{fontSize:last?'110px':'56px'}).setOrigin(0.5);if(t.baseScale==null)t.baseScale=1;
  const barY=art?Math.round(gy-disp*0.93-14):-50;const hpMax=last?14:(3+Math.floor(this.stage.n/2));
  const bar=this.add.graphics();c.add([shadow,t,bar]);const m={c,t,bar,barY,flip:art&&!!ae.flipWhenMovingRight,d:0,hp:hpMax,hpMax,alive:true,kind,speed:last?11:18,slowT:0,slowMul:1,boss:last};this.mons.push(m);this.drawHp(m);
  this.tweens.add({targets:t,scaleY:t.baseScale*0.9,scaleX:t.baseScale*1.08,duration:300,yoyo:true,repeat:-1});
  if(!Save.data.seenMonsters.includes(kind.id))Save.data.seenMonsters.push(kind.id);}
 drawHp(m){const y=m.barY==null?-50:m.barY;m.bar.clear();m.bar.fillStyle(0xffffff).fillRoundedRect(-30,y,60,10,5);m.bar.fillStyle(m.slowT>0?0x80deea:0xff6fae).fillRoundedRect(-30,y,60*Math.max(0,m.hp)/m.hpMax,10,5);}
 update(t,dt){if(this.hitStop>0){this.hitStop-=dt;return;}if(this.done)return;
  const f=this.busy?SLOW:1,sdt=dt*f;
  for(const m of this.mons){if(!m.alive)continue;let sp=m.speed;if(m.slowT>0){m.slowT-=sdt;sp*=m.slowMul;if(m.slowT<=0)this.drawHp(m);}
   m.d+=sp*sdt/1000;if(m.d>=this.pathLen){this.reachCastle(m);continue;}const[x,y]=this.posAt(m.d);if(m.flip&&Math.abs(x-m.c.x)>0.01)m.t.setFlipX(x>m.c.x);m.c.setPosition(x,y);}
  if(this.done)return;
  for(const k in this.towers){const tw=this.towers[k];tw.cd-=sdt;if(tw.cd>0)continue;const st=TOWER_TYPES[tw.type].lv[tw.lv-1];const[x,y]=SLOTS[k];
   const m=this.nearest(x,y,st.range);if(m){this.towerFire(k,m);tw.cd=st.rate;}else tw.cd=0;}
  if(this.heroWrap&&!this.heroBusy){this.heroCd-=sdt;if(this.heroCd<=0){const J=this.heroJob();const m=this.nearest(HERO_POS[0],HERO_POS[1]-60,J.range);
   if(m){this.heroAttack(m,false);this.heroCd=J.rate;}else this.heroCd=0;}}
  Save.data.playMs+=dt;}
 nearest(x,y,r){let best=null,bd=r||1e9;for(const m of this.mons){if(!m.alive)continue;const d=Phaser.Math.Distance.Between(x,y,m.c.x,m.c.y);if(d<bd){bd=d;best=m;}}return best;}
 // projectile helper: a shape or emoji flying to the monster, then onHit()
 shoot(x,y,m,color,onHit,emoji){if(!m)return;const b=emoji?this.add.text(x,y,emoji,{fontSize:'34px'}).setOrigin(0.5).setDepth(30):this.add.circle(x,y,12,color||0xff9ec4).setDepth(30);
  this.tweens.add({targets:b,x:m.c.x,y:m.c.y,duration:220,onComplete:()=>{b.destroy();onHit&&onHit();}});return b;}
 hit(m,dmg,o){o=o||{};if(!m.alive||this.done)return;m.hp-=dmg;Sound.hit();m.t.setTintFill(0xffffff);this.time.delayedCall(90,()=>m.t.active&&m.t.clearTint());
  if(o.stop)this.hitStop=Math.max(this.hitStop,o.stop);if(o.shake)this.cameras.main.shake(o.shake===true?110:o.shake,o.shakeI||0.004);
  stars(this,m.c.x,m.c.y,o.big?18:8);floatText(this,m.c.x,m.c.y-30,'-'+dmg,o.big?'#ffeb3b':'#fff59d');m.d=Math.max(0,m.d-(o.knock==null?14:o.knock));
  if(o.slowMs){m.slowT=Math.max(m.slowT,o.slowMs);m.slowMul=o.slowMul;}
  this.tweens.add({targets:m.t,scaleX:m.t.baseScale*1.25,scaleY:m.t.baseScale*0.8,duration:70,yoyo:true});this.drawHp(m);
  if(m.hp<=0){m.alive=false;this.killed++;Save.data.gems+=1;floatText(this,m.c.x,m.c.y-60,'💎+1','#b3e5fc');
   this.tweens.killTweensOf(m.t);m.bar.clear();this.tweens.add({targets:m.c,scaleX:1.3,scaleY:0.2,alpha:0,duration:160,ease:'Cubic.easeIn',onComplete:()=>m.c.destroy()});fxStarsAway(this,m.c.x,m.c.y,m.boss?12:7);this.updHud();this.checkEnd();}}
 checkEnd(){if(this.done)return;if(this.killed+this.passed>=this.goal&&this.hearts>0)this.time.delayedCall(600,()=>this.win());}
 // ---------- castle hearts + gentle defeat ----------
 reachCastle(m){m.alive=false;this.passed++;this.hearts--;Sound.soft();this.cameras.main.shake(220,0.008);
  floatText(this,930,430,'💔','#ff8a80');this.tweens.add({targets:this.castle,angle:{from:-6,to:6},duration:70,yoyo:true,repeat:3,onComplete:()=>{this.castle.angle=0;}});
  this.tweens.add({targets:m.c,alpha:0,scale:0.4,duration:300,onComplete:()=>m.c.destroy()});this.updHud();
  if(this.hearts<=0)this.defeat();else this.checkEnd();}
 defeat(){if(this.done)return;this.done=true;this.defeated=true;this.spawnTimer.remove();if(this.picker){this.picker.destroy();this.picker=null;this.picking=false;}
  if(this.q){this.q.destroy();this.q=null;this.qOpen=false;}Save.write();// progress (gems, stars, SRS) already saved; nothing is taken away
  Sound.say('沒關係！小精靈把城堡修好了，再試一次吧！');
  const o=this.defeatUI=this.add.container(0,0).setDepth(150);o.add(this.add.rectangle(W/2,H/2,W,H,0x2b1f45,0.6).setInteractive());
  const card=this.add.graphics();card.fillStyle(0xfff6fb).fillRoundedRect(W/2-300,H/2-220,600,440,36).lineStyle(6,0xffc1dc).strokeRoundedRect(W/2-300,H/2-220,600,440,36);o.add(card);
  o.add(this.add.text(W/2,H/2-130,'🧚 🏰 ✨',{fontSize:'84px'}).setOrigin(0.5));
  o.add(this.add.text(W/2,H/2-30,'城堡累了～小精靈幫你修好了！',{fontFamily:FONT,fontSize:'32px',color:'#7a3d9a'}).setOrigin(0.5));
  o.add(this.add.text(W/2,H/2+20,`你的寶石 💎${Save.data.gems} 和星星 ⭐${Save.data.stars} 都還在喔`,{fontFamily:FONT,fontSize:'24px',color:'#9a6ab8'}).setOrigin(0.5));
  o.add(btn(this,W/2-130,H/2+125,230,90,'🔄 再試一次',0xb9f6ca,()=>this.retry(),30));
  o.add(btn(this,W/2+130,H/2+125,230,90,'🗺️ 回地圖',0xffe0f0,()=>this.toMap(),30));}
 retry(){this.scene.restart({stage:this.stage});}
 // ---------- towers ----------
 tapSlot(i){if(this.busy||this.done)return;const tw=this.towers[i];
  if(!tw){this.openPicker(i);return;}
  if(tw.lv>=2){floatText(this,SLOTS[i][0],SLOTS[i][1]+(this.slotObjs[i].topY||-40)-20,'滿級 ✨','#ffeb3b');Sound.pop();return;}
  this.pending={kind:'up',slot:i,type:tw.type};this.ask();}
 openPicker(i){this.picking=true;const p=this.picker=this.add.container(0,0).setDepth(95);
  p.add(this.add.rectangle(W/2,H/2,W,H,0x2b1f45,0.35).setInteractive());
  const card=this.add.graphics();card.fillStyle(0xfff8fc).fillRoundedRect(W/2-340,H-300,680,260,30).lineStyle(5,0xffc1dc).strokeRoundedRect(W/2-340,H-300,680,260,30);p.add(card);
  Object.entries(TOWER_TYPES).forEach(([k,T],n)=>{const b=btn(this,W/2-210+n*210,H-170,190,190,'',0xffe4f1,()=>{this.closePicker();this.pending={kind:'build',slot:i,type:k};this.ask();});
   b.add(this.add.text(0,-40,T.e,{fontSize:'64px'}).setOrigin(0.5));b.add(this.add.text(0,30,T.name,{fontFamily:FONT,fontSize:'26px',color:'#5a2d6e'}).setOrigin(0.5));
   b.add(this.add.text(0,64,T.desc,{fontFamily:FONT,fontSize:'20px',color:'#9a6ab8'}).setOrigin(0.5));b.towerType=k;p.add(b);});
  p.add(btn(this,W/2+300,H-290,64,56,'✖',0xf3e9ff,()=>this.closePicker(),26));
  Sound.say('選一座塔');}
 closePicker(){if(this.picker){this.picker.destroy();this.picker=null;}this.picking=false;}
 // tower sprite: Lily's art (bottom-center anchor on the slot's ground point) or the emoji fallback
 towerSprite(i,type,lv){const so=this.slotObjs[i],T=TOWER_TYPES[type],k='tower_'+type+'_lv'+lv;if(so.t)so.t.destroy();
  let g;if(Art.has(this,k)){g=Art.make(this,0,TOWER_GROUND,k,TOWER_ART_PX,T.e);so.base.setScale(0.9,0.38).setPosition(0,TOWER_GROUND-4).setFillStyle(0x000000,0.14).setStrokeStyle(0);}
  else{g=this.add.text(0,0,T.e,{fontSize:(lv>1?64:54)+'px'}).setOrigin(0.5);g.baseScale=1;}
  so.c.addAt(g,1);so.t=g;so.c.bringToTop(so.lv);
  // keep UI above the real top of the art (star Lv2's flag reaches the canvas top)
  so.topY=g.isArt?TOWER_GROUND-(g.height*g.originY-(Art.entry(k).bboxPx||[0,0])[1])*g.baseScale:-40;return g;}
 buildTower(i,type){const[x,y]=SLOTS[i],so=this.slotObjs[i],T=TOWER_TYPES[type];so.pulse.stop();so.base.setScale(1).setFillStyle(T.color,0.55).setStrokeStyle(5,0xffffff);
  const g=this.towerSprite(i,type,1);g.setScale(0);this.tweens.add({targets:g,scale:g.baseScale,duration:400,ease:'Back.easeOut'});so.lv.setText('★');
  this.towers[i]={type,lv:1,cd:300};stars(this,x,y,20);Sound.chime(5);floatText(this,x,y+so.topY-20,T.name+'！','#ffffff');}
 upgradeTower(i){const tw=this.towers[i],[x,y]=SLOTS[i],so=this.slotObjs[i];tw.lv=2;tw.cd=0;so.lv.setText('★★');if(!so.t.isArt)so.base.setStrokeStyle(7,0xffd54f);
  const g=this.towerSprite(i,tw.type,2);const b=g.baseScale;g.setScale(b*0.6,b*1.3);this.tweens.add({targets:g,scaleX:b,scaleY:b,duration:420,ease:'Elastic.easeOut'});
  stars(this,x,y+so.topY/2,28);fxSparkle(this,x,y+so.topY/2,40);Sound.fanfare();floatText(this,x,y+so.topY-20,'升級 ⬆','#ffeb3b');}
 towerFire(i,m){const tw=this.towers[i],T=TOWER_TYPES[tw.type],st=T.lv[tw.lv-1];const[x,y]=SLOTS[i];
  {const g=this.slotObjs[i].t;this.tweens.add({targets:g,scaleX:g.baseScale*1.08,scaleY:g.baseScale*0.94,duration:80,yoyo:true});}
  if(tw.type==='flower')this.shoot(x,y-30,m,T.color,()=>this.hit(m,st.dmg,{slowMs:st.slowMs,slowMul:st.slowMul,knock:6}),'🌸');
  else if(tw.type==='star')this.shoot(x,y-30,m,T.color,()=>this.hit(m,st.dmg,{knock:18}),'⭐');
  else this.shoot(x,y-30,m,T.color,()=>{const cx=m.c.x,cy=m.c.y;const ring=this.add.circle(cx,cy,10,T.color,0.45).setDepth(29);
   this.tweens.add({targets:ring,radius:st.splash,alpha:0,duration:300,onComplete:()=>ring.destroy()});
   this.mons.filter(o=>o.alive&&Phaser.Math.Distance.Between(cx,cy,o.c.x,o.c.y)<=st.splash).forEach(o=>this.hit(o,st.dmg,{knock:8}));},'🫧');}
 // ---------- hero ----------
 heroAttack(m,power){const J=this.heroJob(),w=this.heroWrap;if(!w||!m||!m.alive)return;const dmg=J.dmg+(power?2:0);
  const fx=HERO_POS[0],fy=HERO_POS[1]-70;const wasBusy=this.heroBusy;this.heroBusy=true;const done=()=>{this.heroBusy=false;};
  if(power){// answer bonus: big job-emoji shot from anywhere (does not block auto-attacks)
   this.heroBusy=wasBusy;this.tweens.add({targets:w,scale:1.15,duration:120,yoyo:true});this.shoot(fx,fy,m,0xffffff,()=>this.hit(m,dmg,{stop:80,shake:160,shakeI:0.006,big:true,knock:30}),J.icon);return;}
  if(J.kind==='melee'){const tx=m.c.x+(m.c.x<fx?40:-40),ty=m.c.y+70;
   this.tweens.add({targets:w,x:tx,y:ty,duration:140,ease:'Cubic.easeIn',onComplete:()=>{
    const s=this.add.graphics().setDepth(31);s.lineStyle(10,0xffffff,0.9).beginPath();s.arc(m.c.x,m.c.y,48,-2.4,0.4);s.strokePath();this.tweens.add({targets:s,alpha:0,duration:200,onComplete:()=>s.destroy()});
    this.hit(m,dmg,{stop:70,shake:true,knock:26});
    this.tweens.add({targets:w,x:HERO_POS[0],y:HERO_POS[1],duration:260,delay:90,ease:'Cubic.easeOut',onComplete:done});}});}
  else if(J.kind==='arrow'){this.tweens.add({targets:w,x:HERO_POS[0]+10,duration:70,yoyo:true});
   const a=this.add.text(fx,fy,'➶',{fontSize:'40px',color:'#c98a4b'}).setOrigin(0.5).setDepth(30);a.rotation=Phaser.Math.Angle.Between(fx,fy,m.c.x,m.c.y);
   this.tweens.add({targets:a,x:m.c.x,y:m.c.y,duration:180,onComplete:()=>{a.destroy();this.hit(m,dmg,{stop:40,knock:16});done();}});}
  else{this.tweens.add({targets:w,y:HERO_POS[1]-16,duration:120,yoyo:true});const tg=[m];
   for(const o of this.mons){if(tg.length>=J.chain)break;if(o.alive&&!tg.includes(o)&&Phaser.Math.Distance.Between(m.c.x,m.c.y,o.c.x,o.c.y)<=J.chainR)tg.push(o);}
   const g=this.add.graphics().setDepth(31);g.lineStyle(5,0xb388ff,0.95).beginPath();g.moveTo(fx,fy);tg.forEach(o=>g.lineTo(o.c.x,o.c.y));g.strokePath();
   this.tweens.add({targets:g,alpha:0,duration:260,onComplete:()=>g.destroy()});tg.forEach((o,i)=>this.time.delayedCall(i*70,()=>this.hit(o,dmg,{stop:i?0:50,knock:12})));this.time.delayedCall(250,done);}}
 bigAttack(){if(this.rainbow<1||this.busy||this.done)return;this.rainbow=0;this.updHud();Sound.fanfare();Sound.say('彩虹魔法！');
  const r=this.add.rectangle(W/2,H/2,W,H,0xffffff,0.8).setDepth(45);this.tweens.add({targets:r,alpha:0,duration:500,onComplete:()=>r.destroy()});this.cameras.main.shake(300,0.01);
  this.mons.filter(m=>m.alive).forEach((m,i)=>this.time.delayedCall(i*120,()=>this.hit(m,3,{stop:60,big:true,knock:40})));}
 // ---------- quiz ----------
 ask(){if(this.qOpen||this.done)return;this.qOpen=true;const it=Learn.pick(this.stage.lessons,this.lastItem&&this.lastItem.id);this.lastItem=it;
  this.item=it;this.firstTry=true;const types=['hear','pic2spell','spell2pic','drag'];this.qtype=this.forceType||types[Math.floor(Math.random()*4)];this.buildQ();}
 buildQ(){if(this.q)this.q.destroy();const q=this.q=this.add.container(0,0).setDepth(100);const it=this.item,w=it.word;
  q.add(this.add.rectangle(W/2,H/2,W,H,0x2b1f45,0.45).setInteractive());const card=this.add.graphics();card.fillStyle(0xfff8fc,0.97).fillRoundedRect(112,70,800,620,36).lineStyle(6,0xffc1dc).strokeRoundedRect(112,70,800,620,36);q.add(card);
  const P=this.pending;if(P){const T=TOWER_TYPES[P.type];q.add(this.add.text(W/2,98,(P.kind==='up'?'⬆ 升級 ':'🔨 蓋 ')+T.e+' '+T.name,{fontFamily:FONT,fontSize:'24px',color:'#9a6ab8'}).setOrigin(0.5));}
  const speak=()=>{Sound.sayWord(w);};Sound.loadWord(w.id);q.add(btn(this,830,130,90,80,'🔊',0xe1f5fe,speak,40));
  q.add(btn(this,170,640,70,60,'✖',0xf3e9ff,()=>this.cancelQ(),26));
  this.opts=[];const T=this.qtype;
  const sylRow=(y,hideIdx,hideMode)=>{const n=w.zhuyin.length;const sp=Math.min(170,640/n);w.zhuyin.forEach((z,i)=>{const x=W/2-(n-1)*sp/2+i*sp;const hl=i===it.syl;
   const box=this.add.rectangle(x,y,sp-14,96,hl?0xfff3b0:0xffffff).setStrokeStyle(hl?5:2,hl?0xffb300:0xe0d0f0);q.add(box);
   let txt=z+(w.tones[i]===0?'˙':TONE_SHOW[w.tones[i]]);if(i===hideIdx)txt=z+(hideMode||'');q.add(this.add.text(x,y,txt,{fontFamily:FONT,fontSize:'48px',color:'#5a2d6e'}).setOrigin(0.5));if(hl)this.hlBox={x,y,box};});};
  if(T==='hear'){q.add(this.add.text(W/2,190,w.pic,{fontSize:'110px'}).setOrigin(0.5));sylRow(330,it.syl,' ?');
   [1,2,3,4].forEach((tn,i)=>{const x=W/2-270+i*180;const b=btn(this,x,520,160,150,'',0xffe4f1,()=>this.answer(tn===it.tone,tn,b));b.add(this.add.text(0,-30,TONE_MARK[tn],{fontFamily:FONT,fontSize:'64px',color:'#5a2d6e'}).setOrigin(0.5));b.add(toneIcon(this,0,40,tn,70));b.tone=tn;q.add(b);this.opts.push(b);});
   this.time.delayedCall(250,speak);}
  if(T==='pic2spell'){q.add(this.add.text(W/2,220,w.pic,{fontSize:'140px'}).setOrigin(0.5));
   const tones=Phaser.Utils.Array.Shuffle([it.tone,...Phaser.Utils.Array.Shuffle([1,2,3,4].filter(x=>x!==it.tone)).slice(0,2)]);
   tones.forEach((tn,i)=>{const b=btn(this,W/2,400+i*95,560,80,Learn.spell(w,it.syl,tn),0xffe4f1,()=>this.answer(tn===it.tone,tn,b),40);b.tone=tn;q.add(b);this.opts.push(b);});this.time.delayedCall(250,speak);}
  if(T==='spell2pic'){q.add(this.add.text(W/2,200,Learn.spell(w),{fontFamily:FONT,fontSize:'60px',color:'#5a2d6e'}).setOrigin(0.5));
   // P0 fix: distractors differ in tone at the target syllable, and the chosen word's tone is recorded like other types
   const pics=Phaser.Utils.Array.Shuffle([w,...Learn.toneDistractPics(it,2)]);pics.forEach((pw,i)=>{const ct=pw===w?it.tone:Learn.toneAt(pw,it.syl);
    const b=btn(this,W/2-240+i*240,450,200,200,pw.pic,0xffe4f1,()=>this.answer(pw===w,ct,b),100);b.tone=ct;b.correct=pw===w;q.add(b);this.opts.push(b);});}
  if(T==='drag'){q.add(this.add.text(W/2,190,w.pic,{fontSize:'110px'}).setOrigin(0.5));sylRow(330,it.syl,'');
   q.add(this.add.text(W/2,420,'👆 ➡ ⬆',{fontSize:'34px'}).setOrigin(0.5).setAlpha(0.7));
   [1,2,3,4].forEach((tn,i)=>{const x=W/2-270+i*180,y=560;const tile=this.add.container(x,y);const g=this.add.graphics();g.fillStyle(0xd1c4e9).fillRoundedRect(-60,-60,120,120,24);
    tile.add([g,this.add.text(0,-14,TONE_MARK[tn],{fontFamily:FONT,fontSize:'64px',color:'#4a148c'}).setOrigin(0.5),toneIcon(this,0,36,tn,50)]);tile.setSize(120,120).setInteractive({draggable:true});
    this.input.setDraggable(tile);tile.home=[x,y];tile.tone=tn;tile.on('drag',(p,dx,dy)=>{tile.x=dx;tile.y=dy;});
    tile.on('dragend',()=>{const hb=this.hlBox;if(hb&&Phaser.Math.Distance.Between(tile.x,tile.y,hb.x,hb.y)<110){this.answer(tn===it.tone,tn,tile);}tile.x=tile.home[0];tile.y=tile.home[1];});
    q.add(tile);this.opts.push(tile);});this.time.delayedCall(250,speak);}}
 answer(ok,tn,b){if(this.answering||!this.q)return;const it=this.item;
  if(this.firstTry){Learn.record(it,ok,tn);this.firstTry=false;if(!ok)this.mistakes++;Save.write();}
  if(ok){this.answering=true;this.streak++;this.correctTotal++;this.rainbow=Math.min(1,this.rainbow+0.25);Sound.chime(this.streak);
   fxSparkle(this,b.x||W/2,b.y||H/2,110);floatText(this,W/2,150,['⭐','🌟','💖','✨'][this.streak%4]+' +1','#ffeb3b');Save.data.stars++;
   this.time.delayedCall(450,()=>{Sound.sayWord(it.word);this.closeQ();this.reward(true);});}
  else{this.streak=0;Sound.soft();b.setAlpha(0.35);if(b.disableInteractive)b.disableInteractive();
   const ch=it.word.word[it.syl]||it.word.word;if(Sound.hasWord(it.word.id))Sound.sayWord(it.word);else Sound.say(ch+'，'+it.word.word,0.7);
   const gp=this.add.graphics().setDepth(101);gp.fillStyle(0xffffff,0.95).fillRoundedRect(140,85,240,90,16);this.q.add(gp);
   this.q.add(this.add.text(180,130,TONE_MARK[it.tone],{fontFamily:FONT,fontSize:'56px',color:'#ff6fae'}).setOrigin(0.5).setDepth(102));
   this.q.add(toneGesture(this,290,130,it.tone,120,60).setDepth(102));
   if(this.hlBox){this.tweens.add({targets:this.hlBox.box,scale:1.15,duration:200,yoyo:true,repeat:2});}}
  this.updHud();}
 cancelQ(){if(this.answering)return;if(this.q){this.q.destroy();this.q=null;}this.qOpen=false;this.pending=null;}
 closeQ(){this.answering=false;if(this.q){this.q.destroy();this.q=null;}this.qOpen=false;const P=this.pending;this.pending=null;if(this.done)return;
  if(P){if(P.kind==='build'&&!this.towers[P.slot])this.buildTower(P.slot,P.type);else if(P.kind==='up'&&this.towers[P.slot]&&this.towers[P.slot].lv<2)this.upgradeTower(P.slot);}
  // correct answer = princess power attack on the nearest monster
  const m=this.nearest(HERO_POS[0],HERO_POS[1]);if(m&&this.heroWrap)this.heroAttack(m,true);this.heroExpr('cheer',1200);
  this.updHud();Save.write();}
 reward(){if(this.streak>0&&this.streak%3===0)this.dropTreasure(false);}
 dropTreasure(final){const sd=Save.data;const left=TREASURES.filter(t=>!sd.inventory.includes(t));
  if(!left.length){sd.gems+=10;Save.write();floatText(this,W/2,300,'💎+10','#b3e5fc');if(final)this.time.delayedCall(900,()=>this.toMap());return;}
  const id=left[Math.floor(Math.random()*left.length)];const e=Char.m.equipment.find(q=>q.id===id);sd.inventory.push(id);Save.write();
  const ch=this.add.text(W/2,-60,'🎁',{fontSize:'80px'}).setOrigin(0.5).setDepth(90);Sound.fanfare();
  this.tweens.add({targets:ch,y:H/2-40,duration:600,ease:'Bounce.easeOut',onComplete:()=>{ch.setText(e.emoji);stars(this,W/2,H/2-40,24);
   let notice=null;const explain=message=>{if(notice)notice.destroy();notice=this.add.text(W/2,H/2+118,message,{fontFamily:FONT,fontSize:'18px',color:'#a14266',backgroundColor:'#fff7fb',wordWrap:{width:700,useAdvancedWrap:true},align:'center'}).setOrigin(0.5,0).setDepth(92);this.rewardWearIssue=notice;};
   const wear=btn(this,W/2-70,H/2+60,120,70,'👚',0xff9ec4,()=>{const result=sd.equipped.includes(id)?{ok:true}:Char.wear(sd,id);if(!result.ok){explain(result.issues[0]);Sound.soft();return;}Save.write();
     if(this.heroWrap){this.hero&&this.hero.destroy();this.hero=Char.build(this,0,0,190,sd.character,sd.equipped);this.heroWrap.add(this.hero);}done();},36).setDepth(91);wear.treasureWearId=id;
   const bad=Char.wearableIssues(id,sd.character,sd.equipped);if(bad.length){wear.setAlpha(0.5);explain(bad[0]);}
   const keep=btn(this,W/2+70,H/2+60,120,70,'🏠',0xe1f5fe,()=>done(),36).setDepth(91);const done=()=>{if(notice)notice.destroy();this.rewardWearIssue=null;ch.destroy();wear.destroy();keep.destroy();if(final)this.toMap();};}});}

 win(){if(this.done)return;this.done=true;this.spawnTimer.remove();if(this.picker)this.closePicker();if(this.q)this.cancelQ();
  const st=this.mistakes<=2?3:this.mistakes<=5?2:1;const sd=Save.data;
  sd.stagesStars[this.stage.n]=Math.max(sd.stagesStars[this.stage.n]||0,st);sd.gems+=5*st;Save.write();Sound.fanfare();Sound.say('過關了！你好棒！');
  const o=this.add.container(0,0).setDepth(80);o.add(this.add.rectangle(W/2,H/2,W,H,0xffffff,0.6));
  o.add(this.add.text(W/2,200,'🎉 '+'⭐'.repeat(st)+' 🎉',{fontSize:'80px'}).setOrigin(0.5));stars(this,W/2,200,40);
  this.time.delayedCall(1200,()=>this.dropTreasure(true));}
 toMap(){Save.write();this.scene.start('Map');}}
