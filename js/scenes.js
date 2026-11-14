const W=1024,H=768,FONT='"PingFang TC","Noto Sans CJK TC","Heiti TC",sans-serif';
const TREASURES=['crown','flower_crown','bow','necklace','wings','cat','unicorn','star_cape'];
function btn(sc,x,y,w,h,label,color,cb,fs){Sound.wireScene(sc);const c=sc.add.container(x,y);const g=sc.add.graphics();
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
 preload(){this.load.json('audioUI','data/ui_audio_v002.json');this.load.json('vocab','data/vocab.json');this.load.json('questionPictures','data/question_pictures_b12.json');this.load.json('questionWordIds','data/question_word_ids_b12.json');this.load.json('questionAssets','data/question_assets_b12.json');this.load.json('manifest','data/character_runtime_v8.json');this.load.json('assetsManifest','data/assets_manifest.json');this.load.json('audioWords','data/audio_words.json');this.load.json('tdUI','data/ui_td_v003.json');
  const t=this.add.text(W/2,H/2,'🏰 …',{fontSize:'48px'}).setOrigin(0.5);this.load.on('progress',p=>t.setText('🏰 '+Math.round(p*100)+'%'));}
 create(){Learn.init(this.cache.json.get('vocab'),this.cache.json.get('questionPictures'));
  Char.init(this.cache.json.get('manifest')).then(async()=>{QuestionArt.init(this.cache.json.get('questionWordIds'),this.cache.json.get('questionAssets'));await QuestionArt.loadAll(this);TdUI.init(this.cache.json.get('tdUI'));await TdUI.loadAll(this);Save.load();const m=Char.m;
   Art.init(this.cache.json.get('assetsManifest'));Sound.queueUI(this,this.cache.json.get('audioUI'));Sound.initWords(this.cache.json.get('audioWords'));Art.queue(this);
   this.load.once('complete',()=>this.scene.start('Start'));this.load.start();});}}


class Start extends Phaser.Scene{constructor(){super('Start');}
 create(){sky(this,0xbfa7f0,0xffd6ea);
  if(this.textures.exists('audio_ui_start_bg'))this.add.image(0,0,'audio_ui_start_bg').setOrigin(0).setDisplaySize(W,H);
  if(this.textures.exists('audio_ui_start_princess'))this.add.image(250,748,'audio_ui_start_princess').setOrigin(.5,1).setDisplaySize(620*1000/1100,620);
  if(this.textures.exists('audio_ui_title'))this.add.image(512,108,'audio_ui_title').setDisplaySize(760,200);else this.add.text(512,108,'楷芯公主冒險',{fontFamily:FONT,fontSize:'44px',color:'#6a2c91'}).setOrigin(.5);
  Sound.titleButton(this);
  this.add.text(670,601,'點一下，開啟音樂與題目語音',{fontFamily:FONT,fontSize:'20px',color:'#6a2c91',backgroundColor:'#fff8fccc'}).setOrigin(.5);
  const h=this.add.container(670,663),hg=this.add.graphics();hg.fillStyle(0xffffff,.88).fillRoundedRect(-280,-45,560,90,24);
  h.add([hg,this.add.text(-245,0,'📱🔕➡🔔',{fontSize:'32px'}).setOrigin(0,.5),this.add.text(-50,-14,'iPad 請關靜音、提高音量',{fontFamily:FONT,fontSize:'21px',color:'#6a2c91'}).setOrigin(0,.5),this.add.text(-50,18,'也請檢查藍牙耳機',{fontFamily:FONT,fontSize:'18px',color:'#9a6ab8'}).setOrigin(0,.5)]);
  this.add.text(W-16,H-12,'v '+Build.id+'・Lily v8（副本）',{fontSize:'14px',color:'#7a5a9a'}).setOrigin(1,1);
  const cr=this.add.text(16,H-12,'ⓘ 版權與音檔來源',{fontFamily:FONT,fontSize:'16px',color:'#7a5a9a',padding:{x:6,y:6}}).setOrigin(0,1).setInteractive();cr.on('pointerdown',()=>this.scene.start('Credits',{from:'Start'}));}}

