#!/usr/bin/env python3
import json, math, os, random, statistics, urllib.request
from datetime import datetime, timezone

ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG_PATH=os.path.join(ROOT,'data','research','config.json')
OUT_PATH=os.path.join(ROOT,'data','research','latest.json')
HIST_PATH=os.path.join(ROOT,'data','research','shadow-history.json')

def jget(url, timeout=20):
    req=urllib.request.Request(url,headers={'User-Agent':'btc-hedge-research/8.18'})
    with urllib.request.urlopen(req,timeout=timeout) as r:return json.loads(r.read().decode())

def load(path, default):
    try:
        with open(path,'r',encoding='utf-8') as f:return json.load(f)
    except Exception:return default

def save(path,obj):
    os.makedirs(os.path.dirname(path),exist_ok=True)
    with open(path,'w',encoding='utf-8') as f:json.dump(obj,f,ensure_ascii=False,indent=2)

def ema(a,p):
    if not a:return []
    k=2/(p+1);e=a[0];out=[]
    for v in a:e=v*k+e*(1-k);out.append(e)
    return out

def atr_pct(bars,n=14):
    if len(bars)<n+2:return .03
    tr=[]
    for i in range(1,len(bars)):
        h,l,pc=bars[i][2],bars[i][3],bars[i-1][4]
        tr.append(max(h-l,abs(h-pc),abs(l-pc)))
    return statistics.mean(tr[-n:])/bars[-1][4]

def percentile(xs,q):
    if not xs:return None
    s=sorted(xs);i=max(0,min(len(s)-1,int(round((len(s)-1)*q))))
    return s[i]

def candidates():
    out=[{'fast':20,'slow':50,'dead':.0015,'confirm':2,'name':'BASE'}]
    for f in [8,12,16,20,24,30]:
      for s in [36,48,60,72,96,120]:
       if s>=f*1.8:
        for d in [0,.0015,.003]:
         for c in [1,2,3]:
          if (f,s,d,c)!=(20,50,.0015,2):out.append({'fast':f,'slow':s,'dead':d,'confirm':c,'name':f'E{f}/{s} d{d*100:.2f} c{c}'})
    return out

def fold(slice_,start,p,cost):
    f=ema(slice_,p['fast']);s=ema(slice_,p['slow']);sig=0;pending=0;cnt=0;eq=1;pk=1;mdd=0;turn=0
    for i in range(1,len(slice_)):
        up=f[i]>s[i]*(1+p['dead']);dn=f[i]<s[i]*(1-p['dead']);raw=1 if up else (-1 if dn else sig)
        if raw!=sig:
            if raw==pending:cnt+=1
            else:pending=raw;cnt=1
            if cnt>=p['confirm']:
                if i>=start:eq*=max(.05,1-abs(raw-sig)*cost);turn+=abs(raw-sig)
                sig=raw;pending=0;cnt=0
        else:pending=0;cnt=0
        if i>=start:
            r=slice_[i]/slice_[i-1]-1;eq*=max(.05,1+sig*r);pk=max(pk,eq);mdd=max(mdd,(pk-eq)/pk)
    return {'ret':eq-1,'mdd':mdd,'turn':turn}

