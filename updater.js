/* BTC Hedge Assistant v8.21.0 - thin compatibility updater */
(function(){
'use strict';
if(window.__BTC_UPDATER_SINGLETON)return;
window.__BTC_UPDATER_SINGLETON=true;
const ID='btcCanonicalBootstrap';
function boot(){
  if(window.BTCBootstrap?.boot){window.BTCBootstrap.boot();return;}
  if(document.getElementById(ID))return;
  const s=document.createElement('script');
  s.id=ID;
  s.src='./version-guard.js?v=8210&ts='+Date.now();
  s.async=false;
  s.onerror=()=>{window.BTC_BOOTSTRAP_ERROR='canonical bootstrap load failed';window.BTC_DECISION_ALLOWED=false;console.error('[BTC updater] canonical bootstrap load failed')};
  document.head.appendChild(s);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.BTCUpdater={version:'8.21.0',mode:'thin-canonical-bootstrap',check:()=>Promise.resolve(false),boot};
})();