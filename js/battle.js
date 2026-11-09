// ---------- Battle: tower defense + tone quiz ----------
const PATH=[[0,250],[200,250],[260,420],[480,440],[540,250],[760,250],[800,470],[900,520]];
const SLOTS=[[180,370],[380,330],[420,560],[640,360],[700,560],[900,360]];
function toneGesture(sc,x,y,tone,w,h,col){const g=sc.add.graphics();const pts={1:[[0,.2],[1,.2]],2:[[0,.8],[1,.1]],3:[[0,.45],[.45,.9],[1,.15]],4:[[0,.1],[1,.9]]}[tone];
 const P=pts.map(([u,v])=>[x-w/2+u*w,y-h/2+v*h]);const o={t:0};
 sc.tweens.add({targets:o,t:1,duration:700,onUpdate:()=>{g.clear();g.lineStyle(10,col||0xff6fae);g.beginPath();g.moveTo(P[0][0],P[0][1]);
  const segs=P.length-1,tt=o.t*segs;for(let i=0;i<segs;i++){const f=Math.min(1,Math.max(0,tt-i));if(f<=0)break;g.lineTo(P[i][0]+(P[i+1][0]-P[i][0])*f,P[i][1]+(P[i+1][1]-P[i][1])*f);}g.strokePath();}});return g;}
function toneIcon(sc,x,y,tone,s){const c=sc.add.container(x,y);const g=sc.add.graphics();const pts={1:[[0,.25],[1,.25]],2:[[0,.85],[1,.15]],3:[[0,.45],[.45,.9],[1,.15]],4:[[0,.15],[1,.85]]}[tone];
 g.lineStyle(5,0x9a6ab8);g.beginPath();pts.forEach(([u,v],i)=>{const px=-s/2+u*s,py=-s/2+v*s;i?g.lineTo(px,py):g.moveTo(px,py);});g.strokePath();c.add(g);return c;}

