window.addEventListener('error',e=>{window.__errs=(window.__errs||[]);window.__errs.push(String(e.message));});
const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',backgroundColor:'#2b1f45',width:W,height:H,
 scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},input:{activePointers:2},
 scene:[Boot,Start,Creator,MapScene,Battle,Home,Book,Report]});
window.__game=game;
