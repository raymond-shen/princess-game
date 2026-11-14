// ---------- Battle: tower defense + tone quiz (P0: hearts, slow-mo quiz, hero, 3 tower types) ----------
const PATH=BALANCE.path,SLOTS=BALANCE.slots,SLOW=BALANCE.quizSlow,HEARTS=BALANCE.hearts,HERO_POS=BALANCE.heroPos;
const MON_GROUND=18;// art monsters: feet anchor sits 18px below the path centre line
const TOWER_ART_PX=160,TOWER_GROUND=30;// art shown at 160px (0.625x of 256); anchor sits 30px below slot centre
// 3 tower types x 2 levels. Building or upgrading needs a correct answer.
const TOWER_TYPES=BALANCE.towers;
// Hero auto-attack per job.
const HERO_JOBS=BALANCE.heroes;window.StageFails=window.StageFails||{};
function toneGesture(sc,x,y,tone,w,h,col){const g=sc.add.graphics();const pts={1:[[0,.2],[1,.2]],2:[[0,.8],[1,.1]],3:[[0,.45],[.45,.9],[1,.15]],4:[[0,.1],[1,.9]]}[tone];
 const P=pts.map(([u,v])=>[x-w/2+u*w,y-h/2+v*h]);const o={t:0};
 sc.tweens.add({targets:o,t:1,duration:700,onUpdate:()=>{g.clear();g.lineStyle(10,col||0xff6fae);g.beginPath();g.moveTo(P[0][0],P[0][1]);
  const segs=P.length-1,tt=o.t*segs;for(let i=0;i<segs;i++){const f=Math.min(1,Math.max(0,tt-i));if(f<=0)break;g.lineTo(P[i][0]+(P[i+1][0]-P[i][0])*f,P[i][1]+(P[i+1][1]-P[i][1])*f);}g.strokePath();}});return g;}
function toneIcon(sc,x,y,tone,s){const c=sc.add.container(x,y);const g=sc.add.graphics();const pts={1:[[0,.25],[1,.25]],2:[[0,.85],[1,.15]],3:[[0,.45],[.45,.9],[1,.15]],4:[[0,.15],[1,.85]]}[tone];
 g.lineStyle(5,0x9a6ab8);g.beginPath();pts.forEach(([u,v],i)=>{const px=-s/2+u*s,py=-s/2+v*s;i?g.lineTo(px,py):g.moveTo(px,py);});g.strokePath();c.add(g);return c;}

