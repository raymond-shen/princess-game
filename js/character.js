// Layer renderer driven by data/character_manifest.json (spec v0.1 drawOrder, 1000x1100 canvas, origin 0,0).
const Char={m:null,
 layerFiles(sel){const m=this.m,rt=m.runtime||{dir:'',scale:1},T=m.fileTemplates;const L=[];
  const body=m.assets.find(a=>a.part==='body_safe_main');if(body&&body.file)L.push({key:'body_safe_main',file:body.file,order:40});
  const sub=(t)=>t.replace('{style}',sel.hair).replace('{color}',sel.hairColor).replace('{outfit}',sel.outfit);
  const add=(part,order)=>{if(T[part]){const f=sub(T[part]);const base=f.split('/').pop();L.push({key:'L_'+base,file:rt.dir?rt.dir+base:f,order});}};
  add('outfit_back',20);add('hair_back',30);add('outfit_main',60);add('outfit_front',65);add('hair_front',75);
  return L;},
 ensure(scene,sel,cb){const need=this.layerFiles(sel).filter(l=>!scene.textures.exists(l.key));
  if(!need.length){cb();return;}need.forEach(l=>scene.load.image(l.key,l.file));scene.load.once('complete',cb);scene.load.start();},
 // returns container; origin at feet (500,1000 canvas) ; h = displayed height of 1100 canvas
 build(scene,x,y,h,sel,equipped){const m=this.m,rt=m.runtime||{scale:1};const c=scene.add.container(x,y);const s=h/1100;
  const P=(px,py)=>[(px-500)*s,(py-1000)*s];const parts=[];
  for(const l of this.layerFiles(sel)){if(!scene.textures.exists(l.key))continue;const im=scene.add.image(...P(0,0),l.key).setOrigin(0,0).setScale(s/rt.scale);parts.push([l.order,im]);}
  // handheld placeholder (vector) at grip anchor
  const job=m.jobs.find(j=>j.id===sel.job);if(job){const g=scene.add.graphics();const hh=job.handheld;
   if(hh==='sword'){const [gx,gy]=P(...m.anchorsPx.grip_screen_right);g.fillStyle(0xffd86b).fillRoundedRect(gx-4*s*10,gy-2*s*10,8*s*10,6*s*10,3);
    g.fillStyle(0xf8f4ff).lineStyle(3,0xb79be0).fillRoundedRect(gx-3*s*10,gy-26*s*10,6*s*10,24*s*10,6*s*5).strokeRoundedRect(gx-3*s*10,gy-26*s*10,6*s*10,24*s*10,6*s*5);
    g.fillStyle(0xff8fb8).fillCircle(gx,gy+3*s*10,2*s*10);}
   if(hh==='bow'){const [gx,gy]=P(...m.anchorsPx.grip_screen_left);g.lineStyle(Math.max(3,14*s),0xc98a4b).beginPath();g.arc(gx+8*s*10,gy,22*s*10,Math.PI*0.62,Math.PI*1.38);g.strokePath();
    g.lineStyle(2,0xfff3d6).lineBetween(gx-9*s*10,gy-19*s*10,gx-9*s*10,gy+19*s*10);g.fillStyle(0xff9ec4).fillCircle(gx-12*s*10,gy,2.2*s*10);}
   if(hh==='wand'){const [gx,gy]=P(...m.anchorsPx.grip_screen_right);g.lineStyle(Math.max(3,12*s),0xe9c46a).lineBetween(gx,gy+10*s*10,gx+8*s*10,gy-22*s*10);
    const t=scene.add.text(gx+8*s*10,gy-24*s*10,'⭐',{fontSize:Math.round(90*s)+'px'}).setOrigin(0.5);parts.push([96,t]);}
   parts.push([95,g]);}
  for(const id of(equipped||[])){const e=m.equipment.find(q=>q.id===id);if(!e)continue;const [ex,ey]=P(...e.posPx);
   const t=scene.add.text(ex,ey,e.emoji,{fontSize:Math.round(e.sizePx*s)+'px'}).setOrigin(0.5);if(e.slot==='wings_back')t.setAlpha(0.85);parts.push([e.drawOrder,t]);}
  if(!parts.some(p=>p[0]===60)){const g=scene.add.graphics();g.fillStyle(0xffc6dc).fillEllipse(0,-55*s*10,40*s*10,60*s*10);g.fillStyle(0xffe0c8).fillCircle(0,-80*s*10,14*s*10);parts.push([40,g]);}
  parts.sort((a,b)=>a[0]-b[0]).forEach(p=>c.add(p[1]));c.setSize(520*s,850*s);return c;}};
