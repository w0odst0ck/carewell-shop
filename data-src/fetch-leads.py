#!/usr/bin/env python3
"""全球医疗耗材招标线索采集（公开数据）

数据源：TED — Tenders Electronic Daily（欧盟官方采购公告库）
  ✅ 官方 API，免 key，公开合法
  ⚠️ 覆盖范围：欧盟 + 部分国际组织，非全球全覆盖

分类口径：CPV 码（欧盟统一采购词汇）
  只取与一次性医疗防护/耗材强相关的码，不做全量

用法：
    python3 data-src/fetch-leads.py [--days 90] [--per-cpv 8]

产物：src/data/generated/leads.json
"""

import json
import os
import subprocess
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "src" / "data" / "generated"
PROXY = os.environ.get("https_proxy") or os.environ.get("HTTPS_PROXY") or ""

# ── CPV 码 → 品类含义（只取强相关）────────────────────────
# 只保留与一次性无纺布防护/耗材强相关的码。
# 实测剔除（内容跑偏）：
#   33141500 血液学耗材 → 抓到人血制品
#   33141600 收集运输袋 → 抓到实验室试剂
#   33771000 卫生纸品   → 抓到新生儿护理用品
#   33190000 其他医疗器械 → 过于宽泛，混入设备类
CPV = {
    "33141000": "一次性医疗耗材（总类）",
    "33141100": "敷料 / 缝合 / 结扎材料",
    "33141112": "创可贴 / 敷贴",
    "33141420": "外科手套",
    "18424300": "一次性手套",
    "39518000": "医院布草",
}

API = "https://api.ted.europa.eu/v3/notices/search"
FIELDS = [
    "publication-number",
    "notice-title",
    "buyer-name",
    "publication-date",
    "place-of-performance",
    "deadline-receipt-tender-date-lot",
]


def post(payload, timeout=45):
    args = ["curl", "-s", "--max-time", str(timeout), "-X", "POST", API,
            "-H", "Content-Type: application/json", "-d", json.dumps(payload)]
    if PROXY:
        args = ["curl", "-s", "--max-time", str(timeout), "-x", PROXY,
                "-X", "POST", API, "-H", "Content-Type: application/json",
                "-d", json.dumps(payload)]
    r = subprocess.run(args, capture_output=True, text=True, timeout=timeout + 10)
    return json.loads(r.stdout)


def pick_title(t):
    """notice-title 是多语种字典，优先英文"""
    if isinstance(t, dict):
        for k in ("eng", "en", "ENG"):
            if k in t:
                v = t[k]
                return v[0] if isinstance(v, list) else v
        for v in t.values():
            return v[0] if isinstance(v, list) else v
    return str(t or "")


def pick_buyer(b):
    if isinstance(b, dict):
        for k in ("eng", "en", "ENG"):
            if k in b:
                v = b[k]
                return v[0] if isinstance(v, list) else v
        for v in b.values():
            return v[0] if isinstance(v, list) else v
    return str(b or "")


def main():
    days = 90
    per_cpv = 8
    if "--days" in sys.argv:
        days = int(sys.argv[sys.argv.index("--days") + 1])
    if "--per-cpv" in sys.argv:
        per_cpv = int(sys.argv[sys.argv.index("--per-cpv") + 1])

    since = (datetime.now() - timedelta(days=days)).strftime("%Y%m%d")
    print(f"时间范围: 近 {days} 天（>= {since}）｜每品类 {per_cpv} 条\n")

    all_notices = {}
    stats = {}

    for cpv, label in CPV.items():
        query = f'classification-cpv={cpv} AND publication-date>={since}'
        try:
            d = post({"query": query, "fields": FIELDS, "limit": per_cpv, "page": 1})
        except Exception as e:
            print(f"  ✗ {cpv} {label[:16]:18s} {str(e)[:40]}")
            continue

        total = d.get("totalNoticeCount") or 0
        notices = d.get("notices") or []
        stats[cpv] = {"label": label, "total": total, "fetched": len(notices)}
        print(f"  ✓ {cpv} {label[:16]:18s} 总 {total:>6,}  取 {len(notices)}")

        for n in notices:
            no = n.get("publication-number")
            if not no:
                continue
            all_notices[no] = {
                "id": no,
                "title": pick_title(n.get("notice-title"))[:200],
                "buyer": pick_buyer(n.get("buyer-name"))[:150],
                "date": (n.get("publication-date") or "")[:10],
                "place": n.get("place-of-performance") or [],
                "cpv": cpv,
                "label": label,
                "url": f"https://ted.europa.eu/en/notice/{no}",
            }
        time.sleep(1.2)

    items = sorted(all_notices.values(), key=lambda x: x["date"], reverse=True)

    payload = {
        "generatedAt": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "source": "TED — Tenders Electronic Daily（欧盟官方采购公告）",
        "sourceUrl": "https://ted.europa.eu",
        "coverage": "欧盟成员国及部分国际组织。其他区域（海湾、东南亚、非洲）需另行接入当地采购平台。",
        "license": "公开数据，欧盟官方发布",
        "windowDays": days,
        "cpvStats": stats,
        "count": len(items),
        "items": items,
    }

    OUT.mkdir(parents=True, exist_ok=True)
    f = OUT / "leads.json"
    f.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\n✅ {f}  {f.stat().st_size:,}B  共 {len(items)} 条去重线索")


if __name__ == "__main__":
    main()