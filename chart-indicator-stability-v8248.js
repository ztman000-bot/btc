/* BTC Hedge Assistant v8.24.8 - viewport-independent indicator calculations */
(()=>{'use strict';
if(window.__BTC_CHART_INDICATOR_STABILITY_8248__)return;window.__BTC_CHART_INDICATOR_STABILITY_8248__=true;
const V='8.24.8';
const SERIES_KEYS=['o','h','l','c','v','e5','m15','e10','e120','bbU','bbL','bbM','pdi','mdi','adx','st','stDir','stochK','stochD','rsi','volRatio'];
let originalEnrich=null;
function sameRow(a,b){return a&&b&&Number(a[0])===Number(b[0])}
function sliceEnriched(full,start,len){const out={};for(const k of SERIES_KEYS){const v=full?.[k];out[k]=Array.isArray(v)?v.slice(start,start+len):v}return out}
function patch(){
 const fn=window.enrich;if(typeof fn!=='function')return false;if(fn.__btc8248Wrapped)return true;originalEnrich=fn;
 function stableEnrich(visible){
  try{
   if(!Array.isArray(visible)||!visible.length)return fn(visible);
   const all=window.chartData?.();
   if(!Array.isArray(all)||all.length<=visible.length)return fn(visible);
   const firstTs=Number(visible[0]?.[0]),lastTs=Number(visible[visible.length-1]?.[0]);
   let start=all.findIndex(r=>Number(r?.[0])===firstTs);
   if(start<0)return fn(visible);
   const end=start+visible.length-1;
   if(end>=all.length||Number(all[end]?.[0])!==lastTs)return fn(visible);
   // Calculate EMA/MA/BB/DMI/Supertrend/Stoch on the complete timeframe history,
   // then crop to the visible viewport. Pan/zoom therefore never changes historical indicator values.
   const full=fn(all);
   return sliceEnriched(full,start,visible.length);
  }catch(e){console.warn('[BTC indicator stability]',e);return fn(visible)}
 }
 stableEnrich.__btc8248Wrapped=true;stableEnrich.__btc8248Original=fn;window.enrich=stableEnrich;return true
}
function verify(){
 try{
  const all=window.chartData?.();if(!Array.isArray(all)||all.length<180||typeof window.enrich!=='function')return null;
  const len=Math.min(80,all.length-20),a=all.slice(-len),b=all.slice(-(len+20),-20);
  const ea=window.enrich(a),eb=window.enrich(b);
  return {patched:!!window.enrich.__btc8248Wrapped,timeframe:(()=>{try{return chartTF}catch(e){return null}})(),samples:all.length,latestEma120:ea?.e120?.at?.(-1)??null,priorEma120:eb?.e120?.at?.(-1)??null};
 }catch(e){return {patched:false,error:String(e?.message||e)}}
}
function redraw(){try{window.drawChart?.()}catch(e){}}
function boot(){for(let i=0;i<20&&!patch();i++)setTimeout(()=>{if(patch())redraw()},80+i*80);document.addEventListener('btc-bootstrap-ready',()=>{patch();setTimeout(redraw,80)});window.BTCChartIndicatorStability={version:V,patch,verify,status:()=>verify()}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();