/* BTC Hedge Assistant - canonical application configuration */
(function(){'use strict';
  var CONFIG=Object.freeze({
    name:'BTC Hedge Assistant',
    version:'8.20.1',
    architecture:'Safety Integration + Confirmed-Bar Evidence + Regime Champion 2.1 + Research Health + Symmetric Hedge Rotation + Reversal Intelligence',
    safety:{hardGuardUsd:10000,failSafeOnCriticalModuleLoss:true,confirmedBarEvidence:true,researchFreshMinutes:45,researchStoppedMinutes:120},
    modules:{
      safety:'Central Safety / Guard Core',
      recovery:'Recovery Engine 2.0',
      shadow:'Shadow 2.1 Confirmed-Bar Forward',
      regime:'5-Regime Champion 2.1',
      guard:'Dynamic 10K Guard 2.1',
      governance:'Champion–Challenger 2.0',
      researchHealth:'Research Health / Promotion Freeze',
      rotation:'Symmetric Profit Transfer / Hedge Rotation',
      reversal:'Reversal Intelligence Engine'
    }
  });
  window.BTC_APP_CONFIG=CONFIG;
  window.BTC_APP_VERSION=CONFIG.version;
  document.documentElement.dataset.btcAppVersion=CONFIG.version;
  document.dispatchEvent(new CustomEvent('btc-app-config-ready',{detail:CONFIG}));
})();
