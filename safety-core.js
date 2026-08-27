/* BTC Hedge Assistant v8.20.0 - Central Safety / Guard Core */
(function(){'use strict';
const V='8.20.0',HARD=10000;let SERVER=null,LAST_FETCH=0,FETCH_ERR='';
const N=v=>Number.isFinite(Number(v))?Number(v):null;
function P(){try{return typeof pos==='function'?pos():(window.pos?.())}catch(e){return null}}
function M(){try{return typeof market!=='undefined'?market:(window.market||{})}catch(e){return window.market||{}}}
function price(){return Number(M()?.price)||Number((M()?.h4||[]).at(-1)?.[4])||0}
function mmr(d){if(!d?.liq||(!(N(d.lq))&&!(N(d.sq))))return null;const liq=N(d.liq),q=(N(d.wallet)||0)+(N(d.added)||0)+(N(d.lq)||0)*(liq-N(d.le))+(N(d.sq)||0)*(N(d.se)-liq),n=((N(d.lq)||0)+(N(d.sq)||0))*liq;return n?q/n:null}
function liqFor(s,d,m){if(m==null)return NaN;const den=(s.lq-s.sq)-m*(s.lq+s.sq),num=s.wallet+s.added-s.lq*N(d.le)+s.sq*N(d.se);return Math.abs(den)<1e-10?NaN:-num/den}
function state0(d){return{wallet:N(d?.wallet)||0,added:N(d?.added)||0,lq:N(d?.lq)||0,sq:N(d?.sq)||0}}
function distance(d,p=price(),s){if(!d||!p)return null;s=s||state0(d);const l=liqFor(s,d,mmr(d));return(!Number.isFinite(l)||l<=0)?1e12:Math.abs(l-p)}
function adaptiveGuard(){try{const g=Number(window.BTCAdaptiveLearning?.recommendation?.()?.guard);return Number.isFinite(g)?g:null}catch(e){return null}}
function serverGuard(){const g=Number(SERVER?.guard2?.dynamicOperatingGuardUsd),t=Date.parse(SERVER?.generatedAt||SERVER?.enhancedAt||'');if(!Number.isFinite(g)||!Number.isFinite(t)||Date.now()-t>45*60*1000)return null;return g}
function current(){const sg=serverGuard(),ag=adaptiveGuard(),operating=Math.max(HARD,sg||0,ag||0);return{version:V,hard:HARD,operating,server:sg,adaptive:ag,serverFresh:!!sg,source:sg&&ag?'SERVER+ADAPTIVE':sg?'SERVER':ag?'ADAPTIVE':'HARD_ONLY',at:Date.now()}}
function healthAllowed(){return window.BTC_DECISION_ALLOWED!==false&&!window.BTC_BOOTSTRAP_ERROR}
function validate(d,p=price(),s){const g=current(),dist=distance(d,p,s);return{allowed:healthAllowed()&&Number.isFinite(dist)&&dist>=g.operating,healthAllowed:healthAllowed(),distance:dist,guard:g.operating,hard:g.hard,source:g.source}}
async function refresh(){const urls=['./data/research/latest.json?ts='+Date.now(),'/btc/data/research/latest.json?ts='+Date.now()];for(const u of urls){try{const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();SERVER=j;LAST_FETCH=Date.now();FETCH_ERR='';document.dispatchEvent(new CustomEvent('btc-safety-core',{detail:current()}));return j}catch(e){FETCH_ERR=String(e?.message||e)}}return null}
function status(){return{...current(),lastFetch:LAST_FETCH,error:FETCH_ERR,serverEngine:SERVER?.engineVersion||null}}
window.BTCSafetyCore={version:V,HARD,current,validate,distance,mmr,liqFor,state0,status,refresh,server:()=>SERVER};
refresh();setInterval(refresh,60000);
})();