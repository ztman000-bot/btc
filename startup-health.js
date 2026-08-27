/* BTC Hedge Assistant v8.20.2 - persistent startup/system health registry */
(function(){'use strict';
  var ID='btcStartupHealth',timer=null,last=null;
  function ok(path){try{return !!path()}catch(e){return false}}
  function checks(){return [
    {key:'safety',label:'Central Safety / Guard Core',critical:true,ok:ok(function(){return window.BTCSafetyCore})},
    {key:'recovery',label:'Recovery Engine 2.0',critical:true,ok:ok(function(){return window.BTCRecoveryEngine})},
    {key:'regime',label:'5-Regime Champion',critical:true,ok:ok(function(){return window.BTCRegimeHedge})},
    {key:'adaptive',label:'Adaptive / Champion',critical:true,ok:ok(function(){return window.BTCAdaptiveLearning})},
    {key:'governance',label:'Champion–Challenger 2.0',critical:true,ok:ok(function(){return window.BTCStrategyGovernance})},
    {key:'terminal',label:'Expected Terminal Wallet',critical:true,ok:ok(function(){return window.BTCTerminalWallet})},
    {key:'researchHealth',label:'Unified Research Health',critical:false,ok:ok(function(){return window.BTCResearchHealth})},
    {key:'reversal',label:'Reversal Intelligence',critical:false,ok:ok(function(){return window.BTCReversalIntelligence})},
    {key:'rotation',label:'Symmetric Hedge Rotation',critical:false,ok:ok(function(){return window.BTCHedgeRotation})},
    {key:'shadow',label:'Shadow Research',critical:false,ok:ok(function(){return window.BTCResearchShadow})},
    {key:'lab',label:'Strategy Lab',critical:false,ok:ok(function(){return window.BTCStrategyLab})},
    {key:'exit',label:'Optimal Exit Engine',critical:false,ok:ok(function(){return window.BTCExecutionExit})}
  ]}
  function state(){var c=checks(),miss=c.filter(function(x){return x.critical&&!x.ok}),soft=c.filter(function(x){return !x.critical&&!x.ok}),guard=window.BTCSafetyCore?.current?.()||null,rh=window.BTCResearchHealth?.status?.()||window.BTC_RESEARCH_HEALTH||null;return{version:window.BTC_APP_VERSION||'--',ready:miss.length===0,criticalMissing:miss.map(function(x){return x.label}),optionalMissing:soft.map(function(x){return x.label}),guard:guard,research:rh,checks:c,at:Date.now()}}
  function ensure(){var el=document.getElementById(ID);if(el)return el;el=document.createElement('div');el.id=ID;el.className='card';el.style.cssText='border:1px solid #35517a;background:#0d1722;margin:10px auto;max-width:1180px';var main=document.querySelector('main');if(main)main.insertBefore(el,main.firstChild);return el}
  function render(){last=state();window.BTC_SYSTEM_HEALTH=last;window.BTC_DECISION_ALLOWED=last.ready;var el=ensure();if(!el)return last;var good=last.ready,cls=good?'okbox':'notice',title=good?'SYSTEM READY':'SYSTEM DEGRADED — Trading Decision Limited';var missing=last.criticalMissing.length?' · 누락: '+last.criticalMissing.join(', '):'';var optional=last.optionalMissing.length?' · 연구/보조모듈 대기: '+last.optionalMissing.join(', '):'';var g=last.guard?' · Guard '+Math.round(last.guard.operating/1000)+'K ('+last.guard.source+')':'';var r=last.research?' · Research '+last.research.research.status+' / Lab '+last.research.lab.status:'';el.innerHTML='<div class="row"><div><b>🩺 Startup / Runtime Health</b><div class="small">v'+last.version+' · 핵심 모듈 지속 검증'+g+r+'</div></div><span class="badge">'+(good?'READY':'LIMITED')+'</span></div><div class="'+cls+'"><b>'+title+'</b>'+missing+optional+'</div><div class="tiny" style="margin-top:6px">핵심 모듈 누락 시 BTC_DECISION_ALLOWED=false. Research/Lab가 STALE이어도 로컬 안전판정은 유지하지만 서버 Champion·Monte Carlo·Lab 승격은 자동 동결됩니다. 중앙 Safety Core 운영 Guard는 10K 절대 하한보다 항상 우선합니다.</div>';var ds=document.getElementById('decisionStatus');if(ds&&!good){ds.className='statusCell statusBad';ds.innerHTML='DECISION<br><b>LIMITED</b>'}document.dispatchEvent(new CustomEvent('btc-system-health',{detail:last}));return last}
  function boot(){render();var tries=0;timer=setInterval(function(){render();tries++;if(tries>=20){clearInterval(timer);timer=null}},750);setTimeout(render,5000);setTimeout(render,12000);setInterval(render,30000);document.addEventListener('btc-safety-core',function(){setTimeout(render,20)});document.addEventListener('btc-research-health',function(){setTimeout(render,20)})}
  window.BTCStartupHealth={version:'8.20.2',status:function(){return last||state()},render:render};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
