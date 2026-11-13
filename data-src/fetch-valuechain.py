#!/usr/bin/env python3
"""商品价值链数据采集 — 价格波动监控

设计原则（用户 2026-11-13 确认）：
  - 目的是【价格波动监控】，不是成本核算
  - 只做趋势，不做精确计算
  - 近似即可，只采公开数据

数据源（全部公开权威）：
  1. FRED        原油 / 树脂 PPI / 化工 PPI        → 日 / 月
  2. SCFI        上海航运交易所运价指数              → 周
  3. UN Comtrade 沙特进口额 / 量 / 单价              → 年

用法：
    python3 data-src/fetch-valuechain.py [--only fred|scfi|trade]

产物：src/data/generated/*.json
注意：Comtrade 必须串行 + 间隔 5s，否则 429
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "src" / "data" / "generated"
UA = "MojinResearch/1.0 (public data research)"

# ── 采集口径 ────────────────────────────────────────────────
HS4 = {
    "6210": "服装类（隔离衣/手术衣/防护服）",
    "6307": "纺织制成品（口罩等）",
    "4015": "橡胶手套",
    "3006": "医用敷料/急救包",
}
HS6 = {
    "621010": "隔离衣/手术衣",
    "630790": "口罩类",
    "401519": "橡胶手套",
}
YEARS = [2019, 2020, 2021, 2022, 2023, 2024]
REPORTER = {"682": "沙特", "784": "阿联酋"}

FRED_SERIES = {
    "DCOILBRENTEU": ("布伦特原油", "USD/桶", "日"),
    "DCOILWTICO": ("WTI 原油", "USD/桶", "日"),
    "WPU0662": ("热塑性树脂 PPI", "指数", "月"),
    "WPU061": ("化工原料 PPI", "指数", "月"),
    "PCU325211325211": ("塑料制品 PPI", "指数", "月"),
}


# WSL 下 Python urllib 不自动读 https_proxy，必须显式装 ProxyHandler
_PROXY = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy") or ""
if _PROXY:
    _opener = urllib.request.build_opener(
        urllib.request.ProxyHandler({"http": _PROXY, "https": _PROXY})
    )
    print(f"  (代理: {_PROXY})")
else:
    _opener = urllib.request.build_opener()


def fetch(url, timeout=45):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with _opener.open(req, timeout=timeout) as r:
        return r.read()


def write(name, payload):
    OUT.mkdir(parents=True, exist_ok=True)
    p = OUT / name
    p.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"  ✓ {name}  {p.stat().st_size:,}B")


# ── 1. FRED 原料价格 ────────────────────────────────────────
def pull_fred():
    print("[1/3] FRED 原料价格")
    series = {}
    for code, (name, unit, freq) in FRED_SERIES.items():
        url = f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={code}"
        try:
            raw = fetch(url).decode("utf-8", errors="ignore")
        except Exception as e:
            print(f"  ✗ {code}: {str(e)[:50]}")
            continue

        rows = []
        for line in raw.strip().splitlines()[1:]:
            parts = line.split(",")
            if len(parts) < 2:
                continue
            d, v = parts[0].strip(), parts[1].strip()
            if not v or v == ".":
                continue
            try:
                rows.append([d, float(v)])
            except ValueError:
                continue

        if not rows:
            print(f"  ✗ {code}: 无有效数据")
            continue

        series[code] = {
            "name": name,
            "unit": unit,
            "freq": freq,
            "source": "FRED (U.S. Federal Reserve / BLS)",
            "latest": rows[-1],
            "count": len(rows),
            "data": rows,
        }
        print(f"  ✓ {name:16s} {len(rows):6,} 条  {rows[0][0]} → {rows[-1][0]} = {rows[-1][1]:.2f}")

    write("valuechain-prices.json", {
        "generatedAt": time.strftime("%Y-%m-%d %H:%M"),
        "purpose": "价格波动监控（非成本核算）",
        "series": series,
    })


# ── 2. SCFI 运价指数 ────────────────────────────────────────
def pull_scfi():
    print("[2/3] SCFI 运价指数")
    url = "https://www.sse.net.cn/index/getIndexData?indexType=scfi"
    try:
        d = json.loads(fetch(url).decode("utf-8", errors="ignore"))
    except Exception as e:
        print(f"  ✗ SCFI: {str(e)[:60]}")
        return

    cur, last = d.get("curIndex") or {}, d.get("lastIndex") or {}

    # 航线映射：表格第 8 行「波斯湾 20ft（迪拜）」→ l8
    # ⚠️ 官方未公开字段映射，此对应为人工校准推断，仅作趋势参考
    routes = {
        "综合指数": ("t", "Comprehensive Index"),
        "欧洲20ft": ("l1", "Europe 20ft"),
        "美西40ft": ("l4", "USWC 40ft"),
        "美东40ft": ("l5", "USEC 40ft"),
        "波斯湾20ft": ("l8", "Persian Gulf 20ft (Dubai)"),
    }

    out = {}
    for cn, (code, en) in routes.items():
        if code in cur:
            c, l = cur[code], last.get(code)
            chg = ((c - l) / l * 100) if l else None
            out[cn] = {"en": en, "value": c, "prev": l, "changePct": round(chg, 2) if chg is not None else None}

    write("valuechain-freight.json", {
        "generatedAt": time.strftime("%Y-%m-%d %H:%M"),
        "period": cur.get("mdate"),
        "prevPeriod": last.get("mdate"),
        "source": "上海航运交易所 SCFI（周更）",
        "caveat": "航线与 JSON 字段映射为人工校准推断，仅作趋势参考，非精确报价",
        "routes": out,
    })
    for k, v in out.items():
        print(f"  ✓ {k:12s} {v['value']:>10.2f}  ({v['changePct']:+.1f}%)" if v["changePct"] is not None else f"  ✓ {k} {v['value']}")


# ── 3. Comtrade 贸易趋势 ────────────────────────────────────
def comtrade(reporter, year, hs, partner="0"):
    url = (
        "https://comtradeapi.un.org/public/v1/preview/C/A/HS"
        f"?reporterCode={reporter}&period={year}&cmdCode={hs}"
        f"&flowCode=M&partnerCode={partner}"
    )
    d = json.loads(fetch(url, timeout=60).decode("utf-8", errors="ignore"))
    return d.get("data") or []


def pull_trade():
    print("[3/3] UN Comtrade 沙特进口趋势")
    print("  ⚠️ 串行 + 间隔 5s（防 429），请耐心等待")

    result = {"hs4": {}, "hs6": {}, "years": YEARS}

    # 4 大类 × 6 年
    total = len(HS4) * len(YEARS)
    n = 0
    for hs, name in HS4.items():
        rec = {"name": name, "series": {}}
        for y in YEARS:
            n += 1
            print(f"  [{n}/{total}] HS{hs} {y} …", end=" ", flush=True)
            try:
                rows = comtrade("682", y, hs)
                if rows:
                    r = rows[0]
                    rec["series"][y] = {
                        "value": round(r.get("primaryValue") or 0, 2),
                        "netWgt": round(r.get("netWgt") or 0, 2),
                        "unitPrice": round((r.get("primaryValue") or 0) / r["netWgt"], 4)
                        if r.get("netWgt") else None,
                    }
                    print(f"{rec['series'][y]['value']:,.0f} USD")
                else:
                    print("空")
            except urllib.error.HTTPError as e:
                print(f"HTTP {e.code}")
            except Exception as e:
                print(f"ERR {str(e)[:30]}")
            time.sleep(5)
        result["hs4"][hs] = rec

    # 3 细分品类 × 6 年
    total6 = len(HS6) * len(YEARS)
    n = 0
    for hs, name in HS6.items():
        rec = {"name": name, "series": {}}
        for y in YEARS:
            n += 1
            print(f"  [{n}/{total6}] HS{hs} {y} …", end=" ", flush=True)
            try:
                rows = comtrade("682", y, hs)
                if rows:
                    r = rows[0]
                    rec["series"][y] = {
                        "value": round(r.get("primaryValue") or 0, 2),
                        "netWgt": round(r.get("netWgt") or 0, 2),
                        "unitPrice": round((r.get("primaryValue") or 0) / r["netWgt"], 4)
                        if r.get("netWgt") else None,
                    }
                    print(f"{rec['series'][y]['value']:,.0f} USD")
                else:
                    print("空")
            except urllib.error.HTTPError as e:
                print(f"HTTP {e.code}")
            except Exception as e:
                print(f"ERR {str(e)[:30]}")
            time.sleep(5)
        result["hs6"][hs] = rec

    write("valuechain-trade.json", {
        "generatedAt": time.strftime("%Y-%m-%d %H:%M"),
        "reporter": "沙特 (SAU/682)",
        "source": "UN Comtrade（年度）",
        "flow": "进口 (M)",
        "caveat": "trade data 为各国报关口径，年度发布滞后 6-12 个月",
        **result,
    })


def main():
    only = None
    if "--only" in sys.argv:
        only = sys.argv[sys.argv.index("--only") + 1]

    print(f"输出目录: {OUT}\n")
    if only in (None, "fred"):
        pull_fred()
        print()
    if only in (None, "scfi"):
        pull_scfi()
        print()
    if only in (None, "trade"):
        pull_trade()
    print("\n完成。")


if __name__ == "__main__":
    main()