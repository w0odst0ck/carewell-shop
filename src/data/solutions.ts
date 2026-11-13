/**
 * 场景方案 —— 按客户场景组织，不按品类组织
 *
 * 设计原则：
 *   - 客户不说「我要买口罩」，说「我开酒店/餐厅/诊所，要解决什么问题」
 *   - 核心优势：12 大类 106 子类同厂，可一柜混装（别的厂做不到）
 *   - ⚠️ 不写 MOQ / 交期 / 价格 —— 未获授权，宁缺不编
 */

export type SolutionItem = {
  catId: string; // 对应 products.ts 的大类字母
  items: string[]; // 从该大类的真实子类里挑
};

export type Solution = {
  id: string;
  no: string;
  name: string;
  nameEn: string;
  scene: string; // 一句话场景
  pain: string[]; // 客户的实际问题
  groups: SolutionItem[];
  highlight?: string; // 该方案的独特卖点
};

export const solutions: Solution[] = [
  {
    id: "hospitality",
    no: "01",
    name: "酒店与接待服务",
    nameEn: "Hospitality",
    scene: "客房、餐厅、SPA 与朝觐接待场景的一次性布草与耗材",
    pain: [
      "布草换洗成本高、周转慢，旺季清洗能力跟不上",
      "卫生审计要求布草可追溯，重复使用难以证明清洁",
      "朝觐季客流集中爆发，临时采购来不及",
    ],
    groups: [
      {
        catId: "I",
        items: ["一次性床单/枕套（美容院/酒店/医院）", "无纺布浴巾/毛巾", "压缩毛巾", "擦手巾"],
      },
      { catId: "J", items: ["一次性围裙"] },
      { catId: "E", items: ["一次性帽子（美容/餐饮用）"] },
      { catId: "F", items: ["一次性鞋套"] },
    ],
  },
  {
    id: "catering",
    no: "02",
    name: "餐饮与食品加工",
    nameEn: "Catering & Food Processing",
    scene: "中央厨房、连锁餐饮、食品厂的日常防护耗材",
    pain: [
      "食品卫生审计强制要求发帽、口罩、手套，缺一项就过不了",
      "高频消耗、单次用量小，但断货就停工",
      "多品类分散采购，供应商管理与对账成本高",
    ],
    groups: [
      { catId: "E", items: ["无纺布帽", "条形帽", "圆顶帽 Bouffant", "胡须套"] },
      { catId: "C", items: ["一次性医用口罩", "三层/四层口罩"] },
      { catId: "J", items: ["餐饮围裙", "厨师袖套", "一次性袖套"] },
      { catId: "D", items: ["食品级手套", "PE 手套"] },
      { catId: "F", items: ["一次性鞋套（无纺布/PE/防滑/加厚）"] },
    ],
  },
  {
    id: "beauty",
    no: "03",
    name: "美容美发与理疗",
    nameEn: "Beauty & Wellness",
    scene: "美容院、纹身工作室、理疗与 SPA 的单客耗材",
    pain: [
      "单客单次消耗，用量大、单价低，成本敏感",
      "顾客对卫生的直观感受直接影响复购",
      "品类零散，小批量多批次采购麻烦",
    ],
    groups: [
      { catId: "I", items: ["一次性床单/枕套", "头巾", "面膜纸", "无纺布浴巾/毛巾"] },
      { catId: "D", items: ["丁腈手套（检查/加厚/无粉/蓝丁腈）", "PVC 手套"] },
      { catId: "J", items: ["一次性围裙"] },
    ],
  },
  {
    id: "medical",
    no: "04",
    name: "医疗机构感染控制",
    nameEn: "Infection Control",
    scene: "医院、诊所、检验科、手术室的感染控制耗材",
    pain: [
      "感控流程对耗材规格有硬性要求，规格不符不能进院",
      "多品类分散采购，批次一致性与追溯难",
      "准入资料准备复杂，供应商配合度直接影响上线时间",
    ],
    groups: [
      { catId: "A", items: ["一次性手术衣", "无菌手术衣", "隔离服", "一次性 lab coat"] },
      { catId: "B", items: ["一次性隔离衣", "医用隔离衣", "反穿隔离衣", "防水隔离衣"] },
      { catId: "C", items: ["一次性医用口罩", "外科口罩", "KN95 / N95 / FFP2"] },
      { catId: "D", items: ["医疗检查手套", "丁腈手套（检查/加厚/无粉/蓝丁腈）"] },
      { catId: "G", items: ["一次性手术单", "洞巾", "医用洞巾", "无菌包布"] },
      { catId: "E", items: ["手术帽", "医生帽"] },
      { catId: "F", items: ["一次性鞋套", "靴套"] },
    ],
    highlight: "规格、灭菌方式与包装可按院方感控流程配合",
  },
  {
    id: "eldercare",
    no: "05",
    name: "养老与长期护理",
    nameEn: "Elderly & Long-term Care",
    scene: "养老机构、护理院、居家照护的日常护理耗材",
    pain: [
      "长期高频消耗，价格波动直接影响运营成本",
      "护理垫、隔尿垫等大件耗材占仓储空间",
      "照护人员操作强度高，耗材易用性比单价更重要",
    ],
    groups: [
      {
        catId: "H",
        items: ["护理垫", "隔尿垫", "吸水垫", "医用垫单"],
      },
      { catId: "L", items: ["纸尿裤/成人护理"] },
      { catId: "I", items: ["湿巾（消毒/清洁/医用）", "擦手巾"] },
      { catId: "D", items: ["PE 手套", "乳胶手套"] },
      { catId: "J", items: ["一次性围裙"] },
    ],
  },
  {
    id: "procedure-pack",
    no: "06",
    name: "医疗包组件定制",
    nameEn: "Procedure Packs",
    scene: "按手术 / 操作流程组件打包，一包一用",
    pain: [
      "术前逐项备物耗时，漏项直接延误手术",
      "单项拆包造成浪费，且难以追溯批次",
      "不同科室流程不同，标准包无法覆盖",
    ],
    groups: [
      {
        catId: "K",
        items: [
          "一次性手术包",
          "换药包",
          "清创包",
          "介入包",
          "导尿包",
          "缝合包",
          "检查包（口腔/妇科）",
          "护理包",
        ],
      },
      { catId: "G", items: ["一次性手术单", "洞巾", "器械包布", "消毒包布"] },
    ],
    highlight: "按客户流程定制组件内容与包装顺序，一包对应一台操作",
  },
];

/** 横向能力：覆盖所有方案 */
export const oemCapability = {
  title: "OEM / 贴牌生产",
  desc: "按客户规格定制克重、层数、尺寸与包装，支持贴牌",
  points: [
    "克重与层数按需调整",
    "尺寸与折叠方式可定制",
    "独立包装 / 混装 / 组件打包",
    "贴牌印刷与包装设计配合",
  ],
};

/** 混装优势 —— 这是真实的结构性优势，不涉及具体数字 */
export const mixedContainer = {
  title: "一柜混装",
  desc: "12 大类同厂生产，多品类可合并出运，无需分别向多家供应商下单",
  points: [
    "减少供应商数量与对账成本",
    "多品类合并出运，降低单品类起订压力",
    "批次一致，便于统一验货",
  ],
};