#!/usr/bin/env node
/**
 * gen-products.js — 从 products.csv 生成 data/products.js
 *
 * 用法:
 *   node scripts/gen-products.js [输入CSV] [输出JS]
 *   默认: products.csv → data/products.js
 *   示例: node scripts/gen-products.js products.example.csv /tmp/products-test.js
 *
 * 功能:
 *   1. 读取 CSV（UTF-8，兼容 BOM），按表头列名映射字段
 *   2. 逐行校验（SKU 唯一性/格式、三语必填、价格、图片 webp/英文名/存在性）
 *   3. 校验通过则生成 products.js（结构与现有 data/products.js 完全兼容），
 *      并运行 `node --check` 验证语法
 *
 * 只使用 Node.js 内置模块，无外部依赖。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

/* ─────────────────────────── 配置 ─────────────────────────── */

const DEFAULT_CSV = 'products.csv';      // 默认输入（仓库根目录）
const DEFAULT_OUT = path.join('data', 'products.js'); // 默认输出
const IMAGE_DIR = 'images';              // 图片目录（相对 CSV 所在目录）

/* 表头 → 生成器字段映射（列名必须与 products.example.csv 一致） */
const HEADERS = [
  'sku',
  'name_en', 'name_cn', 'name_ar',
  'sub_en', 'sub_cn', 'sub_ar',
  'cat_en', 'cat_cn', 'cat_ar',
  'desc_en', 'desc_cn', 'desc_ar',
  'price', 'old_price', 'unit', 'sale', 'rating', 'reviews',
  'sizes', 'colors', 'image',
  'status',
];

/* status 合法值（缺省/留空 → active；hidden 不输出但数据保留） */
const STATUS_VALUES = ['active', 'hidden'];

/** 归一化 status：空/缺省 → active */
function normalizeStatus(v) {
  return String(v || '').trim().toLowerCase() || 'active';
}

/* 必填列（缺失表头直接报错） */
const REQUIRED_HEADERS = [
  'sku',
  'name_en', 'name_cn', 'name_ar',
  'desc_en', 'desc_cn', 'desc_ar',
  'price', 'image',
];

/* 可选字段的默认值（rating/reviews 可选带默认值） */
const DEFAULTS = { rating: 4.5, reviews: 0 };

/* ─────────────────────── CSV 解析（RFC4180 简化） ─────────────────────── */

/**
 * 解析 CSV 文本为二维数组。
 * 支持: BOM、双引号字段、字段内逗号/换行、"" 转义引号、\r\n 与 \n 行尾。
 * @param {string} text
 * @returns {string[][]}
 */
function parseCsv(text) {
  // 去除 BOM
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  // 统一行尾，避免 \r\n 拆出多余空列
  text = text.replace(/\r\n/g, '\n');

  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const n = text.length;

  while (i < n) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        // "" 是转义引号
        if (text[i + 1] === '"') { field += '"'; i += 2; }
        else { inQuotes = false; i++; }
      } else {
        field += ch; i++;
      }
    } else {
      if (ch === '"' && field === '') {
        inQuotes = true; i++;
      } else if (ch === ',') {
        row.push(field); field = ''; i++;
      } else if (ch === '\n') {
        row.push(field); field = '';
        rows.push(row); row = [];
        i++;
      } else {
        field += ch; i++;
      }
    }
  }
  // 收尾：最后一个字段/行
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // 丢弃完全空的行（末尾空行等）
  return rows.filter(r => !(r.length === 1 && r[0].trim() === ''));
}

/* ─────────────────────────── 工具函数 ─────────────────────────── */

/** 转义 HTML 特殊字符，防止 CSV 文本被当作富文本注入 */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** desc 按 | 分段，每段生成一个 <h4> 小节（任务要求：生成 <h4> 段） */
function buildDesc(cell) {
  return String(cell)
    .split('|')
    .map(s => s.trim())
    .filter(s => s !== '')
    .map(s => `<h4>${escapeHtml(s)}</h4>`)
    .join('');
}

/** 逗号分隔列表 → 数组（sizes/colors），去空白、去空项 */
function parseList(cell) {
  return String(cell)
    .split(',')
    .map(s => s.trim())
    .filter(s => s !== '');
}

