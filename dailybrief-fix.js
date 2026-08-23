/* BTC Hedge Assistant v8.4.1 - Daily brief tab activation fix */
(()=>{
'use strict';
function pane(){return document.getElementById('dailyBriefPane')}
function btn(){return document.getElementById('dailyBriefTabBtn')}
function showBrief(){
  const p=pane(), b=btn();
  if(!p||!b)return;
  document.querySelectorAll('.tabPane').forEach(x=>{x.classList.remove('activePane');x.style.display='none'});
  document.querySelectorAll('.tabs button,.topTabsSticky button').forEach(x=>x.classList.remove('active'));
  p.classList.add('activePane');
  p.style.display='block';
  b.classList.add('active');
  try{window.BTCDailyBrief?.refresh?.()}catch(e){console.warn('daily brief refresh failed',e)}
  const top=p.getBoundingClientRect().top+window.scrollY-90;
  window.scrollTo({top:Math.max(0,top),behavior:'smooth'});
}
function hideBrief(){
  const p=pane(), b=btn();
  if(!p)return;
  p.classList.remove('activePane');
  p.style.display='none';
  b?.classList.remove('active');
}
// Capture first so legacy delegated tab handlers cannot consume the dynamic tab.
document.addEventListener('click',e=>{
  const t=e.target?.closest?.('button');
  if(!t)return;
  if(t.id==='dailyBriefTabBtn'){
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    showBrief();
    return;
  }
  const host=t.closest?.('.tabs,.topTabsSticky');
  if(host && pane()?.style.display!=='none') hideBrief();
},true);
// Re-bind after dynamic creation and app rerenders.
const mo=new MutationObserver(()=>{
  const b=btn();
  if(b && !b.dataset.v841){b.dataset.v841='1';b.setAttribute('type','button')}
});
if(document.documentElement)mo.observe(document.documentElement,{subtree:true,childList:true});
window.BTCDailyBriefFix={show:showBrief,hide:hideBrief};
})();
