/* BTC Hedge Assistant v8.6.0 - Strategy Research Lab v1 */
(()=>{
'use strict';
const VERSION='8.6.0', PAGE='strategyLab';
const $=id=>document.getElementById(id);
const n=v=>Number.isFinite(Number(v))?Number(v):null;
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const fmt=(v,d=1)=>v==null?'--':Number(v).toFixed(d);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function records(){try{return window.BTCLearning?.records?.()||JSON.parse(localStorage.getItem('v832learning')||'[]')}catch(e){return[]}}
function signals(){return records().filter(r=>r?.kind==='scanner_signal'&&r?.price)}
function outcome(r,h='4h'){const o=r?.outcomes?.[h];return o&&o.hit!=null?o:null}
function regime(r){
 const h1=r?.timeframes?.h1||{},h4=r?.timeframes?.h4||{},d1=r?.timeframes?.d1||{};
 const adx=avg([n(h1.adx),n(h4.adx)].filter(x=>x!=null))||0;
 const b=avg([n(h1.bias),n(h4.bias),n(d1.bias)].filter(x=>x!=null))||0;
 const vr=avg([n(h1.volumeRatio),n(h4.volumeRatio)].filter(x=>x!=null))||0;
 if(adx>=30&&b>=0.35)return '강한 상승';
 if(adx>=30&&b<=-0.35)return '강한 하락';
 if(vr>=1.7&&adx>=22)return '고변동성';
 if(b>=0.18)return '약한 상승';
 if(b<=-0.18)return '약한 하락';
 return '횡보';
}
function tags(r,o){
 const t=[],h1=r?.timeframes?.h1||{},h4=r?.timeframes?.h4||{},d1=r?.timeframes?.d1||{};
 const adx=avg([n(h1.adx),n(h4.adx)].filter(x=>x!=null));
 const vr=avg([n(h1.volumeRatio),n(h4.volumeRatio)].filter(x=>x!=null));
 const b=[n(h1.bias),n(h4.bias),n(d1.bias)].filter(x=>x!=null);
 if(adx!=null&&adx<18)t.push('ADX 부족');
 if(vr!=null&&vr<0.8)t.push('거래량 부족');
 if(b.length>=2&&Math.min(...b)<0&&Math.max(...b)>0)t.push('타임프레임 불일치');
 if(n(r.entryScore)!=null&&n(r.entryScore)<55)t.push('진입점수 낮음');
 if(n(r.trendScore)!=null&&n(r.trendScore)<55)t.push('추세점수 낮음');
 if(o&&!o.hit&&Math.abs(n(o.returnPct)||0)>=2)t.push('역방향 변동 확대');
 return t.length?t:['특이원인 없음'];
}
const candidates=[
 {id:'CURRENT',name:'현재 전략',desc:'현재 발생한 모든 방향 신호',keep:r=>r.signal==='UP'||r.signal==='DOWN'},
 {id:'A',name:'후보 A · 품질 강화',desc:'추세≥60 · 진입≥60인 신호만',keep:r=>(r.signal==='UP'||r.signal==='DOWN')&&(n(r.trendScore)||0)>=60&&(n(r.entryScore)||0)>=60},
 {id:'B',name:'후보 B · MTF 정렬',desc:'1H·4H 방향 정렬 + ADX≥20',keep:r=>{if(!(r.signal==='UP'||r.signal==='DOWN'))return false;const a=n(r?.timeframes?.h1?.bias),b=n(r?.timeframes?.h4?.bias),adx=avg([n(r?.timeframes?.h1?.adx),n(r?.timeframes?.h4?.adx)].filter(x=>x!=null));if(a==null||b==null||adx==null)return false;return r.signal==='UP'?a>0&&b>0&&adx>=20:a<0&&b<0&&adx>=20}},
 {id:'C',name:'후보 C · 보수형',desc:'추세≥65 · 진입≥60 · 거래량≥0.9',keep:r=>{if(!(r.signal==='UP'||r.signal==='DOWN'))return false;const vr=avg([n(r?.timeframes?.h1?.volumeRatio),n(r?.timeframes?.h4?.volumeRatio)].filter(x=>x!=null));return (n(r.trendScore)||0)>=65&&(n(r.entryScore)||0)>=60&&(vr==null||vr>=0.9)}}
];
function evaluate(c,h='4h'){
 const arr=signals().filter(c.keep).map(r=>({r,o:outcome(r,h)})).filter(x=>x.o);
 const wins=arr.filter(x=>x.o.hit).length,rets=arr.map(x=>n(x.o.directionalPct)||0);
 let eq=0,peak=0,mdd=0;for(const x of rets){eq+=x;peak=Math.max(peak,eq);mdd=Math.min(mdd,eq-peak)}
 const reg={};for(const x of arr){const k=regime(x.r);reg[k]=reg[k]||{n:0,w:0,ret:0};reg[k].n++;if(x.o.hit)reg[k].w++;reg[k].ret+=n(x.o.directionalPct)||0}
 return {id:c.id,name:c.name,desc:c.desc,n:arr.length,win:arr.length?wins/arr.length*100:null,ret:avg(rets),mdd,reg};
}
function promotion(all){
 const cur=all[0];if(!cur||cur.n<20)return {label:'데이터 축적 중',why:`현재 평가표본 ${cur?.n||0}건 · 최소 20건 필요`,pick:null};
 const viable=all.slice(1).filter(x=>x.n>=20&&x.win!=null&&cur.win!=null&&x.win>=cur.win+5&&x.ret!=null&&cur.ret!=null&&x.ret>=cur.ret&&x.mdd>=cur.mdd);
 if(!viable.length)return {label:'현재 전략 유지',why:'후보가 최소 표본·승률 +5%p·평균수익·손실폭 조건을 동시에 통과하지 못함',pick:null};
 viable.sort((a,b)=>(b.win-a.win)+(b.ret-a.ret)*2+(b.mdd-a.mdd)*.2);const p=viable[0];
 const regimes=Object.values(p.reg).filter(x=>x.n>=5).length;
 if(regimes<2)return {label:'관찰 후보',why:`${p.name} 우세하지만 국면별 표본이 부족함`,pick:p};
 return {label:'승격 후보',why:`${p.name}: 충분한 표본에서 현재 전략보다 승률·평균수익·손실폭 우세`,pick:p};
}
function versionStats(){
 const map={};for(const r of signals()){const o=outcome(r,'4h');if(!o)continue;const v=r.appVersion||'unknown';map[v]=map[v]||{n:0,w:0,ret:0};map[v].n++;if(o.hit)map[v].w++;map[v].ret+=n(o.directionalPct)||0}
 return Object.entries(map).sort((a,b)=>String(b[0]).localeCompare(String(a[0]))).slice(0,6);
}
function failureStats(){const m={};for(const r of signals()){const o=outcome(r,'4h');if(!o||o.hit)continue;for(const t of tags(r,o))m[t]=(m[t]||0)+1}return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,6)}
function regimeStats(){const m={};for(const r of signals()){const o=outcome(r,'4h');if(!o)continue;const k=regime(r);m[k]=m[k]||{n:0,w:0,ret:0};m[k].n++;if(o.hit)m[k].w++;m[k].ret+=n(o.directionalPct)||0}return m}
function similarCases(){
 const all=signals().filter(r=>outcome(r,'4h'));if(!all.length)return null;
 const last=signals().slice(-1)[0];if(!last)return null;const dir=last.signal,rg=regime(last),ts=n(last.trendScore)||0,es=n(last.entryScore)||0;
 const pool=all.filter(r=>r.signal===dir&&regime(r)===rg&&Math.abs((n(r.trendScore)||0)-ts)<=15&&Math.abs((n(r.entryScore)||0)-es)<=15).slice(-60);
 if(!pool.length)return {n:0,rg,dir};const os=pool.map(r=>outcome(r,'4h'));return {n:pool.length,rg,dir,win:os.filter(o=>o.hit).length/pool.length*100,avg:avg(os.map(o=>n(o.directionalPct)||0)),worst:Math.min(...os.map(o=>n(o.directionalPct)||0)),best:Math.max(...os.map(o=>n(o.directionalPct)||0))};
}
function style(){if($('v860LabStyle'))return;const s=document.createElement('style');s.id='v860LabStyle';s.textContent=`
#strategyLab{max-width:980px;margin:0 auto;padding:2px 0 110px}.labHero{background:linear-gradient(180deg,#14243a,#0e1825);border:1px solid #35517a;border-radius:18px;padding:15px;margin-bottom:10px}.labTitle{font-size:23px;font-weight:900}.labSub{font-size:11px;color:#9aa6b2;line-height:1.55;margin-top:5px}.labGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.labCard{background:linear-gradient(180deg,#121b27,#0e1620);border:1px solid #27323f;border-radius:15px;padding:11px}.labCard.wide{grid-column:1/-1}.labMetric{font-size:23px;font-weight:900}.labTiny{font-size:10px;color:#91a0b0;line-height:1.45}.labTable{width:100%;border-collapse:collapse;font-size:10px;min-width:620px}.labTable th,.labTable td{padding:7px;border-bottom:1px solid #223040;text-align:right}.labTable th:first-child,.labTable td:first-child{text-align:left}.labScroll{overflow-x:auto}.labGood{color:#20d792}.labWarn{color:#ffbf47}.labBad{color:#ff667a}.labBadge{display:inline-block;padding:4px 7px;border:1px solid #3a4e66;border-radius:999px;font-size:10px}.labPromote{border-color:#285c48;background:#10271f}.labHold{border-color:#6d5626;background:#2a2111}.labList{display:grid;gap:6px;margin-top:7px}.labRow{display:flex;justify-content:space-between;gap:8px;padding:7px 0;border-bottom:1px solid #223040;font-size:11px}.labBtn{width:100%;margin-top:8px}.v860ResearchBtn{border-color:#3c6088!important;background:#13243a!important}@media(max-width:620px){.labGrid{grid-template-columns:1fr}.labCard.wide{grid-column:auto}}
`;document.head.appendChild(s)}
function ensurePage(){style();let main=document.querySelector('main');if(!main)return null;let p=$(PAGE);if(!p){p=document.createElement('section');p.id=PAGE;p.className='v853Page';p.style.display='none';main.appendChild(p)}return p}
function render(){const p=ensurePage();if(!p)return;const ev=candidates.map(c=>evaluate(c,'4h')),prom=promotion(ev),vs=versionStats(),fs=failureStats(),rs=regimeStats(),sim=similarCases(),total=signals().length,evaluated=ev[0].n;
 const regRows=Object.entries(rs).sort((a,b)=>b[1].n-a[1].n).map(([k,x])=>`<div class="labRow"><span>${esc(k)}</span><b>${x.n}건 · ${fmt(x.w/x.n*100)}% · ${fmt(x.ret/x.n,2)}%</b></div>`).join('')||'<div class="labTiny">평가 데이터가 아직 없습니다.</div>';
 const failRows=fs.map(([k,v])=>`<div class="labRow"><span>${esc(k)}</span><b>${v}회</b></div>`).join('')||'<div class="labTiny">실패 원인 표본이 아직 없습니다.</div>';
 p.innerHTML=`<div class="labHero"><div class="labTitle">전략 연구소 V1</div><div class="labSub">자동으로 전략을 바꾸지 않습니다. 누적 신호를 4H 결과로 재검증하고 후보전략을 비교한 뒤, 충분한 표본이 있을 때만 승격 후보를 제안합니다.</div></div>
 <div class="labGrid"><div class="labCard"><div class="labTiny">누적 신호</div><div class="labMetric">${total}건</div><div class="labTiny">4H 평가 완료 ${evaluated}건</div></div><div class="labCard ${prom.pick?'labPromote':'labHold'}"><div class="labTiny">연구소 판정</div><div class="labMetric">${esc(prom.label)}</div><div class="labTiny">${esc(prom.why)}</div></div>
 <div class="labCard wide"><b>현재전략 vs 후보전략</b><div class="labScroll"><table class="labTable"><thead><tr><th>전략</th><th>표본</th><th>적중률</th><th>평균방향수익</th><th>누적곡선 MDD</th></tr></thead><tbody>${ev.map(x=>`<tr><td><b>${esc(x.name)}</b><div class="labTiny">${esc(x.desc)}</div></td><td>${x.n}</td><td>${x.win==null?'--':fmt(x.win)+'%'}</td><td>${x.ret==null?'--':fmt(x.ret,2)+'%'}</td><td>${fmt(x.mdd,2)}%</td></tr>`).join('')}</tbody></table></div></div>
 <div class="labCard"><b>시장 국면별 성과</b><div class="labList">${regRows}</div></div><div class="labCard"><b>실패 원인 TOP</b><div class="labList">${failRows}</div></div>
 <div class="labCard wide"><b>최근 신호 유사사례</b><div class="labTiny" style="margin-top:6px">${!sim?'데이터 없음':sim.n?`${esc(sim.rg)} · ${esc(sim.dir)} 유사 ${sim.n}건 · 적중 ${fmt(sim.win)}% · 평균 ${fmt(sim.avg,2)}% · 최악 ${fmt(sim.worst,2)}% · 최고 ${fmt(sim.best,2)}%`:`${esc(sim.rg)} · ${esc(sim.dir)} 조건의 유사사례가 아직 없습니다.`}</div></div>
 <div class="labCard wide"><b>버전별 실제 성과</b><div class="labList">${vs.map(([v,x])=>`<div class="labRow"><span>v${esc(v)}</span><b>${x.n}건 · ${fmt(x.w/x.n*100)}% · 평균 ${fmt(x.ret/x.n,2)}%</b></div>`).join('')||'<div class="labTiny">버전 비교용 평가 데이터가 아직 없습니다.</div>'}</div><button id="labRefresh" class="labBtn">연구소 다시 계산</button></div></div>`;
 $('labRefresh')?.addEventListener('click',render);
}
function open(){render();const p=$(PAGE);if(window.BTCV853?.activatePane)return window.BTCV853.activatePane(p,'more');document.querySelectorAll('main>section').forEach(x=>x.style.display='none');p.style.display='block';window.scrollTo(0,0)}
function hookMore(){const m=$('v850MorePane');if(!m)return;const menu=m.querySelector('.v850Menu');if(!menu||m.querySelector('.v860ResearchBtn'))return;const b=document.createElement('button');b.className='v860ResearchBtn';b.innerHTML='<b>전략 연구소</b><span>현재전략·후보전략·국면·실패원인 검증</span>';b.addEventListener('click',open);menu.insertBefore(b,menu.firstChild)}
function patchVersion(){document.title=`BTC Hedge Assistant v${VERSION}`;document.querySelectorAll('h1').forEach(h=>{if(/BTC Hedge Assistant/i.test(h.textContent||''))h.textContent=`BTC Hedge Assistant v${VERSION}`})}
function init(){patchVersion();ensurePage();hookMore();new MutationObserver(()=>hookMore()).observe(document.body,{childList:true,subtree:true});setInterval(()=>{if(location.hash==='#more')hookMore()},1500);window.BTCStrategyLab={open,render,evaluate:()=>candidates.map(c=>evaluate(c,'4h')),promotion:()=>promotion(candidates.map(c=>evaluate(c,'4h')))} }
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,800));else setTimeout(init,800);
})();