/** 数字解析：空 → null；非法 → NaN 由调用方判错 */
function parseNum(cell) {
  if (cell === undefined || String(cell).trim() === '') return null;
  const v = Number(String(cell).trim());
  return Number.isFinite(v) ? v : NaN;
}

/**
 * 解析 image 字段。
 * 支持 'images/xxx.webp' 或 'xxx.webp' 两种写法，
 * 统一返回存储值 'images/xxx.webp' 与规范化文件名。
 * @returns {{store: string, filename: string}|null}
 */
function parseImage(cell) {
  if (cell === undefined || String(cell).trim() === '') return null;
  // 统一分隔符（兼容 Windows 反斜杠），取最后一段为文件名
  const norm = String(cell).trim().replace(/\\/g, '/');
  const filename = norm.split('/').pop();
  return { store: `${IMAGE_DIR}/${filename}`, filename };
}

/* ─────────────────────────── 校验 ─────────────────────────── */

/**
 * 校验单个数据行，错误追加到 errors。
 * @param {Object<string,string>} row  列名 → 原始值
 * @param {number} lineNo              文件行号（含表头，第 1 行为表头）
 * @param {Set<string>} seenSku        已见 SKU 集合
 * @param {string} csvDir              输入 CSV 所在目录（图片存在性检查基准：CSV 与 images/ 同根存放）
 * @param {string[]} errors
 */
function validateRow(row, lineNo, seenSku, csvDir, errors) {
  const err = msg => errors.push(`行 ${lineNo}: ${msg}`);
  const sku = String(row.sku || '').trim();

  /* ── SKU ── */
  if (!sku) { err('SKU 不能为空'); }
  else {
    if (!/^[a-z0-9-]+$/.test(sku)) {
      err(`SKU '${sku}' 只允许小写字母、数字和连字符（当前: '${sku}'）`);
    }
    if (seenSku.has(sku)) { err(`SKU '${sku}' 重复`); }
    seenSku.add(sku);
  }

  /* ── 三语 name / desc 必填 ── */
  for (const f of ['name_en', 'name_cn', 'name_ar', 'desc_en', 'desc_cn', 'desc_ar']) {
    if (!String(row[f] || '').trim()) {
      err(sku ? `SKU '${sku}' 字段 ${f} 不能为空` : `字段 ${f} 不能为空（SKU 未填）`);
    }
  }

  /* ── price 必填且 > 0 ── */
  const price = parseNum(row.price);
  if (price === null) { err(`SKU '${sku}' price 不能为空`); }
  else if (Number.isNaN(price) || price <= 0) { err(`SKU '${sku}' price 必须是大于 0 的数字（当前: '${row.price}'）`); }

  /* ── old_price 可选，填了则必须 > 0 且大于 price（折扣口径） ── */
  const oldPrice = parseNum(row.old_price);
  if (oldPrice !== null) {
    if (Number.isNaN(oldPrice) || oldPrice <= 0) {
      err(`SKU '${sku}' old_price 必须是大于 0 的数字（当前: '${row.old_price}'）`);
    } else if (price !== null && !Number.isNaN(price) && oldPrice <= price) {
      err(`SKU '${sku}' old_price (${oldPrice}) 必须大于 price (${price})——old_price 是划线原价，应高于现价`);
    }
  }

  /* ── rating / reviews 可选带默认值 ── */
  const rating = parseNum(row.rating);
  if (rating !== null && (Number.isNaN(rating) || rating < 0 || rating > 5)) {
    err(`SKU '${sku}' rating 必须是 0-5 的数字（当前: '${row.rating}'）`);
  }
  const reviews = parseNum(row.reviews);
  if (reviews !== null && (Number.isNaN(reviews) || !Number.isInteger(reviews) || reviews < 0)) {
    err(`SKU '${sku}' reviews 必须是非负整数（当前: '${row.reviews}'）`);
  }

  /* ── status：缺省/留空 → active；非法值报错（hidden 行仍参与完整校验但不输出） ── */
  const status = normalizeStatus(row.status);
  if (!STATUS_VALUES.includes(status)) {
    err(`SKU '${sku}' status 必须是 active 或 hidden（当前: '${row.status}'）`);
  }

  /* ── image 必填 + 三条规则 ── */
  const img = parseImage(row.image);
  if (!img) {
    err(sku ? `SKU '${sku}' image 不能为空` : 'image 不能为空（SKU 未填）');
    return;
  }
  // a) 文件名主干（去掉扩展名）只允许英文/数字/连字符/下划线（拒绝中文文件名——URL 转码问题）
  const dotIdx = img.filename.lastIndexOf('.');
  const stem = dotIdx > 0 ? img.filename.slice(0, dotIdx) : img.filename;
  if (!/^[A-Za-z0-9_-]+$/.test(stem)) {
    err(`SKU '${sku}' 图片文件名 '${img.filename}' 只能包含英文、数字、连字符和下划线（拒绝中文文件名）`);
  }
  // b) 必须是 .webp（图片规范: webp <100KB）
  if (!img.filename.toLowerCase().endsWith('.webp')) {
    err(`SKU '${sku}' 图片 ${img.store} 不是 webp 格式（要求 .webp 且 <100KB）`);
  }
  // c) 文件必须真实存在于 images/ 目录（以 CSV 所在目录为基准——CSV 与 images/ 同根存放）
  const full = path.join(csvDir, IMAGE_DIR, img.filename);
  if (!fs.existsSync(full)) {
    err(`SKU '${sku}' 图片 ${img.store} 在 ${path.join(IMAGE_DIR, '/')} 目录下不存在`);
  }
}

