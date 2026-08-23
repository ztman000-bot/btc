/* BTC Hedge Assistant v8.6.8 - robust global briefing mount */
(()=>{
'use strict';
const GLOBAL_URL='./data/daily/global.json';
const DAILY_URL='./data/daily/brief.json';
const BOX_ID='globalBriefBoxV868';
const CACHE_KEY='btc_global_brief_v868';
const BAD=/error\s*500|server error|please try again later|that.?s all we know|bad gateway|service unavailable/i;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const safeTitle=x=>{const ko=String(x?.titleKo||'').trim(),orig=String(x?.titleOriginal||'').trim();return ko&&!BAD.test(ko)?ko:orig&&!BAD.test(orig)?orig:''};
function css(){if(document.getElementById('gb868css'))return;const s=document.createElement('style');s.id='gb868css';s.textContent=`
#${BOX_ID}{margin:10px 0 12px;padding:13px;border:1px solid #31506f;border-radius:15px;background:#0d1a27}
#${BOX_ID} .h{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
#${BOX_ID} .sub{font-size:10px;color:#91a4b8;margin-top:3px;line-height:1.4}
#${BOX_ID} .meta{display:flex;gap:5px;flex-wrap:wrap;margin:8px 0;font-size:9px;color:#91a4b8}
#${BOX_ID} .tag{padding:2px 6px;border:1px solid #3a4e63;border-radius:999px}
#${BOX_ID} .items{display:grid;gap:8px}
#${BOX_ID} .item{padding:10px;border:1px solid #2b3e50;border-radius:11px;background:#0a141e;line-height:1.45}
#${BOX_ID} .item a{color:#c0d9ff;text-decoration:none}
#${BOX_ID} .tiny{font-size:9px;color:#8394a7;margin-top:5px}
`;document.head.appendChild(s)}
function host(){const body=document.getElementById('dailyBriefBody');if(!body)return null;let box=document.getElementById(BOX_ID);if(!box){box=document.createElement('section');box.id=BOX_ID;body.parentNode.insertBefore(box,body)}return box}
async function fetchJson(url){const r=await fetch(url+'?v=868',{cache:'no-store'});if(!r.ok)throw new Error(String(r.status));return r.json()}
function fallbackFromDaily(d){const src=d.sources||[];const items=[];(d.globalConsensus||[]).filter(x=>!BAD.test(String(x))).slice(0,5).forEach((x,i)=>items.push({titleKo:x,titleOriginal:x,source:src[i]?.name||'Daily Brief',url:src[i]?.url||'',category:'글로벌 공통분모',impact:'중립'}));(d.risks||[]).filter(x=>!BAD.test(String(x))).slice(0,3).forEach(x=>items.push({titleKo:x,titleOriginal:x,source:'Daily Brief',url:'',category:'핵심 리스크',impact:'부정'}));return {generatedAt:d.generatedAt,marketScore:d.externalScore||50,riskLevel:d.riskLevel||'medium',headline:d.headline||'글로벌 브리핑',expertBriefings:items,coverage:{items:items.length}}}
function valid(d){return d&&Array.isArray(d.expertBriefings)&&d.expertBriefings.some(x=>safeTitle(x))}
function save(d){try{localStorage.setItem(CACHE_KEY,JSON.stringify(d))}catch(e){}}
function loadCache(){try{return JSON.parse(localStorage.getItem(CACHE_KEY)||'null')}catch(e){return null}}
function paint(box,d){const items=(d.expertBriefings||[]).map(x=>({...x,_title:safeTitle(x)})).filter(x=>x._title).slice(0,8);box.innerHTML=`<div class="h"><div><b>글로벌 전문가 브리핑</b><div class="sub">무료 공개소스 자동집계 · 오류문구 자동제거 · 일일 시황과 별도 표시</div></div><span class="tag">v8.6.8</span></div><div class="sub" style="margin-top:7px">${esc(d.headline||'')}</div><div class="meta"><span class="tag">글로벌 ${Math.round(Number(d.marketScore)||50)}/100</span><span class="tag">브리핑 ${items.length}건</span><span class="tag">${esc(d.riskLevel||'medium')} risk</span></div><div class="items">${items.length?items.map(x=>`<div class="item">${x.url?`<a href="${esc(x.url)}" target="_blank" rel="noopener"><b>${esc(x._title)}</b></a>`:`<b>${esc(x._title)}</b>`}<div class="tiny">${esc(x.category||'시장')} · ${esc(x.impact||'중립')} · ${esc(x.source||'source')}</div></div>`).join(''):'<div class="item">현재 표시 가능한 브리핑이 없습니다.</div>'}</div>`}
async function render(){css();const box=host();if(!box)return;const cached=loadCache();if(cached)paint(box,cached);try{let g=await fetchJson(GLOBAL_URL);if(!valid(g)){const d=await fetchJson(DAILY_URL);g=fallbackFromDaily(d)}save(g);paint(box,g)}catch(e){if(!cached){try{const d=await fetchJson(DAILY_URL);const g=fallbackFromDaily(d);save(g);paint(box,g)}catch(_){box.innerHTML='<div class="sub">글로벌 브리핑 데이터를 불러오지 못했습니다. 기존 일일 시황은 계속 사용할 수 있습니다.</div>'}}}}
function boot(){css();let tries=0;const t=setInterval(()=>{tries++;if(host()){clearInterval(t);render()}else if(tries>=40)clearInterval(t)},250);const mo=new MutationObserver(()=>{if(document.getElementById('dailyBriefBody')&&!document.getElementById(BOX_ID))render()});mo.observe(document.documentElement,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.BTCGlobalBriefV868={render};
})();
