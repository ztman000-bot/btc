/* BTC Hedge Assistant v8.19.2 - startup health registry */
(function(){'use strict';
  var ID='btcStartupHealth',timer=null,last=null;
  function ok(path){try{return !!path()}catch(e){return false}}
  function checks(){return [
    {key:'recovery',label:'Recovery Engine 2.0',critical:true,ok:ok(function(){return window.BTCRecoveryEngine})},
    {key:'regime',label:'5-Regime Champion',critical:true,ok:ok(function(){return window.BTCRegimeHedge})},
    {key:'adaptive',label:'Adaptive / Champion',critical:true,ok:ok(function(){return window.BTCAdaptiveLearning})},
    {key:'governance',label:'Champion–Challenger 2.0',critical:true,ok:ok(function(){return window.BTCStrategyGovernance})},
    {key:'terminal',label:'Expected Terminal Wallet',critical:true,ok:ok(function(){return window.BTCTerminalWallet})},
    {key:'rotation',label:'Symmetric Hedge Rotation',critical:false,ok:ok(function(){return window.BTCHedgeRotation})},
    {key:'shadow',label:'Shadow Research',critical:false,ok:ok(function(){return window.BTCResearchShadow})},
    {key:'lab',label:'Strategy Lab',critical:false,ok:ok(function(){return window.BTCStrategyLab})},
    {key:'exit',label:'Optimal Exit Engine',critical:false,ok:ok(function(){return window.BTCExecutionExit})}
  ]}
  function state(){var c=checks(),miss=c.filter(function(x){return x.critical&&!x.ok}),soft=c.filter(function(x){return !x.critical&&!x.ok});return{version:window.BTC_APP_VERSION||'--',ready:miss.length===0,criticalMissing:miss.map(function(x){return x.label}),optionalMissing:soft.map(function(x){return x.label}),checks:c,at:Date.now()}}
  function ensure(){var el=document.getElementById(ID);if(el)return el;el=document.createElement('div');el.id=ID;el.className='card';el.style.cssText='border:1px solid #35517a;background:#0d1722;margin:10px auto;max-width:1180px';var main=document.querySelector('main');if(main)main.insertBefore(el,main.firstChild);return el}
  function render(){last=state();window.BTC_SYSTEM_HEALTH=last;window.BTC_DECISION_ALLOWED=last.ready;var el=ensure();if(!el)return last;var good=last.ready,cls=good?'okbox':'notice',title=good?'SYSTEM READY':'SYSTEM DEGRADED — Trading Decision Limited';var missing=last.criticalMissing.length?' · 누락: '+last.criticalMissing.join(', '):'';var optional=last.optionalMissing.length?' · 연구/보조모듈 대기: '+last.optionalMissing.join(', '):'';el.innerHTML='<div class="row"><div><b>🩺 Startup Health Check</b><div class="small">v'+last.version+' · 핵심 모듈 부팅 검증</div></div><span class="badge">'+(good?'READY':'LIMITED')+'</span></div><div class="'+cls+'"><b>'+title+'</b>'+missing+optional+'</div><div class="tiny" style="margin-top:6px">핵심 모듈이 누락되면 BTC_DECISION_ALLOWED=false로 설정됩니다. Hedge Rotation은 기존 전략을 대체하지 않는 보조 의사결정 모듈이며 10K Guard 및 기존 전략 로직이 우선합니다.</div>';var ds=document.getElementById('decisionStatus');if(ds&&!good){ds.className='statusCell statusBad';ds.innerHTML='DECISION<br><b>LIMITED</b>'}document.dispatchEvent(new CustomEvent('btc-system-health',{detail:last}));return last}
  function boot(){render();var tries=0;timer=setInterval(function(){render();tries++;if(tries>=20&&last&&last.ready){clearInterval(timer);timer=null}},750);setTimeout(render,5000);setTimeout(render,12000)}
  window.BTCStartupHealth={version:'8.19.2',status:function(){return last||state()},render:render};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
