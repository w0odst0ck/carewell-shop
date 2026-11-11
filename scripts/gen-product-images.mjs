// 扫描 public/products/ 下的产品图，生成清单供构建期使用。
// 目的：图片由用户随时补齐，补图后无需改任何代码，重新构建即生效。
import { readdir, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "public", "products");
const OUT_DIR = path.join(ROOT, "src", "data", "generated");
const OUT_FILE = path.join(OUT_DIR, "product-images.json");

const ALLOWED = new Set([".webp", ".jpg", ".jpeg", ".png", ".avif"]);

function toKey(filename) {
  // A.webp → A ；A-2.webp → A（第二张归同一大类）
  const base = filename.replace(/\.[^.]+$/, "");
  return base.split("-")[0].toUpperCase();
}

async function main() {
  let files = [];
  if (existsSync(SRC_DIR)) {
    files = await readdir(SRC_DIR);
  }

  const byCategory = {};
  for (const f of files.sort()) {
    const ext = path.extname(f).toLowerCase();
    if (!ALLOWED.has(ext)) continue;
    const key = toKey(f);
    if (!/^[A-Z]$/.test(key)) continue; // 只认 A–L 单字母大类
    if (!byCategory[key]) byCategory[key] = [];
    byCategory[key].push(`/products/${f}`);
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(
    OUT_FILE,
    JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), byCategory }, null, 1),
    "utf8"
  );

  const total = Object.values(byCategory).reduce((n, a) => n + a.length, 0);
  const covered = Object.keys(byCategory).length;
  console.log(`✓ 产品图清单：${total} 张，覆盖 ${covered}/12 大类 → ${path.relative(ROOT, OUT_FILE)}`);
  if (covered < 12) {
    const missing = "ABCDEFGHIJKL".split("").filter((k) => !byCategory[k]);
    console.log(`  待补：${missing.join(" ")}`);
  }
}

main().catch((e) => {
  console.error("产品图清单生成失败:", e);
  process.exit(1);
});