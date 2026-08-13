/* =========================================================
   Mojin Site Config v1.0 (2026-08-08)
   全站可变配置单点维护 —— 改配置只动这一个文件
   所有页面 <script src="data/site-config.js"></script> 最先加载
   ========================================================= */
const SITE_CONFIG = {
  /* ── 商家 WhatsApp（国际格式，不含 + 和空格）── */
  waNumber: '86XXXXXXXXXXX',        // TODO: 等用户提供真实号
  waDisplay: '+86 XXX XXXX XXXX',   // 页面展示用

  /* ── 价格与税务 ── */
  currency: 'SAR',
  vatRate: 0.15,                    // 沙特 VAT 15%（标价不含税，结账加）
  vatLabel: 'VAT 15%',
  freeShippingThreshold: 100,       // 满 SAR 100 免运费

  /* ── 分析 ── */
  gaId: 'G-XXXXXXXXXX',             // TODO: GA4 Measurement ID

  /* ── 联系 ── */
  storeEmail: 'info@mojin.store',   // 邮箱单一来源（lang.js 的 fCont 为纯数据对象、且部分页面先于本文件加载，故未抽离引用；修改邮箱时两处需同步）

  /* ── 下单 ── */
  orderPrefix: 'MJ',                // 订单号前缀，如 MJ-20260808-001
  shippingNote: 'Shipping cost will be confirmed by our team on WhatsApp.',

  /* ── 站点 ── */
  domain: 'mojin.store',
  siteName: 'Mojin',

  /* ── AI 客服后端（widget 用；Worker 反代稳定地址，背后是 cloudflared 隧道 → 本机 :8000） ── */
  mojinApiBase: 'https://mojin-chat-proxy.zhangzhongze130.workers.dev',
};

/* 工具：生成 wa.me 下单链接（预填订单消息） */
function waOrderLink(orderText) {
  return 'https://wa.me/' + SITE_CONFIG.waNumber + '?text=' + encodeURIComponent(orderText);
}
function waLink(text) {
  return 'https://wa.me/' + SITE_CONFIG.waNumber + '?text=' + encodeURIComponent(text || '');
}

/* 初始化：填充页面上的 [data-wa-placeholder] 占位（footer 联系电话） */
function initSiteConfig() {
  document.querySelectorAll('[data-wa-placeholder]').forEach(el => {
    el.textContent = SITE_CONFIG.waDisplay;
    el.style.cursor = 'pointer';
    el.onclick = () => window.open(waLink(), '_blank');
  });
}
document.addEventListener('DOMContentLoaded', initSiteConfig);
