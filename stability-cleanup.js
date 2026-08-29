/* BTC Hedge Assistant - final stability cleanup */
(()=>{
'use strict';
if(window.__BTC_STABILITY_CLEANUP__)return;window.__BTC_STABILITY_CLEANUP__=true;
const ROUTE_TARGETS={home:'#v8222HomePane',scanner:'#scanner',position:'#position',trade:'#trade',chart:'#v8222ChartPage',risk:'#v8222RiskPage',research:'#strategyLab',analysis:'#v8222TodayAnalysisPage',daily:'#dailyBriefPane',settings:'#settings',alerts:'#alerts',backtest:'#backtest',log:'#log'};
const ENGINE_IDS=['adaptiveLearningCard','reversalIntelligenceCard','strategyGovernanceCard','terminalWalletCard','hedgeRotationCard','recoveryEngineCard','executionExitCard'];
const state={version:'',lastCheck:0,duplicateIds:[],hiddenActive:false,cacheCleaned:false,swCanonical:false,repairs:0};
function version(){return window.BTC_APP_CONFIG?.version||window.BTC_APP_VERSION||document.documentElement.dataset.btcAppVersion||'8.22.5'}
function route(){return (location.hash||'#home').slice(1)||'home'}
function duplicateIds(){const seen=new Set(),dup=new Set();document.querySelectorAll('[id]').forEach(el=>{if(seen.has(el.id))dup.add(el.id);else seen.add(el.id)});return [...dup]}
async function cleanCaches(){if(!('caches'in window))return;try{const v=version(),keep='btc-hedge-v'+v+'-canonical';const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('btc-hedge-v')&&k!==keep).map(k=>caches.delete(k)));state.cacheCleaned=true}catch(e){}}
async function canonicalSW(){if(!('serviceWorker'in navigator))return;try{const v=version(),reg=await navigator.serviceWorker.register('./sw.js?v='+encodeURIComponent(v),{updateViaCache:'none'});await reg.update();state.swCanonical=true}catch(e){}}
function repairRoute(){const r=route(),sel=ROUTE_TARGETS[r],el=sel?document.querySelector(sel):null;if(!el)return;const visible=!!(el.offsetWidth||el.offsetHeight||el.getClientRects().length);state.hiddenActive=!visible;if(!visible&&window.BTCV8222?.route){state.repairs++;try{window.BTCV8222.route(r)}catch(e){}}}
function repairResearch(){if(route()!=='research')return;try{window.BTCV8223?.rehomeEngines?.()}catch(e){};const host=document.getElementById('v8223EngineHost');if(!host)return;for(const id of ENGINE_IDS){const card=document.getElementById(id);const body=document.querySelector('#v8223Wrap_'+id+' .v8223EngineBody');if(card&&body&&card.parentElement!==body){body.appendChild(card);state.repairs++}}}
function normalizeVersion(){const v=version();state.version=v;document.documentElement.dataset.btcAppVersion=v;window.BTC_APP_VERSION=v;const title='BTC Hedge Assistant v'+v;document.title=title;document.querySelectorAll('h1').forEach(h=>{if(/BTC Hedge Assistant/i.test(h.textContent||''))h.textContent=title})}
function check(){state.lastCheck=Date.now();state.duplicateIds=duplicateIds();normalizeVersion();repairRoute();repairResearch();document.documentElement.dataset.btcDuplicateIds=String(state.duplicateIds.length);window.BTCStabilityCleanupState={...state};document.dispatchEvent(new CustomEvent('btc-stability-cleanup',{detail:{...state}}));return {...state}}
async function boot(){normalizeVersion();await Promise.allSettled([cleanCaches(),canonicalSW()]);setTimeout(check,400);setInterval(check,15000);window.addEventListener('hashchange',()=>setTimeout(check,80));document.addEventListener('btc-app-config-ready',()=>{normalizeVersion();cleanCaches();canonicalSW();setTimeout(check,80)});document.addEventListener('btc-bootstrap-ready',()=>setTimeout(check,120));document.addEventListener('btc-strategy-lab-rendered',()=>setTimeout(check,80))}
window.BTCStabilityCleanup={version,check,state};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
