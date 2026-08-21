#!/usr/bin/env python3
"""生成 inquiry-{en,cn,ar}.html（三语询盘页，单源生成器）。

设计要点（见 .flow/workitems/inquiry-page-productization/design.md）：
- 弃用旧版「正则抽取 index.html 头/header/footer」的脆弱写法（曾导致双重 DOCTYPE、
  重复 header/mobile-nav、漏引样式），改为显式确定性模板；
- 模板中只有 {copy} 文案插值 → 三语 HTML 结构字节一致（verify C4 校验）；
- 表单/planner 卡全部 class 化，视觉下沉到 css/inquiry.css（无任何 style=）；
- JS（submitInquiry/toggleMobileNav/toggleLang/switchLang）与脚本加载顺序原样保留；
- planner 入口继续引用 SITE_CONFIG.plannerUrl（单一事实源，不改 data/site-config.js）。
"""
import datetime
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent

# 三语同一组合字体 URL（Inter + Noto Sans SC + Tajawal + Noto Sans Arabic）
FONTS_URL = ("https://fonts.googleapis.com/css2?"
             "family=Inter:wght@300;400;500;600;700;800"
             "&family=Noto+Sans+SC:wght@300;400;500;600;700;900"
             "&family=Tajawal:wght@300;400;500;700;800;900"
             "&family=Noto+Sans+Arabic:wght@300;400;500;600;700"
             "&display=swap")

# 五脚本加载顺序（原样，勿改）
SCRIPTS = """<script src="data/site-config.js"></script>
<script src="data/order-lang.js"></script>
<script src="data/cart.js"></script>
<script src="data/ga4.js"></script>
<script src="data/wa-float.js"></script>"""

