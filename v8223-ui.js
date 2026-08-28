/* BTC Hedge Assistant v8.22.3 - strategy engine restore + persistent price */
(()=>{'use strict';
if(window.__BTC_V8223_UI__)return;window.__BTC_V8223_UI__=true;
const $=id=>document.getElementById(id);
const ENGINES=[
 ['adaptiveLearningCard','🧠','Robust Adaptive Optimizer'],
 ['reversalIntelligenceCard','🧠','Reversal Intelligence Engine'],
 ['strategyGovernanceCard','🛡️','Strategy Governance'],
 ['terminalWalletCard','🧮','Fast Local Terminal Wallet Estimate'],
 ['hedgeRotationCard','↔️','Profit Transfer / Hedge Rotation'],
 ['recoveryEngineCard','🎯','Adaptive Recovery + Central Safety Guard'],
 ['executionExitCard','🎯','Execution Reality + Final Exit']
];
function style(){if($('v8223UiStyle'))return;const s=document.createElement('style');s.id='v8223UiStyle';s.textContent=`
#v8223PriceStrip{position:sticky;top:0;z-index:49;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 12px;margin:0 auto 8px;max-width:980px;background:#0b1118f2;border-bottom:1px solid #27323f;backdrop-filter:blur(8px)}#v8223PriceStrip .pL{min-width:0}#v8223PriceStrip .sym{font-size:10px;color:#9aa6b2}#v8223PriceStrip .px{font-size:22px;font-weight:900;line-height:1.1}#v8223PriceStrip .meta{font-size:10px;color:#9aa6b2;margin-top:2px}#v8223PriceStrip .live{border:1px solid #285c48;color:#9ff0cf;border-radius:999px;padding:4px 7px;font-size:9px;white-space:nowrap}
body[data-btc-route="home"] #v8223PriceStrip{display:none}
#adaptiveLearningCard,#reversalIntelligenceCard,#strategyGovernanceCard,#terminalWalletCard,#hedgeRotationCard,#recoveryEngineCard,#executionExitCard{display:none!important}
#v8223EngineHost #adaptiveLearningCard,#v8223EngineHost #reversalIntelligenceCard,#v8223EngineHost #strategyGovernanceCard,#v8223EngineHost #terminalWalletCard,#v8223EngineHost #hedgeRotationCard,#v8223EngineHost #recoveryEngineCard,#v8223EngineHost #executionExitCard{display:block!important;margin:0!important}
#v8223EngineHost{margin:12px 0 14px}.v8223EngineHero{padding:13px 14px;border:1px solid #35517a;border-radius:16px;background:linear-gradient(180deg,#14243a,#0e1825);margin-bottom:9px}.v8223EngineHero b{font-size:18px}.v8223EngineHero div{font-size:10px;color:#9aa6b2;line-height:1.5;margin-top:4px}.v8223EngineWrap{border:1px solid #27323f;border-radius:15px;background:#0d1620;margin-bottom:8px;overflow:hidden}.v8223EngineWrap>summary{cursor:pointer;list-style:none;padding:11px 12px;font-weight:800;font-size:13px;display:flex;align-items:center;gap:7px}.v8223EngineWrap>summary::-webkit-details-marker{display:none}.v8223EngineWrap>summary:after{content:'열기';margin-left:auto;font-size:9px;color:#8fa0b5}.v8223EngineWrap[open]>summary:after{content:'접기'}.v8223EngineBody{padding:0 7px 7px}
@media(max-width:520px){#v8223PriceStrip{padding:7px 10px}#v8223PriceStrip .px{font-size:20px}.v8223EngineWrap>summary{font-size:12px}}
`;document.head.appendChild(s)}
function route(){const r=(location.hash||'#home').slice(1)||'home';document.body.dataset.btcRoute=r;return r}
function numText(v){const n=Number(String(v??'').replace(/[^0-9.-]/g,''));return Number.isFinite(n)?'$'+n.toLocaleString(undefined,{maximumFractionDigits:1}):String(v||'--')}
function currentPrice(){let t=$('price')?.textContent?.trim();if(t&&/[0-9]/.test(t))return t;const p=Number(window.market?.price);return Number.isFinite(p)?'$'+p.toLocaleString(undefined,{maximumFractionDigits:1}):'--'}
function currentMark(){let t=$('mark')?.textContent?.trim();if(t&&/[0-9]/.test(t))return t;const p=Number(window.market?.markPrice||window.market?.price);return Number.isFinite(p)?p.toLocaleString(undefined,{maximumFractionDigits:1}):'--'}
function ensurePrice(){let p=$('v8223PriceStrip');if(!p){p=document.createElement('div');p.id='v8223PriceStrip';p.innerHTML='<div class="pL"><div class="sym">BTCUSDT Perp · 현재 가격</div><div class="px" id="v8223Price">--</div><div class="meta" id="v8223PriceMeta">Mark --</div></div><div class="live">MARKET LIVE</div>';const h=document.querySelector('header');if(h?.nextSibling)h.parentNode.insertBefore(p,h.nextSibling);else document.body.insertBefore(p,document.body.firstChild)}return p}
function updatePrice(){ensurePrice();const p=currentPrice();$('v8223Price').textContent=p.startsWith('$')?p:numText(p);$('v8223PriceMeta').textContent='Mark '+currentMark()+' · '+new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});route()}
function ensureEngineHost(){const lab=$('strategyLab');if(!lab)return null;let h=$('v8223EngineHost');if(!h){h=document.createElement('section');h.id='v8223EngineHost';h.innerHTML='<div class="v8223EngineHero"><b>실전 전략 엔진 7종</b><div>Optimizer → Reversal → Governance → Terminal Wallet → Hedge Rotation → Recovery Guard → Final Exit 순으로 확인합니다. 각 엔진은 접어서 볼 수 있습니다.</div></div>';const aux=$('v8222ResearchAuxSlot')||$('v8222ResearchShadowSlot');if(aux&&aux.parentElement===lab)lab.insertBefore(h,aux);else lab.appendChild(h)}return h}
function ensureWrap(host,id,icon,title){let d=$('v8223Wrap_'+id);if(!d){d=document.createElement('details');d.id='v8223Wrap_'+id;d.className='v8223EngineWrap';if(id==='adaptiveLearningCard'||id==='recoveryEngineCard')d.open=true;d.innerHTML=`<summary>${icon}<span>${title}</span></summary><div class="v8223EngineBody"></div>`;host.appendChild(d)}return d.querySelector('.v8223EngineBody')}
function rehomeEngines(){const host=ensureEngineHost();if(!host)return;for(const [id,icon,title] of ENGINES){const body=ensureWrap(host,id,icon,title),card=$(id);if(card&&card.parentElement!==body)body.appendChild(card)} }
function refresh(){style();route();updatePrice();rehomeEngines()}
function boot(){refresh();setInterval(updatePrice,2000);setInterval(rehomeEngines,1200);window.addEventListener('hashchange',()=>{route();setTimeout(rehomeEngines,60)});document.addEventListener('btc-bootstrap-ready',()=>setTimeout(refresh,100));document.addEventListener('btc-strategy-lab-rendered',()=>setTimeout(rehomeEngines,50));new MutationObserver(()=>{route();rehomeEngines()}).observe(document.body,{childList:true,subtree:true})}
window.BTCV8223={refresh,rehomeEngines,updatePrice,engines:ENGINES.map(x=>x[0])};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();