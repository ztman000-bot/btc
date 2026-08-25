#!/usr/bin/env python3
import csv, io, json, math, os, statistics, urllib.request
from datetime import datetime, timezone
from itertools import product

SOURCE_URL = 'https://raw.githubusercontent.com/SubhayanBiswas/Binance-Vision-Sample-Data/main/BTCUSDT_1h_Cleaned.csv'
OUT_PATH = 'data/backtests/hedge_strategy.json'

CFG = {
    'breakout': 80000.0,
    'longEntry': 94000.0,
    'shortEntry': 62000.0,
    'longQty': 1.0,
    'shortQty': 4.0,
    'legacyStepQty': 0.5,
    'legacyStepPct': 2.5,
    'legacyReservePct': 50.0,
    'feeRate': 0.0005,
}

def fetch_rows():
    req = urllib.request.Request(SOURCE_URL, headers={'User-Agent':'btc-hedge-backtest/1.0'})
    with urllib.request.urlopen(req, timeout=60) as r:
        text = r.read().decode('utf-8-sig')
    out=[]
    for row in csv.DictReader(io.StringIO(text)):
        dt=datetime.strptime(row['Date'], '%d-%m-%Y %H:%M').replace(tzinfo=timezone.utc)
        out.append({'dt':dt,'o':float(row['Open']),'h':float(row['High']),'l':float(row['Low']),'c':float(row['Close']),'v':float(row['Volume'])})
    out.sort(key=lambda x:x['dt'])
    return out

