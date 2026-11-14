const Build={id:window.BUILD,url(path){if(typeof path!=='string'||/^(data:|blob:)/.test(path))return path;const u=new URL(path,location.href);if(u.origin!==location.origin)return path;u.searchParams.set('v',this.id);return u.href;}};
window.__build=Build.id;
const originalFetch=window.fetch.bind(window);window.fetch=(input,init)=>originalFetch(typeof input==='string'?Build.url(input):input,init);
const originalAddFile=Phaser.Loader.LoaderPlugin.prototype.addFile;Phaser.Loader.LoaderPlugin.prototype.addFile=function(files){for(const f of Array.isArray(files)?files:[files])if(f&&typeof f.url==='string')f.url=Build.url(f.url);return originalAddFile.call(this,files);};
// No service worker is shipped. Remove a previous worker/cache only inside this game's scope.
if('serviceWorker'in navigator)navigator.serviceWorker.getRegistrations().then(rs=>{const scope=new URL('.',location.href).href;for(const r of rs)if(r.scope===scope)r.unregister();}).catch(()=>{});
const rotate=document.createElement('div');rotate.id='kx-rotate';rotate.innerHTML='<img id="kx-rotate-art" alt="" hidden><div class="kx-rotate-copy"><h2>把手機橫過來，一起守護城堡！</h2><p>橫向畫面會更大、更好點喔。</p></div>';document.body.appendChild(rotate);
const updateRotate=()=>{rotate.hidden=!(innerWidth<700&&innerHeight>innerWidth);if(typeof TdUI!=='undefined'&&TdUI.applyRotate)TdUI.applyRotate();};addEventListener('resize',updateRotate);addEventListener('orientationchange',updateRotate);updateRotate();
const badge=document.createElement('div');badge.id='kx-build';badge.textContent='v '+Build.id;badge.setAttribute('aria-label','遊戲版本 '+Build.id);document.body.appendChild(badge);
