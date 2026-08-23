/* BTC Hedge Assistant v8.5.0 - Mobile App Shell */
(()=>{
'use strict';
const VERSION='8.5.0';
const NAV=[
  ['home','홈'],['scanner','스캐너'],['position','포지션'],['daily','일일 시황'],['more','더보기']
];
const MORE=[
  ['실전 매매표','실전 매매표','현재 가격구간 행동 로드맵'],
  ['전략 설정','전략 설정','지표·안전거리·거래량 기준'],
  ['알림','알림','가격·전략 알림 관리'],
  ['백테스트','백테스트','전략 성과와 MDD 검증'],
  ['실행 기록','실행 기록','판단 실행 및 학습 기록'],
  ['차트','차트','지표 차트와 가격 레벨 확인']
];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function txt(){return document.body?.innerText||''}
function num(re,fallback='--'){const m=txt().match(re);return m?m[1]:fallback}
function injectStyle(){
 if(document.getElementById('v850Style'))return;
 const s=document.createElement('style');s.id='v850Style';s.textContent=`
 body.v850{padding-bottom:92px}
 body.v850 .topTabsSticky{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;clip-path:inset(50%)!important;white-space:nowrap!important;padding:0!important;border:0!important}
 #v850HomePane,#v850MorePane{max-width:980px;margin:0 auto;padding:2px 0 110px}
 .v850Hero{background:linear-gradient(180deg,#14243a,#0e1825);border:1px solid #35517a;border-radius:18px;padding:15px;margin-bottom:10px}
 .v850Eyebrow{font-size:11px;color:#8fa4bb}.v850Title{font-size:23px;font-weight:900;margin-top:3px}.v850Sub{font-size:12px;color:#9aa6b2;line-height:1.5;margin-top:5px}
 .v850Status{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}
 .v850Metric{min-width:0;border:1px solid #29384a;border-radius:14px;background:#0b151f;padding:11px}
 .v850Metric b{display:block;font-size:18px;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.v850Metric span{font-size:10px;color:#93a1b0}
 .v850Quick{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0}.v850Quick button{min-height:58px;border-radius:14px;background:#111d2b;border:1px solid #2a3a4e;text-align:left;padding:10px}.v850Quick b{display:block;font-size:13px}.v850Quick span{font-size:10px;color:#91a0b0}
 .v850SectionTitle{font-size:15px;font-weight:850;margin:16px 4px 8px}.v850Menu{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.v850Menu button{min-height:78px;text-align:left;padding:12px;border-radius:15px;background:#0f1925}.v850Menu b{display:block;font-size:14px;margin-bottom:4px}.v850Menu span{font-size:10px;color:#93a1b0;line-height:1.35}
 footer.v850Nav{grid-template-columns:repeat(5,1fr)!important;gap:4px!important;padding:7px 8px max(8px,env(safe-area-inset-bottom))!important}
 footer.v850Nav button{background:transparent;border-color:transparent;border-radius:12px;min-height:50px;padding:5px 1px;font-size:10px;color:#a7b3c0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
 footer.v850Nav button::before{font-size:18px;line-height:1}
 footer.v850Nav button[data-route=home]::before{content:'⌂'}footer.v850Nav button[data-route=scanner]::before{content:'⌕'}footer.v850Nav button[data-route=position]::before{content:'◫'}footer.v850Nav button[data-route=daily]::before{content:'☼'}footer.v850Nav button[data-route=more]::before{content:'•••'}
 footer.v850Nav button.active{background:#172a46!important;border-color:#315a91!important;color:#eef6ff}
 #v850HomePane .v850Decision{border-left:4px solid #f0b90b}
 #v850HomePane .v850Daily{border-left:4px solid #2f7cf6}
 #v850DailyDetails{margin-top:10px;border:1px solid #2a394b;border-radius:15px;background:#0e1722;overflow:hidden}
 #v850DailyDetails>summary{list-style:none;cursor:pointer;padding:13px 14px;font-weight:850;display:flex;justify-content:space-between;align-items:center}
 #v850DailyDetails>summary::-webkit-details-marker{display:none}#v850DailyDetails>summary::after{content:'펼치기 ▾';font-size:11px;color:#91a3b7}#v850DailyDetails[open]>summary::after{content:'접기 ▴'}
 #v850DailyDetails .v850DetailsInner{padding:0 8px 8px}
 @media(max-width:560px){.v850Status{grid-template-columns:1fr 1fr}.v850Status .wide{grid-column:1/-1}.v850Quick{grid-template-columns:1fr}.v850Menu{grid-template-columns:1fr 1fr}}
 `;document.head.appendChild(s);
}
function originalButtons(){return [...document.querySelectorAll('.topTabsSticky button,.tabs button')].filter(b=>!b.closest('footer'))}
function findTab(label){
 const aliases={
  '실전 매매표':['실전 매매표','실전매매표'],
  '시장 스캐너':['시장 스캐너','스캐너'],
  '포지션/잔고':['포지션/잔고','포지션'],
  '전략 설정':['전략 설정','전략'],
  '알림':['알림'],
  '백테스트':['백테스트'],
  '실행 기록':['실행 기록'],
  '차트':['차트']
 }[label]||[label];
 return originalButtons().find(b=>aliases.some(a=>(b.textContent||'').trim().includes(a)));
}
function hideAll(){document.querySelectorAll('.tabPane').forEach(p=>{p.classList.remove('activePane');p.style.display='none'})}
function navActive(route){document.querySelectorAll('footer.v850Nav button').forEach(b=>b.classList.toggle('active',b.dataset.route===route));try{history.replaceState(null,'','#'+route)}catch(e){}}
function openOriginal(label,route){
 const b=findTab(label);if(b){b.click();navActive(route);setTimeout(()=>window.scrollTo({top:0,behavior:'smooth'}),30);return true}return false;
}
function homeHTML(){
 const t=txt();
 const live=/MARKET\s*LIVE/i.test(t)?'LIVE':'확인';
 const position=/POSITION\s*OLD/i.test(t)?'OLD':(/POSITION\s*(LIVE|FRESH)/i.test(t)?'LIVE':'확인');
 const decision=(t.match(/DECISION\s*([A-Z]+)/i)||[])[1]||'확인';
 const confidence=num(/종합\s*신뢰도\s*(\d+(?:\.\d+)?)%/i);
 const safety=num(/청산가\s*안전거리\s*(\d+(?:\.\d+)?)%/i);
 const action=(t.match(/다음\s*행동[\s\S]{0,90}?(관망|대기|롱\s*익절\s*준비|숏\s*익절\s*준비|매수|매도)/i)||[])[1]||'상세 확인';
 return `<div class="v850Hero"><div class="v850Eyebrow">BTC Hedge Assistant V${VERSION}</div><div class="v850Title">오늘 필요한 것만 먼저</div><div class="v850Sub">핵심 상태를 짧게 보고, 상세 기능은 아래 메뉴에서 별도 화면으로 엽니다.</div><div class="v850Status"><div class="v850Metric"><span>시장 데이터</span><b>${esc(live)}</b></div><div class="v850Metric"><span>포지션 데이터</span><b>${esc(position)}</b></div><div class="v850Metric wide"><span>실행 판단</span><b>${esc(decision)}</b></div></div></div>
 <div class="card v850Decision"><div class="small">지금 판단</div><div class="mid" style="margin-top:4px">${esc(action)}</div><div class="small" style="margin-top:7px">종합 신뢰도 ${esc(confidence)}% · 청산가 안전거리 ${esc(safety)}%</div></div>
 <div class="v850Quick"><button data-go="scanner"><b>시장 스캔</b><span>종목 점수·랭킹·신호 확인</span></button><button data-go="position"><b>포지션 점검</b><span>롱/숏·잔고·청산가 확인</span></button><button data-go="daily"><b>오늘 시황</b><span>글로벌 리포트 + 내부 신호</span></button></div>
 <div class="card v850Daily"><div class="row"><div><div class="small">V8.5 원칙</div><b>요약 우선 · 상세는 필요할 때</b></div><button data-go="more">전체 기능</button></div></div>`;
}
function ensurePages(){
 const main=document.querySelector('main');if(!main)return false;
 if(!document.getElementById('v850HomePane')){const p=document.createElement('section');p.id='v850HomePane';p.className='tabPane';main.insertBefore(p,main.firstChild)}
 if(!document.getElementById('v850MorePane')){const p=document.createElement('section');p.id='v850MorePane';p.className='tabPane';main.appendChild(p)}
 return true;
}
function bindGo(root=document){root.querySelectorAll('[data-go]').forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.addEventListener('click',()=>route(b.dataset.go))})}
function showHome(){ensurePages();hideAll();const p=document.getElementById('v850HomePane');p.innerHTML=homeHTML();p.style.display='block';p.classList.add('activePane');bindGo(p);navActive('home');window.scrollTo({top:0,behavior:'smooth'})}
function showMore(){
 ensurePages();hideAll();const p=document.getElementById('v850MorePane');p.innerHTML=`<div class="v850Hero"><div class="v850Eyebrow">도구 모음</div><div class="v850Title">더보기</div><div class="v850Sub">자주 쓰는 기능은 하단 5개에 두고, 설정·검증·기록은 이 화면으로 모았습니다.</div></div><div class="v850Menu">${MORE.map(([key,title,sub])=>`<button data-open="${esc(key)}"><b>${esc(title)}</b><span>${esc(sub)}</span></button>`).join('')}</div><div class="v850SectionTitle">앱 관리</div><div class="v850Menu"><button id="v850Refresh"><b>전체 새로고침</b><span>시장 데이터와 화면을 다시 불러옵니다.</span></button><button id="v850Top"><b>맨 위로</b><span>현재 화면의 시작으로 이동합니다.</span></button></div>`;p.style.display='block';p.classList.add('activePane');
 p.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>{const key=b.dataset.open;if(!openOriginal(key,'more')){alert(`${key} 화면을 찾지 못했습니다.`)}}));
 p.querySelector('#v850Refresh')?.addEventListener('click',()=>location.reload());p.querySelector('#v850Top')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));navActive('more');window.scrollTo({top:0,behavior:'smooth'});
}
function compactDaily(){
 const body=document.getElementById('dailyBriefBody');if(!body||body.querySelector('#v850DailyDetails')||body.children.length<2)return;
 const kids=[...body.children];const details=document.createElement('details');details.id='v850DailyDetails';const sum=document.createElement('summary');sum.innerHTML='<span>상세 시황</span><span class="small">리포트 · 시나리오 · 리스크 · 일정</span>';details.appendChild(sum);const inner=document.createElement('div');inner.className='v850DetailsInner';kids.slice(1).forEach(n=>inner.appendChild(n));details.appendChild(inner);body.appendChild(details);
}
function showDaily(){
 const b=document.getElementById('dailyBriefTabBtn');if(b){b.click();navActive('daily');setTimeout(compactDaily,300);setTimeout(compactDaily,1200);return}
 setTimeout(()=>{const x=document.getElementById('dailyBriefTabBtn');if(x){x.click();navActive('daily');setTimeout(compactDaily,400)}},600);
}
function route(r){
 if(r==='home')return showHome();
 if(r==='scanner')return openOriginal('시장 스캐너','scanner')||showHome();
 if(r==='position')return openOriginal('포지션/잔고','position')||showHome();
 if(r==='daily')return showDaily();
 if(r==='more')return showMore();
}
function buildFooter(){
 let f=document.querySelector('footer');if(!f){f=document.createElement('footer');document.body.appendChild(f)}
 f.className='v850Nav';f.innerHTML=NAV.map(([r,l])=>`<button type="button" data-route="${r}">${l}</button>`).join('');f.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>route(b.dataset.route)));
}
function patchVersion(){document.title=`BTC Hedge Assistant v${VERSION}`;document.querySelectorAll('h1').forEach(h=>{if(/BTC Hedge Assistant/i.test(h.textContent||''))h.innerHTML=(h.innerHTML||'').replace(/v8\.\d+(?:\.\d+)?/ig,`v${VERSION}`)})}
function observeDaily(){
 const mo=new MutationObserver(()=>{const p=document.getElementById('dailyBriefPane');if(p&&p.style.display!=='none')setTimeout(compactDaily,30)});mo.observe(document.body,{childList:true,subtree:true});
}
function init(){injectStyle();document.body.classList.add('v850');patchVersion();if(!ensurePages())return;buildFooter();bindGo();observeDaily();const h=(location.hash||'#home').slice(1);route(NAV.some(x=>x[0]===h)?h:'home')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,350));else setTimeout(init,350);
window.BTCV850={route,showHome,compactDaily};
})();