class Creator extends Phaser.Scene{constructor(){super('Creator');}
 init(d){this.fromMap=d&&d.fromMap;const c=Save.data.character||{job:'warrior',hair:'A1',hairColor:'brown',outfit:'B1'};this.sel=Char.normalize(c);this.tab='job';this.previewEquipped=[...Save.data.equipped];this.rejected=null;this.refreshToken=(this.refreshToken||0)+1;}
 create(){sky(this,0xe6d8ff,0xffe4f1);this.add.rectangle(270,384,440,700,0xffffff,0.55).setStrokeStyle(4,0xffffff);
  this.add.ellipse(270,690,260,40,0xc8b4f0,0.6);
  const tabs=[['job','⚔'],['hair','💇'],['color','🎨'],['outfit','👗'],['hat','🎩'],['weapon','🗡️'],['accessory','🎀'],['back','🦋']];
  tabs.forEach(([k,l],i)=>{const b=btn(this,526+i*63,60,58,74,l,k===this.tab?0xffc1dc:0xf3e9ff,()=>{this.tab=k;this.rejected=null;this.refresh();},30);b.tabKey=k;});
  this.panel=this.add.container(0,0);
  btn(this,880,700,230,84,'✔ ▶',0xb9f6ca,()=>{if(Char.selectionIssues(this.sel,this.previewEquipped).length){this.refresh();return;}Save.data.character=Char.normalize(this.sel);Save.data.equipped=this.previewEquipped.filter(id=>!Char.v3.headwear[id]||id===Char.headwear(this.sel,this.previewEquipped));Save.write();Sound.chime(4);Sound.say('好漂亮！出發囉！');this.scene.start(this.fromMap?'Map':'Map');},38);
  this.refresh();}
 refresh(){this.children.list.filter(o=>o.tabKey).forEach(b=>{b.bg.clear();const on=b.tabKey===this.tab;b.bg.fillStyle(on?0xffc1dc:0xf3e9ff).fillRoundedRect(-29,-37,58,74,22).lineStyle(3,0xffffff).strokeRoundedRect(-29,-37,58,74,22);});
  const token=++this.refreshToken,selection=Char.normalize(this.sel);Char.ensure(this,selection,()=>{if(token!==this.refreshToken)return;if(this.charC)this.charC.destroy();this.charC=Char.build(this,270,690,600,selection,this.previewEquipped);},this.previewEquipped);
  this.panel.removeAll(true);const m=Char.m,p=this.panel;this.issues=Char.selectionIssues(this.sel,this.previewEquipped);const notice=this.rejected||this.issues[0];if(notice)p.add(this.add.text(740,615,notice,{fontFamily:FONT,fontSize:'16px',color:'#c2185b',wordWrap:{width:430,useAdvancedWrap:true},align:'center'}).setOrigin(0.5));
  const sayLbl=(s)=>Sound.say(s);
  const hat=Char.headwear(this.sel,this.previewEquipped),hairKey=h=>'th4_'+h+'_'+this.sel.hairColor+'_'+hat;const items=this.tab==='hair'?m.hairStyles.map(h=>({key:hairKey(h.id),meta:Char.thumb('hair',h.id,this.sel.hairColor,128,hat)})):this.tab==='color'?m.hairColors.map(c=>({key:'th3_color_'+c.id,meta:Char.thumb('color',c.id)})):this.tab==='outfit'?m.outfits.map(o=>({key:'th3_'+o.id,meta:Char.thumb('outfit',o.id)})):this.tab==='job'?['B3','B5','B7'].map(id=>({key:'th3_'+id,meta:Char.thumb('outfit',id)})):['accessory','back'].includes(this.tab)?(this.tab==='back'?['wings','star_cape']:['necklace','bow']).map(id=>({key:'th5_'+id+'_'+this.sel.outfit+'_'+this.sel.hair+'_'+hat,meta:Char.wearableThumb(id,this.sel,this.previewEquipped)})):[];
  this.menuThumbs=[];Char.ensureThumbs(this,items,()=>{if(token!==this.refreshToken||!this.sys.isActive())return;for(const it of items){const im=this.menuThumbs&&this.menuThumbs.find(x=>x.key===it.key);if(im&&im.obj.scene&&this.textures.exists(it.key)){im.obj.setTexture(it.key).setVisible(true).setDisplaySize(im.size,im.size);}}});
  const thumb=(x,y,key,size)=>{const im=this.add.image(x,y,this.textures.exists(key)?key:'__WHITE').setDisplaySize(size,size).setVisible(this.textures.exists(key));this.menuThumbs.push({key,obj:im,size});return im;};
  if(this.tab==='job'){m.jobs.forEach((j,i)=>{const x=600+i*150,y=330;const on=this.sel.job===j.id;
    const fr=this.add.rectangle(x,y,140,300,on?0xffc1dc:0xffffff,0.9).setStrokeStyle(on?6:2,on?0xff6fae:0xd9c8f5).setInteractive();
    const im=thumb(x,y-20,'th3_'+['B3','B5','B7'][i],130);const ic=this.add.text(x,y+120,{warrior:'⚔️',archer:'🏹',magician:'🪄'}[j.id],{fontSize:'44px'}).setOrigin(0.5);
    fr.on('pointerdown',()=>{this.sel.job=j.id;sayLbl(j.label);this.refresh();});p.add([fr,im,ic]);});}
  if(this.tab==='hair'){m.hairStyles.forEach((h,i)=>{const x=600+(i%3)*150,y=230+Math.floor(i/3)*210;const on=this.sel.hair===h.id;
    const fr=this.add.rectangle(x,y,140,190,on?0xffc1dc:0xffffff,0.9).setStrokeStyle(on?6:2,on?0xff6fae:0xd9c8f5).setInteractive();
    p.add([fr,thumb(x,y,hairKey(h.id),130)]);fr.on('pointerdown',()=>{this.sel.hair=h.id;sayLbl(h.label);this.refresh();});});}
  if(this.tab==='color'){m.hairColors.forEach((c,i)=>{const x=580+(i%3)*150,y=260+Math.floor(i/3)*170;const on=this.sel.hairColor===c.id;
    const cc=this.add.circle(x,y,58,Phaser.Display.Color.HexStringToColor(c.hex).color).setStrokeStyle(on?10:4,on?0xff6fae:0xffffff).setInteractive();
    cc.on('pointerdown',()=>{this.sel.hairColor=c.id;this.refresh();});p.add([cc,thumb(x,y,'th3_color_'+c.id,96)]);if(on)p.add(this.add.text(x,y,'✔',{fontSize:'48px',color:'#fff'}).setOrigin(0.5));});}
  if(this.tab==='outfit'){m.outfits.forEach((o,i)=>{const x=560+(i%4)*112,y=190+Math.floor(i/4)*175;const on=this.sel.outfit===o.id,blocked=this.previewEquipped.some(id=>Char.wearableIssues(id,{...this.sel,outfit:o.id},this.previewEquipped).length);
    const fr=this.add.rectangle(x,y,104,160,blocked?0xded7e5:on?0xffc1dc:0xffffff,0.9).setStrokeStyle(on?6:2,on?0xff6fae:0xd9c8f5).setInteractive();
    p.add([fr,thumb(x,y,'th3_'+o.id,100)]);if(blocked)p.add(this.add.text(x,y+60,'裝備互斥',{fontFamily:FONT,fontSize:'16px',color:'#a14266',backgroundColor:'#fff4fa'}).setOrigin(0.5));
    fr.on('pointerdown',()=>{const next={...this.sel,outfit:o.id,accessoriesOff:[]};for(const key of ['headwear','weaponId','weaponHand','poseId'])delete next[key];const eq=this.previewEquipped.filter(id=>!Char.v3.headwear[id]),bad=Char.selectionIssues(next,eq);
     if(bad.length){this.rejected=bad[0]+' 請先取下衝突飾品。';this.refresh();return;}this.sel=next;this.previewEquipped=eq;this.rejected=null;sayLbl(o.label.split('・')[1]||o.label);this.refresh();});});}
  if(this.tab==='hat'){const options=[[null,'不戴帽子'],['headwear_B7_star_moon_hat_universal','星月尖帽'],['headwear_B8_moon_beret_universal','月亮貝雷帽'],...['crown','flower_crown'].filter(id=>Save.data.inventory.includes(id)).map(id=>[id,TREASURE_INFO[id]])];
   options.forEach(([id,name],i)=>{const x=600+(i%2)*220,y=190+Math.floor(i/2)*110,on=Char.headwear(this.sel,this.previewEquipped)===id;
    const b=btn(this,x,y,198,80,(on?'✓ ':'')+name,on?0xffc1dc:0xffffff,()=>{this.sel.headwear=id;this.previewEquipped=this.previewEquipped.filter(k=>!Char.v3.headwear[k]);if(id&&Char.m.equipment.some(e=>e.id===id))this.previewEquipped.push(id);this.refresh();},21);p.add(b);});
   const props=Char.v3.outfits[this.sel.outfit].defaultAccessories.filter(id=>Char.v3.assets[id].slot!=='headwear');props.forEach((id,i)=>{const off=(this.sel.accessoriesOff||[]).includes(id);p.add(btn(this,730,560+i*72,330,60,(off?'□ ':'✓ ')+(id.includes('shield')?'盾牌':'玩具劍'),0xf3e9ff,()=>{const next={...this.sel,accessoriesOff:off?(this.sel.accessoriesOff||[]).filter(x=>x!==id):[...(this.sel.accessoriesOff||[]),id]};const bad=Char.selectionIssues(next,this.previewEquipped);if(bad.length){this.rejected=bad[0];}else this.sel=next;this.refresh();},22));});}
  if(['accessory','back'].includes(this.tab)){
   p.add(this.add.text(740,140,this.tab==='back'?'背部裝備・請先取下再切換':'獨立飾品・可與頭飾共存',{fontFamily:FONT,fontSize:'24px',color:'#6a2c91'}).setOrigin(0.5));
   (this.tab==='back'?['wings','star_cape']:['necklace','bow']).forEach((id,i)=>{const y=245+i*195,on=this.previewEquipped.includes(id),owned=Save.data.inventory.includes(id),bad=Char.wearableIssues(id,this.sel,this.previewEquipped),disabled=!owned||(!on&&bad.length>0),key='th5_'+id+'_'+this.sel.outfit+'_'+this.sel.hair+'_'+hat;
    if(items.find(e=>e.key===key)?.meta)p.add(thumb(580,y,key,115));else p.add(Art.make(this,580,y,'treasure_'+id,100,id==='bow'?'🎀':'💎',[0.5,0.5]));
    const label=(!owned?'🔒 ':on?'✓ ':'□ ')+Char.wearableLabel(id)+(disabled&&owned?'・不適用':'');
    const b=btn(this,820,y,268,78,label,disabled?0xded7e5:on?0xffc1dc:0xffffff,()=>{if(!owned){this.rejected='還沒收集到這件飾品喔！';this.refresh();return;}const d={character:{...this.sel},equipped:[...this.previewEquipped]},res=Char.wear(d,id);if(!res.ok)this.rejected=res.issues[0];else{this.previewEquipped=d.equipped;this.rejected=null;}this.refresh();},23);b.wearId=id;b.disabled=!!disabled;if(disabled)b.setAlpha(0.6);p.add(b);
    if(bad.length)p.add(this.add.text(740,y+65,bad[0],{fontFamily:FONT,fontSize:'17px',color:'#a14266',wordWrap:{width:425,useAdvancedWrap:true},align:'center'}).setOrigin(0.5,0));
   });
  }
  if(this.tab==='weapon'){
   const cfg=Char.config(this.sel),choose=change=>{const next={...this.sel,...change},bad=Char.selectionIssues(next,this.previewEquipped);if(bad.length){this.rejected=bad[0];}else{this.rejected=null;this.sel=next;}this.refresh();};
   [[null,'不拿武器'],['sword','玩具劍'],['bow','弓（無箭）'],['wand','魔杖']].forEach(([id,label],i)=>{const x=600+(i%2)*220,y=170+Math.floor(i/2)*95;
    const b=btn(this,x,y,198,80,(cfg.weapon===id?'✓ ':'')+label,cfg.weapon===id?0xffc1dc:0xffffff,()=>choose({weaponId:id,poseId:'neutral',weaponHand:'screen_left'}),23);p.add(b);});
   [['screen_left','畫面左手'],['screen_right','畫面右手']].forEach(([id,label],i)=>p.add(btn(this,610+i*220,380,202,70,(cfg.hand===id?'✓ ':'')+label,cfg.hand===id?0xffc1dc:0xffffff,()=>choose({weaponHand:id}),22)));
   p.add(btn(this,720,470,360,70,'🙌 雙拳 cheer（不拿武器）',0xf3e9ff,()=>choose({weaponId:null,poseId:'fists_both'}),21));
   const shields=Char.v3.outfits[this.sel.outfit].defaultAccessories.filter(id=>Char.v3.assets[id].slot==='shield');shields.forEach((id,i)=>{const off=(this.sel.accessoriesOff||[]).includes(id);p.add(btn(this,720,555+i*66,350,60,(off?'□ ':'✓ ')+'盾牌（右手前請關閉）',0xf3e9ff,()=>choose({accessoriesOff:off?(this.sel.accessoriesOff||[]).filter(x=>x!==id):[...(this.sel.accessoriesOff||[]),id]}),20));});
  }
 }}

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
  btn(this,W-260,60,90,80,'📖',0xffe0f0,()=>this.scene.start('Book'),40);albumButton(this,W-175,H-60);parentGate(this,W-28,H-28);this.add.text(16,H-12,'v '+Build.id,{fontSize:'14px',color:'#2e6b3f'}).setOrigin(0,1);
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
  this.bar=this.add.container(0,0);this.drawBar();btn(this,60,60,90,80,'🗺️',0xffe0f0,()=>{Save.write();this.scene.start('Map');},40);albumButton(this,W-150,60);parentGate(this,W-28,H-178);}
 drawHero(){if(this.hero)this.hero.destroy();this.hero=Char.build(this,W/2,560,330,Save.data.character,Save.data.equipped);}
 placeDecor(h,i){const e=Char.m.equipment.find(q=>q.id===h.id);const t=this.add.text(h.x,h.y,e.emoji,{fontSize:'64px'}).setOrigin(0.5).setInteractive({draggable:true});
  this.input.setDraggable(t);t.on('drag',(p,x,y)=>{t.x=x;t.y=y;h.x=Math.round(x);h.y=Math.round(y);});t.on('dragend',()=>Save.write());this.decor.push(t);}
 drawBar(){this.bar.removeAll(true);const sd=Save.data;const bg=this.add.graphics();bg.fillStyle(0xffffff,0.85).fillRoundedRect(20,H-150,W-40,135,24);this.bar.add(bg);
  if(!sd.inventory.length)this.bar.add(this.add.text(W/2,H-82,'🎁 ➡ ⚔️ 🐉',{fontSize:'48px'}).setOrigin(0.5).setAlpha(0.5));
  sd.inventory.forEach((id,i)=>{const e=Char.m.equipment.find(q=>q.id===id);const x=90+i*115,y=H-100;const worn=sd.equipped.includes(id);
   const it=this.add.text(x,y,e.emoji,{fontSize:'52px'}).setOrigin(0.5);if(worn)this.bar.add(this.add.circle(x,y,40,0xffc1dc));
   const blocked=!worn&&Char.wearableIssues(id,sd.character,sd.equipped).length;const b1=btn(this,x-26,y+55,48,36,'👚',blocked?0xded7e5:worn?0xff9ec4:0xf3e9ff,()=>this.toggleWear(id),20);if(blocked)b1.setAlpha(0.5);
   const b2=btn(this,x+26,y+55,48,36,'🏠',0xf3e9ff,()=>this.toggleDecor(id),20);this.bar.add([it,b1,b2]);});}
 toggleWear(id){const sd=Save.data,e=Char.m.equipment.find(q=>q.id===id);
  const res=Char.wear(sd,id);if(this.wearIssue)this.wearIssue.destroy();if(!res.ok){this.wearIssue=this.add.text(W/2,585,res.issues[0],{fontFamily:FONT,fontSize:'18px',color:'#a14266',backgroundColor:'#fff7fb',wordWrap:{width:930,useAdvancedWrap:true},align:'center'}).setOrigin(0.5);Sound.soft();return;}Sound.chime(3);
  Save.write();this.drawHero();this.drawBar();}
 toggleDecor(id){const sd=Save.data;const k=sd.home.findIndex(h=>h.id===id);if(k>=0){sd.home.splice(k,1);}else{const s=HOME_SPOTS[sd.home.length%HOME_SPOTS.length];sd.home.push({id,x:s[0],y:s[1]});Sound.chime(2);}
  Save.write();this.decor.forEach(d=>d.destroy());this.decor=[];sd.home.forEach((h,i)=>this.placeDecor(h,i));}}

