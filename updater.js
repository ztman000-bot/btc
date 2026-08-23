/* BTC Hedge Assistant v8.6.3 - update once on app launch */
(()=>{
  'use strict';
  let checking=false,reloading=false;
  function toast(msg){
    let box=document.getElementById('btcUpdateToast');
    if(!box){box=document.createElement('div');box.id='btcUpdateToast';box.style.cssText='position:fixed;left:12px;right:12px;bottom:86px;z-index:9999;background:#102033;border:1px solid #3d5d85;border-radius:12px;padding:10px 12px;color:#eef2f7;box-shadow:0 8px 30px #0008;font:13px system-ui';document.body.appendChild(box)}
    box.textContent=msg;
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
      const reg=await navigator.serviceWorker.getRegistration();
      if(!reg)return;
      await reg.update();
      if(await activate(reg))return;
      if(reg.installing){
        reg.installing.addEventListener('statechange',()=>{if(reg.waiting)activate(reg)});
      }
    }catch(e){console.warn('launch update check failed',e)}finally{checking=false}
  }
  navigator.serviceWorker?.addEventListener('controllerchange',()=>{
    if(reloading)return;reloading=true;location.reload();
  });
  // Deliberately no interval, online, or visibility-change checks.
  // Program updates are checked exactly once when a new page/app session starts.
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(checkOnce,1200),{once:true});
  else setTimeout(checkOnce,1200);
  window.BTCUpdater={check:checkOnce};
})();
