const W=1024,H=768,FONT='"PingFang TC","Noto Sans CJK TC","Heiti TC",sans-serif';
const TREASURES=['crown','flower_crown','bow','necklace','wings','cat','unicorn','star_cape'];
function btn(sc,x,y,w,h,label,color,cb,fs){const c=sc.add.container(x,y);const g=sc.add.graphics();
 g.fillStyle(0x000000,0.15).fillRoundedRect(-w/2+3,-h/2+5,w,h,Math.min(22,h/2));g.fillStyle(color||0xff9ec4).fillRoundedRect(-w/2,-h/2,w,h,Math.min(22,h/2));
 g.lineStyle(3,0xffffff,0.9).strokeRoundedRect(-w/2,-h/2,w,h,Math.min(22,h/2));
 const t=sc.add.text(0,0,label,{fontFamily:FONT,fontSize:(fs||28)+'px',color:'#5a2d6e',align:'center'}).setOrigin(0.5);c.add([g,t]);
 c.setSize(w,h).setInteractive({useHandCursor:true});c.on('pointerdown',()=>{Sound.pop();sc.tweens.add({targets:c,scale:0.92,duration:60,yoyo:true});cb&&cb();});c.label=t;c.bg=g;return c;}
function sky(sc,top,bot){const g=sc.add.graphics();g.fillGradientStyle(top,top,bot,bot,1);g.fillRect(0,0,W,H);return g;}
function floatText(sc,x,y,txt,col){const t=sc.add.text(x,y,txt,{fontFamily:FONT,fontSize:'34px',color:col||'#ffffff',stroke:'#7a3d9a',strokeThickness:6}).setOrigin(0.5).setDepth(50);
 sc.tweens.add({targets:t,y:y-70,alpha:0,duration:900,ease:'Cubic.easeOut',onComplete:()=>t.destroy()});}
function stars(sc,x,y,n){if(!sc.textures.exists('spark')){const g=sc.make.graphics({x:0,y:0,add:false});g.fillStyle(0xffffff).fillCircle(8,8,8);g.generateTexture('spark',16,16);g.destroy();}
 const p=sc.add.particles(x,y,'spark',{speed:{min:120,max:320},scale:{start:0.9,end:0},lifespan:600,tint:[0xfff176,0xff9ec4,0xb39ddb,0x80deea],quantity:n||14,emitting:false}).setDepth(40);
 p.explode(n||14);sc.time.delayedCall(800,()=>p.destroy());}
// session timer + rest reminder (~15 min)
const Session={start:Date.now(),reminded:false};
function checkRest(sc){if(Session.reminded||Date.now()-Session.start<15*60e3)return;Session.reminded=true;
 const o=sc.add.container(0,0).setDepth(200);const bg=sc.add.rectangle(W/2,H/2,W,H,0x2b1f45,0.75).setInteractive();
 const card=sc.add.graphics();card.fillStyle(0xfff6fb).fillRoundedRect(W/2-260,H/2-170,520,340,30);
 const t=sc.add.text(W/2,H/2-60,'🧸💤  ⏰',{fontSize:'80px'}).setOrigin(0.5);
 const t2=sc.add.text(W/2,H/2+30,'ㄒㄧㄡ ㄒㄧˋ ㄧˊ ㄒㄧㄚˋ',{fontFamily:FONT,fontSize:'34px',color:'#7a3d9a'}).setOrigin(0.5);
 o.add([bg,card,t,t2]);Sound.say('玩了好久囉，休息一下，看看遠方吧！');
 o.add(btn(sc,W/2,H/2+110,200,64,'👌',0xb9f6ca,()=>o.destroy(),36));}

class Boot extends Phaser.Scene{constructor(){super('Boot');}
 preload(){this.load.json('vocab','data/vocab.json');this.load.json('manifest','data/character_manifest.json');
  const t=this.add.text(W/2,H/2,'🏰 …',{fontSize:'48px'}).setOrigin(0.5);this.load.on('progress',p=>t.setText('🏰 '+Math.round(p*100)+'%'));}
 create(){Char.m=this.cache.json.get('manifest');Learn.init(this.cache.json.get('vocab'));Save.load();
  const m=Char.m;m.hairStyles.forEach(h=>this.load.image('th_'+h.id,h.thumb));m.outfits.forEach(o=>this.load.image('th_'+o.id,'assets/layers/thumb_'+o.id+'.png'));
  m.jobs.forEach(j=>this.load.image('job_'+j.id,j.sample));this.load.once('complete',()=>this.scene.start('Start'));this.load.start();}}

