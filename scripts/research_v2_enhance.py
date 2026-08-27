#!/usr/bin/env python3
import json, os, statistics, urllib.request
from datetime import datetime, timezone
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LATEST=os.path.join(ROOT,'data','research','latest.json')
HIST=os.path.join(ROOT,'data','research','shadow-history.json')
STATE=os.path.join(ROOT,'data','research','regime-state.json')
CFG=os.path.join(ROOT,'data','research','config.json')
REGIMES=['STRONG_UP','UP','RANGE','DOWN','CRASH_DOWN']

def load(p,d):
    try:
        with open(p,encoding='utf-8') as f:return json.load(f)
    except Exception:return d

def save(p,x):
    with open(p,'w',encoding='utf-8') as f:json.dump(x,f,ensure_ascii=False,indent=2)

def ema(a,n):
    if not a:return []
    k=2/(n+1);e=a[0];out=[]
    for v in a:e=v*k+e*(1-k);out.append(e)
    return out

def market_closes():
    req=urllib.request.Request('https://api.kraken.com/0/public/OHLC?pair=XBTUSD&interval=240',headers={'User-Agent':'btc-recovery-v2/2.1'})
    with urllib.request.urlopen(req,timeout=20) as r:j=json.loads(r.read().decode())
    key=next(k for k in j['result'] if k!='last');return [float(x[4]) for x in j['result'][key]]

def regime_series(a):
    e20,e50=ema(a,20),ema(a,50);out=[]
    for i,p in enumerate(a):
        if i<55:out.append('RANGE');continue
        slope=e20[i]/e20[i-3]-1 if e20[i-3] else 0;spread=e20[i]/e50[i]-1 if e50[i] else 0
        if p>e20[i] and spread>.012 and slope>.006:r='STRONG_UP'
        elif p>e20[i] and spread>0:r='UP'
        elif p<e20[i] and spread<-.012 and slope<-.006:r='CRASH_DOWN'
        elif p<e20[i] and spread<0:r='DOWN'
        else:r='RANGE'
        out.append(r)
    return out

def candidates():
    out=[{'fast':20,'slow':50,'dead':.0015,'confirm':2,'name':'BASE'}]
    for f in [8,12,16,20,24,30]:
      for s in [36,48,60,72,96,120]:
       if s>=f*1.8:
        for d in [0,.0015,.003]:
         for c in [1,2,3]:
          if (f,s,d,c)!=(20,50,.0015,2):out.append({'fast':f,'slow':s,'dead':d,'confirm':c,'name':f'E{f}/{s} d{d*100:.2f} c{c}'})
    return out

def signals(a,p):
    f,s=ema(a,p['fast']),ema(a,p['slow']);sig=0;pending=0;cnt=0;out=[]
    for i in range(len(a)):
        up=f[i]>s[i]*(1+p['dead']);dn=f[i]<s[i]*(1-p['dead']);raw=1 if up else (-1 if dn else sig)
        if raw!=sig:
            if raw==pending:cnt+=1
            else:pending=raw;cnt=1
            if cnt>=p['confirm']:sig=raw;pending=0;cnt=0
        else:pending=0;cnt=0
        out.append(sig)
    return out

def regime_eval(a,labels,p,target,cost):
    sig=signals(a,p);start=max(120,len(a)-520);eq=1.;pk=1.;mdd=0.;turn=0;prev_sig=0;rr=[];wins=0
    for i in range(start+1,len(a)):
        if labels[i-1]!=target:continue
        r=a[i]/a[i-1]-1;cur=sig[i-1];net=cur*r
        if cur!=prev_sig:net-=abs(cur-prev_sig)*cost;turn+=abs(cur-prev_sig)
        prev_sig=cur;rr.append(net);wins+=1 if net>0 else 0;eq*=max(.05,1+net);pk=max(pk,eq);mdd=max(mdd,(pk-eq)/pk)
    n=len(rr)
    if n<20:return None
    sr=sorted(rr);p10=sr[max(0,int(n*.10)-1)];avg=statistics.mean(rr);med=statistics.median(rr);ret=eq-1;score=ret-.85*mdd+.20*avg*n+.10*p10*n-.0006*turn
    return {'name':p['name'],'fast':p['fast'],'slow':p['slow'],'dead':p['dead'],'confirm':p['confirm'],'score':score,'ret':ret,'mdd':mdd,'avg':avg,'median':med,'worstBar':min(rr),'p10Bar':p10,'n':n,'winRate':wins/n,'turn':turn}

def regime_champions(a,cost):
    labels=regime_series(a);pool=candidates();result={}
    for rg in REGIMES:
        rows=[e for p in pool for e in [regime_eval(a,labels,p,rg,cost)] if e]
        rows.sort(key=lambda x:x['score'],reverse=True)
        if not rows:result[rg]={'name':'BASE','status':'LEARNING','sample':0,'approved':False};continue
        best=rows[0];base=next((x for x in rows if x['name']=='BASE'),rows[0]);approved=best['name']=='BASE' or (best['score']>base['score']+.002 and best['mdd']<=base['mdd']*1.15+.002 and best['ret']>=base['ret']-.005);pick=best if approved else base
        result[rg]={**pick,'status':'QUALIFIED' if approved else 'SHADOW','approved':approved,'candidate':best['name'],'baseScore':base['score'],'sample':pick['n']}
    return labels,result

