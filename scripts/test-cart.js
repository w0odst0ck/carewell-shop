#!/usr/bin/env node
/* cart.js 核心逻辑测试（node 沙箱，无浏览器） */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..', 'data');
function load(name) { return fs.readFileSync(path.join(root, name), 'utf-8'); }

/* ── 沙箱 stub（window 自引用，模拟浏览器全局） ── */
const sandbox = {
  console,
  localStorage: (() => { let s = {}; return {
    getItem: k => (k in s ? s[k] : null),
    setItem: (k, v) => { s[k] = String(v); },
    removeItem: k => { delete s[k]; },
  }; })(),
  dispatchEvent: () => {},
  addEventListener: () => {},
  open: () => {},
  document: { querySelectorAll: () => [], addEventListener: () => {}, documentElement: {} },
  CustomEvent: function (t, o) { this.type = t; this.detail = o && o.detail; },
  encodeURIComponent,
};
sandbox.window = sandbox;
vm.createContext(sandbox);

vm.runInContext(load('site-config.js'), sandbox);
vm.runInContext(load('products.js'), sandbox);
vm.runInContext(load('order-lang.js'), sandbox);
vm.runInContext(load('cart.js'), sandbox);

const Cart = sandbox.Cart;
const SITE = sandbox.SITE_CONFIG;
let pass = 0, fail = 0;
function eq(actual, expected, label) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) { pass++; console.log(`  ✅ ${label}`); }
  else { fail++; console.log(`  ❌ ${label}\n     expect: ${JSON.stringify(expected)}\n     actual: ${JSON.stringify(actual)}`); }
}

console.log('\n── 购物车基础 ──');
Cart.clear();
eq(Cart.count(), 0, '空车 count=0');
eq(Cart.isEmpty(), true, '空车 isEmpty');

Cart.add('cap-round', 2);
Cart.add('cap-round', 3);          // 同 SKU 合并
eq(Cart.count(), 5, '同 SKU 加购合并 qty=5');
eq(Cart.isEmpty(), false, '非空');

Cart.add('gown-l2', 1, { size: 'L', color: 'Blue' });
eq(Cart.get().length, 2, '两种产品 2 条目');
eq(Cart.get()[1].size, 'L', '变体 size 记录');

Cart.setQty('cap-round', 10);
eq(Cart.count(), 11, 'setQty 10 生效');
Cart.remove('cap-round');
eq(Cart.count(), 1, 'remove 后剩 1');

console.log('\n── 金额（VAT 15%，标价不含税） ──');
Cart.clear();
Cart.add('gown-l2', 1);            // price 45
eq(Cart.subtotal(), 45, 'subtotal=45');
eq(Cart.vatAmount(), 6.75, 'vat=6.75 (45×15%)');
eq(Cart.total(), 51.75, 'total=51.75');
eq(Cart.fmt(51.75), 'SAR 51.75', 'fmt 格式');

console.log('\n── 订单 JSON（支付无关结构） ──');
Cart.clear();
Cart.add('cap-round', 2);          // 22×2=44
Cart.add('glove', 1);              // 28
const order = Cart.buildOrder({ name: 'Test User', phone: '+9665', city: 'Riyadh', address: 'Olaya St', notes: '' }, 'en');
eq(order.items.length, 2, 'items=2');
eq(order.subtotal, 72, 'subtotal=72');
eq(order.vat, 10.8, 'vat=10.8');
eq(order.total, 82.8, 'total=82.8');
eq(order.payment, 'cod', 'payment=cod（P2 可换 moyasar）');
eq(order.shipping, 'to_confirm', 'shipping=人工确认');
eq(order.orderId.startsWith('MJ-'), true, '订单号前缀 MJ-');
eq(typeof order.ts, 'string', '时间戳 ISO');

console.log('\n── WhatsApp 订单消息（三语） ──');
const msgEn = Cart.orderText(order, 'en');
eq(msgEn.includes('NEW ORDER'), true, 'EN 标题');
eq(msgEn.includes('Bouffant Cap'), true, 'EN 产品名');
eq(msgEn.includes('SAR 82.80'), true, 'EN 总额');
const msgAr = Cart.orderText(order, 'ar');
eq(msgAr.includes('طلب جديد'), true, 'AR 标题');
eq(msgAr.includes('SAR 82.80'), true, 'AR 总额格式');
const msgCn = Cart.orderText(order, 'cn');
eq(msgCn.includes('新订单'), true, 'CN 标题');
eq(msgCn.includes('SAR 82.80'), true, 'CN 总额格式');

console.log('\n── 不存在的 SKU 防护 ──');
eq(Cart.add('nope', 1), false, '无效 SKU 拒绝');
eq(Cart.count(), 3, '数量不变');

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
