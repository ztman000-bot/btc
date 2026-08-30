/* BTC Hedge Assistant v8.24.3 - Binance-like chart indicator palette */
(()=>{'use strict';
if(window.__BTC_CHART_THEME_8243__)return;window.__BTC_CHART_THEME_8243__=true;
const V='8.24.3';
const MAP=new Map([
 ['#ff8c00','#ff6d00'], // MA / orange crosses
 ['#7b52d9','#4caf50'], // long EMA
 ['#19c2c4','#ffffff'], // short EMA
 ['#ff2c55','#f23645']  // red crosses
]);
function norm(v){return typeof v==='string'?v.trim().toLowerCase():v}
function remap(v){const n=norm(v);return MAP.get(n)||v}
function patchProp(prop){
 const proto=window.CanvasRenderingContext2D?.prototype;if(!proto)return false;
 const key='__btcTheme_'+prop;if(proto[key])return true;
 const d=Object.getOwnPropertyDescriptor(proto,prop);if(!d||!d.get||!d.set)return false;
 try{
  Object.defineProperty(proto,prop,{configurable:d.configurable,enumerable:d.enumerable,get:d.get,set:function(v){
    try{if(this?.canvas?.id==='chart')v=remap(v)}catch(e){}
    return d.set.call(this,v)
  }});
  Object.defineProperty(proto,key,{value:true,configurable:true});
  return true;
 }catch(e){return false}
}
function applyCss(){
 const r=document.documentElement.style;
 r.setProperty('--btc-chart-ma','#ff6d00');
 r.setProperty('--btc-chart-ema-short','#ffffff');
 r.setProperty('--btc-chart-ema-long','#4caf50');
 r.setProperty('--btc-chart-cross-up','#ff9500');
 r.setProperty('--btc-chart-cross-down','#f23645');
}
function redraw(){try{window.drawChart?.()}catch(e){}}
function boot(){applyCss();patchProp('strokeStyle');patchProp('fillStyle');setTimeout(redraw,80);document.addEventListener('btc-bootstrap-ready',()=>setTimeout(redraw,120));window.addEventListener('hashchange',()=>{if((location.hash||'').includes('chart'))setTimeout(redraw,80)});}
window.BTCChartTheme={version:V,palette:{ma:'#ff6d00',emaShort:'#ffffff',emaLong:'#4caf50',crossUp:'#ff9500',crossDown:'#f23645'},redraw};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();