class Start extends Phaser.Scene{constructor(){super('Start');}
 create(){sky(this,0xbfa7f0,0xffd6ea);
  for(let i=0;i<30;i++){const s=this.add.text(Phaser.Math.Between(0,W),Phaser.Math.Between(0,H),'✦',{fontSize:Phaser.Math.Between(14,30)+'px',color:'#ffffff'}).setAlpha(0.7);this.tweens.add({targets:s,alpha:0.1,duration:Phaser.Math.Between(800,2000),yoyo:true,repeat:-1});}
  this.add.text(W/2,150,'👑 🏰 🐉',{fontSize:'90px'}).setOrigin(0.5);
  this.add.text(W/2,265,'ㄍㄨㄥ ㄓㄨˇ ㄇㄠˋ ㄒㄧㄢˇ',{fontFamily:FONT,fontSize:'44px',color:'#6a2c91',stroke:'#fff',strokeThickness:8}).setOrigin(0.5);
  const b=btn(this,W/2,420,360,140,'▶',0xff9ec4,()=>{Sound.unlock();Sound.chime(0);
   setTimeout(()=>Sound.say('歡迎來到公主冒險！'),150);Save.data.sessions++;Save.write();
   this.scene.start(Save.data.character?'Map':'Creator');},90);
  this.tweens.add({targets:b,scale:1.06,duration:700,yoyo:true,repeat:-1});
  const h=this.add.container(W/2,610);const hg=this.add.graphics();hg.fillStyle(0xffffff,0.85).fillRoundedRect(-330,-60,660,120,24);
  h.add([hg,this.add.text(-280,0,'📱🔕➡🔔',{fontSize:'44px'}).setOrigin(0,0.5),
   this.add.text(40,-18,'iPad 靜音開關請關閉',{fontFamily:FONT,fontSize:'24px',color:'#6a2c91'}).setOrigin(0,0.5),
   this.add.text(40,20,'（家長：才聽得到語音）',{fontFamily:FONT,fontSize:'20px',color:'#9a6ab8'}).setOrigin(0,0.5)]);
  this.add.text(W-16,H-12,'v1 placeholder art',{fontSize:'14px',color:'#7a5a9a'}).setOrigin(1,1);}}

