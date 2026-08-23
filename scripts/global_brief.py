#!/usr/bin/env python3
import json, re, time, html, urllib.parse
from datetime import datetime, timezone, timedelta
from pathlib import Path

import feedparser
try:
    from deep_translator import GoogleTranslator
except Exception:
    GoogleTranslator = None

KST = timezone(timedelta(hours=9))
NOW = datetime.now(timezone.utc)
OUT = Path('data/daily')
OUT.mkdir(parents=True, exist_ok=True)

FEEDS = [
    ('Google News · Bitcoin', 'https://news.google.com/rss/search?q=' + urllib.parse.quote('Bitcoin OR BTC ETF') + '&hl=en-US&gl=US&ceid=US:en', 'news'),
    ('Google News · Macro', 'https://news.google.com/rss/search?q=' + urllib.parse.quote('Federal Reserve yields dollar risk assets markets') + '&hl=en-US&gl=US&ceid=US:en', 'macro'),
    ('Google News · Crypto', 'https://news.google.com/rss/search?q=' + urllib.parse.quote('crypto market ethereum bitcoin regulation') + '&hl=en-US&gl=US&ceid=US:en', 'crypto'),
    ('Cointelegraph', 'https://cointelegraph.com/rss', 'crypto'),
    ('Decrypt', 'https://decrypt.co/feed', 'crypto'),
    ('Reddit · BitcoinMarkets', 'https://www.reddit.com/r/BitcoinMarkets/.rss', 'community'),
]

BULL = ['inflow','approval','approve','rally','surge','breakout','record high','adoption','buy','bull','easing','rate cut','cuts rates','liquidity','stimulus']
BEAR = ['outflow','hack','selloff','crash','drop','plunge','ban','lawsuit','liquidation','recession','inflation','war','tariff','risk-off','rate hike','higher yields']
RISK = ['war','iran','israel','russia','ukraine','tariff','inflation','fed','yield','hack','liquidation','regulation','sec','recession','oil']


def clean(s):
    s = html.unescape(re.sub('<[^>]+>', ' ', s or ''))
    return re.sub(r'\s+', ' ', s).strip()


def published(entry):
    st = getattr(entry, 'published_parsed', None) or getattr(entry, 'updated_parsed', None)
    if not st:
        return NOW
    try:
        return datetime.fromtimestamp(time.mktime(st), timezone.utc)
    except Exception:
        return NOW


def category_for(text, default='news'):
    t = text.lower()
    if any(k in t for k in ['fed','yield','dollar','inflation','rate ','treasury','oil','tariff']): return '거시경제'
    if any(k in t for k in ['etf','bitcoin','btc','ethereum','crypto','stablecoin']): return '암호화폐'
    if any(k in t for k in ['sec','regulation','law','policy','ban']): return '정책/규제'
    if default == 'community': return '커뮤니티'
    return '글로벌시장'


def impact_for(text):
    t = text.lower()
    b = sum(k in t for k in BULL)
    d = sum(k in t for k in BEAR)
    if b > d: return '긍정'
    if d > b: return '부정'
    return '중립'


def translate_many(texts):
    if not GoogleTranslator:
        return texts
    out = []
    tr = GoogleTranslator(source='auto', target='ko')
    for t in texts:
        try:
            out.append(clean(tr.translate(t)) or t)
            time.sleep(0.12)
        except Exception:
            out.append(t)
    return out


def collect():
    rows = []
    seen = set()
    for source, url, typ in FEEDS:
        try:
            f = feedparser.parse(url, request_headers={'User-Agent':'Mozilla/5.0 BTC-Hedge-Brief/1.0'})
            for e in f.entries[:20]:
                title = clean(getattr(e, 'title', ''))
                link = getattr(e, 'link', '')
                if not title or not link: continue
                key = re.sub(r'[^a-z0-9가-힣]+','',title.lower())[:90]
                if key in seen: continue
                seen.add(key)
                ts = published(e)
                if NOW - ts > timedelta(hours=72): continue
                rows.append({'source':source,'url':link,'title':title,'publishedAt':ts.isoformat(),'type':typ})
        except Exception:
            pass
    rows.sort(key=lambda x:x['publishedAt'], reverse=True)
    return rows[:60]


def score_rows(rows):
    score = 50.0
    risk_hits = 0
    for r in rows[:30]:
        t = r['title'].lower()
        score += 1.8 * sum(k in t for k in BULL)
        score -= 1.8 * sum(k in t for k in BEAR)
        risk_hits += sum(k in t for k in RISK)
    score = max(15, min(85, round(score)))
    risk = 'high' if risk_hits >= 11 else 'medium' if risk_hits >= 5 else 'low'
    return score, risk


def main():
    rows = collect()
    if not rows:
        raise SystemExit('No briefing items collected; keeping previous files.')
    chosen = rows[:12]
    kos = translate_many([r['title'] for r in chosen])
    briefs = []
    for r, ko in zip(chosen, kos):
        briefs.append({
            'titleKo': ko,
            'titleOriginal': r['title'],
            'source': r['source'],
            'url': r['url'],
            'publishedAt': r['publishedAt'],
            'category': category_for(r['title'], r['type']),
            'impact': impact_for(r['title'])
        })
    score, risk = score_rows(rows)
    pos = [b for b in briefs if b['impact']=='긍정']
    neg = [b for b in briefs if b['impact']=='부정']
    neutral = [b for b in briefs if b['impact']=='중립']
    top = briefs[:5]
    consensus = [b['titleKo'] for b in top]
    risks = [b['titleKo'] for b in neg[:4]] or ['헤드라인 기반 리스크 신호가 뚜렷하지 않습니다.']
    headline = ('위험선호 우위' if score >= 60 else '위험회피 우위' if score <= 40 else '혼조/중립') + f' · 무료 공개소스 {len(rows)}건을 자동 집계한 헤드라인 기반 브리핑입니다.'
    gen = datetime.now(KST).isoformat(timespec='seconds')
    source_objs=[]
    used=set()
    for b in briefs:
        if b['source'] in used: continue
        used.add(b['source']); source_objs.append({'name':b['source'],'url':b['url']})
    global_doc={
        'schemaVersion':'1.0','generatedAt':gen,'method':'free-rss-headline-aggregation',
        'marketScore':score,'riskLevel':risk,'headline':headline,
        'coverage':{'items':len(rows),'positive':len(pos),'negative':len(neg),'neutral':len(neutral)},
        'expertBriefings':briefs,'sources':source_objs,
        'note':'무료 공개 RSS/뉴스/커뮤니티 헤드라인을 자동 수집하고 가능한 경우 한국어로 번역합니다. 투자판단의 단독 근거로 사용하지 마세요.'
    }
    brief_doc={
        'schemaVersion':'1.1','date':datetime.now(KST).date().isoformat(),'generatedAt':gen,
        'externalScore':score,'riskLevel':risk,'headline':headline,
        'globalConsensus':consensus,
        'risks':risks,
        'events':['연준·금리·달러 관련 최신 헤드라인 확인','BTC 현물 ETF 자금흐름 및 규제 뉴스 확인','주요 지정학·유가 충격 여부 확인'],
        'sources':source_objs,
        'coverage':global_doc['coverage']
    }
    (OUT/'global.json').write_text(json.dumps(global_doc,ensure_ascii=False,indent=2),encoding='utf-8')
    (OUT/'brief.json').write_text(json.dumps(brief_doc,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'generated score={score} risk={risk} items={len(rows)}')

if __name__=='__main__':
    main()
