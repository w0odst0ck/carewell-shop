/* =========================================================
   Mojin Cart v1.0 (2026-08-08)
   纯前端购物车：localStorage 持久化，跨页保留
   依赖: data/products.js (PRODUCTS), data/site-config.js (SITE_CONFIG)
   可选: data/ga4.js (window.mjTrack) —— GA4 事件埋点，未加载/未配置时静默跳过
   事件: window 'cart-changed'  {count, subtotal} —— 页面监听更新徽章
   ========================================================= */
const Cart = (() => {
  const KEY = 'mojin_cart_v1';
  let items = load();

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(items)); }
    catch (e) { console.warn('Cart save failed', e); }
    emit();
  }
  function emit() {
    window.dispatchEvent(new CustomEvent('cart-changed', {
      detail: { count: count(), subtotal: subtotal() }
    }));
  }

  /* ── 产品信息辅助（价格单一事实源 = PRODUCTS；index 页无 products.js 时仅徽章可用） ── */
  function product(sku) { return (typeof PRODUCTS !== 'undefined' && PRODUCTS[sku]) ? PRODUCTS[sku] : null; }
  function priceOf(sku) { const p = product(sku); return p ? Number(p.price) : 0; }
  function nameOf(sku, lang) {
    const p = product(sku);
    if (!p) return sku;
    const l = (lang && p[lang]) ? lang : 'en';
    return p[l].name;
  }

  /* ── 增删改查 ── */
  function find(sku, size, color) {
    return items.find(it => it.sku === sku && (it.size || '') === (size || '') && (it.color || '') === (color || ''));
  }
  /* 变体缺省时按 SKU 兜底（该 SKU 仅一个条目时直接命中） */
  function findOrSku(sku, size, color) {
    const exact = find(sku, size, color);
    if (exact) return exact;
    return items.find(it => it.sku === sku);
  }

  function add(sku, qty = 1, opts = {}) {
    const p = product(sku);
    if (!p) return false;
    qty = Math.max(1, Math.floor(qty));
    const size = opts.size || (p.sizes && p.sizes[0]) || '';
    const color = opts.color || (p.colors && p.colors[0]) || '';
    const it = find(sku, size, color);
    if (it) { it.qty += qty; }
    else { items.push({ sku, qty, size, color }); }
    save();
    /* GA4: add_to_cart 事件（ga4.js 未加载或 gaId 未配置时 mjTrack 静默跳过） */
    if (typeof window.mjTrack === 'function') {
      window.mjTrack('add_to_cart', {
        sku: sku,
        qty: qty,
        price: Number(p.price) || 0,
        currency: SITE_CONFIG.currency,
        item_id: sku,
        item_name: nameOf(sku),
      });
    }
    return true;
  }

  function setQty(sku, qty, size, color) {
    const it = findOrSku(sku, size, color);
    if (!it) return;
    it.qty = Math.max(1, Math.floor(qty));
    save();
  }

  function remove(sku, size, color) {
    const it = findOrSku(sku, size, color);
    if (!it) return;
    items = items.filter(x => x !== it);
    save();
  }

  function clear() { items = []; save(); }
  function get() { return items.map(it => ({ ...it })); }
  function count() { return items.reduce((n, it) => n + it.qty, 0); }
  function isEmpty() { return items.length === 0; }

  /* ── 金额（标价不含税；VAT 在结算处单独计算） ── */
  function subtotal() {
    return items.reduce((s, it) => s + priceOf(it.sku) * it.qty, 0);
  }
  function vatAmount() { return Math.round(subtotal() * SITE_CONFIG.vatRate * 100) / 100; }
  function total() { return subtotal() + vatAmount(); }
  function fmt(n) {
    return SITE_CONFIG.currency + ' ' + (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* ── 订单 JSON（支付无关结构，P2 接 Moyasar 复用） ── */
  function buildOrder(customer = {}, lang = 'en') {
    const ts = new Date();
    const ymd = ts.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(Math.floor(Math.random() * 900) + 100);
    const itemsOut = items.map(it => ({
      sku: it.sku,
      name: nameOf(it.sku, lang),
      size: it.size || '',
      color: it.color || '',
      qty: it.qty,
      unitPrice: priceOf(it.sku),
      lineTotal: priceOf(it.sku) * it.qty,
    }));
    return {
      orderId: SITE_CONFIG.orderPrefix + '-' + ymd + '-' + seq,
      ts: ts.toISOString(),
      items: itemsOut,
      subtotal: subtotal(),
      vatRate: SITE_CONFIG.vatRate,
      vat: vatAmount(),
      total: total(),
      currency: SITE_CONFIG.currency,
      payment: 'cod',               // P2: 'moyasar'
      shipping: 'to_confirm',       // P1 人工确认运费
      customer: {
        name: customer.name || '',
        phone: customer.phone || '',
        city: customer.city || '',
        address: customer.address || '',
        notes: customer.notes || '',
      },
      lang,
      site: SITE_CONFIG.domain,
    };
  }

  /* ── WhatsApp 订单消息文本 ── */
  function orderText(order, lang = 'en') {
    const L = (typeof MJ_LANG !== 'undefined' && MJ_LANG[lang]) ? MJ_LANG[lang] : {};
    const t = L.order || {};
    const lines = [];
    lines.push((t.title || '🛒 NEW ORDER') + ' ' + order.orderId);
    lines.push('━━━━━━━━━━');
    order.items.forEach(it => {
      let l = '• ' + it.name + ' ×' + it.qty;
      if (it.size) l += ' (' + it.size + ')';
      if (it.color) l += ' ' + it.color;
      l += ' = ' + Cart.fmt(it.lineTotal);
      lines.push(l);
    });
    lines.push('━━━━━━━━━━');
    lines.push((t.subtotal || 'Subtotal') + ': ' + Cart.fmt(order.subtotal));
    lines.push((t.vat || 'VAT') + ' (' + (order.vatRate * 100) + '%): ' + Cart.fmt(order.vat));
    lines.push((t.total || 'Total') + ': ' + Cart.fmt(order.total));
    lines.push((t.shipping || 'Shipping') + ': ' + (t.toConfirm || 'to be confirmed'));
    lines.push('━━━━━━━━━━');
    lines.push((t.customer || 'Customer') + ': ' + order.customer.name);
    lines.push((t.phone || 'Phone') + ': ' + order.customer.phone);
    lines.push((t.city || 'City') + ': ' + order.customer.city);
    if (order.customer.address) lines.push((t.address || 'Address') + ': ' + order.customer.address);
    if (order.customer.notes) lines.push((t.notes || 'Notes') + ': ' + order.customer.notes);
    lines.push((t.lang || 'Language') + ': ' + order.lang.toUpperCase());
    lines.push('— Mojin ' + SITE_CONFIG.domain);
    return lines.join('\n');
  }

  /* ── 初始化：徽章同步 ── */
  function initBadge() {
    const els = document.querySelectorAll('.cart-badge');
    const c = count();
    els.forEach(el => { el.textContent = c; el.style.display = c > 0 ? '' : 'none'; });
  }

  window.addEventListener('DOMContentLoaded', initBadge);
  window.addEventListener('cart-changed', initBadge);

  return { add, setQty, remove, clear, get, count, isEmpty, subtotal, vatAmount, total, fmt, buildOrder, orderText, initBadge, priceOf, nameOf };
})();

window.Cart = Cart;
