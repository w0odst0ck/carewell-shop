#!/usr/bin/env python3
"""生成 inquiry-{en,cn,ar}.html：复用 index.html 的 style/header/footer，中间为 B2B 询盘表单 + AI 规划师入口。"""
import re
from pathlib import Path

BASE = Path("/home/l/.openclaw/workspace/projects/mojin-store/技术栈/carewell-shop")
idx = (BASE / "index.html").read_text(encoding="utf-8")

# 提取 <style> 块
style = re.search(r"<style>.*?</style>", idx, re.S).group(0)

# 提取 header（<header>...</header>，含 mobile-nav）
header = re.search(r"<header>.*?</header>", idx, re.S).group(0)
# header 里加 Inquiry 导航（desktop + mobile 已含）
header = header.replace('<a href="about-en.html">About Us</a>\n      <a href="inquiry-en.html">B2B Inquiry</a>',
                        '<a href="about-en.html">About Us</a>')
header = header.replace('<a href="faq.html">FAQ</a>\n    </nav>', '<a href="inquiry-en.html">B2B Inquiry</a>\n      <a href="faq.html">FAQ</a>\n    </nav>')

# 提取 footer（<footer>...</footer>）
footer = re.search(r"<footer>.*?</footer>", idx, re.S).group(0)

# 尾部脚本（site-config/order-lang/cart/ga4/wa-float）
scripts = """
<script src="data/site-config.js"></script>
<script src="data/order-lang.js"></script>
<script src="data/cart.js"></script>
<script src="data/ga4.js"></script>
<script src="data/wa-float.js"></script>
"""

