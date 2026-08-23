/* BTC Hedge Assistant v8.6.5 - rescue bootstrap / launch-only updater */
(()=>{
  'use strict';
  const VERSION='8.6.5';
  let checking=false,reloading=false;
  const $=s=>document.querySelector(s);

  function patchVisibleVersion(){
    try{document.title=`BTC Hedge Assistant v${VERSION}`;}catch(e){}
    document.querySelectorAll('h1').forEach(h=>{if(/BTC Hedge Assistant/i.test(h.textContent||''))h.textContent=`BTC Hedge Assistant v${VERSION}`});
  }
  function toast(msg){
    let box=document.getElementById('btcUpdateToast');
    if(!box){box=document.createElement('div');box.id='btcUpdateToast';box.style.cssText='position:fixed;left:12px;right:12px;bottom:86px;z-index:9999;background:#102033;border:1px solid #3d5d85;border-radius:12px;padding:10px 12px;color:#eef2f7;box-shadow:0 8px 30px #0008;font:13px system-ui';document.body.appendChild(box)}
    box.textContent=msg;
  }
  function ensureScript(id,src){
    if(document.getElementById(id))return;
    const s=document.createElement('script');s.id=id;s.src=src;s.defer=true;document.body.appendChild(s);
  }
  function ensureModernModules(){
    ensureScript('btcStrategyLabRescue','./strategy-lab.js?v=865');
    ensureScript('btcGlobalBriefRescue','./globalbrief.js?v=865');
  }
  async function activate(reg){
    if(!reg?.waiting)return false;
    toast('새 버전을 적용하는 중입니다…');
    try{reg.waiting.postMessage({type:'SKIP_WAITING'})}catch(e){}
    return true;
  }
  async function checkOnce(){
    if(!('serviceWorker' in navigator)||checking)return;
    checking=true;
    try{
      // Change the SW script URL and bypass HTTP cache so a stale controller cannot pin old code.
      const reg=await navigator.serviceWorker.register('./sw.js?v=865',{scope:'./',updateViaCache:'none'});
      try{await reg.update()}catch(e){}
      if(await activate(reg))return;
      if(reg.installing){reg.installing.addEventListener('statechange',()=>{if(reg.waiting)activate(reg)})}
    }catch(e){console.warn('launch update check failed',e)}finally{checking=false}
  }
  navigator.serviceWorker?.addEventListener('controllerchange',()=>{
    if(reloading)return;reloading=true;location.reload();
  });
  function boot(){
    patchVisibleVersion();ensureModernModules();
    // v850-shell executes later in old documents and may overwrite the label, so repair it once more.
    setTimeout(patchVisibleVersion,800);setTimeout(patchVisibleVersion,2200);
    setTimeout(checkOnce,1400);
  }
  // No interval / online / visibility update checks: one check per page/app launch only.
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.BTCUpdater={check:checkOnce,version:VERSION};
})();
