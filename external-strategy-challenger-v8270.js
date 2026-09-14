/* BTC Hedge Assistant - External Strategy Challenger Shadow */
(()=>{'use strict';
if(window.__BTC_EXTERNAL_CHALLENGER__)return;window.__BTC_EXTERNAL_CHALLENGER__=true;
const V='1.0.1',KEY='btc:external-strategy-challenger:v1',MAX=600;
const safeNum=v=>Number.isFinite(Number(v))?Number(v):null,$=id=>document.getElementById(id);
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch(e){return[]}}
function save(a){try{localStorage.setItem(KEY,JSON.stringify(a.slice(-MAX)))}catch(e){}}
function grade(n){return n>=300?'TRUSTED':n>=100?'VALIDATED':n>=30?'CANDIDATE':'EXPERIMENT'}
function scoreCandidate(x,base){
  const wm=safeNum(x?.worstMargin),bg=safeNum(x?.maxGross),bn=safeNum(x?.maxNet),ld=safeNum(x?.minDist),r=safeNum(x?.realized)||0;
  const bwm=safeNum(base?.margin),bgl=safeNum(base?.grossLev),bnl=safeNum(base?.netLev);
  let s=0;
  if(wm!=null&&bwm!=null)s+=(wm-bwm)/100;
  if(bg!=null&&bgl!=null)s+=(bgl-bg)*8;
  if(bn!=null&&bnl!=null)s+=(bnl-bn)*5;
  if(ld!=null)s+=Math.min(ld,100)*0.15;
  s+=r/250;
  return s;
}
function render(){const s=status(),x=s.last,root=$('v8222TodayAnalysisPage')||$('v850HomePane');if(!root||!x)return false;let c=$('externalStrategyChallengerCard');if(!c){c=document.createElement('div');c.id='externalStrategyChallengerCard';c.className='card';root.appendChild(c)}const b=x.best;c.innerHTML=`<div class="row"><div><b>🧪 External Strategy Challenger</b><div class="small">공개 전략 아이디어를 기존 Baseline과 분리해 검증하는 Read-only Shadow</div></div><span class="badge">${s.grade}</span></div><div class="grid3" style="margin-top:8px"><div class="kpi"><div class="small">표본</div><b>${s.samples}</b></div><div class="kpi"><div class="small">현재 후보</div><b>${b?.id||'NONE'}</b></div><div class="kpi"><div class="small">점수</div><b>${Number.isFinite(b?.score)?b.score.toFixed(2):'--'}</b></div></div><div class="tiny" style="margin-top:8px">30 CANDIDATE · 100 VALIDATED · 300 TRUSTED. 주문·Central Safety·기존 v8.26.9 Baseline에는 영향을 주지 않습니다.</div>`;return true}
function evaluate(){
  const ex=window.BTCExposureLeverageShadow?.status?.();
  if(!ex?.base||!Array.isArray(ex.candidates))return null;
  const base=ex.base;
  const candidates=ex.candidates.map(c=>({id:`REDUCE_SHORT_${Number(c.qty||0).toFixed(3)}`,qty:Number(c.qty||0),score:scoreCandidate(c,base),worstMargin:c.worstMargin,maxGross:c.maxGross,maxNet:c.maxNet,minDist:c.minDist,realized:c.realized})).sort((a,b)=>b.score-a.score);
  const best=candidates[0]||null;
  const rec={at:Date.now(),price:ex.price||null,best,candidates,baseline:{margin:base.margin,grossLev:base.grossLev,netLev:base.netLev},readOnly:true};
  const a=load(),sig=[Math.round(Number(rec.price||0)/100),best?.id||'NONE'].join('|');
  if(a.at(-1)?.sig!==sig){a.push({...rec,sig});save(a)}
  window.__BTC_EXTERNAL_CHALLENGER_LAST=rec;render();document.dispatchEvent(new CustomEvent('btc-external-challenger',{detail:rec}));return rec;
}
function status(){const a=load();return{version:V,samples:a.length,grade:grade(a.length),last:window.__BTC_EXTERNAL_CHALLENGER_LAST||a.at(-1)||null,readOnly:true,affectsSafety:false,affectsOrders:false}}
function boot(){setTimeout(evaluate,2200);setInterval(()=>{if(!document.hidden)evaluate()},5*60*1000);document.addEventListener('btc-bootstrap-ready',()=>setTimeout(evaluate,800));document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(evaluate,300)})}
window.BTCExternalStrategyChallenger={version:V,evaluate,status,history:load,render};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();