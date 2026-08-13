/* =========================================================
   Mojin AI Chat Widget v1.0 (2026-08-13)
   全站右下角 AI 客服聊天组件（三语 en/cn/ar，纯原生 JS 单文件）：
     - 浮动圆形气泡按钮，点击展开聊天面板（z-index 9999，高于 wa-float）
     - 对接 MCPForge 后端 `{API_BASE}/mojin_chat/answer_question`（RAG 三语问答）
     - hit_count === 0 / 超时 / 后端不可达 → 显示「转 WhatsApp 人工」按钮
     - RTL 镜像：ar 页面按钮与面板整体镜像到左下角，面板 dir=rtl
     - 语言检测复用 wa-float.js 的 currentLang() 逻辑，UI 文案三语自包含
     - 用户消息 textContent 渲染（防 XSS）；AI 消息仅做 **加粗** 与换行粗处理
     - 打开状态 + 聊天历史存 sessionStorage（刷新后保持）
   依赖: data/site-config.js (可选，SITE_CONFIG.waNumber / mojinApiBase / waLink) ——
         建议在其后加载；未加载时 widget 用内置默认值兜底，不影响独立工作
   引入方式: 所有页面 </body> 前 <script src="data/chat-widget.js"></script>
   联调备注: 后端 FastAPI 已配 CORS（BACKEND_CORS_ORIGINS），file:// 直开或同源部署均可
   ========================================================= */
