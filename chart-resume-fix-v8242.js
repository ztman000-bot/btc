/* BTC Hedge Assistant v8.24.9 - hardened chart resume/repaint guard */
(()=>{'use strict';
if(window.__BTC_CHART_RESUME_FIX_8249__)return;window.__BTC_CHART_RESUME_FIX_8249__=true;
const V='8.24.9';let hiddenAt=0,resumes=0,lastReason='boot',lastResumeAt=0,lastReloadAt=0;
function chartEl(){return document.getElementById('chart')}
function isChartRoute(){const c=chartEl(),hash=(location.hash||'').replace('#','');if(hash==='chart'||document.body?.dataset?.btcRoute==='chart'||document.getElementById('v8222ChartPage')?.classList.contains('v8222Active'))return true;if(c){const r=c.getBoundingClientRect();return r.width>8&&r.height>8}return false}
function visibleChart(){const c=chartEl();if(!c)return false;const r=c.getBoundingClientRect();return r.width>8&&r.height>8}
function reviveData(){try{if(typeof liveWS!=='undefined'&&(!liveWS||liveWS.readyState>1))connectLive?.()}catch(e){}try{if(typeof klineWS!=='undefined'&&(!klineWS||klineWS.readyState>1))connectKline?.()}catch(e){}try{const tf=typeof chartTF!=='undefined'?chartTF:null;if(tf&&window.BTCChartTimeframes?.load)window.BTCChartTimeframes.load(tf).then(()=>window.drawChart?.()).catch(()=>{})}catch(e){}}
function hardRepaint(reason='resume'){
 lastReason=reason;lastResumeAt=Date.now();if(!isChartRoute())return false;
 const run=()=>{try{window.BTCChartToolbar?.close?.();const c=chartEl();if(c){void c.offsetWidth;const p=c.parentElement;if(p)void p.offsetHeight}window.dispatchEvent(new Event('resize'));reviveData();if(typeof window.drawChart==='function'&&visibleChart())window.drawChart()}catch(e){window.BTCSafetyHealth?.record?.('chart-resume',String(e?.message||e),'chart-resume-fix-v8242')}};
 requestAnimationFrame(()=>requestAnimationFrame(run));setTimeout(run,100);setTimeout(run,350);setTimeout(run,900);
 setTimeout(()=>{try{const c=chartEl(),ok=visibleChart()&&c?._chartMeta?.n>0;if(!ok&&isChartRoute()){const now=Date.now(),prev=+(sessionStorage.getItem('btc:chart:last-resume-reload')||0);if(now-prev>30000){sessionStorage.setItem('btc:chart:last-resume-reload',String(now));lastReloadAt=now;location.reload()}}}catch(e){}},1600);return true
}
function onVisible(reason){if(document.hidden)return;resumes++;hardRepaint(reason);setTimeout(()=>{try{window.BTCV8223?.updatePrice?.()}catch(e){}},120)}
document.addEventListener('visibilitychange',()=>{if(document.hidden){hiddenAt=Date.now();return}onVisible('visibilitychange')},{passive:true});
window.addEventListener('pageshow',e=>onVisible(e.persisted?'pageshow-bfcache':'pageshow'),{passive:true});
window.addEventListener('focus',()=>onVisible('focus'),{passive:true});
window.addEventListener('online',()=>onVisible('online'),{passive:true});
window.addEventListener('hashchange',()=>{if(isChartRoute())setTimeout(()=>hardRepaint('hashchange'),40)},{passive:true});
document.addEventListener('btc-bootstrap-ready',()=>setTimeout(()=>hardRepaint('bootstrap-ready'),120),{once:true});
window.BTCChartResumeFix={version:V,repaint:hardRepaint,status:()=>({hiddenAt,resumes,lastReason,lastResumeAt,lastReloadAt,chartRoute:isChartRoute(),visible:visibleChart()})};
})();
