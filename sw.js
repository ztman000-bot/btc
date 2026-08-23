const C='btc-hedge-v8-6-5-20260823';
const SCRIPTS=['learning.js','updater.js','dailybrief.js','dailybrief-fix.js','v850-shell.js','strategy-lab.js','globalbrief.js'];
const JSONS=['/data/daily/brief.json','/data/daily/global.json'];
// Minimal install: never fail because a precache request was rate-limited.
self.addEventListener('install',e=>{e.waitUntil(caches.open(C))});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))]))});
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting()});
async function injectEnhancements(r){
 if(!r)return r;const ct=r.headers.get('content-type')||'';if(!ct.includes('text/html'))return r;
 let t=await r.text();
 t=t.replace(/BTC Hedge Assistant v8\.(?:3\.[123]|4\.[0-2]|5\.[0-3]|6\.[0-5])/g,'BTC Hedge Assistant v8.6.5');
 for(const v of ['V8.3.1','V8.3.2','V8.3.3','V8.4.0','V8.4.1','V8.4.2','V8.5.0','V8.5.1','V8.5.2','V8.5.3','V8.6.0','V8.6.1','V8.6.2','V8.6.3','V8.6.4'])t=t.replaceAll(v,'V8.6.5');
 for(const n of SCRIPTS.map(x=>x.replace('.js',''))){t=t.replace(new RegExp(n+'\\.js\\?v=\\d+','g'),n+'.js?v=865');if(!t.includes(n+'.js?v=865'))t=t.replace('</body>','<script src="./'+n+'.js?v=865" defer></script></body>')}
 return new Response(t,{status:r.status,statusText:r.statusText,headers:r.headers});
}
async function cacheFirst(req){const c=await caches.open(C);const hit=await c.match(req);if(hit)return hit;try{const r=await fetch(req,{cache:'no-cache'});if(r&&r.ok)c.put(req,r.clone());return r}catch(e){return hit||Response.error()}}
async function navigation(req){const c=await caches.open(C);try{const r=await fetch(req,{cache:'no-cache'});if(r&&r.ok)c.put('./index.html',r.clone());return injectEnhancements(r)}catch(e){const hit=await c.match('./index.html')||await caches.match('./index.html');return hit?injectEnhancements(hit):Response.error()}}
async function dataCache(req){const c=await caches.open(C);const hit=await c.match(req);if(hit)return hit;try{const r=await fetch(req,{cache:'no-cache'});if(r&&r.ok)c.put(req,r.clone());return r}catch(e){return Response.error()}}
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url),isDoc=e.request.mode==='navigate'||e.request.destination==='document';
 if(isDoc){e.respondWith(navigation(e.request));return}
 if(SCRIPTS.some(n=>u.pathname.endsWith('/'+n))||u.pathname.endsWith('.png')||u.pathname.endsWith('.webmanifest')){e.respondWith(cacheFirst(e.request));return}
 if(JSONS.some(p=>u.pathname.endsWith(p))){e.respondWith(dataCache(e.request));return}
 e.respondWith(cacheFirst(e.request));
});
