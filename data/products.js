const PRODUCTS = {
  'gown-l2': {
    en: {
      name: 'AAMI Level 2 Isolation Gown',
      sub: 'ثوب عزل طبي مستوى 2 · 医用隔离衣',
      cat: 'Isolation Gowns',
      catAr: 'أثواب عزل',
      desc: `<h4>Product Overview</h4><p>The Mojin Disposable Isolation Gown provides reliable protection for medical, industrial, and household environments. Made from high-quality PP+PE non-woven fabric, it offers excellent water resistance while maintaining breathability for all-day comfort.</p>
<h4>Key Features</h4><ul><li>AAMI Level 2 Protection — tested for fluid resistance</li><li>Comfortable Fit — elastic cuffs, adjustable neck ties</li><li>Breathable Material — PP+PE non-woven, reduces heat buildup</li><li>CE & SASO Certified — meets international safety standards</li><li>Individually Packaged — each gown sealed for hygiene</li></ul>
<h4>Specifications</h4><ul><li>Material: PP+PE non-woven fabric (35gsm)</li><li>Sizes: M, L, XL, XXL</li><li>Colors: Blue, White, Yellow</li><li>Pack Size: 10 pcs/pack (bulk available)</li><li>Standards: CE, SASO, ISO 13485</li></ul>
<h4>Common Uses</h4><ul><li>Healthcare — clinics, hospitals, dental offices</li><li>Industrial — factories, clean rooms, labs</li><li>Household — cleaning, caregiving</li><li>Other — salons, food processing, agriculture</li></ul>`,
    },
    cn: {
      name: 'AAMI Level 2 一次性隔离衣',
      sub: 'ثوب عزل طبي · Disposable Isolation Gown',
      cat: '隔离衣',
      desc: `<h4>产品概述</h4><p>Mojin 一次性隔离衣为医疗、工业和家庭环境提供可靠防护。采用优质 PP+PE 无纺布，防水透气，全天候舒适。</p>
<h4>主要特点</h4><ul><li>AAMI Level 2 防护 — 通过防液测试</li><li>舒适贴合 — 弹性袖口、可调节颈带</li><li>透气材质 — PP+PE 无纺布，减少闷热</li><li>CE & SASO 认证 — 符合国际安全标准</li><li>独立包装 — 每个密封卫生</li></ul>
<h4>规格参数</h4><ul><li>材质：PP+PE 无纺布 (35gsm)</li><li>尺码：M, L, XL, XXL</li><li>颜色：蓝色、白色、黄色</li><li>包装：10 件/包（可批发）</li><li>认证：CE, SASO, ISO 13485</li></ul>
<h4>适用场景</h4><ul><li>医疗 — 诊所、医院、牙科</li><li>工业 — 工厂、洁净室、实验室</li><li>家用 — 清洁、护工</li><li>其他 — 美容、食品加工、农业</li></ul>`,
    },
    ar: {
      name: 'ثوب عزل طبي مستوى AAMI 2',
      sub: 'Disposable Isolation Gown · 一次性隔离衣',
      cat: 'أثواب عزل',
      desc: `<h4>نظرة عامة</h4><p>يوفر ثوب العزل الطبي من موجين حماية موثوقة للبيئات الطبية والصناعية والمنزلية. مصنوع من قماش PP+PE غير المنسوج عالي الجودة.</p>
<h4>المميزات الرئيسية</h4><ul><li>حماية مستوى AAMI 2 — تم اختبار مقاومة السوائل</li><li>مقاس مريح — أكمام مرنة، أربطة رقبة قابلة للتعديل</li><li>قماش قابل للتنفس — يقلل من تراكم الحرارة</li><li>معتمد من CE و SASO — يلبي معايير السلامة</li><li>مغلف بشكل فردي — كل ثوب مغلق للنظافة</li></ul>
<h4>المواصفات</h4><ul><li>المادة: قماش PP+PE غير منسوج (35gsm)</li><li>المقاسات: M، L، XL، XXL</li><li>الألوان: أزرق، أبيض، أصفر</li><li>حجم العبوة: 10 قطع/عبوة</li><li>المعايير: CE، SASO، ISO 13485</li></ul>
<h4>الاستخدامات الشائعة</h4><ul><li>الرعاية الصحية — العيادات، المستشفيات</li><li>الصناعة — المصانع، الغرف النظيفة</li><li>المنزل — التنظيف، رعاية المسنين</li><li>أخرى — صالونات، تجهيز الأغذية</li></ul>`,
    },
    price: 45, oldPrice: 55, unit: '/ 10 pcs', sale: '-18%',
    rating: 4.8, reviews: 12,
    sizes: ['M','L','XL','XXL'], colors: ['Blue','White','Yellow'],
  },
  'gown-l1': {
    en: { name: 'Disposable Isolation Gown', sub: 'Economy · 经济款', cat: 'Isolation Gowns', desc: '<h4>Product Overview</h4><p>An economical disposable isolation gown suitable for general protection needs. Made from lightweight non-woven fabric for comfort during extended wear.</p><h4>Key Features</h4><ul><li>Lightweight PP non-woven material</li><li>Elastic cuffs for secure fit</li><li>Breathable for all-day use</li><li>CE Certified</li><li>Bulk packaging available</li></ul>' },
    cn: { name: '一次性隔离衣（经济款）', sub: 'Economy · Disposable Gown', cat: '隔离衣', desc: '<h4>产品概述</h4><p>经济型一次性隔离衣，适合一般防护需求。轻质无纺布材质，长时间穿着舒适。</p><h4>主要特点</h4><ul><li>轻质 PP 无纺布</li><li>弹性袖口，贴合牢固</li><li>透气设计，全天舒适</li><li>CE 认证</li><li>可批量包装</li></ul>' },
    ar: { name: 'ثوب عزل يمكن التخلص منه', sub: 'اقتصادي · Economy', cat: 'أثواب عزل', desc: '<h4>نظرة عامة</h4><p>ثوب عزل اقتصادي يمكن التخلص منه ومناسب لاحتياجات الحماية العامة. مصنوع من قماش غير منسوج خفيف الوزن.</p><h4>المميزات</h4><ul><li>قماش PP خفيف غير منسوج</li><li>أكمام مرنة لمقاس آمن</li><li>قابل للتنفس للاستخدام الطويل</li><li>معتمد CE</li><li>متاح بالتعبئة بالجملة</li></ul>' },
    price: 35, oldPrice: 42, unit: '/ 10 pcs', sale: '-17%', rating: 4.5, reviews: 8,
    sizes: ['M','L','XL','XXL'], colors: ['Blue','White'],
  },
  'cap': {
    en: { name: 'PPE Protective Cap (50 pcs)', sub: '50 pcs · 防护帽', cat: 'Protective Caps', desc: '<h4>Product Overview</h4><p>Lightweight disposable protective caps made from non-woven fabric. Ideal for maintaining hygiene standards in medical, industrial, and food service environments.</p><h4>Key Features</h4><ul><li>Breathable non-woven fabric</li><li>One-size-fits-most with elastic edge</li><li>50 pcs per pack</li><li>CE Certified</li><li>Disposable, single-use</li></ul>' },
    cn: { name: 'PPE 防护帽（50只装）', sub: '50只装 · 无纺布', cat: '防护帽', desc: '<h4>产品概述</h4><p>轻便一次性防护帽，无纺布材质。适用于医疗、工业和食品行业保持卫生标准。</p><h4>主要特点</h4><ul><li>透气无纺布</li><li>弹力边缘，均码适用</li><li>50 只/包</li><li>CE 认证</li><li>一次性使用</li></ul>' },
    ar: { name: 'قبعة واقية PPE (50 قطعة)', sub: '50 قطعة · قماش غير منسوج', cat: 'أغطية رأس', desc: '<h4>نظرة عامة</h4><p>أغطية رأس واقية خفيفة يمكن التخلص منها مصنوعة من قماش غير منسوج. مثالية للحفاظ على معايير النظافة.</p><h4>المميزات</h4><ul><li>قماش غير منسوج قابل للتنفس</li><li>مقاس واحد مناسب لمعظم الرؤوس</li><li>50 قطعة/عبوة</li><li>معتمد CE</li><li>للاستخدام مرة واحدة</li></ul>' },
    price: 18, oldPrice: null, unit: '/ 50 pcs', sale: null, rating: 4.8, reviews: 15,
    sizes: ['One Size'], colors: ['White','Blue'],
  },
  'shoe-cover': {
    en: { name: 'Disposable Shoe Covers (100 pcs)', sub: '100 pcs · 鞋套', cat: 'Shoe Covers', desc: '<h4>Product Overview</h4><p>Durable disposable shoe covers with non-slip soles. Perfect for maintaining clean environments in medical facilities, clean rooms, and food processing areas.</p><h4>Key Features</h4><ul><li>Water-resistant non-woven material</li><li>Non-slip sole design</li><li>Elastic opening for secure fit</li><li>100 pcs per pack</li><li>CE Certified</li></ul>' },
    cn: { name: '一次性鞋套（100只装）', sub: '100只装 · 防滑底', cat: '鞋套', desc: '<h4>产品概述</h4><p>耐用一次性鞋套，防滑鞋底设计。适用于医院、洁净室和食品加工业保持环境卫生。</p><h4>主要特点</h4><ul><li>防水无纺布材质</li><li>防滑鞋底</li><li>弹性开口，贴合牢固</li><li>100 只/包</li><li>CE 认证</li></ul>' },
    ar: { name: 'أغطية أحذية يمكن التخلص منها (100 قطعة)', sub: '100 قطعة · نعل غير قابل للانزلاق', cat: 'أغطية أحذية', desc: '<h4>نظرة عامة</h4><p>أغطية أحذية متينة يمكن التخلص منها بنعل غير قابل للانزلاق. مثالية للحفاظ على البيئات النظيفة.</p><h4>المميزات</h4><ul><li>مادة غير منسوجة مقاومة للماء</li><li>تصميم نعل غير قابل للانزلاق</li><li>فتحة مرنة لمقاس آمن</li><li>100 قطعة/عبوة</li><li>معتمد CE</li></ul>' },
    price: 22, oldPrice: null, unit: '/ 100 pcs', sale: null, rating: 4.6, reviews: 10,
    sizes: ['Standard','Large'], colors: ['Blue','White'],
  },
  'glove': {
    en: { name: 'Nitrile Gloves (100 pcs)', sub: '100 pcs · 丁腈手套', cat: 'Gloves', desc: '<h4>Product Overview</h4><p>High-quality nitrile examination gloves offering excellent chemical resistance and tactile sensitivity. Latex-free, suitable for medical and industrial use.</p><h4>Key Features</h4><ul><li>Nitrile material — latex-free, no allergy risk</li><li>Excellent chemical splash resistance</li><li>High tactile sensitivity</li><li>Textured fingertips for grip</li><li>100 pcs per box</li></ul>' },

    cn: { name: '丁腈手套（100只装）', sub: '100只装 · 无乳胶', cat: '手套', desc: '<h4>产品概述</h4><p>优质丁腈检查手套，出色的耐化学性和触觉灵敏度。无乳胶，适合医疗和工业使用。</p><h4>主要特点</h4><ul><li>丁腈材质 — 无乳胶，无过敏风险</li><li>出色的防化学品飞溅</li><li>高触觉灵敏度</li><li>指尖纹理防滑</li><li>100 只/盒</li></ul>' },
    ar: { name: 'قفازات نيتريل (100 قطعة)', sub: '100 قطعة · خالية من اللاتكس', cat: 'قفازات', desc: '<h4>نظرة عامة</h4><p>قفازات فحص نيتريل عالية الجودة توفر مقاومة ممتازة للمواد الكيميائية وحساسية عالية للمس. خالية من اللاتكس.</p><h4>المميزات</h4><ul><li>مادة نيتريل — خالية من اللاتكس</li><li>مقاومة ممتازة لرذاذ المواد الكيميائية</li><li>حساسية عالية للمس</li><li>أطراف أصابع محكمة</li><li>100 قطعة/علبة</li></ul>' },
    price: 28, oldPrice: 35, unit: '/ 100 pcs', sale: '-20%', rating: 4.7, reviews: 18,
    sizes: ['S','M','L','XL'], colors: ['Blue','Black'],
    image: null,
  },

  // ===== Real Cap Products (from factory samples) =====
  'cap-bouffant': {
    en: { name: 'Bouffant Doctor Cap (Handmade)', sub: '100 pcs · 手工医生帽', cat: 'Protective Caps', desc: '<h4>Product Overview</h4><p>Classic handmade bouffant cap made from high-quality non-woven fabric. Features elastic edge for comfortable all-day wear. Ideal for medical staff, food service workers, and cleanroom environments. Breathable and lightweight.</p><h4>Key Features</h4><ul><li>Handmade construction for consistent quality</li><li>Elastic edge — one size fits most</li><li>Breathable non-woven fabric</li><li>100 pcs per pack</li><li>CE Certified</li></ul><h4>Common Uses</h4><ul><li>Healthcare — hospitals, clinics, dental</li><li>Food Service — kitchens, restaurants</li><li>Industrial — cleanrooms, light manufacturing</li><li>Hospitality — hotels, salons</li></ul>' },
    cn: { name: '手工医生帽（无纺布）', sub: '100只装 · Bouffant Cap', cat: '防护帽', desc: '<h4>产品概述</h4><p>经典手工医生帽，优质无纺布材质。弹力边缘，全天佩戴舒适。适用于医务、餐饮和洁净室环境。</p><h4>主要特点</h4><ul><li>手工制作，品质稳定</li><li>弹力边缘，均码适用</li><li>透气无纺布</li><li>100 只/包</li><li>CE 认证</li></ul><h4>适用场景</h4><ul><li>医疗 — 医院、诊所、牙科</li><li>餐饮 — 厨房、餐厅</li><li>工业 — 洁净室、轻工制造</li><li>酒店 — 客房、美容</li></ul>' },
    ar: { name: 'قبعة بوفان (مصنوعة يدويًا)', sub: '100 قطعة · يدوي', cat: 'أغطية رأس', desc: '<h4>نظرة عامة</h4><p>قبعة بوفان كلاسيكية مصنوعة يدويًا من قماش غير منسوج عالي الجودة. حافة مرنة لراحة الاستخدام اليومي.</p><h4>المميزات</h4><ul><li>صناعة يدوية لجودة ثابتة</li><li>حافة مرنة — مقاس واحد</li><li>قماش غير منسوج قابل للتنفس</li><li>100 قطعة/عبوة</li><li>معتمد CE</li></ul><h4>الاستخدامات</h4><ul><li>الرعاية الصحية</li><li>خدمات الطعام</li><li>الغرف النظيفة</li><li>الضيافة</li></ul>' },
    price: 29, oldPrice: null, unit: '/ 100 pcs', sale: null, rating: 4.6, reviews: 6,
    sizes: ['One Size'], colors: ['White'],
    image: 'images/手工医生帽.jpg',
  },

  'cap-round': {
    en: { name: 'Regular Bouffant Cap', sub: '100 pcs · 普通圆帽', cat: 'Protective Caps', desc: '<h4>Product Overview</h4><p>Standard disposable bouffant cap made from lightweight non-woven fabric. Elastic edge ensures secure fit for all head sizes. Suitable for healthcare, food processing, hospitality, and industrial use.</p><h4>Key Features</h4><ul><li>Lightweight non-woven fabric</li><li>Elastic edge — fits all head sizes</li><li>Breathable and comfortable</li><li>100 pcs per pack</li><li>CE Certified</li></ul><h4>Common Uses</h4><ul><li>Healthcare — general ward, triage</li><li>Food Industry — processing, packaging</li><li>Hospitality — housekeeping</li><li>Industrial — basic cleanroom</li></ul>' },
    cn: { name: '普通圆帽（无纺布）', sub: '100只装 · Bouffant Cap', cat: '防护帽', desc: '<h4>产品概述</h4><p>标准一次性圆帽，轻质无纺布材质。弹力边缘适合各种头型。适用于医疗、食品加工、酒店和工业环境。</p><h4>主要特点</h4><ul><li>轻质无纺布</li><li>弹力边缘，适合各种头型</li><li>透气舒适</li><li>100 只/包</li><li>CE 认证</li></ul><h4>适用场景</h4><ul><li>医疗 — 普通病房、分诊</li><li>食品 — 加工、包装</li><li>酒店 — 客房清洁</li><li>工业 — 基础洁净室</li></ul>' },
    ar: { name: 'قبعة بوفان عادية', sub: '100 قطعة · عادي', cat: 'أغطية رأس', desc: '<h4>نظرة عامة</h4><p>قبعة بوفان عادية يمكن التخلص منها مصنوعة من قماش غير منسوج خفيف الوزن. حافة مرنة تناسب جميع أحجام الرأس.</p><h4>المميزات</h4><ul><li>قماش غير منسوج خفيف الوزن</li><li>حافة مرنة تناسب الجميع</li><li>قابل للتنفس ومريح</li><li>100 قطعة/عبوة</li><li>معتمد CE</li></ul><h4>الاستخدامات</h4><ul><li>الرعاية الصحية</li><li>الصناعة الغذائية</li><li>الضيافة</li><li>الصناعة</li></ul>' },
    price: 22, oldPrice: null, unit: '/ 100 pcs', sale: null, rating: 4.5, reviews: 8,
    sizes: ['One Size'], colors: ['White','Green'],
    image: 'images/普通圆帽.jpg',
  },

  'cap-round-w': {
    en: { name: 'Bouffant Cap (White)', sub: '100 pcs · 白色圆帽', cat: 'Protective Caps', desc: '<h4>Product Overview</h4><p>Disposable white bouffant cap made from lightweight non-woven fabric. Elastic edge for secure fit. 100 pcs per pack.</p><h4>Key Features</h4><ul><li>White non-woven material</li><li>Elastic edge — one size fits most</li><li>Breathable and lightweight</li><li>100 pcs per pack</li></ul>' },
    cn: { name: '圆帽（白色）', sub: '100只装 · White', cat: '防护帽', desc: '<h4>产品概述</h4><p>一次性白色圆帽，轻质无纺布。弹力边缘贴合牢固。100只/包。</p><h4>主要特点</h4><ul><li>白色无纺布</li><li>弹力边缘，均码适用</li><li>透气轻便</li><li>100 只/包</li></ul>' },
    ar: { name: 'قبعة بوفان (أبيض)', sub: '100 قطعة · أبيض', cat: 'أغطية رأس', desc: '<h4>نظرة عامة</h4><p>قبعة بوفان بيضاء يمكن التخلص منها. قماش غير منسوج خفيف الوزن. حافة مرنة.</p><h4>المميزات</h4><ul><li>مادة غير منسوجة بيضاء</li><li>حافة مرنة</li><li>قابلة للتنفس وخفيفة</li><li>100 قطعة/عبوة</li></ul>' },
    price: 22, oldPrice: null, unit: '/ 100 pcs', sale: null, rating: 4.4, reviews: 4,
    sizes: ['One Size'], colors: ['White'],
    image: 'images/普通圆帽-白.jpg',
  },

  'cap-round-g': {
    en: { name: 'Bouffant Cap (Green)', sub: '100 pcs · 绿色圆帽', cat: 'Protective Caps', desc: '<h4>Product Overview</h4><p>Disposable green bouffant cap made from lightweight non-woven fabric. Elastic edge for secure fit. 100 pcs per pack.</p><h4>Key Features</h4><ul><li>Green non-woven material</li><li>Elastic edge — one size fits most</li><li>Breathable and lightweight</li><li>100 pcs per pack</li></ul>' },
    cn: { name: '圆帽（绿色）', sub: '100只装 · Green', cat: '防护帽', desc: '<h4>产品概述</h4><p>一次性绿色圆帽，轻质无纺布。弹力边缘贴合牢固。100只/包。</p><h4>主要特点</h4><ul><li>绿色无纺布</li><li>弹力边缘，均码适用</li><li>透气轻便</li><li>100 只/包</li></ul>' },
    ar: { name: 'قبعة بوفان (أخضر)', sub: '100 قطعة · أخضر', cat: 'أغطية رأس', desc: '<h4>نظرة عامة</h4><p>قبعة بوفان خضراء يمكن التخلص منها. قماش غير منسوج خفيف الوزن.</p><h4>المميزات</h4><ul><li>مادة غير منسوجة خضراء</li><li>حافة مرنة</li><li>قابلة للتنفس وخفيفة</li><li>100 قطعة/عبوة</li></ul>' },
    price: 22, oldPrice: null, unit: '/ 100 pcs', sale: null, rating: 4.3, reviews: 3,
    sizes: ['One Size'], colors: ['Green'],
    image: 'images/普通圆帽-绿.jpg',
  },

  'cap-striped': {
    en: { name: 'Striped Bouffant Cap', sub: '100 pcs · 条纹圆帽', cat: 'Protective Caps', desc: '<h4>Product Overview</h4><p>Disposable striped bouffant cap made from lightweight non-woven fabric. Elastic edge provides comfortable fit. Popular in food service, hospitality, and industrial cleanroom environments.</p><h4>Key Features</h4><ul><li>Striped non-woven design</li><li>Elastic edge — one size fits most</li><li>Breathable and lightweight</li><li>100 pcs per pack</li><li>CE Certified</li></ul><h4>Common Uses</h4><ul><li>Food Service — commercial kitchens, restaurants</li><li>Hospitality — hotels, catering</li><li>Industrial — light cleanroom, assembly</li><li>Healthcare — general use</li></ul>' },
    cn: { name: '条纹圆帽（无纺布）', sub: '100只装 · Striped', cat: '防护帽', desc: '<h4>产品概述</h4><p>一次性条纹圆帽，轻质无纺布。弹力边缘，舒适贴合。广泛用于餐饮、酒店和工业洁净室。</p><h4>主要特点</h4><ul><li>条纹无纺布设计</li><li>弹力边缘，均码适用</li><li>透气轻便</li><li>100 只/包</li><li>CE 认证</li></ul><h4>适用场景</h4><ul><li>餐饮 — 商业厨房、餐厅</li><li>酒店 — 客房、宴会</li><li>工业 — 洁净室、装配</li><li>医疗 — 一般用途</li></ul>' },
    ar: { name: 'قبعة بوفان مخططة', sub: '100 قطعة · مخطط', cat: 'أغطية رأس', desc: '<h4>نظرة عامة</h4><p>قبعة بوفان مخططة يمكن التخلص منها من قماش غير منسوج خفيف الوزن. حافة مرنة. مشهورة في خدمات الطعام والضيافة.</p><h4>المميزات</h4><ul><li>تصميم غير منسوج مخططة</li><li>حافة مرنة</li><li>قابلة للتنفس وخفيفة</li><li>100 قطعة/عبوة</li><li>معتمد CE</li></ul><h4>الاستخدامات</h4><ul><li>خدمات الطعام</li><li>الضيافة</li><li>الغرف النظيفة</li><li>الرعاية الصحية</li></ul>' },
    price: 25, oldPrice: null, unit: '/ 100 pcs', sale: null, rating: 4.5, reviews: 5,
    sizes: ['One Size'], colors: ['White/Blue Stripe'],
    image: 'images/条毛.jpg',
  }
};
