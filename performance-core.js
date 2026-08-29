/* BTC Hedge Assistant v8.23.9 - Performance Core 1.0 */
(()=>{'use strict';
if(window.__BTC_PERFORMANCE_CORE__&&window.BTCPerformanceCore)return;window.__BTC_PERFORMANCE_CORE__=true;
const V='8.23.9';
const S={startedAt:performance.now(),readyAt:null,longTasks:0,longTaskMs:0,lastLongTaskAt:0,yields:0,preloads:0,hiddenSince:null,hiddenMs:0,marks:[]};
function mark(name,detail){const item={name,at:Math.round(performance.now()),detail:detail||null};S.marks.push(item);if(S.marks.length>80)S.marks.shift();try{performance.mark('btc-'+name)}catch(e){}return item}
function yieldToMain(timeout=80){S.yields++;return new Promise(resolve=>{if('requestIdleCallback'in window)requestIdleCallback(()=>resolve(),{timeout});else setTimeout(resolve,0)})}
function preload(url){if(!url||document.querySelector('link[data-btc-preload="'+CSS.escape(url)+'"]'))return false;const l=document.createElement('link');l.rel='preload';l.as='script';l.href=url;l.dataset.btcPreload=url;document.head.appendChild(l);S.preloads++;return true}
function preloadMany(urls,max=12){let n=0;(urls||[]).forEach(u=>{if(n<max&&preload(u))n++});return n}
function status(){return{version:V,startedAt:S.startedAt,readyAt:S.readyAt,startupMs:S.readyAt?Math.round(S.readyAt-S.startedAt):null,longTasks:S.longTasks,longTaskMs:Math.round(S.longTaskMs),yields:S.yields,preloads:S.preloads,hiddenMs:Math.round(S.hiddenMs+(S.hiddenSince?performance.now()-S.hiddenSince:0)),marks:[...S.marks]}}
function ready(){if(S.readyAt===null){S.readyAt=performance.now();mark('interactive-ready',{startupMs:Math.round(S.readyAt-S.startedAt)});window.BTC_PERFORMANCE=status();document.documentElement.dataset.btcPerformance='ready';document.dispatchEvent(new CustomEvent('btc-performance-ready',{detail:window.BTC_PERFORMANCE}))}return status()}
try{if('PerformanceObserver'in window){const po=new PerformanceObserver(list=>{for(const e of list.getEntries()){S.longTasks++;S.longTaskMs+=e.duration;S.lastLongTaskAt=performance.now()}window.BTC_PERFORMANCE=status()});po.observe({type:'longtask',buffered:true})}}catch(e){}
document.addEventListener('visibilitychange',()=>{if(document.hidden){S.hiddenSince=performance.now();document.documentElement.dataset.btcPerformance='background'}else{if(S.hiddenSince){S.hiddenMs+=performance.now()-S.hiddenSince;S.hiddenSince=null}document.documentElement.dataset.btcPerformance='ready';mark('foreground')}});
document.addEventListener('btc-bootstrap-ready',()=>ready(),{once:true});
window.BTCPerformanceCore={version:V,mark,yield:yieldToMain,preload,preloadMany,ready,status};window.BTC_PERFORMANCE=status();mark('performance-core-loaded');
})();