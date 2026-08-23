#!/usr/bin/env python3
"""gen-jsonld.py — 从 products.csv 生成三语 JSON-LD 商品结构化数据

背景：index*.html 的 JSON-LD 商品块曾是手写死数据，图片/价格与 products.csv 漂移
（08-23 ocr 审出 high：隔离衣/鞋套/手套用了帽子占位图）。本脚本根治：
以 products.csv 为唯一真相源，生成 active 商品（前 5 个）的三语 JSON-LD 片段，
替换各语言首页中 `<!-- JSON-LD:products:start -->` 与 `<!-- JSON-LD:products:end -->` 标记块。

用法：
  python3 scripts/gen-jsonld.py            # 就地替换 index*.html 的标记块
  python3 scripts/gen-jsonld.py --check    # 仅校验：生成结果与文件一致？exit 1=不一致
  python3 scripts/gen-jsonld.py --dry-run  # 打印生成的 JSON-LD 片段，不写文件

依赖：仅标准库（csv / json / pathlib / re / sys）。
集成：GitHub Actions products.yml 在 CSV 变更时运行本脚本并提交（防死循环：
本脚本只改 *.html，不触发 products.csv/images 路径的 workflow）。
"""
import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSV_PATH = ROOT / "products.csv"
PAGES = {
    "en": ROOT / "index.html",
    "zh-CN": ROOT / "index-cn.html",
    "ar": ROOT / "index-ar.html",
}
MAX_PRODUCTS = 5
START = "<!-- JSON-LD:products:start -->"
END = "<!-- JSON-LD:products:end -->"
BASE_URL = "https://mojin.store"


def load_products():
    """读 CSV → active 商品列表（保持 CSV 顺序）。"""
    with open(CSV_PATH, encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))
    products = []
    for row in rows:
        status = (row.get("status") or "").strip().lower() or "active"
        if status != "active":
            continue
        products.append(row)
        if len(products) >= MAX_PRODUCTS:
            break
    return products


def first_desc(raw):
    """CSV desc 取第一段（| 分隔），去空白。"""
    if not raw:
        return ""
    return raw.split("|")[0].strip()


def product_ld(p, lang):
    """单商品 JSON-LD 字典。lang: 'en' | 'zh-CN' | 'ar'。"""
    sku = (p["sku"] or "").strip()
    name = (p.get(f"name_{LANG_FIELD[lang]}") or p.get("name_en") or sku).strip()
    desc = (p.get(f"desc_{LANG_FIELD[lang]}") or p.get("desc_en") or "").strip()
    img = (p.get("image") or "").strip()
    price = p.get("price") or "0"
    try:
        price_num = float(price)
    except ValueError:
        price_num = 0.0
    image_url = f"{BASE_URL}/{img}" if img.startswith("images/") else img
    return {
        "@type": "Product",
        "@id": f"{BASE_URL}/#product-mj-{sku}",
        "name": name,
        "sku": f"MJ-{sku.upper()}",
        "image": [image_url],
        "description": first_desc(desc),
        "brand": {"@type": "Brand", "name": "Mojin"},
        "inLanguage": lang,
        "offers": {
            "@type": "Offer",
            "url": f"{BASE_URL}/product.html#{sku}",
            "priceCurrency": "SAR",
            "price": price_num,
            "availability": "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition",
        },
    }


LANG_FIELD = {"en": "en", "zh-CN": "cn", "ar": "ar"}


def build_fragment(products, lang):
    """生成商品独立 JSON-LD script 块（含 script 标签）。
    商品与 Organization 分两个 ld+json script（Google 支持合并解析），
    HTML 注释标记放在 script 外（JSON 内不允许注释）。"""
    block = {
        "@context": "https://schema.org",
        "@graph": [product_ld(p, lang) for p in products],
    }
    pretty = json.dumps(block, ensure_ascii=False, indent=2)
    indented = "\n".join("  " + line if line else line for line in pretty.splitlines())
    return f'<script type="application/ld+json">\n{indented}\n  </script>'


def replace_in_page(page, fragment):
    """替换页面标记块之间的内容；标记缺失返回 None。"""
    text = page.read_text(encoding="utf-8")
    if START not in text or END not in text:
        return None
    pattern = re.compile(re.escape(START) + r".*?" + re.escape(END), re.S)
    replacement = f"{START}\n{fragment}\n{END}"
    new_text, n = pattern.subn(replacement, text, count=1)
    return new_text if n == 1 else None


def main():
    args = set(sys.argv[1:])
    check = "--check" in args
    dry = "--dry-run" in args
    if check and dry:
        print("--check 与 --dry-run 不能同时使用", file=sys.stderr)
        return 2

    products = load_products()
    if not products:
        print("products.csv 无 active 商品", file=sys.stderr)
        return 1

    all_ok = True
    for lang, page in PAGES.items():
        fragment = build_fragment(products, lang)
        if dry:
            print(f"===== {page.name} ({lang}) =====")
            print(fragment)
            continue
        new_text = replace_in_page(page, fragment)
        if new_text is None:
            print(f"✗ {page.name}: 未找到 JSON-LD 标记块，请先包裹现有商品 JSON-LD", file=sys.stderr)
            all_ok = False
            continue
        if check:
            if new_text != page.read_text(encoding="utf-8"):
                print(f"✗ {page.name}: 与生成结果不一致（需重新生成）")
                all_ok = False
            else:
                print(f"✓ {page.name}: 一致")
        else:
            page.write_text(new_text, encoding="utf-8")
            print(f"✓ {page.name}: 已更新（{len(products)} 个商品）")

    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