class Creator extends Phaser.Scene{constructor(){super('Creator');}
 init(d){this.fromMap=d&&d.fromMap;const c=Save.data.character||{job:'warrior',hair:'A1',hairColor:'brown',outfit:'B1'};this.sel=Object.assign({},c);this.tab='job';}
 create(){sky(this,0xe6d8ff,0xffe4f1);this.add.rectangle(270,384,440,700,0xffffff,0.55).setStrokeStyle(4,0xffffff);
  this.add.ellipse(270,690,260,40,0xc8b4f0,0.6);
  const tabs=[['job','⚔🏹🪄'],['hair','💇'],['color','🎨'],['outfit','👗']];
  tabs.forEach(([k,l],i)=>{const b=btn(this,560+i*120,60,110,74,l,k===this.tab?0xffc1dc:0xf3e9ff,()=>{this.tab=k;this.refresh();},30);b.tabKey=k;});
  this.panel=this.add.container(0,0);
  btn(this,880,700,230,84,'✔ ▶',0xb9f6ca,()=>{Save.data.character=this.sel;Save.write();Sound.chime(4);Sound.say('好漂亮！出發囉！');this.scene.start(this.fromMap?'Map':'Map');},38);
  this.refresh();}
 refresh(){this.children.list.filter(o=>o.tabKey).forEach(b=>{b.bg.clear();const on=b.tabKey===this.tab;b.bg.fillStyle(on?0xffc1dc:0xf3e9ff).fillRoundedRect(-55,-37,110,74,22).lineStyle(3,0xffffff).strokeRoundedRect(-55,-37,110,74,22);});
  Char.ensure(this,this.sel,()=>{if(this.charC)this.charC.destroy();this.charC=Char.build(this,270,700,640,this.sel,Save.data.equipped);});
  this.panel.removeAll(true);const m=Char.m,p=this.panel;
  const sayLbl=(s)=>Sound.say(s);
  if(this.tab==='job'){m.jobs.forEach((j,i)=>{const x=600+i*150,y=330;const on=this.sel.job===j.id;
    const fr=this.add.rectangle(x,y,140,300,on?0xffc1dc:0xffffff,0.9).setStrokeStyle(on?6:2,on?0xff6fae:0xd9c8f5).setInteractive();
    const im=this.add.image(x,y-20,'job_'+j.id).setDisplaySize(130,143*1.8);const ic=this.add.text(x,y+120,{warrior:'⚔️',archer:'🏹',magician:'🪄'}[j.id],{fontSize:'44px'}).setOrigin(0.5);
    fr.on('pointerdown',()=>{this.sel.job=j.id;sayLbl(j.label);this.refresh();});p.add([fr,im,ic]);});}
  if(this.tab==='hair'){m.hairStyles.forEach((h,i)=>{const x=600+(i%3)*150,y=230+Math.floor(i/3)*210;const on=this.sel.hair===h.id;
    const fr=this.add.rectangle(x,y,140,190,on?0xffc1dc:0xffffff,0.9).setStrokeStyle(on?6:2,on?0xff6fae:0xd9c8f5).setInteractive();
    p.add([fr,this.add.image(x,y,'th_'+h.id).setDisplaySize(130,143)]);fr.on('pointerdown',()=>{this.sel.hair=h.id;sayLbl(h.label);this.refresh();});});}
  if(this.tab==='color'){m.hairColors.forEach((c,i)=>{const x=580+(i%3)*150,y=260+Math.floor(i/3)*170;const on=this.sel.hairColor===c.id;
    const cc=this.add.circle(x,y,58,Phaser.Display.Color.HexStringToColor(c.hex).color).setStrokeStyle(on?10:4,on?0xff6fae:0xffffff).setInteractive();
    cc.on('pointerdown',()=>{this.sel.hairColor=c.id;this.refresh();});p.add(cc);if(on)p.add(this.add.text(x,y,'✔',{fontSize:'48px',color:'#fff'}).setOrigin(0.5));});}
  if(this.tab==='outfit'){m.outfits.forEach((o,i)=>{const x=560+(i%4)*112,y=190+Math.floor(i/4)*175;const on=this.sel.outfit===o.id;
    const fr=this.add.rectangle(x,y,104,160,on?0xffc1dc:0xffffff,0.9).setStrokeStyle(on?6:2,on?0xff6fae:0xd9c8f5).setInteractive();
    p.add([fr,this.add.image(x,y,'th_'+o.id).setDisplaySize(100,110*1.4)]);fr.on('pointerdown',()=>{this.sel.outfit=o.id;sayLbl(o.label.split('・')[1]||o.label);this.refresh();});});}}}

