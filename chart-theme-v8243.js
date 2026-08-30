/* BTC Hedge Assistant v8.24.5 - Binance-like chart palette, true crossover markers, hollow candles */
(()=>{'use strict';
if(window.__BTC_CHART_THEME_8245__)return;window.__BTC_CHART_THEME_8245__=true;
const V='8.24.5';
const DIRECT_MAP=new Map([
 ['#f6a600','#ff6d00'], // MA15 -> orange
 ['#13a5ff','#4caf50'], // EMA5 -> green
 ['#21c55d','#ffffff'], // EMA10 -> white
 ['#ff2c55','#f23645']  // DMI / red family
]);
const norm=v=>typeof v==='string'?v.trim().toLowerCase():v;
function patchStrokeStyle(){
 const proto=window.CanvasRenderingContext2D?.prototype;if(!proto||proto.__btcTheme8245StrokeStyle)return false;
 const d=Object.getOwnPropertyDescriptor(proto,'strokeStyle');if(!d||!d.get||!d.set)return false;
 try{
  Object.defineProperty(proto,'strokeStyle',{configurable:d.configurable,enumerable:d.enumerable,get:d.get,set:function(v){
   try{if(this?.canvas?.id==='chart'){const n=norm(v);this.__btcRequestedStroke8245=n;if(DIRECT_MAP.has(n))v=DIRECT_MAP.get(n)}}catch(e){}
   return d.set.call(this,v)
  }});
  Object.defineProperty(proto,'__btcTheme8245StrokeStyle',{value:true,configurable:true});return true
 }catch(e){return false}
}
function patchStroke(){
 const proto=window.CanvasRenderingContext2D?.prototype;if(!proto||proto.__btcTheme8245Stroke)return false;
 const original=proto.stroke;if(typeof original!=='function')return false;
 try{
  Object.defineProperty(proto,'stroke',{configurable:true,writable:true,value:function(...args){
   if(this?.canvas?.id==='chart'){
    const req=this.__btcRequestedStroke8245;
    // Legacy cross marks were directional X marks on EMA10/EMA120 crossings.
    // Suppress them; true indicator-cross markers are drawn after the chart render.
    if((req==='#f0b90b'||req==='#ff8c00')&&Number(this.lineWidth)>=1.8)return;
    if(req==='#7b52d9'){
      const old=this.strokeStyle;
      try{this.strokeStyle=(Number(this.lineWidth)>=1.8)?'#4caf50':'#7b52d9';return original.apply(this,args)}
      finally{try{this.strokeStyle=old}catch(e){}}
    }
   }
   return original.apply(this,args)
  }});
  Object.defineProperty(proto,'__btcTheme8245Stroke',{value:true,configurable:true});return true
 }catch(e){return false}
}
function patchHollowCandles(){
 const proto=window.CanvasRenderingContext2D?.prototype;if(!proto||proto.__btcTheme8245FillRect)return false;
 const original=proto.fillRect,strokeRect=proto.strokeRect;if(typeof original!=='function'||typeof strokeRect!=='function')return false;
 try{
  Object.defineProperty(proto,'fillRect',{configurable:true,writable:true,value:function(x,y,w,h){
   try{
    const c=this?.canvas,fill=norm(this.fillStyle);
    // Candle bodies use solid Binance up/down colors and narrow widths.
    // Volume bars use alpha colors, and price labels are wide, so they are left unchanged.
    if(c?.id==='chart'&&(fill==='#0ecb81'||fill==='#f6465d')&&Math.abs(Number(w))<=30){
      const oldStroke=this.strokeStyle,oldWidth=this.lineWidth;
      try{this.strokeStyle=fill;this.lineWidth=1.15;return strokeRect.call(this,x,y,w,Math.max(1,h))}
      finally{this.strokeStyle=oldStroke;this.lineWidth=oldWidth}
    }
   }catch(e){}
   return original.call(this,x,y,w,h)
  }});
  Object.defineProperty(proto,'__btcTheme8245FillRect',{value:true,configurable:true});return true
 }catch(e){return false}
}
function crossing(a,b,i){
 if(!a||!b||i<=0)return null;
 const a0=Number(a[i-1]),b0=Number(b[i-1]),a1=Number(a[i]),b1=Number(b[i]);
 if(![a0,b0,a1,b1].every(Number.isFinite))return null;
 const d0=a0-b0,d1=a1-b1;if(d0===0&&d1===0)return null;
 if((d0<0&&d1<0)||(d0>0&&d1>0))return null;
 const den=Math.abs(d0)+Math.abs(d1),t=den?Math.abs(d0)/den:.5;
 const v0=(a0+b0)/2,v1=(a1+b1)/2;
 return {t:Math.max(0,Math.min(1,t)),value:v0+(v1-v0)*t};
}
function drawMarkers(){
 const c=document.getElementById('chart'),m=c?._chartMeta;if(!c||!m?.e||!m?.X||!m?.Y)return;
 const {e,X,Y,n}=m,ctx=c.getContext('2d');if(!ctx)return;
 ctx.save();ctx.setLineDash([]);
 // MA/EMA Cross: EMA5 and MA15 crossing. Same orange marker regardless of direction.
 for(let i=1;i<n;i++){
  const q=crossing(e.e5,e.m15,i);if(!q)continue;
  const x=X(i-1)+(X(i)-X(i-1))*q.t,y=Y(q.value);
  ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.strokeStyle='#ff9500';ctx.lineWidth=2;ctx.stroke();
 }
 // EMA Cross: EMA10 and EMA120 crossing. Same red plus marker regardless of direction.
 for(let i=1;i<n;i++){
  const q=crossing(e.e10,e.e120,i);if(!q)continue;
  const x=X(i-1)+(X(i)-X(i-1))*q.t,y=Y(q.value),r=5;
  ctx.beginPath();ctx.moveTo(x-r,y);ctx.lineTo(x+r,y);ctx.moveTo(x,y-r);ctx.lineTo(x,y+r);
  ctx.strokeStyle='#f23645';ctx.lineWidth=2;ctx.stroke();
 }
 ctx.restore();
}
function patchDrawChart(){
 const fn=window.drawChart;if(typeof fn!=='function'||fn.__btc8245Wrapped)return false;
 function wrapped(...args){const out=fn.apply(this,args);try{drawMarkers()}catch(e){}return out}
 wrapped.__btc8245Wrapped=true;wrapped.__btc8245Original=fn;window.drawChart=wrapped;return true
}
function applyCss(){
 const r=document.documentElement.style;r.setProperty('--btc-chart-ma','#ff6d00');r.setProperty('--btc-chart-ema5','#4caf50');r.setProperty('--btc-chart-ema-short','#ffffff');r.setProperty('--btc-chart-ema-long','#4caf50');r.setProperty('--btc-chart-bollinger','#7b52d9');r.setProperty('--btc-chart-cross-maema','#ff9500');r.setProperty('--btc-chart-cross-ema','#f23645')
}
function redraw(){try{window.drawChart?.()}catch(e){}}
function boot(){applyCss();patchStrokeStyle();patchStroke();patchHollowCandles();patchDrawChart();setTimeout(()=>{patchDrawChart();redraw()},80);document.addEventListener('btc-bootstrap-ready',()=>setTimeout(()=>{patchDrawChart();redraw()},120));window.addEventListener('hashchange',()=>{if((location.hash||'').includes('chart'))setTimeout(redraw,80)})}
window.BTCChartTheme={version:V,palette:{ma:'#ff6d00',ema5:'#4caf50',emaShort:'#ffffff',emaLong:'#4caf50',bollinger:'#7b52d9',maEmaCross:'#ff9500',emaCross:'#f23645'},markers:'true-indicator-crossings',candles:'hollow',redraw};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();