def robust_search(closes,cost,max_folds):
    test=48;train=240;folds=[];end=len(closes)
    while end>=train+test and len(folds)<max_folds:
        folds.append((end-train-test,end));end-=test
    if len(folds)<4:return {'ok':False,'reason':'OOS sample insufficient','tested':0,'folds':len(folds),'approved':False}
    stats=[]
    for p in candidates():
        rr=[]
        for a,b in folds:
            sl=closes[a:b];rr.append(fold(sl,len(sl)-test,p,cost))
        rets=sorted(x['ret'] for x in rr);dds=[x['mdd'] for x in rr];turns=[x['turn'] for x in rr]
        avg=statistics.mean(rets);med=statistics.median(rets);worst=rets[0];mdd=statistics.mean(dds);turn=statistics.mean(turns)
        score=med+.35*avg+.25*worst-.9*mdd-.0008*turn
        stats.append({**p,'score':score,'avg':avg,'median':med,'worst':worst,'mdd':mdd,'turn':turn,'folds':len(rr)})
    stats.sort(key=lambda x:x['score'],reverse=True);best=stats[0];base=next(x for x in stats if x['name']=='BASE')
    approved=best['name']=='BASE' or (best['score']>base['score']+.002 and best['median']>=base['median'] and best['worst']>=base['worst']-.005 and best['mdd']<=base['mdd']*1.10)
    return {'ok':True,'tested':len(stats),'folds':len(folds),'best':best,'base':base,'approved':approved,'top5':stats[:5]}

def market_data():
    try:
        k=jget('https://fapi.binance.com/fapi/v1/klines?symbol=BTCUSDT&interval=4h&limit=1000')
        bars=[[int(x[0]),float(x[1]),float(x[2]),float(x[3]),float(x[4]),float(x[5])] for x in k]
        premium=jget('https://fapi.binance.com/fapi/v1/premiumIndex?symbol=BTCUSDT')
        oi=jget('https://fapi.binance.com/fapi/v1/openInterest?symbol=BTCUSDT')
        return bars,premium,oi,'Binance Futures public API'
    except Exception:
        kr=jget('https://api.kraken.com/0/public/OHLC?pair=XBTUSD&interval=240')
        if kr.get('error'):raise RuntimeError('Kraken: '+','.join(kr['error']))
        result=kr['result'];key=next(k for k in result.keys() if k!='last');raw=result[key]
        bars=[[int(x[0])*1000,float(x[1]),float(x[2]),float(x[3]),float(x[4]),float(x[6])] for x in raw]
        der=jget('https://www.deribit.com/api/v2/public/ticker?instrument_name=BTC-PERPETUAL')['result']
        fr=der.get('funding_8h');
        if fr is None:fr=der.get('current_funding',0)
        premium={'lastFundingRate':fr or 0,'markPrice':der.get('mark_price') or bars[-1][4],'indexPrice':der.get('index_price') or bars[-1][4]}
        oi={'openInterest':der.get('open_interest') or 0}
        return bars,premium,oi,'Kraken 4H OHLC + Deribit BTC-PERPETUAL public API'

def regime(closes):
    e20=ema(closes,20);e50=ema(closes,50);p=closes[-1];score=50
    score+=12 if p>e20[-1] else -12;score+=12 if e20[-1]>e50[-1] else -12
    score+=8 if e20[-1]>e20[-4] else -8;score+=6 if p>max(closes[-20:-1]) else 0;score-=6 if p<min(closes[-20:-1]) else 0
    return max(0,min(100,score))

def structure(premium,oi,prev):
    funding=float(premium.get('lastFundingRate') or 0);mark=float(premium.get('markPrice') or 0);index=float(premium.get('indexPrice') or 0);basis=(mark-index)/index if index else 0
    openi=float(oi.get('openInterest') or 0);prev_oi=(prev or {}).get('marketStructure',{}).get('openInterest');oi_change=(openi-prev_oi)/prev_oi if prev_oi else None
    fh=min(1,abs(funding)/.0005);bh=min(1,abs(basis)/.003);oh=min(1,abs(oi_change or 0)/.06)
    heat=round(100*(.45*fh+.30*bh+.25*oh));bias=max(-.18,min(.18,-(math.copysign(.08*fh,funding or 1)+math.copysign(.05*bh,basis or 1)+(math.copysign(.05*oh,(oi_change or 0)*(funding or 1)) if oi_change else 0))))
    return {'healthy':True,'funding':funding,'mark':mark,'index':index,'basis':basis,'openInterest':openi,'oiChange':oi_change,'heat':heat,'bias':bias}

