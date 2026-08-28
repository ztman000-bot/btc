/* BTC Hedge Assistant v8.22.1 - Compact Home + Canonical Bottom Tool Dock */
(()=>{
'use strict';
if(window.__BTC_V8221_SHELL_SINGLETON&&window.BTCV8221)return;
window.__BTC_V8221_SHELL_SINGLETON=true;
const FALLBACK_VERSION='8.22.1';
const $=id=>document.getElementById(id);
const ROUTES=[
  ['home','⌂','홈'],['scanner','⌕','스캐너'],['position','◫','포지션'],['trade','⇄','실전표'],
  ['chart','⌁','차트'],['risk','⚠','리스크'],['research','⌬','연구소'],['daily','☼','일일'],
  ['settings','⚙','설정'],['alerts','◉','알림'],['backtest','↺','백테스트'],['log','≡','기록']
];
const LEGACY_TOOL_IDS=['scanner','position','trade','settings','alerts','backtest','log','strategyLab','dailyBriefPane'];
function version(){return window.BTC_APP_CONFIG?.version||window.BTC_APP_VERSION||FALLBACK_VERSION}
function loadScript(id,src){
  if(document.getElementById(id))return Promise.resolve(document.getElementById(id));
  return new Promise((resolve,reject)=>{const s=document.createElement('script');s.id=id;s.src=src;s.async=false;s.onload=()=>resolve(s);s.onerror=()=>reject(new Error('load failed: '+src));document.head.appendChild(s)})
}
async function ensureCanonicalBootstrap(){
  try{
    if(!window.BTC_APP_CONFIG)await loadScript('btcAppConfigShell','./app-config.js?v='+FALLBACK_VERSION+'&ts='+Date.now());
    if(!window.BTCBootstrap)await loadScript('btcVersionGuardShell','./version-guard.js?v='+version()+'&ts='+Date.now());
    await window.BTCBootstrap?.boot?.();
  }catch(e){console.warn('[BTC v8.22.1 bootstrap]',e)}
}
function injectStyle(){
  if($('v8221Style'))return;
  const s=document.createElement('style');s.id='v8221Style';s.textContent=`
body.v8221{padding-bottom:112px!important}
body.v8221 main{max-width:980px!important;padding:10px!important}
body.v8221 main>*{display:none!important}
body.v8221 main>.v8221Page.v8221Active{display:block!important}
body.v8221 .topTabsSticky,body.v8221 .v82TabsHint{display:none!important}
#v8221HomePane,#v8221ChartPage,#v8221RiskPage,#v8221SystemPage{padding:0 0 18px}
#v8221HomePane .v8221HomeTitle{margin:2px 2px 10px;padding:12px 14px;border:1px solid #35517a;border-radius:16px;background:linear-gradient(180deg,#14243a,#0e1825)}
#v8221HomePane .v8221HomeTitle b{display:block;font-size:18px}.v8221HomeTitle span{display:block;color:#9aa6b2;font-size:11px;margin-top:4px;line-height:1.45}
#v8221HomePane #conditionList,#v8221HomePane #readinessBox,#v8221HomePane #tfConfidence,#v8221HomePane #blockers,#v8221HomePane #actionReason,#v8221HomePane #riskGate{display:none!important}
#v8221HomePane .nextActionCard{padding:12px!important}
#v8221HomePane .nextMain{font-size:21px!important}
#v8221HomePane .card,#v8221HomePane .grid3{margin-bottom:9px!important}
.v8221SectionHead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:4px 2px 10px}
.v8221SectionHead b{font-size:17px}.v8221SectionHead span{font-size:10px;color:#8fa0b5}
footer.v8221Dock{position:fixed!important;left:0;right:0;bottom:0;z-index:100!important;display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:3px!important;padding:5px 6px max(6px,env(safe-area-inset-bottom))!important;background:#0b1118f7!important;border-top:1px solid #27323f!important;backdrop-filter:blur(10px)}
footer.v8221Dock button{min-width:0!important;min-height:42px!important;padding:3px 1px!important;border-radius:10px!important;background:transparent!important;border:1px solid transparent!important;color:#9eabba!important;font-size:8.8px!important;line-height:1.05!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:2px!important}
footer.v8221Dock button i{font-style:normal;font-size:16px;line-height:1}footer.v8221Dock button b{font-size:8.8px;white-space:nowrap}
footer.v8221Dock button.active{background:#172a46!important;border-color:#315a91!important;color:#f2f7ff!important}
.v8221Fallback{border:1px solid #30445a;border-radius:14px;background:#0d1722;padding:15px;line-height:1.55;color:#b8c6d5}
.v8221SystemGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.v8221SystemCard{border:1px solid #2b3f53;border-radius:12px;padding:10px;background:#0a1520}.v8221SystemCard span{display:block;color:#8fa0b5;font-size:10px}.v8221SystemCard b{display:block;margin-top:3px;font-size:14px}
@media(max-width:520px){body.v8221{padding-bottom:108px!important}footer.v8221Dock button{min-height:40px!important}#v8221HomePane .grid3{grid-template-columns:1fr 1fr!important}#v8221HomePane .grid3>.card:last-child{grid-column:1/-1}.v8221SystemGrid{grid-template-columns:1fr}}
`;
  document.head.appendChild(s)
}
function patchVersion(){
  const v=version();
  document.title='BTC Hedge Assistant v'+v;
  document.querySelectorAll('h1').forEach(h=>{if(/BTC Hedge Assistant/i.test(h.textContent||''))h.textContent='BTC Hedge Assistant v'+v});
  window.BTC_APP_VERSION=v;
}
function section(id,title,sub=''){
  let p=$(id);if(!p){p=document.createElement('section');p.id=id;p.className='v8221Page';p.innerHTML=`<div class="v8221SectionHead"><b>${title}</b><span>${sub}</span></div>`;document.querySelector('main')?.appendChild(p)}
  p.classList.add('v8221Page');return p
}
function ensureStructure(){
  const main=document.querySelector('main');if(!main)return false;
  let home=$('v8221HomePane');if(!home){home=document.createElement('section');home.id='v8221HomePane';home.className='v8221Page v8221Active';home.innerHTML=`<div class="v8221HomeTitle"><b>핵심 대시보드</b><span>현재가 · 다음 행동 · 안전거리 · 전략 상태 · 시장 국면만 요약합니다. 세부 기능은 하단 버튼에서 확인하세요.</span></div>`;main.insertBefore(home,main.firstChild)}
  const status=$('marketStatus')?.closest('.card');
  const priceGrid=$('price')?.closest('.grid3');
  const next=$('nextNow')?.closest('.nextActionCard');
  const signal=$('strategyState')?.closest('.card');
  const regime=$('marketRegime')?.closest('.card');
  [status,priceGrid,next,signal,regime].forEach(el=>{if(el&&el.parentElement!==home)home.appendChild(el)});

  const risk=section('v8221RiskPage','리스크 / 안전관리','스트레스·안전거리·증거금 효율');
  ['sensitivityStats','stressGrid','distanceStats','marginScenarios','riskEfficiency'].forEach(id=>{const el=$(id);const top=el?.closest('.card');if(top&&top.parentElement!==risk)risk.appendChild(top)});

  const chartPage=section('v8221ChartPage','BTC 차트','가격·지표·포지션 레벨');
  const chartCard=$('chart')?.closest('.card');if(chartCard&&chartCard.parentElement!==chartPage)chartPage.appendChild(chartCard);
  const info=$('tf1h')?.closest('.infoGrid');if(info&&info.parentElement!==chartPage)chartPage.appendChild(info);

  LEGACY_TOOL_IDS.forEach(id=>{const el=$(id);if(el){el.classList.add('v8221Page');el.classList.remove('activePane');el.style.removeProperty('display')}});
  document.querySelectorAll('main>.tabs,main>.v82TabsHint').forEach(x=>x.remove());
  return true
}
function activeButton(route){document.querySelectorAll('footer.v8221Dock button').forEach(b=>b.classList.toggle('active',b.dataset.route===route))}
function activate(el,route){
  if(!el)return false;
  ensureStructure();
  document.querySelectorAll('main>.v8221Page').forEach(x=>{x.classList.remove('v8221Active','activePane');x.style.removeProperty('display')});
  el.classList.add('v8221Active');
  if(el.classList.contains('tabPane'))el.classList.add('activePane');
  activeButton(route);
  if(location.hash!=='#'+route)history.replaceState(null,'','#'+route);
  requestAnimationFrame(()=>{window.scrollTo({top:0,behavior:'auto'});if(route==='chart')try{window.drawChart?.()}catch(e){}});
  return true
}
function direct(id,route){return activate($(id),route)}
function showHome(){ensureStructure();return activate($('v8221HomePane'),'home')}
function showChart(){ensureStructure();return activate($('v8221ChartPage'),'chart')}
function showRisk(){ensureStructure();return activate($('v8221RiskPage'),'risk')}
function showDaily(attempt=0){const p=$('dailyBriefPane');if(p){p.classList.add('v8221Page');return activate(p,'daily')}if(attempt<12){ensureCanonicalBootstrap();return setTimeout(()=>showDaily(attempt+1),250)}return showFallback('daily','일일 시황','일일 시황 모듈을 불러오지 못했습니다. 새로고침 후 다시 확인하세요.')}
function showResearch(attempt=0){
  const p=$('strategyLab');if(p){p.classList.add('v8221Page');const ok=activate(p,'research');try{window.BTCStrategyLab?.render?.()}catch(e){}return ok}
  if(attempt<12){ensureCanonicalBootstrap();return setTimeout(()=>showResearch(attempt+1),250)}
  return showFallback('research','전략 연구소','전략 연구소 모듈을 불러오지 못했습니다. 시스템 초기화 상태를 확인하세요.')
}
function showFallback(route,title,msg){
  const p=section('v8221FallbackPage',title,'모듈 상태');p.innerHTML=`<div class="v8221SectionHead"><b>${title}</b><span>모듈 상태</span></div><div class="v8221Fallback">${msg}<div style="margin-top:10px"><button type="button" id="v8221Retry">다시 불러오기</button></div></div>`;p.querySelector('#v8221Retry')?.addEventListener('click',()=>{ensureCanonicalBootstrap().then(()=>routeTo(route))});return activate(p,route)
}
function routeTo(route){
  switch(route){
    case'home':return showHome();case'scanner':return direct('scanner','scanner')||showHome();case'position':return direct('position','position')||showHome();case'trade':return direct('trade','trade')||showHome();case'chart':return showChart();case'risk':return showRisk();case'research':return showResearch();case'daily':return showDaily();case'settings':return direct('settings','settings')||showHome();case'alerts':return direct('alerts','alerts')||showHome();case'backtest':return direct('backtest','backtest')||showHome();case'log':return direct('log','log')||showHome();default:return showHome()
  }
}
function buildDock(){
  let f=document.querySelector('footer');if(!f){f=document.createElement('footer');document.body.appendChild(f)}
  f.className='v8221Dock';f.innerHTML=ROUTES.map(([r,i,l])=>`<button type="button" data-route="${r}" aria-label="${l}"><i>${i}</i><b>${l}</b></button>`).join('');
  f.querySelectorAll('button').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();routeTo(b.dataset.route)}))
}
function patchLegacyNavigation(){
  window.openTab=(id)=>{const m={scanner:'scanner',position:'position',trade:'trade',settings:'settings',alerts:'alerts',backtest:'backtest',log:'log'};return routeTo(m[id]||'home')};
  window.BTCV853={version:FALLBACK_VERSION,route:routeTo,activatePane:activate,showHome,showDaily,showMore:showHome,openTool:id=>routeTo(id==='strategyLab'?'research':id),adoptModernHome:ensureStructure,adoptCanonicalHome:ensureStructure,normalizeStrategyLab:()=>{},ensureResearchSlot:()=>null,ensureHomeSlots:()=>({}),slot:()=>null};
}
function patchOutcomeBug(){
  window.v80UpdateOutcomes=function(r){
    let arr=window.v80LoadPerf?window.v80LoadPerf(r):[],changed=false;
    for(const x of arr){
      if(!x?.t||!x?.price)continue;
      if(x.h1==null){let c=window.v83NearestClose?.(r.h1?.rows||r.raw?.h1||r.h1,x.t+60*60*1000,70*60*1000);let v=window.v83OutcomePct?.(Number(x.price),c);if(v!=null){x.h1=v;changed=true}}
      if(x.h4==null){let c=window.v83NearestClose?.(r.h4?.rows||r.raw?.h4||r.h4,x.t+4*60*60*1000,150*60*1000);let v=window.v83OutcomePct?.(Number(x.price),c);if(v!=null){x.h4=v;changed=true}}
      if(x.h24==null){let c=window.v83NearestClose?.(r.h1?.rows||r.raw?.h1||r.h1,x.t+24*60*60*1000,90*60*1000);let v=window.v83OutcomePct?.(Number(x.price),c);if(v!=null){x.h24=v;changed=true}}
    }
    if(changed)window.v80SavePerf?.(r,arr);return arr
  }
}
function registerCurrentSW(){
  if(!('serviceWorker'in navigator))return;
  navigator.serviceWorker.register('./sw.js?v='+encodeURIComponent(version()),{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{})
}
function observeModules(){
  const main=document.querySelector('main');if(!main||window.__BTC_V8221_OBSERVER)return;
  window.__BTC_V8221_OBSERVER=new MutationObserver(()=>{LEGACY_TOOL_IDS.forEach(id=>{const el=$(id);if(el)el.classList.add('v8221Page')});patchVersion()});
  window.__BTC_V8221_OBSERVER.observe(main,{childList:true})
}
async function init(){
  injectStyle();document.body.classList.remove('v851','v852','v853');document.body.classList.add('v8221');
  patchOutcomeBug();buildDock();ensureStructure();patchLegacyNavigation();patchVersion();observeModules();registerCurrentSW();
  ensureCanonicalBootstrap().then(()=>{patchVersion();ensureStructure()});
  const h=(location.hash||'#home').slice(1);routeTo(ROUTES.some(x=>x[0]===h)?h:'home')
}
window.addEventListener('hashchange',()=>{const h=(location.hash||'#home').slice(1);if(ROUTES.some(x=>x[0]===h))routeTo(h)});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,80),{once:true});else setTimeout(init,80);
window.BTCV8221={version:FALLBACK_VERSION,route:routeTo,showHome,showChart,showRisk,showDaily,showResearch,activate,ensureStructure,ensureCanonicalBootstrap};
})();