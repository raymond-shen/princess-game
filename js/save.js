// Versioned v2 save with backup copy, storage.persist(), export/import code.
const SAVE_KEY='kx_save_v2',SAVE_BAK='kx_save_v2_bak';
function freshSave(){return{v:2,created:Date.now(),updated:Date.now(),
 character:null,// {job,hair,hairColor,outfit}
 equipped:[],inventory:[],home:[],stars:0,gems:0,stagesStars:{},seenMonsters:[],
 leitner:{},// itemId:{box,due,miss,seen,correct,wrong}
 toneStats:{},// "expected>chosen":count
 lastChestDay:{},playMs:0,sessions:0};}
const Save={data:null,
 load(){let d=null;for(const k of[SAVE_KEY,SAVE_BAK]){try{const s=localStorage.getItem(k);if(s){d=JSON.parse(s);if(d&&d.v)break;}}catch(e){d=null;}}
  if(!d){try{const old=localStorage.getItem('pg_save');if(old)d=this.migrate(JSON.parse(old));}catch(e){}}
  this.data=d&&d.v===2?Object.assign(freshSave(),d):(d?this.migrate(d):freshSave());
  if(typeof Char!=='undefined'&&Char.v3){const before=JSON.stringify(this.data);Char.migrateSave(this.data);if(JSON.stringify(this.data)!==before)this.write();}
  try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();}catch(e){}
  return this.data;},
 migrate(old){const n=Object.assign(freshSave(),old||{});n.v=2;if(old){if(old.gems)n.gems=old.gems|0;if(old.stars)n.stars=old.stars|0;}return n;},
 write(){const d=this.data;d.updated=Date.now();const s=JSON.stringify(d);
  try{const prev=localStorage.getItem(SAVE_KEY);if(prev)localStorage.setItem(SAVE_BAK,prev);localStorage.setItem(SAVE_KEY,s);}catch(e){console.warn('save failed',e);}},
 // ---- save code: "KXZ2.<lz-string payload>.<checksum>" (compressed, URL-safe, works offline) ----
 // leitner is packed into arrays and timestamps become minutes relative to a base, so the code fits in a QR code.
 LF:['box','due','miss','seen','correct','wrong','last','lastWrong','lastChosen'],LT:{due:1,last:1,lastWrong:1},
 pack(d){const b=Math.round(Date.now()/60000),o=Object.assign({},d);delete o.leitner;o.x=Date.now();
  // Group repeated word keys (e.g. 老師#1/#2) and trim null tails. Still KXZ2; old row format remains readable.
  const groups=new Map();for(const[k,v]of Object.entries(d.leitner||{})){const match=k.match(/^(.*)#([^#]+)$/),word=match?match[1]:k,suffix=match?match[2]:null;
   const row=[suffix,...this.LF.map(f=>v[f]==null?null:(this.LT[f]?Math.round(v[f]/60000)-b:v[f]))];while(row.length>1&&row[row.length-1]==null)row.pop();if(!groups.has(word))groups.set(word,[]);groups.get(word).push(row);}
  o.L={b,g:[...groups.entries()]};
  // Compact character representation; unknown/future fields are retained in the final object.
  if(o.character){const c=Object.assign({},o.character),keys=['job','hair','hairColor','outfit','headwear','accessoriesOff'];o.C=keys.map(k=>{const v=c[k];delete c[k];return v===undefined?null:v;});
   // Distinguish auto headwear (absent) from explicitly off (null).
   o.C.push(Object.prototype.hasOwnProperty.call(o.character,'headwear')?1:0,c);delete o.character;}
  return o;},
 unpack(o){const d=Object.assign({},o),L={};const read=(id,row,offset)=>{if(id==='__proto__'||id==='constructor'||id==='prototype')return;const s={};this.LF.forEach((f,i)=>{const v=row[i+offset];if(v!=null)s[f]=this.LT[f]?(v+o.L.b)*60000:v;});L[id]=s;};
  if(o.L&&Array.isArray(o.L.g)){for(const[word,rows]of o.L.g)for(const r of rows)read(r[0]===null?word:word+'#'+r[0],r,1);}
  else if(o.L&&Array.isArray(o.L.l)){for(const r of o.L.l)read(r[0],r,1);}
  d.leitner=L;if(Array.isArray(o.C)){const keys=['job','hair','hairColor','outfit','headwear','accessoriesOff'];d.character=Object.assign({},o.C[7]||{});keys.forEach((k,i)=>{if(o.C[i]!==null&&o.C[i]!==undefined)d.character[k]=o.C[i];});if(o.C[6])d.character.headwear=o.C[4];delete d.C;}
  const exportedAt=d.x;delete d.L;delete d.x;return{data:d,exportedAt};},
 chk(str){let h=0x811c9dc5;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return(h%1679616).toString(36).toUpperCase().padStart(4,'0');},
 exportCode(){const p=LZString.compressToEncodedURIComponent(JSON.stringify(this.pack(this.data)));return 'KXZ2.'+p+'.'+this.chk(p);},
 // returns {data, exportedAt}; throws Error with a parent-friendly Chinese message
 parseCode(code){const t=String(code||'').replace(/\s+/g,'');if(!t)throw new Error('請先貼上存檔碼');
  if(/^KX2-/.test(t)){let d;try{d=JSON.parse(decodeURIComponent(escape(atob(t.slice(4)))));}catch(e){throw new Error('存檔碼不完整或打錯了');}
   if(!d||d.v!==2)throw new Error('存檔版本不符（需要 v2）');return{data:d,exportedAt:d.updated};}
  const m=t.match(/^KXZ(\d+)\.([A-Za-z0-9+\-$]+)\.([0-9A-Z]{4})$/);
  if(!m){if(/^KXZ\d+\./.test(t)){const v=t.match(/^KXZ(\d+)/)[1];if(v!=='2')throw new Error(`存檔版本不符：這是 v${v} 的存檔碼，這個遊戲版本只能讀 v2`);}throw new Error('這不是公主冒險的存檔碼');}
  if(m[1]!=='2')throw new Error(`存檔版本不符：這是 v${m[1]} 的存檔碼，這個遊戲版本只能讀 v2`);
  if(this.chk(m[2])!==m[3])throw new Error('存檔碼不完整或打錯了（檢查碼不符）');
  let o;try{o=JSON.parse(LZString.decompressFromEncodedURIComponent(m[2]));}catch(e){o=null;}
  if(!o)throw new Error('存檔碼不完整或打錯了');if(o.v!==2)throw new Error('存檔版本不符（需要 v2）');return this.unpack(o);},
 summary(d){const items=Object.keys(d.leitner||{}).length;return{character:d.character,stars:d.stars|0,gems:d.gems|0,treasures:(d.inventory||[]).length,words:items,stages:Object.keys(d.stagesStars||{}).length,updated:d.updated};},
 replaceWith(d){this.data=Object.assign(freshSave(),d);if(typeof Char!=='undefined'&&Char.v3)Char.migrateSave(this.data);this.write();return true;},
 importCode(code){return this.replaceWith(this.parseCode(code).data);}};
