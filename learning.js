/* BTC Hedge Assistant v8.3.2 - privacy-safe learning sidecar */
(()=>{
  'use strict';
  const KEY='v832learning';
  const META='v832learningMeta';
  const MAX=1200;
  const HORIZONS=[['1h',3600000],['4h',14400000],['24h',86400000]];

  const now=()=>Date.now();
  const num=v=>Number.isFinite(Number(v))?Number(v):null;
  const safeText=v=>v==null?null:String(v).slice(0,120);
  const uid=()=>`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return []}};
  const save=arr=>{try{localStorage.setItem(KEY,JSON.stringify(arr.slice(-MAX)));return true}catch(e){return false}};
  const appVersion=()=>document.title.match(/v([0-9.]+)/i)?.[1]||'8.3.2';
  const tfSnap=t=>({bias:num(t?.bias),rsi:num(t?.rsi),adx:num(t?.adx),stochK:num(t?.stochK??t?.k),stochD:num(t?.stochD??t?.d),volumeRatio:num(t?.volRatio??t?.vr)});
  const sourceOf=r=>safeText(r?.source||r?.src||r?.provider||r?.meta?.source||null);
  const directionFrom=r=>{try{if(typeof v80SignalDirection==='function')return safeText(v80SignalDirection(r));}catch(e){}const s=String(r?.v79?.state||r?.signal||r?.action||'').toLowerCase();if(/buy|long|상승|매수|진입/.test(s))return'UP';if(/sell|short|하락|매도|축소/.test(s))return'DOWN';return'WAIT';};
  const stateOf=r=>safeText(r?.v79?.state||r?.state||r?.signal||'--');
  const normalizedType=t=>['crypto','us','kr'].includes(t)?t:'crypto';

  function updateOutcomesFor(symbol,type,price,ts=now()){
    if(!symbol||!price)return;const arr=load();let changed=false;
    for(const rec of arr){if(rec.kind!=='scanner_signal'||rec.symbol!==symbol||rec.type!==type||!rec.price)continue;rec.outcomes=rec.outcomes||{};for(const [name,ms] of HORIZONS){if(rec.outcomes[name]||ts-rec.ts<ms)continue;const ret=(price-rec.price)/rec.price*100;const dir=rec.signal==='DOWN'?-1:rec.signal==='UP'?1:0;rec.outcomes[name]={ts,price:Number(price),returnPct:Number(ret.toFixed(4)),directionalPct:Number((ret*dir).toFixed(4)),hit:dir===0?null:(ret*dir)>0};changed=true;}}
    if(changed)save(arr);
  }
  function recordScanner(r){
    try{const symbol=safeText(r?.symbol);const type=normalizedType(r?.type);const price=num(r?.price);if(!symbol||!price)return;updateOutcomesFor(symbol,type,price);const arr=load();const state=stateOf(r);const signal=directionFrom(r);const sig=`${type}|${symbol}|${state}|${signal}|${Math.round(num(r?.trendScore)||0)}|${Math.round(num(r?.entryScore)||0)}`;const last=[...arr].reverse().find(x=>x.kind==='scanner_signal'&&x.symbol===symbol&&x.type===type);if(last&&last.signature===sig&&now()-last.ts<30*60000)return;arr.push({id:uid(),schemaVersion:'1.0',appVersion:appVersion(),ts:now(),kind:'scanner_signal',symbol,type,source:sourceOf(r),price,signal,state,trendScore:num(r?.trendScore),entryScore:num(r?.entryScore),timeframes:{m15:tfSnap(r?.t15),h1:tfSnap(r?.t1),h4:tfSnap(r?.t4),d1:tfSnap(r?.td),w1:tfSnap(r?.tw)},outcomes:{},signature:sig});save(arr);refreshUI();}catch(e){console.warn('learning scanner record failed',e)}
  }
  function recordExecution(){
    try{const p=num(typeof market!=='undefined'?market?.price:null);if(!p)return;const d=typeof currentDecision!=='undefined'?currentDecision:null;const arr=load();arr.push({id:uid(),schemaVersion:'1.0',appVersion:appVersion(),ts:now(),kind:'manual_execution',symbol:'BTCUSDT',type:'btc',source:'Binance/manual-confirm',price:p,signal:safeText(d?.action||'WAIT'),state:safeText(d?.execState||null),trendScore:null,entryScore:null,timeframes:{},outcomes:{}});save(arr);refreshUI();}catch(e){console.warn('learning execution record failed',e)}
  }
  function stats(){const arr=load(),sig=arr.filter(x=>x.kind==='scanner_signal');const evaluated=[];for(const r of sig)for(const h of HORIZONS){const o=r.outcomes?.[h[0]];if(o&&o.hit!=null)evaluated.push(o)}const wins=evaluated.filter(x=>x.hit).length;const avg=evaluated.length?evaluated.reduce((s,x)=>s+(num(x.directionalPct)||0),0)/evaluated.length:0;return{records:arr.length,signals:sig.length,evaluated:evaluated.length,winRate:evaluated.length?wins/evaluated.length*100:null,avgDirectional:avg};}
  function exportDataset(){const payload={schemaVersion:'1.0',exportedAt:new Date().toISOString(),appVersion:appVersion(),privacy:'No API keys, balances, wallet addresses, email addresses, position sizes, or order quantities are included.',records:load()};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`btc_learning_${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);}
  function clearLearning(){if(confirm('학습용 성과 기록만 초기화할까요? 실행 기록/설정은 유지됩니다.')){localStorage.removeItem(KEY);refreshUI()}}
  function ensureUI(){if(document.getElementById('v832LearningBox'))return;const log=document.getElementById('log');if(!log)return;const box=document.createElement('div');box.id='v832LearningBox';box.className='card';box.style.margin='10px 0 0';box.style.padding='10px';box.style.background='#0c1722';box.style.border='1px solid #2b4b66';box.innerHTML=`<div class="row"><b>V8.3.2 학습 데이터</b><span id="v832LearnBadge" class="badge fresh">수집 준비</span></div><div class="small" style="line-height:1.55;margin-top:6px">스캐너 신호를 개인정보 없이 별도 누적하고, 같은 종목을 다시 조회할 때 1H·4H·24H 성과를 자동 평가합니다. GitHub Pages 보안상 저장소로 직접 업로드하지 않고 기기에 안전하게 보관합니다.</div><div id="v832LearnStats" class="small" style="margin-top:8px"></div><div class="stack" style="margin-top:8px"><button id="v832ExportBtn">학습 데이터 내보내기</button><button id="v832ClearBtn">학습 기록 초기화</button></div>`;log.appendChild(box);document.getElementById('v832ExportBtn')?.addEventListener('click',exportDataset);document.getElementById('v832ClearBtn')?.addEventListener('click',clearLearning);}
  function refreshUI(){ensureUI();const s=stats();const el=document.getElementById('v832LearnStats'),b=document.getElementById('v832LearnBadge');if(el)el.innerHTML=`누적 ${s.records}건 · 스캐너 ${s.signals}건 · 평가완료 ${s.evaluated}건${s.winRate==null?'':` · 방향 적중률 ${s.winRate.toFixed(1)}% · 평균 방향수익 ${s.avgDirectional.toFixed(2)}%`}`;if(b)b.textContent=s.signals?`신호 ${s.signals}건`:'수집 대기';}
  function hook(){try{if(typeof v80RecordSignal==='function'&&!v80RecordSignal.__v832){const orig=v80RecordSignal;const wrapped=function(r){const out=orig.apply(this,arguments);recordScanner(r);return out};wrapped.__v832=true;v80RecordSignal=wrapped;}}catch(e){console.warn('learning signal hook failed',e)}try{if(typeof recordAction==='function'&&!recordAction.__v832){const orig=recordAction;const wrapped=function(){const p=num(typeof market!=='undefined'?market?.price:null);const out=orig.apply(this,arguments);if(p)recordExecution();return out};wrapped.__v832=true;recordAction=wrapped;}}catch(e){console.warn('learning action hook failed',e)}refreshUI();try{localStorage.setItem(META,JSON.stringify({version:'8.3.2',installedAt:localStorage.getItem(META)?JSON.parse(localStorage.getItem(META)).installedAt:now(),lastSeen:now()}))}catch(e){}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(hook,0));else setTimeout(hook,0);setInterval(refreshUI,60000);window.BTCLearning={export:exportDataset,stats,clear:clearLearning,records:load};
})();
