/* BTC Hedge Assistant v8.22.3 - Scanner network hardening */
(()=>{
'use strict';
const VERSION='1.0.0';
const HOSTS=[
  'https://data-api.binance.vision',
  'https://api.binance.com',
  'https://api1.binance.com',
  'https://api2.binance.com',
  'https://api3.binance.com'
];
function timeoutFetch(url,ms=3500){
  const ctl=new AbortController();
  const t=setTimeout(()=>ctl.abort(),ms);
  return fetch(url,{cache:'no-store',signal:ctl.signal,mode:'cors'}).finally(()=>clearTimeout(t));
}
async function fetchOne(host,path){
  const r=await timeoutFetch(host+path,3500);
  if(!r.ok)throw new Error('HTTP '+r.status);
  return r.json();
}
async function fastCryptoFetchJson(path,trace,label){
  const started=Date.now();
  const attempts=HOSTS.map(host=>fetchOne(host,path).then(json=>({host,json})).catch(error=>Promise.reject({host,error})));
  try{
    const winner=await Promise.any(attempts);
    trace?.push(`✓ ${label}: ${winner.host.replace('https://','')} · ${Date.now()-started}ms`);
    return winner.json;
  }catch(group){
    const errs=Array.isArray(group?.errors)?group.errors:[];
    errs.slice(0,HOSTS.length).forEach(x=>trace?.push(`× ${label}: ${(x?.host||'unknown').replace('https://','')} · ${x?.error?.name==='AbortError'?'timeout':(x?.error?.message||'failed')}`));
    throw new Error(`${label} 전체 경로 실패 · ${Date.now()-started}ms`);
  }
}
function install(){
  // Classic-script global function bindings are mirrored on window; replacing the property
  // updates scanner calls without touching the large legacy index.html.
  window.cryptoFetchJson=fastCryptoFetchJson;
  window.BTCScannerNetworkFix={version:VERSION,hosts:[...HOSTS],fetchJson:fastCryptoFetchJson};
  document.documentElement.dataset.scannerNetworkFix=VERSION;
  document.dispatchEvent(new CustomEvent('btc-scanner-network-fix-ready',{detail:{version:VERSION}}));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();