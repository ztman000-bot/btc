/* BTC Hedge Assistant - canonical application configuration */
(function(){'use strict';
  var CONFIG=Object.freeze({
    name:'BTC Hedge Assistant',
    version:'8.19.2',
    architecture:'Architecture Stabilization + Symmetric Hedge Rotation',
    safety:{hardGuardUsd:10000,failSafeOnCriticalModuleLoss:true},
    modules:{
      recovery:'Recovery Engine 2.0',
      shadow:'Shadow 2.0',
      regime:'5-Regime Champion',
      guard:'Dynamic 10K Guard 2.0',
      governance:'Champion–Challenger 2.0',
      rotation:'Symmetric Profit Transfer / Hedge Rotation'
    }
  });
  window.BTC_APP_CONFIG=CONFIG;
  window.BTC_APP_VERSION=CONFIG.version;
  document.documentElement.dataset.btcAppVersion=CONFIG.version;
  document.dispatchEvent(new CustomEvent('btc-app-config-ready',{detail:CONFIG}));
})();
