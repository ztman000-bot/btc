/* BTC Hedge Assistant v8.24.9 - right-side scales for indicator panels */
(()=>{'use strict';
if(window.__BTC_CHART_PANEL_SCALE_8249__)return;window.__BTC_CHART_PANEL_SCALE_8249__=true;
const V='8.24.9';
function drawScales(){
 const c=document.getElementById('chart'),m=c?._chartMeta;if(!c||!m?.e)return;
 let show=true;try{show=showIndicatorPanels!==false}catch(e){}if(!show)return;
 const ctx=c.getContext('2d'),r=c.getBoundingClientRect(),W=r.width,H=r.height,dpr=window.devicePixelRatio||1;if(!ctx||W<50||H<120)return;
 const e=m.e,padR=64,stTop=Math.floor(H*.71),stBottom=Math.floor(H*.84),dmiTop=Math.floor(H*.86),dmiBottom=H-18;
 const x=W-padR+5;
 ctx.save();ctx.font='10px system-ui';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillStyle='#9aa6b2';
 const SY=v=>stBottom-(Math.max(0,Math.min(100,v))/100)*(stBottom-stTop);
 [80,50,20].forEach(v=>ctx.fillText(String(v),x,SY(v)));
 const vals=[...(e.pdi||[]),...(e.mdi||[]),...(e.adx||[])].map(Number).filter(Number.isFinite);let maxD=Math.max(50,...vals);maxD=Math.ceil(maxD/10)*10;
 const DY=v=>dmiBottom-(v/maxD)*(dmiBottom-dmiTop);
 [maxD,Math.round(maxD/2),0].forEach(v=>ctx.fillText(String(v),x,DY(v)));
 ctx.restore();
}
function patch(){const fn=window.drawChart;if(typeof fn!=='function')return false;if(fn.__btc8249ScaleWrapped)return true;function wrapped(...args){const out=fn.apply(this,args);try{drawScales()}catch(e){}return out}wrapped.__btc8249ScaleWrapped=true;wrapped.__btc8249ScaleOriginal=fn;window.drawChart=wrapped;return true}
function boot(){for(let i=0;i<20&&!patch();i++)setTimeout(()=>{if(patch())window.drawChart?.()},80+i*80);document.addEventListener('btc-bootstrap-ready',()=>setTimeout(()=>{patch();window.drawChart?.()},120));window.BTCChartPanelScale={version:V,draw:drawScales,patch}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();