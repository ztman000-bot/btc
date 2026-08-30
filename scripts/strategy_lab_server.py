#!/usr/bin/env python3
import json, os, statistics, urllib.request
from datetime import datetime, timezone

ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'data','research','lab-latest.json')
HIST=os.path.join(ROOT,'data','research','lab-history.json')

def jget(url):
    req=urllib.request.Request(url,headers={'User-Agent':'btc-strategy-lab/2.1'})
    with urllib.request.urlopen(req,timeout=25) as r:return json.loads(r.read().decode())

def load(path,default):
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

def fetch_bars():
    try:
        k=jget('https://fapi.binance.com/fapi/v1/klines?symbol=BTCUSDT&interval=4h&limit=1000')
        return [{'t':int(x[0]),'o':float(x[1]),'h':float(x[2]),'l':float(x[3]),'c':float(x[4]),'v':float(x[5])} for x in k], 'Binance Futures 4H'
    except Exception:
        kr=jget('https://api.kraken.com/0/public/OHLC?pair=XBTUSD&interval=240')
        if kr.get('error'):raise RuntimeError(','.join(kr['error']))
        key=next(k for k in kr['result'] if k!='last')
        return [{'t':int(x[0])*1000,'o':float(x[1]),'h':float(x[2]),'l':float(x[3]),'c':float(x[4]),'v':float(x[6])} for x in kr['result'][key]], 'Kraken XBTUSD 4H'

def direction(f,s,dead):
    if f>s*(1+dead):return 1
    if f<s*(1-dead):return -1
    return 0

def regime(i,bars,e20,e50):
    p=bars[i]['c'];gap=(e20[i]-e50[i])/e50[i] if e50[i] else 0
    r=abs(p/bars[max(0,i-6)]['c']-1)
    if r>.06:return '고변동성'
    if gap>.012:return '강한 상승'
    if gap>.003:return '약한 상승'
    if gap<-.012:return '강한 하락'
    if gap<-.003:return '약한 하락'
    return '횡보'

def rules():
    return [
      ('CURRENT','현재 전략',20,50,.0015),
      ('A','후보 A · 품질 강화',20,50,.0030),
      ('B','후보 B · 빠른 추세',16,48,.0015),
      ('C','후보 C · 보수형',24,72,.0030),
    ]

def performance_metrics(vals):
    vals=[float(v) for v in vals if v is not None]
    if not vals:
        return {'expectancyPct':None,'profitFactor':None,'avgWinPct':None,'avgLossPct':None,'payoffRatio':None,'grossProfitPct':0.0,'grossLossPct':0.0}
    wins=[v for v in vals if v>0]
    losses=[v for v in vals if v<0]
    gross_profit=sum(wins)
    gross_loss=abs(sum(losses))
    avg_win=statistics.mean(wins) if wins else None
    avg_loss=abs(statistics.mean(losses)) if losses else None
    pf=(gross_profit/gross_loss) if gross_loss>0 else (None if gross_profit<=0 else 999.0)
    payoff=(avg_win/avg_loss) if avg_win is not None and avg_loss and avg_loss>0 else None
    return {
        'expectancyPct':statistics.mean(vals),
        'profitFactor':pf,
        'avgWinPct':avg_win,
        'avgLossPct':avg_loss,
        'payoffRatio':payoff,
        'grossProfitPct':gross_profit,
        'grossLossPct':gross_loss,
    }

def evaluate(bars):
    closes=[b['c'] for b in bars];cache={}
    for _,_,f,s,_ in rules():
        cache[f]=cache.get(f) or ema(closes,f);cache[s]=cache.get(s) or ema(closes,s)
    e20=cache[20];e50=cache[50]
    result=[];reg_all={};fail={}
    start=max(120,len(bars)-420)
    for rid,name,f,s,dead in rules():
        vals=[];wins=0;eq=0;peak=0;mdd=0;regs={}
        ef,es=cache[f],cache[s]
        for i in range(start,len(bars)-1):
            sig=direction(ef[i],es[i],dead)
            if not sig:continue
            ret=(bars[i+1]['c']/bars[i]['c']-1)*100*sig
            hit=ret>0;wins+=1 if hit else 0;vals.append(ret);eq+=ret;peak=max(peak,eq);mdd=min(mdd,eq-peak)
            rg=regime(i,bars,e20,e50);x=regs.setdefault(rg,{'n':0,'w':0,'ret':0});x['n']+=1;x['w']+=1 if hit else 0;x['ret']+=ret
            if rid=='CURRENT':
                y=reg_all.setdefault(rg,{'n':0,'w':0,'ret':0});y['n']+=1;y['w']+=1 if hit else 0;y['ret']+=ret
                if not hit:
                    tag='횡보/약추세' if rg=='횡보' else ('급반전' if abs(ret)>=2 else '추세 지속 실패')
                    fail[tag]=fail.get(tag,0)+1
        metrics=performance_metrics(vals)
        result.append({'id':rid,'name':name,'n':len(vals),'win':wins/len(vals)*100 if vals else None,'avg':statistics.mean(vals) if vals else None,'mdd':mdd,**metrics,'regimes':regs})
    return result,reg_all,fail

def live_update(bars,hist):
    # last fully closed 4H candle: public APIs may include an open current candle, so use -2
    if len(bars)<80:return hist,None
    i=len(bars)-2;bar=bars[i];items=hist.get('items',[])
    key=str(bar['t'])
    if any(str(x.get('barTime'))==key for x in items):return hist,items[-1] if items else None
    closes=[b['c'] for b in bars];e20,e50=ema(closes,20),ema(closes,50)
    sig=direction(e20[i],e50[i],.0015)
    prev=items[-1] if items else None
    if prev and prev.get('evaluated') is not True and prev.get('price'):
        d=int(prev.get('signal',0));ret=(bar['c']/prev['price']-1)*100*d if d else 0
        prev['evaluated']=True;prev['outcomePct']=ret;prev['hit']=None if d==0 else ret>0;prev['evaluatedAt']=datetime.now(timezone.utc).isoformat()
    item={'barTime':bar['t'],'at':datetime.fromtimestamp(bar['t']/1000,timezone.utc).isoformat(),'price':bar['c'],'signal':sig,'regime':regime(i,bars,e20,e50),'evaluated':False}
    items=(items+[item])[-500:];hist={'schemaVersion':'2.1','items':items};return hist,item

def main():
    bars,source=fetch_bars();hist=load(HIST,{'schemaVersion':'2.1','items':[]});hist,last=live_update(bars,hist);ev,regs,fail=evaluate(bars)
    live=[x for x in hist.get('items',[]) if x.get('evaluated') and x.get('hit') is not None]
    lw=sum(1 for x in live if x.get('hit'));live_metrics=performance_metrics([x.get('outcomePct') for x in live]);now=datetime.now(timezone.utc).isoformat()
    out={'schemaVersion':'2.1','engineVersion':'strategy-lab-server-2.1','generatedAt':now,'source':source,'bars4h':len(bars),'strategies':ev,'regimes':regs,'failures':sorted([{'name':k,'count':v} for k,v in fail.items()],key=lambda x:x['count'],reverse=True)[:6],'live':{'signals':len(hist.get('items',[])),'evaluated':len(live),'winRate':lw/len(live)*100 if live else None,**live_metrics,'last':last}}
    save(HIST,hist);save(OUT,out)

if __name__=='__main__':main()
