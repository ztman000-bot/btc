/* BTC Hedge Assistant v8.23.1 - observable bounded whole-scan controller */
(()=>{'use strict';
if(window.__BTC_SCANNER_BATCH_8231__)return;window.__BTC_SCANNER_BATCH_8231__=true;
const V='8.23.1',TIMEOUT=55000,CONCURRENCY=3;let running=false,runSeq=0;
const $=id=>document.getElementById(id);const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function getWatch(){try{return Array.isArray(scannerWatch)?scannerWatch:[]}catch(e){return[]}}
function setRank(html){const el=$('scanRanks');if(el)el.innerHTML=html}
function setFinalStatus(html){const rank=$('scanRanks');if(!rank)return;let el=$('scanBatchFinalStatus');if(!el){el=document.createElement('div');el.id='scanBatchFinalStatus';el.className='tiny';el.style.cssText='margin:8px 0 10px;line-height:1.55;color:#9fb0c3';rank.parentNode?.insertBefore(el,rank)}el.innerHTML=html}
function button(){return [...document.querySelectorAll('#scanner button')].find(b=>(b.textContent||'').trim()==='전체 스캔'||b.dataset.scanAll==='1')||null}
function withTimeout(p,ms,label){return Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error(label+' 시간초과')),ms))])}
function renderSafe(){try{renderWatchlist()}catch(e){};try{renderV79Ranking()}catch(e){}}
async function wholeScan(){
 if(running)return;const watch=getWatch();if(!watch.length){setRank('스캔할 관심종목이 없습니다.');return}
 if(typeof analyzeScannerSymbol!=='function'){setRank('스캐너 분석 엔진을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.');return}
 running=true;const seq=++runSeq,b=button(),old=b?.textContent||'전체 스캔';if(b){b.dataset.scanAll='1';b.disabled=true;b.textContent=`스캔 0/${watch.length}`}
 const results=[],failed=[];let next=0,done=0;setRank(`전체 스캔 시작 · 0/${watch.length} · 최대 ${CONCURRENCY}개 병렬 분석`);
 async function worker(){while(next<watch.length&&seq===runSeq){const idx=next++,w=watch[idx];try{const r=await withTimeout(Promise.resolve(analyzeScannerSymbol(w.symbol,w.type)),TIMEOUT,w.symbol);if(r)results.push(r);else failed.push(w.symbol+' 결과없음')}catch(e){failed.push(w.symbol+' '+String(e?.message||e))}finally{done++;if(b)b.textContent=`스캔 ${done}/${watch.length}`;setRank(`전체 스캔 중 · ${done}/${watch.length} 완료 · 성공 ${results.length} · 실패 ${failed.length}${failed.length?`<br><span class="tiny">최근 실패: ${failed.at(-1)}</span>`:''}`);renderSafe()}}}
 await Promise.all(Array.from({length:Math.min(CONCURRENCY,watch.length)},worker));
 try{scannerRankResults=results}catch(e){window.scannerRankResults=results}renderSafe();
 setFinalStatus(results.length?`전체 스캔 완료 · ${results.length}/${watch.length} 성공${failed.length?` · 실패 ${failed.length}`:''}<br>완료 ${new Date().toLocaleTimeString()} · 실패 종목은 데이터 연결 실패로 신호에서 제외`:`전체 스캔 실패 · ${watch.length}개 종목에서 유효 데이터를 받지 못했습니다.<br>${failed.slice(0,3).join(' · ')}`);
 if(b){b.disabled=false;b.textContent=old}running=false;document.dispatchEvent(new CustomEvent('btc-whole-scan-complete',{detail:{version:V,total:watch.length,success:results.length,failed:failed.length}}));
}
function bind(){const b=button();if(!b)return false;b.dataset.scanAll='1';b.onclick=e=>{e.preventDefault();e.stopPropagation();wholeScan()};return true}
async function init(){for(let i=0;i<40&&!bind();i++)await sleep(250);new MutationObserver(bind).observe(document.body,{childList:true,subtree:true})}
window.BTCScannerBatch={version:V,scan:wholeScan,status:()=>({running,runSeq})};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();