// ---------- Collection book ----------
const MONSTERS=[{id:'slime',e:'🟣',art:'monster_slime'},{id:'mush',e:'🍄',art:'monster_mush'},{id:'bat',e:'🦇',art:'monster_bat'},{id:'ghost',e:'👻',art:'monster_ghost'},{id:'dragon',e:'🐉',art:'monster_black_dragon'}];
class Book extends Phaser.Scene{constructor(){super('Book');}
 create(){sky(this,0xfff3d6,0xffe0ec);this.add.text(W/2,30,'📖',{fontSize:'56px'}).setOrigin(0.5,0);const sd=Save.data;
  Char.m.equipment.forEach((e,i)=>{const x=140+(i%4)*240,y=180+Math.floor(i/4)*150;const has=sd.inventory.includes(e.id);
   this.add.circle(x,y,58,0xffffff).setStrokeStyle(4,has?0xff9ec4:0xdddddd);this.add.text(x,y,has?e.emoji:'❔',{fontSize:'60px'}).setOrigin(0.5).setAlpha(has?1:0.35);});
  MONSTERS.forEach((m,i)=>{const x=140+i*185,y=520;const has=sd.seenMonsters.includes(m.id);this.add.circle(x,y,58,0xe8ffe8).setStrokeStyle(4,has?0x81c784:0xdddddd);
   this.add.text(x,y,has?m.e:'❔',{fontSize:'60px'}).setOrigin(0.5).setAlpha(has?1:0.35);});
  this.add.text(W/2,660,'⭐ '+sd.stars+'   💎 '+sd.gems,{fontFamily:FONT,fontSize:'36px',color:'#8a3d9a'}).setOrigin(0.5);
  btn(this,60,60,90,80,'🗺️',0xffe0f0,()=>this.scene.start('Map'),40);}}

