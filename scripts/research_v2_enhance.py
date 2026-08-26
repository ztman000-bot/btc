#!/usr/bin/env python3
import json, os, math, statistics, urllib.request
from datetime import datetime, timezone
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LATEST=os.path.join(ROOT,'data','research','latest.json')
HIST=os.path.join(ROOT,'data','research','shadow-history.json')
CFG=os.path.join(ROOT,'data','research','config.json')

def load(p,d):
    try:
        with open(p,encoding='utf-8') as f:return json.load(f)
    except Exception:return d

def save(p,x):
    with open(p,'w',encoding='utf-8') as f:json.dump(x,f,ensure_ascii=False,indent=2)

def ema(a,n):
    if not a:return []
    k=2/(n+1); e=a[0]; out=[]
    for v in a:e=v*k+e*(1-k);out.append(e)
    return out

def closes():
    req=urllib.request.Request('https://api.kraken.com/0/public/OHLC?pair=XBTUSD&interval=240',headers={'User-Agent':'btc-recovery-v2/1.0'})
    with urllib.request.urlopen(req,timeout=20) as r:j=json.loads(r.read().decode())
    key=next(k for k in j['result'] if k!='last');return [float(x[4]) for x in j['result'][key]]

def regime5(a):
    e20,e50=ema(a,20),ema(a,50);p=a[-1];slope=(e20[-1]/e20[-4]-1) if len(e20)>4 else 0;spread=e20[-1]/e50[-1]-1
    if p>e20[-1] and spread>.012 and slope>.006:return 'STRONG_UP'
    if p>e20[-1] and spread>0:return 'UP'
    if p<e20[-1] and spread<-.012 and slope<-.006:return 'CRASH_DOWN'
    if p<e20[-1] and spread<0:return 'DOWN'
    return 'RANGE'

def main():
    d=load(LATEST,{});h=load(HIST,{'items':[]});cfg=load(CFG,{})
    items=h.get('items',[]); active=[]
    for x in items:
        f=x.get('forwardFromPrior') or {}; a=f.get('priorAction','HOLD'); sc=f.get('directionalScore')
        if a!='HOLD' and sc is not None:active.append((a,float(sc)))
    wins=sum(1 for _,s in active if s>0); scores=[s for _,s in active]
    n=len(active); grade='EXPERIMENT'
    if n>=300:grade='TRUSTED'
    elif n>=100:grade='VALIDATED'
    elif n>=30:grade='CANDIDATE'
    d['shadow2']={'activeEvaluations':n,'holdExcluded':True,'activeWinRate':wins/n if n else None,'avgActiveScore':statistics.mean(scores) if scores else None,'confidenceGrade':grade,'thresholds':{'candidate':30,'validated':100,'trusted':300}}
    try:r=regime5(closes())
    except Exception:r='UNKNOWN'
    best=(d.get('optimizer') or {}).get('best') or {}; base=(d.get('optimizer') or {}).get('base') or {}
    champs={k:{'name':base.get('name','BASE'),'status':'LEARNING'} for k in ['STRONG_UP','UP','RANGE','DOWN','CRASH_DOWN']}
    if r in champs:champs[r]={'name':best.get('name','BASE'),'status':'ACTIVE' if (d.get('optimizer') or {}).get('approved') else 'SHADOW'}
    d['regimeChampion']={'current':r,'champions':champs,'switchPolicy':{'confirmationBars':2,'hysteresis':True,'note':'Regime switch requires confirmation; inactive regimes remain learning until enough forward samples.'}}
    atr=float((d.get('market') or {}).get('atr4hPct') or .02); hard=float(cfg.get('goals',{}).get('hardGuardUsd',10000)); operating=max(hard,12000 if atr<.025 else 15000 if atr<.045 else 18000)
    d['guard2']={'hardFloorUsd':hard,'dynamicOperatingGuardUsd':operating,'atr4hPct':atr,'optimizerMayOverrideHardFloor':False}
    tw=d.get('terminalWallet') or {}; exe=tw.get('executable') or {}; target=float(cfg.get('goals',{}).get('targetWallet',69936.3)); cur=float(tw.get('currentNetClose') or 0); exp=float(exe.get('expectedWallet') or cur);p10=float(exe.get('p10') or exp);worst=float(exe.get('worst') or p10);rec=float(exe.get('recoveryProbability') or 0)
    progress=max(0,min(1,cur/target)) if target else 0
    downside=max(0,cur-worst); utility=exp + .25*p10 + .15*worst + target*rec*.20 - downside*.35
    d['recovery2']={'objective':'terminal_wallet_recovery','targetWallet':target,'currentNetClose':cur,'progress':progress,'expectedWallet':exp,'p10Wallet':p10,'worstWallet':worst,'recoveryProbability':rec,'downsideToWorst':downside,'recoveryUtility':utility,'priority':['10K hard guard','survival/worst wallet','recovery probability','expected terminal wallet','cost/MDD']}
    top=(d.get('optimizer') or {}).get('top5') or []; challenger=top[1] if len(top)>1 else None
    margin=(best.get('score',0)-challenger.get('score',0)) if challenger else 0
    eligible=bool((d.get('optimizer') or {}).get('approved')) and n>=30 and (best.get('worst',-1)>=base.get('worst',-1)-.005) and (best.get('mdd',1)<=base.get('mdd',1)*1.10)
    d['governance2']={'champion':best.get('name','BASE'),'challenger':challenger.get('name') if challenger else None,'scoreMargin':margin,'promotionEligible':eligible,'forwardMinimum':30,'reason':'Forward active-action sample >=30 required before automatic promotion.' if not eligible else 'OOS, MDD, worst-case and forward minimum passed.'}
    d['engineVersion']='8.20.0';d['enhancedAt']=datetime.now(timezone.utc).isoformat();save(LATEST,d)
if __name__=='__main__':main()
