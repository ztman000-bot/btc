const C='btc-hedge-v8-6-6-20260823';
const JSONS=['/data/daily/brief.json','/data/daily/global.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C))});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))]))});
async function networkFirst(req){const c=await caches.open(C);try{const r=await fetch(req,{cache:'no-cache'});if(r&&r.ok)c.put(req,r.clone());return r}catch(e){return await c.match(req)||await caches.match(req)||Response.error()}}
async function cacheFirst(req){const c=await caches.open(C);const hit=await c.match(req)||await caches.match(req);if(hit)return hit;try{const r=await fetch(req);if(r&&r.ok)c.put(req,r.clone());return r}catch(e){return Response.error()}}
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url),isDoc=e.request.mode==='navigate'||e.request.destination==='document';
 if(isDoc){e.respondWith(networkFirst(e.request));return}
 if(JSONS.some(p=>u.pathname.endsWith(p))){e.respondWith(cacheFirst(e.request));return}
 e.respondWith(cacheFirst(e.request));
});
