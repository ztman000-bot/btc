const CACHE='btc-hedge-v1';
const ASSETS=['./','./index.html','./manifest.json','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('fetch',e=>{
  if(e.request.url.includes('api.binance.com')) return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