class Battle extends Phaser.Scene{constructor(){super('Battle');}
 init(d){this.stage=d.stage;this.goal=this.stage.boss?8:5+this.stage.n*2;this.killed=0;this.spawned=0;this.mons=[];this.towers={};this.streak=0;this.rainbow=0;
  this.mistakes=0;this.qOpen=false;this.hitStop=0;this.lastItem=null;this.done=false;this.correctTotal=0;this.t0=Date.now();}
 create(){sky(this,0xa8e6cf,0xdcedc1);const g=this.add.graphics();g.lineStyle(70,0xf4e1b5);g.beginPath();g.moveTo(...PATH[0]);PATH.forEach(p=>g.lineTo(...p));g.strokePath();
  g.lineStyle(8,0xffffff,0.45);g.beginPath();g.moveTo(...PATH[0]);PATH.forEach(p=>g.lineTo(...p));g.strokePath();
  [[80,120],[330,130],[650,110],[90,600],[300,700],[560,700],[980,700],[620,470],[350,520]].forEach(([x,y],i)=>this.add.text(x,y,i%2?'🌳':'🌲',{fontSize:'58px'}).setOrigin(0.5,1));
  this.add.text(930,560,'🏰',{fontSize:'120px'}).setOrigin(0.5,1);
  this.segs=[];let tot=0;for(let i=1;i<PATH.length;i++){const d=Phaser.Math.Distance.Between(...PATH[i-1],...PATH[i]);this.segs.push(d);tot+=d;}this.pathLen=tot;
  this.slotObjs=SLOTS.map(([x,y],i)=>{const c=this.add.container(x,y);const base=this.add.circle(0,0,40,0xffffff,0.6).setStrokeStyle(5,0xff9ec4);const t=this.add.text(0,0,'✨',{fontSize:'36px'}).setOrigin(0.5);
   c.add([base,t]);c.setSize(90,90).setInteractive();c.on('pointerdown',()=>this.ask(i));this.tweens.add({targets:base,scale:1.1,duration:600,yoyo:true,repeat:-1});return{c,t,base};});
  // HUD
  this.hud=this.add.text(20,16,'',{fontFamily:FONT,fontSize:'28px',color:'#fff',stroke:'#7a3d9a',strokeThickness:6}).setDepth(20);
  this.rbBg=this.add.graphics().setDepth(20);this.rbBtn=btn(this,W-90,H-60,140,80,'🌈',0xffffff,()=>this.bigAttack(),44).setDepth(21).setAlpha(0.5);
  btn(this,W-50,40,70,60,'🗺️',0xffe0f0,()=>{this.scene.start('Map');},30).setDepth(20);
  const sd=Save.data;Char.ensure(this,sd.character,()=>{this.hero=Char.build(this,880,330,190,sd.character,sd.equipped).setDepth(5);this.tweens.add({targets:this.hero,y:322,duration:800,yoyo:true,repeat:-1});});
  this.spawnTimer=this.time.addEvent({delay:5500,loop:true,callback:()=>this.spawn()});this.spawn();
  this.time.addEvent({delay:1100,loop:true,callback:()=>this.towersFire()});
  this.time.addEvent({delay:20000,loop:true,callback:()=>checkRest(this)});
  Sound.say('點一點亮晶晶的地方，回答問題，蓋魔法塔！');this.updHud();}
 updHud(){this.hud.setText(`👾 ${this.killed}/${this.goal}   💎 ${Save.data.gems}   🔥 ${this.streak}`);
  this.rbBg.clear();this.rbBg.fillStyle(0xffffff,0.8).fillRoundedRect(W-330,H-80,160,40,20);const cols=[0xff8a80,0xffd180,0xfff59d,0xa5d6a7,0x90caf9,0xce93d8];
  const w=150*this.rainbow;for(let i=0;i<6;i++){const x0=W-325+i*25;const ww=Math.max(0,Math.min(25,w-i*25));if(ww>0)this.rbBg.fillStyle(cols[i]).fillRect(x0,H-75,ww,30);}
  this.rbBtn.setAlpha(this.rainbow>=1?1:0.45);}
 posAt(d){d=Phaser.Math.Clamp(d,0,this.pathLen);for(let i=0;i<this.segs.length;i++){if(d<=this.segs[i]){const f=d/this.segs[i];return[PATH[i][0]+(PATH[i+1][0]-PATH[i][0])*f,PATH[i][1]+(PATH[i+1][1]-PATH[i][1])*f];}d-=this.segs[i];}return PATH[PATH.length-1];}
 spawn(){if(this.done||this.qOpen)return;if(this.spawned>=this.goal||this.mons.filter(m=>m.alive).length>=3)return;
  const last=this.stage.boss&&this.spawned===this.goal-1;const kind=last?MONSTERS[4]:MONSTERS[Math.min(3,Math.floor(Math.random()*(1+this.stage.n)))];
  this.spawned++;const c=this.add.container(...this.posAt(0)).setDepth(6);const shadow=this.add.ellipse(0,26,50,14,0x000000,0.15);
  const t=this.add.text(0,0,kind.e,{fontSize:last?'110px':'56px'}).setOrigin(0.5);const hpMax=last?10:(2+Math.floor(this.stage.n/2));
  const bar=this.add.graphics();c.add([shadow,t,bar]);const m={c,t,bar,d:0,hp:hpMax,hpMax,alive:true,kind,speed:last?9:14};this.mons.push(m);this.drawHp(m);
  this.tweens.add({targets:t,scaleY:0.9,scaleX:1.08,duration:300,yoyo:true,repeat:-1});
  if(!Save.data.seenMonsters.includes(kind.id))Save.data.seenMonsters.push(kind.id);}
 drawHp(m){m.bar.clear();m.bar.fillStyle(0xffffff).fillRoundedRect(-30,-50,60,10,5);m.bar.fillStyle(0xff6fae).fillRoundedRect(-30,-50,60*m.hp/m.hpMax,10,5);}
 update(t,dt){if(this.hitStop>0){this.hitStop-=dt;return;}if(this.qOpen||this.done)return;
  for(const m of this.mons){if(!m.alive)continue;m.d+=m.speed*dt/1000;if(m.d>=this.pathLen){m.d=0;floatText(this,880,480,'💨');}const[x,y]=this.posAt(m.d);m.c.setPosition(x,y);}
  Save.data.playMs+=dt;}
 nearest(x,y,r){let best=null,bd=r||1e9;for(const m of this.mons){if(!m.alive)continue;const d=Phaser.Math.Distance.Between(x,y,m.c.x,m.c.y);if(d<bd){bd=d;best=m;}}return best;}
 shoot(x,y,m,dmg,color){if(!m)return;const b=this.add.circle(x,y,12,color||0xff9ec4).setDepth(30);
  this.tweens.add({targets:b,x:m.c.x,y:m.c.y,duration:220,onComplete:()=>{b.destroy();this.hit(m,dmg);}});}
 hit(m,dmg){if(!m.alive)return;m.hp-=dmg;this.hitStop=60;Sound.hit();m.t.setTintFill(0xffffff);this.time.delayedCall(90,()=>m.t.clearTint());
  this.cameras.main.shake(110,0.004);stars(this,m.c.x,m.c.y,12);floatText(this,m.c.x,m.c.y-30,'-'+dmg,'#fff59d');m.d=Math.max(0,m.d-22);this.drawHp(m);
  if(m.hp<=0){m.alive=false;this.killed++;Save.data.gems+=1;floatText(this,m.c.x,m.c.y-60,'💎+1','#b3e5fc');
   this.tweens.add({targets:m.c,scale:0,angle:360,alpha:0,duration:400,onComplete:()=>m.c.destroy()});this.updHud();
   if(this.killed>=this.goal)this.time.delayedCall(600,()=>this.win());}}
 towersFire(){if(this.qOpen||this.done)return;for(const k in this.towers){const tw=this.towers[k];if(tw.charges<=0)continue;const[x,y]=SLOTS[k];const m=this.nearest(x,y,300);
  if(m){tw.charges--;this.shoot(x,y-30,m,1);tw.lbl.setText('⚡'.repeat(Math.min(tw.charges,5)));}}}
 bigAttack(){if(this.rainbow<1||this.qOpen)return;this.rainbow=0;this.updHud();Sound.fanfare();Sound.say('彩虹魔法！');
  const r=this.add.rectangle(W/2,H/2,W,H,0xffffff,0.8).setDepth(45);this.tweens.add({targets:r,alpha:0,duration:500,onComplete:()=>r.destroy()});
  this.mons.filter(m=>m.alive).forEach((m,i)=>this.time.delayedCall(i*120,()=>this.hit(m,3)));}
 // ---------- quiz ----------
 ask(slot){if(this.qOpen||this.done)return;this.qOpen=true;this.slot=slot;const it=Learn.pick(this.stage.lessons,this.lastItem&&this.lastItem.id);this.lastItem=it;
  this.item=it;this.firstTry=true;const types=['hear','pic2spell','spell2pic','drag'];this.qtype=types[Math.floor(Math.random()*4)];this.buildQ();}
 buildQ(){if(this.q)this.q.destroy();const q=this.q=this.add.container(0,0).setDepth(100);const it=this.item,w=it.word;
  q.add(this.add.rectangle(W/2,H/2,W,H,0x2b1f45,0.55).setInteractive());const card=this.add.graphics();card.fillStyle(0xfff8fc).fillRoundedRect(112,70,800,620,36).lineStyle(6,0xffc1dc).strokeRoundedRect(112,70,800,620,36);q.add(card);
  const speak=()=>{Sound.say(w.word);};q.add(btn(this,830,130,90,80,'🔊',0xe1f5fe,speak,40));
  this.opts=[];const T=this.qtype;
  const sylRow=(y,hideIdx,hideMode)=>{const n=w.zhuyin.length;const sp=Math.min(170,640/n);w.zhuyin.forEach((z,i)=>{const x=W/2-(n-1)*sp/2+i*sp;const hl=i===it.syl;
   const box=this.add.rectangle(x,y,sp-14,96,hl?0xfff3b0:0xffffff).setStrokeStyle(hl?5:2,hl?0xffb300:0xe0d0f0);q.add(box);
   let txt=z+(w.tones[i]===0?'˙':TONE_SHOW[w.tones[i]]);if(i===hideIdx)txt=z+(hideMode||'');q.add(this.add.text(x,y,txt,{fontFamily:FONT,fontSize:'48px',color:'#5a2d6e'}).setOrigin(0.5));if(hl)this.hlBox={x,y,box};});};
  if(T==='hear'){q.add(this.add.text(W/2,190,w.pic,{fontSize:'110px'}).setOrigin(0.5));sylRow(330,it.syl,' ?');
   [1,2,3,4].forEach((tn,i)=>{const x=W/2-270+i*180;const b=btn(this,x,520,160,150,'',0xffe4f1,()=>this.answer(tn===it.tone,tn,b));b.add(this.add.text(0,-30,TONE_MARK[tn],{fontFamily:FONT,fontSize:'64px',color:'#5a2d6e'}).setOrigin(0.5));b.add(toneIcon(this,0,40,tn,70));q.add(b);this.opts.push(b);});
   this.time.delayedCall(250,speak);}
  if(T==='pic2spell'){q.add(this.add.text(W/2,220,w.pic,{fontSize:'140px'}).setOrigin(0.5));
   const tones=Phaser.Utils.Array.Shuffle([it.tone,...Phaser.Utils.Array.Shuffle([1,2,3,4].filter(x=>x!==it.tone)).slice(0,2)]);
   tones.forEach((tn,i)=>{const b=btn(this,W/2,400+i*95,560,80,Learn.spell(w,it.syl,tn),0xffe4f1,()=>this.answer(tn===it.tone,tn,b),40);q.add(b);this.opts.push(b);});this.time.delayedCall(250,speak);}
  if(T==='spell2pic'){q.add(this.add.text(W/2,200,Learn.spell(w),{fontFamily:FONT,fontSize:'60px',color:'#5a2d6e'}).setOrigin(0.5));
   const pics=Phaser.Utils.Array.Shuffle([w,...Learn.distractPics(it,2)]);pics.forEach((pw,i)=>{const b=btn(this,W/2-240+i*240,450,200,200,pw.pic,0xffe4f1,()=>this.answer(pw===w,null,b),100);q.add(b);this.opts.push(b);});}
  if(T==='drag'){q.add(this.add.text(W/2,190,w.pic,{fontSize:'110px'}).setOrigin(0.5));sylRow(330,it.syl,'');
   q.add(this.add.text(W/2,420,'👆 ➡ ⬆',{fontSize:'34px'}).setOrigin(0.5).setAlpha(0.7));
   [1,2,3,4].forEach((tn,i)=>{const x=W/2-270+i*180,y=560;const tile=this.add.container(x,y);const g=this.add.graphics();g.fillStyle(0xd1c4e9).fillRoundedRect(-60,-60,120,120,24);
    tile.add([g,this.add.text(0,-14,TONE_MARK[tn],{fontFamily:FONT,fontSize:'64px',color:'#4a148c'}).setOrigin(0.5),toneIcon(this,0,36,tn,50)]);tile.setSize(120,120).setInteractive({draggable:true});
    this.input.setDraggable(tile);tile.home=[x,y];tile.on('drag',(p,dx,dy)=>{tile.x=dx;tile.y=dy;});
    tile.on('dragend',()=>{const hb=this.hlBox;if(hb&&Phaser.Math.Distance.Between(tile.x,tile.y,hb.x,hb.y)<110){this.answer(tn===it.tone,tn,tile);}tile.x=tile.home[0];tile.y=tile.home[1];});
    q.add(tile);this.opts.push(tile);});this.time.delayedCall(250,speak);}}
 answer(ok,tn,b){if(this.answering)return;const it=this.item;
  if(this.firstTry){Learn.record(it,ok,tn);this.firstTry=false;}
  if(ok){this.answering=true;this.streak++;this.correctTotal++;this.rainbow=Math.min(1,this.rainbow+0.25);Sound.chime(this.streak);
   stars(this,b.x||W/2,b.y||H/2,20);floatText(this,W/2,150,['⭐','🌟','💖','✨'][this.streak%4]+' +1','#ffeb3b');Save.data.stars++;
   this.time.delayedCall(450,()=>{Sound.say(it.word.word);this.closeQ();this.reward(true);});}
  else{this.streak=0;this.mistakes++;Sound.soft();b.setAlpha(0.35);if(b.disableInteractive)b.disableInteractive();
   const m=this.nearest(0,0);if(m){m.d+=40;const[x,y]=this.posAt(m.d);this.tweens.add({targets:m.c,x,y,duration:300});}
   const ch=it.word.word[it.syl]||it.word.word;Sound.say(ch+'，'+it.word.word,0.7);
   const gp=this.add.graphics().setDepth(101);gp.fillStyle(0xffffff,0.95).fillRoundedRect(140,85,240,90,16);this.q.add(gp);
   this.q.add(this.add.text(180,130,TONE_MARK[it.tone],{fontFamily:FONT,fontSize:'56px',color:'#ff6fae'}).setOrigin(0.5).setDepth(102));
   this.q.add(toneGesture(this,290,130,it.tone,120,60).setDepth(102));
   if(this.hlBox){this.tweens.add({targets:this.hlBox.box,scale:1.15,duration:200,yoyo:true,repeat:2});}}
  this.updHud();}
 closeQ(){this.answering=false;this.q.destroy();this.q=null;this.qOpen=false;const k=this.slot,[x,y]=SLOTS[k];const so=this.slotObjs[k];
  if(!this.towers[k]){const t=this.add.text(x,y-10,'🔮',{fontSize:'60px'}).setOrigin(0.5).setDepth(7);const lbl=this.add.text(x,y+38,'',{fontSize:'16px'}).setOrigin(0.5).setDepth(7);
   this.towers[k]={t,lbl,charges:3};so.t.setText('');t.setScale(0);this.tweens.add({targets:t,scale:1,duration:400,ease:'Back.easeOut'});Sound.say('魔法塔蓋好了！');}
  else this.towers[k].charges+=3;const tw=this.towers[k];tw.lbl.setText('⚡'.repeat(Math.min(tw.charges,5)));
  const m=this.nearest(x,y);if(m)this.shoot(x,y-30,m,2,0xb388ff);this.updHud();Save.write();}
 reward(){if(this.streak>0&&this.streak%3===0)this.dropTreasure(false);}
 dropTreasure(final){const sd=Save.data;const left=TREASURES.filter(t=>!sd.inventory.includes(t));
  if(!left.length){sd.gems+=10;Save.write();floatText(this,W/2,300,'💎+10','#b3e5fc');if(final)this.time.delayedCall(900,()=>this.toMap());return;}
  const id=left[Math.floor(Math.random()*left.length)];const e=Char.m.equipment.find(q=>q.id===id);sd.inventory.push(id);Save.write();
  const ch=this.add.text(W/2,-60,'🎁',{fontSize:'80px'}).setOrigin(0.5).setDepth(90);Sound.fanfare();
  this.tweens.add({targets:ch,y:H/2-40,duration:600,ease:'Bounce.easeOut',onComplete:()=>{ch.setText(e.emoji);stars(this,W/2,H/2-40,24);
   const wear=btn(this,W/2-70,H/2+60,120,70,'👚',0xff9ec4,()=>{sd.equipped=sd.equipped.filter(x=>Char.m.equipment.find(q=>q.id===x).slot!==e.slot);sd.equipped.push(id);Save.write();
     this.hero&&this.hero.destroy();this.hero=Char.build(this,880,330,190,sd.character,sd.equipped).setDepth(5);done();},36).setDepth(91);
   const keep=btn(this,W/2+70,H/2+60,120,70,'🏠',0xe1f5fe,()=>done(),36).setDepth(91);const done=()=>{ch.destroy();wear.destroy();keep.destroy();if(final)this.toMap();};}});}
 win(){if(this.done)return;this.done=true;this.spawnTimer.remove();const st=this.mistakes<=2?3:this.mistakes<=5?2:1;const sd=Save.data;
  sd.stagesStars[this.stage.n]=Math.max(sd.stagesStars[this.stage.n]||0,st);sd.gems+=5*st;Save.write();Sound.fanfare();Sound.say('過關了！你好棒！');
  const o=this.add.container(0,0).setDepth(80);o.add(this.add.rectangle(W/2,H/2,W,H,0xffffff,0.6));
  o.add(this.add.text(W/2,200,'🎉 '+'⭐'.repeat(st)+' 🎉',{fontSize:'80px'}).setOrigin(0.5));stars(this,W/2,200,40);
  this.time.delayedCall(1200,()=>this.dropTreasure(true));}
 toMap(){this.scene.start('Map');}}
