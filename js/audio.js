// Audio: zh-TW Web Speech + WebAudio chimes. Must be unlocked by a tap (iOS).
const Sound={ctx:null,voice:null,unlocked:false,
 unlock(){try{if(!this.ctx){const C=window.AudioContext||window.webkitAudioContext;this.ctx=new C();}
  const b=this.ctx.createBuffer(1,1,22050),s=this.ctx.createBufferSource();s.buffer=b;s.connect(this.ctx.destination);s.start(0);
  if(this.ctx.state!=='running')this.ctx.resume();}catch(e){}
  try{if(window.speechSynthesis){const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u);}}catch(e){}
  this.pickVoice();this.unlocked=true;},
 pickVoice(){if(!window.speechSynthesis)return;const vs=speechSynthesis.getVoices();
  this.voice=vs.find(v=>/zh[-_]TW/i.test(v.lang))||vs.find(v=>/zh[-_]HK/i.test(v.lang))||vs.find(v=>/^zh/i.test(v.lang))||null;},
 say(text,rate){try{if(!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);
  u.lang='zh-TW';if(this.voice)u.voice=this.voice;u.rate=rate||0.8;u.pitch=1.15;speechSynthesis.speak(u);}catch(e){}},
 tone(freq,t0,dur,type,vol){if(!this.ctx)return;const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.value=freq;
  const st=c.currentTime+t0;g.gain.setValueAtTime(0.0001,st);g.gain.exponentialRampToValueAtTime(vol||0.25,st+0.02);g.gain.exponentialRampToValueAtTime(0.0001,st+dur);
  o.connect(g);g.connect(c.destination);o.start(st);o.stop(st+dur+0.05);},
 chime(step){const base=523.25*Math.pow(2,Math.min(step,8)/12);[0,4,7,12].forEach((s,i)=>this.tone(base*Math.pow(2,s/12),i*0.07,0.35,'triangle',0.2));},
 soft(){this.tone(330,0,0.25,'sine',0.12);this.tone(294,0.12,0.3,'sine',0.1);},
 hit(){this.tone(880,0,0.08,'square',0.06);this.tone(1320,0.03,0.12,'triangle',0.1);},
 pop(){this.tone(660,0,0.1,'sine',0.15);},
 fanfare(){[0,4,7,12,7,12,16].forEach((s,i)=>this.tone(523.25*Math.pow(2,s/12),i*0.12,0.3,'triangle',0.2));}};
if(window.speechSynthesis){speechSynthesis.onvoiceschanged=()=>Sound.pickVoice();}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Sound.ctx&&Sound.ctx.state!=='running')Sound.ctx.resume();});
