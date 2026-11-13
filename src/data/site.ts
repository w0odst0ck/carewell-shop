/**
 * 站点级配置（单一维护点）
 * 与旧站 data/site-config.js 对齐，但只保留新平台需要项
 */
export const site = {
  name: "MoJin Insights",
  nameZh: "墨瑾 · 研究",
  company: {
    zh: "莲墨瑾服装有限公司",
    en: "Lotojin Textile Co., Ltd.",
    brand: "Mojin",
    brandAr: "موجين",
  },
  domain: "mojin.store",
  email: "info@mojin.store",
  waNumber: "8613789915060",
  waDisplay: "+86 137 8991 5060",
  gaId: "G-5N80Y56YFB",
};

export const nav = [
  { href: "/", label: "首页" },
  { href: "/insights/", label: "洞察" },
  { href: "/reports/", label: "报告" },
  { href: "/contact/", label: "联系" },
];