PAGES = {
    "en": {
        "lang": "en", "dir": "ltr",
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
        "lang": "zh-CN", "dir": "ltr",
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
        "lang": "ar", "dir": "rtl",
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

for key, t in PAGES.items():
    lang_switch = f"""
    <button class="active-lang" onclick="switchLang('EN')">EN</button>
    <button onclick="switchLang('CN')">CN</button>
    <button onclick="switchLang('AR')">AR</button>"""
    options = "\n".join(f'            <option value="{o}">{o}</option>' for o in t["cat_options"])
    inquiry = f"""<!DOCTYPE html>
<html lang="{t['lang']}" dir="{t['dir']}">
<head>
{idx[:idx.find('<title>')].replace('<meta property="og:url" content="https://mojin.store/">', '')}
  <title>{t['title']}</title>
  <meta property="og:title" content="{t['title']}">
  <meta property="og:description" content="{t['hero_sub']}">
</head>
<body>
{header}
  <div class="mobile-nav" id="mobileNav">
    <button class="close-nav" onclick="toggleMobileNav()">✕</button>
    <a href="index.html">{t['nav_home']}</a>
    <a href="product.html">{t['nav_products']}</a>
    <a href="about-en.html">{t['nav_about']}</a>
    <a href="inquiry-{key}.html">{t['nav_inquiry']}</a>
    <a href="faq.html">{t['nav_faq']}</a>
  </div>
</header>

<main>
  <section class="hero">
    <div class="hero-content">
      <p style="font-size:14px;letter-spacing:1px;color:var(--sand-orange);margin-bottom:8px;font-weight:600;">{t['hero_badge']}</p>
      <h1 class="tagline">{t['hero_title']}</h1>
      <p class="sub">{t['hero_sub']}</p>
    </div>
  </section>

  <!-- AI 规划师入口 -->
  <section class="section">
    <div class="container" style="max-width:720px;text-align:center;background:var(--warm-blue);color:var(--white);border-radius:16px;padding:28px 24px;">
      <h2 style="color:var(--white);margin-bottom:10px;">{t['planner_title']}</h2>
      <p style="font-size:14px;line-height:1.8;opacity:.95;margin-bottom:18px;">{t['planner_sub']}</p>
      <a href="#" onclick="window.open(SITE_CONFIG.plannerUrl,'_blank');return false;" class="btn btn-primary" style="font-size:15px;">{t['planner_btn']}</a>
    </div>
  </section>

  <!-- 询盘表单 -->
  <section class="section alt">
    <div class="container" style="max-width:680px;">
      <h2 class="section-title">{t['form_title']}</h2>
      <p style="font-size:13px;color:var(--warm-text);margin-bottom:20px;">{t['form_note']}</p>
      <form id="inquiryForm" onsubmit="submitInquiry(event)" style="display:grid;gap:14px;">
        <div>
          <label for="fCategory" style="font-weight:600;font-size:14px;">{t['lbl_category']}</label>
          <select id="fCategory" required style="width:100%;padding:12px;border-radius:10px;border:1px solid #ddd;margin-top:6px;font-family:inherit;">
            <option value="" disabled selected>{t['cat_placeholder']}</option>
            {options}
          </select>
        </div>
        <div>
          <label for="fQty" style="font-weight:600;font-size:14px;">{t['lbl_qty']}</label>
          <input id="fQty" type="text" placeholder="{t['qty_ph']}" style="width:100%;padding:12px;border-radius:10px;border:1px solid #ddd;margin-top:6px;font-family:inherit;">
        </div>
        <div>
          <label for="fCustom" style="font-weight:600;font-size:14px;">{t['lbl_custom']}</label>
          <textarea id="fCustom" rows="2" placeholder="{t['custom_ph']}" style="width:100%;padding:12px;border-radius:10px;border:1px solid #ddd;margin-top:6px;font-family:inherit;"></textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
          <div>
            <label for="fCompany" style="font-weight:600;font-size:14px;">{t['lbl_company']}</label>
            <input id="fCompany" type="text" required placeholder="{t['company_ph']}" style="width:100%;padding:12px;border-radius:10px;border:1px solid #ddd;margin-top:6px;font-family:inherit;">
          </div>
          <div>
            <label for="fName" style="font-weight:600;font-size:14px;">{t['lbl_name']}</label>
            <input id="fName" type="text" required placeholder="{t['name_ph']}" style="width:100%;padding:12px;border-radius:10px;border:1px solid #ddd;margin-top:6px;font-family:inherit;">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
          <div>
            <label for="fWa" style="font-weight:600;font-size:14px;">{t['lbl_wa']}</label>
            <input id="fWa" type="tel" required placeholder="{t['wa_ph']}" style="width:100%;padding:12px;border-radius:10px;border:1px solid #ddd;margin-top:6px;font-family:inherit;">
          </div>
          <div>
            <label for="fEmail" style="font-weight:600;font-size:14px;">{t['lbl_email']}</label>
            <input id="fEmail" type="email" placeholder="{t['email_ph']}" style="width:100%;padding:12px;border-radius:10px;border:1px solid #ddd;margin-top:6px;font-family:inherit;">
          </div>
        </div>
        <div>
          <label for="fMsg" style="font-weight:600;font-size:14px;">{t['lbl_msg']}</label>
          <textarea id="fMsg" rows="3" placeholder="{t['msg_ph']}" style="width:100%;padding:12px;border-radius:10px;border:1px solid #ddd;margin-top:6px;font-family:inherit;"></textarea>
        </div>
        <button type="submit" class="btn-submit" style="width:100%;background:var(--sand-orange);color:#fff;border:none;border-radius:12px;padding:16px;font-size:16px;font-weight:700;cursor:pointer;">{t['submit']}</button>
        <p style="font-size:12px;color:var(--warm-text);text-align:center;">{t['submit_note']}</p>
      </form>
    </div>
  </section>
</main>

{footer}
<script>
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
{scripts}
</body>
</html>"""
    out = BASE / f"inquiry-{key}.html"
    out.write_text(inquiry, encoding="utf-8")
    print(f"✅ inquiry-{key}.html（{len(inquiry)} bytes）")

print("完成")
