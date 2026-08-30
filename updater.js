/* BTC Hedge Assistant v8.25.0 - canonical version lock updater */
(function(){
'use strict';
if(window.__BTC_UPDATER_SINGLETON)return;
window.__BTC_UPDATER_SINGLETON=true;
const CANONICAL_VERSION='8.25.0';
const CONFIG_ID='btcCanonicalAppConfig';
const BOOT_ID='btcCanonicalBootstrap';

function applyVersion(){
  const v=window.BTC_APP_CONFIG?.version||CANONICAL_VERSION;
  window.BTC_APP_VERSION=v;
  document.documentElement.dataset.btcAppVersion=v;
  document.title='BTC Hedge Assistant v'+v;
  document.querySelectorAll('h1').forEach(h=>{
    if(/BTC Hedge Assistant/i.test(h.textContent||''))h.textContent='BTC Hedge Assistant v'+v;
  });
  return v;
}

function loadOnce(id,src){
  const existing=document.getElementById(id);
  if(existing)return Promise.resolve(existing);
  return new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.id=id;
    s.src=src;
    s.async=false;
    s.onload=()=>resolve(s);
    s.onerror=()=>reject(new Error('load failed: '+src));
    document.head.appendChild(s);
  });
}

async function boot(){
  try{
    // Lock a correct fallback immediately so legacy shells cannot temporarily
    // downgrade the visible version while app-config is still loading.
    window.BTC_APP_VERSION=CANONICAL_VERSION;
    applyVersion();

    if(!window.BTC_APP_CONFIG){
      await loadOnce(CONFIG_ID,'./app-config.js?v='+CANONICAL_VERSION+'&ts='+Date.now());
    }
    applyVersion();

    if(window.BTCBootstrap?.boot){
      await window.BTCBootstrap.boot();
    }else{
      await loadOnce(BOOT_ID,'./version-guard.js?v='+CANONICAL_VERSION+'&ts='+Date.now());
      await window.BTCBootstrap?.boot?.();
    }
    applyVersion();
  }catch(e){
    window.BTC_BOOTSTRAP_ERROR='canonical bootstrap load failed: '+String(e?.message||e);
    window.BTC_DECISION_ALLOWED=false;
    console.error('[BTC updater]',e);
  }
}

// Re-apply after every canonical config/bootstrap transition. This prevents
// older compatibility modules from writing their historical fallback version.
document.addEventListener('btc-app-config-ready',applyVersion);
document.addEventListener('btc-bootstrap-ready',applyVersion);
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>{applyVersion();boot();},{once:true});
}else{
  applyVersion();boot();
}

window.BTCUpdater={
  version:CANONICAL_VERSION,
  mode:'canonical-version-lock',
  canonicalVersion:CANONICAL_VERSION,
  check:()=>Promise.resolve(false),
  applyVersion,
  boot
};
})();
