/* BTC Hedge Assistant v8.6.6 - stable launch / no live service-worker switching */
(()=>{
  'use strict';
  const VERSION='8.6.6';
  const patchVersion=()=>{
    try{document.title=`BTC Hedge Assistant v${VERSION}`}catch(e){}
    document.querySelectorAll('h1').forEach(h=>{if(/BTC Hedge Assistant/i.test(h.textContent||''))h.textContent=`BTC Hedge Assistant v${VERSION}`});
  };
  function ensureScript(id,src){
    if(document.getElementById(id)||[...document.scripts].some(s=>s.src&&s.src.includes(src.split('?')[0].replace('./',''))))return;
    const s=document.createElement('script');s.id=id;s.src=src;s.defer=true;document.body.appendChild(s);
  }
  function boot(){
    // Do not register/update/activate service workers here. The currently running app remains stable for the whole session.
    // New program files are picked up naturally on a later browser/app start.
    ensureScript('btcStrategyLabStable','./strategy-lab.js?v=866');
    ensureScript('btcGlobalBriefStable','./globalbrief.js?v=866');
    patchVersion();
    // Legacy shell may rewrite the heading once during initialization; correct it once after boot and then leave it alone.
    setTimeout(patchVersion,3000);
    const old=document.getElementById('btcUpdateToast');if(old)old.remove();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.BTCUpdater={version:VERSION,check:()=>Promise.resolve(false),mode:'launch-stable'};
})();
