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
  try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();}catch(e){}
  return this.data;},
 migrate(old){const n=freshSave();if(old){if(old.gems)n.gems=old.gems|0;if(old.stars)n.stars=old.stars|0;}return n;},
 write(){const d=this.data;d.updated=Date.now();const s=JSON.stringify(d);
  try{const prev=localStorage.getItem(SAVE_KEY);if(prev)localStorage.setItem(SAVE_BAK,prev);localStorage.setItem(SAVE_KEY,s);}catch(e){console.warn('save failed',e);}},
 exportCode(){return 'KX2-'+btoa(unescape(encodeURIComponent(JSON.stringify(this.data))));},
 importCode(code){const t=(code||'').trim().replace(/^KX2-/,'');const d=JSON.parse(decodeURIComponent(escape(atob(t))));
  if(!d||d.v!==2)throw new Error('bad version');this.data=Object.assign(freshSave(),d);this.write();return true;}};
