import json, urllib.request, urllib.parse, datetime, os, time

SYMBOLS = [
    "AAPL","NVDA","MSFT","TSLA","AMZN","GOOGL","META",
    "005930.KS","000660.KS","068270.KS","035420.KS","051910.KS"
]
OUT = "data/stocks"
os.makedirs(OUT, exist_ok=True)

def get_json(url):
    req=urllib.request.Request(url,headers={
        "User-Agent":"Mozilla/5.0 (GitHub Actions Stock Relay)",
        "Accept":"application/json,text/plain,*/*"
    })
    with urllib.request.urlopen(req,timeout=25) as r:
        return json.loads(r.read().decode("utf-8"))

def rows(result):
    q=result["chart"]["result"][0]
    ts=q.get("timestamp") or []
    quote=(q.get("indicators",{}).get("quote") or [{}])[0]
    adj=(q.get("indicators",{}).get("adjclose") or [{}])[0].get("adjclose") or quote.get("close") or []
    out=[]
    for i,t in enumerate(ts):
        try:
            o=quote["open"][i]; h=quote["high"][i]; l=quote["low"][i]
            c=adj[i] if i < len(adj) else quote["close"][i]
            v=(quote.get("volume") or [0]*len(ts))[i] or 0
            if None not in (o,h,l,c):
                out.append([int(t)*1000,float(o),float(h),float(l),float(c),float(v)])
        except Exception:
            pass
    return out

def aggregate(data,n=4):
    out=[]
    for i in range(0,len(data),n):
        g=data[i:i+n]
        if len(g)<2: continue
        out.append([g[0][0],g[0][1],max(x[2] for x in g),min(x[3] for x in g),g[-1][4],sum(x[5] for x in g)])
    return out

def fetch(symbol,range_,interval):
    s=urllib.parse.quote(symbol,safe="")
    urls=[
      f"https://query1.finance.yahoo.com/v8/finance/chart/{s}?range={range_}&interval={interval}&includePrePost=false&events=div%2Csplits",
      f"https://query2.finance.yahoo.com/v8/finance/chart/{s}?range={range_}&interval={interval}&includePrePost=false&events=div%2Csplits"
    ]
    last=None
    for url in urls:
        try:
            j=get_json(url)
            if j.get("chart",{}).get("result"): return j
        except Exception as e: last=e
    raise RuntimeError(last or "Yahoo result 없음")

for symbol in SYMBOLS:
    try:
        j15=fetch(symbol,"5d","15m")
        j1=fetch(symbol,"180d","1h")
        jd=fetch(symbol,"2y","1d")
        jw=fetch(symbol,"10y","1wk")
        m15=rows(j15); h1=rows(j1); d1=rows(jd); w1=rows(jw); h4=aggregate(h1,4)
        meta=j1["chart"]["result"][0].get("meta",{})
        price=meta.get("regularMarketPrice") or (h1[-1][4] if h1 else None)
        prev=meta.get("chartPreviousClose") or meta.get("previousClose") or price
        change=((price/prev)-1)*100 if price and prev else 0
        payload={"symbol":symbol,"generatedAt":datetime.datetime.now(datetime.timezone.utc).isoformat(),
                 "price":price,"change":change,"m15":m15,"h1":h1,"h4":h4,"d1":d1,"w1":w1,"source":"Yahoo Finance","schemaVersion":"7.5"}
        with open(os.path.join(OUT,symbol+".json"),"w",encoding="utf-8") as f:
            json.dump(payload,f,separators=(",",":"),ensure_ascii=False)
        print("OK",symbol)
    except Exception as e:
        print("FAIL",symbol,e)
    time.sleep(0.5)