PAGES = {
    "en": {
        "lang": "en", "dir": "ltr", "locale": "en_US",
        "title": "Mojin — B2B Inquiry | Nonwoven OEM/ODM Factory",
        "nav_home": "Home", "nav_products": "Products", "nav_about": "About Us",
        "nav_inquiry": "B2B Inquiry", "nav_faq": "FAQ",
        "hero_badge": "🇸🇦 Factory-direct · Xiantao, China · CE / SASO / ISO 13485",
        "hero_title": "Request a Quote",
        "hero_sub": "Bulk pricing, OEM/ODM customization, private label and fast sample turnaround — direct from the world's largest nonwoven hub.",
        "planner_title": "🤖 Let AI Plan Your Shopping List First",
        "planner_sub": "Tell our AI shopping planner your needs (clinic setup, hotel supplies, PPE kit...) and get a structured list with Saudi VAT-inclusive landed prices in seconds. Then send it to us for a quote.",
        "planner_btn": "Open AI Shopping Planner",
        "form_title": "📩 Or Send Us an Inquiry",
        "form_note": "Fields marked * are required. We reply within 24 hours.",
        "grp_product": "Product Needs",
        "grp_contact": "Contact Information",
        "grp_msg": "Message",
        "lbl_category": "Product Category *", "cat_options": ["Isolation Gowns", "Protective Caps", "Shoe Covers", "Nitrile Gloves", "Masks", "OEM / Custom Products", "Other"],
        "lbl_qty": "Estimated Quantity", "qty_ph": "e.g. 500 packs / month",
        "lbl_custom": "Customization Needs", "custom_ph": "Logo printing, size/spec changes, packaging, private label...",
        "lbl_company": "Company / Organization *", "company_ph": "Your company name",
        "lbl_name": "Contact Person *", "name_ph": "Your name",
        "lbl_wa": "WhatsApp Number *", "wa_ph": "e.g. 9665xxxxxxxx",
        "lbl_email": "Email", "email_ph": "you@company.com",
        "lbl_msg": "Message", "msg_ph": "Tell us about your needs...",
        "submit": "💬 Send Inquiry via WhatsApp",
        "submit_note": "Clicking sends your inquiry as a WhatsApp message to our sales team.",
        "required_err": "Please fill in the required fields.",
        "cat_placeholder": "Select category",
    },
    "cn": {
        "lang": "zh-CN", "dir": "ltr", "locale": "zh_CN",
        "title": "Mojin — B2B 询盘 | 无纺布 OEM/ODM 工厂",
        "nav_home": "首页", "nav_products": "产品", "nav_about": "关于我们",
        "nav_inquiry": "B2B 询盘", "nav_faq": "常见问题",
        "hero_badge": "🇸🇦 工厂直供 · 湖北仙桃 · CE / SASO / ISO 13485",
        "hero_title": "获取报价",
        "hero_sub": "批量价格、OEM/ODM 定制、自有品牌与快速打样——直连全国最大无纺布产业带。",
        "planner_title": "🤖 先让 AI 帮你规划采购清单",
        "planner_sub": "告诉 AI 购物规划师你的需求（诊所配置、酒店用品、防护耗材包……），数秒内生成结构化清单（含沙特 15% VAT 到手价），再发给我们报价。",
        "planner_btn": "打开 AI 购物规划师",
        "form_title": "📩 或直接提交询盘",
        "form_note": "带 * 为必填。我们 24 小时内回复。",
        "grp_product": "产品需求",
        "grp_contact": "联系信息",
        "grp_msg": "补充说明",
        "lbl_category": "产品品类 *", "cat_options": ["隔离衣", "防护帽", "鞋套", "丁腈手套", "口罩", "OEM/定制产品", "其他"],
        "lbl_qty": "预计数量", "qty_ph": "如：每月 500 包",
        "lbl_custom": "定制需求", "custom_ph": "Logo 印刷、尺寸/规格调整、包装、自有品牌……",
        "lbl_company": "公司/机构 *", "company_ph": "公司名称",
        "lbl_name": "联系人 *", "name_ph": "您的姓名",
        "lbl_wa": "WhatsApp 号码 *", "wa_ph": "如：9665xxxxxxxx",
        "lbl_email": "邮箱", "email_ph": "you@company.com",
        "lbl_msg": "补充说明", "msg_ph": "告诉我们您的需求……",
        "submit": "💬 通过 WhatsApp 发送询盘",
        "submit_note": "点击后将您的询盘以 WhatsApp 消息发送给我们的销售团队。",
        "required_err": "请填写必填项。",
        "cat_placeholder": "选择品类",
    },
    "ar": {
        "lang": "ar", "dir": "rtl", "locale": "ar_SA",
        "title": "موجين — استفسار B2B | مصنع أقمشة غير منسوجة OEM/ODM",
        "nav_home": "الرئيسية", "nav_products": "المنتجات", "nav_about": "من نحن",
        "nav_inquiry": "استفسار الأعمال", "nav_faq": "الأسئلة",
        "hero_badge": "🇸🇦 مباشرة من المصنع · شيانتاو الصين · CE / SASO / ISO 13485",
        "hero_title": "اطلب عرض سعر",
        "hero_sub": "أسعار الجملة، تخصيص OEM/ODM، علامة خاصة ونماذج سريعة — مباشرة من أكبر مركز صناعي للأقمشة غير المنسوجة في العالم.",
        "planner_title": "🤖 دع الذكاء الاصطناعي يخطط قائمتك أولاً",
        "planner_sub": "أخبر مخطط التسوق الذكي باحتياجاتك (تجهيز عيادة، مستلزمات فنادق، حزمة معدات وقاية...) واحصل على قائمة منظمة بأسعار تشمل ضريبة القيمة المضافة 15% خلال ثوانٍ، ثم أرسلها لنا لعرض السعر.",
        "planner_btn": "افتح مخطط التسوق الذكي",
        "form_title": "📩 أو أرسل استفسارك مباشرة",
        "form_note": "الحقول المميزة بـ * إلزامية. نرد خلال 24 ساعة.",
        "grp_product": "احتياجات المنتج",
        "grp_contact": "بيانات التواصل",
        "grp_msg": "رسالة",
        "lbl_category": "فئة المنتج *", "cat_options": ["أثواب عزل", "قبعات واقية", "أغطية أحذية", "قفازات نيتريل", "كمامات", "منتجات مخصصة OEM", "أخرى"],
        "lbl_qty": "الكمية التقديرية", "qty_ph": "مثال: 500 عبوة شهرياً",
        "lbl_custom": "احتياجات التخصيص", "custom_ph": "طباعة الشعار، تغيير المقاس/المواصفات، التغليف، علامة خاصة...",
        "lbl_company": "الشركة / المؤسسة *", "company_ph": "اسم الشركة",
        "lbl_name": "جهة الاتصال *", "name_ph": "اسمك",
        "lbl_wa": "رقم واتساب *", "wa_ph": "مثال: 9665xxxxxxxx",
        "lbl_email": "البريد الإلكتروني", "email_ph": "you@company.com",
        "lbl_msg": "رسالة", "msg_ph": "أخبرنا عن احتياجاتك...",
        "submit": "💬 أرسل الاستفسار عبر واتساب",
        "submit_note": "سيتم إرسال استفسارك كرسالة واتساب إلى فريق المبيعات.",
        "required_err": "يرجى تعبئة الحقول الإلزامية.",
        "cat_placeholder": "اختر الفئة",
    },
}


