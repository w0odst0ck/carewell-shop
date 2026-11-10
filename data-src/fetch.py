"""数据采集器 —— 输出到 src/data/generated/，供看板构建时打包"""
import json, subprocess, time, pathlib, sys

OUT = pathlib.Path(__file__).resolve().parent.parent / "src" / "data" / "generated"
OUT.mkdir(parents=True, exist_ok=True)

def curl_json(url, timeout=30, retries=3):
    for i in range(retries):
        try:
            r = subprocess.run(["curl","-s","--max-time",str(timeout),url],
                               capture_output=True, text=True, timeout=timeout+10)
            if not r.stdout.strip():
                time.sleep(3); continue
            return json.loads(r.stdout)
        except Exception:
            time.sleep(3)
    return None

# ---------- 1. 贸易（UN Comtrade）----------
HS = {
  "621010": {"zh":"无纺布服装 · 隔离衣手术衣","en":"Nonwoven apparel, isolation & surgical gowns"},
  "630790": {"zh":"纺织制成品 · 口罩类","en":"Made-up textile articles, masks"},
  "401519": {"zh":"橡胶手套","en":"Rubber gloves"},
}
COUNTRY = {
  "682":"沙特","784":"阿联酋","826":"英国","840":"美国","156":"中国",
  "276":"德国","356":"印度","392":"日本","410":"韩国","458":"马来西亚",
}
ISO = {"682":"SAU","784":"ARE","826":"GBR","840":"USA","156":"CHN",
       "276":"DEU","356":"IND","392":"JPN","410":"KOR","458":"MYS"}

trade = {"period": 2023, "source": "UN Comtrade", "items": {}}
for code, meta in HS.items():
    trade["items"][code] = {"name": meta["zh"], "nameEn": meta["en"], "byCountry": {}}
    for cc, cn in COUNTRY.items():
        d = curl_json(f"https://comtradeapi.un.org/public/v1/preview/C/A/HS"
                      f"?reporterCode={cc}&period=2023&cmdCode={code}&flowCode=M")
        if d:
            recs = d.get("data") or []
            agg = [x for x in recs if x.get("partnerCode") == 0]
            if agg:
                a = agg[0]
                val = a.get("primaryValue") or 0
                wgt = a.get("netWgt") or 0
                trade["items"][code]["byCountry"][cn] = {
                    "iso": ISO[cc],
                    "value": round(val),
                    "netWgt": round(wgt),
                    "unitPrice": round(val / wgt, 2) if wgt else None,
                    "partners": len(recs),
                }
        print(f"[trade] {code} {cn} done", flush=True)
        time.sleep(4)
json.dump(trade, open(OUT/"trade.json","w"), ensure_ascii=False, indent=1)
print("✅ trade.json", flush=True)

# ---------- 2. 全球卫生/医疗/环保/安全 ----------
IND = {
  "SH.XPD.CHEX.GD.ZS": {"zh":"卫生支出占GDP","unit":"%"},
  "SH.MED.BEDS.ZS":    {"zh":"每千人床位","unit":"张"},
  "SH.MED.PHYS.ZS":    {"zh":"每千人医生","unit":"人"},
  "SP.DYN.LE00.IN":    {"zh":"预期寿命","unit":"岁"},
  "EN.ATM.PM25.MC.M3": {"zh":"PM2.5 年均","unit":"μg/m³"},
  "EN.GHG.CO2.MT.CE.AR5": {"zh":"二氧化碳排放","unit":"Mt"},
  "MS.MIL.XPND.GD.ZS": {"zh":"军费占GDP","unit":"%"},
  "SP.POP.TOTL":       {"zh":"总人口","unit":"人"},
}
WBC = ["SAU","ARE","USA","CHN","DEU","IND","JPN","GBR","KOR","MYS"]
wb = {"source": "World Bank", "indicators": {}}
for ind, meta in IND.items():
    wb["indicators"][ind] = {"name": meta["zh"], "unit": meta["unit"], "byCountry": {}}
    for c in WBC:
        d = curl_json(f"https://api.worldbank.org/v2/country/{c}/indicator/{ind}"
                      f"?format=json&per_page=6&date=2019:2025")
        if isinstance(d, list) and len(d) > 1 and d[1]:
            vals = [(x["date"], x["value"]) for x in d[1] if x.get("value") is not None]
            if vals:
                wb["indicators"][ind]["byCountry"][c] = {
                    "year": vals[0][0], "value": round(vals[0][1], 2)
                }
        time.sleep(1.2)
    print(f"[wb] {ind} done", flush=True)
json.dump(wb, open(OUT/"worldbank.json","w"), ensure_ascii=False, indent=1)
print("✅ worldbank.json", flush=True)

# ---------- 3. 商品价格（FRED）----------
SERIES = {
  "DCOILBRENTEU": {"zh":"布伦特原油","unit":"USD/桶","freq":"日"},
  "WPU061":       {"zh":"化工原料 PPI","unit":"指数","freq":"月"},
  "WPU066":       {"zh":"塑料树脂 PPI","unit":"指数","freq":"月"},
  "WPU0911":      {"zh":"纸浆 PPI","unit":"指数","freq":"月"},
  "PCU325211325211": {"zh":"塑料材料制造 PPI","unit":"指数","freq":"月"},
}
prices = {"source": "FRED (St. Louis Fed)", "series": {}}
for sid, meta in SERIES.items():
    r = subprocess.run(["curl","-s","--max-time","30",
                        f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={sid}"],
                       capture_output=True, text=True, timeout=40)
    pts = []
    for line in (r.stdout or "").splitlines()[1:]:
        if "," in line:
            p = line.split(",")
            if len(p) >= 2 and p[1] not in (".", ""):
                try: pts.append([p[0], round(float(p[1]), 3)])
                except ValueError: pass
    prices["series"][sid] = {"name": meta["zh"], "unit": meta["unit"], "freq": meta["freq"], "points": pts}
    print(f"[fred] {sid} {len(pts)} pts", flush=True)
    time.sleep(1)
json.dump(prices, open(OUT/"prices.json","w"), ensure_ascii=False, indent=1)
print("✅ prices.json", flush=True)
print("=== ALL DONE ===")
