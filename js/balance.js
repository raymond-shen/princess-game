// Batch 13: all tunable economy/wave/combat values live here; no saved-currency migration.
const BALANCE={version:'b13',coins:{start:20,build:20,upgrade:30,kill:5,boss:20,correct:3},hearts:10,waves:3,waveBaseCount:4,waveCountCap:6,spawnStartMs:3200,spawnStepMs:200,spawnMinMs:2200,spawnStageCap:4,maxAlive:5,breakMs:6000,quizSlow:.25,leak:1,bossLeak:3,assist:{afterDefeats:2,coins:20,speedMul:.85},monster:{hpBase:11,hpPerStage:1,hpStageCap:4,bossHP:36,speedBase:65,speedPerStage:2,speedStageCap:4,bossSpeed:40},path:[[0,250],[200,250],[260,420],[480,440],[540,250],[760,250],[800,470],[900,520]],slots:[[180,370],[380,330],[420,560],[640,360],[700,560],[900,360]],heroPos:[800,665],towers:{
 flower:{e:'🌸',name:'花花塔',desc:'變慢',color:0xff9ec4,lv:[{dmg:1,rate:1300,range:230,slowMul:0.45,slowMs:1500},{dmg:2,rate:1050,range:270,slowMul:0.3,slowMs:2200}]},
 star:{e:'⭐',name:'星星塔',desc:'超痛',color:0xffd54f,lv:[{dmg:2,rate:1500,range:260},{dmg:4,rate:1200,range:310}]},
 bubble:{e:'🫧',name:'泡泡塔',desc:'一群',color:0x80deea,lv:[{dmg:1,rate:1700,range:230,splash:95},{dmg:2,rate:1400,range:270,splash:130}]}},heroes:{
 warrior:{icon:'⚔️',range:200,dmg:2,rate:1300,kind:'melee'},
 archer:{icon:'🏹',range:480,dmg:1,rate:850,kind:'arrow'},
 magician:{icon:'⭐',range:340,dmg:1,rate:1500,kind:'chain',chain:3,chainR:170}}};
if(typeof module!=='undefined')module.exports=BALANCE;
