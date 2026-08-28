/* BTC Hedge Assistant - canonical application configuration */
(function(){'use strict';
  var CONFIG=Object.freeze({
    name:'BTC Hedge Assistant',
    version:'8.22.3',
    architecture:'Compact Summary Home + Canonical 13-Tool Bottom Dock + Persistent Current Price + Restored 7 Strategy Engines + Today Comprehensive Analysis + Runtime Safety Health Monitor + Single Canonical Bootstrap + Full Fail-Closed Safety + 24H Research Daemon + Confirmed-Bar Evidence + Regime Champion 2.1 + Unified Research Health + Symmetric Hedge Rotation + Reversal Intelligence',
    safety:{hardGuardUsd:10000,failSafeOnCriticalModuleLoss:true,confirmedBarEvidence:true,researchFreshMinutes:45,researchStoppedMinutes:120,labFreshMinutes:300,labStoppedMinutes:600,daemonHeartbeatMinutes:35,runtimeErrorWarnCount24h:5,healthCheckMinutes:5,serviceWorkerVersionGuard:true},
    ui:{homeMode:'compact-summary',bottomDockRoutes:['home','scanner','position','trade','chart','risk','research','analysis','daily','settings','alerts','backtest','log'],slotRegistryVersion:'2.2',persistentPrice:true,researchEngineCount:7},
    modules:{
      bootstrap:'Single Canonical Deterministic Bootstrap',
      stability:'Runtime Stability Guard / Legacy Safety Bridge 1.2',
      safety:'Central Safety / Guard Core 2.2 Fail-Closed',
      safetyHealth:'Runtime Safety Health Monitor 1.0',
      shell:'Compact Summary Home + Canonical 13-Tool Bottom Dock',
      uiPatch:'v8.22.3 Strategy Engine Restore + Persistent Price',
      todayAnalysis:'Today Comprehensive Analysis 1.0',
      recovery:'Recovery Engine 2.0',
      shadow:'Shadow 2.2 Confirmed-Bar Forward',
      regime:'5-Regime Champion 2.1',
      guard:'Dynamic 10K Guard 2.1',
      governance:'Champion–Challenger 2.0',
      researchHealth:'Unified Research Health / Daemon Heartbeat / Promotion Freeze 2.1',
      researchDaemon:'Self-Chaining 15m 24H Research Daemon',
      strategyLab:'Dedicated Strategy Research Lab V2 + 7 Live Strategy Engines',
      rotation:'Symmetric Profit Transfer / Hedge Rotation',
      reversal:'Reversal Intelligence Engine'
    }
  });
  window.BTC_APP_CONFIG=CONFIG;
  window.BTC_APP_VERSION=CONFIG.version;
  document.documentElement.dataset.btcAppVersion=CONFIG.version;
  document.dispatchEvent(new CustomEvent('btc-app-config-ready',{detail:CONFIG}));
})();