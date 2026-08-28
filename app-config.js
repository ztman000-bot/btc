/* BTC Hedge Assistant - canonical application configuration */
(function(){'use strict';
  var CONFIG=Object.freeze({
    name:'BTC Hedge Assistant',
    version:'8.21.3',
    architecture:'Single Canonical Bootstrap + Runtime Stability Guard + Canonical Hedge Dashboard Home + Dedicated 24H Research Home Slot + 24H Research Daemon + Safety Integration + Confirmed-Bar Evidence + Regime Champion 2.1 + Unified Research Health + Symmetric Hedge Rotation + Reversal Intelligence + Dedicated Strategy Lab Route',
    safety:{hardGuardUsd:10000,failSafeOnCriticalModuleLoss:true,confirmedBarEvidence:true,researchFreshMinutes:45,researchStoppedMinutes:120,labFreshMinutes:300,labStoppedMinutes:600,daemonHeartbeatMinutes:35},
    modules:{
      bootstrap:'Single Canonical Deterministic Bootstrap',
      stability:'Runtime Stability Guard / Legacy Safety Bridge',
      shell:'Canonical Hedge Dashboard Home + Dedicated Research Slot',
      safety:'Central Safety / Guard Core 2.1',
      recovery:'Recovery Engine 2.0',
      shadow:'Shadow 2.1 Confirmed-Bar Forward / Pinned Home Dashboard',
      regime:'5-Regime Champion 2.1',
      guard:'Dynamic 10K Guard 2.1',
      governance:'Champion–Challenger 2.0',
      researchHealth:'Unified Research Health / Daemon Heartbeat / Promotion Freeze 2.1',
      researchDaemon:'Self-Chaining 15m 24H Research Daemon',
      strategyLab:'Dedicated Strategy Research Lab V2 Route',
      rotation:'Symmetric Profit Transfer / Hedge Rotation',
      reversal:'Reversal Intelligence Engine'
    }
  });
  window.BTC_APP_CONFIG=CONFIG;
  window.BTC_APP_VERSION=CONFIG.version;
  document.documentElement.dataset.btcAppVersion=CONFIG.version;
  document.dispatchEvent(new CustomEvent('btc-app-config-ready',{detail:CONFIG}));
})();