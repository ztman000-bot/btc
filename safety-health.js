/* BTC Hedge Assistant v8.23.8 - Runtime Safety Health Monitor 1.1 */
(()=>{'use strict';
if(window.__BTC_SAFETY_HEALTH_SINGLETON&&window.BTCSafetyHealth)return;
window.__BTC_SAFETY_HEALTH_SINGLETON=true;
const V='8.23.8',MAX_ERRORS=30,STATE={last:null,timer:null,errors:[]};
const cfg=()=>window.BTC_APP_CONFIG?.safety||{};
const currentVersion=()=>window.BTC_APP_CONFIG?.version||window.BTC_APP_VERSION||V;
const now=()=>Date.now();
const ageMin=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.max(0,(now()-t)/60000):Infinity};
const txt=id=>(document.getElementById(id)?.textContent||'').trim();
function safeStore(){try{localStorage.setItem('btc:runtime-errors',JSON.stringify(STATE.errors.slice(-MAX_ERRORS)))}catch(e){}}
function loadStore(){try{const legacy=JSON.parse(localStorage.getItem('btc:v8222:runtime-errors')||'[]');const cur=JSON.parse(localStorage.getItem('btc:runtime-errors')||'[]');STATE.errors=[...legacy,...cur].slice(-MAX_ERRORS)}catch(e){STATE.errors=[]}}
function record(kind,message,source='runtime'){
  const m=String(message||'unknown').slice(0,500);
  if(/ResizeObserver loop limit exceeded/i.test(m))return;
  STATE.errors.push({at:new Date().toISOString(),version:currentVersion(),kind,source,message:m});
  STATE.errors=STATE.errors.slice(-MAX_ERRORS);safeStore();
}
async function fetchJson(path){const r=await fetch(path+(path.includes('?')?'&':'?')+'t='+now(),{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status+' '+path);return r.json()}
async function swStatus(){
  if(!('serviceWorker'in navigator))return{supported:false,ok:true,grade:'N/A',version:'N/A'};
  const expected=currentVersion();let reg=null,registered='none',controlled=!!navigator.serviceWorker.controller,scriptVersion='unknown',fetchOk=false,error='';
  try{reg=await navigator.serviceWorker.getRegistration();const u=reg?.active?.scriptURL||reg?.waiting?.scriptURL||reg?.installing?.scriptURL||'';registered=u?new URL(u).searchParams.get('v')||'unknown':'none'}catch(e){error=e.message}
  try{const r=await fetch('./sw.js?v='+encodeURIComponent(expected)+'&health='+now(),{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);const body=await r.text();const m=body.match(/const\s+APP_VERSION\s*=\s*['\"]([^'\"]+)['\"]/);scriptVersion=m?.[1]||'unknown';fetchOk=scriptVersion===expected}catch(e){error=error||e.message}
  const registrationStale=registered!=='none'&&registered!=='unknown'&&registered!==expected;
  const ok=fetchOk || (!error&&(registered===expected||registered==='unknown'));
  return{supported:true,ok,grade:ok?(registrationStale?'WARN':'HEALTHY'):'CRITICAL',version:scriptVersion,registeredVersion:registered,expected,registrationStale,controlled,fetchOk,error:error||null}
}
function moduleStatus(){const required=['BTCSafetyCore','BTCRegimeHedge','BTCAdaptiveLearning','BTCStrategyGovernance','BTCTerminalWallet','BTCRecoveryEngine','BTCStabilityGuard','BTCStartupHealth'];const missing=required.filter(k=>!window[k]);return{ok:missing.length===0,missing}}
function marketStatus(){const live=txt('liveState'),market=txt('marketStatus');const ok=/LIVE/i.test(live)||/LIVE/i.test(market);return{ok,live:live||'--',market:market||'--'}}
async function check(){
  const version=currentVersion(),out={at:new Date().toISOString(),version};out.modules=moduleStatus();out.market=marketStatus();out.serviceWorker=await swStatus();
  try{const [hb,research]=await Promise.all([fetchJson('./data/research/research-heartbeat.json'),fetchJson('./data/research/latest.json')]);const hbAge=ageMin(hb.at||hb.generatedAt),researchAge=ageMin(research.generatedAt);const fresh=Number(cfg().researchFreshMinutes||45),stopped=Number(cfg().researchStoppedMinutes||120),daemon=Number(cfg().daemonHeartbeatMinutes||35);out.research={heartbeatAgeMin:hbAge,researchAgeMin:researchAge,loop:hb.loop??null,cadenceMinutes:hb.cadenceMinutes??null,heartbeatOk:hbAge<=Math.max(daemon,45),fresh:researchAge<=fresh,stopped:hbAge>stopped||researchAge>stopped,generatedAt:research.generatedAt||null}}catch(e){out.research={heartbeatOk:false,fresh:false,stopped:true,error:e.message};record('health-fetch',e.message,'safety-health')}
  const currentErrors=STATE.errors.filter(x=>x.version===version),legacyErrors=STATE.errors.filter(x=>x.version!==version);out.runtime={errors24h:currentErrors.filter(x=>ageMin(x.at)<=1440).length,currentSessionVersion:version,recent:currentErrors.slice(-5),historical24h:legacyErrors.filter(x=>ageMin(x.at)<=1440).length,historicalRecent:legacyErrors.slice(-3)};
  const critical=[];if(!out.modules.ok)critical.push('critical-modules');if(!out.serviceWorker.ok)critical.push('service-worker-code-version');
  const warnings=[];if(out.serviceWorker.registrationStale&&out.serviceWorker.ok)warnings.push('service-worker-registration-stale');if(!out.market.ok)warnings.push('market-live');if(!out.research?.heartbeatOk)warnings.push('research-heartbeat');if(out.research?.stopped)warnings.push('research-stopped');if(out.runtime.errors24h>=Number(cfg().runtimeErrorWarnCount24h||5))warnings.push('runtime-errors-current-version');
  out.critical=critical;out.warnings=warnings;out.ok=critical.length===0&&warnings.length===0;out.grade=critical.length?'CRITICAL':warnings.length?'WARN':'HEALTHY';
  if(critical.length){window.BTC_DECISION_ALLOWED=false;window.BTC_HEALTH_FAIL_CLOSED=true}
  window.BTC_RESEARCH_ALLOWED=!out.research?.stopped;STATE.last=out;window.BTC_SAFETY_HEALTH=out;document.dispatchEvent(new CustomEvent('btc-safety-health',{detail:out}));return out
}
function clearHistorical(){const v=currentVersion();STATE.errors=STATE.errors.filter(x=>x.version===v);safeStore();return check()}
function start(){if(STATE.timer)return;check().catch(()=>{});STATE.timer=setInterval(()=>check().catch(()=>{}),Number(cfg().healthCheckMinutes||5)*60*1000)}
function stop(){if(STATE.timer){clearInterval(STATE.timer);STATE.timer=null}}
loadStore();window.addEventListener('error',e=>record('error',e.message||e.error?.message||'window error',e.filename||'window'));window.addEventListener('unhandledrejection',e=>record('promise',e.reason?.message||String(e.reason||'unhandled rejection'),'promise'));document.addEventListener('visibilitychange',()=>{if(!document.hidden)check().catch(()=>{})});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.BTCSafetyHealth={version:V,check,start,stop,status:()=>STATE.last,errors:()=>[...STATE.errors],record,clearHistorical};
})();