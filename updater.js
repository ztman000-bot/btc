/* BTC Hedge Assistant v8.9.1 - stable boot / current-position dual backtest */
(()=>{
'use strict';
const VERSION='8.9.1';
function patchVersion(){try{document.title=`BTC Hedge Assistant v${VERSION}`}catch(e){}document.querySelectorAll('h1').forEach(h=>{if(/BTC Hedge Assistant/i.test(h.textContent||''))h.textContent=`BTC Hedge Assistant v${VERSION}`})}
function removeLegacyToast(){document.getElementById('btcUpdateToast')?.remove()}
function ensureScript(id,src){if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;s.defer=true;document.body.appendChild(s)}
function boot(){patchVersion();removeLegacyToast();window.BTC_APP_VERSION=VERSION;ensureScript('btcVersionGuard891','./version-guard.js?v=891');ensureScript('btcGlobalBrief868','./globalbrief-v868.js?v=891');ensureScript('btcAutoTop10872','./auto-top10.js?v=891');ensureScript('btcTop10History873','./top10-history.js?v=891');ensureScript('btcOpportunityV2881','./opportunity-v2.js?v=891');ensureScript('btcSmartSession882','./smart-session.js?v=891');ensureScript('btcDynamicHedge891','./dynamic-hedge.js?v=891');[300,800,1500,3000,6000,10000].forEach(ms=>setTimeout(()=>{patchVersion();removeLegacyToast();window.BTCVersionGuard?.patch?.()},ms))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();window.BTCUpdater={version:VERSION,check:()=>Promise.resolve(false),mode:'stable-no-reload'};
})();