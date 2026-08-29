/* BTC Hedge Assistant v8.23.6 - Trade Ladder UI Clarity */
(()=>{'use strict';
if(window.__BTC_TRADE_LADDER_UI_8236__)return;window.__BTC_TRADE_LADDER_UI_8236__=true;
const V='8.23.6',$=id=>document.getElementById(id);
function priceOf(card){const b=card?.querySelector('b')?.textContent||'';const n=Number(b.replace(/[^0-9.-]/g,''));return Number.isFinite(n)?n:Infinity}
function injectStyle(){if($('tradeLadder8236Style'))return;const s=document.createElement('style');s.id='tradeLadder8236Style';s.textContent=`
#trade .tl8236Head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:11px 1px 7px;padding:9px 10px;border:1px solid #30445a;border-radius:12px;background:#0c1723}
#trade .tl8236Head b{font-size:14px}#trade .tl8236Head span{font-size:9px;color:#9fb0c3;border:1px solid #34495e;border-radius:999px;padding:3px 6px;white-space:nowrap}
#trade .tl8236Note{font-size:10px;line-height:1.5;color:#98a7b8;margin:-1px 2px 8px;padding:0 7px}
#trade #actionMap{padding:8px;border:1px solid #26384b;border-radius:14px;background:#0a131d;margin-bottom:10px!important}
#trade #ladderMobile{padding:8px;border:1px solid #36557b;border-radius:14px;background:#0b1622}
#trade #ladderMobile .roadCard{margin-bottom:7px}#trade #ladderMobile .roadCard.current{border-color:#3b82f6!important;box-shadow:0 0 0 1px #3b82f655 inset}
#trade .tl8236Current{font-size:10px;color:#9fc4ff;margin:0 2px 8px;padding:7px 9px;border-left:3px solid #3b82f6;background:#0e1c2d;border-radius:6px}
@media(min-width:761px){#trade .tl8236MobileOnly{display:none!important}}
`;document.head.appendChild(s)}
function ensureHeads(){const trade=$('trade'),map=$('actionMap'),mobile=$('ladderMobile');if(!trade||!map||!mobile)return false;
 let h1=$('tl8236CoreHead');if(!h1){h1=document.createElement('div');h1.id='tl8236CoreHead';h1.className='tl8236Head';h1.innerHTML='<b>① 핵심 가격대 전략</b><span>장기 기준 레벨</span>';map.parentNode.insertBefore(h1,map)}
 let n1=$('tl8236CoreNote');if(!n1){n1=document.createElement('div');n1.id='tl8236CoreNote';n1.className='tl8236Note';n1.textContent='숏 평단·롱 평단·주요 라운드 가격을 보는 큰 구간표입니다. 아래 현재가 주변표와 연속된 가격순 표가 아닙니다.';map.insertAdjacentElement('afterend',n1)}
 let h2=$('tl8236NearHead');if(!h2){h2=document.createElement('div');h2.id='tl8236NearHead';h2.className='tl8236Head tl8236MobileOnly';h2.innerHTML='<b>② 현재가 주변 실전 대응</b><span>현재가 ±$3K · $1K 간격</span>';mobile.parentNode.insertBefore(h2,mobile)}
 let cur=$('tl8236Current');if(!cur){cur=document.createElement('div');cur.id='tl8236Current';cur.className='tl8236Current tl8236MobileOnly';h2.insertAdjacentElement('afterend',cur)}
 return true}
function sortMobile(){const box=$('ladderMobile');if(!box)return;const cards=[...box.querySelectorAll(':scope > .roadCard')].sort((a,b)=>priceOf(a)-priceOf(b));cards.forEach(c=>box.appendChild(c));const note=[...box.children].find(x=>x.classList?.contains('small')&&!x.classList.contains('roadCard'));if(note){note.textContent='현재가 주변 실전표는 낮은 가격 → 높은 가격 순으로 표시합니다.';box.appendChild(note)}}
function renderCurrent(){const cur=$('tl8236Current');if(!cur)return;const card=$('ladderMobile')?.querySelector('.roadCard.current');const p=card?priceOf(card):null;cur.textContent=Number.isFinite(p)?`현재 기준 구간: $${p.toLocaleString()} · 파란 테두리 카드가 현재가에 가장 가까운 단계입니다.`:'현재가와 가장 가까운 단계는 파란 테두리로 표시됩니다.'}
function patchTitle(){const trade=$('trade');if(!trade)return;const top=trade.querySelector(':scope > .row b');if(top&&/실전 매매표/.test(top.textContent||''))top.textContent='실전 매매표';const sub=trade.querySelector(':scope > .row + .small');if(sub)sub.textContent='핵심 가격대 전략과 현재가 주변 정밀 대응표를 분리해 표시합니다.'}
function refresh(){injectStyle();if(!ensureHeads())return;patchTitle();sortMobile();renderCurrent()}
let busy=false;function schedule(){if(busy)return;busy=true;requestAnimationFrame(()=>{busy=false;refresh()})}
function init(){refresh();const trade=$('trade');if(trade)new MutationObserver(schedule).observe(trade,{childList:true,subtree:true,characterData:true});document.addEventListener('btc-bootstrap-ready',schedule);window.addEventListener('resize',schedule)}
window.BTCTradeLadderUI={version:V,refresh};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,800),{once:true});else setTimeout(init,800);
})();