/* BTC Hedge Assistant v8.22.2 - Today's Comprehensive Analysis */
(()=>{'use strict';
if(window.__BTC_TODAY_ANALYSIS_SINGLETON&&window.BTCTodayAnalysis)return;
window.__BTC_TODAY_ANALYSIS_SINGLETON=true;
const V='8.22.2',ID='v8222TodayAnalysisPage';
const $=id=>document.getElementById(id);
const text=id=>($(id)?.textContent||'').trim();
const num=v=>Number(String(v??'').replace(/[^0-9+-.]/g,''));
const fmtMoney=v=>Number.isFinite(Number(v))?'$'+Math.round(Number(v)).toLocaleString():'--';
const pct=v=>Number.isFinite(Number(v))?(Number(v)*100).toFixed(1)+'%':'--';
const ageMin=v=>{const t=Date.parse(v||'');return Number.isFinite(t)?Math.max(0,(Date.now()-t)/60000):Infinity};
async function J(path){const r=await fetch(path+(path.includes('?')?'&':'?')+'t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function ensureStyle(){if($('v8222AnalysisStyle'))return;const s=document.createElement('style');s.id='v8222AnalysisStyle';s.textContent=`
#${ID}{padding:0 0 24px}.v8222AnaHero,.v8222AnaCard{border:1px solid #2b4056;border-radius:15px;background:linear-gradient(180deg,#111d2b,#0c1620);padding:13px;margin-bottom:10px}.v8222AnaHero{border-color:#3b5f8d;background:linear-gradient(180deg,#162b45,#0d1927)}.v8222AnaHero h2{font-size:21px;margin:0 0 4px}.v8222AnaMeta{font-size:10px;color:#91a2b5}.v8222AnaLead{font-size:16px;font-weight:850;line-height:1.5;margin-top:10px}.v8222AnaCard h3{font-size:15px;margin:0 0 8px}.v8222AnaCard p{font-size:12.5px;line-height:1.65;color:#d4dde7;margin:7px 0}.v8222AnaGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.v8222AnaMetric{border:1px solid #2a3d50;border-radius:11px;padding:9px;background:#09141f}.v8222AnaMetric span{display:block;color:#8fa0b5;font-size:10px}.v8222AnaMetric b{display:block;font-size:15px;margin-top:3px}.v8222AnaGood{color:#20d792}.v8222AnaWarn{color:#ffbf47}.v8222AnaBad{color:#ff667a}.v8222AnaNote{font-size:10px!important;color:#8495a8!important}.v8222AnaRefresh{width:100%;margin-top:8px}@media(max-width:520px){.v8222AnaGrid{grid-template-columns:1fr 1fr}.v8222AnaLead{font-size:15px}}
`;document.head.appendChild(s)}
function ensurePage(){ensureStyle();let p=$(ID);if(!p){p=document.createElement('section');p.id=ID;p.className='v8222Page v8221Page';document.querySelector('main')?.appendChild(p)}return p}
function regimeKorean(r){const x=String(r||'').toUpperCase();if(x==='STRONG_UP')return'강한 상승';if(x==='UP')return'상승';if(x==='RANGE')return'횡보';if(x==='DOWN')return'하락';if(x==='CRASH_DOWN')return'급락';return r||'판단 대기'}
function actionKorean(a){const x=String(a||'').toUpperCase();if(x==='HOLD')return'현재 구조 유지';if(x==='EXIT_ALL')return'전량 종료 모델';if(x.startsWith('SHORT_'))return'숏 비중 확대 후보';if(x.startsWith('LONG_'))return'롱 비중 확대 후보';return a||'대기'}
function healthParagraph(h){if(!h)return'안전 상태를 아직 계산 중입니다.';if(h.grade==='HEALTHY')return'핵심 모듈, 연구 데몬, 서비스워커, 시장 연결 상태에서 중대한 이상이 감지되지 않았습니다.';if(h.grade==='CRITICAL')return`안전장치가 중대 이상을 감지했습니다. ${[...(h.critical||[]),...(h.warnings||[])].join(', ')} 항목을 먼저 확인해야 합니다.`;return`앱은 동작 중이지만 ${h.warnings?.join(', ')||'일부 항목'}에 주의가 필요합니다. 중요한 실행 판단 전 최신 상태를 다시 확인하는 것이 좋습니다.`}
function liveSnapshot(){return{price:text('price'),change:text('chg'),mode:text('mode'),confidence:text('confidence'),safe:text('safeDist'),reserve:text('reserve'),next:text('nextNow'),trigger:text('nextTrigger'),strategy:text('strategyState'),exec:text('execState'),regime:text('marketRegime'),position:text('positionFreshness')}}
function buildNarrative(research,brief,health){
  const live=liveSnapshot(),m=research?.market||{},ms=research?.marketStructure||{},mc=research?.monteCarlo||{},tw=research?.terminalWallet||{},ld=research?.lastDecision||{},rc=research?.regimeChampion||{};
  const rAge=ageMin(research?.generatedAt),bAge=ageMin(brief?.generatedAt),fresh=rAge<=45;
  const price=live.price||fmtMoney(m.price),regime=regimeKorean(rc.current||rc.rawCurrent),exec=actionKorean(tw.executable?.id||ld.executable),model=actionKorean(tw.modelBest?.id||ld.modelBest);
  const lead=`현재 ${price} 부근에서 앱의 실시간 판단은 “${live.next||'대기'}”이고, 연구 엔진은 시장을 ${regime} 국면으로 보고 있습니다. 모델이 가장 높은 효용으로 본 선택은 “${model}”이지만, 실제 실행 가능 판단은 “${exec}”로 제한되어 있어 모델 최적값과 실행 판단을 분리해서 보는 것이 핵심입니다.`;
  const market=`4시간 ATR 기준 변동성은 약 ${pct(m.atr4hPct)}이고 연구 국면 점수는 ${m.regimeScore??'--'}/100입니다. 파생시장 구조는 ${research?.marketStructure?.healthy?'정상 범위':'주의 상태'}로 평가되며, 펀딩 ${Number.isFinite(ms.funding)?(ms.funding*100).toFixed(4)+'%':'--'}, 베이시스 ${Number.isFinite(ms.basis)?(ms.basis*100).toFixed(3)+'%':'--'}, 미결제약정 ${Number.isFinite(ms.openInterest)?Math.round(ms.openInterest).toLocaleString():'--'} 수준입니다. 이는 방향 신호 하나보다 현재 추세와 레버리지 과열 여부를 함께 보라는 의미입니다.`;
  const forecast=`몬테카를로 ${mc.paths??'--'}개 경로의 단기 분포는 하위 10% ${fmtMoney(mc.terminalPriceP10)}, 중앙값 ${fmtMoney(mc.terminalPriceMedian)}, 상위 10% ${fmtMoney(mc.terminalPriceP90)}입니다. 이 범위는 목표가격 예측이 아니라 변동 가능 구간을 보는 스트레스 자료이며, 현재 포지션의 청산 안전거리와 함께 해석해야 합니다.`;
  const strategy=`현재 레짐 챔피언은 ${regime}용 “${rc.champions?.[rc.current]?.name||ld.champion||'--'}”입니다. 최근 최적화는 ${research?.optimizer?.tested??'--'}개 조합, ${research?.optimizer?.folds??'--'}개 폴드로 비교했고 승인 상태는 ${research?.optimizer?.approved?'통과':'보류'}입니다. 다만 Shadow 표본은 ${research?.shadow?.samples??0}개이고 Shadow2 신뢰등급은 ${research?.shadow2?.confidenceGrade||'--'}이므로, 백테스트 우위가 실전 우위로 확정됐다고 보기는 이릅니다.`;
  const execution=`실시간 화면의 실행 상태는 “${live.exec||'--'}”, 전략 상태는 “${live.strategy||'--'}”, 청산가 안전거리는 ${live.safe||'--'}, 비상증거금 잔여는 ${live.reserve||'--'}입니다. 따라서 오늘의 우선순위는 방향을 맞히는 것보다 안전거리와 순노출을 먼저 유지하고, 앱이 표시하는 다음 조건(${live.trigger||'조건 계산 중'})이 실제로 충족될 때만 단계적으로 대응하는 것입니다.`;
  const external=brief?`외부 뉴스·거시 브리핑 점수는 ${brief.externalScore??'--'}/100, 위험등급은 ${brief.riskLevel||'--'}이며 요약은 “${brief.headline||'--'}”입니다. 자동 수집 헤드라인은 참고자료이므로 단일 기사보다 ETF 자금흐름, 연준·달러, 지정학 충격이 동시에 같은 방향을 가리키는지 확인하는 편이 안전합니다.`:'외부 일일 브리핑을 불러오지 못해 기술·연구 데이터 중심으로 분석했습니다.';
  const freshness=`연구 데이터는 약 ${Number.isFinite(rAge)?Math.round(rAge)+'분':'--'} 전, 일일 브리핑은 약 ${Number.isFinite(bAge)?Math.round(bAge)+'분':'--'} 전 생성됐습니다. ${fresh?'연구 데이터는 현재 신선도 기준 안에 있습니다.':'연구 데이터가 신선도 기준을 벗어났으므로 신규 실행 판단의 신뢰도를 낮춰야 합니다.'}`;
  return{live,lead,market,forecast,strategy,execution,external,freshness,health:healthParagraph(health),rAge,bAge}
}
async function render(){
  const p=ensurePage();p.innerHTML='<div class="v8222AnaHero"><h2>금일의 종합분석</h2><div class="v8222AnaMeta">전략·포지션·연구데이터·외부브리핑·안전상태를 하나의 설명으로 통합 중...</div></div>';
  let research=null,brief=null;const errs=[];
  try{[research,brief]=await Promise.all([J('./data/research/latest.json'),J('./data/daily/brief.json')])}catch(e){errs.push(e.message);try{research=await J('./data/research/latest.json')}catch(x){}try{brief=await J('./data/daily/brief.json')}catch(x){}}
  let health=null;try{health=await window.BTCSafetyHealth?.check?.()}catch(e){}
  const n=buildNarrative(research,brief,health),r=research||{},mc=r.monteCarlo||{},tw=r.terminalWallet||{};
  p.innerHTML=`<div class="v8222AnaHero"><h2>금일의 종합분석</h2><div class="v8222AnaMeta">APP v${esc(window.BTC_APP_VERSION||V)} · ${new Date().toLocaleString()} · 자동 데이터 기반 설명</div><div class="v8222AnaLead">${esc(n.lead)}</div></div>
  <div class="v8222AnaGrid">
    <div class="v8222AnaMetric"><span>현재가</span><b>${esc(n.live.price||fmtMoney(r.market?.price))}</b></div>
    <div class="v8222AnaMetric"><span>오늘의 다음 행동</span><b>${esc(n.live.next||'대기')}</b></div>
    <div class="v8222AnaMetric"><span>연구 국면</span><b>${esc(regimeKorean(r.regimeChampion?.current))}</b></div>
    <div class="v8222AnaMetric"><span>안전 상태</span><b class="${health?.grade==='HEALTHY'?'v8222AnaGood':health?.grade==='CRITICAL'?'v8222AnaBad':'v8222AnaWarn'}">${esc(health?.grade||'CHECKING')}</b></div>
  </div>
  <div class="v8222AnaCard"><h3>1. 시장을 어떻게 보고 있는가</h3><p>${esc(n.market)}</p><p>${esc(n.forecast)}</p></div>
  <div class="v8222AnaCard"><h3>2. 전략 연구 데이터 해석</h3><p>${esc(n.strategy)}</p><p>모델 최적 행동은 <b>${esc(actionKorean(tw.modelBest?.id))}</b>, 실제 실행 허용 행동은 <b>${esc(actionKorean(tw.executable?.id))}</b>입니다. 두 값이 다를 때는 실행 허용값을 우선하며, 연구 결과가 바로 실거래 명령으로 승격되지 않도록 안전장치를 유지합니다.</p></div>
  <div class="v8222AnaCard"><h3>3. 현재 포지션과 오늘의 대응</h3><p>${esc(n.execution)}</p><p>가격 분포 참고 범위는 P10 ${esc(fmtMoney(mc.terminalPriceP10))} · 중앙 ${esc(fmtMoney(mc.terminalPriceMedian))} · P90 ${esc(fmtMoney(mc.terminalPriceP90))}입니다. 이 값만으로 추가 진입이나 청산을 결정하지 않고, 실시간 포지션·청산가·Margin Ratio를 우선합니다.</p></div>
  <div class="v8222AnaCard"><h3>4. 외부 뉴스·거시 환경</h3><p>${esc(n.external)}</p></div>
  <div class="v8222AnaCard"><h3>5. 앱 안전성 및 데이터 신선도</h3><p>${esc(n.health)}</p><p>${esc(n.freshness)}</p>${errs.length?`<p class="v8222AnaNote">일부 데이터 요청 오류: ${esc(errs.join(' · '))}</p>`:''}</div>
  <div class="v8222AnaCard"><h3>오늘의 결론</h3><p><b>${esc(n.live.next||'관망')}</b>을 기본 행동으로 두고, ${esc(n.live.trigger||'다음 조건')}을 재확인하세요. 연구 엔진의 방향성보다 실제 청산 안전거리와 포지션 최신성이 우선이며, 데이터가 오래되거나 안전 상태가 WARN/CRITICAL이면 신규 실행 판단을 보수적으로 낮추는 구조입니다.</p><p class="v8222AnaNote">이 페이지는 앱 내부 데이터와 공개시장 데이터를 읽기 쉽게 풀어쓴 판단 보조 화면입니다. 실제 주문은 거래소의 최신 포지션과 청산가를 다시 확인한 뒤 수동으로 실행하세요.</p><button class="v8222AnaRefresh" type="button" id="v8222AnaRefresh">종합분석 새로고침</button></div>`;
  $('v8222AnaRefresh')?.addEventListener('click',()=>render());return p
}
async function show(){const p=ensurePage();await render();if(window.BTCV8222?.activate)return window.BTCV8222.activate(p,'analysis');if(window.BTCV8221?.activate)return window.BTCV8221.activate(p,'analysis');p.style.display='block';return true}
window.BTCTodayAnalysis={version:V,show,render,page:ensurePage};
})();