// Vocabulary items + Leitner 5-box spaced repetition (30% missed / 60% due / 10% new).
const TONE_MARK={1:'ˉ',2:'ˊ',3:'ˇ',4:'ˋ'};const TONE_SHOW={1:'',2:'ˊ',3:'ˇ',4:'ˋ'};
const BOX_MS=[0,0,2*60e3,10*60e3,24*3600e3,3*24*3600e3];
const Learn={words:[],items:[],pictures:{},
 init(vocab,pictures){this.words=vocab.words;this.pictures=pictures?.words||{};this.items=[];
  for(const w of this.words)w.tones.forEach((t,i)=>{if(t>0&&!(w.skipSyllables||[]).includes(i))this.items.push({id:w.id+'#'+i,word:w,syl:i,tone:t});});},
 spell(w,overrideIdx,overrideTone){return w.zhuyin.map((z,i)=>z+(i===overrideIdx?(overrideTone==null?'':TONE_SHOW[overrideTone]):(w.tones[i]===0?'˙':TONE_SHOW[w.tones[i]]))).join(' ');},
 st(id){const L=Save.data.leitner;return L[id];},
 // An emoji is not an illustration merely because it exists in the old vocabulary.
 picture(w){const p=w&&this.pictures[w.id];if(!p||p.status!=='matched'||p.wordId!==w.id)return null;
  // Owned Lily art first. Approved catalog emoji only when kind is not image; never vocab.pic or decorative leftovers.
  if(p.kind==='image')return p.pictureId===QuestionArt.id(w)&&QuestionArt.has(w)?{...p,signature:'image:'+p.pictureId}:null;
  if(p.kind&&p.kind!=='emoji')return null;if(typeof p.glyph!=='string'||!p.glyph)return null;
  const id=p.pictureId||QuestionArt.id(w);if(id&&QuestionArt.map&&QuestionArt.map.byId[id]!==w.id)return null;return {...p,kind:'emoji',pictureId:id,signature:'emoji:'+p.glyph};},
 pictureCandidates(item){const own=this.picture(item.word),seen=new Set(own?[own.signature]:[]);return this.words.filter(w=>{const p=this.picture(w);if(!p||w.id===item.word.id||seen.has(p.signature))return false;seen.add(p.signature);return true;});},
 typeAllowed(item,type){return !['pic2spell','spell2pic'].includes(type)||!!this.picture(item.word)&&(type!=='spell2pic'||this.pictureCandidates(item).length>=2);},
 pick(lessons,avoidId,type){const now=Date.now();const L=Save.data.leitner;
  const eligible=this.items.filter(it=>this.typeAllowed(it,type));const pool=eligible.filter(it=>it.id!==avoidId);if(!pool.length)pool.push(...eligible);if(!pool.length)return null;
  const inStage=pool.filter(it=>lessons.includes(it.word.lesson));
  const missed=pool.filter(it=>L[it.id]&&L[it.id].miss>0);
  const due=pool.filter(it=>L[it.id]&&L[it.id].due<=now);
  const fresh=inStage.filter(it=>!L[it.id]);const freshAll=pool.filter(it=>!L[it.id]);
  const r=Math.random();let src;
  if(r<0.3&&missed.length)src=missed;else if(r<0.9&&due.length)src=due.filter(it=>lessons.includes(it.word.lesson)).length&&Math.random()<0.7?due.filter(it=>lessons.includes(it.word.lesson)):due;
  else if(fresh.length)src=fresh;else if(freshAll.length)src=freshAll;
  if(!src||!src.length)src=fresh.length?fresh:(inStage.length?inStage:pool);
  return src[Math.floor(Math.random()*src.length)];},
 record(item,ok,chosenTone){const L=Save.data.leitner;const s=L[item.id]||(L[item.id]={box:1,due:0,miss:0,seen:0,correct:0,wrong:0});
  s.seen++;s.last=Date.now();if(ok){s.correct++;if(s.miss>0)s.miss--;s.box=Math.min(5,s.box+1);}else{s.wrong++;s.miss=2;s.box=1;s.lastWrong=Date.now();if(chosenTone)s.lastChosen=chosenTone;}
  s.due=Date.now()+BOX_MS[s.box];
  if(chosenTone&&!(!ok&&chosenTone===item.tone)){const k=item.tone+'>'+chosenTone;Save.data.toneStats[k]=(Save.data.toneStats[k]||0)+1;}},
 toneAt(w,i){const t=w.tones[Math.min(i,w.tones.length-1)];return t>0?t:null;},
 // spell2pic distractors: prefer words whose tone at the target syllable differs, so a wrong pick is a real tone confusion
 toneDistractPics(item,n){const others=this.pictureCandidates(item);Phaser.Utils.Array.Shuffle(others);
  const score=w=>{const t=this.toneAt(w,item.syl);return(t&&t!==item.tone?2:0)+(w.zhuyin.length===item.word.zhuyin.length?1:0);};
  others.sort((a,b)=>score(b)-score(a));return others.slice(0,n);},
 distractPics(item,n){const others=this.pictureCandidates(item);Phaser.Utils.Array.Shuffle(others);return others.slice(0,n);}};