def header_for(key, t):
    """单一 <header>（含单一 mobile-nav）；类名与 index.html 逐字节一致，文案走 nav_*。"""
    home = "index.html" if key == "en" else f"index-{key}.html"
    about = f"about-{key}.html"
    # 移动端语言链接：循环切换下一个语言（EN→CN→AR→EN），修死控件
    keys = list(PAGES.keys())
    next_key = keys[(keys.index(key) + 1) % len(keys)]
    cur_label = {"en": "EN", "cn": "CN", "ar": "AR"}[key]
    return f"""<header>
  <div class="container">
    <button class="hamburger" onclick="toggleMobileNav()">☰</button>

    <a href="{home}" class="logo">MOJIN</a>

    <nav class="desktop-nav">
      <a href="{home}">{t['nav_home']}</a>
      <a href="product.html">{t['nav_products']}</a>
      <a href="{about}">{t['nav_about']}</a>
      <a href="inquiry-{key}.html">{t['nav_inquiry']}</a>
      <a href="faq.html">{t['nav_faq']}</a>
    </nav>

    <div class="header-actions">
      <div class="lang-switcher" id="langSwitcher">
        <button class="lang-btn" onclick="toggleLang()">
          <span class="globe">🌐 -->
          <span id="currentLang">EN</span>
          <span class="arrow">▾</span>
        </button>
        <div class="lang-dropdown" id="langDropdown">
          <button class="active-lang" onclick="switchLang('EN')">EN</button>
          <button onclick="switchLang('CN')">CN</button>
          <button onclick="switchLang('AR')">AR</button>
        </div>
      </div>

      <button class="cart-btn" onclick="window.location.href='checkout.html'">
        🛒<span class="cart-badge">0</span>
      </button>
    </div>
  </div>

  <div class="mobile-nav" id="mobileNav">
    <button class="close-nav" onclick="toggleMobileNav()">✕</button>
    <a href="{home}">{t['nav_home']}</a>
    <a href="product.html">{t['nav_products']}</a>
    <a href="{about}">{t['nav_about']}</a>
    <a href="inquiry-{key}.html">{t['nav_inquiry']}</a>
    <a href="faq.html">{t['nav_faq']}</a>
    <a href="javascript:void(0)" onclick="switchLang('{next_key.upper()}')" class="mobile-lang">
      🌐 Language: <span id="mobileLang">{cur_label}</span>
    </a>
  </div>
</header>"""


