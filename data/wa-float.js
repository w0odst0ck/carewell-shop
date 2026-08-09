/* =========================================================
   Mojin Floating WhatsApp Button v1.0 (2026-08-08)
   全站浮动 WhatsApp 客服按钮：
     - 右下角固定（RTL 页面镜像到左下角）
     - 品牌橙色 #F47920 + 白色 WhatsApp SVG 图标
     - 3 秒延迟出现（CSS animation-delay，避免遮挡首屏）
     - 点击打开 waLink() 生成的链接（新标签页，号码走 SITE_CONFIG）
     - aria-label 三语提示（无障碍）
   依赖: data/site-config.js (SITE_CONFIG.waNumber / waLink) —— 必须在其后加载
   引入方式: 所有页面 </body> 前 <script src="data/wa-float.js"></script>
   ========================================================= */
(function () {
  'use strict';

  /* ── 防重复注入（同一页面重复引入时只渲染一次） ── */
  if (document.getElementById('mj-wa-float')) return;

  /* ── 三语提示（lang.js 未加载的页面也能自包含工作） ── */
  const HINT = {
    en: 'Chat with us on WhatsApp',
    cn: '通过 WhatsApp 联系我们',
    ar: 'تواصل معنا عبر واتساب',
  };

  /* 语言检测：兼容 body.lang-ar（product/checkout/faq）与 html[lang/dir]（index-ar/about-ar） */
  function currentLang() {
    const cls = (document.body && document.body.className) || '';
    if (/\blang-ar\b/.test(cls)) return 'ar';
    if (/\blang-cn\b/.test(cls)) return 'cn';
    const de = document.documentElement;
    if (de && de.lang === 'ar') return 'ar';
    if (de && de.dir === 'rtl') return 'ar';
    if (de && de.lang === 'zh-CN') return 'cn';
    return 'en';
  }
  function isRTL() { return currentLang() === 'ar'; }

  /* ── 注入样式（style 标签，无需改动各页面 CSS） ── */
  const css =
    '#mj-wa-float{' +
      'position:fixed;right:24px;bottom:24px;z-index:999;' +
      'width:60px;height:60px;border-radius:50%;' +
      'background:#F47920;display:flex;align-items:center;justify-content:center;' +
      'box-shadow:0 6px 20px rgba(244,121,32,.45);text-decoration:none;' +
      'opacity:0;visibility:hidden;' +
      'animation:mj-wa-in .5s ease 3s forwards;' +
      'transition:background .2s;' +
    '}' +
    '#mj-wa-float:hover{background:#E06710;}' +
    '#mj-wa-float:focus-visible{outline:3px solid rgba(244,121,32,.5);outline-offset:2px;}' +
    '#mj-wa-float svg{width:34px;height:34px;display:block;}' +
    '@keyframes mj-wa-in{from{opacity:0;visibility:hidden;transform:scale(.5)}' +
    'to{opacity:1;visibility:visible;transform:scale(1)}}' +
    /* RTL 镜像（两种标记方式都覆盖） */
    'body.lang-ar #mj-wa-float,[dir="rtl"] #mj-wa-float{right:auto;left:24px;}' +
    '@media (max-width:480px){' +
      '#mj-wa-float{right:16px;bottom:16px;width:54px;height:54px;}' +
      '#mj-wa-float svg{width:30px;height:30px;}' +
      'body.lang-ar #mj-wa-float,[dir="rtl"] #mj-wa-float{left:16px;}' +
    '}';

  const style = document.createElement('style');
  style.id = 'mj-wa-float-style';
  style.textContent = css;
  document.head.appendChild(style);

  /* ── 创建按钮（<a> 语义 + role=button，点击走 waLink） ── */
  const hint = HINT[currentLang()];
  const btn = document.createElement('a');
  btn.id = 'mj-wa-float';
  btn.href = '#';
  btn.setAttribute('role', 'button');
  btn.setAttribute('aria-label', hint);
  btn.setAttribute('title', hint);
  btn.setAttribute('aria-hidden', 'true');   /* 3 秒延迟期间对读屏隐藏，出现后恢复 */
  btn.setAttribute('tabindex', '-1');       /* 隐藏期间不可聚焦（避免 aria-hidden 与可聚焦矛盾） */
  btn.innerHTML =
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<path fill="#FFFFFF" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>' +
    '</svg>';

  /* 3 秒后出现时对读屏恢复可访问 + 恢复可聚焦 */
  setTimeout(function () { btn.setAttribute('aria-hidden', 'false'); btn.setAttribute('tabindex', '0'); }, 3000);

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    let url = '';
    if (typeof waLink === 'function') {
      url = waLink();                       /* 首选：走 SITE_CONFIG.waNumber 的现有工具 */
    } else if (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.waNumber) {
      url = 'https://wa.me/' + SITE_CONFIG.waNumber;  /* 兜底：site-config 未加载时 */
    }
    if (url) window.open(url, '_blank', 'noopener');
  });

  /* DOM-ready 守卫：兼容 <head> 引入（body 尚不存在）与 </body> 前引入两种方式 */
  (function append() {
    if (!document.body) { setTimeout(append, 50); return; }
    document.body.appendChild(btn);
  })();
})();
