/* BTC Hedge Assistant v8.6.1 - Global Briefing UI */
(()=>{
'use strict';
const URL='./data/daily/global.json';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const ageH=ts=>ts?(Date.now()-new Date(ts).getTime())/36e5:Infinity;
function style(){if(document.getElementById('gb861style'))return;const s=document.createElement('style');s.id='gb861style';s.textContent=`
#globalBriefBox{margin-top:10px;padding:12px;border:1px solid #30465c;border-radius:15px;background:#0c1722}
#globalBriefBox .gbHead{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
#globalBriefBox .gbGrid{display:grid;grid-template-columns:1fr;gap:8px;margin-top:9px}
#globalBriefBox .gbItem{padding:10px;border:1px solid #293b4d;border-radius:11px;background:#0a141e}
#globalBriefBox .gbMeta{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px;font-size:9px;color:#8ea0b3}
#globalBriefBox .gbTag{padding:2px 6px;border:1px solid #3b4c60;border-radius:999px}
#globalBriefBox .gbPos{color:#20d792}.gbNeg{color:#ff667a}.gbNeu{color:#ffbf47}
#globalBriefBox a{color:#b7d4ff;text-decoration:none}
#globalBriefBox .gbSmall{font-size:10px;color:#8ea0b3;line-height:1.5}
`;document.head.appendChild(s)}
async function load(){const r=await fetch(`${URL}?v=${Date.now()}`,{cache:'no-store'});if(!r.ok)throw new Error(r.status);return r.json()}
function impactClass(x){return x==='긍정'?'gbPos':x==='부정'?'gbNeg':'gbNeu'}
function ensure(){style();const body=document.getElementById('dailyBriefBody');if(!body||document.getElementById('globalBriefBox'))return null;const box=document.createElement('div');box.id='globalBriefBox';box.innerHTML='<div class="gbSmall">글로벌 전문가 브리핑 불러오는 중...</div>';body.appendChild(box);return box}
async function render(){const box=ensure()||document.getElementById('globalBriefBox');if(!box)return;try{const d=await load();const stale=ageH(d.generatedAt)>6;const items=(d.expertBriefings||[]).slice(0,8);box.innerHTML=`<div class="gbHead"><div><b>글로벌 전문가 브리핑</b><div class="gbSmall">무료 공개소스 자동수집 · 한국어 요약/번역 · 2시간 주기</div></div><div class="badge ${stale?'stale':'fresh'}">${stale?'업데이트 지연':'최신'}</div></div><div class="gbSmall" style="margin-top:7px">${esc(d.headline||'')}</div><div class="gbMeta"><span class="gbTag">글로벌 점수 ${Math.round(Number(d.marketScore)||50)}/100</span><span class="gbTag">수집 ${(d.coverage&&d.coverage.items)||0}건</span><span class="gbTag">${esc(d.riskLevel||'medium')} risk</span></div><div class="gbGrid">${items.length?items.map(x=>`<div class="gbItem"><a href="${esc(x.url)}" target="_blank" rel="noopener"><b>${esc(x.titleKo||x.titleOriginal)}</b></a><div class="gbMeta"><span class="gbTag">${esc(x.category||'시장')}</span><span class="gbTag ${impactClass(x.impact)}">${esc(x.impact||'중립')}</span><span>${esc(x.source||'source')}</span></div></div>`).join(''):'<div class="gbItem gbSmall">아직 자동수집 결과가 없습니다. 다음 GitHub Actions 실행 후 채워집니다.</div>'}</div><div class="gbSmall" style="margin-top:8px">${esc(d.note||'')}</div>`}catch(e){box.innerHTML='<div class="gbSmall">글로벌 브리핑 데이터를 불러오지 못했습니다. 다음 자동 업데이트 후 다시 확인하세요.</div>'}}
function hook(){const mo=new MutationObserver(()=>{if(document.getElementById('dailyBriefBody')){ensure();render()}});mo.observe(document.documentElement,{childList:true,subtree:true});setTimeout(()=>{ensure();render()},1800);setInterval(()=>{if(document.getElementById('dailyBriefPane')?.style.display!=='none')render()},10*60*1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook);else hook();
window.BTCGlobalBrief={refresh:render};
})();
