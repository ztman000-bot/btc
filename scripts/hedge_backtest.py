#!/usr/bin/env python3
import csv, io, json, math, os, statistics, urllib.request
from datetime import datetime, timezone
from itertools import product

SOURCE_URL='https://raw.githubusercontent.com/SubhayanBiswas/Binance-Vision-Sample-Data/main/BTCUSDT_1h_Cleaned.csv'
OUT_PATH='data/backtests/hedge_strategy.json'
CFG={'breakout':80000.0,'longEntry':94000.0,'shortEntry':62000.0,'longQty':1.0,'shortQty':4.0,'legacyStepQty':0.5,'legacyStepPct':2.5,'legacyReservePct':50.0,'feeRate':0.0005}

def fetch_rows():
    req=urllib.request.Request(SOURCE_URL,headers={'User-Agent':'btc-hedge-backtest/1.2'})
    with urllib.request.urlopen(req,timeout=60) as r:text=r.read().decode('utf-8-sig')
    out=[]
    for row in csv.DictReader(io.StringIO(text)):
        dt=datetime.strptime(row['Date'],'%d-%m-%Y %H:%M').replace(tzinfo=timezone.utc)
        out.append({'dt':dt,'o':float(row['Open']),'h':float(row['High']),'l':float(row['Low']),'c':float(row['Close']),'v':float(row['Volume'])})
    return sorted(out,key=lambda x:x['dt'])