// ---------- Forest map: tap-to-walk, chests, animal NPCs, 5 stage flags ----------
const STAGES=[{n:1,lessons:[1,2],x:170,y:560},{n:2,lessons:[3,4],x:330,y:400},{n:3,lessons:[5,6],x:520,y:520},{n:4,lessons:[7,8],x:700,y:350},{n:5,lessons:[9,1,2,3,4,5,6,7,8],x:880,y:470,boss:true}];
class MapScene extends Phaser.Scene{constructor(){super('Map');}
 create(){sky(this,0x9be7c4,0xd7f5b5);const g=this.add.graphics();
  g.fillStyle(0xbfe8a0).fillEllipse(512,560,1200,500);g.lineStyle(46,0xf4e1b5).beginPath();g.moveTo(60,640);STAGES.forEach(s=>g.lineTo(s.x,s.y));g.strokePath();
  g.lineStyle(6,0xffffff,0.5).beginPath();g.moveTo(60,640);STAGES.forEach(s=>g.lineTo(s.x,s.y));g.strokePath();
  [[60,220],[230,250],[450,260],[620,180],[960,250],[90,420],[420,690],[640,700],[980,640],[780,610],[260,690]].forEach(([x,y],i)=>this.add.text(x,y,i%3?'🌳':'🌲',{fontSize:(60+(i%3)*14)+'px'}).setOrigin(0.5,1));
  ['🍄','🌼','🌷','🌸','🍄'].forEach((e,i)=>this.add.text(120+i*190,300+((i*97)%220),e,{fontSize:'30px'}).setOrigin(0.5));
  this.add.text(960,330,'🏰',{fontSize:'90px'}).setOrigin(0.5,1);
  this.add.text(W/2,30,'🌲 ㄙㄣ ㄌㄧㄣˊ 🌲',{fontFamily:FONT,fontSize:'34px',color:'#2e6b3f',stroke:'#fff',strokeThickness:6}).setOrigin(0.5,0);
  const sd=Save.data;this.nodes=[];
  STAGES.forEach((s,i)=>{const unlocked=i===0||sd.stagesStars[i];const c=this.add.container(s.x,s.y);
   const base=this.add.circle(0,0,44,unlocked?(s.boss?0xd1a6ff:0xff9ec4):0xcccccc).setStrokeStyle(6,0xffffff);
   const t=this.add.text(0,-2,unlocked?(s.boss?'🐉':String(s.n)):'🔒',{fontFamily:FONT,fontSize:'40px',color:'#fff',stroke:'#7a3d9a',strokeThickness:6}).setOrigin(0.5);
   const st=sd.stagesStars[i+1]||0;const sr=this.add.text(0,52,'⭐'.repeat(st)+'☆'.repeat(3-st),{fontSize:'20px'}).setOrigin(0.5);
   c.add([base,t,sr]);if(unlocked)this.tweens.add({targets:base,scale:1.08,duration:600,yoyo:true,repeat:-1});this.nodes.push({s,c,unlocked});});
  // chests (one per day each)
  const day=new Date().toDateString();this.chests=[];[[250,520],[600,430],[820,560]].forEach(([x,y],i)=>{const opened=sd.lastChestDay['c'+i]===day;
   const t=this.add.text(x,y,opened?'📭':'🎁',{fontSize:'46px'}).setOrigin(0.5);this.chests.push({x,y,t,i,opened});
   if(!opened)this.tweens.add({targets:t,angle:{from:-8,to:8},duration:400,yoyo:true,repeat:-1});});
  this.npcs=[{e:'🐰',x:120,y:470,say:'公主好！答對題目可以拿到寶物喔！'},{e:'🦊',x:430,y:330,say:'黑龍住在城堡旁邊，要小心喔！'},{e:'🐿️',x:760,y:470,say:'一聲平平的，二聲往上爬，三聲彎下去再上來！'},{e:'🦌',x:560,y:640,say:'記得休息一下喔！'}]
   .map(n=>{const t=this.add.text(n.x,n.y,n.e,{fontSize:'52px'}).setOrigin(0.5);this.tweens.add({targets:t,y:n.y-8,duration:700+Math.random()*400,yoyo:true,repeat:-1});return Object.assign(n,{t});});
  // HUD
  this.add.text(20,20,'⭐ '+sd.stars+'   💎 '+sd.gems,{fontFamily:FONT,fontSize:'30px',color:'#fff',stroke:'#7a3d9a',strokeThickness:6});
  btn(this,W-60,60,90,80,'🏠',0xffe0f0,()=>this.scene.start('Home'),40);btn(this,W-160,60,90,80,'👗',0xffe0f0,()=>this.scene.start('Creator',{fromMap:true}),40);
  btn(this,W-260,60,90,80,'📖',0xffe0f0,()=>this.scene.start('Book'),40);btn(this,W-60,H-50,90,70,'👨‍👧',0xe8e0ff,()=>this.scene.start('Report'),32);
  const p=sd.mapPos||{x:80,y:620};Char.ensure(this,sd.character,()=>{this.hero=Char.build(this,p.x,p.y,170,sd.character,sd.equipped);this.hero.setDepth(10);});
  this.input.on('pointerdown',(ptr,objs)=>{if(objs.length||!this.hero)return;this.walkTo(ptr.worldX,ptr.worldY);});
  this.nodes.forEach(n=>{n.c.setSize(100,100).setInteractive();n.c.on('pointerdown',()=>{if(!n.unlocked){Sound.soft();return;}this.walkTo(n.s.x,n.s.y+30,()=>this.enter(n.s));});});
  this.chests.forEach(c=>{c.t.setInteractive();c.t.on('pointerdown',()=>this.walkTo(c.x,c.y+30,()=>this.openChest(c)));});
  this.npcs.forEach(n=>{n.t.setInteractive();n.t.on('pointerdown',()=>this.walkTo(n.x+40,n.y+30,()=>{Sound.say(n.say);floatText(this,n.x,n.y-40,'💬');}));});
  this.time.addEvent({delay:20000,loop:true,callback:()=>checkRest(this)});checkRest(this);}
 walkTo(x,y,cb){y=Phaser.Math.Clamp(y,300,740);x=Phaser.Math.Clamp(x,40,W-40);const h=this.hero;if(!h)return;this.tweens.killTweensOf(h);
  const d=Phaser.Math.Distance.Between(h.x,h.y,x,y);h.scaleX=Math.abs(h.scaleX)*(x<h.x?-1:1);
  this.tweens.add({targets:h,x,y,duration:Math.max(150,d*3.2),onUpdate:()=>{h.angle=Math.sin(this.time.now/60)*4;},onComplete:()=>{h.angle=0;Save.data.mapPos={x,y};cb&&cb();}});}
 openChest(c){if(c.opened){Sound.soft();return;}c.opened=true;Save.data.lastChestDay['c'+c.i]=new Date().toDateString();c.t.setText('📭');this.tweens.killTweensOf(c.t);c.t.angle=0;
  const gems=5;Save.data.gems+=gems;stars(this,c.x,c.y,18);Sound.fanfare();floatText(this,c.x,c.y-30,'💎+'+gems,'#b3e5fc');Save.write();}
 enter(s){Save.write();this.scene.start('Battle',{stage:s});}}

