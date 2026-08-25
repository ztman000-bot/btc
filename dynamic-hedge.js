/* BTC Hedge Assistant v8.9.1 - Current Position Dual Backtest + Adaptive Hybrid Hedge */
(()=>{
'use strict';
const VERSION='8.9.1', RESULT_URL='./data/backtests/hedge_strategy.json', KEY='btc_dynamic_hedge_v891';
const $=id=>document.getElementById(id),num=v=>Number.isFinite(Number(v))?Number(v):null,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let result=null,last=null,lastBT=null;
function M(){try{return typeof market!=='undefined'?market:(window.market||{})}catch(e){return window.market||{}}}
function P(){try{return typeof pos==='function'?pos():(typeof window.pos==='function'?window.pos():null)}catch(e){return null}}
function rows4(){return M()?.h4||[]}
function closes(rows){return (rows||[]).map(r=>Array.isArray(r)?Number(r[4]):Number(r?.close??r?.c)).filter(Number.isFinite)}
function emaSeries(a,p){const out=[],k=2/(p+1);let e=null;for(const v of a){e=e==null?v:v*k+e*(1-k);out.push(e)}return out}
function rsiSeries(a,p=14){const out=Array(a.length).fill(null);let g=0,l=0;for(let i=1;i<a.length;i++){const d=a[i]-a[i-1],up=Math.max(d,0),dn=Math.max(-d,0);if(i<=p){g+=up;l+=dn;if(i===p){g/=p;l/=p;out[i]=l===0?100:100-100/(1+g/l)}}else{g=(g*(p-1)+up)/p;l=(l*(p-1)+dn)/p;out[i]=l===0?100:100-100/(1+g/l)}}return out}
function metric(eq){if(!eq.length)return {end:0,mdd:0};let peak=eq[0],mdd=0;for(const x of eq){peak=Math.max(peak,x);mdd=Math.max(mdd,peak-x)}return {end:eq.at(-1),mdd}}
function simWindow(px,start,end,d,kind){const B=80000,fee=(num(d.feeRate)||.04)/100,baseSq=d.sq,step=Math.max(.02,num(d.stepQty)||.2),floorLegacy=baseSq*.5,floorHybrid=baseSq*.25;
 let sq=baseSq,real=0,fees=0,next=B,lastTrade=-999,eq=[],trades=0;const sub=px.slice(0,end+1),e20=emaSeries(sub,20),e50=emaSeries(sub,50),rsi=rsiSeries(sub,14);
 for(let i=start;i<=end;i++){const p=px[i];if(kind==='legacy'){
   while(p>=next&&sq>floorLegacy+1e-9){const q=Math.min(step,sq-floorLegacy);real+=(d.se-p)*q;fees+=p*q*fee;sq-=q;trades++;next*=1.025;if(q<=1e-9)break}
  }else{
   const conf=i>=1&&px[i]>B&&px[i-1]>B,bull4=e20[i]>e50[i]&&p>e20[i],strong=bull4&&rsi[i]!=null&&rsi[i]>=55&&rsi[i]<=78,aboveLong=p>d.le;
   let target=sq;
   if(p<B){target=sq}
   else if(conf&&strong&&aboveLong)target=Math.min(sq,baseSq*.25);
   else if(conf&&strong)target=Math.min(sq,baseSq*.375);
   else if(conf&&bull4)target=Math.min(sq,baseSq*.5625);
   else if(p>B)target=Math.min(sq,baseSq*.875);
   if(i-lastTrade>=6&&sq>Math.max(floorHybrid,target)+1e-9){const q=Math.min(step,sq-Math.max(floorHybrid,target));real+=(d.se-p)*q;fees+=p*q*fee;sq-=q;trades++;lastTrade=i}
  }
  eq.push((num(d.wallet)||0)+(num(d.added)||0)+real-fees+d.lq*(p-d.le)+sq*(d.se-p));
 }
 const m=metric(eq);return {end:m.end,mdd:m.mdd,trades,finalSq:sq,realized:real-fees}
}
function runtimeBacktest(){const d=P(),r=rows4();if(!d||!r?.length)return null;const px=closes(r);if(px.length<120)return null;const starts=[];for(let i=1;i<px.length-42;i++)if(px[i-1]<80000&&px[i]>=80000)starts.push(i);if(!starts.length){const i=Math.max(60,px.length-180);starts.push(i)}
 const wins=[],L=[],H=[];for(const s of starts.slice(-12)){const e=Math.min(px.length-1,s+180);if(e-s<36)continue;const l=simWindow(px,s,e,d,'legacy'),h=simWindow(px,s,e,d,'hybrid');L.push(l);H.push(h);wins.push(h.end>l.end?1:0)}if(!L.length)return null;
 const avg=(a,k)=>a.reduce((s,x)=>s+x[k],0)/a.length,winRate=wins.reduce((a,b)=>a+b,0)/wins.length*100,lm=avg(L,'mdd'),hm=avg(H,'mdd'),le=avg(L,'end'),he=avg(H,'end'),lr=avg(L,'realized'),hr=avg(H,'realized');
 const qualified=winRate>=55&&hm<=lm*1.05&&(he>=le||hm<=lm*.80||hr>=lr);
 return {windows:L.length,winRate,legacy:{avgEnd:le,avgMdd:lm,avgRealized:lr,avgTrades:avg(L,'trades')},hybrid:{avgEnd:he,avgMdd:hm,avgRealized:hr,avgTrades:avg(H,'trades')},qualified,reason:qualified?'현재 포지션에서도 하이브리드 유지':'현재 포지션 재검증 보수모드'}
}
function trend(){const h=closes(rows4()),d1=closes(M()?.d1),p=num(M()?.price);if(!p||h.length<55)return {ready:false};const h20=emaSeries(h.slice(-100),20).at(-1),h50=emaSeries(h.slice(-100),50).at(-1),dh=d1.length>=25?emaSeries(d1.slice(-60),10).at(-1):null,dl=d1.length>=25?emaSeries(d1.slice(-60),20).at(-1):null;return {ready:true,p,h,h20,h50,bull4:p>h20&&h20>h50,bear4:p<h20&&h20<h50,bullD:dh!=null&&p>dh&&dh>dl,bearD:dh!=null&&p<dh&&dh<dl}}
function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
function save(x){try{localStorage.setItem(KEY,JSON.stringify(x))}catch(e){}}
function baseQty(d){const s=state();if(!s.baseShortQty&&d.sq>0){s.baseShortQty=d.sq;s.baseSetAt=Date.now();save(s)}return num(s.baseShortQty)||d.sq}
function resetBase(){const d=P();if(!d?.sq)return;const s=state();s.baseShortQty=d.sq;s.baseSetAt=Date.now();save(s);render()}
function compute(){const d=P(),t=trend(),p=num(M()?.price);if(!d||!t.ready||!p)return null;lastBT=runtimeBacktest();const staticOK=result?.recommendation==='HYBRID_CONFIRMED',runtimeOK=lastBT?.qualified??true,hybrid=staticOK&&runtimeOK,B=80000,base=baseQty(d),sq=d.sq,lq=d.lq,accepted=t.h.length>=2&&t.h.slice(-2).every(x=>x>B);let label='숏 유지',reason='80K 돌파 전에는 기존 헤지를 유지합니다.',target=sq,sev='wait';
 if(p<=d.se*1.05){label='숏 수익구간 · 헤지 보존';reason='숏 수익구간 접근: 기계적 축소 금지.';sev='good'}
 else if(p<B){label='숏 축소 STOP';reason='80K 재이탈: 추가 축소 중단, 남은 숏 보존.';sev='bad'}
 else if(!hybrid){label='보수 모드 · 숏 유지';reason='현재 포지션 재백테스트가 하이브리드 채택 기준을 통과하지 못해 강제 축소하지 않습니다.';sev='warn'}
 else if(accepted&&t.bull4&&t.bullD&&p>d.le){target=base*.25;label='강한 숏 축소 후보';reason='80K 안착 + 4H/1D 상승 + 롱 평단 상단 확인.';sev='good'}
 else if(accepted&&t.bull4&&t.bullD){target=base*.375;label='확인형 숏 축소 후보';reason='80K 안착 + 4H/1D 상승 확인.';sev='good'}
 else if(accepted&&t.bull4){target=base*.5625;label='1단계 숏 축소 후보';reason='80K 4H 안착 + 4H 상승 확인, 일봉은 추가 확인.';sev='warn'}
 else if(p>B){target=base*.875;label='돌파 확인 대기';reason='80K 위지만 추세 확인 부족: 소량만 허용.';sev='warn'}
 const step=Math.max(.02,num(d.stepQty)||.2),qty=Math.min(step,Math.max(0,sq-target)),safe=d.liq?Math.abs(p-d.liq)/p*100:999,proj=lq-(sq-qty),block=[];let exec=qty>1e-9;
 if(safe<(num(d.minSafe)||15)){exec=false;block.push('청산가 안전거리 부족')}if(num(d.maxNet)!=null&&Math.abs(proj)>d.maxNet){exec=false;block.push('축소 후 순노출 제한 초과')}if(/STOP|수익구간|유지|보수/.test(label)){exec=false}
 return {d,t,p,base,sq,lq,target,qty,safe,proj,block,exec,label,reason,sev,hybrid,runtime:lastBT}}
function fmt(v,d=1){return Number.isFinite(Number(v))?Number(v).toLocaleString(undefined,{maximumFractionDigits:d}):'--'}
function css(){if($('dhStyle'))return;const s=document.createElement('style');s.id='dhStyle';s.textContent=`#dynamicHedgeCard{background:linear-gradient(180deg,#10283a,#0d1823);border:1px solid #386889}.dhHead{display:flex;justify-content:space-between;gap:8px}.dhTitle{font-size:16px;font-weight:900}.dhBadge{font-size:9px;border:1px solid #466078;border-radius:999px;padding:3px 6px}.dhMain{font-size:22px;font-weight:900;margin:5px 0}.dhGood{color:#20d792}.dhWarn{color:#ffbf47}.dhBad{color:#ff667a}.dhGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}.dhBox{border:1px solid #2b4052;border-radius:10px;padding:8px;background:#0a151f}.dhBox span{display:block;font-size:9px;color:#91a0b0}.dhBox b{font-size:12px}.dhWhy,.dhBT{font-size:10px;line-height:1.55;color:#b7c5d3;margin-top:8px}.dhBT{padding:8px;border:1px solid #29445d;border-radius:10px;background:#0b1722}.dhBtns{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}@media(max-width:700px){.dhGrid{grid-template-columns:1fr 1fr}}`;document.head.appendChild(s)}
function ensure(){css();let c=$('dynamicHedgeCard');if(c)return c;const a=$('riskGate')?.closest('.card')||$('nextAction')?.closest('.card')||$('action')?.closest('.card');if(!a)return null;c=document.createElement('div');c.id='dynamicHedgeCard';c.className='card';a.insertAdjacentElement('afterend',c);return c}
function staticText(){if(!result)return '장기 벤치마크 로딩 중';const h=result.hybrid?.rolling30d?.winRatePct,x=result.comparisonToLegacy||{};return `장기 30일 구간 우위 ${fmt(h)}% · 전체 MDD 개선 ${fmt(Math.abs(x.overallMddDelta),0)}`}
function runtimeText(b){if(!b)return '현재 포지션 재백테스트 데이터 부족';return `현재포지션 ${b.windows}구간 · 하이브리드 승률 ${fmt(b.winRate)}% · 평균 MDD ${fmt(b.legacy.avgMdd,0)} → ${fmt(b.hybrid.avgMdd,0)} · 실현손익 ${fmt(b.legacy.avgRealized,0)} → ${fmt(b.hybrid.avgRealized,0)}`}
function render(){const c=ensure();if(!c)return;const x=compute();if(!x){c.innerHTML='<div class="dhTitle">🧭 동적 헤지 재백테스트</div><div class="dhWhy">4H 데이터와 포지션을 기다리는 중...</div>';return}last=x;const cls=x.sev==='good'?'dhGood':x.sev==='bad'?'dhBad':'dhWarn',act=x.exec?`숏 ${x.qty.toFixed(2)} 축소 검토`:x.label;c.innerHTML=`<div class="dhHead"><div><div class="dhTitle">🧭 동적 헤지 · 현재포지션 재검증</div><div class="dhWhy">가격단계형 vs 확인형 하이브리드를 최근 4H 돌파구간에서 재비교합니다.</div></div><span class="dhBadge">v${VERSION} · ${x.hybrid?'HYBRID':'CONSERVATIVE'}</span></div><div class="dhMain ${cls}">${esc(act)}</div><div class="dhWhy">${esc(x.reason)}${x.block.length?'<br>⚠ '+x.block.map(esc).join(' · '):''}</div><div class="dhGrid"><div class="dhBox"><span>현재/기준 숏</span><b>${fmt(x.sq,2)} / ${fmt(x.base,2)}</b></div><div class="dhBox"><span>목표 숏</span><b>${fmt(x.target,2)} BTC</b></div><div class="dhBox"><span>4H/1D</span><b>${x.t.bull4?'상승':x.t.bear4?'하락':'혼조'} / ${x.t.bullD?'상승':x.t.bearD?'하락':'혼조'}</b></div><div class="dhBox"><span>안전거리</span><b>${fmt(x.safe)}%</b></div></div><div class="dhBT">${staticText()}<br>${runtimeText(x.runtime)}<br><b>${x.runtime?.qualified?'현재 포지션 기준 하이브리드 채택':'현재 포지션 기준 보수모드'}</b> · 자동 재헤지는 하지 않고 하락 시 추가 축소만 중단합니다.</div><div class="dhBtns"><button id="dhResetBase">현재 숏을 기준수량 저장</button><button id="dhRefresh">재백테스트</button></div>`;$('dhResetBase')?.addEventListener('click',resetBase);$('dhRefresh')?.addEventListener('click',render)}
async function loadResult(){try{const r=await fetch(RESULT_URL+'?v='+Date.now(),{cache:'no-store'});if(r.ok)result=await r.json()}catch(e){}render()}
function boot(){loadResult();setInterval(render,10000);new MutationObserver(()=>{if(!$('dynamicHedgeCard'))ensure()}).observe(document.body,{childList:true,subtree:true});window.BTCDynamicHedge={version:VERSION,render,getCurrent:()=>last,getBacktest:()=>lastBT,getResult:()=>result,resetBase}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1500),{once:true});else setTimeout(boot,1500);
})();