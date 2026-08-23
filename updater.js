/* BTC Hedge Assistant v8.6.8 - stable boot / no reload loop */
(()=>{
'use strict';
const VERSION='8.6.8';
function patchVersion(){try{document.title=`BTC Hedge Assistant v${VERSION}`}catch(e){}document.querySelectorAll('h1').forEach(h=>{if(/BTC Hedge Assistant/i.test(h.textContent||''))h.textContent=`BTC Hedge Assistant v${VERSION}`})}
function removeLegacyToast(){document.getElementById('btcUpdateToast')?.remove()}
function ensureScript(id,src){if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;s.defer=true;document.body.appendChild(s)}
function boot(){
 patchVersion();removeLegacyToast();
 ensureScript('btcStrategyLab868','./strategy-lab.js?v=868');
 ensureScript('btcGlobalBrief868','./globalbrief-v868.js?v=868');
 [500,1500,3000,6000].forEach(ms=>setTimeout(()=>{patchVersion();removeLegacyToast()},ms));
}
// Deliberately no service-worker registration/update, no SKIP_WAITING and no reload.
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.BTCUpdater={version:VERSION,check:()=>Promise.resolve(false),mode:'stable-no-reload'};
})();
