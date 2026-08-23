/* BTC Hedge Assistant v8.5.1 - Mobile App Shell */
(()=>{
'use strict';
const VERSION='8.5.1';
const NAV=[['home','홈'],['scanner','스캐너'],['position','포지션'],['daily','일일 시황'],['more','더보기']];
const MORE=[
 ['trade','실전 매매표','현재 가격구간 행동 로드맵'],
 ['settings','전략 설정','지표·안전거리·거래량 기준'],
 ['alerts','알림','가격·전략 알림 관리'],
 ['backtest','백테스트','전략 성과와 MDD 검증'],
 ['log','실행 기록','판단 실행 및 학습 기록'],
 ['chart','차트','지표 차트와 가격 레벨 확인']
];
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function injectStyle(){
 if($('v851Style'))return;
 const s=document.createElement('style');s.id='v851Style';s.textContent=`
 body.v851{padding-bottom:92px}
 body.v851 main>.v851Page{display:none!important}
 body.v851 main>.v851Page.v851Active{display:block!important}
 body.v851 main>.topTabsSticky,body.v851 main>.v82TabsHint{display:none!important}
 #v850HomePane,#v850MorePane{max-width:980px;margin:0 auto;padding:2px 0 110px}
 .v850Hero{background:linear-gradient(180deg,#14243a,#0e1825);border:1px solid #35517a;border-radius:18px;padding:15px;margin-bottom:10px}
 .v850Eyebrow{font-size:11px;color:#8fa4bb}.v850Title{font-size:23px;font-weight:900;margin-top:3px}.v850Sub{font-size:12px;color:#9aa6b2;line-height:1.5;margin-top:5px}
 .v850Status{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}.v850Status .wide{grid-column:1/-1}
 .v850Metric{min-width:0;border:1px solid #29384a;border-radius:14px;background:#0b151f;padding:11px}.v850Metric b{display:block;font-size:18px;margin-top:3px}.v850Metric span{font-size:10px;color:#93a1b0}
 .v850Quick{display:grid;grid-template-columns:1fr;gap:8px;margin:10px 0}.v850Quick button{min-height:70px;border-radius:14px;background:#111d2b;border:1px solid #2a3a4e;text-align:left;padding:12px}.v850Quick b{display:block;font-size:15px}.v850Quick span{font-size:11px;color:#91a0b0}
 .v850SectionTitle{font-size:15px;font-weight:850;margin:16px 4px 8px}.v850Menu{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.v850Menu button{min-height:82px;text-align:left;padding:12px;border-radius:15px;background:#0f1925}.v850Menu b{display:block;font-size:14px;margin-bottom:4px}.v850Menu span{font-size:10px;color:#93a1b0;line-height:1.35}
 footer.v850Nav{grid-template-columns:repeat(5,1fr)!important;gap:4px!important;padding:7px 8px max(8px,env(safe-area-inset-bottom))!important}
 footer.v850Nav button{background:transparent;border-color:transparent;border-radius:12px;min-height:50px;padding:5px 1px;font-size:10px;color:#a7b3c0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
 footer.v850Nav button::before{font-size:18px;line-height:1}
 footer.v850Nav button[data-route=home]::before{content:'⌂'}footer.v850Nav button[data-route=scanner]::before{content:'⌕'}footer.v850Nav button[data-route=position]::before{content:'◫'}footer.v850Nav button[data-route=daily]::before{content:'☼'}footer.v850Nav button[data-route=more]::before{content:'•••'}
 footer.v850Nav button.active{background:#172a46!important;border-color:#315a91!important;color:#eef6ff}
 #v850HomePane .v850Decision{border-left:4px solid #f0b90b}.v851PageHead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}.v851PageHead b{font-size:17px}
 #v850DailyDetails{margin-top:10px;border:1px solid #2a394b;border-radius:15px;background:#0e1722;overflow:hidden}#v850DailyDetails>summary{list-style:none;cursor:pointer;padding:13px 14px;font-weight:850;display:flex;justify-content:space-between;align-items:center}#v850DailyDetails>summary::-webkit-details-marker{display:none}#v850DailyDetails>summary::after{content:'펼치기 ▾';font-size:11px;color:#91a3b7}#v850DailyDetails[open]>summary::after{content:'접기 ▴'}#v850DailyDetails .v850DetailsInner{padding:0 8px 8px}
 @media(max-width:560px){.v850Menu{grid-template-columns:1fr 1fr}}
 `;document.head.appendChild(s);
}
function markLegacyPages(){
 const main=document.querySelector('main');if(!main)return;
 [...main.children].forEach(el=>{if(el.classList.contains('topTabsSticky')||el.classList.contains('v82TabsHint'))return;el.classList.add('v851Page')});
 const chart=$('chart')?.closest('.card');if(chart&&!chart.id)chart.id='v851ChartPane';
}
function ensurePages(){
 const main=document.querySelector('main');if(!main)return false;
 if(!$('v850HomePane')){const p=document.createElement('section');p.id='v850HomePane';p.className='v851Page';main.insertBefore(p,main.firstChild)}
 if(!$('v850MorePane')){const p=document.createElement('section');p.id='v850MorePane';p.className='v851Page';main.appendChild(p)}
 markLegacyPages();return true;
}
function activatePane(el,route){
 if(!el)return false;markLegacyPages();
 document.querySelectorAll('main>.v851Page').forEach(x=>{x.classList.remove('v851Active','activePane');x.style.display='none'});
 el.classList.add('v851Active');if(el.classList.contains('tabPane'))el.classList.add('activePane');el.style.display='block';
 navActive(route);requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'auto'}));return true;
}
function navActive(route){document.querySelectorAll('footer.v850Nav button').forEach(b=>b.classList.toggle('active',b.dataset.route===route));if(location.hash!==`#${route}`)history.replaceState(null,'',`#${route}`)}
function textOf(id,f='--'){const e=$(id);return e?(e.textContent||'').replace(/\s+/g,' ').trim()||f:f}
function homeHTML(){
 const market=textOf('marketStatus','MARKET LIVE').replace(/MARKET\s*/i,'')||'LIVE';
 const position=textOf('positionStatus','POSITION OLD').replace(/POSITION\s*/i,'')||'OLD';
 const decision=textOf('decisionStatus','DECISION LIMITED').replace(/DECISION\s*/i,'')||'LIMITED';
 const confidence=textOf('confidence','--%');const safety=textOf('safeDist','--');const action=textOf('nextNow','관망');
 return `<div class="v850Hero"><div class="v850Eyebrow">BTC Hedge Assistant V${VERSION}</div><div class="v850Title">오늘 필요한 것만 먼저</div><div class="v850Sub">핵심 상태만 짧게 보고, 상세 기능은 하단 메뉴에서 별도 화면으로 엽니다.</div><div class="v850Status"><div class="v850Metric"><span>시장 데이터</span><b>${esc(market)}</b></div><div class="v850Metric"><span>포지션 데이터</span><b>${esc(position)}</b></div><div class="v850Metric wide"><span>실행 판단</span><b>${esc(decision)}</b></div></div></div><div class="card v850Decision"><div class="small">지금 판단</div><div class="mid" style="margin-top:4px">${esc(action)}</div><div class="small" style="margin-top:7px">종합 신뢰도 ${esc(confidence)} · 청산가 안전거리 ${esc(safety)}</div></div><div class="v850Quick"><button data-go="scanner"><b>시장 스캔</b><span>종목 점수·랭킹·신호 확인</span></button><button data-go="position"><b>포지션 점검</b><span>롱/숏·잔고·청산가 확인</span></button><button data-go="daily"><b>오늘 시황</b><span>글로벌 리포트 + 내부 신호</span></button></div>`;
}
function bindGo(root){root.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>route(b.dataset.go)))}
function showHome(){ensurePages();const p=$('v850HomePane');p.innerHTML=homeHTML();bindGo(p);activatePane(p,'home')}
function direct(id,route){const el=$(id);return el?activatePane(el,route):false}
function showMore(){ensurePages();const p=$('v850MorePane');p.innerHTML=`<div class="v850Hero"><div class="v850Eyebrow">도구 모음</div><div class="v850Title">더보기</div><div class="v850Sub">설정·검증·기록 기능을 한곳에 모았습니다.</div></div><div class="v850Menu">${MORE.map(([id,title,sub])=>`<button data-open="${id}"><b>${title}</b><span>${sub}</span></button>`).join('')}</div><div class="v850SectionTitle">앱 관리</div><div class="v850Menu"><button id="v851Reload"><b>전체 새로고침</b><span>시장 데이터와 화면을 다시 불러옵니다.</span></button><button id="v851Home"><b>홈으로</b><span>핵심 요약 화면으로 돌아갑니다.</span></button></div>`;p.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openTool(b.dataset.open)));p.querySelector('#v851Reload').addEventListener('click',()=>location.reload());p.querySelector('#v851Home').addEventListener('click',()=>route('home'));activatePane(p,'more')}
function openTool(id){if(id==='chart'){const c=$('chart')?.closest('.card');if(c){if(!c.id)c.id='v851ChartPane';activatePane(c,'more');setTimeout(()=>{try{drawChart()}catch(e){}},80);return}}if(!direct(id,'more'))showMore()}
function compactDaily(){
 const body=$('dailyBriefBody');if(!body||$('v850DailyDetails'))return;
 const kids=[...body.children];if(kids.length<2)return;
 const d=document.createElement('details');d.id='v850DailyDetails';const s=document.createElement('summary');s.innerHTML='<span>상세 시황</span><span class="small">리포트 · 시나리오 · 리스크 · 일정</span>';d.appendChild(s);const inner=document.createElement('div');inner.className='v850DetailsInner';kids.slice(1).forEach(n=>inner.appendChild(n));d.appendChild(inner);body.appendChild(d);
}
function showDaily(attempt=0){
 const pane=$('dailyBriefPane');if(pane){activatePane(pane,'daily');setTimeout(compactDaily,250);return}
 if(attempt<10)setTimeout(()=>showDaily(attempt+1),250);else showHome();
}
function route(r){
 if(r==='home')return showHome();
 if(r==='scanner')return direct('scanner','scanner')||showHome();
 if(r==='position')return direct('position','position')||showHome();
 if(r==='daily')return showDaily();
 if(r==='more')return showMore();
}
function buildFooter(){let f=document.querySelector('footer');if(!f){f=document.createElement('footer');document.body.appendChild(f)}f.className='v850Nav';f.innerHTML=NAV.map(([r,l])=>`<button type="button" data-route="${r}">${l}</button>`).join('');f.querySelectorAll('button').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();route(b.dataset.route)}))}
function patchVersion(){document.title=`BTC Hedge Assistant v${VERSION}`;document.querySelectorAll('h1').forEach(h=>{if(/BTC Hedge Assistant/i.test(h.textContent||''))h.textContent=`BTC Hedge Assistant v${VERSION}`})}
function watchNewPages(){const main=document.querySelector('main');if(!main)return;new MutationObserver(()=>markLegacyPages()).observe(main,{childList:true})}
function init(){injectStyle();document.body.classList.add('v851');patchVersion();if(!ensurePages())return;buildFooter();watchNewPages();const h=(location.hash||'#home').slice(1);route(NAV.some(x=>x[0]===h)?h:'home')}
window.addEventListener('hashchange',()=>{const h=(location.hash||'#home').slice(1);if(NAV.some(x=>x[0]===h))route(h)});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,450));else setTimeout(init,450);
window.BTCV851={route,activatePane,showHome,showDaily};
})();