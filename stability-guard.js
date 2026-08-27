/* BTC Hedge Assistant v8.21.0 - Runtime Stability Guard / Legacy Safety Bridge */
(function(){'use strict';
if(window.__BTC_STABILITY_GUARD_SINGLETON&&window.BTCStabilityGuard)return;window.__BTC_STABILITY_GUARD_SINGLETON=true;
const V='1.1';let legacyDecide=null,legacyOutcome=null,last=null;
function P(){try{return typeof pos==='function'?pos():null}catch(e){return null}}
function M(){try{return typeof market!=='undefined'?market:(window.market||{})}catch(e){return window.market||{}}}
function patchDecisionUI(reason,validation){
  try{if(typeof currentDecision!=='undefined'&&currentDecision){currentDecision.exec=false;currentDecision.execState='금지';if(reason&&!String(currentDecision.reason||'').includes(reason))currentDecision.reason=(currentDecision.reason?currentDecision.reason+' · ':'')+reason}}catch(e){}
  const es=document.getElementById('execState');if(es){es.textContent='금지';es.className='execBadge execNO'}
  const ds=document.getElementById('decisionStatus');if(ds){ds.className='statusCell statusBad';ds.innerHTML='DECISION<br><b>LIMITED</b>'}
  const blockers=document.getElementById('blockers');if(blockers&&!blockers.textContent.includes('Central Safety'))blockers.insertAdjacentHTML('beforeend','<span class="blocker bad">Central Safety Gate</span>');
  const risk=document.getElementById('riskGate');if(risk)risk.innerHTML='<div class="notice"><b>중앙 Safety Gate 실행 제한</b> · '+reason+(validation&&Number.isFinite(validation.distance)?' · 거리 $'+Math.round(validation.distance).toLocaleString()+' / 필요 $'+Math.round(validation.guard).toLocaleString():'')+'</div>';
}
function enforceDecision(){
  const d=P(),p=Number(M()?.price)||0,core=window.BTCSafetyCore,validation=d&&p&&core?.validate?core.validate(d,p):null;
  const bootstrapOk=!window.BTC_BOOTSTRAP_ERROR,healthOk=window.BTC_DECISION_ALLOWED!==false,coreOk=!!core,validated=validation?.allowed===true,allowed=bootstrapOk&&healthOk&&coreOk&&validated;
  let reason='';
  if(!bootstrapOk)reason='Bootstrap 오류';else if(!healthOk)reason='Runtime Health 미통과';else if(!coreOk)reason='Central Safety Core 없음';else if(!d||!p||!validation)reason='Safety 검증 데이터 대기';else if(!validation.allowed)reason='Central Operating Guard 미충족';
  if(!allowed)patchDecisionUI(reason||'Safety Gate 미통과',validation);
  last={allowed,reason,validation,positionReady:!!d,priceReady:!!p,at:Date.now()};return last;
}
function wrapLegacyDecision(){if(window.__BTC_LEGACY_DECIDE_WRAPPED)return true;if(typeof window.decide!=='function')return false;legacyDecide=window.decide;window.decide=function(){const r=legacyDecide.apply(this,arguments);enforceDecision();return r};window.__BTC_LEGACY_DECIDE_WRAPPED=true;return true}
function nearestClose(rows,targetMs,toleranceMs){const norm=typeof normalizeScannerRows==='function'?normalizeScannerRows(rows):Array.isArray(rows)?rows:[];if(!norm.length)return null;let best=null,diff=Infinity;for(const x of norm){const d=Math.abs(Number(x[0])-targetMs);if(d<diff){best=x;diff=d}}return!best||diff>toleranceMs?null:Number(best[4])}
function outcomePct(entry,exit){return Number.isFinite(entry)&&Number.isFinite(exit)&&entry>0?(exit/entry-1)*100:null}
function fixedOutcome(r){const arr=typeof v80LoadPerf==='function'?v80LoadPerf(r):[],h1=r?.h1?.rows||r?.raw?.h1||r?.h1,h4=r?.h4?.rows||r?.raw?.h4||r?.h4;let changed=false;for(const x of arr){if(!x?.t||!x?.price)continue;if(x.h1==null){const v=outcomePct(Number(x.price),nearestClose(h1,x.t+3600000,4200000));if(v!=null){x.h1=v;changed=true}}if(x.h4==null){const v=outcomePct(Number(x.price),nearestClose(h4,x.t+14400000,9000000));if(v!=null){x.h4=v;changed=true}}if(x.h24==null){const v=outcomePct(Number(x.price),nearestClose(h1,x.t+86400000,5400000));if(v!=null){x.h24=v;changed=true}}}if(changed&&typeof v80SavePerf==='function')v80SavePerf(r,arr);return arr}
function patchScannerOutcome(){if(window.__BTC_SCANNER_OUTCOME_PATCHED)return true;if(typeof window.v80UpdateOutcomes!=='function')return false;legacyOutcome=window.v80UpdateOutcomes;window.v80UpdateOutcomes=fixedOutcome;try{v80UpdateOutcomes=fixedOutcome}catch(e){}window.__BTC_SCANNER_OUTCOME_PATCHED=true;return true}
function refreshServiceWorker(){if(!('serviceWorker'in navigator))return;navigator.serviceWorker.register('./sw.js?v=8210',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{})}
function heal(){wrapLegacyDecision();patchScannerOutcome();enforceDecision();try{window.BTCBootstrap?.applyVersion?.()}catch(e){}return status()}
function status(){return{version:V,decisionWrapped:!!window.__BTC_LEGACY_DECIDE_WRAPPED,scannerOutcomePatched:!!window.__BTC_SCANNER_OUTCOME_PATCHED,last}}
function boot(){heal();[250,800,1800,4000].forEach(ms=>setTimeout(heal,ms));window.__BTC_STABILITY_TIMER=setInterval(enforceDecision,5000);document.addEventListener('btc-system-health',()=>setTimeout(enforceDecision,20));document.addEventListener('btc-safety-core',()=>setTimeout(enforceDecision,20));refreshServiceWorker()}
window.BTCStabilityGuard={version:V,heal,status,enforceDecision,wrapLegacyDecision,patchScannerOutcome};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();