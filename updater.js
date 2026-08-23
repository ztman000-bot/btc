/* BTC Hedge Assistant v8.6.7 - stable boot, no repeated updater loop */
(()=>{
  'use strict';
  const VERSION='8.6.7';
  const patchVersion=()=>{
    try{document.title=`BTC Hedge Assistant v${VERSION}`}catch(e){}
    document.querySelectorAll('h1').forEach(h=>{if(/BTC Hedge Assistant/i.test(h.textContent||''))h.textContent=`BTC Hedge Assistant v${VERSION}`});
  };
  function removeLegacyToast(){
    const x=document.getElementById('btcUpdateToast');if(x)x.remove();
  }
  function ensureScript(id,src){
    if(document.getElementById(id)||[...document.scripts].some(s=>s.src&&s.src.includes(src.split('?')[0].replace('./',''))))return;
    const s=document.createElement('script');s.id=id;s.src=src;s.defer=true;document.body.appendChild(s);
  }
  function boot(){
    patchVersion();removeLegacyToast();
    ensureScript('btcStrategyLabStable','./strategy-lab.js?v=867');
    ensureScript('btcGlobalBriefStable','./globalbrief.js?v=867');
    // Legacy shell can repaint the heading after startup; repair only a few times, without reloads.
    [500,1500,3000,6000].forEach(ms=>setTimeout(()=>{patchVersion();removeLegacyToast()},ms));
  }
  // No service-worker registration/update, no SKIP_WAITING, no controllerchange reload.
  // The service worker itself handles cache freshness. This module never triggers a reload loop.
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.BTCUpdater={version:VERSION,check:()=>Promise.resolve(false),mode:'stable-no-reload'};
})();
