/* BTC Hedge Assistant v8.4.2 - Daily Market Brief */
(()=>{
'use strict';
const DATA_URL='./data/daily/brief.json';
const SNAP_KEY='v842_daily_brief_snapshots';
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,Number(v)||0));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const numFrom=(txt,re)=>{const m=String(txt||'').match(re);return m?Number(m[1]):null};
const bodyText=()=>document.body?.innerText||'';
function localSignals(){
 const t=bodyText();
 const confidence=numFrom(t,/종합\s*신뢰도\s*(\d+(?:\.\d+)?)%/i);
 const safety=numFrom(t,/청산가\s*안전거리\s*(\d+(?:\.\d+)?)%/i);
 const trend=numFrom(t,/중장기\s*추세점수\s*(\d+(?:\.\d+)?)/i)||numFrom(t,/추세점수\s*(\d+(?:\.\d+)?)/i);
 const entry=numFrom(t,/현재\s*진입점수\s*(\d+(?:\.\d+)?)/i)||numFrom(t,/진입점수\s*(\d+(?:\.\d+)?)/i);
 const marketPrice=(()=>{try{return Number(globalThis.market?.price)||null}catch(e){return null}})();
 let learning=null;try{learning=globalThis.BTCLearning?.stats?.()||null}catch(e){}
 const components=[];
 if(confidence!=null)components.push([confidence,.35]);
 if(trend!=null)components.push([trend,.30]);
 if(entry!=null)components.push([entry,.20]);
 if(safety!=null)components.push([Math.min(100,safety*1.5),.15]);
 const w=components.reduce((s,x)=>s+x[1],0);
 const score=w?components.reduce((s,x)=>s+x[0]*x[1],0)/w:50;
 return {score:clamp(score),confidence,trend,entry,safety,marketPrice,learning};
}
function verdict(score,risk){
 if(risk==='high')return score>=60?'상승 우위이나 이벤트 리스크가 커서 추격은 보류':'방어 우선 · 변동성 확대 대비';
 if(score>=72)return '위험선호 우위 · 눌림 확인 후 순응';
 if(score>=60)return '완만한 상승 우위 · 추격보다 확인매매';
 if(score>=45)return '중립/혼조 · 방향 확인 전 관망';
 if(score>=32)return '약세 우위 · 반등 추격 주의';
 return '강한 위험회피 · 방어 우선';
}
function scenario(score){
 const up=Math.round(clamp(25+score*.55,20,70));
 const down=Math.round(clamp(70-score*.5,15,55));
 const flat=Math.max(10,100-up-down);
 return {up,flat,down};
}
async function loadExternal(){
 try{const r=await fetch(`${DATA_URL}?v=${Date.now()}`,{cache:'no-store'});if(!r.ok)throw new Error(r.status);return await r.json()}catch(e){return {generatedAt:null,externalScore:50,riskLevel:'medium',headline:'외부 리포트 데이터를 불러오지 못했습니다.',globalConsensus:[],risks:['외부 데이터 연결 확인 필요'],events:[],sources:[]}}
}
function ageHours(ts){if(!ts)return Infinity;return (Date.now()-new Date(ts).getTime())/36e5}
function saveSnapshot(x){try{const arr=JSON.parse(localStorage.getItem(SNAP_KEY)||'[]');const day=new Date().toISOString().slice(0,10);const rec={day,ts:Date.now(),score:x.score,externalScore:x.externalScore,internalScore:x.internalScore,verdict:x.verdict};const i=arr.findIndex(v=>v.day===day);if(i>=0)arr[i]=rec;else arr.push(rec);localStorage.setItem(SNAP_KEY,JSON.stringify(arr.slice(-90)))}catch(e){}}
function findTabHost(){return document.querySelector('.topTabsSticky .tabs')||document.querySelector('.tabs.topTabsSticky')||document.querySelector('main .tabs')||document.querySelector('.tabs')}
function injectStyles(){
 if(document.getElementById('dailyBriefV842Styles'))return;
 const s=document.createElement('style');s.id='dailyBriefV842Styles';s.textContent=`
 #dailyBriefPane{padding:8px 10px 110px;max-width:980px;margin:0 auto}
 #dailyBriefPane .db-hero{padding:14px;border-radius:18px}
 #dailyBriefPane .db-head{display:flex;gap:12px;align-items:center;justify-content:space-between}
 #dailyBriefPane .db-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}
 #dailyBriefPane .db-btn{min-height:38px;padding:8px 12px;border-radius:12px;border:1px solid var(--line,#27323f);background:#101a27;color:inherit;font-weight:700}
 #dailyBriefPane .db-summary{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center}
 #dailyBriefPane .db-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:10px}
 #dailyBriefPane .db-card{min-width:0;padding:14px;border-radius:16px;overflow:hidden}
 #dailyBriefPane .db-list{display:grid;gap:8px;margin-top:10px}
 #dailyBriefPane .db-item{padding:10px 11px;border:1px solid var(--line,#27323f);border-radius:12px;line-height:1.55;word-break:keep-all;overflow-wrap:anywhere;background:rgba(255,255,255,.018)}
 #dailyBriefPane .db-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}
 #dailyBriefPane .db-metric{padding:11px;border:1px solid var(--line,#27323f);border-radius:12px;min-width:0}
 #dailyBriefPane .db-scenarios{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:10px}
 #dailyBriefPane .db-scenario{padding:12px;border:1px solid var(--line,#27323f);border-radius:14px;min-width:0;line-height:1.45}
 #dailyBriefPane .db-footer-nav{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:14px 0 4px}
 #dailyBriefBottomBtn{position:fixed;right:18px;bottom:124px;z-index:9997;width:46px;height:46px;border-radius:50%;border:1px solid rgba(255,255,255,.18);background:#2563eb;color:white;font-size:24px;box-shadow:0 6px 18px rgba(0,0,0,.35);display:none;align-items:center;justify-content:center}
 @media(max-width:560px){
  #dailyBriefPane{padding-left:8px;padding-right:8px}
  #dailyBriefPane .db-head{align-items:flex-start}
  #dailyBriefPane .db-actions{max-width:130px}
  #dailyBriefPane .db-grid{grid-template-columns:1fr}
  #dailyBriefPane .db-scenarios{grid-template-columns:1fr}
  #dailyBriefPane .db-card{padding:12px}
  #dailyBriefPane .db-summary{grid-template-columns:1fr auto}
  #dailyBriefBottomBtn{right:18px;bottom:120px}
 }
 `;document.head.appendChild(s);
}
function ensureBottomButton(){
 if(document.getElementById('dailyBriefBottomBtn'))return;
 const b=document.createElement('button');b.id='dailyBriefBottomBtn';b.type='button';b.setAttribute('aria-label','일일 시황 맨 아래로');b.textContent='↓';
 b.addEventListener('click',()=>{const p=document.getElementById('dailyBriefPane');if(!p)return;window.scrollTo({top:p.offsetTop+p.scrollHeight-80,behavior:'smooth'})});
 document.body.appendChild(b);
 window.addEventListener('scroll',()=>{const p=document.getElementById('dailyBriefPane');if(!p||p.style.display==='none'){b.style.display='none';return}const rect=p.getBoundingClientRect();const farFromBottom=rect.bottom-window.innerHeight>220;b.style.display=farFromBottom?'flex':'none'},{passive:true});
}
function activate(btn,pane){
 document.querySelectorAll('.tabPane').forEach(x=>{x.classList.remove('activePane');x.style.display='none'});
 document.querySelectorAll('.tabs button,.topTabsSticky button').forEach(x=>x.classList.remove('active'));
 pane.classList.add('activePane');pane.style.display='block';btn.classList.add('active');
 window.scrollTo({top:0,behavior:'smooth'});refresh();
}
function ensureUI(){
 injectStyles();ensureBottomButton();
 if(document.getElementById('dailyBriefPane'))return;
 const host=findTabHost();const main=document.querySelector('main');if(!host||!main)return;
 const btn=document.createElement('button');btn.id='dailyBriefTabBtn';btn.type='button';btn.textContent='일일 시황';btn.className='tabPad';host.appendChild(btn);
 const pane=document.createElement('section');pane.id='dailyBriefPane';pane.className='tabPane';pane.style.display='none';
 pane.innerHTML=`<div class="card scannerHero db-hero"><div class="db-head"><div><div class="mid">V8.4.2 일일 시황</div><div class="small">글로벌 리포트 + 우리 시스템 기준 종합</div></div><div class="db-actions"><button class="db-btn" id="dailyBriefRefresh">새로고침</button><button class="db-btn" id="dailyBriefToBottom">맨 아래 ↓</button></div></div><div id="dailyBriefBody" style="margin-top:10px"><div class="small">시황 생성 중...</div></div></div>`;
 const anchor=document.querySelector('.topTabsSticky')||host;anchor.parentNode.insertBefore(pane,anchor.nextSibling);
 btn.addEventListener('click',()=>activate(btn,pane));
 pane.querySelector('#dailyBriefRefresh').addEventListener('click',refresh);
 pane.querySelector('#dailyBriefToBottom').addEventListener('click',()=>window.scrollTo({top:pane.offsetTop+pane.scrollHeight-80,behavior:'smooth'}));
}
function sourceHtml(s){if(!s)return'';const name=esc(s.name||'source'),url=s.url?esc(s.url):'';return url?`<a href="${url}" target="_blank" rel="noopener" style="color:#9bc2ff">${name}</a>`:name}
async function refresh(){
 const body=document.getElementById('dailyBriefBody');if(!body)return;
 body.innerHTML='<div class="small">글로벌 리포트와 내부 신호를 재계산 중...</div>';
 const [ext,intl]=await Promise.all([loadExternal(),Promise.resolve(localSignals())]);
 const stale=ageHours(ext.generatedAt)>36;
 const extScore=stale?50:clamp(ext.externalScore??50);
 const internalScore=clamp(intl.score);
 const finalScore=clamp(extScore*.45+internalScore*.55);
 const v=verdict(finalScore,ext.riskLevel||'medium');const sc=scenario(finalScore);
 const freshLabel=stale?'외부자료 오래됨':'외부자료 최신';
 const freshClass=stale?'stale':'fresh';
 const lines=(ext.globalConsensus||[]).map(x=>`<div class="db-item">• ${esc(x)}</div>`).join('')||'<div class="db-item">외부 컨센서스 없음</div>';
 const risks=(ext.risks||[]).map(x=>`<div class="db-item condNO">• ${esc(x)}</div>`).join('')||'<div class="db-item">특이 리스크 없음</div>';
 const events=(ext.events||[]).map(x=>`<div class="db-item">${esc(x)}</div>`).join('')||'<div class="db-item">예정 이벤트 없음</div>';
 const learn=intl.learning;const learnTxt=learn?`학습 ${learn.signals??0}건 · 평가 ${learn.evaluated??0}건${learn.winRate==null?'':` · 적중률 ${Number(learn.winRate).toFixed(1)}%`}`:'학습 데이터 대기';
 body.innerHTML=`
 <div class="card nextActionCard db-card"><div class="db-summary"><div><div class="nextTitle">오늘의 한줄 시황</div><div class="nextMain">${esc(v)}</div></div><div class="scoreRing">${Math.round(finalScore)}</div></div><div class="small" style="margin-top:9px;line-height:1.55">${esc(ext.headline||'')}</div><div class="stack" style="margin-top:10px"><span class="badge ${freshClass}">${freshLabel}</span><span class="badge">외부 ${Math.round(extScore)}/100</span><span class="badge">우리 기준 ${Math.round(internalScore)}/100</span><span class="badge">종합 ${Math.round(finalScore)}/100</span></div></div>
 <div class="db-grid"><div class="card db-card"><b>글로벌 리포트 공통분모</b><div class="db-list">${lines}</div></div><div class="card db-card"><b>우리 시스템 판정</b><div class="db-metrics"><div class="db-metric"><div class="small">종합 신뢰도</div><div class="mid">${intl.confidence==null?'--':intl.confidence+'%'}</div></div><div class="db-metric"><div class="small">청산가 안전거리</div><div class="mid">${intl.safety==null?'--':intl.safety+'%'}</div></div><div class="db-metric"><div class="small">추세점수</div><div class="mid">${intl.trend==null?'--':intl.trend}</div></div><div class="db-metric"><div class="small">진입점수</div><div class="mid">${intl.entry==null?'--':intl.entry}</div></div></div><div class="small" style="margin-top:9px">${esc(learnTxt)}</div></div></div>
 <div class="card db-card"><b>오늘의 3개 시나리오</b><div class="db-scenarios"><div class="db-scenario"><div class="small">상승</div><div class="mid good">${sc.up}%</div><div class="small">추세 유지 + 핵심 저항 돌파 확인</div></div><div class="db-scenario"><div class="small">횡보</div><div class="mid warn">${sc.flat}%</div><div class="small">이벤트 전 대기 · 방향성 소진</div></div><div class="db-scenario"><div class="small">하락</div><div class="mid bad">${sc.down}%</div><div class="small">금리 · 유가 · 위험회피 충격 확대</div></div></div></div>
 <div class="db-grid"><div class="card db-card"><b>핵심 리스크</b><div class="db-list">${risks}</div></div><div class="card db-card"><b>주요 일정</b><div class="db-list">${events}</div></div></div>
 <div class="card db-card"><div class="db-head"><b>출처 / 기준</b><span class="small">생성 ${ext.generatedAt?new Date(ext.generatedAt).toLocaleString('ko-KR'):'--'}</span></div><div class="small" style="line-height:1.75;margin-top:8px;word-break:keep-all">${(ext.sources||[]).map(sourceHtml).join(' · ')||'외부 출처 없음'}<br>종합점수 = 외부 컨센서스 45% + 우리 시스템 55%. 외부자료가 36시간 이상 오래되면 외부점수는 중립 50으로 자동 보정합니다. 이 화면은 투자판단 보조이며 주문을 자동 실행하지 않습니다.</div></div>
 <div class="db-footer-nav"><button class="db-btn" id="dbBackTop">맨 위 ↑</button><button class="db-btn" id="dbRefreshBottom">시황 새로고침</button></div>`;
 body.querySelector('#dbBackTop')?.addEventListener('click',()=>window.scrollTo({top:document.getElementById('dailyBriefPane').offsetTop-80,behavior:'smooth'}));
 body.querySelector('#dbRefreshBottom')?.addEventListener('click',refresh);
 saveSnapshot({score:finalScore,externalScore:extScore,internalScore,verdict:v});
}
function init(){ensureUI();setTimeout(()=>{ensureUI();refresh()},1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
setInterval(()=>{if(document.getElementById('dailyBriefPane')?.classList.contains('activePane'))refresh()},10*60*1000);
window.BTCDailyBrief={refresh,localSignals};
})();
