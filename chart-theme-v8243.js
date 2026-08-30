/* BTC Hedge Assistant v8.24.4 - Binance-like chart indicator palette */
(()=>{'use strict';
if(window.__BTC_CHART_THEME_8244__)return;window.__BTC_CHART_THEME_8244__=true;
const V='8.24.4';
const DIRECT_MAP=new Map([
 ['#f6a600','#ff6d00'], // MA15 -> Binance orange
 ['#13a5ff','#4caf50'], // EMA5 -> Binance green
 ['#21c55d','#ffffff'], // short EMA -> Binance white
 ['#ff2c55','#f23645'], // bearish indicator/cross red
 ['#ff8c00','#ff6d00']  // orange cross
]);
function norm(v){return typeof v==='string'?v.trim().toLowerCase():v}
function patchStrokeStyle(){
 const proto=window.CanvasRenderingContext2D?.prototype;if(!proto||proto.__btcTheme8244StrokeStyle)return false;
 const d=Object.getOwnPropertyDescriptor(proto,'strokeStyle');if(!d||!d.get||!d.set)return false;
 try{
  Object.defineProperty(proto,'strokeStyle',{configurable:d.configurable,enumerable:d.enumerable,get:d.get,set:function(v){
    try{
      if(this?.canvas?.id==='chart'){
        const n=norm(v);
        this.__btcRequestedStroke8244=n;
        if(DIRECT_MAP.has(n))v=DIRECT_MAP.get(n);
        // Keep #7b52d9 untouched here: it is shared by EMA120 and Bollinger.
      }
    }catch(e){}
    return d.set.call(this,v)
  }});
  Object.defineProperty(proto,'__btcTheme8244StrokeStyle',{value:true,configurable:true});
  return true;
 }catch(e){return false}
}
function patchStroke(){
 const proto=window.CanvasRenderingContext2D?.prototype;if(!proto||proto.__btcTheme8244Stroke)return false;
 const original=proto.stroke;if(typeof original!=='function')return false;
 try{
  Object.defineProperty(proto,'stroke',{configurable:true,writable:true,value:function(...args){
    if(this?.canvas?.id==='chart'&&this.__btcRequestedStroke8244==='#7b52d9'){
      // drawChart uses the same legacy purple for EMA120(width 2) and Bollinger(width 1).
      // Resolve by final lineWidth: EMA120 -> green, Bollinger -> purple.
      const old=this.strokeStyle;
      try{this.strokeStyle=(Number(this.lineWidth)>=1.8)?'#4caf50':'#7b52d9';return original.apply(this,args)}
      finally{try{this.strokeStyle=old}catch(e){}}
    }
    return original.apply(this,args)
  }});
  Object.defineProperty(proto,'__btcTheme8244Stroke',{value:true,configurable:true});
  return true;
 }catch(e){return false}
}
function applyCss(){
 const r=document.documentElement.style;
 r.setProperty('--btc-chart-ma','#ff6d00');
 r.setProperty('--btc-chart-ema5','#4caf50');
 r.setProperty('--btc-chart-ema-short','#ffffff');
 r.setProperty('--btc-chart-ema-long','#4caf50');
 r.setProperty('--btc-chart-bollinger','#7b52d9');
 r.setProperty('--btc-chart-cross-up','#ff9500');
 r.setProperty('--btc-chart-cross-down','#f23645');
}
function redraw(){try{window.drawChart?.()}catch(e){}}
function boot(){applyCss();patchStrokeStyle();patchStroke();setTimeout(redraw,80);document.addEventListener('btc-bootstrap-ready',()=>setTimeout(redraw,120));window.addEventListener('hashchange',()=>{if((location.hash||'').includes('chart'))setTimeout(redraw,80)});}
window.BTCChartTheme={version:V,palette:{ma:'#ff6d00',ema5:'#4caf50',emaShort:'#ffffff',emaLong:'#4caf50',bollinger:'#7b52d9',crossUp:'#ff9500',crossDown:'#f23645'},redraw};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();