/* BTC Hedge Assistant v8.23.7 - Fast Stock Relay */
(()=>{'use strict';
if(window.__BTC_STOCK_RELAY_FAST_8234__)return;
window.__BTC_STOCK_RELAY_FAST_8234__=true;
const V='8.23.7',TIMEOUT=5000;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function timeoutFetch(url,ms=TIMEOUT){
  const c=new AbortController();
  const t=setTimeout(()=>c.abort(),ms);
  return fetch(url,{cache:'no-store',signal:c.signal,headers:{Accept:'application/json'}})
    .then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()})
    .finally(()=>clearTimeout(t));
}
function valid(x,s){
  return !!(x&&x.symbol===s&&Array.isArray(x.m15)&&Array.isArray(x.h1)&&Array.isArray(x.d1)&&Array.isArray(x.w1)&&Number.isFinite(Number(x.price)));
}
function aggregate(rows,n){
  if(typeof window.aggregateRows==='function')return window.aggregateRows(rows,n);
  const out=[];
  for(let i=0;i<rows.length;i+=n){
    const g=rows.slice(i,i+n);if(!g.length)continue;
    out.push([g[0][0],g[0][1],Math.max(...g.map(x=>+x[2])),Math.min(...g.map(x=>+x[3])),g[g.length-1][4],g.reduce((s,x)=>s+(+x[5]||0),0)]);
  }
  return out;
}
async function relay(symbol){
  const enc=encodeURIComponent(symbol),stamp='v='+Date.now();
  const firstPath=(location.pathname.split('/').filter(Boolean)[0]||'btc');
  const urls=[
    `./data/stocks/${enc}.json?${stamp}`,
    `/${firstPath}/data/stocks/${enc}.json?${stamp}`,
    `https://raw.githubusercontent.com/ztman000-bot/btc/main/data/stocks/${enc}.json?${stamp}`
  ];
  const trace=['Stock Relay 고속 병렬탐색'];
  const attempts=urls.map(async url=>{
    try{
      const x=await timeoutFetch(url);
      if(!valid(x,symbol))throw new Error('JSON 검증 실패');
      const age=x.generatedAt?Math.max(0,(Date.now()-Date.parse(x.generatedAt))/60000):null;
      return {ok:true,url,x,age};
    }catch(e){return {ok:false,url,error:e};}
  });
  const pending=new Set(attempts);
  while(pending.size){
    const wrapped=[...pending].map(p=>p.then(v=>({p,v})));
    const {p,v}=await Promise.race(wrapped);pending.delete(p);
    if(v.ok){
      const {x,url,age}=v;trace.push('✓ Relay 성공: '+url);
      return {price:+x.price,change:+(x.change||0),m15:x.m15,h1:x.h1,h4:Array.isArray(x.h4)&&x.h4.length?x.h4:aggregate(x.h1,4),d1:x.d1,w1:x.w1,source:url.includes('raw.githubusercontent.com')?'GitHub Raw Stock Relay':'GitHub Stock Relay',trace,relayAgeMin:age,relayUrl:url,companyName:x.companyName||null,market:x.market||null,currency:x.currency||null,generatedAt:x.generatedAt||null,symbol:x.symbol};
    }
    trace.push('× Relay 실패: '+v.url+' · '+(v.error?.name==='AbortError'?'timeout':v.error?.message||'unknown'));
  }
  const er=new Error('Stock Relay 전체 실패');er.relayTrace=trace;throw er;
}
async function install(){
  for(let i=0;i<40;i++){if(typeof window.fetchYahooScanner==='function')break;await sleep(250)}
  const legacy=window.fetchYahooScanner;if(typeof legacy!=='function')return;
  window.fetchYahooScanner=async function(symbol){
    if(window.scannerForceFresh){try{return await legacy(symbol)}catch(e){}}
    try{return await relay(symbol)}catch(e){
      try{const r=await legacy(symbol);r.trace=[...(e.relayTrace||[]),...(r.trace||[])];return r}
      catch(le){le.relayTrace=e.relayTrace;throw le}
    }
  };
  window.BTCStockRelayFast={version:V,relay,test:s=>relay(s||'068270.KS')};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();