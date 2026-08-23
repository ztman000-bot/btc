const C='btc-hedge-v8-3-3-20260823',A=['./','./index.html','./learning.js','./updater.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(A)))});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))]))});
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting()});
async function injectEnhancements(r){
  if(!r)return r;
  const ct=r.headers.get('content-type')||'';
  if(!ct.includes('text/html'))return r;
  let t=await r.text();
  t=t.replace('BTC Hedge Assistant v8.3.1','BTC Hedge Assistant v8.3.3').replace('BTC Hedge Assistant v8.3.2','BTC Hedge Assistant v8.3.3').replaceAll('V8.3.1','V8.3.3').replaceAll('V8.3.2','V8.3.3');
  if(!t.includes('learning.js'))t=t.replace('</body>','<script src="./learning.js?v=833" defer></script></body>');
  if(!t.includes('updater.js'))t=t.replace('</body>','<script src="./updater.js?v=833" defer></script></body>');
  return new Response(t,{status:r.status,statusText:r.statusText,headers:r.headers});
}
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const isDoc=e.request.mode==='navigate'||e.request.destination==='document';
  if(isDoc){
    e.respondWith((async()=>{
      try{const net=await fetch(e.request,{cache:'no-store'});const out=await injectEnhancements(net);const cp=out.clone();caches.open(C).then(c=>c.put(e.request,cp));return out}
      catch(err){const cached=await caches.match(e.request)||await caches.match('./index.html');return cached?injectEnhancements(cached):Response.error()}
    })());return;
  }
  e.respondWith(fetch(e.request,{cache:e.request.destination==='script'?'no-store':'default'}).then(r=>{let cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request)));
});
