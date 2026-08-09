/* =========================================================
   Mojin GA4 Analytics v1.0 (2026-08-08)
   GA4 统一埋点入口：
     1) 加载官方 gtag.js 并用 SITE_CONFIG.gaId 初始化（send_page_view）
     2) 暴露 window.mjTrack(eventName, params) 供全站事件调用
   依赖: data/site-config.js (SITE_CONFIG.gaId) —— 必须在其后加载
   防御: gaId 为空 / 不以 G- 开头 / 含占位 XXXX 时：
         - 不加载 gtag 脚本、不报错
         - mjTrack 仍存在但静默跳过（调用方无需判断）
   引入方式: 所有页面 </body> 前 <script src="data/ga4.js"></script>
   ========================================================= */
(function () {
  'use strict';

  var id = (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.gaId) || '';

  /* 占位判断：当前默认值 'G-XXXXXXXXXX'，真实 ID 不含连续 4 个 X */
  var valid = id.indexOf('G-') === 0 && id.indexOf('XXXX') === -1;

  if (valid) {
    window.dataLayer = window.dataLayer || [];
    /* 标准 gtag 垫片（Google 推荐写法） */
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id);
    /* 异步加载官方脚本（defer 由 async 属性保证不阻塞渲染） */
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
  }

  /* ── 统一事件入口：GA4 未配置/占位时安全空转，调用方永远不报错 ── */
  window.mjTrack = function (eventName, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params || {});
    }
  };
})();