def mmr(cfg):
    d=cfg['position'];liq=d['referenceLiquidation'];q=d['wallet']+d.get('added',0)+d['longQty']*(liq-d['longEntry'])+d['shortQty']*(d['shortEntry']-liq);n=(d['longQty']+d['shortQty'])*liq
    return q/n if n else None

def liq_for(state,cfg,m):
    d=cfg['position'];den=(state['lq']-state['sq'])-m*(state['lq']+state['sq']);num=state['wallet']+state['added']-state['lq']*d['longEntry']+state['sq']*d['shortEntry']
    return None if abs(den)<1e-12 else -num/den

def one_way(cfg,atr):
    fee=cfg['position'].get('feeRate',.0004);slip=min(.0012,max(.0002,.0002+atr*.02));return fee+slip

def apply_action(a,cfg,p,cost):
    d=cfg['position'];s={'wallet':d['wallet'],'added':d.get('added',0),'lq':d['longQty'],'sq':d['shortQty']}
    if a[0]=='S':
        q=min(a[1],s['sq']);s['wallet']+=(d['shortEntry']-p)*q-p*q*cost;s['sq']-=q
    elif a[0]=='L':
        q=min(a[1],s['lq']);s['wallet']+=(p-d['longEntry'])*q-p*q*cost;s['lq']-=q
    elif a[0]=='X':
        s['wallet']+=(p-d['longEntry'])*s['lq']+(d['shortEntry']-p)*s['sq']-p*(s['lq']+s['sq'])*cost;s['lq']=s['sq']=0
    return s

def terminal(s,cfg,p,cost,funding=0):
    d=cfg['position'];return s['wallet']+s['added']+s['lq']*(p-d['longEntry'])+s['sq']*(d['shortEntry']-p)-p*(s['lq']+s['sq'])*cost+(s['sq']-s['lq'])*p*funding*3

def mc_paths(closes,p0,n,steps,blend):
    hist=[math.log(closes[i]/closes[i-1]) for i in range(max(1,len(closes)-500),len(closes)) if closes[i-1]>0]
    mu=statistics.mean(hist);sd=statistics.pstdev(hist) or .02;drift=mu+blend*sd*.08;out=[]
    random.seed(int(p0*100)+len(closes))
    for _ in range(n):
        p=p0
        for __ in range(steps):
            r=random.choice(hist)-mu+drift;p=max(1000,p*math.exp(max(-.18,min(.18,r))))
        out.append(p)
    return out

def actions_eval(cfg,p,ends,cost,funding):
    acts=[('H',0,'HOLD'),('S',.025,'SHORT_0.025'),('S',.05,'SHORT_0.050'),('L',.025,'LONG_0.025'),('L',.05,'LONG_0.050'),('X',0,'EXIT_ALL')];m=mmr(cfg);target=cfg['goals']['targetWallet'];res=[]
    for a in acts:
        s=apply_action(a,cfg,p,cost);liq=liq_for(s,cfg,m);dist=1e12 if liq is None or liq<=0 else abs(liq-p);valid=a[0]=='X' or dist>=cfg['goals']['hardGuardUsd']
        vals=[terminal(s,cfg,x,cost,funding) for x in ends];exp=statistics.mean(vals);p10=percentile(vals,.10);worst=min(vals);rec=sum(1 for x in vals if x>=target)/len(vals);utility=exp+.20*p10+.10*worst-2000*max(0,.10-rec)
        res.append({'id':a[2],'valid':valid,'expectedWallet':exp,'p10':p10,'worst':worst,'recoveryProbability':rec,'guardDistance':dist if dist<1e11 else None,'utility':utility})
    return sorted([x for x in res if x['valid']],key=lambda x:x['utility'],reverse=True)

