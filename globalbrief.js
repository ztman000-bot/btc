/* BTC Hedge Assistant v8.6.2 - Global Briefing UI / low-request mode */
(()=>{
'use strict';
const URL='./data/daily/global.json';
const DATA_KEY='btc_global_brief_cache_v862';
const FETCH_KEY='btc_global_brief_fetch_v862';
const TTL=30*60*1000;
let inflight=null,lastRenderedAt=0;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const ageH=ts=>ts?(Date.now()-new Date(ts).getTime())/36e5:Infinity;
const readCache=()=>{try{return JSON.parse(localStorage.getItem(DATA_KEY)||'null')}catch(e){return null}};
const lastFetch=()=>Number(localStorage.getItem(FETCH_KEY)||0);
function writeCache(d){try{localStorage.setItem(DATA_KEY,JSON.stringify(d));localStorage.setItem(FETCH_KEY,String(Date.now()))}catch(e){}}
function style(){if(document.getElementById('gb862style'))return;const s=document.createElement('style');s.id='gb862style';s.textContent=`
#globalBriefBox{margin-top:10px;padding:12px;border:1px solid #30465c;border-radius:15px;background:#0c1722}
#globalBriefBox .gbHead{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}#globalBriefBox .gbGrid{display:grid;grid-template-columns:1fr;gap:8px;margin-top:9px}
#globalBriefBox .gbItem{padding:10px;border:1px solid #293b4d;border-radius:11px;background:#0a141e}#globalBriefBox .gbMeta{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px;font-size:9px;color:#8ea0b3}
#globalBriefBox .gbTag{padding:2px 6px;border:1px solid #3b4c60;border-radius:999px}#globalBriefBox .gbPos{color:#20d792}.gbNeg{color:#ff667a}.gbNeu{color:#ffbf47}
#globalBriefBox a{color:#b7d4ff;text-decoration:none}#globalBriefBox .gbSmall{font-size:10px;color:#8ea0b3;line-height:1.5}
`;document.head.appendChild(s)}
async function load(force=false){
 const cached=readCache();
 if(!force&&cached&&Date.now()-lastFetch()<TTL)return cached;
 if(inflight)return inflight;
 inflight=(async()=>{try{const r=await fetch(URL,{cache:'default'});if(!r.ok)throw new Error(r.status);const d=await r.json();writeCache(d);return d}catch(e){if(cached)return cached;throw e}finally{inflight=null}})();
 return inflight;
}
function impactClass(x){return x==='긍정'?'gbPos':x==='부정'?'gbNeg':'gbNeu'}
function ensure(){style();const body=document.getElementById('dailyBriefBody');if(!body||document.getElementById('globalBriefBox'))return document.getElementById('globalBriefBox');const box=document.createElement('div');box.id='globalBriefBox';box.innerHTML='<div class="gbSmall">글로벌 전문가 브리핑 준비 중...</div>';body.appendChild(box);return box}
function paint(box,d){const stale=ageH(d.generatedAt)>8;const items=(d.expertBriefings||[]).slice(0,8);box.innerHTML=`<div class="gbHead"><div><b>글로벌 전문가 브리핑</b><div class="gbSmall">저요청 모드 · 최근 자료 우선 · 최대 30분 로컬 캐시</div></div><div class="badge ${stale?'stale':'fresh'}">${stale?'업데이트 지연':'최신'}</div></div><div class="gbSmall" style="margin-top:7px">${esc(d.headline||'')}</div><div class="gbMeta"><span class="gbTag">글로벌 점수 ${Math.round(Number(d.marketScore)||50)}/100</span><span class="gbTag">수집 ${(d.coverage&&d.coverage.items)||0}건</span><span class="gbTag">${esc(d.riskLevel||'medium')} risk</span></div><div class="gbGrid">${items.length?items.map(x=>`<div class="gbItem"><a href="${esc(x.url)}" target="_blank" rel="noopener"><b>${esc(x.titleKo||x.titleOriginal)}</b></a><div class="gbMeta"><span class="gbTag">${esc(x.category||'시장')}</span><span class="gbTag ${impactClass(x.impact)}">${esc(x.impact||'중립')}</span><span>${esc(x.source||'source')}</span></div></div>`).join(''):'<div class="gbItem gbSmall">자동수집 결과를 기다리는 중입니다.</div>'}</div><div class="gbSmall" style="margin-top:8px">${esc(d.note||'')}</div>`}
async function render(force=false){const box=ensure();if(!box)return;if(!force&&Date.now()-lastRenderedAt<15000)return;lastRenderedAt=Date.now();const cached=readCache();if(cached)paint(box,cached);try{const d=await load(force);paint(box,d)}catch(e){if(!cached)box.innerHTML='<div class="gbSmall">현재 네트워크 요청을 줄이는 보호 모드입니다. 저장된 브리핑이 생기면 마지막 정상 자료를 표시합니다.</div>'}}
function visible(){const p=document.getElementById('dailyBriefPane');return !!p&&p.style.display!=='none'}
function hook(){ensure();setTimeout(()=>{if(visible())render(false)},1800);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&visible()&&Date.now()-lastFetch()>=TTL)render(false)});setInterval(()=>{if(visible()&&Date.now()-lastFetch()>=TTL)render(false)},30*60*1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook);else hook();
window.BTCGlobalBrief={refresh:()=>render(true),render};
})();