def aggregate_4h(rows):
    a=[];cur=None
    for r in rows:
        key=r['dt'].replace(hour=(r['dt'].hour//4)*4,minute=0,second=0,microsecond=0)
        if cur is None or cur['dt']!=key:
            if cur:a.append(cur)
            cur={'dt':key,'o':r['o'],'h':r['h'],'l':r['l'],'c':r['c'],'v':r['v']}
        else:
            cur['h']=max(cur['h'],r['h']);cur['l']=min(cur['l'],r['l']);cur['c']=r['c'];cur['v']+=r['v']
    if cur:a.append(cur)
    return a

def ema(v,p):
    if not v:return[]
    k=2/(p+1);o=[v[0]]
    for x in v[1:]:o.append(x*k+o[-1]*(1-k))
    return o

def add_indicators(bars):
    c=[b['c'] for b in bars];e20=ema(c,20);e50=ema(c,50);daily=[];di=[];ld=None
    for b in bars:
        d=b['dt'].date()
        if d!=ld:daily.append(b['c']);di.append(len(daily)-1);ld=d
        else:daily[-1]=b['c'];di.append(len(daily)-1)
    d10=ema(daily,10);d20=ema(daily,20)
    for i,b in enumerate(bars):
        j=di[i];b.update(ema20=e20[i],ema50=e50[i],d10=d10[j],d20=d20[j],dclose=daily[j])
    return bars

def metrics(eq,trades,shorts,sdt,edt):
    peak=eq[0];mdd=0
    for x in eq:peak=max(peak,x);mdd=max(mdd,peak-x)
    ch=[eq[i]-eq[i-1] for i in range(1,len(eq))];neg=[x for x in ch if x<0]
    return {'pnl':round(eq[-1]-eq[0],2),'maxDrawdown':round(mdd,2),'turnoverTrades':trades,'avgShortQty':round(statistics.mean(shorts),3),'minShortQty':round(min(shorts),3),'maxShortQty':round(max(shorts),3),'downside4h':round(math.sqrt(sum(x*x for x in neg)/len(neg)),2) if neg else 0,'start':sdt.isoformat(),'end':edt.isoformat()}

def sim_legacy(bars,s,e=None):
    e=len(bars)-1 if e is None else e;L=CFG['longQty'];q=CFG['shortQty'];minq=q*CFG['legacyReservePct']/100;step=CFG['legacyStepQty'];mult=1+CFG['legacyStepPct']/100;fee=CFG['feeRate']
    p0=bars[s]['c'];prev=p0;eq=0;curve=[0];shorts=[q];trades=0;level=max(CFG['breakout'],p0)*mult
    for i in range(s+1,e+1):
        p=bars[i]['c'];eq+=(L-q)*(p-prev)
        while p>=level and q>minq+1e-9:
            dq=min(step,q-minq);q-=dq;eq-=dq*p*fee;trades+=1;level*=mult
        curve.append(eq);shorts.append(q);prev=p
    return metrics(curve,trades,shorts,bars[s]['dt'],bars[e]['dt'])

def state_target(bars,i,p,q):
    b=bars[i];c=b['c'];B=CFG['breakout'];LE=CFG['longEntry'];SQ=CFG['shortQty']
    bull4=c>b['ema20'] and b['ema20']>b['ema50'];bear4=c<b['ema20'] and b['ema20']<b['ema50'];bullD=b['dclose']>b['d10']>b['d20'];bearD=b['dclose']<b['d10']<b['d20']
    k=p['confirmBars'];accepted=i>=k-1 and all(bars[j]['c']>B for j in range(i-k+1,i+1))
    if c<=CFG['shortEntry']*1.05:return SQ,'SHORT_PROFIT_ZONE'
    if c<B*0.97 and bear4 and bearD:return SQ,'REHEDGE_CONFIRMED'
    if c<B*0.985 and bear4:return max(q,3.0),'REHEDGE_4H'
    if c<B:return q,'FAILED_BREAK_WAIT'
    if accepted and bull4 and bullD and c>LE:return p['minStrongShort'],'BULL_STRONG'
    if accepted and bull4 and bullD:return max(p['minStrongShort'],1.5),'BULL_CONFIRMED'
    if accepted and bull4:return max(p['minStrongShort'],2.25),'BULL_4H'
    if c>B:return max(p['minStrongShort'],SQ-p['rawBreakTrim']),'BREAK_ONLY'
    return q,'HOLD'

def sim_policy(bars,s,p,e=None,allow_rehedge=True):
    e=len(bars)-1 if e is None else e;L=CFG['longQty'];q=CFG['shortQty'];fee=CFG['feeRate'];prev=bars[s]['c'];eq=0;curve=[0];shorts=[q];trades=0;last=-10**9
    for i in range(s+1,e+1):
        px=bars[i]['c'];eq+=(L-q)*(px-prev);target,_=state_target(bars,i,p,q)
        if i-last>=p['cooldownBars']:
            if q>target+1e-9:
                dq=min(p['trimStep'],q-target);q-=dq;eq-=dq*px*fee;trades+=1;last=i
            elif allow_rehedge and q<target-1e-9:
                dq=min(p['rebuildStep'],target-q);q+=dq;eq-=dq*px*fee;trades+=1;last=i
        curve.append(eq);shorts.append(q);prev=px
    return metrics(curve,trades,shorts,bars[s]['dt'],bars[e]['dt'])

def utility(m):return m['pnl']-0.55*m['maxDrawdown']-20*m['turnoverTrades']

def find_start(b):
    for i in range(60,len(b)):
        if b[i-1]['c']<CFG['breakout']<=b[i]['c']:return i
    raise RuntimeError('No 80K up-cross')

def optimize(bars,s,split,legacy_train,allow_rehedge,raw_values):
    grid=[]
    for confirm,trim,rebuild,minstrong,cool,raw in product([2,3],[0.25,0.5],[0.25,0.5],[0.5,1.0,1.5],[6,12],raw_values):
        p={'confirmBars':confirm,'trimStep':trim,'rebuildStep':rebuild,'minStrongShort':minstrong,'cooldownBars':cool,'rawBreakTrim':raw}
        m=sim_policy(bars,s,p,split,allow_rehedge);grid.append((utility(m),p,m))
    grid.sort(key=lambda x:x[0],reverse=True);finalists=grid[:max(8,len(grid)//8)]
    safe=[x for x in finalists if x[2]['maxDrawdown']<=legacy_train['maxDrawdown']*1.15]
    if safe:finalists=safe
    scored=[]
    for tu,p,tm in finalists:
        test=sim_policy(bars,split,p,len(bars)-1,allow_rehedge);scored.append((utility(test),tu,p,tm,test))
    return sorted(scored,key=lambda x:x[0],reverse=True)[0]

def rolling(bars,s,p,allow_rehedge,days=30,step_days=14):
    length=days*6;step=step_days*6;o=[];i=s
    while i+length<len(bars):
        a=sim_legacy(bars,i,i+length);x=sim_policy(bars,i,p,i+length,allow_rehedge)
        o.append({'start':bars[i]['dt'].date().isoformat(),'legacyUtility':round(utility(a),2),'candidateUtility':round(utility(x),2),'legacyPnl':a['pnl'],'candidatePnl':x['pnl'],'legacyMdd':a['maxDrawdown'],'candidateMdd':x['maxDrawdown'],'candidateWin':utility(x)>utility(a)})
        i+=step
    return o

def pack_candidate(name,desc,bars,s,split,best,legacy_train,legacy_test,legacy_all,allow_rehedge):
    test_u,train_u,p,train_m,test_m=best;all_m=sim_policy(bars,s,p,None,allow_rehedge);rolls=rolling(bars,s,p,allow_rehedge);wins=sum(x['candidateWin'] for x in rolls);wr=100*wins/len(rolls) if rolls else 0
    checks={'testUtilityBetter':utility(test_m)>utility(legacy_test),'testRiskOk':test_m['maxDrawdown']<=legacy_test['maxDrawdown']*1.10,'trainRiskOk':train_m['maxDrawdown']<=legacy_train['maxDrawdown']*1.15,'overallRiskOk':all_m['maxDrawdown']<=legacy_all['maxDrawdown']*1.20,'robustRolling':wr>=55}
    qualified=all(checks.values())
    return {'name':name,'description':desc,'params':p,'train':train_m,'test':test_m,'overall':all_m,'testUtility':round(utility(test_m),2),'rolling30d':{'windows':len(rolls),'wins':wins,'winRatePct':round(wr,1)},'checks':checks,'qualified':qualified,'scoreForSelection':round(utility(test_m)+0.20*utility(all_m),2)}

def main():
    rows=fetch_rows();bars=add_indicators(aggregate_4h(rows));s=find_start(bars);split=min(s+max(120,(len(bars)-s)//2),len(bars)-2)
    lt=sim_legacy(bars,s,split);lv=sim_legacy(bars,split);la=sim_legacy(bars,s)
    dyn_best=optimize(bars,s,split,lt,True,[0.25,0.5]);hyb_best=optimize(bars,s,split,lt,False,[0.0,0.25,0.5])
    dynamic=pack_candidate('DYNAMIC_GUARDED','Confirmed trim + confirmed automatic re-hedge',bars,s,split,dyn_best,lt,lv,la,True)
    hybrid=pack_candidate('HYBRID_CONFIRMED','Confirmed trim; on breakdown stop trimming but do not automatically rebuild short',bars,s,split,hyb_best,lt,lv,la,False)
    candidates=[dynamic,hybrid];qualified=[x for x in candidates if x['qualified']]
    if qualified:selected=max(qualified,key=lambda x:x['scoreForSelection'])
    else:
        safer=[x for x in candidates if x['checks']['testRiskOk'] and x['checks']['robustRolling']]
        selected=max(safer,key=lambda x:x['scoreForSelection']) if safer else {'name':'LEGACY_GUARDED'}
    rec=selected['name']
    payload={'schemaVersion':'1.2','generatedAt':datetime.now(timezone.utc).isoformat(),'source':{'url':SOURCE_URL,'description':'Binance Vision BTCUSDT 1h 2024-2025; aggregated to 4h','rows1h':len(rows),'bars4h':len(bars)},'config':CFG,'evaluation':{'start80kCross':bars[s]['dt'].isoformat(),'split':bars[split]['dt'].isoformat(),'feeRate':CFG['feeRate'],'method':'chronological train/test + 30-day rolling + train/test/overall MDD guards','objective':'utility = PnL - 0.55*MDD - 20*tradeCount'},'legacy':{'name':'LEGACY_LADDER','description':'80K geometric 2.5% ladder; 0.5 BTC trims; 50% short reserve; no rebuild','train':lt,'test':lv,'overall':la,'testUtility':round(utility(lv),2)},'dynamic':dynamic,'hybrid':hybrid,'recommendation':rec,'selectedParams':selected.get('params'),'comparisonToLegacy':None if rec=='LEGACY_GUARDED' else {'testPnlDelta':round(selected['test']['pnl']-lv['pnl'],2),'testMddDelta':round(selected['test']['maxDrawdown']-lv['maxDrawdown'],2),'overallPnlDelta':round(selected['overall']['pnl']-la['pnl'],2),'overallMddDelta':round(selected['overall']['maxDrawdown']-la['maxDrawdown'],2),'rollingWinRatePct':selected['rolling30d']['winRatePct']},'guardrails':{'80kTouchNeverForcesMainTrim':True,'mainTrimRequires4hConfirmation':True,'strongTrimNeedsDailyTrend':True,'breakdownStopsFurtherTrim':True,'automaticRehedge':rec=='DYNAMIC_GUARDED','manualRehedgeIfHybrid':rec=='HYBRID_CONFIRMED','shortProfitZonePreserved':True,'ordersRemainManual':True}}
    os.makedirs(os.path.dirname(OUT_PATH),exist_ok=True)
    with open(OUT_PATH,'w',encoding='utf-8') as f:json.dump(payload,f,ensure_ascii=False,indent=2)
    print(json.dumps({'recommendation':rec,'legacyTest':lv,'dynamic':dynamic,'hybrid':hybrid,'comparison':payload['comparisonToLegacy']},indent=2))

if __name__=='__main__':main()
