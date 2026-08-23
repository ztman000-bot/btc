/* BTC Hedge Assistant v8.5.3 - Mobile App Shell */
(()=>{
'use strict';
const VERSION='8.5.3';
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
const num=s=>{const m=String(s??'').replace(/,/g,'').match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):NaN};
const pct=(v,d=1)=>Number.isFinite(v)?`${v>=0?'+':''}${v.toFixed(d)}%`:'--';
function injectStyle(){
 if($('v853Style'))return;
 const s=document.createElement('style');s.id='v853Style';s.textContent=`
 body.v853{padding-bottom:92px}
 body.v853 main>.v853Page{display:none!important}
 body.v853 main>.v853Page.v853Active{display:block!important}
 body.v853 main>.topTabsSticky,body.v853 main>.v82TabsHint{display:none!important}
 #v850HomePane,#v850MorePane{max-width:980px;margin:0 auto;padding:2px 0 110px}
 #v850HomePane>.card,#v850HomePane>.grid3{margin-bottom:10px}
 #v850HomePane .statusStrip{gap:7px}
 #v850HomePane .statusCell{font-size:13px;padding:10px 7px}
 #v850HomePane #price{font-size:32px;letter-spacing:-.8px}
 #v850HomePane #chg{font-size:20px;font-weight:900;margin-top:3px}
 #v850HomePane #mode{font-size:20px;margin-top:4px}
 #v850HomePane #safeDist{font-size:21px;margin-top:4px}
 #v850HomePane .nextActionCard{border-color:#3b5d8c;box-shadow:0 0 0 1px #24446f33 inset}
 #positionStatus,#positionFreshness{cursor:pointer}
 .v853Inline{margin-top:7px;padding-top:7px;border-top:1px solid #26384b;font-size:10px;line-height:1.5;color:#9fb0c2}
 .v853Inline strong{color:#eef4fb;font-size:11px}
 .v853Tag{display:inline-block;margin-left:5px;padding:2px 6px;border-radius:999px;border:1px solid #405169;background:#13202e;color:#c9d6e4;font-size:9px;font-weight:800;vertical-align:middle}
 .v853Good{color:#20d792!important}.v853Warn{color:#ffbf47!important}.v853Bad{color:#ff667a!important}
 .v853Range{display:grid;grid-template-columns:1fr auto 1fr;gap:6px;align-items:center;margin-top:7px;padding:7px;border:1px solid #293d51;border-radius:10px;background:#0a141e}
 .v853Range>div{min-width:0}.v853Range .center{text-align:center;color:#dce6f1;font-size:10px}.v853Range .right{text-align:right}.v853Range b{display:block;font-size:11px}.v853Range span{display:block;font-size:9px;color:#8fa0b5;margin-top:2px}
 .v853Block{margin-top:9px;padding:9px 10px;border:1px solid #6a4930;border-radius:11px;background:#241a12;font-size:11px;line-height:1.45;color:#ffd08a}
 .v853Block b{color:#fff0cd}
 .v853Ready{margin-top:8px;padding:9px 10px;border:1px solid #30465b;border-radius:11px;background:#0a1520}
 .v853ReadyTop{display:flex;justify-content:space-between;gap:8px;align-items:center;font-size:10px;color:#9fb0c2}
 .v853ReadyTop b{font-size:13px;color:#eef4fb}
 .v853ReadyBar{height:6px;background:#1a2633;border-radius:999px;overflow:hidden;margin-top:6px}.v853ReadyBar>i{display:block;height:100%;background:#2f7cf6;border-radius:999px}
 .v853DecisionSummary{margin-top:10px;border:1px solid #30465c;border-radius:13px;background:#0b1622;padding:10px}
 .v853DecisionSummary .title{font-size:10px;color:#8fa0b5}.v853DecisionSummary .main{font-size:15px;font-weight:900;margin-top:2px}
 .v853HomeQuick{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0 2px}
 .v853HomeQuick button{min-height:64px;border-radius:14px;background:#111d2b;border:1px solid #2a3a4e;text-align:left;padding:11px}
 .v853HomeQuick b{display:block;font-size:14px}.v853HomeQuick span{font-size:10px;color:#91a0b0}
 .v850Hero{background:linear-gradient(180deg,#14243a,#0e1825);border:1px solid #35517a;border-radius:18px;padding:15px;margin-bottom:10px}
 .v850Eyebrow{font-size:11px;color:#8fa4bb}.v850Title{font-size:23px;font-weight:900;margin-top:3px}.v850Sub{font-size:12px;color:#9aa6b2;line-height:1.5;margin-top:5px}
 .v850Menu{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.v850Menu button{min-height:82px;text-align:left;padding:12px;border-radius:15px;background:#0f1925}.v850Menu b{display:block;font-size:14px;margin-bottom:4px}.v850Menu span{font-size:10px;color:#93a1b0;line-height:1.35}
 .v850SectionTitle{font-size:15px;font-weight:850;margin:16px 4px 8px}
 footer.v850Nav{grid-template-columns:repeat(5,1fr)!important;gap:4px!important;padding:7px 8px max(8px,env(safe-area-inset-bottom))!important}
 footer.v850Nav button{background:transparent;border-color:transparent;border-radius:12px;min-height:50px;padding:5px 1px;font-size:10px;color:#a7b3c0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
 footer.v850Nav button::before{font-size:18px;line-height:1}
 footer.v850Nav button[data-route=home]::before{content:'⌂'}footer.v850Nav button[data-route=scanner]::before{content:'⌕'}footer.v850Nav button[data-route=position]::before{content:'◫'}footer.v850Nav button[data-route=daily]::before{content:'☼'}footer.v850Nav button[data-route=more]::before{content:'•••'}
 footer.v850Nav button.active{background:#172a46!important;border-color:#315a91!important;color:#eef6ff}
 #v850DailyDetails{margin-top:10px;border:1px solid #2a394b;border-radius:15px;background:#0e1722;overflow:hidden}#v850DailyDetails>summary{list-style:none;cursor:pointer;padding:13px 14px;font-weight:850;display:flex;justify-content:space-between;align-items:center}#v850DailyDetails>summary::-webkit-details-marker{display:none}#v850DailyDetails>summary::after{content:'펼치기 ▾';font-size:11px;color:#91a3b7}#v850DailyDetails[open]>summary::after{content:'접기 ▴'}#v850DailyDetails .v850DetailsInner{padding:0 8px 8px}
 @media(max-width:620px){
   #v850HomePane>.grid3{grid-template-columns:1fr 1fr!important}
   #v850HomePane>.grid3>.card:first-child{grid-column:1/-1}
   .v853HomeQuick{grid-template-columns:1fr 1fr}
   .v853HomeQuick button:last-child{grid-column:1/-1}
   .v850Menu{grid-template-columns:1fr 1fr}
 }
 `;document.head.appendChild(s);
}
function markLegacyPages(){
 const main=document.querySelector('main');if(!main)return;
 [...main.children].forEach(el=>{
   if(el.id==='v850HomePane'||el.id==='v850MorePane')return;
   if(el.classList.contains('topTabsSticky')||el.classList.contains('v82TabsHint'))return;
   el.classList.add('v853Page');
 });
 const chart=$('chart')?.closest('.card');if(chart&&!chart.id)chart.id='v851ChartPane';
}
function ensurePages(){
 const main=document.querySelector('main');if(!main)return false;
 if(!$('v850HomePane')){const p=document.createElement('section');p.id='v850HomePane';p.className='v853Page';main.insertBefore(p,main.firstChild)}
 if(!$('v850MorePane')){const p=document.createElement('section');p.id='v850MorePane';p.className='v853Page';main.appendChild(p)}
 markLegacyPages();return true;
}
function navActive(route){document.querySelectorAll('footer.v850Nav button').forEach(b=>b.classList.toggle('active',b.dataset.route===route));if(location.hash!==`#${route}`)history.replaceState(null,'',`#${route}`)}
function activatePane(el,route){
 if(!el)return false;markLegacyPages();
 document.querySelectorAll('main>.v853Page').forEach(x=>{x.classList.remove('v853Active','activePane');x.style.display='none'});
 el.classList.add('v853Active');if(el.classList.contains('tabPane'))el.classList.add('activePane');el.style.display='block';
 navActive(route);requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'auto'}));return true;
}
function legacyHomeNodes(){
 const status=$('marketStatus')?.closest('.card');
 const marketGrid=$('price')?.closest('.grid3');
 const next=$('nextNow')?.closest('.nextActionCard');
 return [status,marketGrid,next].filter(Boolean);
}
function ensureEnhancementNodes(){
 const mode=$('mode');if(mode&&!$('v853RangeDistance')){const d=document.createElement('div');d.id='v853RangeDistance';d.className='v853Range';mode.closest('.card')?.appendChild(d)}
 const conf=$('confidence');if(conf&&!$('v853ConfidenceTag')){const t=document.createElement('span');t.id='v853ConfidenceTag';t.className='v853Tag';conf.insertAdjacentElement('afterend',t)}
 const safe=$('safeText');if(safe&&!$('v853SafeGrade')){const d=document.createElement('div');d.id='v853SafeGrade';d.className='v853Inline';safe.insertAdjacentElement('afterend',d)}
 const list=$('conditionList');if(list&&!$('v853BlockReason')){const d=document.createElement('div');d.id='v853BlockReason';d.className='v853Block';list.insertAdjacentElement('afterend',d)}
 const ready=$('readinessBox');if(ready&&!$('v853ConditionReady')){const d=document.createElement('div');d.id='v853ConditionReady';d.className='v853Ready';ready.appendChild(d)}
 const next=$('nextNow')?.closest('.nextActionCard');if(next&&!$('v853DecisionSummary')){const d=document.createElement('div');d.id='v853DecisionSummary';d.className='v853DecisionSummary';next.appendChild(d)}
 const ps=$('positionStatus');if(ps&&!ps.dataset.v853Click){ps.dataset.v853Click='1';ps.title='눌러서 포지션 갱신';ps.addEventListener('click',()=>route('position'))}
 const pf=$('positionFreshness');if(pf&&!pf.dataset.v853Click){pf.dataset.v853Click='1';pf.title='눌러서 포지션 확인';pf.addEventListener('click',()=>route('position'))}
}
function confidenceLabel(v){if(!Number.isFinite(v))return '계산 중';if(v>=90)return '매우 높음';if(v>=75)return '높음';if(v>=60)return '보통 이상';if(v>=40)return '보통';return '낮음'}
function safetyLabel(v){if(!Number.isFinite(v))return ['계산 중',''];if(v<8)return ['위험','v853Bad'];if(v<15)return ['주의','v853Warn'];if(v<30)return ['안정','v853Good'];return ['매우 안전','v853Good']}
function extractLongShort(){
 const t=String($('modeHint')?.textContent||'').replace(/,/g,'');
 const lm=t.match(/롱\s*\$?\s*(\d+(?:\.\d+)?)/i),sm=t.match(/숏\s*\$?\s*(\d+(?:\.\d+)?)/i);
 return {long:lm?Number(lm[1]):NaN,short:sm?Number(sm[1]):NaN};
}
function updateEnhancements(){
 ensureEnhancementNodes();
 const price=num($('price')?.textContent),conf=num($('confidence')?.textContent),safe=num($('safeDist')?.textContent);
 const {long,short}=extractLongShort();
 const ctag=$('v853ConfidenceTag');if(ctag)ctag.textContent=confidenceLabel(conf);
 const sg=$('v853SafeGrade');if(sg){const [label,cls]=safetyLabel(safe);sg.innerHTML=`안전도 등급 <strong class="${cls}">${label}</strong> · 권장 15% · 긴급 8% 기준`}
 const rd=$('v853RangeDistance');if(rd){
   const ld=Number.isFinite(price)&&Number.isFinite(long)?(long-price)/price*100:NaN;
   const sd=Number.isFinite(price)&&Number.isFinite(short)?(short-price)/price*100:NaN;
   rd.innerHTML=`<div><b class="v853Good">LONG ${pct(ld)}</b><span>${Number.isFinite(long)?'$'+long.toLocaleString():'--'}</span></div><div class="center">현재가<br><b>${Number.isFinite(price)?'$'+price.toLocaleString(undefined,{maximumFractionDigits:1}):'--'}</b></div><div class="right"><b class="v853Warn">SHORT ${pct(sd)}</b><span>${Number.isFinite(short)?'$'+short.toLocaleString():'--'}</span></div>`;
 }
 const score=String($('conditionScore')?.textContent||'').trim();const m=score.match(/(\d+)\s*\/\s*(\d+)/);const ok=m?Number(m[1]):0,total=m?Number(m[2]):0,prep=total?Math.round(ok/total*100):0;
 const conds=[...document.querySelectorAll('#conditionList .condNO')].map(x=>(x.textContent||'').replace(/필수|보조/g,'').replace(/[×✕✓]/g,'').trim()).filter(Boolean);
 const br=$('v853BlockReason');if(br){if(conds.length){br.style.display='block';br.innerHTML=`<b>현재 실행 보류 이유</b> → ${conds[0]}${conds.length>1?` 외 ${conds.length-1}개`:''}`;}else{br.style.display='none'}}
 const cr=$('v853ConditionReady');if(cr){cr.innerHTML=`<div class="v853ReadyTop"><span>조건 준비도</span><b>${prep}% (${ok}/${total||0})</b></div><div class="v853ReadyBar"><i style="width:${prep}%"></i></div>`}
 const rs=String($('readinessState')?.textContent||'대기').trim();const action=String($('nextNow')?.textContent||'관망').trim();
 const ds=$('v853DecisionSummary');if(ds){ds.innerHTML=`<div class="title">한 줄 판단</div><div class="main">${action} · 실행 ${rs} · 조건 ${prep}%</div>`}
 const rb=$('readinessBox');if(rb){const label=rb.querySelector('.label');if(label)label.textContent='실행 허용도'}
}
function mountLegacyHome(){
 const p=$('v850HomePane');if(!p)return;
 const quick=$('v853HomeQuick');
 legacyHomeNodes().forEach(n=>{
   n.classList.remove('v853Page','v852Page','v851Page');n.style.display='';
   if(n.parentElement!==p)p.insertBefore(n,quick||null);
 });
 ensureEnhancementNodes();updateEnhancements();
 if(!$('v853HomeQuick')){
   const q=document.createElement('div');q.id='v853HomeQuick';q.className='v853HomeQuick';
   q.innerHTML='<button data-go="scanner"><b>시장 스캔</b><span>종목 점수·랭킹·신호</span></button><button data-go="position"><b>포지션 점검</b><span>롱/숏·잔고·청산가</span></button><button data-go="daily"><b>오늘 시황</b><span>글로벌 리포트 + 내부 신호</span></button>';
   q.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>route(b.dataset.go)));p.appendChild(q);
 }
}
function showHome(){ensurePages();mountLegacyHome();activatePane($('v850HomePane'),'home');setTimeout(updateEnhancements,50)}
function direct(id,routeName){const el=$(id);return el?activatePane(el,routeName):false}
function showMore(){
 ensurePages();const p=$('v850MorePane');
 p.innerHTML=`<div class="v850Hero"><div class="v850Eyebrow">도구 모음 · V${VERSION}</div><div class="v850Title">더보기</div><div class="v850Sub">설정·검증·기록 기능을 한곳에 모았습니다.</div></div><div class="v850Menu">${MORE.map(([id,title,sub])=>`<button data-open="${id}"><b>${title}</b><span>${sub}</span></button>`).join('')}</div><div class="v850SectionTitle">앱 관리</div><div class="v850Menu"><button id="v851Reload"><b>전체 새로고침</b><span>시장 데이터와 화면을 다시 불러옵니다.</span></button><button id="v851Home"><b>홈으로</b><span>핵심 대시보드로 돌아갑니다.</span></button></div>`;
 p.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openTool(b.dataset.open)));
 p.querySelector('#v851Reload').addEventListener('click',()=>location.reload());p.querySelector('#v851Home').addEventListener('click',()=>route('home'));activatePane(p,'more');
}
function openTool(id){
 if(id==='chart'){const c=$('chart')?.closest('.card');if(c){if(!c.id)c.id='v851ChartPane';activatePane(c,'more');setTimeout(()=>{try{drawChart()}catch(e){}},80);return}}
 if(!direct(id,'more'))showMore();
}
function compactDaily(){
 const body=$('dailyBriefBody');if(!body||$('v850DailyDetails'))return;
 const kids=[...body.children];if(kids.length<2)return;
 const d=document.createElement('details');d.id='v850DailyDetails';const s=document.createElement('summary');s.innerHTML='<span>상세 시황</span><span class="small">리포트 · 시나리오 · 리스크 · 일정</span>';d.appendChild(s);const inner=document.createElement('div');inner.className='v850DetailsInner';kids.slice(1).forEach(n=>inner.appendChild(n));d.appendChild(inner);body.appendChild(d);
}
function showDaily(attempt=0){const pane=$('dailyBriefPane');if(pane){activatePane(pane,'daily');setTimeout(compactDaily,250);return}if(attempt<10)setTimeout(()=>showDaily(attempt+1),250);else showHome()}
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
function init(){injectStyle();document.body.classList.remove('v851','v852');document.body.classList.add('v853');patchVersion();if(!ensurePages())return;buildFooter();watchNewPages();setInterval(()=>{if(location.hash==='#home'||!location.hash)updateEnhancements()},1000);const h=(location.hash||'#home').slice(1);route(NAV.some(x=>x[0]===h)?h:'home')}
window.addEventListener('hashchange',()=>{const h=(location.hash||'#home').slice(1);if(NAV.some(x=>x[0]===h))route(h)});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,450));else setTimeout(init,450);
window.BTCV853={route,activatePane,showHome,showDaily,updateEnhancements};
})();