FOOTER = """<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <h3>MOJIN <span class="sub">موجين · 莲墨瑾</span></h3>
        <p class="footer-about">
          Protection You Can Trust.<br>
          Professional-grade protective gear, direct from our factory to your door.
        </p>
        <div class="contact-info footer-contact">
          📧 info@mojin.store<br>
          💬 WhatsApp: <span data-wa-placeholder></span>
        </div>
      </div>
      <div>
        <h4>Products</h4>
        <ul>
          <li><a href="product.html">Isolation Gowns</a></li>
          <li><a href="product.html">Protective Caps</a></li>
          <li><a href="product.html">Shoe Covers</a></li>
          <li><a href="product.html">Gloves</a></li>
        </ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="about-en.html">About Mojin</a></li>
          <li><a href="faq.html">FAQ</a></li>
          <li><a href="faq.html">Contact Us</a></li>
          <li><a href="shipping.html">Shipping Policy</a></li>
          <li><a href="return-policy.html">Return Policy</a></li>
          <li><a href="privacy.html">Privacy Policy</a></li>
        </ul>
      </div>
      <div>
        <h4>Contact</h4>
        <div class="contact-info">
          📧 info@mojin.store<br>
          💬 WhatsApp<br>
          📍 Saudi Arabia<br>
          🏭 China
        </div>
      </div>
    </div>
    <div class="copyright">
      © {YEAR} Mojin. All rights reserved. · 莲墨瑾服装有限公司 · موجين. جميع الحقوق محفوظة.
    </div>
  </div>
</footer>"""


def main_for(t):
    """class 化主体：hero + planner 卡 + 分组表单。"""
    options = "\n".join(
        f'                <option value="{o}">{o}</option>' for o in t["cat_options"]
    )
    return f"""<main>
  <section class="hero">
    <div class="hero-content">
      <p class="hero-badge">{t['hero_badge']}</p>
      <h1 class="tagline">{t['hero_title']}</h1>
      <p class="sub">{t['hero_sub']}</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="planner-card">
        <h2 class="planner-title">{t['planner_title']}</h2>
        <p class="planner-sub">{t['planner_sub']}</p>
        <a href="#" onclick="window.open(SITE_CONFIG.plannerUrl,'_blank');return false;" class="btn btn-primary planner-cta">{t['planner_btn']}</a>
      </div>
    </div>
  </section>

  <section class="section alt">
    <div class="container">
      <div class="form-shell">
        <h2 class="section-title">{t['form_title']}</h2>
        <p class="form-note">{t['form_note']}</p>
        <form id="inquiryForm" class="inquiry-form" onsubmit="submitInquiry(event)">
          <fieldset class="form-group">
            <legend class="form-group-title">{t['grp_product']}</legend>
            <div class="field">
              <label class="field-label" for="fCategory">{t['lbl_category']}</label>
              <select id="fCategory" class="field-select" required>
                <option value="" disabled selected>{t['cat_placeholder']}</option>
                {options}
              </select>
            </div>
            <div class="field">
              <label class="field-label" for="fQty">{t['lbl_qty']}</label>
              <input id="fQty" type="text" class="field-input" placeholder="{t['qty_ph']}">
            </div>
            <div class="field">
              <label class="field-label" for="fCustom">{t['lbl_custom']}</label>
              <textarea id="fCustom" rows="2" class="field-textarea" placeholder="{t['custom_ph']}"></textarea>
            </div>
          </fieldset>

          <fieldset class="form-group">
            <legend class="form-group-title">{t['grp_contact']}</legend>
            <div class="field-row">
              <div class="field">
                <label class="field-label" for="fCompany">{t['lbl_company']}</label>
                <input id="fCompany" type="text" class="field-input" required placeholder="{t['company_ph']}">
              </div>
              <div class="field">
                <label class="field-label" for="fName">{t['lbl_name']}</label>
                <input id="fName" type="text" class="field-input" required placeholder="{t['name_ph']}">
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <label class="field-label" for="fWa">{t['lbl_wa']}</label>
                <input id="fWa" type="tel" class="field-input" required placeholder="{t['wa_ph']}">
              </div>
              <div class="field">
                <label class="field-label" for="fEmail">{t['lbl_email']}</label>
                <input id="fEmail" type="email" class="field-input" placeholder="{t['email_ph']}">
              </div>
            </div>
          </fieldset>

          <fieldset class="form-group">
            <legend class="form-group-title">{t['grp_msg']}</legend>
            <div class="field">
              <label class="field-label" for="fMsg">{t['lbl_msg']}</label>
              <textarea id="fMsg" rows="3" class="field-textarea" placeholder="{t['msg_ph']}"></textarea>
            </div>
          </fieldset>

          <button type="submit" class="btn-submit">{t['submit']}</button>
          <p class="submit-note">{t['submit_note']}</p>
        </form>
      </div>
    </div>
  </section>
</main>"""