// ---------- 小公主的家: equip treasures + decorate ----------
const HOME_SPOTS=[[150,330],[300,300],[700,300],[860,330],[200,560],[420,600],[620,600],[840,560]];
class Home extends Phaser.Scene{constructor(){super('Home');}
 create(){const g=this.add.graphics();g.fillGradientStyle(0xffe3f1,0xffe3f1,0xf5d9ff,0xf5d9ff,1).fillRect(0,0,W,H*0.62);
  g.fillStyle(0xf3c9a5).fillRect(0,H*0.62,W,H*0.38);for(let i=0;i<10;i++)g.fillStyle(i%2?0xf0bf97:0xf6d3b4).fillRect(i*W/10,H*0.62,W/10,H*0.38);
  g.fillStyle(0xffffff,0.8).fillRoundedRect(420,90,190,150,20);g.fillStyle(0xbfe6ff).fillRoundedRect(432,102,166,126,14);
  this.add.text(515,165,'☁️🌈',{fontSize:'40px'}).setOrigin(0.5);this.add.text(W/2,30,'🏠 ㄒㄧㄠˇ ㄍㄨㄥ ㄓㄨˇ ˙ㄉㄜ ㄐㄧㄚ',{fontFamily:FONT,fontSize:'30px',color:'#8a3d9a',stroke:'#fff',strokeThickness:6}).setOrigin(0.5,0);
  this.add.text(100,500,'🛏️',{fontSize:'120px'}).setOrigin(0.5);this.add.text(930,470,'🪞',{fontSize:'90px'}).setOrigin(0.5);
  const sd=Save.data;this.decor=[];
  sd.home.forEach((h,i)=>this.placeDecor(h,i));
  Char.ensure(this,sd.character,()=>{this.drawHero();});
  // inventory bar
  this.bar=this.add.container(0,0);this.drawBar();btn(this,60,60,90,80,'🗺️',0xffe0f0,()=>{Save.write();this.scene.start('Map');},40);}
 drawHero(){if(this.hero)this.hero.destroy();this.hero=Char.build(this,W/2,560,330,Save.data.character,Save.data.equipped);}
 placeDecor(h,i){const e=Char.m.equipment.find(q=>q.id===h.id);const t=this.add.text(h.x,h.y,e.emoji,{fontSize:'64px'}).setOrigin(0.5).setInteractive({draggable:true});
  this.input.setDraggable(t);t.on('drag',(p,x,y)=>{t.x=x;t.y=y;h.x=Math.round(x);h.y=Math.round(y);});t.on('dragend',()=>Save.write());this.decor.push(t);}
 drawBar(){this.bar.removeAll(true);const sd=Save.data;const bg=this.add.graphics();bg.fillStyle(0xffffff,0.85).fillRoundedRect(20,H-150,W-40,135,24);this.bar.add(bg);
  if(!sd.inventory.length)this.bar.add(this.add.text(W/2,H-82,'🎁 ➡ ⚔️ 🐉',{fontSize:'48px'}).setOrigin(0.5).setAlpha(0.5));
  sd.inventory.forEach((id,i)=>{const e=Char.m.equipment.find(q=>q.id===id);const x=90+i*115,y=H-100;const worn=sd.equipped.includes(id);
   const it=this.add.text(x,y,e.emoji,{fontSize:'52px'}).setOrigin(0.5);if(worn)this.bar.add(this.add.circle(x,y,40,0xffc1dc));
   const b1=btn(this,x-26,y+55,48,36,'👚',worn?0xff9ec4:0xf3e9ff,()=>this.toggleWear(id),20);
   const b2=btn(this,x+26,y+55,48,36,'🏠',0xf3e9ff,()=>this.toggleDecor(id),20);this.bar.add([it,b1,b2]);});}
 toggleWear(id){const sd=Save.data,e=Char.m.equipment.find(q=>q.id===id);
  if(sd.equipped.includes(id))sd.equipped=sd.equipped.filter(x=>x!==id);else{sd.equipped=sd.equipped.filter(x=>Char.m.equipment.find(q=>q.id===x).slot!==e.slot);sd.equipped.push(id);Sound.chime(3);}
  Save.write();this.drawHero();this.drawBar();}
 toggleDecor(id){const sd=Save.data;const k=sd.home.findIndex(h=>h.id===id);if(k>=0){sd.home.splice(k,1);}else{const s=HOME_SPOTS[sd.home.length%HOME_SPOTS.length];sd.home.push({id,x:s[0],y:s[1]});Sound.chime(2);}
  Save.write();this.decor.forEach(d=>d.destroy());this.decor=[];sd.home.forEach((h,i)=>this.placeDecor(h,i));}}