(function () {
  'use strict';

  /* ── 防重复注入（同一页面重复引入时只渲染一次） ── */
  if (document.getElementById('mj-chat-widget')) return;

  /* ── 后端地址：优先 SITE_CONFIG.mojinApiBase（site-config.js 新增字段），
        否则内置默认 127.0.0.1:8000（纯前端验收/本地联调用） ── */
  var API_BASE =
    (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.mojinApiBase)
      ? SITE_CONFIG.mojinApiBase
      : 'http://127.0.0.1:8000';

  var FETCH_TIMEOUT = 30000;   /* 30s 超时（AbortController） */

  /* ── 三语 UI 文案（自包含，不依赖 lang.js） ── */
  var I18N = {
    en: {
      title: 'Mojin Assistant',
      close: 'Close chat',
      fab: 'Open AI chat assistant',
      placeholder: 'Ask about shipping, payment, returns…',
      send: 'Send',
      typing: 'Mojin is typing',
      welcome:
        'Hi! 👋 I am Mojin\u2019s AI assistant, here 24/7. Ask me anything about our products, ' +
        'shipping, payment, or return policy.',
      error: 'Sorry, our assistant is temporarily unavailable. Please try again later or ' +
        'reach our human support on WhatsApp.',
      human: 'Chat with human support on WhatsApp',
      humanMsg: 'Hi, I need help from a human agent on mojin.shop.',
      chips: ['How long is shipping?', 'What payment methods do you accept?', 'What is your return policy?'],
    },
    cn: {
      title: 'Mojin 智能助手',
      close: '关闭对话',
      fab: '打开 AI 客服',
      placeholder: '咨询配送、支付、退换货…',
      send: '发送',
      typing: '正在输入',
      welcome:
        '您好！👋 我是 Mojin 的 AI 助手，7×24 小时在线。关于商品、配送、支付或退换政策，' +
        '都可以问我。',
      error: '抱歉，客服服务暂时不可用。请稍后重试，或通过 WhatsApp 联系人工客服。',
      human: '联系 WhatsApp 人工客服',
      humanMsg: '您好，我在 mojin.shop 需要人工客服帮助。',
      chips: ['配送要多久？', '支持哪些支付方式？', '退换货政策是什么？'],
    },
    ar: {
      title: 'مساعد موجين',
      close: 'إغلاق المحادثة',
      fab: 'افتح المساعد الذكي',
      placeholder: 'اسأل عن الشحن والدفع والإرجاع…',
      send: 'إرسال',
      typing: 'يتم الكتابة',
      welcome:
        'مرحبًا! 👋 أنا مساعد موجين الذكي، متاح على مدار الساعة. اسألني عن منتجاتنا أو ' +
        'الشحن أو الدفع أو سياسة الإرجاع.',
      error: 'عذرًا، الخدمة غير متاحة حاليًا. يرجى المحاولة لاحقًا أو التواصل مع الدعم البشري عبر واتساب.',
      human: 'التحدث مع الدعم البشري عبر واتساب',
      humanMsg: 'مرحبًا، أحتاج مساعدة من فريق الدعم البشري في mojin.shop.',
      chips: ['كم تستغرق مدة الشحن؟', 'ما هي طرق الدفع المتاحة؟', 'ما هي سياسة الإرجاع؟'],
    },
  };

  /* 语言检测：与 wa-float.js 一致 —— 兼容 body.lang-ar（product/checkout/faq）
     与 html[lang/dir]（index-ar/about-ar）两种标记方式 */
  function currentLang() {
    var cls = (document.body && document.body.className) || '';
    if (/\blang-ar\b/.test(cls)) return 'ar';
    if (/\blang-cn\b/.test(cls)) return 'cn';
    var de = document.documentElement;
    if (de && de.lang === 'ar') return 'ar';
    if (de && de.dir === 'rtl') return 'ar';
    if (de && de.lang === 'zh-CN') return 'cn';
    return 'en';
  }
  function isRTL() { return currentLang() === 'ar'; }
  function t(key) {
    var i = I18N[currentLang()];
    return (i && i[key]) || I18N.en[key];
  }

  /* ── 生成 wa.me 转人工链接：优先 waLink()（site-config.js），兜底直拼号码 ── */
  function humanLink() {
    var url = '';
    if (typeof waLink === 'function') {
      url = waLink(t('humanMsg'));
    } else if (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.waNumber) {
      url = 'https://wa.me/' + SITE_CONFIG.waNumber + '?text=' + encodeURIComponent(t('humanMsg'));
    }
    return url;
  }

  /* ── 注入样式（style 标签；CSS 变量带硬编码兜底色值，vars.css 未加载也可用） ── */
  var css =
    /* 外层容器（仅作防重复注入锚点，无样式） */
    '#mj-chat-widget{}' +
    /* 浮动按钮：右下角，与 wa-float 同列、在其正上方（bottom 错开不重叠） */
    '#mj-chat-fab{' +
      'position:fixed;right:24px;bottom:96px;z-index:9999;' +
      'width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;' +
      'background:var(--warm-blue,#3A7B9E);color:#fff;font-size:26px;line-height:1;' +
      'display:flex;align-items:center;justify-content:center;' +
      'box-shadow:0 6px 20px rgba(58,123,158,.4);' +
      'transition:background .2s,transform .2s;' +
    '}' +
    '#mj-chat-fab:hover{background:var(--light-blue,#6D9FB8);transform:scale(1.05);}' +
    '#mj-chat-fab:focus-visible{outline:3px solid rgba(58,123,158,.5);outline-offset:2px;}' +
    /* 面板：默认隐藏，.open 显示（过渡动画） */
    '#mj-chat-panel{' +
      'position:fixed;right:24px;bottom:96px;z-index:9999;' +
      'width:min(360px,calc(100vw - 32px));max-height:70vh;' +
      'display:flex;flex-direction:column;overflow:hidden;' +
      'background:var(--white,#fff);color:var(--warm-black,#3A3530);' +
      'border:1px solid var(--border-light,#E8E2D8);border-radius:var(--radius-lg,16px);' +
      'box-shadow:var(--shadow-hover,0 8px 30px rgba(58,53,48,.18));' +
      'font-family:inherit;font-size:14px;' +
      'opacity:0;visibility:hidden;transform:translateY(10px) scale(.98);' +
      'transition:opacity .25s,transform .25s,visibility .25s;' +
    '}' +
    '#mj-chat-panel.open{opacity:1;visibility:visible;transform:none;}' +
    /* header */
    '#mj-chat-head{' +
      'display:flex;align-items:center;justify-content:space-between;gap:8px;' +
      'padding:12px 14px;flex:0 0 auto;' +
      'background:var(--warm-blue,#3A7B9E);color:#fff;' +
    '}' +
    '#mj-chat-head .mj-title{font-size:15px;font-weight:600;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
    '#mj-chat-head .mj-close{' +
      'border:none;background:rgba(255,255,255,.18);color:#fff;cursor:pointer;' +
      'width:28px;height:28px;border-radius:50%;font-size:15px;line-height:1;' +
      'display:flex;align-items:center;justify-content:center;flex:0 0 auto;' +
      'transition:background .2s;' +
    '}' +
    '#mj-chat-head .mj-close:hover{background:rgba(255,255,255,.32);}' +
    /* 消息区 */
    '#mj-chat-body{' +
      'flex:1 1 auto;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;' +
      'background:var(--cream,#FCF8F4);min-height:0;' +
    '}' +
    '.mj-msg{' +
      'max-width:82%;padding:9px 13px;border-radius:14px;' +
      'font-size:14px;line-height:1.55;word-break:break-word;white-space:pre-wrap;' +
    '}' +
    '.mj-msg.user{align-self:flex-end;background:var(--warm-blue,#3A7B9E);color:#fff;border-bottom-right-radius:4px;}' +
    '.mj-msg.ai{align-self:flex-start;background:var(--warm-gray,#F0EDE8);color:var(--warm-black,#3A3530);border-bottom-left-radius:4px;}' +
    '.mj-msg.ai strong{color:var(--warm-black,#3A3530);font-weight:700;}' +
    /* AI 消息来源标注（小字灰色） */
    '.mj-src{' +
      'margin:3px 4px 0;font-size:11px;color:var(--warm-text,#7A756E);' +
      'line-height:1.4;word-break:break-all;' +
    '}' +
    /* 正在输入动画（三点跳动） */
    '.mj-typing{display:inline-flex;align-items:center;gap:4px;padding:2px 0;color:var(--warm-text,#7A756E);font-size:13px;}' +
    '.mj-typing i{width:5px;height:5px;border-radius:50%;background:var(--warm-text,#7A756E);display:inline-block;animation:mj-blink 1.2s infinite;}' +
    '.mj-typing i:nth-child(2){animation-delay:.2s}' +
    '.mj-typing i:nth-child(3){animation-delay:.4s}' +
    '@keyframes mj-blink{0%,80%,100%{opacity:.25}40%{opacity:1}}' +
    /* 转人工按钮（AI 气泡下方） */
    '.mj-human{' +
      'display:inline-flex;align-items:center;gap:6px;margin-top:8px;' +
      'padding:8px 14px;border-radius:20px;text-decoration:none;cursor:pointer;' +
      'font-size:13px;font-weight:600;align-self:flex-start;' +
      'background:var(--wa-green,#25D366);color:#fff;' +
      'box-shadow:0 2px 8px rgba(37,211,102,.35);transition:filter .2s;' +
    '}' +
    '#mj-chat-body[dir="rtl"] .mj-human{align-self:flex-end;}' +
    '.mj-human:hover{filter:brightness(1.06);}' +
    /* 快捷问题 chips */
    '#mj-chat-chips{' +
      'display:flex;flex-wrap:wrap;gap:8px;padding:10px 14px 0;flex:0 0 auto;' +
      'background:var(--white,#fff);' +
    '}' +
    '#mj-chat-chips button{' +
      'border:1px solid var(--border-light,#E8E2D8);background:var(--cream,#FCF8F4);' +
      'color:var(--warm-black,#3A3530);border-radius:16px;padding:6px 12px;' +
      'font-size:12px;cursor:pointer;transition:border-color .2s,color .2s;' +
    '}' +
    '#mj-chat-chips button:hover{border-color:var(--warm-blue,#3A7B9E);color:var(--warm-blue,#3A7B9E);}' +
    /* 输入区 */
    '#mj-chat-input{' +
      'display:flex;align-items:flex-end;gap:8px;padding:10px 12px 12px;flex:0 0 auto;' +
      'background:var(--white,#fff);border-top:1px solid var(--border-light,#E8E2D8);' +
    '}' +
    '#mj-chat-input textarea{' +
      'flex:1 1 auto;resize:none;border:1px solid var(--border-light,#E8E2D8);' +
      'border-radius:var(--radius-md,10px);padding:9px 12px;' +
      'font:inherit;font-size:14px;color:var(--warm-black,#3A3530);background:var(--white,#fff);' +
      'max-height:90px;min-height:38px;outline:none;transition:border-color .2s;' +
    '}' +
    '#mj-chat-input textarea:focus{border-color:var(--warm-blue,#3A7B9E);}' +
    '#mj-chat-input .mj-send{' +
      'border:none;cursor:pointer;flex:0 0 auto;height:38px;padding:0 16px;' +
      'border-radius:var(--radius-md,10px);font-size:14px;font-weight:600;' +
      'background:var(--sand-orange,#E8874E);color:#fff;' +
      'transition:background .2s,opacity .2s;' +
    '}' +
    '#mj-chat-input .mj-send:hover{background:var(--light-orange,#F4A261);}' +
    '#mj-chat-input .mj-send:disabled{opacity:.5;cursor:not-allowed;}' +
    /* RTL 镜像：按钮 + 面板整体翻到左下角（wa-float 同款处理） */
    'body.lang-ar #mj-chat-fab,[dir="rtl"] #mj-chat-fab{right:auto;left:24px;}' +
    'body.lang-ar #mj-chat-panel,[dir="rtl"] #mj-chat-panel{right:auto;left:24px;}' +
    /* 移动端：缩小边距，避开 wa-float（bottom 16 + 54 + 间隔） */
    '@media (max-width:480px){' +
      '#mj-chat-fab{right:16px;bottom:84px;width:54px;height:54px;font-size:24px;}' +
      '#mj-chat-panel{right:16px;bottom:84px;}' +
      'body.lang-ar #mj-chat-fab,[dir="rtl"] #mj-chat-fab{left:16px;}' +
      'body.lang-ar #mj-chat-panel,[dir="rtl"] #mj-chat-panel{left:16px;}' +
    '}';

  var style = document.createElement('style');
  style.id = 'mj-chat-style';
  style.textContent = css;
  document.head.appendChild(style);

  /* ── 构建 DOM：容器 → 浮动按钮 + 面板 ── */
  var root = document.createElement('div');
  root.id = 'mj-chat-widget';

  var fab = document.createElement('button');
  fab.id = 'mj-chat-fab';
  fab.type = 'button';
  fab.setAttribute('aria-label', t('fab'));
  fab.setAttribute('title', t('fab'));
  fab.textContent = '\uD83D\uDcAC';   /* 💬 气泡图标 */

  var panel = document.createElement('div');
  panel.id = 'mj-chat-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', t('title'));

  var head = document.createElement('div');
  head.id = 'mj-chat-head';
  var title = document.createElement('div');
  title.className = 'mj-title';
  title.textContent = t('title');
  var closeBtn = document.createElement('button');
  closeBtn.className = 'mj-close';
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', t('close'));
  closeBtn.setAttribute('title', t('close'));
  closeBtn.textContent = '\u2715';   /* ✕ */
  head.appendChild(title);
  head.appendChild(closeBtn);

  var body = document.createElement('div');
  body.id = 'mj-chat-body';

  var chips = document.createElement('div');
  chips.id = 'mj-chat-chips';

  var inputRow = document.createElement('div');
  inputRow.id = 'mj-chat-input';
  var ta = document.createElement('textarea');
  ta.rows = 1;
  ta.setAttribute('placeholder', t('placeholder'));
  ta.setAttribute('aria-label', t('placeholder'));
  var sendBtn = document.createElement('button');
  sendBtn.className = 'mj-send';
  sendBtn.type = 'button';
  sendBtn.textContent = t('send');
  inputRow.appendChild(ta);
  inputRow.appendChild(sendBtn);

  panel.appendChild(head);
  panel.appendChild(body);
  panel.appendChild(chips);
  panel.appendChild(inputRow);

  root.appendChild(fab);
  root.appendChild(panel);

  /* ── sessionStorage：面板打开状态 + 聊天历史（刷新后保持） ── */
  var SS_KEY = 'mj-chat-state';
  function loadState() {
    try {
      var raw = sessionStorage.getItem(SS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function saveState() {
    try {
      sessionStorage.setItem(SS_KEY, JSON.stringify({ open: panel.classList.contains('open'), msgs: history }));
    } catch (e) { /* 隐私模式等场景静默失败，不影响使用 */ }
  }

  /* ── 消息渲染 ── */
  function escapeHTML(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  /* AI 消息 markdown 粗处理：先全量转义（防 XSS），再只做 **加粗** 与换行 */
  function renderAI(text) {
    var el = document.createElement('div');
    el.innerHTML = escapeHTML(text)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    return el;
  }
  function addBubble(role, text, srcDocs) {
    var wrap = document.createElement('div');
    var msg = document.createElement('div');
    msg.className = 'mj-msg ' + role;
    if (role === 'ai') {
      msg.appendChild(renderAI(text));
    } else {
      msg.textContent = text;
    }
    wrap.appendChild(msg);
    if (role === 'ai' && srcDocs && srcDocs.length) {
      var src = document.createElement('div');
      src.className = 'mj-src';
      src.textContent = (currentLang() === 'ar' ? 'المصدر: ' : currentLang() === 'cn' ? '来源: ' : 'Source: ') + srcDocs.join(', ');
      wrap.appendChild(src);
    }
    body.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }
  function addHumanButton() {
    var a = document.createElement('a');
    a.className = 'mj-human';
    a.href = humanLink();
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = '\uD83D\uDCAC ' + t('human');
    body.appendChild(a);
    scrollToBottom();
  }
  function addTyping() {
    var wrap = document.createElement('div');
    wrap.id = 'mj-typing';
    var box = document.createElement('div');
    box.className = 'mj-msg ai';
    var tp = document.createElement('span');
    tp.className = 'mj-typing';
    tp.textContent = t('typing');
    var i1 = document.createElement('i');
    var i2 = document.createElement('i');
    var i3 = document.createElement('i');
    tp.appendChild(i1); tp.appendChild(i2); tp.appendChild(i3);
    box.appendChild(tp);
    wrap.appendChild(box);
    body.appendChild(wrap);
    scrollToBottom();
    return wrap;
  }
  function scrollToBottom() {
    body.scrollTop = body.scrollHeight;
  }
  function setBusy(busy) {
    sendBtn.disabled = busy;
    ta.disabled = busy;
  }

  /* ── 调用后端 answer_question（30s 超时，全兜底不抛错） ── */
  function ask(query) {
    var lang = currentLang();
    var url = API_BASE + '/mojin_chat/answer_question?query=' + encodeURIComponent(query) + '&lang=' + lang;
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, FETCH_TIMEOUT);
    return fetch(url, { method: 'GET', signal: ctrl.signal })
      .then(function (resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.json();
      })
      .catch(function (err) {
        clearTimeout(timer);
        return { error: (err && err.name === 'AbortError') ? 'timeout' : 'network', hit_count: -1 };
      })
      .finally(function () { clearTimeout(timer); });
  }

  /* ── 发送流程 ── */
  function send(text) {
    var q = (text != null ? text : ta.value).trim();
    if (!q || sendBtn.disabled) return;
    ta.value = '';
    autoGrow();
    history.push({ role: 'user', text: q });
    addBubble('user', q);
    saveState();

    setBusy(true);
    addTyping();

    ask(q).then(function (data) {
      var typing = document.getElementById('mj-typing');
      if (typing) typing.remove();

      /* 后端不可达 / 超时 / 服务端报错 → 错误兜底 + 转人工 */
      var error = (data && data.error) || (!data || data.hit_count === undefined ? 'network' : null);
      var hitCount = data ? (data.hit_count == null ? -1 : data.hit_count) : -1;
      var answer = (data && data.answer) ? String(data.answer) : t('error');

      var srcDocs = [];
      if (data && Array.isArray(data.sources)) {
        srcDocs = data.sources.map(function (s) { return s && s.doc_id ? s.doc_id : ''; }).filter(Boolean).slice(0, 2);
      }

      history.push({ role: 'ai', text: answer, src: srcDocs });
      addBubble('ai', answer, srcDocs);

      /* hit_count === 0（知识库无命中）或出错 → 转人工按钮 */
      if (error || hitCount === 0) addHumanButton();
      saveState();
      setBusy(false);
    });
  }

  /* textarea 自动增高（最多 90px） */
  function autoGrow() {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 90) + 'px';
  }

  /* ── 面板开关 ── */
  var history = [];   /* 会话历史：{role, text, src}，随 sessionStorage 持久化 */

  function openPanel() {
    /* 打开时重新检测语言并整体应用（dir / 文案） */
    var lang = currentLang();
    panel.setAttribute('dir', isRTL() ? 'rtl' : 'ltr');
    fab.setAttribute('aria-label', t('fab'));
    fab.setAttribute('title', t('fab'));
    panel.setAttribute('aria-label', t('title'));
    title.textContent = t('title');
    closeBtn.setAttribute('aria-label', t('close'));
    ta.setAttribute('placeholder', t('placeholder'));
    ta.setAttribute('aria-label', t('placeholder'));
    sendBtn.textContent = t('send');
    if (lang === 'ar') {
      ta.style.textAlign = 'right';
      ta.style.direction = 'rtl';
    } else {
      ta.style.textAlign = '';
      ta.style.direction = '';
    }
    /* 快捷问题 chips 三语重建 */
    chips.innerHTML = '';
    I18N[lang].chips.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = c;
      b.addEventListener('click', function () { send(c); });
      chips.appendChild(b);
    });

    /* 首次打开（无历史）显示欢迎语；否则恢复历史 */
    if (!history.length) {
      history.push({ role: 'ai', text: t('welcome') });
      addBubble('ai', t('welcome'), []);
    } else {
      body.innerHTML = '';
      history.forEach(function (m) { addBubble(m.role, m.text, m.src); });
    }

    panel.classList.add('open');
    fab.setAttribute('aria-expanded', 'true');
    saveState();
    ta.focus();
  }
  function closePanel() {
    panel.classList.remove('open');
    fab.setAttribute('aria-expanded', 'false');
    saveState();
  }

  /* ── 事件绑定 ── */
  fab.addEventListener('click', function () {
    if (panel.classList.contains('open')) closePanel();
    else openPanel();
  });
  closeBtn.addEventListener('click', closePanel);
  sendBtn.addEventListener('click', function () { send(); });

  ta.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();        /* Enter 发送 */
      send();
    } else if (e.key === 'Enter' && e.shiftKey) {
      /* Shift+Enter 换行（textarea 默认行为） */
    }
  });
  ta.addEventListener('input', autoGrow);

  /* ── DOM-ready 守卫：兼容 <head> 引入（body 尚不存在）与 </body> 前引入 ── */
  (function append() {
    if (!document.body) { setTimeout(append, 50); return; }
    document.body.appendChild(root);

    /* 恢复上次会话：打开过则直接展开 */
    var st = loadState();
    if (st && Array.isArray(st.msgs)) history = st.msgs;
    if (st && st.open) openPanel();
  })();
})();
