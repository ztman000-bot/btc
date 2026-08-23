const C='btc-hedge-v8-6-1-20260823',A=['./','./index.html','./learning.js','./updater.js','./dailybrief.js','./dailybrief-fix.js','./v850-shell.js','./strategy-lab.js','./globalbrief.js','./data/daily/brief.json','./data/daily/global.json','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(A)))});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))]))});
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting()});
async function injectEnhancements(r){
 if(!r)return r;const ct=r.headers.get('content-type')||'';if(!ct.includes('text/html'))return r;
 let t=await r.text();
 t=t.replace(/BTC Hedge Assistant v8\.(?:3\.[123]|4\.[0-2]|5\.[0-3]|6\.[01])/g,'BTC Hedge Assistant v8.6.1');
 for(const v of ['V8.3.1','V8.3.2','V8.3.3','V8.4.0','V8.4.1','V8.4.2','V8.5.0','V8.5.1','V8.5.2','V8.5.3','V8.6.0'])t=t.replaceAll(v,'V8.6.1');
 for(const n of ['learning','updater','dailybrief','dailybrief-fix','v850-shell','strategy-lab','globalbrief']){t=t.replace(new RegExp(n+'\\.js\\?v=\\d+','g'),n+'.js?v=861');if(!t.includes(n+'.js?v=861'))t=t.replace('</body>','<script src="./'+n+'.js?v=861" defer></script></body>')}
 return new Response(t,{status:r.status,statusText:r.statusText,headers:r.headers});
}
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const isDoc=e.request.mode==='navigate'||e.request.destination==='document';if(isDoc){e.respondWith((async()=>{try{const net=await fetch(e.request,{cache:'no-store'});const out=await injectEnhancements(net);const cp=out.clone();caches.open(C).then(c=>c.put(e.request,cp));return out}catch(err){const cached=await caches.match(e.request)||await caches.match('./index.html');return cached?injectEnhancements(cached):Response.error()}})());return}const fresh=e.request.destination==='script'||e.request.url.includes('/data/daily/brief.json')||e.request.url.includes('/data/daily/global.json');e.respondWith(fetch(e.request,{cache:fresh?'no-store':'default'}).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request)))});