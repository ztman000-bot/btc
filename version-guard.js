/* BTC Hedge Assistant v8.7.2 - canonical version guard */
(()=>{
'use strict';
const VERSION='8.7.2';
let fixing=false;
function patch(){
 if(fixing)return;fixing=true;
 try{
  const title=`BTC Hedge Assistant v${VERSION}`;
  if(document.title!==title)document.title=title;
  document.querySelectorAll('h1').forEach(h=>{if(/BTC Hedge Assistant/i.test(h.textContent||'')&&h.textContent!==title)h.textContent=title});
  document.documentElement.dataset.btcAppVersion=VERSION;
  window.BTC_APP_VERSION=VERSION;
 }finally{fixing=false}
}
function boot(){
 patch();
 new MutationObserver(()=>patch()).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
 [250,600,1000,1800,3200,6000,10000].forEach(ms=>setTimeout(patch,ms));
 setInterval(patch,15000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.BTCVersionGuard={version:VERSION,patch};
})();