/* ─────────────────────────── 生成 products.js ─────────────────────────── */

/**
 * 由已通过校验的行生成 products.js 内容。
 * @param {Object<string,string>[]} rows 列名 → 原始值
 * @returns {string}
 */
function generateProductsJs(rows) {
  const lines = [];
  lines.push('// 产品数据 — 由 scripts/gen-products.js 从 products.csv 自动生成');
  lines.push('// 请勿手动编辑此文件；修改产品请编辑 products.csv 后运行生成器（或直接 push 触发自动生成）');
  lines.push('const PRODUCTS = {');

  rows.forEach((row, idx) => {
    const sku = String(row.sku).trim();
    const q = s => JSON.stringify(s); // 安全字符串字面量（处理引号/反斜杠/换行）
    const esc = s => escapeHtml(String(s || '').trim()); // HTML 转义：仅用于 innerHTML 渲染的字段（desc 已在 buildDesc 内转义；sizes/colors 在前端走 innerHTML）
    const raw = s => String(s || '').trim(); // 原样：name/sub/cat/unit/sale 前端走 textContent（不解码实体，转义反而双编码）

    // 三语 desc：| 分段 → <h4> 段（buildDesc 内部已逐段 escapeHtml）
    const descEn = buildDesc(row.desc_en);
    const descCn = buildDesc(row.desc_cn);
    const descAr = buildDesc(row.desc_ar);

    const price = parseNum(row.price);
    const oldPrice = parseNum(row.old_price);
    const rating = parseNum(row.rating) ?? DEFAULTS.rating;
    const reviews = parseNum(row.reviews) ?? DEFAULTS.reviews;
    const unit = raw(row.unit) || null;
    const sale = raw(row.sale) || null;
    const sizes = parseList(row.sizes);   // 存原始值（cart/WhatsApp 纯文本上下文使用；HTML 渲染处负责转义）
    const colors = parseList(row.colors); // 存原始值
    const image = parseImage(row.image).store;

    const comma = idx < rows.length - 1 ? ',' : '';
    lines.push(`  ${q(sku)}: {`);
    lines.push(`    en: { name: ${q(raw(row.name_en))}, sub: ${q(raw(row.sub_en))}, cat: ${q(raw(row.cat_en))}, catAr: ${q(raw(row.cat_ar))}, desc: ${q(descEn)} },`);
    lines.push(`    cn: { name: ${q(raw(row.name_cn))}, sub: ${q(raw(row.sub_cn))}, cat: ${q(raw(row.cat_cn))}, desc: ${q(descCn)} },`);
    lines.push(`    ar: { name: ${q(raw(row.name_ar))}, sub: ${q(raw(row.sub_ar))}, cat: ${q(raw(row.cat_ar))}, desc: ${q(descAr)} },`);
    lines.push(`    price: ${price}, oldPrice: ${oldPrice}, unit: ${q(unit)}, sale: ${q(sale)},`);
    lines.push(`    rating: ${rating}, reviews: ${reviews},`);
    lines.push(`    sizes: ${JSON.stringify(sizes)}, colors: ${JSON.stringify(colors)},`);
    lines.push(`    image: ${q(image)},`);
    lines.push(`  }${comma}`);
  });

  lines.push('};');
  return lines.join('\n') + '\n';
}

