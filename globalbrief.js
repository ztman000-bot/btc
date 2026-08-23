/* BTC Hedge Assistant v8.6.7 - Global Briefing UI / reliable mount + fallback */
(()=>{
'use strict';
const GLOBAL_URL='./data/daily/global.json';
const DAILY_URL='./data/daily/brief.json';
const DATA_KEY='btc_global_brief_cache_v867';
const TTL=60*60*1000;
let inflight=null,lastPaint=0;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const ageH=ts=>ts?(Date.now()-new Date(ts).getTime())/36e5:Infinity;
const readCache=()=>{try{return JSON.parse(localStorage.getItem(DATA_KEY)||'null')}catch(e){return null}};
function writeCache(d){try{localStorage.setItem(DATA_KEY,JSON.stringify({savedAt:Date.now(),data:d}))}catch(e){}}
function cachedFresh(){const x=readCache();return x&&Date.now()-Number(x.savedAt||0)<TTL?x.data:null}
function style(){if(document.getElementById('gb867style'))return;const s=document.createElement('style');s.id='gb867style';s.textContent=`
#globalBriefBox{margin:0 0 10px;padding:12px;border:1px solid #35517a;border-radius:15px;background:linear-gradient(180deg,#122238,#0c1722)}
#globalBriefBox .gbHead{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}#globalBriefBox .gbGrid{display:grid;grid-template-columns:1fr;gap:8px;margin-top:9px}
#globalBriefBox .gbItem{padding:10px;border:1px solid #293b4d;border-radius:11px;background:#0a141e}#globalBriefBox .gbMeta{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px;font-size:9px;color:#8ea0b3}
#globalBriefBox .gbTag{padding:2px 6px;border:1px solid #3b4c60;border-radius:999px}#globalBriefBox a{color:#b7d4ff;text-decoration:none}#globalBriefBox .gbSmall{font-size:10px;color:#9aaabd;line-height:1.5}
`;document.head.appendChild(s)}
async function getJson(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(r.status);return r.json()}
function fromDaily(d){
 const items=[];
 (d.globalConsensus||[]).slice(0,5).forEach((x,i)=>items.push({titleKo:x,titleOriginal:x,url:d.sources?.[i]?.url||'',category:'글로벌 공통분모',impact:'중립',source:d.sources?.[i]?.name||'Daily Brief'}));
 (d.risks||[]).slice(0,3).forEach(x=>items.push({titleKo:x,titleOriginal:x,url:'',category:'핵심 리스크',impact:'부정',source:'Daily Brief'}));
 return {generatedAt:d.generatedAt,marketScore:d.externalScore??50,riskLevel:d.riskLevel||'medium',headline:d.headline||'글로벌 브리핑',coverage:{items:items.length},expertBriefings:items,note:'자동수집 자료가 비어 있어 기존 일일 글로벌 리포트를 보완 표시합니다.'};
}
async function load(){
 const c=cachedFresh();if(c)return c;if(inflight)return inflight;
 inflight=(async()=>{try{
   let g=null;try{g=await getJson(GLOBAL_URL)}catch(e){}
   if(!g||!(g.expertBriefings||[]).length){const d=await getJson(DAILY_URL);g=fromDaily(d)}
   writeCache(g);return g;
 }finally{inflight=null}})();return inflight;
}
function ensure(){
 style();const body=document.getElementById('dailyBriefBody');if(!body)return null;
 let box=document.getElementById('globalBriefBox');
 if(!box){box=document.createElement('div');box.id='globalBriefBox';box.innerHTML='<div class="gbSmall">글로벌 브리핑 준비 중...</div>';body.insertBefore(box,body.firstChild)}
 return box;
}
function paint(box,d){
 const stale=ageH(d.generatedAt)>12,items=(d.expertBriefings||[]).slice(0,8);
 box.innerHTML=`<div class="gbHead"><div><b>글로벌 전문가 브리핑</b><div class="gbSmall">자동수집 + 기존 일일 시황 보완</div></div><div class="badge ${stale?'stale':'fresh'}">${stale?'업데이트 지연':'최신'}</div></div><div class="gbSmall" style="margin-top:7px">${esc(d.headline||'')}</div><div class="gbMeta"><span class="gbTag">글로벌 점수 ${Math.round(Number(d.marketScore)||50)}/100</span><span class="gbTag">브리핑 ${items.length}건</span><span class="gbTag">${esc(d.riskLevel||'medium')} risk</span></div><div class="gbGrid">${items.map(x=>`<div class="gbItem">${x.url?`<a href="${esc(x.url)}" target="_blank" rel="noopener"><b>${esc(x.titleKo||x.titleOriginal)}</b></a>`:`<b>${esc(x.titleKo||x.titleOriginal)}</b>`}<div class="gbMeta"><span class="gbTag">${esc(x.category||'시장')}</span><span class="gbTag">${esc(x.impact||'중립')}</span><span>${esc(x.source||'source')}</span></div></div>`).join('')||'<div class="gbItem gbSmall">표시할 브리핑이 없습니다.</div>'}</div><div class="gbSmall" style="margin-top:8px">${esc(d.note||'')}</div>`;
}
async function render(force=false){
 const box=ensure();if(!box)return false;
 if(!force&&Date.now()-lastPaint<5000)return true;lastPaint=Date.now();
 const raw=readCache();if(raw?.data)paint(box,raw.data);
 try{paint(box,await load());return true}catch(e){if(!raw?.data)box.innerHTML='<div class="gbSmall">브리핑 데이터를 불러오지 못했습니다. 기존 일일 시황은 계속 사용할 수 있습니다.</div>';return false}
}
function hook(){
 let tries=0;
 const tryMount=()=>{tries++;render(false);if(!document.getElementById('globalBriefBox')&&tries<20)setTimeout(tryMount,500)};
 tryMount();
 const mo=new MutationObserver(()=>{if(document.getElementById('dailyBriefBody')&&!document.getElementById('globalBriefBox'))render(false)});
 mo.observe(document.documentElement,{childList:true,subtree:true});
 document.addEventListener('click',e=>{const t=e.target;if(t&&((t.id==='dailyBriefTabBtn')||/일일\s*시황/.test(t.textContent||'')))setTimeout(()=>render(false),150)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook,{once:true});else hook();
window.BTCGlobalBrief={refresh:()=>render(true),render,version:'8.6.7'};
})();
