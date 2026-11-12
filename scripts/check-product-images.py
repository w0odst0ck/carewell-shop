#!/usr/bin/env python3
"""产品图自检：检查 public/products/ 下的图是否符合规格。

用法：
    python3 scripts/check-product-images.py

检查项：
    1. 命名是否合法（A–L 单字母，或 A-1 形式）
    2. 比例是否 1:1（容差 2%）
    3. 尺寸是否 >= 1200px
    4. 四角是否纯白（#FFFFFF，容差阈值可调）
    5. 文件体积是否 < 200KB
    6. 12 大类覆盖情况
退出码：0 = 全部通过；1 = 有失败项
"""

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit("需要 Pillow：pip install pillow")

ROOT = Path(__file__).resolve().parent.parent
IMG_DIR = ROOT / "public" / "products"

ALLOWED_EXT = {".webp", ".jpg", ".jpeg", ".png", ".avif"}
CATEGORIES = "ABCDEFGHIJKL"
MIN_SIZE = 1200
MAX_BYTES = 200 * 1024
RATIO_TOL = 0.02

# 白底判定：RGB 三通道都 >= WHITE_MIN 视为白
WHITE_MIN = 246
# 采样四角的小块（每角 6x6 像素）取平均，避免单点噪点误判
CORNER_PX = 6


def is_white_corner(im: Image.Image) -> tuple[bool, list[tuple[int, int, int]]]:
    """检查四角是否纯白，返回 (是否全部通过, 四角平均色)"""
    im = im.convert("RGB")
    w, h = im.size
    boxes = [
        (0, 0, CORNER_PX, CORNER_PX),
        (w - CORNER_PX, 0, w, CORNER_PX),
        (0, h - CORNER_PX, CORNER_PX, h),
        (w - CORNER_PX, h - CORNER_PX, w, h),
    ]
    avgs = []
    for box in boxes:
        crop = im.crop(box)
        px = list(crop.convert("RGB").tobytes())
        n = len(px) // 3
        avgs.append(
            tuple(sum(px[i::3]) // n for i in range(3))
        )

    ok = all(all(ch >= WHITE_MIN for ch in a) for a in avgs)
    return ok, avgs


def main() -> int:
    if not IMG_DIR.exists():
        print(f"目录不存在：{IMG_DIR.relative_to(ROOT)}")
        return 1

    files = sorted(
        f for f in IMG_DIR.iterdir() if f.is_file() and f.suffix.lower() in ALLOWED_EXT
    )

    if not files:
        print("未找到产品图（目录中只有说明文件属正常）")
        print(f"待补：{' '.join(CATEGORIES)}")
        return 0

    print(f"检查 {len(files)} 个文件\n")

    fails = []
    covered = set()

    for f in files:
        stem = f.stem
        key = stem.split("-")[0].upper()
        problems = []

        # 1. 命名
        if not (len(key) == 1 and key in CATEGORIES):
            problems.append(f"命名不合法（应为 A–L）")
        else:
            covered.add(key)

        try:
            size_bytes = f.stat().st_size
            im = Image.open(f)
            w, h = im.size
        except Exception as e:
            print(f"✗ {f.name:24s} 无法读取：{e}")
            fails.append(f.name)
            continue

        # 2. 比例
        ratio = w / h if h else 0
        if abs(ratio - 1.0) > RATIO_TOL:
            problems.append(f"非 1:1（{w}×{h}）")

        # 3. 尺寸
        if min(w, h) < MIN_SIZE:
            problems.append(f"尺寸不足 {min(w, h)}px < {MIN_SIZE}px")

        # 4. 白底
        white_ok, avgs = is_white_corner(im)
        if not white_ok:
            worst = min(avgs, key=lambda a: sum(a))
            problems.append(f"非纯白底（最暗角 RGB{worst}）")

        # 5. 体积
        kb = size_bytes / 1024
        if size_bytes > MAX_BYTES:
            problems.append(f"体积 {kb:.0f}KB > 200KB")

        if problems:
            print(f"✗ {f.name:24s} {w}×{h} {kb:5.0f}KB")
            for p in problems:
                print(f"    · {p}")
            fails.append(f.name)
        else:
            print(f"✓ {f.name:24s} {w}×{h} {kb:5.0f}KB")

    print()
    missing = [c for c in CATEGORIES if c not in covered]
    if missing:
        print(f"待补大类（{len(missing)}）：{' '.join(missing)}")
    else:
        print("12 大类已全覆盖")

    if fails:
        print(f"\n失败 {len(fails)} 项：{' '.join(fails)}")
        return 1

    print("\n全部通过")
    return 0


if __name__ == "__main__":
    sys.exit(main())