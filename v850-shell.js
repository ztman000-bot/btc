/* BTC Hedge Assistant v8.20.4 - Modern Mobile Shell compatibility */
(()=>{
'use strict';
const FALLBACK_VERSION='8.20.4';
const NAV=[['home','홈'],['scanner','스캐너'],['position','포지션'],['daily','일일 시황'],['more','더보기']];
const MORE=[
 ['strategyLab','🧪 전략 연구소','24H Research · Forward/OOS · Champion 검증'],
 ['trade','실전 매매표','현재 가격구간 행동 로드맵'],
 ['settings','전략 설정','지표·안전거리·거래량 기준'],
 ['alerts','알림','가격·전략 알림 관리'],
 ['backtest','백테스트','전략 성과와 MDD 검증'],
 ['log','실행 기록','판단 실행 및 학습 기록'],
 ['chart','차트','지표 차트와 가격 레벨 확인']
];
const $=id=>document.getElementById(id);
const TOOL_IDS=new Set(['strategyLab','scanner','position','dailyBriefPane','trade','settings','alerts','backtest','log','v851ChartPane','v850MorePane']);
function version(){return window.BTC_APP_CONFIG?.version||window.BTC_APP_VERSION||FALLBACK_VERSION}
function injectStyle(){if($('v853Style'))return;const s=document.createElement('style');s.id='v853Style';s.textContent=`
body.v853{padding-bottom:92px}
body.v853 main>.v853Page{display:none!important}
body.v853 main>.v853Page.v853Active{display:block!important}
body.v853 main>.topTabsSticky,body.v853 main>.v82TabsHint{display:none!important}
#v850HomePane,#v850MorePane,#strategyLab{max-width:980px;margin:0 auto;padding:2px 0 110px}
#v850HomePane>.card,#v850HomePane>.grid3{margin-bottom:10px}
footer.v850Nav{grid-template-columns:repeat(5,1fr)!important;gap:4px!important;padding:7px 8px max(8px,env(safe-area-inset-bottom))!important}
footer.v850Nav button{background:transparent;border-color:transparent;border-radius:12px;min-height:50px;padding:5px 1px;font-size:10px;color:#a7b3c0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
footer.v850Nav button::before{font-size:18px;line-height:1}
footer.v850Nav button[data-route=home]::before{content:'⌂'}footer.v850Nav button[data-route=scanner]::before{content:'⌕'}footer.v850Nav button[data-route=position]::before{content:'◫'}footer.v850Nav button[data-route=daily]::before{content:'☼'}footer.v850Nav button[data-route=more]::before{content:'•••'}
footer.v850Nav button.active{background:#172a46!important;border-color:#315a91!important;color:#eef6ff}
.v850Hero{background:linear-gradient(180deg,#14243a,#0e1825);border:1px solid #35517a;border-radius:18px;padding:15px;margin-bottom:10px}.v850Eyebrow{font-size:11px;color:#8fa4bb}.v850Title{font-size:23px;font-weight:900;margin-top:3px}.v850Sub{font-size:12px;color:#9aa6b2;line-height:1.5;margin-top:5px}.v850Menu{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.v850Menu button{min-height:82px;text-align:left;padding:12px;border-radius:15px;background:#0f1925}.v850Menu b{display:block;font-size:14px;margin-bottom:4px}.v850Menu span{font-size:10px;color:#93a1b0;line-height:1.35}.v850SectionTitle{font-size:15px;font-weight:850;margin:16px 4px 8px}
`;document.head.appendChild(s)}
function isToolPane(el){return !!(el&&el.id&&TOOL_IDS.has(el.id))}
function ensurePages(){const main=document.querySelector('main');if(!main)return false;if(!$('v850HomePane')){const p=document.createElement('section');p.id='v850HomePane';p.className='v853Page v853Active';main.insertBefore(p,main.firstChild)}if(!$('v850MorePane')){const p=document.createElement('section');p.id='v850MorePane';p.className='v853Page';main.appendChild(p)}return true}
function normalizeStrategyLab(){const main=document.querySelector('main'),lab=$('strategyLab');if(!main||!lab)return;if(lab.parentElement!==main)main.appendChild(lab);lab.classList.add('v853Page');lab.classList.remove('v852Page','v851Page','tabPane','activePane');if(!lab.classList.contains('v853Active'))lab.style.display='none'}
function moveHomeNode(el){const home=$('v850HomePane');if(!home||!el||el===home||el.id==='v850MorePane'||isToolPane(el))return;if(el.classList?.contains('topTabsSticky')||el.classList?.contains('v82TabsHint'))return;if(el.parentElement===document.querySelector('main')){el.classList.remove('v853Page','v852Page','v851Page','tabPane','activePane');el.style.removeProperty('display');home.appendChild(el)}}
function adoptModernHome(){const main=document.querySelector('main');if(!main||!$('v850HomePane'))return;normalizeStrategyLab();[...main.children].forEach(moveHomeNode)}
function markToolPages(){normalizeStrategyLab();TOOL_IDS.forEach(id=>{const el=$(id);if(el&&el.id!=='v850MorePane')el.classList.add('v853Page')});const chart=$('chart')?.closest('.card');if(chart){if(!chart.id)chart.id='v851ChartPane';chart.classList.add('v853Page')}}
function navActive(r){document.querySelectorAll('footer.v850Nav button').forEach(b=>b.classList.toggle('active',b.dataset.route===r));if(location.hash!==`#${r}`)history.replaceState(null,'',`#${r}`)}
function activatePane(el,r){if(!el)return false;markToolPages();document.querySelectorAll('main>.v853Page,#v850HomePane,#v850MorePane').forEach(x=>{x.classList.remove('v853Active','activePane');x.style.display='none'});el.classList.add('v853Active');if(el.classList.contains('tabPane'))el.classList.add('activePane');el.style.display='block';navActive(r);requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'auto'}));return true}
function showHome(){ensurePages();adoptModernHome();return activatePane($('v850HomePane'),'home')}
function direct(id,r){const el=$(id);return el?activatePane(el,r):false}
function showDaily(attempt=0){const p=$('dailyBriefPane');if(p)return activatePane(p,'daily');if(attempt<8)return setTimeout(()=>showDaily(attempt+1),250);return showHome()}
function showMore(){ensurePages();normalizeStrategyLab();const p=$('v850MorePane');p.innerHTML=`<div class="v850Hero"><div class="v850Eyebrow">도구 모음 · APP v${version()}</div><div class="v850Title">더보기</div><div class="v850Sub">상세 연구·설정·검증·기록 기능을 한곳에 모았습니다.</div></div><div class="v850Menu">${MORE.map(([id,t,s])=>`<button data-open="${id}"><b>${t}</b><span>${s}</span></button>`).join('')}</div><div class="v850SectionTitle">앱 관리</div><div class="v850Menu"><button id="v851Reload"><b>전체 새로고침</b><span>시장 데이터와 화면을 다시 불러옵니다.</span></button><button id="v851Home"><b>홈으로</b><span>핵심 대시보드로 돌아갑니다.</span></button></div>`;p.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openTool(b.dataset.open)));p.querySelector('#v851Reload')?.addEventListener('click',()=>location.reload());p.querySelector('#v851Home')?.addEventListener('click',showHome);activatePane(p,'more')}
function openTool(id){if(id==='strategyLab'){normalizeStrategyLab();if(window.BTCStrategyLab?.show)return window.BTCStrategyLab.show();return direct('strategyLab','more')||showMore()}if(id==='chart'){const c=$('chart')?.closest('.card');if(c){if(!c.id)c.id='v851ChartPane';return activatePane(c,'more')}}return direct(id,'more')||showMore()}
function route(r){if(r==='home')return showHome();if(r==='scanner')return direct('scanner','scanner')||showHome();if(r==='position')return direct('position','position')||showHome();if(r==='daily')return showDaily();if(r==='more')return showMore()}
function buildFooter(){let f=document.querySelector('footer');if(!f){f=document.createElement('footer');document.body.appendChild(f)}f.className='v850Nav';f.innerHTML=NAV.map(([r,l])=>`<button type="button" data-route="${r}">${l}</button>`).join('');f.querySelectorAll('button').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();route(b.dataset.route)}))}
function patchVersion(){const v=version();document.title=`BTC Hedge Assistant v${v}`;document.querySelectorAll('h1').forEach(h=>{if(/BTC Hedge Assistant/i.test(h.textContent||''))h.textContent=`BTC Hedge Assistant v${v}`});window.BTC_APP_VERSION=v}
function watchNewHomeCards(){const main=document.querySelector('main');if(!main)return;new MutationObserver(muts=>{for(const m of muts)for(const n of m.addedNodes){if(n.nodeType!==1)continue;if(n.id==='strategyLab'){normalizeStrategyLab();continue}if(!isToolPane(n))moveHomeNode(n)}}).observe(main,{childList:true})}
function init(){injectStyle();document.body.classList.remove('v851','v852');document.body.classList.add('v853');patchVersion();if(!ensurePages())return;normalizeStrategyLab();markToolPages();adoptModernHome();buildFooter();watchNewHomeCards();const h=(location.hash||'#home').slice(1);route(NAV.some(x=>x[0]===h)?h:'home');setTimeout(()=>{patchVersion();normalizeStrategyLab();adoptModernHome();try{window.BTCResearchShadow?.heal?.();window.BTCResearchHealth?.render?.();window.BTCRecoveryV2UI?.render?.()}catch(e){}},1200)}
window.addEventListener('hashchange',()=>{const h=(location.hash||'#home').slice(1);if(NAV.some(x=>x[0]===h))route(h)});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,120));else setTimeout(init,120);
window.BTCV853={version:FALLBACK_VERSION,route,activatePane,showHome,showDaily,showMore,openTool,adoptModernHome,normalizeStrategyLab};
})();