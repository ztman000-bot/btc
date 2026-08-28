/* BTC Hedge Assistant v8.22.4 - Scanner connectivity + TOP10 recovery */
(()=>{
'use strict';
if(window.__BTC_SCANNER_HOTFIX_8224)return;
window.__BTC_SCANNER_HOTFIX_8224=true;
const VERSION='8.22.4';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const finite=v=>Number.isFinite(Number(v));
async function fetchJson(url,timeout=8500){
  const ctrl=new AbortController();
  const tm=setTimeout(()=>ctrl.abort(),timeout);
  try{
    const res=await fetch(url,{cache:'no-store',signal:ctrl.signal,headers:{Accept:'application/json'}});
    if(!res.ok)throw new Error('HTTP '+res.status);
    return await res.json();
  }finally{clearTimeout(tm)}
}
function convBinance(a){
  if(!Array.isArray(a))return [];
  return a.map(x=>[+x[0],+x[1],+x[2],+x[3],+x[4],+x[5]])
    .filter(x=>x.slice(0,6).every(Number.isFinite));
}
function convBybit(a){
  if(!Array.isArray(a))return [];
  return a.map(x=>[+x[0],+x[1],+x[2],+x[3],+x[4],+x[5]])
    .filter(x=>x.slice(0,6).every(Number.isFinite))
    .sort((a,b)=>a[0]-b[0]);
}
async function binanceFutures(symbol,trace){
  const hosts=['https://fapi.binance.com','https://fapi1.binance.com','https://fapi2.binance.com','https://fapi3.binance.com'];
  const q=encodeURIComponent(symbol);
  let lastErr=null;
  for(const host of hosts){
    try{
      trace.push('Binance Futures 시도: '+host.replace('https://',''));
      const base='/fapi/v1';
      const [ticker,m15,h1,h4,d1,w1]=await Promise.all([
        fetchJson(`${host}${base}/ticker/24hr?symbol=${q}`),
        fetchJson(`${host}${base}/klines?symbol=${q}&interval=15m&limit=500`),
        fetchJson(`${host}${base}/klines?symbol=${q}&interval=1h&limit=500`),
        fetchJson(`${host}${base}/klines?symbol=${q}&interval=4h&limit=500`),
        fetchJson(`${host}${base}/klines?symbol=${q}&interval=1d&limit=500`),
        fetchJson(`${host}${base}/klines?symbol=${q}&interval=1w&limit=500`)
      ]);
      const rows={m15:convBinance(m15),h1:convBinance(h1),h4:convBinance(h4),d1:convBinance(d1),w1:convBinance(w1)};
      const price=Number(ticker?.lastPrice),change=Number(ticker?.priceChangePercent);
      if(!finite(price)||rows.m15.length<60||rows.h1.length<80||rows.h4.length<60||rows.d1.length<120||rows.w1.length<120)throw new Error('응답 검증 실패');
      trace.push(`✓ Binance Futures 성공 · 15M ${rows.m15.length} / 1H ${rows.h1.length} / 4H ${rows.h4.length} / 1D ${rows.d1.length} / 1W ${rows.w1.length}`);
      return {symbol,price,change:finite(change)?change:0,...rows,source:'Binance Futures Multi-Endpoint',trace,cryptoHost:host,generatedAt:new Date().toISOString()};
    }catch(e){lastErr=e;trace.push('× Binance Futures 실패: '+host.replace('https://','')+' · '+(e.name==='AbortError'?'timeout':e.message))}
  }
  throw lastErr||new Error('Binance Futures 전체 실패');
}
async function bybitLinear(symbol,trace){
  const host='https://api.bybit.com',q=encodeURIComponent(symbol);
  const endpoint=(interval)=>`${host}/v5/market/kline?category=linear&symbol=${q}&interval=${interval}&limit=500`;
  trace.push('Bybit Linear 보조경로 시도');
  const [ticker,m15,h1,h4,d1,w1]=await Promise.all([
    fetchJson(`${host}/v5/market/tickers?category=linear&symbol=${q}`),
    fetchJson(endpoint('15')),fetchJson(endpoint('60')),fetchJson(endpoint('240')),fetchJson(endpoint('D')),fetchJson(endpoint('W'))
  ]);
  const t=ticker?.result?.list?.[0]||{};
  const rows={m15:convBybit(m15?.result?.list),h1:convBybit(h1?.result?.list),h4:convBybit(h4?.result?.list),d1:convBybit(d1?.result?.list),w1:convBybit(w1?.result?.list)};
  const price=Number(t.lastPrice),change=Number(t.price24hPcnt)*100;
  if(!finite(price)||rows.m15.length<60||rows.h1.length<80||rows.h4.length<60||rows.d1.length<120||rows.w1.length<120)throw new Error('Bybit 응답 검증 실패');
  trace.push(`✓ Bybit 보조경로 성공 · 15M ${rows.m15.length} / 1H ${rows.h1.length} / 4H ${rows.h4.length} / 1D ${rows.d1.length} / 1W ${rows.w1.length}`);
  return {symbol,price,change:finite(change)?change:0,...rows,source:'Bybit Linear Fallback',trace,cryptoHost:host,generatedAt:new Date().toISOString()};
}
async function patchedCryptoScanner(symbol){
  symbol=String(symbol||'BTCUSDT').toUpperCase().replace(/[^A-Z0-9]/g,'');
  const trace=[`코인 데이터 요청: ${symbol}`];
  try{return await binanceFutures(symbol,trace)}catch(e){trace.push('Binance Futures 전체 실패 → 독립 보조소스 전환')}
  try{return await bybitLinear(symbol,trace)}catch(e){trace.push('× Bybit 보조경로 실패 · '+(e.name==='AbortError'?'timeout':e.message))}
  const cached=window.scannerCache?.['crypto:'+symbol];
  if(cached?.price&&cached?.m15?.length&&cached?.h1?.length&&cached?.h4?.length&&cached?.d1?.length&&cached?.w1?.length){
    trace.push('⚠ 네트워크 전체 실패 · 현재 세션의 직전 성공 데이터 사용');
    return {...cached,source:'Session Cache Fallback',trace,isStale:true,generatedAt:cached.generatedAt||null};
  }
  const err=new Error('코인 데이터 연결 실패 · Binance Futures/Bybit 모두 사용 불가');
  err.cryptoTrace=trace;throw err;
}
function patchScanner(){
  if(typeof window.analyzeScannerSymbol!=='function'||typeof window.fetchCryptoScanner!=='function')return false;
  window.fetchCryptoScanner=patchedCryptoScanner;
  window.BTCScannerHotfix={version:VERSION,fetchCryptoScanner:patchedCryptoScanner};
  return true;
}
function addTop10Button(){
  const scanner=document.getElementById('scanner');
  if(!scanner||document.getElementById('v8224Top10Btn'))return false;
  const anchor=scanner.querySelector('.card')||scanner.firstElementChild;
  if(!anchor)return false;
  const wrap=document.createElement('div');
  wrap.id='v8224Top10Wrap';
  wrap.style.cssText='display:flex;gap:7px;margin:0 0 9px;';
  const btn=document.createElement('button');
  btn.id='v8224Top10Btn';btn.type='button';btn.textContent='🏆 좋은 매매위치 TOP10';
  btn.style.cssText='width:100%;background:#142b46;border-color:#45678d;font-weight:850;';
  btn.addEventListener('click',()=>{
    if(window.BTCAutoTop10?.open)return window.BTCAutoTop10.open();
    alert('TOP10 모듈을 불러오는 중입니다. 잠시 후 다시 눌러주세요.');
  });
  wrap.appendChild(btn);anchor.parentNode.insertBefore(wrap,anchor);return true;
}
function addConnectionLabel(){
  const box=document.getElementById('v81ConnDiag');
  if(!box||document.getElementById('v8224ConnHint'))return;
  const hint=document.createElement('div');hint.id='v8224ConnHint';hint.className='tiny';hint.style.marginTop='5px';
  hint.textContent='v8.22.4 연결 보호: Binance Futures → Bybit 자동 대체';box.insertAdjacentElement('afterend',hint);
}
async function init(){
  for(let i=0;i<60&&!patchScanner();i++)await sleep(250);
  for(let i=0;i<40&&!addTop10Button();i++)await sleep(250);
  addConnectionLabel();
  new MutationObserver(()=>{patchScanner();addTop10Button();addConnectionLabel()}).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
