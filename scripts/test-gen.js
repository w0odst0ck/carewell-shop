#!/usr/bin/env node
/* test-gen.js — gen-products.js 自测（无需浏览器/外部依赖）
 * 用 products.example.csv 生成到临时文件，验证格式正确后自动清理临时产物。
 * 运行: node scripts/test-gen.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const GEN = path.join(root, 'scripts', 'gen-products.js');
const CSV = path.join(root, 'products.example.csv');

/* 临时产物（工作区内，测试结束自动删除） */
const tmpCsv = path.join(root, '_gen-test.csv');       // 带 BOM 的输入
const tmpOut = path.join(root, '_gen-test-out.js');    // 生成输出
const badCsv = path.join(root, '_gen-test-bad.csv');   // 坏数据输入

let pass = 0, fail = 0;
function eq(actual, expected, label) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) { pass++; console.log(`  ✅ ${label}`); }
  else { fail++; console.log(`  ❌ ${label}\n     expect: ${JSON.stringify(expected)}\n     actual: ${JSON.stringify(actual)}`); }
}

function runGen(args) {
  return spawnSync(process.execPath, [GEN, ...args], { encoding: 'utf-8' });
}

/* ── 1. 准备带 BOM 的输入 CSV（同时覆盖 BOM 兼容） ── */
const src = fs.readFileSync(CSV, 'utf-8');
fs.writeFileSync(tmpCsv, '\uFEFF' + src); // 加 BOM
const headerLine = src.split('\n')[0];    // 完整表头（供坏数据复用）

console.log('\n── 正常生成（示例 CSV，带 BOM） ──');
let r = runGen([tmpCsv, tmpOut]);
eq(r.status, 0, `生成器正常退出（stderr: ${(r.stderr || '').trim() || '无'}`);

if (r.status === 0) {
  /* ── 2. 结构断言：vm 沙箱加载生成结果 ── */
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(tmpOut, 'utf-8'), sandbox);
  const P = vm.runInContext('PRODUCTS', sandbox);

  console.log('\n── 生成结构 ──');
  eq(Object.keys(P).length, 4, '生成 4 个 SKU（示例 3 + 新 SKU 1）');
  eq(Object.keys(P['gown-l2']).join(','), 'en,cn,ar,price,oldPrice,unit,sale,rating,reviews,sizes,colors,image',
    '对象键与现有 products.js 格式一致');
  eq(P['gown-l2'].en.catAr, 'أثواب عزل', 'en.catAr 取自 cat_ar（与现有格式一致）');
  eq(P['cap'].oldPrice, null, '空 old_price → null');
  eq(P['cap'].sale, null, '空 sale → null');
  eq(P['face-mask'].rating, 4.5, '空 rating → 默认 4.5');
  eq(P['face-mask'].reviews, 0, '空 reviews → 默认 0');
  eq(P['gown-l2'].en.desc.includes('<h4>'), true, 'desc 按 | 分段生成 <h4>');
  eq(P['gown-l2'].sizes.join(','), 'M,L,XL,XXL', 'sizes 逗号分隔解析为数组');
  eq(P['face-mask'].sizes.join(','), 'One Size', '无逗号尺码解析为单元素数组');
  eq(P['gown-l2'].image, 'images/cap-round.webp', 'image 统一为 images/文件名');
  eq(typeof P['face-mask'].price, 'number', 'price 为数字类型');
}

/* ── 3. 坏数据 → 校验失败 exit 1 ── */
console.log('\n── 坏数据校验 ──');
const badRow = 'cap-x,Bad,Bad,Bad,sub,sub,sub,Cat,Cat,Cat,desc,desc,desc,20,,/ pcs,,,,"M,L","White",images/手工医生帽.jpg';
fs.writeFileSync(badCsv, headerLine + '\n' + badRow + '\n');
try { fs.unlinkSync(tmpOut); } catch (e) { /* 确保从干净状态开始 */ }
r = runGen([badCsv, tmpOut]);
eq(r.status, 1, '坏数据（中文文件名 jpg）→ exit 1');
const errOut = (r.stderr || '') + (r.stdout || ''); // 错误信息由 console.error 输出到 stderr
eq(errOut.includes('不是 webp 格式'), true, '错误信息含 webp 提示');
eq(errOut.includes('只能包含英文、数字、连字符和下划线'), true, '错误信息含中文文件名拒绝提示');
eq(fs.existsSync(tmpOut), false, '校验失败不生成输出文件');

/* ── 4. 清理临时产物 ── */
console.log('\n── 清理 ──');
for (const f of [tmpCsv, tmpOut, badCsv]) {
  try { fs.unlinkSync(f); console.log(`  🗑 已删除 ${path.basename(f)}`); }
  catch (e) { /* 已不存在则忽略 */ }
}

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
