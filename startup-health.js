/* BTC Hedge Assistant v8.21.0 - persistent startup/system health registry */
(function(){'use strict';
if(window.__BTC_STARTUP_HEALTH_SINGLETON&&window.BTCStartupHealth)return;window.__BTC_STARTUP_HEALTH_SINGLETON=true;
const ID='btcStartupHealth';let timer=null,last=null;
function ok(path){try{return !!path()}catch(e){return false}}
function checks(){return [
  {key:'safety',label:'Central Safety / Guard Core',critical:true,ok:ok(()=>window.BTCSafetyCore)},
  {key:'recovery',label:'Recovery Engine 2.0',critical:true,ok:ok(()=>window.BTCRecoveryEngine)},
  {key:'regime',label:'5-Regime Champion',critical:true,ok:ok(()=>window.BTCRegimeHedge)},
  {key:'adaptive',label:'Adaptive / Champion',critical:true,ok:ok(()=>window.BTCAdaptiveLearning)},
  {key:'governance',label:'Champion–Challenger 2.0',critical:true,ok:ok(()=>window.BTCStrategyGovernance)},
  {key:'terminal',label:'Expected Terminal Wallet',critical:true,ok:ok(()=>window.BTCTerminalWallet)},
  {key:'stability',label:'Stability Guard',critical:true,ok:ok(()=>window.BTCStabilityGuard)},
  {key:'researchHealth',label:'Unified Research Health',critical:false,ok:ok(()=>window.BTCResearchHealth)},
  {key:'reversal',label:'Reversal Intelligence',critical:false,ok:ok(()=>window.BTCReversalIntelligence)},
  {key:'rotation',label:'Symmetric Hedge Rotation',critical:false,ok:ok(()=>window.BTCHedgeRotation)},
  {key:'shadow',label:'Shadow Research',critical:false,ok:ok(()=>window.BTCResearchShadow)},
  {key:'lab',label:'Strategy Lab',critical:false,ok:ok(()=>window.BTCStrategyLab)},
  {key:'exit',label:'Optimal Exit Engine',critical:false,ok:ok(()=>window.BTCExecutionExit)}
]}
function state(){const c=checks(),miss=c.filter(x=>x.critical&&!x.ok),soft=c.filter(x=>!x.critical&&!x.ok),guard=window.BTCSafetyCore?.current?.()||null,rh=window.BTCResearchHealth?.status?.()||window.BTC_RESEARCH_HEALTH||null,bootstrapOk=!window.BTC_BOOTSTRAP_ERROR;return{version:window.BTC_APP_VERSION||'--',ready:miss.length===0&&bootstrapOk,criticalMissing:miss.map(x=>x.label),optionalMissing:soft.map(x=>x.label),guard,research:rh,bootstrapError:window.BTC_BOOTSTRAP_ERROR||'',checks:c,at:Date.now()}}
function home(){return document.getElementById('v850HomePane')||document.querySelector('main')}
function ensure(){let el=document.getElementById(ID);if(el)return el;el=document.createElement('div');el.id=ID;el.className='card';el.style.cssText='border:1px solid #35517a;background:#0d1722;margin:10px auto;max-width:1180px';const p=home();if(p)p.insertBefore(el,p.firstChild);return el}
function render(){last=state();window.BTC_SYSTEM_HEALTH=last;window.BTC_DECISION_ALLOWED=last.ready;const el=ensure();if(!el)return last;const good=last.ready,cls=good?'okbox':'notice',title=good?'SYSTEM READY':'SYSTEM DEGRADED — Trading Decision Limited',missing=last.criticalMissing.length?' · 누락: '+last.criticalMissing.join(', '):'',optional=last.optionalMissing.length?' · 연구/보조모듈 대기: '+last.optionalMissing.join(', '):'',g=last.guard?' · Guard '+Math.round(last.guard.operating/1000)+'K ('+last.guard.source+')':'',r=last.research?' · Research '+last.research.research.status+' / Lab '+last.research.lab.status:'',bootErr=last.bootstrapError?' · Bootstrap '+last.bootstrapError:'';el.innerHTML='<div class="row"><div><b>🩺 Startup / Runtime Health</b><div class="small">v'+last.version+' · 핵심 모듈 지속 검증'+g+r+'</div></div><span class="badge">'+(good?'READY':'LIMITED')+'</span></div><div class="'+cls+'"><b>'+title+'</b>'+missing+optional+bootErr+'</div><div class="tiny" style="margin-top:6px">핵심 모듈/Bootstrap 누락 시 BTC_DECISION_ALLOWED=false. Research/Lab가 STALE이어도 로컬 안전판정은 유지하지만 서버 Champion·Monte Carlo·Lab 승격은 자동 동결됩니다. 중앙 Safety Core 운영 Guard는 10K 절대 하한보다 항상 우선합니다.</div>';const ds=document.getElementById('decisionStatus');if(ds&&!good){ds.className='statusCell statusBad';ds.innerHTML='DECISION<br><b>LIMITED</b>'}document.dispatchEvent(new CustomEvent('btc-system-health',{detail:last}));return last}
function boot(){render();let tries=0;timer=setInterval(()=>{render();tries++;if(tries>=20){clearInterval(timer);timer=null}},750);setTimeout(render,5000);setTimeout(render,12000);window.__BTC_STARTUP_HEALTH_TIMER=setInterval(render,30000);document.addEventListener('btc-safety-core',()=>setTimeout(render,20));document.addEventListener('btc-research-health',()=>setTimeout(render,20));document.addEventListener('btc-bootstrap-ready',()=>setTimeout(render,20))}
window.BTCStartupHealth={version:'2.1',status:()=>last||state(),render};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();