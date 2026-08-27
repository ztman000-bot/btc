/* BTC Hedge Assistant v8.21.0 - Central Safety / Guard Core */
(function(){'use strict';
if(window.__BTC_SAFETY_CORE_SINGLETON&&window.BTCSafetyCore)return;window.__BTC_SAFETY_CORE_SINGLETON=true;
const V='2.1',HARD=10000;let SERVER=null,RESEARCH_CFG=null,LAST_FETCH=0,FETCH_ERR='';
const N=v=>Number.isFinite(Number(v))?Number(v):null;
function P(){try{return typeof pos==='function'?pos():(window.pos?.())}catch(e){return null}}
function M(){try{return typeof market!=='undefined'?market:(window.market||{})}catch(e){return window.market||{}}}
function price(){return Number(M()?.price)||Number((M()?.h4||[]).at(-1)?.[4])||0}
function freshnessMin(){return Number(window.BTC_APP_CONFIG?.safety?.researchFreshMinutes)||45}
function mmr(d){if(!d?.liq||(!(N(d.lq))&&!(N(d.sq))))return null;const liq=N(d.liq),q=(N(d.wallet)||0)+(N(d.added)||0)+(N(d.lq)||0)*(liq-N(d.le))+(N(d.sq)||0)*(N(d.se)-liq),n=((N(d.lq)||0)+(N(d.sq)||0))*liq;return n?q/n:null}
function liqFor(s,d,m){if(m==null)return NaN;const den=(s.lq-s.sq)-m*(s.lq+s.sq),num=s.wallet+s.added-s.lq*N(d.le)+s.sq*N(d.se);return Math.abs(den)<1e-10?NaN:-num/den}
function state0(d){return{wallet:N(d?.wallet)||0,added:N(d?.added)||0,lq:N(d?.lq)||0,sq:N(d?.sq)||0}}
function distance(d,p=price(),s){if(!d||!p)return null;s=s||state0(d);const l=liqFor(s,d,mmr(d));return(!Number.isFinite(l)||l<=0)?1e12:Math.abs(l-p)}
function adaptiveGuard(){try{const g=Number(window.BTCAdaptiveLearning?.recommendation?.()?.guard);return Number.isFinite(g)?g:null}catch(e){return null}}
function rawServerFresh(){const t=Date.parse(SERVER?.generatedAt||SERVER?.enhancedAt||'');return Number.isFinite(t)&&Date.now()-t<=freshnessMin()*60*1000}
function serverFresh(){const h=window.BTCResearchHealth?.status?.()||window.BTC_RESEARCH_HEALTH;if(h&&typeof h.fresh==='boolean')return h.fresh;return rawServerFresh()}
function serverGuard(){const g=Number(SERVER?.guard2?.dynamicOperatingGuardUsd);return Number.isFinite(g)&&serverFresh()?g:null}
function near(a,b,tol){a=N(a);b=N(b);return a!=null&&b!=null&&Math.abs(a-b)<=tol}
function researchPosition(){const d=P(),r=RESEARCH_CFG?.position;if(!d||!r)return{known:false,matched:false,reason:'position snapshot unavailable'};const checks={longQty:near(d.lq,r.longQty,.0005),shortQty:near(d.sq,r.shortQty,.0005),longEntry:near(d.le,r.longEntry,5),shortEntry:near(d.se,r.shortEntry,5),referenceLiquidation:near(d.liq,r.referenceLiquidation,50)};const matched=Object.values(checks).every(Boolean);return{known:true,matched,checks,local:{longQty:N(d.lq),shortQty:N(d.sq),longEntry:N(d.le),shortEntry:N(d.se),referenceLiquidation:N(d.liq)},server:{longQty:N(r.longQty),shortQty:N(r.shortQty),longEntry:N(r.longEntry),shortEntry:N(r.shortEntry),referenceLiquidation:N(r.referenceLiquidation)},reason:matched?'server research position matches local position':'server MC position snapshot differs from current app position'}}
function current(){const sg=serverGuard(),ag=adaptiveGuard(),rp=researchPosition(),fresh=serverFresh(),operating=Math.max(HARD,sg||0,ag||0);return{version:V,hard:HARD,operating,server:sg,adaptive:ag,serverFresh:fresh,researchPositionMatched:rp.matched,researchPositionKnown:rp.known,researchPosition:rp,serverResearchUsable:fresh&&rp.matched,source:sg&&ag?'SERVER+ADAPTIVE':sg?'SERVER':ag?'ADAPTIVE':'HARD_ONLY',at:Date.now()}}
function healthAllowed(){return window.BTC_DECISION_ALLOWED!==false&&!window.BTC_BOOTSTRAP_ERROR}
function validate(d,p=price(),s){const g=current(),dist=distance(d,p,s);return{allowed:healthAllowed()&&Number.isFinite(dist)&&dist>=g.operating,healthAllowed:healthAllowed(),distance:dist,guard:g.operating,hard:g.hard,source:g.source,researchPositionMatched:g.researchPositionMatched,serverResearchUsable:g.serverResearchUsable}}
async function getJson(u){const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}
function stamp(x){return Date.parse(x?.generatedAt||x?.enhancedAt||x?.at||'')||0}
async function fetchFreshest(urls){const ok=[],es=[];await Promise.all(urls.map(async u=>{try{ok.push(await getJson(u))}catch(e){es.push(String(e?.message||e))}}));if(!ok.length)throw new Error(es.join(' / '));ok.sort((a,b)=>stamp(b)-stamp(a));return ok[0]}
async function refresh(){const ts=Date.now();try{SERVER=await fetchFreshest(['./data/research/latest.json?ts='+ts,'/btc/data/research/latest.json?ts='+ts,'https://raw.githubusercontent.com/ztman000-bot/btc/main/data/research/latest.json?ts='+ts]);try{RESEARCH_CFG=await fetchFreshest(['./data/research/config.json?ts='+ts,'/btc/data/research/config.json?ts='+ts,'https://raw.githubusercontent.com/ztman000-bot/btc/main/data/research/config.json?ts='+ts])}catch(e){}LAST_FETCH=Date.now();FETCH_ERR='';document.dispatchEvent(new CustomEvent('btc-safety-core',{detail:current()}));return SERVER}catch(e){FETCH_ERR=String(e?.message||e);return null}}
function status(){return{...current(),lastFetch:LAST_FETCH,error:FETCH_ERR,serverEngine:SERVER?.engineVersion||null}}
window.BTCSafetyCore={version:V,HARD,current,validate,distance,mmr,liqFor,state0,status,refresh,server:()=>SERVER,researchConfig:()=>RESEARCH_CFG,researchPosition};
refresh();window.__BTC_SAFETY_CORE_TIMER=setInterval(refresh,60000);document.addEventListener('btc-research-health',()=>document.dispatchEvent(new CustomEvent('btc-safety-core',{detail:current()})));
})();