/* BTC Hedge Assistant v8.24.2 - chart resume/repaint guard */
(()=>{'use strict';
if(window.__BTC_CHART_RESUME_FIX_8242__)return;window.__BTC_CHART_RESUME_FIX_8242__=true;
const V='8.24.2';let hiddenAt=0,resumes=0,lastReason='boot',lastResumeAt=0;
function isChartRoute(){return (location.hash||'').replace('#','')==='chart'||document.body?.dataset?.btcRoute==='chart'||document.getElementById('v8222ChartPage')?.classList.contains('v8222Active')}
function visibleChart(){const c=document.getElementById('chart');if(!c)return false;const r=c.getBoundingClientRect();return r.width>8&&r.height>8}
function repaint(reason='resume'){
 lastReason=reason;lastResumeAt=Date.now();if(!isChartRoute())return false;
 const run=()=>{try{window.dispatchEvent(new Event('resize'));if(typeof window.drawChart==='function'&&visibleChart())window.drawChart()}catch(e){window.BTCSafetyHealth?.record?.('chart-resume',String(e?.message||e),'chart-resume-fix-v8242')}};
 requestAnimationFrame(run);setTimeout(run,90);setTimeout(run,280);setTimeout(run,750);return true
}
function onVisible(reason){if(document.hidden)return;resumes++;repaint(reason);setTimeout(()=>{try{window.BTCV8223?.updatePrice?.()}catch(e){}},120)}
document.addEventListener('visibilitychange',()=>{if(document.hidden){hiddenAt=Date.now();return}onVisible('visibilitychange')},{passive:true});
window.addEventListener('pageshow',e=>onVisible(e.persisted?'pageshow-bfcache':'pageshow'),{passive:true});
window.addEventListener('focus',()=>onVisible('focus'),{passive:true});
window.addEventListener('hashchange',()=>{if(isChartRoute())setTimeout(()=>repaint('hashchange'),40)},{passive:true});
document.addEventListener('btc-bootstrap-ready',()=>setTimeout(()=>repaint('bootstrap-ready'),120),{once:true});
window.BTCChartResumeFix={version:V,repaint,status:()=>({hiddenAt,resumes,lastReason,lastResumeAt,chartRoute:isChartRoute(),visible:visibleChart()})};
})();
