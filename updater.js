/* BTC Hedge Assistant v8.7.1 - stable boot / canonical version + sidecars */
(()=>{
'use strict';
const VERSION='8.7.1';
function patchVersion(){try{document.title=`BTC Hedge Assistant v${VERSION}`}catch(e){}document.querySelectorAll('h1').forEach(h=>{if(/BTC Hedge Assistant/i.test(h.textContent||''))h.textContent=`BTC Hedge Assistant v${VERSION}`})}
function removeLegacyToast(){document.getElementById('btcUpdateToast')?.remove()}
function ensureScript(id,src){if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;s.defer=true;document.body.appendChild(s)}
function boot(){
 patchVersion();removeLegacyToast();window.BTC_APP_VERSION=VERSION;
 ensureScript('btcVersionGuard871','./version-guard.js?v=871');
 ensureScript('btcGlobalBrief868','./globalbrief-v868.js?v=871');
 ensureScript('btcAutoTop10871','./auto-top10.js?v=871');
 [300,800,1500,3000,6000,10000].forEach(ms=>setTimeout(()=>{patchVersion();removeLegacyToast();window.BTCVersionGuard?.patch?.()},ms));
}
// No automatic reload loop. New code is picked up by the network-first service worker.
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.BTCUpdater={version:VERSION,check:()=>Promise.resolve(false),mode:'stable-no-reload'};
})();