// ---------- 寶物圖鑑 (treasure album) ----------
const TREASURE_INFO={crown:'公主小皇冠',flower_crown:'花花圈',bow:'可愛蝴蝶結',necklace:'寶石項鍊',wings:'蝴蝶翅膀',cat:'小貓咪',unicorn:'小獨角獸',star_cape:'星星披風'};
function albumButton(sc,x,y){const b=btn(sc,x,y,230,92,'',0xfff0b3,()=>sc.scene.start('Album',{from:sc.scene.key}),30);
 b.add(sc.add.text(-62,0,'🏆',{fontSize:'48px'}).setOrigin(0.5));b.add(sc.add.text(28,0,'寶物圖鑑',{fontFamily:FONT,fontSize:'30px',color:'#8a4b00'}).setOrigin(0.5));
 const sd=Save.data,n=TREASURES.filter(t=>sd.inventory.includes(t)).length;const badge=sc.add.text(100,-40,n+'/'+TREASURES.length,{fontFamily:FONT,fontSize:'20px',color:'#fff',backgroundColor:'#ff6fae',padding:{x:8,y:3}}).setOrigin(0.5);b.add(badge);
 sc.tweens.add({targets:b,angle:{from:-2,to:2},duration:900,yoyo:true,repeat:-1});b.albumBtn=true;return b;}
