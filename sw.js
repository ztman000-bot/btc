const C='btc-hedge-v8-6-3-20260823';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const SCRIPTS=['learning.js','updater.js','dailybrief.js','dailybrief-fix.js','v850-shell.js','strategy-lab.js','globalbrief.js'];
const JSONS=['/data/daily/brief.json','/data/daily/global.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)))});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))]))});
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting()});
async function injectEnhancements(r){
 if(!r)return r;const ct=r.headers.get('content-type')||'';if(!ct.includes('text/html'))return r;
 let t=await r.text();
 t=t.replace(/BTC Hedge Assistant v8\.(?:3\.[123]|4\.[0-2]|5\.[0-3]|6\.[0-3])/g,'BTC Hedge Assistant v8.6.3');
 for(const v of ['V8.3.1','V8.3.2','V8.3.3','V8.4.0','V8.4.1','V8.4.2','V8.5.0','V8.5.1','V8.5.2','V8.5.3','V8.6.0','V8.6.1','V8.6.2'])t=t.replaceAll(v,'V8.6.3');
 for(const n of ['learning','updater','dailybrief','dailybrief-fix','v850-shell','strategy-lab','globalbrief']){t=t.replace(new RegExp(n+'\\.js\\?v=\\d+','g'),n+'.js?v=863');if(!t.includes(n+'.js?v=863'))t=t.replace('</body>','<script src="./'+n+'.js?v=863" defer></script></body>')}
 return new Response(t,{status:r.status,statusText:r.statusText,headers:r.headers});
}
async function cacheFirst(req){const c=await caches.open(C);const hit=await c.match(req);if(hit)return hit;const r=await fetch(req);if(r&&r.ok)c.put(req,r.clone());return r}
async function networkFirst(req){const c=await caches.open(C);try{const r=await fetch(req);if(r&&r.ok)c.put(req,r.clone());return r}catch(e){return await c.match(req)||Response.error()}}
async function staleWhileRevalidate(req){const c=await caches.open(C);const hit=await c.match(req);const p=fetch(req).then(r=>{if(r&&r.ok)c.put(req,r.clone());return r}).catch(()=>null);return hit||await p||Response.error()}
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);const isDoc=e.request.mode==='navigate'||e.request.destination==='document';
 if(isDoc){e.respondWith((async()=>{const raw=await networkFirst(e.request);return injectEnhancements(raw)})());return}
 if(SCRIPTS.some(n=>u.pathname.endsWith('/'+n))||u.pathname.endsWith('.png')||u.pathname.endsWith('.webmanifest')){e.respondWith(cacheFirst(e.request));return}
 if(JSONS.some(p=>u.pathname.endsWith(p))){e.respondWith(staleWhileRevalidate(e.request));return}
 e.respondWith(cacheFirst(e.request));
});