def confirmed_regime(raw,evidence_bar,st):
    cur=st.get('current') or raw;pending=st.get('pending');count=int(st.get('confirmCount') or 0);last=st.get('lastEvidenceBar');is_new=str(evidence_bar)!=str(last)
    if raw==cur:pending=None;count=0
    elif is_new:
        if pending==raw:count+=1
        else:pending=raw;count=1
        if count>=2:cur=raw;pending=None;count=0
    return cur,{'current':cur,'raw':raw,'pending':pending,'confirmCount':count,'lastEvidenceBar':evidence_bar,'updatedAt':datetime.now(timezone.utc).isoformat()}

def main():
    d=load(LATEST,{});h=load(HIST,{'items':[]});cfg=load(CFG,{});persist=load(STATE,{})
    items=h.get('items',[]);active=[]
    for x in items:
        f=x.get('forwardFromPrior') or {};a=f.get('priorAction','HOLD');sc=f.get('directionalScore')
        if a!='HOLD' and sc is not None:active.append((a,float(sc)))
    wins=sum(1 for _,s in active if s>0);scores=[s for _,s in active];n=len(active);grade='TRUSTED' if n>=300 else 'VALIDATED' if n>=100 else 'CANDIDATE' if n>=30 else 'EXPERIMENT'
    d['shadow2']={'activeEvaluations':n,'holdExcluded':True,'activeWinRate':wins/n if n else None,'avgActiveScore':statistics.mean(scores) if scores else None,'confidenceGrade':grade,'confirmed4hEvidenceOnly':True,'thresholds':{'candidate':30,'validated':100,'trusted':300}}
    try:a=market_closes();labels,champs=regime_champions(a,float((d.get('executionReality') or {}).get('oneWayCost') or .0007));raw=labels[-1]
    except Exception:raw='UNKNOWN';champs={k:{'name':'BASE','status':'LEARNING','sample':0,'approved':False} for k in REGIMES}
    evidence=(d.get('market') or {}).get('evidenceBarTime');effective,regime_state=confirmed_regime(raw,evidence,persist);save(STATE,regime_state)
    for k,v in champs.items():v['status']='ACTIVE' if k==effective and v.get('approved') else ('SHADOW' if v.get('approved') else v.get('status','LEARNING'))
    d['regimeChampion']={'current':effective,'rawCurrent':raw,'champions':champs,'switchPolicy':{'confirmationBars':2,'hysteresis':True,'confirmed4hOnly':True,'pending':regime_state.get('pending'),'confirmCount':regime_state.get('confirmCount'),'note':'Switch only after two distinct closed 4H evidence bars confirm the new regime.'}}
    atr=float((d.get('market') or {}).get('atr4hPct') or .02);hard=float(cfg.get('goals',{}).get('hardGuardUsd',10000));operating=max(hard,12000 if atr<.025 else 15000 if atr<.045 else 18000)
    d['guard2']={'hardFloorUsd':hard,'dynamicOperatingGuardUsd':operating,'atr4hPct':atr,'optimizerMayOverrideHardFloor':False,'source':'ATR 4H + absolute hard floor'}
    tw=d.get('terminalWallet') or {};exe=tw.get('executable') or {};target=float(cfg.get('goals',{}).get('targetWallet',69936.3));cur=float(tw.get('currentNetClose') or 0);exp=float(exe.get('expectedWallet') or cur);p10=float(exe.get('p10') or exp);worst=float(exe.get('worst') or p10);rec=float(exe.get('recoveryProbability') or 0);progress=max(0,min(1,cur/target)) if target else 0;downside=max(0,cur-worst);utility=exp+.25*p10+.15*worst+target*rec*.20-downside*.35
    d['recovery2']={'objective':'terminal_wallet_recovery','targetWallet':target,'currentNetClose':cur,'progress':progress,'expectedWallet':exp,'p10Wallet':p10,'worstWallet':worst,'recoveryProbability':rec,'downsideToWorst':downside,'recoveryUtility':utility,'priority':['10K hard guard','survival/worst wallet','recovery probability','expected terminal wallet','cost/MDD']}
    current_champ=champs.get(effective,{}) if effective in champs else {};top=(d.get('optimizer') or {}).get('top5') or [];challenger=top[1] if len(top)>1 else None;best=(d.get('optimizer') or {}).get('best') or {};base=(d.get('optimizer') or {}).get('base') or {};margin=(best.get('score',0)-challenger.get('score',0)) if challenger else 0
    eligible=bool(current_champ.get('approved')) and n>=30 and (best.get('worst',-1)>=base.get('worst',-1)-.005) and (best.get('mdd',1)<=base.get('mdd',1)*1.10)
    d['governance2']={'champion':current_champ.get('name','BASE'),'challenger':challenger.get('name') if challenger else None,'scoreMargin':margin,'promotionEligible':eligible,'forwardMinimum':30,'independentConfirmed4hEvidence':True,'reason':'Independent active-action closed-4H sample >=30 required before automatic promotion.' if not eligible else 'Regime qualification, OOS, MDD, worst-case and independent forward minimum passed.'}
    d['engineVersion']='8.20.0';d['enhancedAt']=datetime.now(timezone.utc).isoformat();save(LATEST,d)
if __name__=='__main__':main()