/* ─────────────────────────── 主流程 ─────────────────────────── */

function main() {
  const csvPath = path.resolve(process.argv[2] || DEFAULT_CSV);
  const outPath = path.resolve(process.argv[3] || DEFAULT_OUT);

  // 1. 读取 CSV
  let text;
  try {
    text = fs.readFileSync(csvPath, 'utf-8');
  } catch (e) {
    console.error(`✗ 无法读取 CSV 文件 ${csvPath}: ${e.message}`);
    process.exit(1);
  }

  // 2. 解析
  const table = parseCsv(text);
  if (table.length < 2) {
    console.error('✗ CSV 内容为空（至少需要表头 + 1 行数据）');
    process.exit(1);
  }

  // 3. 表头校验
  const header = table[0].map(h => String(h).trim());
  const missing = REQUIRED_HEADERS.filter(h => !header.includes(h));
  if (missing.length > 0) {
    console.error(`✗ 表头缺少必填列: ${missing.join(', ')}`);
    console.error(`  支持的表头: ${HEADERS.join(', ')}`);
    process.exit(1);
  }
  const unknown = header.filter(h => h !== '' && !HEADERS.includes(h));
  if (unknown.length > 0) {
    console.warn(`⚠ 表头中存在未识别列（将被忽略）: ${unknown.join(', ')}`);
  }

  // 4. 逐行校验（数据行从 CSV 第 2 行开始）
  const errors = [];
  const seenSku = new Set();
  const csvDir = path.dirname(csvPath); // 图片存在性检查以 CSV 所在目录为基准（CSV 与 images/ 同根存放，workflow 中 CSV 位于仓库根）
  for (let i = 1; i < table.length; i++) {
    const cells = table[i];
    const row = {};
    header.forEach((h, ci) => { if (h !== '' && h !== undefined) row[h] = (cells[ci] === undefined ? '' : cells[ci]); });
    validateRow(row, i + 1, seenSku, csvDir, errors);
  }

  if (errors.length > 0) {
    console.error(`✗ 校验失败，共 ${errors.length} 个错误:`);
    errors.forEach(e => console.error(`  ${e}`));
    console.error('请修正 products.csv 后重新运行（或重新 push）');
    process.exit(1);
  }

  // 5. 生成 + 写入（hidden 行不输出，但已通过完整校验）
  const dataRows = [];
  for (let i = 1; i < table.length; i++) {
    const cells = table[i];
    const row = {};
    header.forEach((h, ci) => { if (h !== '' && h !== undefined) row[h] = (cells[ci] === undefined ? '' : cells[ci]); });
    dataRows.push(row);
  }
  const activeRows = dataRows.filter(r => normalizeStatus(r.status) === 'active');
  const js = generateProductsJs(activeRows);

  try {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, js, 'utf-8');
  } catch (e) {
    console.error(`✗ 写入 ${outPath} 失败: ${e.message}`);
    process.exit(1);
  }

  // 6. node --check 验证语法
  const check = spawnSync(process.execPath, ['--check', outPath], { encoding: 'utf-8' });
  if (check.status !== 0) {
    console.error(`✗ 生成的 ${outPath} 语法检查失败:`);
    console.error(check.stderr || check.stdout);
    process.exit(1);
  }

  // 7. 统计
  console.log(`生成完成：${activeRows.length} 个 SKU（hidden 忽略 ${dataRows.length - activeRows.length} 个）`);
  console.log(`已写入: ${outPath}（语法检查通过）`);
}

main();