// ---------- Collection book ----------
const MONSTERS=[{id:'slime',e:'🟣'},{id:'mush',e:'🍄'},{id:'bat',e:'🦇'},{id:'ghost',e:'👻'},{id:'dragon',e:'🐉'}];
class Book extends Phaser.Scene{constructor(){super('Book');}
 create(){sky(this,0xfff3d6,0xffe0ec);this.add.text(W/2,30,'📖',{fontSize:'56px'}).setOrigin(0.5,0);const sd=Save.data;
  Char.m.equipment.forEach((e,i)=>{const x=140+(i%4)*240,y=180+Math.floor(i/4)*150;const has=sd.inventory.includes(e.id);
   this.add.circle(x,y,58,0xffffff).setStrokeStyle(4,has?0xff9ec4:0xdddddd);this.add.text(x,y,has?e.emoji:'❔',{fontSize:'60px'}).setOrigin(0.5).setAlpha(has?1:0.35);});
  MONSTERS.forEach((m,i)=>{const x=140+i*185,y=520;const has=sd.seenMonsters.includes(m.id);this.add.circle(x,y,58,0xe8ffe8).setStrokeStyle(4,has?0x81c784:0xdddddd);
   this.add.text(x,y,has?m.e:'❔',{fontSize:'60px'}).setOrigin(0.5).setAlpha(has?1:0.35);});
  this.add.text(W/2,660,'⭐ '+sd.stars+'   💎 '+sd.gems,{fontFamily:FONT,fontSize:'36px',color:'#8a3d9a'}).setOrigin(0.5);
  btn(this,60,60,90,80,'🗺️',0xffe0f0,()=>this.scene.start('Map'),40);}}