class Album extends Phaser.Scene{constructor(){super('Album');}
 init(d){this.from=(d&&d.from==='Home')?'Home':'Map';}
 create(){const sd=Save.data;const got=TREASURES.filter(t=>sd.inventory.includes(t));this.count=got.length;
  const bgA=Art.entry('album_bg_8slots');this.usesBookArt=Art.has(this,'album_bg_8slots');
  let centers,slot;
  if(this.usesBookArt){this.add.image(0,0,'art_album_bg_8slots').setOrigin(0,0).setDisplaySize(W,H);centers=bgA.slotCenters;slot=bgA.slotSize||160;}
  else{sky(this,0xfff3d6,0xffe0ec);centers=TREASURES.map((_,i)=>[150+(i%4)*240,250+Math.floor(i/4)*250]);slot=180;}
  // title + progress pill (top centre, over the spine)
  const pw=360,px=W/2-pw/2,py=8;const g=this.add.graphics();g.fillStyle(0xffffff,0.95).fillRoundedRect(px,py,pw,84,26).lineStyle(4,0xd1b3f0).strokeRoundedRect(px,py,pw,84,26);
  this.add.text(W/2,py+24,'🏆 寶物圖鑑',{fontFamily:FONT,fontSize:'28px',color:'#8a3d9a'}).setOrigin(0.5);
  g.fillStyle(0xf1e6fb).fillRoundedRect(px+24,py+48,pw-48,26,13);if(got.length)g.fillStyle(0xff9ec4).fillRoundedRect(px+24,py+48,Math.max(26,(pw-48)*got.length/TREASURES.length),26,13);
  this.progressText=this.add.text(W/2,py+61,`已收集 ${got.length} / ${TREASURES.length}`,{fontFamily:FONT,fontSize:'18px',color:'#5a2d6e'}).setOrigin(0.5);
  this.cards=[];
  TREASURES.forEach((id,i)=>{const[x,y]=centers[i];const has=sd.inventory.includes(id);const e=Char.m.equipment.find(q=>q.id===id)||{};
   if(!this.usesBookArt){const card=this.add.graphics();card.fillStyle(has?0xffffff:0xeee6f5,0.95).fillRoundedRect(x-slot/2,y-slot/2,slot,slot,28).lineStyle(5,has?0xffc1dc:0xd9cce6).strokeRoundedRect(x-slot/2,y-slot/2,slot,slot,28);}
   const icon=Art.make(this,x,y,'treasure_'+id,Math.round(slot*0.8),e.emoji,[0.5,0.5]);
   if(!has){icon.setTintFill(0x8a7aa3);icon.setAlpha(0.5);}
   const worn=has&&sd.equipped.includes(id);
   const name=this.add.text(x,y+slot/2+22,has?(TREASURE_INFO[id]||id):'???',{fontFamily:FONT,fontSize:'24px',color:has?'#6a3d7a':'#a497b8',stroke:'#fffaf0',strokeThickness:5}).setOrigin(0.5);
   if(worn)this.add.text(x-slot/2+16,y-slot/2+14,'👚',{fontSize:'26px'}).setOrigin(0.5);
   const hit=this.add.rectangle(x,y+14,slot,slot+30,0xffffff,0.001).setInteractive();
   hit.on('pointerdown',()=>{this.tweens.add({targets:icon,scaleX:icon.baseScale*1.15,scaleY:icon.baseScale*1.15,duration:120,yoyo:true});
    if(has){Sound.chime(4);Sound.say(TREASURE_INFO[id]);fxSparkle(this,x,y,20);}else{Sound.soft();Sound.say('還沒找到喔！連續答對三題就有機會拿到！');}});
   this.cards.push({id,has,name:name.text,art:!!icon.isArt});});
  if(got.length===TREASURES.length)this.add.text(W/2,H-40,'🎉 全部收集完成！你好厲害！',{fontFamily:FONT,fontSize:'28px',color:'#c2185b',stroke:'#fff',strokeThickness:6}).setOrigin(0.5);
  btn(this,72,56,100,76,this.from==='Home'?'🏠':'🗺️',0xffe0f0,()=>this.scene.start(this.from),38);
  Sound.say(`寶物圖鑑，你已經找到${got.length}個寶物了！`);}}

