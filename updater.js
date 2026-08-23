/* BTC Hedge Assistant v8.6.2 - service worker update helper / low-request mode */
(()=>{
  'use strict';
  const CHECK_MS=30*60*1000;
  const KEY='btc_update_notice_v862';
  let reloading=false,checking=false;
  const lastCheck=()=>Number(localStorage.getItem(KEY)||0);
  function toast(msg,action){
    let box=document.getElementById('btcUpdateToast');
    if(!box){box=document.createElement('div');box.id='btcUpdateToast';box.style.cssText='position:fixed;left:12px;right:12px;bottom:86px;z-index:9999;background:#102033;border:1px solid #3d5d85;border-radius:12px;padding:10px 12px;color:#eef2f7;box-shadow:0 8px 30px #0008;font:13px system-ui';document.body.appendChild(box)}
    box.innerHTML=`<div style="display:flex;gap:8px;align-items:center;justify-content:space-between"><span>${msg}</span>${action?'<button id="btcUpdateNow" style="width:auto;padding:7px 10px;background:#2767df;color:white;border:1px solid #4e83e4;border-radius:9px;font-weight:800">지금 업데이트</button>':''}</div>`;
    if(action)document.getElementById('btcUpdateNow')?.addEventListener('click',action,{once:true});
  }
  async function activateWaiting(reg){if(!reg?.waiting)return false;toast('새 버전이 준비되었습니다.',()=>{try{reg.waiting.postMessage({type:'SKIP_WAITING'})}catch(e){};setTimeout(()=>location.reload(),700)});return true}
  async function check(force=false){
    if(!('serviceWorker'in navigator)||checking)return;
    if(!force&&Date.now()-lastCheck()<CHECK_MS)return;
    checking=true;
    try{const reg=await navigator.serviceWorker.getRegistration();if(!reg)return;await reg.update();localStorage.setItem(KEY,String(Date.now()));if(await activateWaiting(reg))return;if(reg.installing)reg.installing.addEventListener('statechange',()=>{if(reg.waiting)activateWaiting(reg)})}
    catch(e){console.warn('update check failed',e)}finally{checking=false}
  }
  navigator.serviceWorker?.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;location.reload()});
  window.addEventListener('online',()=>check(false));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check(false)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>check(false),2500));else setTimeout(()=>check(false),2500);
  setInterval(()=>check(false),CHECK_MS);
  window.BTCUpdater={check:()=>check(true)};
})();
