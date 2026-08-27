/* BTC Hedge Assistant v8.20.3 - compatibility updater bootstrap */
(function(){
'use strict';
var VERSION='8.20.3',B='8203';
function $(id){return document.getElementById(id)}
function patchVersion(){
  try{document.title='BTC Hedge Assistant v'+VERSION}catch(e){}
  var hs=document.querySelectorAll('h1');
  for(var i=0;i<hs.length;i++){
    if(/BTC Hedge Assistant/i.test(hs[i].textContent||''))hs[i].textContent='BTC Hedge Assistant v'+VERSION;
  }
  window.BTC_APP_VERSION=VERSION;
}
function addScript(id,name){
  if($(id))return;
  var s=document.createElement('script');
  s.id=id;
  s.src='./'+name+'?v='+B+'&ts='+Date.now();
  s.async=false;
  s.onerror=function(){console.warn('module load failed',name)};
  document.body.appendChild(s);
}
function loadCore(){
  var m=[
    ['btcVersionGuard8203','version-guard.js'],
    ['btcMobileLayoutFix8203','mobile-layout-fix.js'],
    ['btcStrategyLab8203','strategy-lab.js'],
    ['btcGlobalBrief868','globalbrief-v868.js'],
    ['btcAutoTop10872','auto-top10.js'],
    ['btcTop10History873','top10-history.js'],
    ['btcOpportunityV2881','opportunity-v2.js'],
    ['btcSmartSession882','smart-session.js'],
    ['btcDynamicHedge891','dynamic-hedge.js'],
    ['btcCycleHedge8100','cycle-hedge.js'],
    ['btcRegimeHedge8110','regime-hedge.js'],
    ['btcPathEnsemble8120','path-ensemble.js'],
    ['btcAdaptiveLearning8203','adaptive-learning.js'],
    ['btcExecutionExit8203','execution-exit.js'],
    ['btcStrategyGovernance8203','strategy-governance.js'],
    ['btcMarketStructure8203','market-structure.js'],
    ['btcTerminalWallet8203','terminal-wallet.js'],
    ['btcRecoveryEngine8203','recovery-engine.js'],
    ['btcResearchHealth8203','research-health.js'],
    ['btcResearchShadow8203','research-shadow.js'],
    ['btcSafetyCore8203','safety-core.js']
  ];
  for(var i=0;i<m.length;i++)addScript(m[i][0],m[i][1]);
}
function healModernUI(){
  try{if(window.BTCResearchHealth&&window.BTCResearchHealth.refresh)window.BTCResearchHealth.refresh()}catch(e){}
  try{if(window.BTCResearchShadow&&window.BTCResearchShadow.heal)window.BTCResearchShadow.heal()}catch(e){}
  try{if(window.BTCVersionGuard&&window.BTCVersionGuard.patch)window.BTCVersionGuard.patch()}catch(e){}
  try{if(window.BTCMobileLayoutFix&&window.BTCMobileLayoutFix.repair)window.BTCMobileLayoutFix.repair()}catch(e){}
  try{if(window.BTCStrategyLab&&window.BTCStrategyLab.render)window.BTCStrategyLab.render()}catch(e){}
}
function tick(){patchVersion();loadCore();healModernUI()}
function boot(){
  patchVersion();
  loadCore();
  [200,500,1000,2000,4000].forEach(function(ms){setTimeout(tick,ms)});
  setInterval(function(){patchVersion();healModernUI()},15000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.BTCUpdater={version:VERSION,check:function(){return Promise.resolve(false)},mode:'v8.20.3-modern-ui-compat'};
})();