// ---------- Parent gate: small gear, press and hold 2 s ----------
function parentGate(sc,x,y){const c=sc.add.container(x,y).setDepth(60);const bg=sc.add.circle(0,0,22,0xffffff,0.35);const t=sc.add.text(0,0,'⚙️',{fontSize:'22px'}).setOrigin(0.5).setAlpha(0.6);
 const ring=sc.add.graphics();const tip=sc.add.text(-30,-34,'',{fontFamily:FONT,fontSize:'16px',color:'#5a2d6e',backgroundColor:'#ffffffcc',padding:{x:6,y:3}}).setOrigin(1,0.5);
 c.add([bg,t,ring,tip]);c.setSize(56,56).setInteractive();let ev=null,t0=0;
 const stop=()=>{if(ev){ev.remove();ev=null;}ring.clear();tip.setText('');};
 c.on('pointerdown',()=>{stop();t0=sc.time.now;tip.setText('家長請按住 2 秒');ev=sc.time.addEvent({delay:30,loop:true,callback:()=>{const f=Math.min(1,(sc.time.now-t0)/2000);
   ring.clear();ring.lineStyle(5,0x9a6ab8).beginPath();ring.arc(0,0,25,-Math.PI/2,-Math.PI/2+f*Math.PI*2);ring.strokePath();if(f>=1){stop();sc.scene.start('Report',{from:sc.scene.key});}}});});
 c.on('pointerup',stop);c.on('pointerout',stop);sc.input.on('pointerup',stop);c.parentGate=true;return c;}