def js_for(t):
    """JS 原样（唯一差异：required_err 文案随语言）。"""
    return f"""<script>
  function submitInquiry(e) {{
    e.preventDefault();
    const category = document.getElementById('fCategory').value;
    const company = document.getElementById('fCompany').value.trim();
    const name = document.getElementById('fName').value.trim();
    const wa = document.getElementById('fWa').value.trim();
    if (!category || !company || !name || !wa) {{
      alert("{t['required_err']}");
      return;
    }}
    const qty = document.getElementById('fQty').value.trim();
    const custom = document.getElementById('fCustom').value.trim();
    const email = document.getElementById('fEmail').value.trim();
    const msg = document.getElementById('fMsg').value.trim();
    const lines = [
      '📩 NEW B2B INQUIRY — mojin.store',
      'Category: ' + category,
      'Company: ' + company,
      'Contact: ' + name,
      'WhatsApp: ' + wa,
    ];
    if (email) lines.push('Email: ' + email);
    if (qty) lines.push('Estimated qty: ' + qty);
    if (custom) lines.push('Customization: ' + custom);
    if (msg) lines.push('Message: ' + msg);
    window.open(waOrderLink(lines.join('\\n')), '_blank');
    if (window.mjTrack) window.mjTrack('generate_lead', {{ category, company }});
  }}
</script>
<script>
  function toggleMobileNav() {{
    document.getElementById('mobileNav').classList.toggle('active');
  }}
  function toggleLang() {{
    document.getElementById('langDropdown').classList.toggle('active');
  }}
  function switchLang(lang) {{
    const page = {{ EN: 'inquiry-en.html', CN: 'inquiry-cn.html', AR: 'inquiry-ar.html' }}[lang];
    if (page) window.location.href = page;
  }}
</script>"""


def build(key, t):
    header = header_for(key, t)
    main = main_for(t)
    js = js_for(t)
    page = f"""<!DOCTYPE html>
<html lang="{t['lang']}" dir="{t['dir']}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <title>{t['title']}</title>
  <meta property="og:title" content="{t['title']}">
  <meta property="og:description" content="{t['hero_sub']}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://mojin.store/inquiry-{key}.html">
  <meta property="og:site_name" content="Mojin">
  <meta property="og:locale" content="{t['locale']}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="{FONTS_URL}" rel="stylesheet">
  <link rel="stylesheet" href="css/vars.css">
  <link rel="stylesheet" href="css/inquiry.css">
</head>
<body>
{header}
{main}
{FOOTER}
{js}
{SCRIPTS}
</body>
</html>"""
    return page


def main():
    for key, t in PAGES.items():
        page = build(key, t).replace("{YEAR}", str(datetime.datetime.now().year))
        out = BASE / f"inquiry-{key}.html"
        out.write_text(page, encoding="utf-8")
        print(f"✅ inquiry-{key}.html（{len(page)} bytes）")
    print("完成")


if __name__ == "__main__":
    main()
