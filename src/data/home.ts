/**
 * 首页数据 —— 全部来自真实采集结果，无编造
 * 源：FRED / SCFI / UN Comtrade / TED
 */

import prices from "@/data/generated/valuechain-prices.json";
import freight from "@/data/generated/valuechain-freight.json";
import trade from "@/data/generated/valuechain-trade.json";
import leads from "@/data/generated/leads.json";

type PriceSeries = { latest: [string, number]; unit: string; name: string };
const P = prices.series as unknown as Record<string, PriceSeries>;

const T = trade as unknown as {
  years: number[];
  hs4: Record<string, { name: string; series: Record<string, { value: number; unitPrice: number | null }> }>;
};

const F = freight.routes as Record<string, { value: number; changePct: number | null }>;
const L = leads as unknown as { count: number; cpvStats: Record<string, { total: number }> };

/** 首屏指标（真实值） */
export const heroMetrics = [
  {
    label: "布伦特原油",
    value: P.DCOILBRENTEU.latest[1],
    decimals: 2,
    prefix: "$",
    date: P.DCOILBRENTEU.latest[0],
  },
  {
    label: "树脂 PPI",
    value: P.WPU0662.latest[1],
    decimals: 1,
    prefix: "",
    date: P.WPU0662.latest[0],
  },
  {
    label: "波斯湾运价",
    value: F["波斯湾20ft"].value,
    decimals: 0,
    prefix: "",
    date: "SCFI 周更",
  },
  {
    label: "采购公告在库",
    value: Object.values(L.cpvStats).reduce((n, s) => n + s.total, 0),
    decimals: 0,
    prefix: "",
    date: "近 90 天",
  },
];

/** 三个内容入口（对应实际页面） */
export const entries = [
  {
    id: "dashboard",
    no: "01",
    href: "/dashboard/",
    eyebrow: "Price Monitor",
    title: "价格波动看板",
    desc: "原料、运价、到岸价三条链路的真实序列。原油从哪来、成本怎么传导、价格窗口在哪。",
    metric: { label: "监测序列", value: 8, suffix: " 条" },
    accent: "brand" as const,
  },
  {
    id: "solutions",
    no: "02",
    href: "/solutions/",
    eyebrow: "Solutions",
    title: "场景配货方案",
    desc: "按场景而非按品类组织：酒店、餐饮、美容、医疗、养老、手术包。一个柜可混装。",
    metric: { label: "覆盖品类", value: 106, suffix: " 项" },
    accent: "amber" as const,
  },
  {
    id: "leads",
    no: "03",
    href: "/leads/",
    eyebrow: "Opportunities",
    title: "全球采购线索",
    desc: "各国公共采购平台的公开招标公告，按品类归集。只做索引，不介入交易。",
    metric: { label: "在库公告", value: Object.values(L.cpvStats).reduce((n, s) => n + s.total, 0), suffix: "" },
    accent: "teal" as const,
  },
];

/** 沙特四大类进口趋势（真实） */
export const tradeTrend = {
  years: T.years,
  categories: Object.entries(T.hs4).map(([hs, rec]) => ({
    hs,
    name: rec.name,
    values: T.years.map((y) => {
      const r = rec.series[String(y)];
      return r ? +(r.value / 1e6).toFixed(1) : null;
    }),
  })),
};

/** 原料两条线（归一化起点=100，真实） */
export const materialSeries = (() => {
  const out: { key: string; name: string; color: string; data: [string, number][] }[] = [];
  const defs = [
    { key: "DCOILBRENTEU", name: "布伦特原油", color: "#daa55c" },
    { key: "WPU0662", name: "树脂 PPI", color: "#3a7b9e" },
  ];
  for (const d of defs) {
    const s = P[d.key] as unknown as { data: [string, number][] };
    if (!s?.data?.length) continue;
    const base = s.data[0][1];
    out.push({
      key: d.key,
      name: d.name,
      color: d.color,
      data: s.data.map(([date, v]) => [date, +((v / base) * 100).toFixed(2)]),
    });
  }
  return out;
})();

/** 数据来源清单（真实使用中的） */
export const sources = [
  { name: "FRED", desc: "美国联邦储备银行 / 劳工统计局", use: "原油、树脂与化工品价格指数" },
  { name: "SCFI", desc: "上海航运交易所", use: "出口集装箱运价指数" },
  { name: "UN Comtrade", desc: "联合国商品贸易统计", use: "分品类进口额、量、单价" },
  { name: "TED", desc: "欧盟官方采购公告库", use: "公共采购招标线索" },
];