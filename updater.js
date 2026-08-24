/* BTC Hedge Assistant v8.7.2 - stable boot / canonical version + sidecars */
(()=>{
'use strict';
const VERSION='8.7.2';
function patchVersion(){try{document.title=`BTC Hedge Assistant v${VERSION}`}catch(e){}document.querySelectorAll('h1').forEach(h=>{if(/BTC Hedge Assistant/i.test(h.textContent||''))h.textContent=`BTC Hedge Assistant v${VERSION}`})}
function removeLegacyToast(){document.getElementById('btcUpdateToast')?.remove()}
function ensureScript(id,src){if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;s.defer=true;document.body.appendChild(s)}
function boot(){
 patchVersion();removeLegacyToast();window.BTC_APP_VERSION=VERSION;
 ensureScript('btcVersionGuard872','./version-guard.js?v=872');
 ensureScript('btcGlobalBrief868','./globalbrief-v868.js?v=872');
 ensureScript('btcAutoTop10872','./auto-top10.js?v=872');
 [300,800,1500,3000,6000,10000].forEach(ms=>setTimeout(()=>{patchVersion();removeLegacyToast();window.BTCVersionGuard?.patch?.()},ms));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.BTCUpdater={version:VERSION,check:()=>Promise.resolve(false),mode:'stable-no-reload'};
})();