class Battle extends Phaser.Scene{constructor(){super('Battle');}
 waveSize(w){return Math.min(BALANCE.waveCountCap,BALANCE.waveBaseCount+(this.stage.n-1)+(w-1));}
 spawnDelay(){const n=Math.min(this.stage.n,BALANCE.spawnStageCap||this.stage.n);return Math.max(BALANCE.spawnMinMs,BALANCE.spawnStartMs-(n-1)*BALANCE.spawnStepMs);}
 remaining(){return Math.max(0,this.goal-this.killed-this.passed);}
 init(d){this.stage=d.stage;this.wave=1;this.waves=BALANCE.waves;this.waveSpawned=0;this.goal=[1,2,3].reduce((n,w)=>n+this.waveSize(w),0);this.killed=0;this.passed=0;this.spawned=0;this.mons=[];this.towers={};this.streak=0;this.rainbow=0;
  this.hearts=HEARTS;this.mistakes=0;this.qOpen=false;this.picking=false;this.picker=null;this.pending=null;this.hitStop=0;this.lastItem=null;this.done=false;this.defeated=false;this.breaking=false;
  this.fails=window.StageFails[this.stage.n]||0;this.mercy=this.fails>=BALANCE.assist.afterDefeats;this.coins=BALANCE.coins.start+(this.mercy?BALANCE.assist.coins:0);this.speedMul=this.mercy?BALANCE.assist.speedMul:1;
  this.correctTotal=0;this.t0=Date.now();this.hero=null;this.heroWrap=null;this.heroCd=800;this.heroBusy=false;this.answering=false;this.q=null;}
 get busy(){return this.qOpen||this.picking;}
 create(){this.events.once('shutdown',()=>Sound.cancelPrompt());sky(this,0xa8e6cf,0xdcedc1);const g=this.add.graphics();g.lineStyle(70,0xf4e1b5);g.beginPath();g.moveTo(...PATH[0]);PATH.forEach(p=>g.lineTo(...p));g.strokePath();
  g.lineStyle(8,0xffffff,0.45);g.beginPath();g.moveTo(...PATH[0]);PATH.forEach(p=>g.lineTo(...p));g.strokePath();
  [[80,120],[330,130],[650,110],[90,600],[300,700],[560,700],[980,700],[620,470],[350,520]].forEach(([x,y],i)=>this.add.text(x,y,i%2?'🌳':'🌲',{fontSize:'58px'}).setOrigin(0.5,1));
  this.castle=this.add.text(930,560,'🏰',{fontSize:'120px'}).setOrigin(0.5,1);
  this.segs=[];let tot=0;for(let i=1;i<PATH.length;i++){const d=Phaser.Math.Distance.Between(...PATH[i-1],...PATH[i]);this.segs.push(d);tot+=d;}this.pathLen=tot;
  this.slotObjs=SLOTS.map(([x,y],i)=>{const c=this.add.container(x,y).setDepth(7);
   const shadow=this.add.circle(0,0,40,0xffffff,0).setVisible(false);
   const art=TdUI.has('build_slot_available')?TdUI.img(this,'build_slot_available',0,0,[0.5,0.5],[90,90]):this.add.circle(0,0,40,0xffffff,0.6).setStrokeStyle(5,0xff9ec4);
   const t=art.texture?null:this.add.text(0,0,'✨',{fontSize:'36px'}).setOrigin(0.5);
   const lv=this.add.text(0,48,'',{fontFamily:FONT,fontSize:'20px',color:'#ffb300',stroke:'#fff',strokeThickness:4}).setOrigin(0.5);
   c.add(t?[shadow,art,t,lv]:[shadow,art,lv]);c.setSize(90,90).setInteractive();
   c.on('pointerdown',()=>{this.markSlot(i,true);this.tapSlot(i);});
   c.on('pointerup',()=>{if(!(this.picking&&this.pickingSlot===i))this.markSlot(i,false);});
   c.on('pointerout',()=>{if(!(this.picking&&this.pickingSlot===i))this.markSlot(i,false);});
   return{c,t,base:shadow,lv,art,pulse:null,state:'available'};});
  // HUD
  this.coinIcon=TdUI.has('coin')?TdUI.img(this,'coin',28,22,[0,0],[36,36]).setDepth(20):this.add.text(28,22,'🪙',{fontSize:'36px'}).setOrigin(0,0).setDepth(20);
  this.coinTxt=this.add.text(74,26,'',{fontFamily:FONT,fontSize:'28px',color:'#5a2d6e',stroke:'#fff',strokeThickness:6,fontStyle:'bold'}).setOrigin(0,0).setDepth(21);
  this.waveBar=this.add.graphics().setDepth(20);
  this.waveBarFrame=TdUI.has('wave_bar_frame')?TdUI.img(this,'wave_bar_frame',240,16,[0,0],[400,44]).setDepth(20):null;
  this.waveFill=TdUI.nineslice(this,'wave_bar_fill',244,20,36,36,18,18,0,0);if(this.waveFill)this.waveFill.setDepth(20).setVisible(false);
  if(!this.waveFill&&TdUI.has('wave_bar_fill_cap_left')){this.waveFillLeft=TdUI.img(this,'wave_bar_fill_cap_left',244,20,[0,0],[18,36]).setDepth(20).setVisible(false);
   this.waveFillMid=TdUI.has('wave_bar_fill_mid')?TdUI.img(this,'wave_bar_fill_mid',262,20,[0,0],[16,36]).setDepth(20).setVisible(false):null;
   this.waveFillRight=TdUI.img(this,'wave_bar_fill_cap_right',262,20,[0,0],[18,36]).setDepth(20).setVisible(false);}
  this.waveTxt=this.add.text(440,26,'',{fontFamily:FONT,fontSize:'24px',color:'#5a2d6e',stroke:'#fff8fc',strokeThickness:5,fontStyle:'bold'}).setOrigin(0.5,0).setDepth(21);
  this.hud=this.add.text(20,16,'',{fontFamily:FONT,fontSize:'22px',color:'#5a2d6e',stroke:'#fff',strokeThickness:6}).setDepth(20).setAlpha(0);
  this.heartBar=this.add.graphics().setDepth(20);
  this.heartBarBg=TdUI.has('hearts_bar')?TdUI.img(this,'hearts_bar',20,62,[0,0],[280,26]).setDepth(20):null;
  this.heartIcons=[];for(let i=0;i<HEARTS;i++){const hx=26+i*27,hy=66;const im=TdUI.has('heart_full')?TdUI.img(this,'heart_full',hx,hy,[0,0],[24,18]).setDepth(21):null;this.heartIcons.push(im);}
  this.heartTxt=this.add.text(20,64,'',{fontFamily:FONT,fontSize:'16px',color:'#5a2d6e',stroke:'#fff',strokeThickness:4}).setDepth(21);
  this.rbBg=this.add.graphics().setDepth(20);this.rbBtn=btn(this,W-90,H-60,140,80,'🌈',0xffffff,()=>this.bigAttack(),44).setDepth(21).setAlpha(0.5);
  btn(this,W-50,40,70,60,'🗺️',0xffe0f0,()=>{Save.write();this.scene.start('Map');},30).setDepth(20);
  const sd=Save.data;Char.ensure(this,sd.character,()=>{if(this.heroWrap)return;this.heroWrap=this.add.container(...HERO_POS).setDepth(8);
   this.hero=Char.build(this,0,0,190,sd.character,sd.equipped,'happy');this.heroWrap.add(this.hero);this.tweens.add({targets:this.hero,y:-8,duration:800,yoyo:true,repeat:-1});});
  this.spawnTimer=this.time.addEvent({delay:this.spawnDelay(),loop:true,callback:()=>this.spawn()});this.spawn();
  this.time.addEvent({delay:20000,loop:true,callback:()=>checkRest(this)});
  Sound.say('守住城堡，打完 3 波怪物就過關！開局可以蓋一座塔。');this.updHud();this.paintSlots();this.showBanner('第 1 波，準備！',6000);if(this.mercy)floatText(this,W/2,120,'小精靈多給你一些金幣了！','#ffeb3b');}
 // princess expression: art layer (princess_expr_*) if delivered, else a small emoji bubble over her head
 heroExpr(k,ms){if(!this.heroWrap)return;const sd=Save.data;
  if(Art.exprOK(this,k)){const y=this.hero.y;this.hero.destroy();this.hero=Char.build(this,0,0,190,sd.character,sd.equipped,k);this.hero.y=y;this.heroWrap.add(this.hero);
   this.tweens.add({targets:this.hero,y:-8,duration:800,yoyo:true,repeat:-1});
   if(ms)this.time.delayedCall(ms,()=>{if(!this.heroWrap||this.done)return;this.hero.destroy();this.hero=Char.build(this,0,0,190,sd.character,sd.equipped,'happy');this.heroWrap.add(this.hero);this.tweens.add({targets:this.hero,y:-8,duration:800,yoyo:true,repeat:-1});});return;}
  const e=this.add.text(0,-215,Art.entry('princess_expr_'+k).fallback||'😊',{fontSize:'40px'}).setOrigin(0.5).setScale(0);this.heroWrap.add(e);
  this.tweens.add({targets:e,scale:1,y:-235,duration:250,ease:'Back.easeOut'});this.time.delayedCall(ms||1000,()=>this.tweens.add({targets:e,alpha:0,duration:250,onComplete:()=>e.destroy()}));}
 heroJob(){const j=Save.data.character&&Save.data.character.job;return HERO_JOBS[j]||HERO_JOBS.warrior;}
 updHud(){this.coinTxt.setText(String(this.coins));
  const left=this.remaining(),prog=this.goal?1-left/this.goal:0,fillW=TdUI.fillWidth(prog);
  if(this.waveFill){if(fillW<=0)this.waveFill.setVisible(false);else{this.waveFill.setVisible(true);this.waveFill.setSize(fillW,36);}}
  else if(this.waveFillLeft){const on=fillW>0; [this.waveFillLeft,this.waveFillMid,this.waveFillRight].forEach(p=>p&&p.setVisible(on));if(on){this.waveFillLeft.setPosition(244,20);const mid=Math.max(0,fillW-36);if(this.waveFillMid){this.waveFillMid.setPosition(262,20);this.waveFillMid.setDisplaySize(mid||1,36);this.waveFillMid.setVisible(mid>0);}this.waveFillRight.setPosition(244+fillW-18,20);}}
  else{this.waveBar.clear();if(!this.waveBarFrame){this.waveBar.fillStyle(0xffffff,0.85).fillRoundedRect(240,16,400,44,16).lineStyle(3,0xffc1dc).strokeRoundedRect(240,16,400,44,16);}if(fillW>0)this.waveBar.fillStyle(0xffb3d4,0.95).fillRoundedRect(244,20,fillW,36,18);}
  this.waveTxt.setText("第 "+this.wave+"/"+this.waves+" 波　還剩 "+left+" 隻");
  if(this.heartBar)this.heartBar.clear();
  if(!this.heartBarBg){this.heartBar.fillStyle(0xffffff,0.85).fillRoundedRect(20,62,280,26,10);}
  for(let i=0;i<HEARTS;i++){const on=i<this.hearts;if(this.heartIcons[i]&&TdUI.has(on?'heart_full':'heart_empty'))this.heartIcons[i].setTexture(TdUI.key(on?'heart_full':'heart_empty')).setDisplaySize(24,18);
   else if(!this.heartIcons[i]){this.heartBar.fillStyle(on?0xff6fae:0xe0d0e8).fillRoundedRect(26+i*27,66,24,18,5);}}
  this.heartTxt.setText("");
  this.rbBg.clear();this.rbBg.fillStyle(0xffffff,0.8).fillRoundedRect(W-330,H-80,160,40,20);const cols=[0xff8a80,0xffd180,0xfff59d,0xa5d6a7,0x90caf9,0xce93d8];
  const w=150*this.rainbow;for(let i=0;i<6;i++){const x0=W-325+i*25;const ww=Math.max(0,Math.min(25,w-i*25));if(ww>0)this.rbBg.fillStyle(cols[i]).fillRect(x0,H-75,ww,30);}
  this.rbBtn.setAlpha(this.rainbow>=1?1:0.45);if(this.paintSlots)this.paintSlots();}
 paintSlots(){if(!this.slotObjs)return;this.slotObjs.forEach((so,i)=>{if(this.towers[i]){if(so.art)so.art.setVisible(false);return;}
  const ok=this.coins>=BALANCE.coins.build;so.greyed=!ok;this.markSlot(i,so.pressed,true);});}
 markSlot(i,pressed,fromPaint){const so=this.slotObjs[i];if(!so||this.towers[i])return;if(!fromPaint)so.pressed=!!pressed;const ok=this.coins>=BALANCE.coins.build;so.greyed=!ok;
  const st=so.pressed?'selected':(ok?'available':'greyed');so.state=st;
  if(so.art&&so.art.setTexture&&TdUI.has('build_slot_'+st))so.art.setTexture(TdUI.key('build_slot_'+st)).setDisplaySize(90,90).setVisible(true);
  else if(so.base&&so.base.setFillStyle){so.base.setFillStyle(ok?0xffffff:0xb0b0b0,ok?0.6:0.35).setStrokeStyle(5,ok?0xff9ec4:0x9e9e9e);if(so.t&&so.t.setAlpha)so.t.setAlpha(ok?1:0.4);}
 }
 giveCoins(n,x,y){if(!n)return;this.coins+=n;this.flyCoin(x,y);this.updHud();}
 flyCoin(x,y){let c;if(this.textures.exists('td_coin_fly_sheet')&&this.anims.exists('td_coin_fly')){c=this.add.sprite(x||W/2,y||H/2,'td_coin_fly_sheet','0').setDepth(120).setDisplaySize(48,48);c.play('td_coin_fly');}
  else if(TdUI.has('coin_fly'))c=TdUI.img(this,'coin_fly',x||W/2,y||H/2,[0.5,0.5],[32,32]).setDepth(120);
  else c=this.add.text(x||W/2,y||H/2,'🪙',{fontSize:'32px'}).setDepth(120);
  this.tweens.add({targets:c,x:48,y:40,scale:0.7,duration:450,ease:'Cubic.easeIn',onComplete:()=>c.destroy()});}
 showBanner(text,ms){if(this.banner)this.banner.destroy();const o=this.banner=this.add.container(W/2,200).setDepth(90);
  const bg=TdUI.has('wave_banner_blank')?TdUI.img(this,'wave_banner_blank',0,0,[0.5,0.5],[640,140]):(()=>{const g=this.add.graphics();g.fillStyle(0x5a2d6e,0.92).fillRoundedRect(-320,-70,640,140,24).lineStyle(5,0xffc1dc).strokeRoundedRect(-320,-70,640,140,24);return g;})();
  const label=this.add.text(0,0,text,{fontFamily:FONT,fontSize:'48px',color:'#fff8fc',stroke:'#b388ff',strokeThickness:8,align:'center',fontStyle:'bold'}).setOrigin(0.5);
  o.add([bg,label]);o.bannerLabel=label;
  this.time.delayedCall(ms==null?2200:ms,()=>{if(this.banner===o){o.destroy();this.banner=null;}});}
 posAt(d){d=Phaser.Math.Clamp(d,0,this.pathLen);for(let i=0;i<this.segs.length;i++){if(d<=this.segs[i]){const f=d/this.segs[i];return[PATH[i][0]+(PATH[i+1][0]-PATH[i][0])*f,PATH[i][1]+(PATH[i+1][1]-PATH[i][1])*f];}d-=this.segs[i];}return PATH[PATH.length-1];}
 spawn(){if(this.done||this.busy||this.breaking)return;
  if(this.spawned>=this.goal||this.waveSpawned>=this.waveSize(this.wave)||this.mons.filter(m=>m.alive).length>=BALANCE.maxAlive)return;
  const last=this.stage.boss&&this.spawned===this.goal-1;const kind=last?MONSTERS[4]:MONSTERS[Math.min(3,Math.floor(Math.random()*(1+this.stage.n)))];
  this.spawned++;this.waveSpawned++;const c=this.add.container(...this.posAt(0)).setDepth(6);const shadow=this.add.ellipse(0,26,50,14,0x000000,0.15);
  const ae=Art.entry(kind.art),art=Art.has(this,kind.art),disp=art?(ae.displayPx||(last?180:84)):0,gy=MON_GROUND-(art?(ae.floatPx||0):0);
  const t=art?Art.make(this,0,gy,kind.art,disp,kind.e):this.add.text(0,0,kind.e,{fontSize:last?'110px':'56px'}).setOrigin(0.5);if(t.baseScale==null)t.baseScale=1;
  const barY=art?Math.round(gy-disp*0.93-14):-50;const M=BALANCE.monster,hpN=Math.min(this.stage.n,M.hpStageCap||this.stage.n),spN=Math.min(this.stage.n,M.speedStageCap||this.stage.n),hpMax=last?M.bossHP:(M.hpBase+(hpN-1)*M.hpPerStage);
  const bar=this.add.graphics();c.add([shadow,t,bar]);const speed=(last?M.bossSpeed:M.speedBase+(spN-1)*M.speedPerStage)*this.speedMul;
  const m={c,t,bar,barY,flip:art&&!!ae.flipWhenMovingRight,d:0,hp:hpMax,hpMax,alive:true,kind,speed,slowT:0,slowMul:1,boss:last,wave:this.wave};this.mons.push(m);this.drawHp(m);
  this.tweens.add({targets:t,scaleY:t.baseScale*0.9,scaleX:t.baseScale*1.08,duration:300,yoyo:true,repeat:-1});
  if(!Save.data.seenMonsters.includes(kind.id))Save.data.seenMonsters.push(kind.id);this.updHud();}
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
  if(m.hp<=0){m.alive=false;this.killed++;Save.data.gems+=1;const pay=m.boss?BALANCE.coins.boss:BALANCE.coins.kill;this.giveCoins(pay,m.c.x,m.c.y-40);floatText(this,m.c.x,m.c.y-60,'🪙+'+pay,'#ffeb3b');
   this.tweens.killTweensOf(m.t);m.bar.clear();this.tweens.add({targets:m.c,scaleX:1.3,scaleY:0.2,alpha:0,duration:160,ease:'Cubic.easeIn',onComplete:()=>m.c.destroy()});fxStarsAway(this,m.c.x,m.c.y,m.boss?12:7);this.updHud();this.checkEnd();}}
 checkEnd(){if(this.done)return;if(this.hearts<=0)return;const waveDone=this.waveSpawned>=this.waveSize(this.wave)&&!this.mons.some(m=>m.alive&&m.wave===this.wave);if(waveDone&&!this.breaking){if(this.wave>=this.waves&&this.killed+this.passed>=this.goal){this.time.delayedCall(600,()=>this.win());return;}if(this.wave<this.waves)this.startBreak();}else if(this.killed+this.passed>=this.goal)this.time.delayedCall(600,()=>this.win());}
 startBreak(){this.breaking=true;this.showBanner('第 '+(this.wave+1)+' 波，準備！',BALANCE.breakMs);this.time.delayedCall(BALANCE.breakMs,()=>{if(this.done)return;this.wave++;this.waveSpawned=0;this.breaking=false;this.updHud();this.spawn();});}
 // ---------- castle hearts + gentle defeat ----------
 reachCastle(m){m.alive=false;this.passed++;this.hearts=Math.max(0,this.hearts-(m.boss?BALANCE.bossLeak:BALANCE.leak));Sound.soft();this.cameras.main.shake(220,0.008);
  floatText(this,930,430,'💔','#ff8a80');this.tweens.add({targets:this.castle,angle:{from:-6,to:6},duration:70,yoyo:true,repeat:3,onComplete:()=>{this.castle.angle=0;}});
  this.tweens.add({targets:m.c,alpha:0,scale:0.4,duration:300,onComplete:()=>m.c.destroy()});this.updHud();
  if(this.hearts<=0)this.defeat();else this.checkEnd();}
 defeat(){if(this.done)return;this.done=true;this.defeated=true;this.spawnTimer.remove();if(this.picker){this.picker.destroy();this.picker=null;this.picking=false;}
  if(this.q){this.q.destroy();this.q=null;this.qOpen=false;}Save.write();// progress (gems, stars, SRS) already saved; nothing is taken away
  window.StageFails[this.stage.n]=(window.StageFails[this.stage.n]||0)+1;
  Sound.say('沒關係！小精靈把城堡修好了，再試一次吧！');
  if(this.banner){this.banner.destroy();this.banner=null;}const o=this.defeatUI=this.add.container(0,0).setDepth(150);o.add(this.add.rectangle(W/2,H/2,W,H,0x2b1f45,0.55).setInteractive());
  const card=TdUI.has('lose_card_blank')?TdUI.img(this,'lose_card_blank',212,164,[0,0],[600,440]):(()=>{const g=this.add.graphics();g.fillStyle(0xfff6fb).fillRoundedRect(212,164,600,440,36).lineStyle(6,0xffc1dc).strokeRoundedRect(212,164,600,440,36);return g;})();
  o.add(card);
  o.add(this.add.text(512,330,'城堡累了，沒關係！',{fontFamily:FONT,fontSize:'36px',color:'#5a2d6e',fontStyle:'bold'}).setOrigin(0.5));
  o.add(this.add.text(512,380,'再試一次就好～',{fontFamily:FONT,fontSize:'24px',color:'#9a6ab8'}).setOrigin(0.5));
  o.add(TdUI.btn(this,'retry',512,462,280,100,'馬上再試一次',()=>this.retry(),32));
  o.add(TdUI.btn(this,'map',512,560,230,72,'回地圖',()=>this.toMap(),26));}
 retry(){this.scene.restart({stage:this.stage});}
 // ---------- towers ----------
 tapSlot(i){if(this.busy||this.done)return;const tw=this.towers[i],[x,y]=SLOTS[i];
  if(!tw){if(this.coins<BALANCE.coins.build){floatText(this,x,y-40,'金幣不夠，先打敗怪物吧！','#ffeb3b');Sound.soft();return;}this.openPicker(i);return;}
  if(tw.lv>=2){floatText(this,x,y+(this.slotObjs[i].topY||-40)-20,'滿級 ✨','#ffeb3b');Sound.pop();return;}
  if(this.coins<BALANCE.coins.upgrade){floatText(this,x,y-40,'升級要 '+BALANCE.coins.upgrade+' 金幣','#ffeb3b');Sound.soft();return;}
  this.pending={kind:'up',slot:i,type:tw.type};this.ask();}
 openPicker(i){this.picking=true;this.pickingSlot=i;this.markSlot(i,true);const p=this.picker=this.add.container(0,0).setDepth(95);
  p.add(this.add.rectangle(W/2,H/2,W,H,0x2b1f45,0.35).setInteractive());
  const card=this.add.graphics();card.fillStyle(0xfff8fc).fillRoundedRect(W/2-340,H-300,680,260,30).lineStyle(5,0xffc1dc).strokeRoundedRect(W/2-340,H-300,680,260,30);p.add(card);
  Object.entries(TOWER_TYPES).forEach(([k,T],n)=>{const b=btn(this,W/2-210+n*210,H-170,190,190,'',0xffe4f1,()=>{this.closePicker();this.pending={kind:'build',slot:i,type:k};this.ask();});
   b.add(this.add.text(0,-40,T.e,{fontSize:'64px'}).setOrigin(0.5));b.add(this.add.text(0,30,T.name,{fontFamily:FONT,fontSize:'26px',color:'#5a2d6e'}).setOrigin(0.5));
   b.add(this.add.text(0,64,T.desc,{fontFamily:FONT,fontSize:'20px',color:'#9a6ab8'}).setOrigin(0.5));b.towerType=k;p.add(b);});
  p.add(btn(this,W/2+300,H-290,64,56,'✖',0xf3e9ff,()=>this.closePicker(),26));
  Sound.say('選一座塔');}
 closePicker(){if(this.picker){this.picker.destroy();this.picker=null;}const i=this.pickingSlot;this.picking=false;this.pickingSlot=null;if(i!=null)this.markSlot(i,false);}
 // tower sprite: Lily's art (bottom-center anchor on the slot's ground point) or the emoji fallback
 towerSprite(i,type,lv){const so=this.slotObjs[i],T=TOWER_TYPES[type],k='tower_'+type+'_lv'+lv;if(so.t)so.t.destroy();
  let g;if(Art.has(this,k)){g=Art.make(this,0,TOWER_GROUND,k,TOWER_ART_PX,T.e);if(so.art)so.art.setVisible(false);if(so.base&&so.base.setFillStyle)so.base.setVisible(true).setScale(0.9,0.38).setPosition(0,TOWER_GROUND-4).setFillStyle(0x000000,0.14).setStrokeStyle(0);}
  else{g=this.add.text(0,0,T.e,{fontSize:(lv>1?64:54)+'px'}).setOrigin(0.5);g.baseScale=1;}
  so.c.addAt(g,1);so.t=g;so.c.bringToTop(so.lv);
  // keep UI above the real top of the art (star Lv2's flag reaches the canvas top)
  so.topY=g.isArt?TOWER_GROUND-(g.height*g.originY-(Art.entry(k).bboxPx||[0,0])[1])*g.baseScale:-40;return g;}
 buildTower(i,type){const[x,y]=SLOTS[i],so=this.slotObjs[i],T=TOWER_TYPES[type];if(so.pulse)so.pulse.stop();if(so.art)so.art.setVisible(false);if(so.base&&so.base.setFillStyle){so.base.setVisible(true).setScale(1).setFillStyle(T.color,0.55).setStrokeStyle(5,0xffffff);}
  const g=this.towerSprite(i,type,1);g.setScale(0);this.tweens.add({targets:g,scale:g.baseScale,duration:400,ease:'Back.easeOut'});so.lv.setText('★');
  this.towers[i]={type,lv:1,cd:300};this.coins-=BALANCE.coins.build;stars(this,x,y,20);Sound.chime(5);floatText(this,x,y+so.topY-20,T.name+'！','#ffffff');this.updHud();}
 upgradeTower(i){const tw=this.towers[i],[x,y]=SLOTS[i],so=this.slotObjs[i];tw.lv=2;tw.cd=0;so.lv.setText('★★');if(!so.t.isArt&&so.base&&so.base.setStrokeStyle)so.base.setStrokeStyle(7,0xffd54f);
  const g=this.towerSprite(i,tw.type,2);const b=g.baseScale;g.setScale(b*0.6,b*1.3);this.tweens.add({targets:g,scaleX:b,scaleY:b,duration:420,ease:'Elastic.easeOut'});
  this.coins-=BALANCE.coins.upgrade;stars(this,x,y+so.topY/2,28);fxSparkle(this,x,y+so.topY/2,40);Sound.fanfare();floatText(this,x,y+so.topY-20,'升級 ⬆','#ffeb3b');this.updHud();}
 towerFire(i,m){const tw=this.towers[i],T=TOWER_TYPES[tw.type],st=T.lv[tw.lv-1];const[x,y]=SLOTS[i];
  {const g=this.slotObjs[i].t;this.tweens.add({targets:g,scaleX:g.baseScale*1.08,scaleY:g.baseScale*0.94,duration:80,yoyo:true});}
  if(tw.type==='flower')this.shoot(x,y-30,m,T.color,()=>this.hit(m,st.dmg,{slowMs:st.slowMs,slowMul:st.slowMul,knock:6}),'🌸');
  else if(tw.type==='star')this.shoot(x,y-30,m,T.color,()=>this.hit(m,st.dmg,{knock:18}),'⭐');
  else this.shoot(x,y-30,m,T.color,()=>{const cx=m.c.x,cy=m.c.y;const ring=this.add.circle(cx,cy,10,T.color,0.45).setDepth(29);
   this.tweens.add({targets:ring,radius:st.splash,alpha:0,duration:300,onComplete:()=>ring.destroy()});
   this.mons.filter(o=>o.alive&&Phaser.Math.Distance.Between(cx,cy,o.c.x,o.c.y)<=st.splash).forEach(o=>this.hit(o,st.dmg,{knock:8}));},'🫧');}
 // ---------- hero ----------
 heroAttack(m,power){const J=this.heroJob(),w=this.heroWrap;if(!w||!m||!m.alive)return;const dmg=J.dmg+(power?2:0);
  Sound.attack();const fx=HERO_POS[0],fy=HERO_POS[1]-70;const wasBusy=this.heroBusy;this.heroBusy=true;const done=()=>{this.heroBusy=false;};
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
 ask(){if(this.qOpen||this.done)return;const types=['hear','pic2spell','spell2pic','drag'];this.qtype=this.forceType||types[Math.floor(Math.random()*4)];
  let it=Learn.pick(this.stage.lessons,this.lastItem?.id,this.qtype);if(!it){this.qtype='hear';it=Learn.pick(this.stage.lessons,this.lastItem?.id,'hear');}if(!it)return;
  this.qOpen=true;this.lastItem=it;this.item=it;this.firstTry=true;this.buildQ();}
 buildQ(){if(!Learn.typeAllowed(this.item,this.qtype))this.qtype='hear';if(this.q)this.q.destroy();const q=this.q=this.add.container(0,0).setDepth(100);const it=this.item,w=it.word,largePicture=this.qtype==='pic2spell';
  q.add(this.add.rectangle(W/2,H/2,W,H,0x2b1f45,0.45).setInteractive());const card=this.add.graphics();card.fillStyle(0xfff8fc,0.97).fillRoundedRect(112,70,800,620,36).lineStyle(6,0xffc1dc).strokeRoundedRect(112,70,800,620,36);q.add(card);
  const P=this.pending;if(P){const T=TOWER_TYPES[P.type];q.add(this.add.text(largePicture?184:W/2,largePicture?126:98,(P.kind==='up'?'⬆ 升級 ':'🔨 蓋 ')+T.e+' '+T.name,{fontFamily:FONT,fontSize:largePicture?'14px':'24px',color:'#9a6ab8',align:'center',wordWrap:{width:largePicture?124:650,useAdvancedWrap:true}}).setOrigin(0.5));}
  const instructions={hear:'聽聽看，黃色框的音是第幾聲？',pic2spell:'看圖聽讀音，選出正確的注音。',spell2pic:'看注音聽讀音，點選正確的圖片。',drag:'把正確的聲調拖到黃色框，也可以點一下聲調。'};
  this.promptInstruction=instructions[this.qtype];this.promptKey=this.qtype+':'+it.id;
  const target='（第'+(it.syl+1)+'個音）';this.instructionText=this.add.text(largePicture?512:580,largePicture?94:140,largePicture?this.promptInstruction:this.promptInstruction.replace('，','，\n'),{fontFamily:FONT,fontSize:largePicture?'22px':this.qtype==='drag'?'22px':'23px',color:'#5a2d6e',align:'center',wordWrap:{width:largePicture?600:320,useAdvancedWrap:true}}).setOrigin(.5);q.add(this.instructionText);
  if(['hear','pic2spell','drag'].includes(this.qtype)){this.targetLabel=this.add.text(largePicture?512:620,largePicture?128:180,target,{fontFamily:FONT,fontSize:largePicture?'16px':'18px',color:'#9a6ab8'}).setOrigin(.5);q.add(this.targetLabel);}
  const speak=()=>Sound.prompt(this.promptInstruction,w,this.promptKey);Sound.loadWord(w.id);this.replayButton=btn(this,830,130,108,90,'🔊 重聽',0xe1f5fe,speak,23);q.add(this.replayButton);Sound.replayArt(this,this.replayButton,this.promptKey);const hk='audio_ui_hint_'+this.qtype;if(this.textures.exists(hk)){const h=largePicture?{center:[184,250],size:[120,75]}:Sound.ui.hint;this.hintImage=this.add.image(...h.center,hk).setDisplaySize(...h.size);q.add(this.hintImage);q.add(this.add.text(h.center[0],largePicture?199:94,'怎麼玩（示意）',{fontFamily:FONT,fontSize:largePicture?'12px':'16px',color:'#9a6ab8'}).setOrigin(.5));}
  const oldKey=this.promptKey;this.time.delayedCall(250,()=>{if(this.q===q&&this.promptKey===oldKey)speak();});
  q.add(btn(this,170,640,70,60,'✖',0xf3e9ff,()=>this.cancelQ(),26));
  this.opts=[];this.questionPictures=[];this.wordLabel=null;const T=this.qtype,ownPicture=Learn.picture(w);
  const addWordPicture=(pw,x,y,size,role='target',button=null,glyphSize=size)=>{const p=Learn.picture(pw);if(!p)return null;let im;if(p.kind==='image'){im=QuestionArt.image(this,pw,button?0:x,button?0:y,size*1.6,size);if(!im)return null;if(button){button.label.setVisible(false);button.add(im);}else q.add(im);}else if(p.kind==='emoji'&&p.glyph){im=button?button.label:this.add.text(x,y,p.glyph,{fontSize:glyphSize+'px'}).setOrigin(.5);if(button)button.label.setText(p.glyph);if(!button)q.add(im);}else return null;im.setData({pictureWordId:p.wordId,representedWordId:pw.id,questionWordId:w.id,pictureRole:role});this.questionPictures.push({wordId:p.wordId,pictureId:p.pictureId,expectedWordId:pw.id,questionWordId:w.id,role,glyph:p.glyph,signature:p.signature,kind:p.kind,object:im});return im;};
  const wordOrPicture=()=>{if(ownPicture)addWordPicture(w,W/2,232,88);else{this.wordLabel=this.add.text(W/2,235,w.word,{fontFamily:FONT,fontSize:'48px',color:'#5a2d6e'}).setOrigin(.5);q.add(this.wordLabel);}};
  const sylRow=(y,hideIdx,hideMode)=>{const n=w.zhuyin.length;const sp=Math.min(240,680/n);w.zhuyin.forEach((z,i)=>{const x=W/2-(n-1)*sp/2+i*sp;const hl=i===it.syl;
   const box=this.add.rectangle(x,y,sp-14,96,hl?0xfff3b0:0xffffff).setStrokeStyle(hl?5:2,hl?0xffb300:0xe0d0f0);q.add(box);
   let txt=z+(w.tones[i]===0?'˙':TONE_SHOW[w.tones[i]]);if(i===hideIdx)txt=z+(hideMode||'');q.add(this.add.text(x,y,txt,{fontFamily:FONT,fontSize:ownPicture?'48px':(n>2?'52px':'56px'),color:'#5a2d6e'}).setOrigin(0.5));if(hl)this.hlBox={x,y,box};});};
  if(T==='hear'){wordOrPicture();sylRow(330,it.syl,' ?');
   [1,2,3,4].forEach((tn,i)=>{const x=W/2-270+i*180;const b=btn(this,x,520,160,150,'',0xffe4f1,null);b.removeAllListeners('pointerdown');b.on('pointerdown',()=>{b.toneDown=true;Sound.pop();});b.on('pointerout',()=>{b.toneDown=false;});b.toneMark=this.add.text(0,18,TONE_MARK[tn],{fontFamily:FONT,fontSize:'92px',color:'#5a2d6e'}).setOrigin(.5);b.add(b.toneMark);Sound.toneButtonArt(this,b,tn,b.bg,b.toneMark);b.on('pointerup',()=>{if(b.toneDown){b.toneDown=false;this.answer(tn===it.tone,tn,b);}});b.tone=tn;q.add(b);this.opts.push(b);});
}
  if(T==='pic2spell'){addWordPicture(w,W/2,306,320,'target',null,220);
   const tones=Phaser.Utils.Array.Shuffle([it.tone,...Phaser.Utils.Array.Shuffle([1,2,3,4].filter(x=>x!==it.tone)).slice(0,2)]);
   tones.forEach((tn,i)=>{const b=btn(this,W/2,508+i*68,560,60,Learn.spell(w,it.syl,tn),0xffe4f1,()=>this.answer(tn===it.tone,tn,b),34);b.tone=tn;q.add(b);this.opts.push(b);});}
  if(T==='spell2pic'){q.add(this.add.text(W/2,300,Learn.spell(w),{fontFamily:FONT,fontSize:'52px',color:'#5a2d6e'}).setOrigin(0.5));
   // P0 fix: distractors differ in tone at the target syllable, and the chosen word's tone is recorded like other types
   const pics=Phaser.Utils.Array.Shuffle([w,...Learn.toneDistractPics(it,2)]);pics.forEach((pw,i)=>{const ct=pw===w?it.tone:Learn.toneAt(pw,it.syl);
    const b=btn(this,W/2-248+i*248,450,240,150,'',0xffe4f1,()=>this.answer(pw===w,ct,b),100);b.tone=ct;b.correct=pw===w;b.wordId=pw.id;addWordPicture(pw,0,0,150,'option',b);q.add(b);this.opts.push(b);});}
  if(T==='drag'){wordOrPicture();sylRow(330,it.syl,'');
   q.add(this.add.text(W/2,420,'👆 ➡ ⬆',{fontSize:'34px'}).setOrigin(0.5).setAlpha(0.7));
   [1,2,3,4].forEach((tn,i)=>{const x=W/2-270+i*180,y=560;const tile=this.add.container(x,y);const g=this.add.graphics();g.fillStyle(0xd1c4e9).fillRoundedRect(-60,-60,120,120,24);
    tile.toneMark=this.add.text(0,18,TONE_MARK[tn],{fontFamily:FONT,fontSize:'84px',color:'#4a148c'}).setOrigin(.5);tile.add([g,tile.toneMark]);tile.setSize(120,120).setInteractive({draggable:true});Sound.toneButtonArt(this,tile,tn,g,tile.toneMark);
    this.input.setDraggable(tile);tile.home=[x,y];tile.tone=tn;tile.on('drag',(p,dx,dy)=>{tile.didDrag=true;tile.x=dx;tile.y=dy;});
    tile.on('pointerdown',()=>{tile.didDrag=false;});tile.on('pointerup',()=>{if(!tile.didDrag)this.answer(tn===it.tone,tn,tile);});tile.on('dragend',()=>{const hb=this.hlBox;if(hb&&Phaser.Math.Distance.Between(tile.x,tile.y,hb.x,hb.y)<110){this.answer(tn===it.tone,tn,tile);}tile.x=tile.home[0];tile.y=tile.home[1];});
    q.add(tile);this.opts.push(tile);});}}
 answer(ok,tn,b){if(this.answering||!this.q)return;if(b.selectTone){this.opts.forEach(o=>{if(o!==b)o.unselectTone?.();});b.selectTone();}const it=this.item;
  if(this.firstTry){Learn.record(it,ok,tn);this.firstTry=false;if(!ok)this.mistakes++;Save.write();}
  if(ok){this.answering=true;this.streak++;this.correctTotal++;this.rainbow=Math.min(1,this.rainbow+0.25);Sound.chime(this.streak);
   fxSparkle(this,b.x||W/2,b.y||H/2,110);this.giveCoins(BALANCE.coins.correct,b.x||W/2,b.y||H/2);floatText(this,W/2,150,['⭐','🌟','💖','✨'][this.streak%4]+' 🪙+'+BALANCE.coins.correct,'#ffeb3b');Save.data.stars++;
   this.time.delayedCall(450,()=>{this.closeQ();Sound.sayWord(it.word);this.reward(true);});}
  else{this.streak=0;Sound.soft();b.setAlpha(0.35);if(b.disableInteractive)b.disableInteractive();
   const ch=it.word.word[it.syl]||it.word.word;if(Sound.hasWord(it.word.id))Sound.sayWord(it.word);else Sound.say(ch+'，'+it.word.word,0.7);
   const gp=this.add.graphics().setDepth(101);this.q.add(gp);if(this.qtype==='pic2spell'){gp.fillStyle(0xffffff,0.95).fillRoundedRect(788,286,106,94,12);
    this.q.add(this.add.text(841,320,TONE_MARK[it.tone],{fontFamily:FONT,fontSize:'42px',color:'#ff6fae'}).setOrigin(.5).setDepth(102));this.q.add(this.add.text(841,359,'再聽一次',{fontFamily:FONT,fontSize:'12px',color:'#9a6ab8'}).setOrigin(.5).setDepth(102));}
   else{gp.fillStyle(0xffffff,0.95).fillRoundedRect(720,636,170,44,12);this.q.add(this.add.text(750,658,TONE_MARK[it.tone],{fontFamily:FONT,fontSize:'32px',color:'#ff6fae'}).setOrigin(0.5).setDepth(102));this.q.add(toneGesture(this,830,658,it.tone,60,30).setDepth(102));}
   if(this.hlBox){this.tweens.add({targets:this.hlBox.box,scale:1.15,duration:200,yoyo:true,repeat:2});}}
  this.updHud();}
 cancelQ(){if(this.answering)return;Sound.cancelPrompt();if(this.q){this.q.destroy();this.q=null;}this.qOpen=false;this.pending=null;}
 closeQ(){Sound.cancelPrompt();this.answering=false;if(this.q){this.q.destroy();this.q=null;}this.qOpen=false;const P=this.pending;this.pending=null;if(this.done)return;
  if(P){if(P.kind==='build'&&!this.towers[P.slot])this.buildTower(P.slot,P.type);else if(P.kind==='up'&&this.towers[P.slot]&&this.towers[P.slot].lv<2)this.upgradeTower(P.slot);}
  // correct answer = princess power attack on the nearest monster
  const m=this.nearest(HERO_POS[0],HERO_POS[1]);if(m&&this.heroWrap)this.heroAttack(m,true);this.heroExpr('cheer',1200);
  this.updHud();Save.write();}
 reward(){if(this.streak>0&&this.streak%3===0)this.dropTreasure(false);}
 dropTreasure(final){const sd=Save.data;const left=TREASURES.filter(t=>!sd.inventory.includes(t));
  if(!left.length){sd.gems+=10;Save.write();floatText(this,W/2,300,'💎+10','#b3e5fc');if(final&&!this.winUI)this.time.delayedCall(900,()=>this.toMap());return;}
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
  sd.stagesStars[this.stage.n]=Math.max(sd.stagesStars[this.stage.n]||0,st);sd.gems+=5*st;window.StageFails[this.stage.n]=0;Save.write();Sound.fanfare();Sound.say('過關了！你好棒！');
  if(this.banner){this.banner.destroy();this.banner=null;}const o=this.winUI=this.add.container(0,0).setDepth(150);o.add(this.add.rectangle(W/2,H/2,W,H,0xffffff,0.35).setInteractive());
  const card=TdUI.has('win_card_blank')?TdUI.img(this,'win_card_blank',212,164,[0,0],[600,440]):(()=>{const g=this.add.graphics();g.fillStyle(0xfff8fc).fillRoundedRect(212,164,600,440,36).lineStyle(6,0xffc1dc).strokeRoundedRect(212,164,600,440,36);return g;})();
  o.add(card);
  if(TdUI.has('win_confetti'))o.add(TdUI.img(this,'win_confetti',212,164,[0,0],[600,440]));
  if(st===3&&TdUI.has('win_stars_3'))o.add(TdUI.img(this,'win_stars_3',512,200,[0.5,0.5],[400,140]));
  else{const gap=130,x0=512-(st-1)*gap/2;for(let i=0;i<3;i++){const on=i<st,nm=on?'star_full':'star_empty';
    if(TdUI.has(nm))o.add(TdUI.img(this,nm,512+(i-1)*130,200+(i===1?-10:0),[0.5,0.5],[96,96]));
    else o.add(this.add.text(512+(i-1)*130,200,on?'⭐':'☆',{fontSize:'80px'}).setOrigin(0.5));}}
  o.add(this.add.text(512,360,'過關了！',{fontFamily:FONT,fontSize:'44px',color:'#5a2d6e',fontStyle:'bold'}).setOrigin(0.5));
  o.add(this.add.text(512,414,'楷芯好棒！',{fontFamily:FONT,fontSize:'26px',color:'#9a6ab8'}).setOrigin(0.5));
  // Current win flow has no next-stage action (it returns to the Map after the treasure drop). No 下一關 button.
  o.add(TdUI.btn(this,'map',512,560,230,72,'回地圖',()=>this.toMap(),26));
  this.time.delayedCall(1200,()=>this.dropTreasure(true));}
 toMap(){Save.write();this.scene.start('Map');}}