// ---------- 給爸爸看 (parent page) ----------
const TONE_NAME={1:'一聲',2:'二聲',3:'三聲',4:'四聲'};
const Stats={
 recentMissed(n){const L=Save.data.leitner;return Learn.items.filter(it=>L[it.id]&&L[it.id].wrong>0)
   .sort((a,b)=>(L[b.id].lastWrong||0)-(L[a.id].lastWrong||0)||L[b.id].wrong-L[a.id].wrong).slice(0,n);},
 confusedPairs(){const T=Save.data.toneStats,P={};for(const k in T){const[e,c]=k.split('>').map(Number);if(e===c||!T[k])continue;const a=Math.min(e,c),b=Math.max(e,c),key=a+'-'+b;
   const p=P[key]||(P[key]={a,b,total:0,ab:0,ba:0});p.total+=T[k];if(e===a)p.ab+=T[k];else p.ba+=T[k];}return Object.values(P).sort((x,y)=>y.total-x.total);},
 toneAcc(){const T=Save.data.toneStats;return[1,2,3,4].map(e=>{let tot=0;[1,2,3,4].forEach(c=>tot+=T[e+'>'+c]||0);const ok=T[e+'>'+e]||0;return{e,ok,tot};});},
 lessonAcc(){const L=Save.data.leitner,R={};for(const it of Learn.items){const s=L[it.id];const ls=it.word.lesson;const r=R[ls]||(R[ls]={lesson:ls,name:it.word.lessonName||'',ok:0,tot:0});
   if(s){r.ok+=s.correct;r.tot+=s.correct+s.wrong;}}return Object.values(R).sort((a,b)=>a.lesson-b.lesson);},
 overall(){const L=Save.data.leitner;let ok=0,tot=0;for(const k in L){ok+=L[k].correct;tot+=L[k].correct+L[k].wrong;}return{ok,tot};}};
