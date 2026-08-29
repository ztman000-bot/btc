#!/usr/bin/env python3
"""BTC Hedge Assistant - AI dataset / confidence / paper validation pipeline.

Runs without private API keys. It collects public BTC futures/spot market features,
creates one immutable 15m evidence sample per closed candle, labels older samples
when 1h/4h/24h outcomes become available, and maintains a conservative paper-only
validation ledger. This file NEVER places real orders.
"""
import json, math, os, statistics, urllib.request
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR = os.path.join(ROOT, 'data', 'research')
DATASET = os.path.join(DIR, 'ai-dataset.json')
LATEST = os.path.join(DIR, 'ai-dataset-latest.json')
PAPER = os.path.join(DIR, 'paper-validation.json')
MAX_SAMPLES = 12000


def jget(url, timeout=20):
    req = urllib.request.Request(url, headers={'User-Agent': 'btc-hedge-ai-data/1.0'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())


def load(path, default):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return default


def save(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)


def bars(interval, limit=500):
    raw = jget(f'https://fapi.binance.com/fapi/v1/klines?symbol=BTCUSDT&interval={interval}&limit={limit}')
    return [[int(x[0]), float(x[1]), float(x[2]), float(x[3]), float(x[4]), float(x[5]), float(x[7]), float(x[9])] for x in raw]


def ema(a, p):
    if not a: return []
    k=2/(p+1); e=a[0]; out=[]
    for v in a:
        e=v*k+e*(1-k); out.append(e)
    return out


def rsi(a, n=14):
    if len(a) < n+2: return 50.0
    gains=[]; losses=[]
    for i in range(1, len(a)):
        d=a[i]-a[i-1]; gains.append(max(0,d)); losses.append(max(0,-d))
    g=statistics.mean(gains[-n:]); l=statistics.mean(losses[-n:])
    if l == 0: return 100.0
    return 100 - 100/(1+g/l)


def atr_pct(b, n=14):
    if len(b) < n+2: return 0.0
    tr=[]
    for i in range(1,len(b)):
        h,l,pc=b[i][2],b[i][3],b[i-1][4]
        tr.append(max(h-l,abs(h-pc),abs(l-pc)))
    return statistics.mean(tr[-n:]) / b[-1][4]


def tf_features(b):
    c=[x[4] for x in b]; v=[x[5] for x in b]
    e5,e10,e15,e20,e50,e120=[ema(c,p) for p in (5,10,15,20,50,120)]
    p=c[-1]
    volbase=statistics.mean(v[-21:-1]) if len(v)>=21 else (statistics.mean(v) if v else 0)
    return {
        'close': p,
        'ret1': c[-1]/c[-2]-1 if len(c)>1 and c[-2] else 0,
        'ret3': c[-1]/c[-4]-1 if len(c)>3 and c[-4] else 0,
        'ema5Gap': p/e5[-1]-1 if e5[-1] else 0,
        'ema10Gap': p/e10[-1]-1 if e10[-1] else 0,
        'ema15Gap': p/e15[-1]-1 if e15[-1] else 0,
        'ema20Gap': p/e20[-1]-1 if e20[-1] else 0,
        'ema50Gap': p/e50[-1]-1 if e50[-1] else 0,
        'ema120Gap': p/e120[-1]-1 if e120[-1] else 0,
        'cross5_15': 1 if e5[-1]>e15[-1] else -1,
        'cross10_120': 1 if e10[-1]>e120[-1] else -1,
        'rsi14': rsi(c),
        'atrPct14': atr_pct(b),
        'volumeRatio20': v[-1]/volbase if volbase else 1,
    }


def get_optional(url, default=None):
    try: return jget(url)
    except Exception: return default


def derivative_features(prev):
    premium=get_optional('https://fapi.binance.com/fapi/v1/premiumIndex?symbol=BTCUSDT', {}) or {}
    oi=get_optional('https://fapi.binance.com/fapi/v1/openInterest?symbol=BTCUSDT', {}) or {}
    ratio=get_optional('https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=15m&limit=2', []) or []
    taker=get_optional('https://fapi.binance.com/futures/data/takerlongshortRatio?symbol=BTCUSDT&period=15m&limit=2', []) or []
    funding=float(premium.get('lastFundingRate') or 0)
    mark=float(premium.get('markPrice') or 0); index=float(premium.get('indexPrice') or 0)
    openi=float(oi.get('openInterest') or 0)
    prev_oi=float((prev or {}).get('derivatives',{}).get('openInterest') or 0)
    return {
        'funding': funding,
        'basis': (mark-index)/index if index else 0,
        'openInterest': openi,
        'oiChange15m': (openi-prev_oi)/prev_oi if prev_oi else None,
        'globalLongShortRatio': float(ratio[-1].get('longShortRatio')) if ratio else None,
        'takerBuySellRatio': float(taker[-1].get('buySellRatio')) if taker else None,
    }


def signal_and_confidence(tfs, d):
    # Transparent ensemble; only for validation/paper trading, never real execution.
    score=0.0; votes=[]
    weights={'15m':0.12,'1h':0.23,'4h':0.38,'1d':0.27}
    for tf,w in weights.items():
        x=tfs[tf]
        vote=0
        vote += 1 if x['ema20Gap']>0 else -1
        vote += 1 if x['cross5_15']>0 else -1
        vote += 1 if x['cross10_120']>0 else -1
        vote += 1 if x['rsi14']>=52 else (-1 if x['rsi14']<=48 else 0)
        norm=max(-1,min(1,vote/4))
        votes.append(norm); score += w*norm
    # Crowding is mildly contrarian, OI expansion strengthens the prevailing move.
    ls=d.get('globalLongShortRatio'); tk=d.get('takerBuySellRatio'); funding=d.get('funding') or 0
    crowd=0
    if ls is not None: crowd += max(-1,min(1,(ls-1)/0.35))
    if tk is not None: crowd += max(-1,min(1,(tk-1)/0.30))
    crowd=max(-1,min(1,crowd/2))
    score=max(-1,min(1,score - 0.07*crowd - max(-.05,min(.05,funding*100))))
    agreement=1-statistics.pstdev(votes)/1.0 if len(votes)>1 else 0
    agreement=max(0,min(1,agreement))
    vol=tfs['4h']['atrPct14']
    vol_penalty=max(0,min(.25,(vol-.035)*5))
    confidence=max(0,min(100, round((abs(score)*0.62 + agreement*0.38 - vol_penalty)*100)))
    direction='LONG' if score>=0.18 else ('SHORT' if score<=-0.18 else 'HOLD')
    return direction, confidence, score


def label_samples(samples, price, now_ms):
    horizons={'1h':60*60*1000,'4h':4*60*60*1000,'24h':24*60*60*1000}
    for s in samples:
        labels=s.setdefault('labels',{})
        for name,ms in horizons.items():
            if name in labels or now_ms-int(s['evidenceTime']) < ms: continue
            entry=float(s['price']); ret=price/entry-1 if entry else 0
            side=s.get('signal','HOLD')
            directional = ret if side=='LONG' else (-ret if side=='SHORT' else 0)
            labels[name]={'price':price,'return':ret,'directionalReturn':directional,'hit': directional>0 if side!='HOLD' else abs(ret)<0.003}


def paper_update(state, sample):
    state=state or {'startEquity':50.0,'equity':50.0,'peak':50.0,'trades':0,'wins':0,'losses':0,'position':None,'lastEvidenceTime':None,'maxDrawdownPct':0.0}
    if state.get('lastEvidenceTime') == sample['evidenceTime']: return state
    price=float(sample['price']); pos=state.get('position')
    # Mark-to-market/close previous 15m validation position. Risk is capped at 2% notional per signal confidence.
    if pos:
        entry=float(pos['entry']); side=pos['side']; notional=float(pos['notional'])
        raw=(price/entry-1)*(1 if side=='LONG' else -1)
        pnl=notional*raw - notional*0.0008
        state['equity']=max(0,state['equity']+pnl); state['trades']+=1
        if pnl>=0: state['wins']+=1
        else: state['losses']+=1
    state['position']=None
    if sample['signal'] in ('LONG','SHORT') and sample['confidence']>=60 and state['equity']>0:
        risk_scale=min(.02, .005 + (sample['confidence']-60)/40*.015)
        state['position']={'side':sample['signal'],'entry':price,'notional':state['equity']*risk_scale,'openedAt':sample['evidenceTime']}
    state['lastEvidenceTime']=sample['evidenceTime']; state['peak']=max(state.get('peak',state['equity']),state['equity'])
    dd=(state['peak']-state['equity'])/state['peak']*100 if state['peak'] else 0
    state['maxDrawdownPct']=max(state.get('maxDrawdownPct',0),dd)
    state['winRate']=state['wins']/state['trades']*100 if state['trades'] else None
    return state


def main():
    now=datetime.now(timezone.utc); now_ms=int(now.timestamp()*1000)
    tfbars={tf:bars(tf,500 if tf!='1d' else 365) for tf in ('15m','1h','4h','1d')}
    # Last fully closed 15m candle is the immutable evidence key.
    closed=[b for b in tfbars['15m'] if b[0]+15*60*1000<=now_ms]
    ev=closed[-1] if closed else tfbars['15m'][-2]
    evidence_time=int(ev[0]); price=float(ev[4])
    previous=load(LATEST,{})
    derivatives=derivative_features(previous)
    features={tf:tf_features(b) for tf,b in tfbars.items()}
    signal,confidence,score=signal_and_confidence(features,derivatives)
    sample={'evidenceTime':evidence_time,'at':now.isoformat(),'price':price,'signal':signal,'confidence':confidence,'score':score,'timeframes':features,'derivatives':derivatives,'labels':{}}

    db=load(DATASET,{'schemaVersion':1,'symbol':'BTCUSDT','samples':[]})
    samples=db.get('samples') or []
    label_samples(samples,price,now_ms)
    is_new=not samples or int(samples[-1].get('evidenceTime',-1))!=evidence_time
    if is_new: samples.append(sample)
    samples=samples[-MAX_SAMPLES:]
    db.update({'schemaVersion':1,'symbol':'BTCUSDT','updatedAt':now.isoformat(),'sampleCount':len(samples),'samples':samples})
    save(DATASET,db)

    paper=load(PAPER,{})
    if is_new: paper=paper_update(paper,sample)
    paper['updatedAt']=now.isoformat(); save(PAPER,paper)

    evaluated=[s for s in samples if s.get('labels',{}).get('4h') and s.get('signal') in ('LONG','SHORT')]
    hits=sum(1 for s in evaluated if s['labels']['4h']['hit'])
    latest={
        'schemaVersion':1,'generatedAt':now.isoformat(),'symbol':'BTCUSDT','newEvidence':is_new,
        'sampleCount':len(samples),'evaluated4h':len(evaluated),'hitRate4h':(hits/len(evaluated)*100 if evaluated else None),
        'signal':signal,'confidence':confidence,'score':score,'price':price,'evidenceTime':evidence_time,
        'derivatives':derivatives,'timeframes':features,'paper':paper,
        'readiness':{
            'dataCollection': True,
            'backtestReady': len(samples)>=384,
            'confidenceCalibrationReady': len(evaluated)>=100,
            'limitedAutoTradeReady': len(evaluated)>=300 and paper.get('trades',0)>=100 and (paper.get('maxDrawdownPct') or 999)<=10 and (paper.get('winRate') or 0)>=52,
            'realAutoTradeEnabled': False
        }
    }
    save(LATEST,latest)
    print(json.dumps({'newEvidence':is_new,'samples':len(samples),'evaluated4h':len(evaluated),'signal':signal,'confidence':confidence,'paperEquity':paper.get('equity')},ensure_ascii=False))

if __name__=='__main__': main()