def main():
    cfg=load(CFG_PATH,{});prev=load(OUT_PATH,{});hist=load(HIST_PATH,{'items':[]})
    bars,premium,oi,source=market_data();cl=[x[4] for x in bars];p=cl[-1];atr=atr_pct(bars);cost=one_way(cfg,atr);rg=regime(cl);ms=structure(premium,oi,prev);wf=robust_search(cl,cost,cfg['research']['oosFolds'])
    champ=wf.get('best',{'name':'BASE'});gov=bool(wf.get('approved'));trend=(rg-50)/50;blend=max(-1,min(1,.82*trend+.18*ms['bias']))
    ends=mc_paths(cl,p,cfg['research']['monteCarloPaths'],cfg['research']['monteCarloSteps'],blend);ranked=actions_eval(cfg,p,ends,cost,ms['funding']);model=ranked[0];executable=model
    if model['id'] not in ('HOLD','EXIT_ALL') and (not gov or not (rg>=72 or rg<=28)):executable=next(x for x in ranked if x['id']=='HOLD')
    current_close=terminal(apply_action(('H',0,'HOLD'),cfg,p,cost),cfg,p,cost,ms['funding'])
    if model['id']=='EXIT_ALL' and current_close<cfg['goals']['targetWallet']:executable=next(x for x in ranked if x['id']=='HOLD')
    now=datetime.now(timezone.utc).isoformat();prior=(hist.get('items') or [])[-1] if hist.get('items') else None;forward=None
    if prior:
        ret=p/prior['price']-1;aid=prior.get('executable','HOLD');direction=1 if aid.startswith('SHORT_') else (-1 if aid.startswith('LONG_') else 0)
        forward={'since':prior['at'],'priceReturn':ret,'priorAction':aid,'directionalScore':direction*ret}
    item={'at':now,'price':p,'regimeScore':rg,'champion':champ.get('name'),'governanceApproved':gov,'modelBest':model['id'],'executable':executable['id'],'expectedWallet':executable['expectedWallet'],'recoveryProbability':executable['recoveryProbability'],'forwardFromPrior':forward}
    items=((hist.get('items') or [])+[item])[-cfg['research']['maxShadowHistory']:];scores=[x.get('forwardFromPrior',{}).get('directionalScore') for x in items if x.get('forwardFromPrior') and x['forwardFromPrior'].get('directionalScore') is not None]
    positive=sum(1 for x in scores if x>0);shadow={'samples':len(items),'directionalEvaluations':len(scores),'directionalWinRate':positive/len(scores) if scores else None,'avgDirectionalScore':statistics.mean(scores) if scores else None}
    out={'schemaVersion':'1.0','engineVersion':'8.18.0','generatedAt':now,'source':source+'; no account keys; no real orders','market':{'price':p,'atr4hPct':atr,'regimeScore':rg,'bars4h':len(bars)},'marketStructure':ms,'optimizer':wf,'executionReality':{'oneWayCost':cost},'monteCarlo':{'paths':len(ends),'steps':cfg['research']['monteCarloSteps'],'terminalPriceP10':percentile(ends,.10),'terminalPriceMedian':percentile(ends,.50),'terminalPriceP90':percentile(ends,.90)},'terminalWallet':{'rankedActions':ranked,'modelBest':model,'executable':executable,'currentNetClose':current_close,'targetWallet':cfg['goals']['targetWallet']},'shadow':shadow,'lastDecision':item}
    save(OUT_PATH,out);save(HIST_PATH,{'schemaVersion':'1.0','items':items})
    print(json.dumps({'source':source,'bars':len(bars),'price':p,'regime':rg,'champion':champ.get('name'),'approved':gov,'best':model['id'],'executable':executable['id'],'shadowSamples':len(items)},ensure_ascii=False))

if __name__=='__main__':
    try:main()
    except Exception as e:
        now=datetime.now(timezone.utc).isoformat();save(OUT_PATH,{'schemaVersion':'1.0','engineVersion':'8.18.0','generatedAt':now,'status':'error','error':str(e),'source':'No orders; research runner error'});raise
