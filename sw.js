const C='btc-hedge-v8-6-7-20260823';
const APP_SCRIPTS=['learning.js','updater.js','dailybrief.js','dailybrief-fix.js','v850-shell.js','strategy-lab.js','globalbrief.js'];
const JSONS=['/data/daily/brief.json','/data/daily/global.json'];

self.addEventListener('install',e=>{
  // One controlled takeover is intentional for the rescue release.
  self.skipWaiting();
  e.waitUntil(caches.open(C));
});

self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    // Remove every legacy BTC Hedge cache. Old cached updater.js was the source of the reload loop.
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('btc-hedge-')&&k!==C).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

async function networkFirst(req){
  const cache=await caches.open(C);
  try{
    const r=await fetch(req,{cache:'no-store'});
    if(r&&r.ok)cache.put(req,r.clone());
    return r;
  }catch(e){
    return await cache.match(req)||Response.error();
  }
}

async function cacheFirst(req){
  const cache=await caches.open(C);
  const hit=await cache.match(req);
  if(hit)return hit;
  try{const r=await fetch(req);if(r&&r.ok)cache.put(req,r.clone());return r}catch(e){return Response.error()}
}

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  const isDoc=e.request.mode==='navigate'||e.request.destination==='document';
  if(isDoc){e.respondWith(networkFirst(e.request));return;}
  if(APP_SCRIPTS.some(n=>u.pathname.endsWith('/'+n))){e.respondWith(networkFirst(e.request));return;}
  if(JSONS.some(p=>u.pathname.endsWith(p))){e.respondWith(networkFirst(e.request));return;}
  e.respondWith(cacheFirst(e.request));
});
