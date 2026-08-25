/* BTC Hedge Assistant v8.9.0 - Backtest Selected Hybrid Hedge Engine */
(()=>{
'use strict';
const VERSION='8.9.0', RESULT_URL='./data/backtests/hedge_strategy.json', KEY='btc_dynamic_hedge_v890';
const $=id=>document.getElementById(id);
const num=v=>Number.isFinite(Number(v))?Number(v):null;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let result=null,last=null;
function getMarket(){try{return typeof market!=='undefined'?market:(window.market||{})}catch(e){return window.market||{}}}
function getPos(){try{return typeof pos==='function'?pos():(typeof window.pos==='function'?window.pos():null)}catch(e){return null}}
function loadState(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
function saveState(x){try{localStorage.setItem(KEY,JSON.stringify(x))}catch(e){}}
function ema(vals,p){if(!vals?.length)return null;const k=2/(p+1);let e=Number(vals[0]);for(let i=1;i<vals.length;i++)e=Number(vals[i])*k+e*(1-k);return e}
function closes(rows){return (rows||[]).map(r=>Array.isArray(r)?Number(r[4]):Number(r?.close??r?.c)).filter(Number.isFinite)}
function trend(){
 const m=getMarket(),h=closes(m?.h4),d=closes(m?.d1),p=num(m?.price);
 if(!p||h.length<55||d.length<25)return {ready:false};
 const h20=ema(h.slice(-80),20),h50=ema(h.slice(-100),50),d10=ema(d.slice(-50),10),d20=ema(d.slice(-60),20);
 const bull4=p>h20&&h20>h50,bear4=p<h20&&h20<h50,bullD=p>d10&&d10>d20,bearD=p<d10&&d10<d20;
 return {ready:true,h,d,p,h20,h50,d10,d20,bull4,bear4,bullD,bearD};
}
function fmt(v,d=2){return Number.isFinite(Number(v))?Number(v).toLocaleString(undefined,{maximumFractionDigits:d}):'--'}
function pct(v){return Number.isFinite(v)?v.toFixed(1)+'%':'--'}
function baseQty(p){const s=loadState(),q=num(p?.sq)||0;if(!s.baseShortQty&&q>0){s.baseShortQty=q;s.baseSetAt=Date.now();saveState(s)}return num(s.baseShortQty)||q}
function resetBase(){try{const d=getPos();if(!d?.sq)return;const s=loadState();s.baseShortQty=Number(d.sq);s.baseSetAt=Date.now();saveState(s);render()}catch(e){}}
function liqDist(d,p){if(!d?.liq||!p)return 999;return Math.abs(p-d.liq)/p*100}
function compute(){
 const d=getPos(),m=getMarket();if(!result||!d)return null;const t=trend(),p=num(m?.price);if(!p||!t.ready)return null;
 const cfg=result.config||{},par=result.selectedParams||result.hybrid?.params||{};const B=num(cfg.breakout)||80000,base=Math.max(.0001,baseQty(d)),sq=num(d.sq)||0,lq=num(d.lq)||0;
 const confirm=Math.max(1,Number(par.confirmBars)||2),h=t.h,accepted=h.length>=confirm&&h.slice(-confirm).every(x=>x>B);
 const rawRatio=clamp((4-(num(par.rawBreakTrim)??.5))/4,0,1),r4=clamp(Math.max(num(par.minStrongShort)??1,2.25)/4,0,1),rD=clamp(Math.max(num(par.minStrongShort)??1,1.5)/4,0,1),rStrong=clamp((num(par.minStrongShort)??1)/4,0,1);
 let state='HOLD',label='숏 유지',target=sq,reason='조건 확인 전에는 기존 숏 헤지를 유지합니다.',severity='wait';
 if(p<=Number(d.se||cfg.shortEntry||0)*1.05){state='SHORT_PROFIT_ZONE';label='숏 수익구간 · 헤지 보존';target=sq;reason='숏 평단 수익구간에 접근했습니다. 남은 숏을 기계적으로 없애지 않고 기존 수익관리 엔진과 함께 관리합니다.';severity='good'}
 else if(p<B){state='STOP_TRIM';label='숏 축소 STOP';target=sq;reason='80K를 재이탈했습니다. 추가 숏 축소를 중단하며 자동 재헤지는 하지 않습니다.';severity='bad'}
 else if(accepted&&t.bull4&&t.bullD&&p>Number(d.le||cfg.longEntry||Infinity)){state='STRONG_TRIM';label='강한 숏 축소 후보';target=Math.min(sq,base*rStrong);reason='80K 안착 + 4H·1D 상승 + 롱 평단 상단이 동시에 확인됐습니다.';severity='good'}
 else if(accepted&&t.bull4&&t.bullD){state='CONFIRMED_TRIM';label='확인형 숏 축소 후보';target=Math.min(sq,base*rD);reason='80K 안착과 4H·1D 상승이 확인됐습니다.';severity='good'}
 else if(accepted&&t.bull4){state='4H_TRIM';label='1단계 숏 축소 후보';target=Math.min(sq,base*r4);reason='4H 종가 기준 80K 안착과 4H 상승이 확인됐지만 일봉 확인은 아직 부족합니다.';severity='warn'}
 else if(p>B){state='BREAK_ONLY';label='돌파 확인 대기';target=Math.min(sq,base*rawRatio);reason='80K 위지만 추세 확인이 부족합니다. 본격 축소는 금지하고 백테스트상 허용된 소량 단계만 고려합니다.';severity='warn'}
 const step=num(d.stepQty)||num(par.trimStep)||.5,desired=Math.max(0,sq-target),qty=Math.min(step,desired),safe=liqDist(d,p);let exec=qty>1e-9,block=[];
 if(safe<(num(d.minSafe)||10)){exec=false;block.push('청산가 안전거리 부족')}
 const proj=lq-(sq-qty);if(num(d.maxNet)!=null&&Math.abs(proj)>Number(d.maxNet)){exec=false;block.push('축소 후 순노출 제한 초과')}
 try{const pf=typeof positionFreshnessTier==='function'?positionFreshnessTier():window.positionFreshnessTier?.();if(pf?.limit){exec=false;block.push('포지션 입력값 최신성 부족')}}catch(e){}
 if(state==='STOP_TRIM'||state==='SHORT_PROFIT_ZONE'||state==='HOLD'){exec=false;qty=0}
 if(!result.guardrails?.ordersRemainManual){exec=false;block.push('백테스트 주문 가드 확인 필요')}
 const action=exec?`숏 ${qty.toFixed(2)} 축소 검토`:label;
 return {d,t,p,B,base,sq,lq,accepted,confirm,state,label,target,qty,action,reason,severity,safe,proj,block,exec,rawRatio,r4,rD,rStrong};
}
function css(){if($('dhStyle'))return;const s=document.createElement('style');s.id='dhStyle';s.textContent=`
#dynamicHedgeCard{background:linear-gradient(180deg,#10283a,#0d1823);border:1px solid #386889}.dhHead{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.dhTitle{font-size:16px;font-weight:900}.dhBadge{font-size:9px;border:1px solid #466078;border-radius:999px;padding:3px 6px}.dhMain{font-size:22px;font-weight:900;margin:5px 0}.dhGood{color:#20d792}.dhWarn{color:#ffbf47}.dhBad{color:#ff667a}.dhGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}.dhBox{border:1px solid #2b4052;border-radius:10px;padding:8px;background:#0a151f}.dhBox span{display:block;font-size:9px;color:#91a0b0}.dhBox b{font-size:12px}.dhWhy{font-size:10px;line-height:1.55;color:#b7c5d3;margin-top:8px}.dhBT{margin-top:9px;padding:8px;border:1px solid #29445d;border-radius:10px;background:#0b1722;font-size:10px;line-height:1.55}.dhBtns{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}.dhBtns button{padding:6px 8px}@media(max-width:700px){.dhGrid{grid-template-columns:1fr 1fr}}
`;document.head.appendChild(s)}
function ensure(){css();let card=$('dynamicHedgeCard');if(card)return card;const anchor=$('riskGate')?.closest('.card')||$('nextAction')?.closest('.card')||$('action')?.closest('.card');if(!anchor)return null;card=document.createElement('div');card.id='dynamicHedgeCard';card.className='card';anchor.insertAdjacentElement('afterend',card);return card}
function resultSummary(){if(!result)return '';const x=result.comparisonToLegacy||{},h=result.hybrid||{},l=result.legacy||{};return `백테스트 채택 ${esc(result.recommendation||'--')} · 30일 구간 우위 ${fmt(h.rolling30d?.winRatePct,1)}%<br>테스트 MDD ${fmt(l.test?.maxDrawdown,0)} → ${fmt(h.test?.maxDrawdown,0)} (${fmt(x.testMddDelta,0)}) · 전체 MDD ${fmt(l.overall?.maxDrawdown,0)} → ${fmt(h.overall?.maxDrawdown,0)} (${fmt(x.overallMddDelta,0)})`}
function render(){const card=ensure();if(!card)return;if(!result){card.innerHTML='<div class="dhTitle">🧭 백테스트 채택 헤지 엔진</div><div class="dhWhy">백테스트 결과 불러오는 중...</div>';return}const x=compute();if(!x){card.innerHTML=`<div class="dhHead"><div><div class="dhTitle">🧭 백테스트 채택 헤지 엔진</div><div class="dhWhy">시장 4H·1D 데이터와 포지션을 기다리는 중입니다.</div></div><span class="dhBadge">v${VERSION}</span></div><div class="dhBT">${resultSummary()}</div>`;return}last=x;const cls=x.severity==='good'?'dhGood':x.severity==='bad'?'dhBad':'dhWarn',status=x.exec?'실행 후보':'관찰/대기';
 card.innerHTML=`<div class="dhHead"><div><div class="dhTitle">🧭 백테스트 채택 헤지 엔진</div><div class="dhWhy">기존 수익실현 엔진과 별개로 <b>숏 헤지 비율</b>만 관리합니다.</div></div><span class="dhBadge">${esc(result.recommendation)} · ${status}</span></div><div class="dhMain ${cls}">${esc(x.action)}</div><div class="dhWhy">${esc(x.reason)}${x.block.length?'<br>⚠ '+x.block.map(esc).join(' · '):''}</div><div class="dhGrid"><div class="dhBox"><span>80K 확인</span><b>${x.accepted?`${x.confirm}개 4H 안착`:'미확인/대기'}</b></div><div class="dhBox"><span>4H / 1D</span><b>${x.t.bull4?'상승':x.t.bear4?'하락':'혼조'} / ${x.t.bullD?'상승':x.t.bearD?'하락':'혼조'}</b></div><div class="dhBox"><span>현재 / 기준 숏</span><b>${fmt(x.sq,2)} / ${fmt(x.base,2)} BTC</b></div><div class="dhBox"><span>목표 숏</span><b>${fmt(x.target,2)} BTC</b></div><div class="dhBox"><span>롱 평단</span><b>${fmt(x.d.le,0)}</b></div><div class="dhBox"><span>숏 평단</span><b>${fmt(x.d.se,0)}</b></div><div class="dhBox"><span>안전거리</span><b>${pct(x.safe)}</b></div><div class="dhBox"><span>상태코드</span><b>${esc(x.state)}</b></div></div><div class="dhBT">${resultSummary()}<br><span style="color:#91a0b0">하이브리드는 자동 재헤지를 하지 않습니다. 80K 재이탈·하락 전환에서는 추가 축소만 중단하고 남은 숏을 보존합니다.</span></div><div class="dhBtns"><button id="dhResetBase">현재 숏 ${fmt(x.sq,2)}를 기준수량으로 저장</button><button id="dhRefresh">다시 계산</button></div>`;
 $('dhResetBase')?.addEventListener('click',resetBase);$('dhRefresh')?.addEventListener('click',render)
}
async function loadResult(){try{const r=await fetch(RESULT_URL+'?v='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error(r.status);result=await r.json()}catch(e){console.warn('dynamic hedge backtest result load failed',e)}render()}
function boot(){loadResult();setInterval(render,5000);new MutationObserver(()=>{if(!$('dynamicHedgeCard'))ensure()}).observe(document.body,{childList:true,subtree:true});window.BTCDynamicHedge={version:VERSION,render,getCurrent:()=>last,getResult:()=>result,resetBase}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1400),{once:true});else setTimeout(boot,1400);
})();
