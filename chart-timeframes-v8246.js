/* BTC Hedge Assistant v8.24.6 - Extended chart timeframes */
(()=>{'use strict';
if(window.__BTC_CHART_TF_8246__)return;window.__BTC_CHART_TF_8246__=true;
const V='8.24.6';
const EXTRA={
  '8h':{key:'h8',label:'8H'},
  '12h':{key:'h12',label:'12H'},
  '3d':{key:'d3',label:'3D'},
  '1w':{key:'w1',label:'1W'},
  '1M':{key:'M1',label:'1M'}
};
const ALL=['15m','1h','4h','8h','12h','1d','3d','1w','1M'];
let loading=new Map();
const oldChartData=window.chartData;
const oldSetTF=window.setTF;
const oldCurrentArrayName=window.currentArrayName;

function keyOf(tf){
  if(EXTRA[tf])return EXTRA[tf].key;
  if(tf==='15m')return 'm15';
  if(tf==='1h')return 'h1';
  if(tf==='1d')return 'd1';
  return 'h4';
}
function getMarket(){try{return market}catch(e){return window.market||null}}
function setChartTf(tf){try{chartTF=tf;return true}catch(e){try{window.chartTF=tf;return true}catch(_){return false}}}
function getChartTf(){try{return chartTF}catch(e){return window.chartTF||'4h'}}
async function loadTF(tf,force=false){
  const m=getMarket(),key=keyOf(tf);if(!m)return null;
  if(!force&&Array.isArray(m[key])&&m[key].length>=120)return m[key];
  if(loading.has(tf))return loading.get(tf);
  const p=(async()=>{
    const url=`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${encodeURIComponent(tf)}&limit=500`;
    const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);
    const rows=await r.json();if(!Array.isArray(rows)||rows.length<30)throw new Error(tf+' 캔들 데이터 부족');
    m[key]=rows;return rows;
  })().finally(()=>loading.delete(tf));
  loading.set(tf,p);return p;
}
function updateButtons(tf){
  ALL.forEach(x=>{const b=document.getElementById('b'+x);if(b)b.classList.toggle('active',x===tf)});
}
function status(text,bad=false){
  const p=document.getElementById('chartPrice');if(!p)return;
  if(text)p.textContent=text;
  p.classList.toggle('warn',!!bad);
}
async function extendedSetTF(tf){
  if(!ALL.includes(tf))return oldSetTF?.(tf);
  setChartTf(tf);updateButtons(tf);
  try{viewCount=100;viewOffset=0}catch(e){}
  if(EXTRA[tf]){
    status(EXTRA[tf].label+' · 불러오는 중');
    try{await loadTF(tf)}catch(e){status(EXTRA[tf].label+' · 데이터 실패',true);console.warn('[BTC chart timeframe]',e);return}
  }
  try{connectKline?.()}catch(e){}
  try{drawChart?.()}catch(e){}
}
function extendedChartData(){
  const tf=getChartTf(),m=getMarket();
  if(!m)return oldChartData?.();
  return m[keyOf(tf)]||oldChartData?.()||[];
}
function extendedCurrentArrayName(){return keyOf(getChartTf())||oldCurrentArrayName?.()}
function makeButton(tf,label){
  const b=document.createElement('button');b.id='b'+tf;b.type='button';b.textContent=label;b.addEventListener('click',()=>extendedSetTF(tf));return b;
}
function injectButtons(){
  const anchor=document.getElementById('b1d'),bar=anchor?.closest('.chartToolbar');if(!anchor||!bar)return false;
  let ref=anchor.nextElementSibling;
  for(const [tf,label] of [['8h','8H'],['12h','12H'],['3d','3D'],['1w','1W'],['1M','1M']]){
    if(document.getElementById('b'+tf))continue;
    const b=makeButton(tf,label);bar.insertBefore(b,ref);
  }
  updateButtons(getChartTf());return true;
}
function boot(){
  window.chartData=extendedChartData;window.setTF=extendedSetTF;window.currentArrayName=extendedCurrentArrayName;
  for(let i=0;i<20&&!injectButtons();i++)setTimeout(injectButtons,100+i*100);
  document.addEventListener('btc-bootstrap-ready',injectButtons);
  window.BTCChartTimeframes={version:V,timeframes:[...ALL],load:loadTF,set:extendedSetTF,keyOf};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();