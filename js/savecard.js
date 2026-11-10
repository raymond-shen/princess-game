// ---------- 公主存檔卡 (export), import overlay, credits ----------
// Card uses Lily's ui_v001 frame (assets_manifest key "savecard_frame", 880x600); a drawn fallback with the same zones is used if it is missing.
function fmtDate(t){const d=new Date(t||Date.now()),p=n=>String(n).padStart(2,'0');return`${d.getFullYear()}/${p(d.getMonth()+1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;}
function jobLabel(c){const j=c&&Char.m.jobs.find(j=>j.id===c.job);return j?j.label:'公主';}
class SaveCard extends Phaser.Scene{constructor(){super('SaveCard');}
 init(d){this.from=(d&&d.from)||'Map';}
 // Layout follows Lily's art/ui_v001/savecard_layout.json (copy in data/savecard_layout.json); all coords are card-local px on the 880x600 frame.
 create(){sky(this,0xe6d8ff,0xffe4f1);this.charC=null;const sd=Save.data;this.code=Save.exportCode();const S=Save.summary(sd);
  const FW=880,FH=600,LY={title:[220,62,660,114],character:[48,128,336,480],info:[352,128,528,480],qrPanel:[548,128,832,412],qr:[572,152,808,388],caption:[548,424,832,480],bottom:[100,494,780,558]};
  // container is the full 880x600 canvas (ornaments overhang the card edge) and scales down proportionally to leave room for the buttons
  const k=Math.min(1,(W-24)/FW,(H-24-84)/FH);const card=this.add.container(Math.round((W-FW*k)/2),12).setScale(k);card.y=Math.max(8,Math.round((H-84-FH*k)/2));this.card=card;this.cardScale=k;
  const cx=b=>(b[0]+b[2])/2,cy=b=>(b[1]+b[3])/2;
  if(Art.has(this,'savecard_frame')){card.add(this.add.image(0,0,'art_savecard_frame').setOrigin(0,0));this.usesFrameArt=true;}
  else{this.usesFrameArt=false;const g=this.add.graphics();g.fillStyle(0xc9b4e6).fillRoundedRect(6,6,868,588,44);g.fillStyle(0xfff8ee).fillRoundedRect(24,24,832,552,30);
   const z=(b,c,r)=>g.fillStyle(c).fillRoundedRect(b[0],b[1],b[2]-b[0],b[3]-b[1],r||16);z(LY.title,0xfce2ec,26);z(LY.character,0xf4edfb);z(LY.info,0xfdeef3);z(LY.qrPanel,0xffffff);z(LY.caption,0xfdeef3);z(LY.bottom,0xfdeef3);card.add(g);}
  const T=(x,y,str,st,o)=>{const t=this.add.text(x,y,str,Object.assign({fontFamily:FONT,color:'#5a3d7a'},st)).setOrigin(...(o||[0.5,0.5]));card.add(t);return t;};
  T(cx(LY.title),cy(LY.title),'👑 公主的冒險存檔',{fontSize:'28px',fontStyle:'bold'});
  // Fixed full-canvas scale: hatless visible body ~90% of slot, B7 changes no scale.
  // Full canvas y=0..1100; sole line 1030. No alphaBBox-based fitting.
  const C=LY.character,ch=(C[3]-C[1])*0.99,sel=sd.character||{job:'warrior',hair:'A1',hairColor:'brown',outfit:'B1'};
  const portrait=this.add.container(cx(C),C[3]-8);card.add(portrait);this.charFit={canvasH:ch,scale:ch/1100,slotH:C[3]-C[1],fixed:true};
  Char.ensure(this,sel,()=>{if(this.charC||!this.sys.displayList)return;const c=Char.build(this,0,0,ch,sel,sd.equipped,'happy');this.charC=c;portrait.add(c);},sd.equipped,'happy');
  // middle info
  const I=LY.info,ix=cx(I),rows=[['存檔日期',fmtDate(Date.now()).slice(0,10)],['職業',jobLabel(sd.character)],['⭐ 星星','× '+S.stars],['💎 寶石','× '+S.gems],['📚 練過的音',S.words+' 個'],['🏰 過關',S.stages+' 關']];
  rows.forEach(([lab,v],i)=>{const y=I[1]+34+i*56;T(ix,y-12,lab,{fontSize:'15px',color:'#9a6ab8'});T(ix,y+12,String(v),{fontSize:'22px',fontStyle:'bold'});});
  // QR: integer module size inside the 236x236 qr box; the panel's 24px white border is the quiet zone
  const Q=LY.qr,QS=Q[2]-Q[0];this.qrOk=false;this.qrModulePx=0;
  try{const q=qrcode(0,'L');q.addData(this.code,'Byte');q.make();const n=q.getModuleCount(),m=Math.floor(QS/n);if(m<1)throw new Error('too dense');
   const sz=m*n,ox=Q[0]+Math.floor((QS-sz)/2),oy=Q[1]+Math.floor((QS-sz)/2),g=this.add.graphics();g.fillStyle(0xffffff).fillRect(Q[0],Q[1],QS,QS);g.fillStyle(0x3a2f4a);
   for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(q.isDark(r,c))g.fillRect(ox+c*m,oy+r*m,m,m);card.add(g);this.qr=q;this.qrModules=n;this.qrModulePx=m;this.qrOk=true;
   const P=LY.qrPanel,hz=this.add.rectangle(cx(P),cy(P),P[2]-P[0],P[3]-P[1],0xffffff,0.001).setInteractive();hz.on('pointerdown',()=>QRBig.show(q));card.add(hz);
   // on-screen module size (card scale x Scale.FIT on iPad ~1.07); below ~3px phone cameras struggle -> ask to enlarge
   this.qrDense=m*k<3;}
  catch(e){T(cx(Q),cy(Q),'存檔太大\n放不進 QR\n請用「複製存檔碼」',{fontSize:'20px',color:'#c2185b',align:'center'});}
  const Cp=LY.caption;T(cx(Cp),cy(Cp)-11,!this.qrOk?'請按下面的「複製存檔碼」':this.qrDense?'👆 點 QR 放大後再掃描':'用另一台 iPad 的相機掃描',{fontSize:'17px',color:this.qrDense?'#c2185b':'#7a5a9a'});
  T(cx(Cp),cy(Cp)+13,`存檔碼 ${this.code.length} 字・點 QR 可放大`,{fontSize:'13px',color:'#9a6ab8'});
  // treasures: 8 slots centred in the bottom row, same 48px size and ~60.6px pitch as Lily's 11-slot suggestion
  const B=LY.bottom,pitch=(719-113)/10,own=sd.inventory||[];this.treasureSlots=[];
  TREASURES.forEach((t,i)=>{const x=cx(B)+(i-(TREASURES.length-1)/2)*pitch,y=cy(B);const g=this.add.graphics();g.fillStyle(0xffffff,0.9).fillRoundedRect(x-24,y-24,48,48,10);g.lineStyle(2,0xf2aac4).strokeRoundedRect(x-24,y-24,48,48,10);card.add(g);
   const has=own.includes(t),ic=Art.make(this,x,y,'treasure_'+t,40,(Char.m.equipment.find(q=>q.id===t)||{}).emoji,[0.5,0.5]);if(!has){if(ic.isArt)ic.setTintFill(0x8a7aa3).setAlpha(0.45);else ic.setAlpha(0.25);}card.add(ic);this.treasureSlots.push({id:t,x:Math.round(x),has});});
  btn(this,W/2+150,H-42,250,60,'📋 複製存檔碼',0xb9f6ca,()=>this.copy(),24);
  btn(this,W/2-150,H-42,200,60,'⬅ 回去',0xffe0f0,()=>this.scene.start('Report',{from:this.from}),22);
  this.add.text(W-14,H-12,'v2 存檔・匯入時會先確認',{fontFamily:FONT,fontSize:'13px',color:'#9a6ab8'}).setOrigin(1,1);}
 copy(){const c=this.code;let ok=false;try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(c).then(()=>floatText(this,W/2,H-90,'已複製！','#2e7d32'),()=>CodeUI.show(c));ok=true;}}catch(e){}
  if(!ok)CodeUI.show(c);}}
// full-screen QR at device resolution (for long codes)
const QRBig={show(q){this.hide();KXStyle();const n=q.getModuleCount(),px=Math.min(innerWidth,innerHeight)*0.82*(window.devicePixelRatio||1),cell=Math.max(2,Math.floor(px/(n+8)));
  const d=document.createElement('div');d.id='kx-qrbig';d.style.cssText='position:fixed;inset:0;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:60';
  const img=new Image();img.src=q.createDataURL(cell,cell*4);img.style.cssText=`width:${Math.min(innerWidth,innerHeight)*0.82}px;height:auto;image-rendering:pixelated`;
  const t=document.createElement('p');t.textContent='點一下關閉';t.style.cssText='font:20px "PingFang TC",sans-serif;color:#7a5a9a';d.appendChild(img);d.appendChild(t);d.onclick=()=>this.hide();document.body.appendChild(d);},
 hide(){const e=document.getElementById('kx-qrbig');if(e)e.remove();}};
// read-only code box (fallback when the clipboard API is unavailable)
const CodeUI={show(code){this.hide();const d=document.createElement('div');d.id='kx-codebox';d.innerHTML=`<div class="kx-card"><h2>📋 存檔碼</h2><p>請全選後複製，貼到備忘錄或傳給自己保存。</p><textarea readonly>${code}</textarea><div class="kx-row"><button id="kx-code-close">關閉</button></div></div>`;
  document.body.appendChild(d);KXStyle();const t=d.querySelector('textarea');t.focus();t.select();d.querySelector('#kx-code-close').onclick=()=>this.hide();},
 hide(){const e=document.getElementById('kx-codebox');if(e)e.remove();}};
function KXStyle(){if(document.getElementById('kx-style'))return;const s=document.createElement('style');s.id='kx-style';
 s.textContent=`#kx-import,#kx-codebox{position:fixed;inset:0;background:rgba(43,31,69,.6);display:flex;align-items:center;justify-content:center;z-index:50;font-family:"PingFang TC","Noto Sans CJK TC",sans-serif}
 .kx-card{background:#fff8fc;border:5px solid #ffc1dc;border-radius:28px;padding:22px 28px;width:min(760px,90vw);max-height:90vh;overflow:auto;color:#5a2d6e;box-sizing:border-box}
 .kx-card h2{margin:0 0 8px;font-size:28px}.kx-card p{margin:6px 0;font-size:18px}
 .kx-card textarea{width:100%;height:120px;font-size:16px;border:2px solid #d9c8f5;border-radius:14px;padding:10px;box-sizing:border-box;-webkit-user-select:text;user-select:text;font-family:monospace}
 .kx-row{display:flex;gap:14px;justify-content:flex-end;margin-top:14px}.kx-row button{font-size:22px;padding:12px 22px;border-radius:18px;border:3px solid #fff;background:#f3e9ff;color:#5a2d6e;font-family:inherit}
 #kx-ok{background:#ff9ec4;color:#fff}#kx-check{background:#b9f6ca}.kx-err{color:#c2185b;font-size:20px}
 .kx-sum{width:100%;border-collapse:collapse;font-size:18px;margin-top:10px}.kx-sum td,.kx-sum th{border-bottom:1px solid #eee3f7;padding:6px 8px;text-align:left}.kx-warn{background:#fff3cd;border-radius:12px;padding:10px 14px;font-size:18px;margin-top:10px}`;
 document.head.appendChild(s);}
// import overlay: paste -> check version + checksum -> show summary -> confirm before overwriting
const ImportUI={parsed:null,open(scene){this.close();this.scene=scene;this.parsed=null;KXStyle();const d=document.createElement('div');d.id='kx-import';
  d.innerHTML=`<div class="kx-card"><h2>📥 匯入存檔碼</h2><p>把「公主存檔卡」上的存檔碼貼在下面（KXZ2. 開頭）。</p><textarea id="kx-code" placeholder="KXZ2.…"></textarea>
   <div id="kx-msg"></div><div id="kx-sum"></div><div class="kx-row"><button id="kx-cancel">取消</button><button id="kx-check">檢查存檔碼</button><button id="kx-ok" style="display:none">✅ 確定取代</button></div></div>`;
  document.body.appendChild(d);d.querySelector('#kx-cancel').onclick=()=>this.close();d.querySelector('#kx-check').onclick=()=>this.check();d.querySelector('#kx-ok').onclick=()=>this.confirm();},
 check(){const msg=document.getElementById('kx-msg'),sum=document.getElementById('kx-sum'),ok=document.getElementById('kx-ok');sum.innerHTML='';ok.style.display='none';this.parsed=null;
  try{const r=Save.parseCode(document.getElementById('kx-code').value);this.parsed=r;const a=Save.summary(r.data),b=Save.summary(Save.data);
   const row=(k,x,y)=>`<tr><td>${k}</td><td>${x}</td><td>${y}</td></tr>`;
   msg.innerHTML='<p style="color:#2e7d32">✔ 存檔碼正確（v2）</p>';
   sum.innerHTML=`<table class="kx-sum"><tr><th></th><th>存檔碼裡的進度</th><th>這台 iPad 目前</th></tr>${row('職業',jobLabel(a.character),jobLabel(b.character))}${row('⭐ 星星',a.stars,b.stars)}${row('💎 寶石',a.gems,b.gems)}${row('🏆 寶物',a.treasures,b.treasures)}${row('📚 練過的音',a.words,b.words)}${row('📅 存檔時間',fmtDate(r.exportedAt||a.updated),fmtDate(b.updated))}</table>
    <div class="kx-warn">⚠️ 按「確定取代」後，這台 iPad 目前的進度會被存檔碼裡的進度取代（舊進度會自動留一份備份）。</div>`;ok.style.display='';}
  catch(e){msg.innerHTML=`<p class="kx-err">✖ ${e.message}</p>`;}},
 confirm(){if(!this.parsed)return;try{const prev=localStorage.getItem(SAVE_KEY);if(prev)localStorage.setItem('kx_save_v2_before_import',prev);}catch(e){}
  Save.replaceWith(this.parsed.data);const sc=this.scene;this.close();Sound.chime(4);if(sc)sc.scene.restart({from:sc.from});},
 close(){const e=document.getElementById('kx-import');if(e)e.remove();}};
// ---------- credits ----------
class Credits extends Phaser.Scene{constructor(){super('Credits');}
 init(d){this.from=(d&&d.from)||'Start';this.back=d&&d.back;}
 create(){this.cameras.main.setBackgroundColor('#fbf7ff');const T=(y,s,o)=>this.add.text(60,y,s,Object.assign({fontFamily:FONT,fontSize:'19px',color:'#333',wordWrap:{width:900},lineSpacing:6},o||{}));
  this.add.text(W/2,24,'ⓘ 版權與來源',{fontFamily:FONT,fontSize:'32px',color:'#5a2d6e'}).setOrigin(0.5,0);
  T(90,'🔊 詞語讀音',{fontSize:'23px',color:'#6a2c91'});
  T(124,'中華民國教育部（Ministry of Education, R.O.C.）。《國語辭典簡編本》（版本編號：2014_20260929）網址：https://dict.concised.moe.edu.tw/');
  T(184,'授權：創用 CC 姓名標示-禁止改作 3.0 臺灣（CC BY-ND 3.0 TW）https://creativecommons.org/licenses/by-nd/3.0/tw/legalcode');
  T(244,'教育部原音未剪輯或重編碼；副本13檔僅校正WAV標頭長度，PCM取樣資料完全不變。遊戲只播放詞目本身的讀音段落。教育部使用說明全文附於 assets/audio/words/。沒有官方音檔的詞語，使用 iPad 內建語音朗讀。',{color:'#555'});
  T(340,'📚 題庫',{fontSize:'23px',color:'#6a2c91'});T(374,'詞語整理自康軒國語一上首冊（111 年版）課名與注音，僅供家庭複習使用。',{color:'#555'});
  T(430,'🎨 美術',{fontSize:'23px',color:'#6a2c91'});T(464,'防禦塔、怪物、表情、寶物與特效：Lily 美術長。其餘為暫用圖。',{color:'#555'});
  T(520,'🧩 程式庫',{fontSize:'23px',color:'#6a2c91'});T(554,'Phaser 3（MIT）・qrcode-generator by Kazuhiko Arase（MIT；“QR Code” 是 DENSO WAVE 的註冊商標）・lz-string by Pieroxy（MIT）',{color:'#555'});
  btn(this,W/2,700,240,64,'⬅ 回去',0xffe0f0,()=>this.scene.start(this.from,this.from==='Report'?{from:this.back}:{}),24);}}
