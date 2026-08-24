/* BTC Hedge Assistant v8.7.3 - TOP10 Rank Change Radar */
(()=>{
'use strict';
const VERSION='8.7.3';
const SOURCE_CACHE='btc_auto_top10_v872';
const HISTORY_KEY='btc_top10_history_v873';
const MAX_SNAPSHOTS=48;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const num=v=>Number.isFinite(Number(v))?Number(v):null;
let lastSourceTs=0,lastSignature='',painting=false;
function loadSource(){try{return JSON.parse(localStorage.getItem(SOURCE_CACHE)||'null')}catch(e){return null}}
function loadHistory(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]')}catch(e){return []}}
function saveHistory(a){try{localStorage.setItem(HISTORY_KEY,JSON.stringify(a.slice(-MAX_SNAPSHOTS)))}catch(e){}}
function minimal(r){return {symbol:r.symbol,type:r.type,name:r.name||r.symbol,score:num(r.score),long:num(r.long),short:num(r.short),wait:num(r.wait),confidence:num(r.confidence),consensus:num(r.consensus),location:r.location||'',direction:r.direction||'WAIT'}}
function ranked(rows,market='all'){return [...rows].filter(r=>market==='all'||r.type===market).sort((a,b)=>(num(b.score)||0)-(num(a.score)||0))}
function signature(rows){return rows.slice().sort((a,b)=>String(a.symbol).localeCompare(String(b.symbol))).map(r=>`${r.type}:${r.symbol}:${Math.round(num(r.score)||0)}`).join('|')}
function capture(){
 const src=loadSource();if(!src||!Array.isArray(src.rows)||src.rows.length<8)return false;
 const ts=Number(src.ts||0),rows=src.rows.map(minimal).filter(r=>r.symbol),sig=signature(rows);
 if((ts&&ts===lastSourceTs)||(!ts&&sig===lastSignature))return false;
 let h=loadHistory();const last=h[h.length-1];
 if(last&&((ts&&last.sourceTs===ts)||last.signature===sig)){lastSourceTs=ts;lastSignature=sig;return false}
 h.push({capturedAt:Date.now(),sourceTs:ts,version:VERSION,signature:sig,rows});saveHistory(h);lastSourceTs=ts;lastSignature=sig;render();return true
}
function currentMarket(){return document.querySelector('.t10Tab.active')?.dataset?.market||'all'}
function rankOf(rows,symbol,market){const a=ranked(rows,market);const i=a.findIndex(r=>r.symbol===symbol);return i<0?null:i+1}
function rowOf(rows,symbol){return rows.find(r=>r.symbol===symbol)||null}
function top10(rows,market){return ranked(rows,market).slice(0,10)}
function streak(history,symbol,market){let n=0;for(let i=history.length-1;i>=0;i--){if(top10(history[i].rows||[],market).some(r=>r.symbol===symbol))n++;else break}return n}
function changeFor(cur,prev,history,r,market){const nowRank=rankOf(cur.rows,r.symbol,market),prevRank=prev?rankOf(prev.rows,r.symbol,market):null,old=prev?rowOf(prev.rows,r.symbol):null,scoreDelta=old&&num(old.score)!=null&&num(r.score)!=null?Math.round((r.score-old.score)*10)/10:null;let kind='same',label='—';if(!prev){kind='base';label='기준'}else if(prevRank==null||prevRank>10){kind='new';label='NEW'}else if(nowRank<prevRank){kind='up';label=`▲${prevRank-nowRank}`}else if(nowRank>prevRank){kind='down';label=`▼${nowRank-prevRank}`}
 return {nowRank,prevRank,scoreDelta,kind,label,streak:streak(history,r.symbol,market)}
}
function css(){if($('t10hStyle'))return;const s=document.createElement('style');s.id='t10hStyle';s.textContent=`
.t10hCard{margin:0 0 10px;padding:12px;border:1px solid #31506f;border-radius:15px;background:linear-gradient(180deg,#102033,#0c1722)}.t10hHead{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.t10hTitle{font-size:15px;font-weight:900}.t10hSmall{font-size:10px;color:#91a0b0;line-height:1.5}.t10hGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:9px}.t10hItem{padding:9px;border:1px solid #293a4b;border-radius:11px;background:#0a141e}.t10hItem b{display:block;font-size:12px}.t10hItem span{font-size:10px}.t10hUp{color:#20d792}.t10hDown{color:#ff667a}.t10hNew{color:#58a6ff}.t10hFlat{color:#a9b8c8}.t10hBadge{display:inline-block;margin-left:5px;padding:2px 5px;border-radius:999px;border:1px solid #3b4e63;font-size:9px;vertical-align:1px}.t10hRowBadge{display:inline-block;margin-left:5px;padding:1px 5px;border-radius:999px;border:1px solid #3b4e63;font-size:8px;vertical-align:1px}.t10hFoot{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.t10hChip{font-size:9px;border:1px solid #33485d;border-radius:999px;padding:3px 6px;color:#a9b8c8}@media(max-width:700px){.t10hGrid{grid-template-columns:1fr}.t10hItem{padding:8px}}
`;document.head.appendChild(s)}
function ensureCard(){const page=$('top10Radar');if(!page)return null;css();let card=$('t10HistoryCard');if(card)return card;card=document.createElement('section');card.id='t10HistoryCard';card.className='t10hCard';const grid=page.querySelector('.t10Grid');if(grid)grid.parentNode.insertBefore(card,grid);else page.appendChild(card);return card}
function fmtDelta(v){if(v==null)return '';return `${v>0?'+':''}${v.toFixed(1)}점`}
function render(){if(painting)return;painting=true;try{
 const card=ensureCard();if(!card)return;const h=loadHistory();if(!h.length){card.innerHTML='<div class="t10hTitle">📈 TOP10 순위 변화 레이더</div><div class="t10hSmall" style="margin-top:5px">첫 자동분석 결과가 저장되면 순위 변화를 추적합니다.</div>';return}
 const cur=h[h.length-1],prev=h.length>1?h[h.length-2]:null,m=currentMarket(),rows=top10(cur.rows,m),changes=rows.map(r=>({r,c:changeFor(cur,prev,h,r,m)}));
 const movers=[...changes].filter(x=>x.c.kind==='new'||x.c.kind==='up'||(x.c.scoreDelta||0)>=2).sort((a,b)=>{const ga=(a.c.kind==='new'?50:(a.c.prevRank||a.c.nowRank)-a.c.nowRank)+(a.c.scoreDelta||0)/10;const gb=(b.c.kind==='new'?50:(b.c.prevRank||b.c.nowRank)-b.c.nowRank)+(b.c.scoreDelta||0)/10;return gb-ga}).slice(0,3);
 const newCount=changes.filter(x=>x.c.kind==='new').length,upCount=changes.filter(x=>x.c.kind==='up').length,downCount=changes.filter(x=>x.c.kind==='down').length;
 card.innerHTML=`<div class="t10hHead"><div><div class="t10hTitle">📈 TOP10 순위 변화 레이더 <span class="t10hBadge">${m==='all'?'전체':m==='crypto'?'코인':m==='us'?'미국':'한국'}</span></div><div class="t10hSmall">직전 자동분석과 비교 · 순위 상승과 적합도 개선을 우선 표시합니다.</div></div><span class="t10hSmall">스냅샷 ${h.length}회</span></div><div class="t10hGrid">${movers.length?movers.map(({r,c})=>`<div class="t10hItem"><b>${esc(r.name||r.symbol)} <span class="${c.kind==='new'?'t10hNew':'t10hUp'}">${esc(c.label)}</span></b><span>${esc(r.symbol)} · 현재 #${c.nowRank}${c.prevRank?` · 이전 #${c.prevRank}`:''}${c.scoreDelta!=null?` · ${fmtDelta(c.scoreDelta)}`:''}<br>TOP10 ${c.streak}회 연속 · 적합도 ${r.score}</span></div>`).join(''):'<div class="t10hItem"><b class="t10hFlat">큰 순위 변화 없음</b><span>직전 분석과 TOP10 구성이 유사합니다.</span></div>'}</div><div class="t10hFoot"><span class="t10hChip">신규 ${newCount}</span><span class="t10hChip">상승 ${upCount}</span><span class="t10hChip">하락 ${downCount}</span><span class="t10hChip">${prev?'직전 대비':'첫 기준 스냅샷'}</span></div>`;
 decorate(cur,prev,h,m)
 }finally{painting=false}}
function decorate(cur,prev,h,m){const box=$('t10Auto');if(!box)return;box.querySelectorAll('.t10Row').forEach(b=>{const sym=b.dataset.sym,r=rowOf(cur.rows,sym);if(!r)return;const c=changeFor(cur,prev,h,r,m),name=b.querySelector('.t10Main b');if(!name)return;name.querySelectorAll('.t10hRowBadge').forEach(x=>x.remove());const sp=document.createElement('span');sp.className='t10hRowBadge '+(c.kind==='new'?'t10hNew':c.kind==='up'?'t10hUp':c.kind==='down'?'t10hDown':'t10hFlat');sp.textContent=c.label+(c.scoreDelta!=null&&Math.abs(c.scoreDelta)>=1?` ${fmtDelta(c.scoreDelta)}`:'');name.appendChild(sp)})}
function hookTabs(){document.addEventListener('click',e=>{const b=e.target?.closest?.('.t10Tab');if(b)setTimeout(render,60)},true)}
function boot(){css();capture();hookTabs();setInterval(()=>{capture();if($('top10Radar'))render()},2000);new MutationObserver(()=>{if($('top10Radar'))setTimeout(render,30)}).observe(document.body,{childList:true,subtree:true});window.BTCTop10History={render,capture,history:loadHistory,clear:()=>{localStorage.removeItem(HISTORY_KEY);render()},version:VERSION}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1600),{once:true});else setTimeout(boot,1600);
})();