// ---------- Parent report ----------
class Report extends Phaser.Scene{constructor(){super('Report');}
 create(){this.cameras.main.setBackgroundColor('#fbf7ff');const sd=Save.data,T=sd.toneStats;
  this.add.text(W/2,24,'家長報表：聲調辨識',{fontFamily:FONT,fontSize:'32px',color:'#5a2d6e'}).setOrigin(0.5,0);
  const names={1:'一聲',2:'二聲',3:'三聲',4:'四聲'};let y=90;
  this.add.text(60,y,'正確聲調 → 她選的聲調（次數）',{fontFamily:FONT,fontSize:'22px',color:'#7a5a9a'});y+=40;
  for(let e=1;e<=4;e++){const row=[1,2,3,4].map(c=>T[e+'>'+c]||0);const tot=row.reduce((a,b)=>a+b,0);const ok=row[e-1];
   const pct=tot?Math.round(ok/tot*100):0;const wrongs=[1,2,3,4].filter(c=>c!==e&&row[c-1]).map(c=>names[c]+'×'+row[c-1]).join('、')||'—';
   this.add.text(60,y,`${names[e]}：答對 ${ok}/${tot}（${tot?pct+'%':'尚無資料'}）  誤選：${wrongs}`,{fontFamily:FONT,fontSize:'22px',color:pct<70&&tot?'#c2185b':'#333'});
   const bw=300;this.add.rectangle(680,y+14,bw,18,0xeeeeee).setOrigin(0,0.5);this.add.rectangle(680,y+14,bw*pct/100,18,pct<70?0xff8a80:0x81c784).setOrigin(0,0.5);y+=44;}
  y+=10;const L=sd.leitner;const missed=Learn.items.filter(it=>L[it.id]&&L[it.id].wrong>0).sort((a,b)=>L[b.id].wrong-L[a.id].wrong).slice(0,8);
  this.add.text(60,y,'最常錯的字詞：'+(missed.map(it=>`${it.word.word}（${it.word.zhuyin[it.syl]}${TONE_SHOW[it.tone]||'ˉ'}）錯${L[it.id].wrong}`).join('、')||'—'),{fontFamily:FONT,fontSize:'20px',color:'#333',wordWrap:{width:900}});y+=80;
  const boxes=[1,2,3,4,5].map(b=>Learn.items.filter(it=>L[it.id]&&L[it.id].box===b).length);
  this.add.text(60,y,'間隔複習盒（1=需要多練 → 5=很熟）：'+boxes.map((n,i)=>`盒${i+1}:${n}`).join('  ')+`  未學:${Learn.items.length-boxes.reduce((a,b)=>a+b,0)}`,{fontFamily:FONT,fontSize:'20px',color:'#333'});y+=40;
  this.add.text(60,y,`累計遊玩次數：${sd.sessions}　累計時間：${Math.round(sd.playMs/60000)} 分鐘`,{fontFamily:FONT,fontSize:'20px',color:'#333'});
  btn(this,200,650,280,70,'匯出存檔碼',0xe8e0ff,()=>{const c=Save.exportCode();try{navigator.clipboard&&navigator.clipboard.writeText(c);}catch(e){}window.prompt('存檔碼（已嘗試複製）：',c);},24);
  btn(this,512,650,280,70,'匯入存檔碼',0xe8e0ff,()=>{const c=window.prompt('貼上存檔碼：');if(!c)return;try{Save.importCode(c);alert('已還原');this.scene.restart();}catch(e){alert('存檔碼無效');}},24);
  btn(this,824,650,280,70,'回地圖',0xffe0f0,()=>this.scene.start('Map'),24);}}
