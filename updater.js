/* BTC Hedge Assistant v8.9.0 - stable boot / canonical version + hybrid hedge */
(()=>{
'use strict';
const VERSION='8.9.0';
function patchVersion(){try{document.title=`BTC Hedge Assistant v${VERSION}`}catch(e){}document.querySelectorAll('h1').forEach(h=>{if(/BTC Hedge Assistant/i.test(h.textContent||''))h.textContent=`BTC Hedge Assistant v${VERSION}`})}
function removeLegacyToast(){document.getElementById('btcUpdateToast')?.remove()}
function ensureScript(id,src){if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;s.defer=true;document.body.appendChild(s)}
function boot(){
 patchVersion();removeLegacyToast();window.BTC_APP_VERSION=VERSION;
 ensureScript('btcVersionGuard890','./version-guard.js?v=890');
 ensureScript('btcGlobalBrief868','./globalbrief-v868.js?v=890');
 ensureScript('btcAutoTop10872','./auto-top10.js?v=890');
 ensureScript('btcTop10History873','./top10-history.js?v=890');
 ensureScript('btcOpportunityV2881','./opportunity-v2.js?v=890');
 ensureScript('btcSmartSession882','./smart-session.js?v=890');
 ensureScript('btcDynamicHedge890','./dynamic-hedge.js?v=890');
 [300,800,1500,3000,6000,10000].forEach(ms=>setTimeout(()=>{patchVersion();removeLegacyToast();window.BTCVersionGuard?.patch?.()},ms));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.BTCUpdater={version:VERSION,check:()=>Promise.resolve(false),mode:'stable-no-reload'};
})();