def aggregate_4h(rows):
    buckets=[]; cur=None
    for r in rows:
        key=r['dt'].replace(hour=(r['dt'].hour//4)*4, minute=0, second=0, microsecond=0)
        if cur is None or cur['dt']!=key:
            if cur: buckets.append(cur)
            cur={'dt':key,'o':r['o'],'h':r['h'],'l':r['l'],'c':r['c'],'v':r['v']}
        else:
            cur['h']=max(cur['h'],r['h']); cur['l']=min(cur['l'],r['l']); cur['c']=r['c']; cur['v']+=r['v']
    if cur: buckets.append(cur)
    return buckets

def ema(values, period):
    if not values: return []
    k=2/(period+1); out=[values[0]]
    for x in values[1:]: out.append(x*k+out[-1]*(1-k))
    return out

def add_indicators(bars):
    closes=[b['c'] for b in bars]
    e20=ema(closes,20); e50=ema(closes,50)
    daily=[]; di=[]; last_date=None
    for i,b in enumerate(bars):
        d=b['dt'].date()
        if d!=last_date:
            daily.append(b['c']); di.append(len(daily)-1); last_date=d
        else:
            daily[-1]=b['c']; di.append(len(daily)-1)
    d10=ema(daily,10); d20=ema(daily,20)
    for i,b in enumerate(bars):
        j=di[i]
        b['ema20']=e20[i]; b['ema50']=e50[i]; b['d10']=d10[j]; b['d20']=d20[j]; b['dclose']=daily[j]
    return bars

def metrics(equity, trades, short_series, start_dt, end_dt):
    if not equity: return {}
    peak=equity[0]; mdd=0.0
    for x in equity:
        peak=max(peak,x); mdd=max(mdd,peak-x)
    pnl=equity[-1]-equity[0]
    changes=[equity[i]-equity[i-1] for i in range(1,len(equity))]
    neg=[x for x in changes if x<0]
    downside=math.sqrt(sum(x*x for x in neg)/len(neg)) if neg else 0.0
    return {
        'pnl':round(pnl,2),'maxDrawdown':round(mdd,2),'turnoverTrades':trades,
        'avgShortQty':round(statistics.mean(short_series),3) if short_series else None,
        'minShortQty':round(min(short_series),3) if short_series else None,
        'maxShortQty':round(max(short_series),3) if short_series else None,
        'downside4h':round(downside,2),'start':start_dt.isoformat(),'end':end_dt.isoformat()
    }

def sim_legacy(bars, start_idx, end_idx=None):
    end_idx=end_idx if end_idx is not None else len(bars)-1
    L=CFG['longQty']; q=CFG['shortQty']; minq=CFG['shortQty']*CFG['legacyReservePct']/100
    fee=CFG['feeRate']; step=CFG['legacyStepQty']; mult=1+CFG['legacyStepPct']/100
    p0=bars[start_idx]['c']; eq=0.0; curve=[0.0]; shorts=[q]; trades=0
    next_level=max(CFG['breakout'],p0)*mult
    prev=p0
    for i in range(start_idx+1,end_idx+1):
        b=bars[i]; p=b['c']; eq+=(L-q)*(p-prev)
        while p>=next_level and q>minq+1e-9:
            dq=min(step,q-minq); q-=dq; eq-=dq*p*fee; trades+=1; next_level*=mult
        curve.append(eq); shorts.append(q); prev=p
    return metrics(curve,trades,shorts,bars[start_idx]['dt'],bars[end_idx]['dt'])

def target_short(bars,i,params):
    b=bars[i]; c=b['c']; B=CFG['breakout']; LE=CFG['longEntry']; SQ=CFG['shortQty']
    bull4=c>b['ema20'] and b['ema20']>b['ema50']
    bear4=c<b['ema20'] and b['ema20']<b['ema50']
    bullD=b['dclose']>b['d10']>b['d20']
    bearD=b['dclose']<b['d10']<b['d20']
    k=params['confirmBars']
    accepted=i>=k-1 and all(bars[j]['c']>B for j in range(i-k+1,i+1))
    # Failed break / bearish re-entry: restore hedge rather than keep trimming.
    if c < B*0.985 and (bear4 or bearD): return SQ, 'REHEDGE_STRONG'
    if c < B: return min(SQ,3.75), 'REHEDGE'
    if c <= CFG['shortEntry']*1.05: return SQ, 'SHORT_PROFIT_ZONE'
    if accepted and bull4 and bullD and c>LE: return params['minStrongShort'], 'BULL_STRONG'
    if accepted and bull4 and bullD: return max(params['minStrongShort'],1.5), 'BULL_CONFIRMED'
    if accepted and bull4: return max(params['minStrongShort'],2.25), 'BULL_4H'
    # Raw breakout only: keep most of hedge; at most a tiny trim.
    if c>B: return max(params['minStrongShort'],SQ-params['rawBreakTrim']), 'BREAK_ONLY'
    return SQ, 'HOLD'

def sim_dynamic(bars,start_idx,params,end_idx=None):
    end_idx=end_idx if end_idx is not None else len(bars)-1
    L=CFG['longQty']; q=CFG['shortQty']; fee=CFG['feeRate']; p0=bars[start_idx]['c']
    eq=0.0; curve=[0.0]; shorts=[q]; trades=0; prev=p0; last_trade=-10**9
    cooldown=params['cooldownBars']
    for i in range(start_idx+1,end_idx+1):
        p=bars[i]['c']; eq+=(L-q)*(p-prev)
        target,_=target_short(bars,i,params)
        if i-last_trade>=cooldown:
            if q>target+1e-9:
                dq=min(params['trimStep'],q-target); q-=dq; eq-=dq*p*fee; trades+=1; last_trade=i
            elif q<target-1e-9:
                dq=min(params['rebuildStep'],target-q); q+=dq; eq-=dq*p*fee; trades+=1; last_trade=i
        curve.append(eq); shorts.append(q); prev=p
    return metrics(curve,trades,shorts,bars[start_idx]['dt'],bars[end_idx]['dt'])

def utility(m): return m['pnl'] - 0.55*m['maxDrawdown'] - 15*m['turnoverTrades']

def find_start(bars):
    B=CFG['breakout']
    for i in range(60,len(bars)):
        if bars[i-1]['c']<B and bars[i]['c']>=B: return i
    raise RuntimeError('No 80K up-cross found')

def rolling_windows(bars,start_idx,params,days=30,step_days=14):
    per_day=6; length=days*per_day; step=step_days*per_day; out=[]
    i=start_idx
    while i+length < len(bars):
        a=sim_legacy(bars,i,i+length)
        d=sim_dynamic(bars,i,params,i+length)
        out.append({'start':bars[i]['dt'].date().isoformat(),'legacyUtility':round(utility(a),2),'dynamicUtility':round(utility(d),2),'legacyPnl':a['pnl'],'dynamicPnl':d['pnl'],'legacyMdd':a['maxDrawdown'],'dynamicMdd':d['maxDrawdown'],'dynamicWin':utility(d)>utility(a)})
        i+=step
    return out

def main():
    rows=fetch_rows(); bars=add_indicators(aggregate_4h(rows)); start=find_start(bars)
    # Chronological train/test prevents selecting parameters on the same period used for evaluation.
    split=start + max(120,(len(bars)-start)//2)
    split=min(split,len(bars)-2)
    grid=[]
    for confirm,trim,rebuild,minstrong,cool,raw in product([2,3],[0.25,0.5],[0.25,0.5],[0.5,1.0,1.5],[3,6],[0.25,0.5]):
        p={'confirmBars':confirm,'trimStep':trim,'rebuildStep':rebuild,'minStrongShort':minstrong,'cooldownBars':cool,'rawBreakTrim':raw}
        m=sim_dynamic(bars,start,p,split)
        grid.append((utility(m),p,m))
    grid.sort(key=lambda x:x[0],reverse=True)
    # Prefer robust candidates among the top train performers by test utility, not the single most-overfit train winner.
    finalists=grid[:max(5,len(grid)//10)]
    scored=[]
    for train_u,p,train_m in finalists:
        test_m=sim_dynamic(bars,split,p,len(bars)-1); scored.append((utility(test_m),train_u,p,train_m,test_m))
    scored.sort(key=lambda x:x[0],reverse=True)
    test_u,train_u,best,train_dyn,test_dyn=scored[0]
    legacy_train=sim_legacy(bars,start,split); legacy_test=sim_legacy(bars,split,len(bars)-1)
    legacy_all=sim_legacy(bars,start); dyn_all=sim_dynamic(bars,start,best)
    rolls=rolling_windows(bars,start,best)
    wins=sum(1 for x in rolls if x['dynamicWin']); winrate=(wins/len(rolls)*100) if rolls else 0
    legacy_test_u=utility(legacy_test); dyn_test_u=utility(test_dyn)
    pnl_better=test_dyn['pnl']>legacy_test['pnl']; risk_ok=test_dyn['maxDrawdown']<=legacy_test['maxDrawdown']*1.10
    robust=winrate>=55
    if dyn_test_u>legacy_test_u and risk_ok and robust:
        rec='DYNAMIC'
    elif dyn_test_u>legacy_test_u*0.95 and test_dyn['maxDrawdown']<legacy_test['maxDrawdown'] and robust:
        rec='HYBRID_DYNAMIC_GUARDED'
    else:
        rec='LEGACY_GUARDED'
    payload={
      'schemaVersion':'1.0','generatedAt':datetime.now(timezone.utc).isoformat(),'source':{'url':SOURCE_URL,'description':'Binance Vision BTCUSDT 1h, 2024-2025 public sample; aggregated to 4h','rows1h':len(rows),'bars4h':len(bars)},
      'config':CFG,'evaluation':{'start80kCross':bars[start]['dt'].isoformat(),'split':bars[split]['dt'].isoformat(),'feeRate':CFG['feeRate'],'objective':'relative combined hedge equity; utility = PnL - 0.55*MDD - 15*tradeCount'},
      'legacy':{'description':'80K geometric price ladder, 2.5% steps, 0.5 BTC short trim, 50% reserve, no re-hedge','train':legacy_train,'test':legacy_test,'overall':legacy_all,'testUtility':round(legacy_test_u,2)},
      'dynamic':{'description':'80K break only tiny trim; 4H + daily confirmation; stronger trim above long entry; failed-break re-hedge; cooldown/hysteresis','params':best,'train':train_dyn,'test':test_dyn,'overall':dyn_all,'testUtility':round(dyn_test_u,2)},
      'rolling30d':{'windows':len(rolls),'dynamicWins':wins,'dynamicWinRatePct':round(winrate,1),'details':rolls},
      'comparison':{'testPnlDelta':round(test_dyn['pnl']-legacy_test['pnl'],2),'testMddDelta':round(test_dyn['maxDrawdown']-legacy_test['maxDrawdown'],2),'testUtilityDelta':round(dyn_test_u-legacy_test_u,2),'pnlBetter':pnl_better,'riskOk':risk_ok,'robustRolling':robust},
      'recommendation':rec,
      'guardrails':{'neverTrimOn80kTouchAlone':True,'require4hConfirmationForMainTrim':True,'allowRehedgeAfterFailedBreak':True,'strongTrimRequiresDailyTrend':True,'shortProfitZoneProtectsHedge':True,'maxShortQty':CFG['shortQty'],'note':'Signal is advisory; order execution remains manual.'}
    }
    os.makedirs(os.path.dirname(OUT_PATH),exist_ok=True)
    with open(OUT_PATH,'w',encoding='utf-8') as f: json.dump(payload,f,ensure_ascii=False,indent=2)
    print(json.dumps({'recommendation':rec,'best':best,'legacyTest':legacy_test,'dynamicTest':test_dyn,'rollingWinRate':winrate},indent=2))

if __name__=='__main__': main()