class Report extends Phaser.Scene{constructor(){super('Report');}
 init(d){this.from=(d&&d.from==='Home')?'Home':'Map';}
 create(){this.cameras.main.setBackgroundColor('#fbf7ff');const sd=Save.data,F=FONT;const tx=(x,y,s,o)=>this.add.text(x,y,s,Object.assign({fontFamily:F,fontSize:'20px',color:'#333'},o||{}));
  const panel=(x,y,w,h,title)=>{const g=this.add.graphics();g.fillStyle(0xffffff).fillRoundedRect(x,y,w,h,18).lineStyle(2,0xe3d6f5).strokeRoundedRect(x,y,w,h,18);tx(x+18,y+12,title,{fontSize:'22px',color:'#6a2c91'});};
  tx(W/2,14,'👨‍👧 給爸爸看：注音聲調學習報告',{fontSize:'30px',color:'#5a2d6e'}).setOrigin(0.5,0);
  const O=Stats.overall();tx(W/2,56,`累計玩了 ${sd.sessions} 次、約 ${Math.round(sd.playMs/60000)} 分鐘；第一次作答 ${O.tot} 題，答對 ${O.tot?Math.round(O.ok/O.tot*100):0}%`,{fontSize:'18px',color:'#7a5a9a'}).setOrigin(0.5,0);
  // left: recent most-missed words
  panel(24,92,480,400,'最近常錯的字（最新在上）');const miss=Stats.recentMissed(6);const L=sd.leitner;this.missRows=[];
  if(!miss.length)tx(44,140,'還沒有錯題，太棒了！',{color:'#999'});
  miss.forEach((it,i)=>{const y=134+i*58,s=L[it.id];const w=it.word;
   tx(44,y,(Learn.picture(w)?.glyph||'')+' '+w.word,{fontSize:'26px'});
   tx(170,y+2,Learn.spell(w),{fontSize:'24px',color:'#5a2d6e'});
   const target=w.zhuyin[it.syl]+(TONE_SHOW[it.tone]||'')+'（'+TONE_NAME[it.tone]+(s.lastChosen&&s.lastChosen!==it.tone?'，她選了'+TONE_NAME[s.lastChosen]:'')+'）';
   tx(170,y+31,'這個音：'+target,{fontSize:'15px',color:'#c2185b'});
   tx(488,y+6,`錯 ${s.wrong}／練 ${s.seen}`,{fontSize:'17px',color:'#666'}).setOrigin(1,0);this.missRows.push(w.word);});
  // right: confused tone pairs + per-tone accuracy
  panel(520,92,480,210,'最容易搞混的聲調');const pairs=Stats.confusedPairs().slice(0,3);this.pairRows=[];
  if(!pairs.length)tx(540,140,'還沒有聲調混淆的紀錄',{color:'#999'});
  pairs.forEach((p,i)=>{const y=136+i*54;tx(540,y,`${TONE_NAME[p.a]} ↔ ${TONE_NAME[p.b]}`,{fontSize:'24px',color:i===0?'#c2185b':'#333'});
   tx(700,y+2,`共 ${p.total} 次`,{fontSize:'20px'});tx(540,y+30,`把${TONE_NAME[p.a]}當成${TONE_NAME[p.b]} ${p.ab} 次、把${TONE_NAME[p.b]}當成${TONE_NAME[p.a]} ${p.ba} 次`,{fontSize:'15px',color:'#777'});
   this.pairRows.push(`${TONE_NAME[p.a]}↔${TONE_NAME[p.b]}:${p.total}`);});
  panel(520,312,480,180,'各聲調正確率');Stats.toneAcc().forEach((r,i)=>{const y=352+i*34,pct=r.tot?Math.round(r.ok/r.tot*100):0;
   tx(540,y,TONE_NAME[r.e],{fontSize:'19px'});this.add.rectangle(610,y+11,260,16,0xeeeeee).setOrigin(0,0.5);if(r.tot)this.add.rectangle(610,y+11,260*pct/100,16,pct<70?0xff8a80:0x81c784).setOrigin(0,0.5);
   tx(985,y,r.tot?`${pct}%（${r.ok}/${r.tot}）`:'尚無資料',{fontSize:'16px',color:pct<70&&r.tot?'#c2185b':'#555'}).setOrigin(1,0);});
  // bottom: per-lesson accuracy
  panel(24,502,976,170,'各課正確率（第一次作答）');const LA=Stats.lessonAcc();this.lessonRows=LA;const cw=Math.floor(940/Math.max(1,LA.length));
  LA.forEach((r,i)=>{const x=42+i*cw,pct=r.tot?Math.round(r.ok/r.tot*100):null;const bh=70;
   this.add.rectangle(x+cw/2,620,cw-26,bh,0xf1ebf8).setOrigin(0.5,1);if(pct!=null)this.add.rectangle(x+cw/2,620,cw-26,Math.max(3,bh*pct/100),pct<70?0xff8a80:0x81c784).setOrigin(0.5,1);
   tx(x+cw/2,546,pct==null?'—':pct+'%',{fontSize:'17px',color:pct!=null&&pct<70?'#c2185b':'#333'}).setOrigin(0.5,0);
   tx(x+cw/2,626,`第${r.lesson}課`,{fontSize:'15px'}).setOrigin(0.5,0);tx(x+cw/2,646,(r.name||'').slice(0,5),{fontSize:'13px',color:'#888'}).setOrigin(0.5,0);});
  const box=[1,2,3,4,5].map(b=>Learn.items.filter(it=>L[it.id]&&L[it.id].box===b).length);
  tx(W/2,682,'複習盒（1=要多練 → 5=很熟）：'+box.map((n,i)=>`${i+1}盒 ${n}`).join('　')+`　未學 ${Learn.items.length-box.reduce((a,b)=>a+b,0)}`,{fontSize:'15px',color:'#7a5a9a'}).setOrigin(0.5,0);
  btn(this,190,732,250,56,'💾 公主存檔卡（匯出）',0xe8e0ff,()=>this.scene.start('SaveCard',{from:this.from}),21);
  btn(this,512,732,250,56,'📥 匯入存檔碼',0xe8e0ff,()=>ImportUI.open(this),21);
  const cr=this.add.text(1012,690,'ⓘ 來源',{fontFamily:F,fontSize:'15px',color:'#7a5a9a',padding:{x:4,y:4}}).setOrigin(1,0).setInteractive();cr.on('pointerdown',()=>this.scene.start('Credits',{from:'Report',back:this.from}));
  btn(this,834,732,250,56,this.from==='Home'?'回小屋':'回地圖',0xffe0f0,()=>this.scene.start(this.from),22);}}
