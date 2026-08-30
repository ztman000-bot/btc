/* BTC Hedge Assistant v8.24.7 - compact chart toolbar with period/indicator groups */
(()=>{'use strict';
if(window.__BTC_CHART_TOOLBAR_8247__)return;window.__BTC_CHART_TOOLBAR_8247__=true;
const V='8.24.7';
const PRIMARY_TF=['15m','1h','4h','1d'];
const EXTRA_TF=['8h','12h','3d','1w','1M'];
function el(t,c){const x=document.createElement(t);if(c)x.className=c;return x}
function btn(label,fn,cls=''){const b=el('button',cls);b.type='button';b.textContent=label;b.addEventListener('click',fn);return b}
function closeOthers(except){document.querySelectorAll('.btcChartMorePanel.open').forEach(p=>{if(p!==except)p.classList.remove('open')})}
function style(){if(document.getElementById('btcChartToolbar8247Style'))return;const s=document.createElement('style');s.id='btcChartToolbar8247Style';s.textContent=`
.btcChartToolbar8247{display:grid;gap:8px;margin:8px 0 10px}.btcChartToolRow{display:grid;grid-template-columns:42px 1fr;gap:8px;align-items:start}.btcChartToolLabel{font-size:11px;color:#8e9aaa;padding-top:10px}.btcChartToolBtns{display:flex;gap:6px;flex-wrap:wrap;position:relative}.btcChartToolBtns button{width:auto;min-width:48px;white-space:nowrap;padding:8px 10px}.btcChartMoreWrap{position:relative}.btcChartMorePanel{display:none;position:absolute;z-index:90;top:44px;right:0;min-width:190px;padding:8px;border:1px solid #334155;border-radius:12px;background:#0d1621;box-shadow:0 14px 34px #0008}.btcChartMorePanel.open{display:grid;grid-template-columns:repeat(2,minmax(70px,1fr));gap:6px}.btcChartMorePanel button{width:100%}.btcChartIndicatorMore{min-width:240px!important;grid-template-columns:repeat(2,minmax(95px,1fr))!important}.btcChartMoreToggle.activeMore{outline:1px solid #3b82f6;background:#15263d}
@media(max-width:420px){.btcChartToolRow{grid-template-columns:36px 1fr}.btcChartToolBtns{gap:5px}.btcChartToolBtns button{padding:8px 9px;min-width:44px}.btcChartMorePanel{position:fixed;left:14px;right:14px;top:auto;bottom:108px;min-width:0}.btcChartIndicatorMore{min-width:0!important}}
`;document.head.appendChild(s)}
function getOriginalToolbar(){const b=document.getElementById('b4h');return b?.closest('.chartToolbar')||null}
function tfButton(tf,label){const old=document.getElementById('b'+tf);if(old){old.textContent=label;return old}return btn(label,()=>window.setTF?.(tf))}
function collectIndicatorButtons(bar){const out=[];[...bar.querySelectorAll('button')].forEach(b=>{if(/^b(15m|1h|4h|8h|12h|1d|3d|1w|1M)$/.test(b.id||''))return;const txt=(b.textContent||'').trim();const oc=b.getAttribute('onclick')||'';if(/toggleOverlay|zoomChart|resetChartView|zoomToPositions/.test(oc)||/EMA|MA|BB|Boll|ST|Cross|Position|포지션|지표|초기화|확대|축소/i.test(txt))out.push(b)});return out}
function build(){const bar=getOriginalToolbar();if(!bar||bar.dataset.compact8247==='1')return false;style();bar.dataset.compact8247='1';const host=el('div','btcChartToolbar8247');bar.parentNode.insertBefore(host,bar);bar.style.display='none';
 const row1=el('div','btcChartToolRow'),lab1=el('div','btcChartToolLabel');lab1.textContent='기간';const tfbox=el('div','btcChartToolBtns');row1.append(lab1,tfbox);host.appendChild(row1);
 PRIMARY_TF.forEach(tf=>tfbox.appendChild(tfButton(tf,tf==='1d'?'1D':tf)));
 const mw=el('div','btcChartMoreWrap'),mt=btn('더보기 ▾',()=>{mp.classList.toggle('open');mt.classList.toggle('activeMore',mp.classList.contains('open'));closeOthers(mp)} ,'btcChartMoreToggle'),mp=el('div','btcChartMorePanel');EXTRA_TF.forEach(tf=>mp.appendChild(tfButton(tf,tf==='1M'?'1M':tf.toUpperCase())));mw.append(mt,mp);tfbox.appendChild(mw);
 const row2=el('div','btcChartToolRow'),lab2=el('div','btcChartToolLabel');lab2.textContent='지표';const ibox=el('div','btcChartToolBtns');row2.append(lab2,ibox);host.appendChild(row2);
 const inds=collectIndicatorButtons(bar);const preferred=[],more=[];inds.forEach(b=>{const t=(b.textContent||'').trim();if(/^(EMA5|MA15)$/i.test(t))preferred.push(b);else more.push(b)});preferred.forEach(b=>ibox.appendChild(b));
 if(more.length){const iw=el('div','btcChartMoreWrap'),it=btn('더보기 ▾',()=>{ip.classList.toggle('open');it.classList.toggle('activeMore',ip.classList.contains('open'));closeOthers(ip)},'btcChartMoreToggle'),ip=el('div','btcChartMorePanel btcChartIndicatorMore');more.forEach(b=>ip.appendChild(b));iw.append(it,ip);ibox.appendChild(iw)}
 document.addEventListener('click',e=>{if(!host.contains(e.target)){document.querySelectorAll('.btcChartMorePanel.open').forEach(p=>p.classList.remove('open'));document.querySelectorAll('.btcChartMoreToggle.activeMore').forEach(b=>b.classList.remove('activeMore'))}});
 return true}
function boot(){for(let i=0;i<25;i++)setTimeout(()=>build(),100+i*120);document.addEventListener('btc-bootstrap-ready',build);window.BTCChartToolbar={version:V,rebuild:build}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();