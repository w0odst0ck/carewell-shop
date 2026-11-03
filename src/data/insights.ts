/**
 * 占位数据 —— 结构即契约
 * 真实数据由采集器 → 数仓 → 构建时导出为同名 JSON
 * 字段命名与 docs/框架选型/01-数据源清单.md 的采集契约一致
 */

export type RegionPoint = {
  id: string;          // ISO 3166-1 alpha-3
  name: string;
  lat: number;
  lng: number;
  value: number;       // 主指标值（如进口额 万美元）
  category: string;    // 领域：sanitation | healthcare | environment
};

/** 全球分布点位（用于 3D 地球） */
export const regionPoints: RegionPoint[] = [
  { id: "SAU", name: "沙特阿拉伯", lat: 23.9, lng: 45.1, value: 12480, category: "healthcare" },
  { id: "ARE", name: "阿联酋", lat: 23.4, lng: 53.8, value: 8620, category: "healthcare" },
  { id: "QAT", name: "卡塔尔", lat: 25.3, lng: 51.2, value: 3140, category: "healthcare" },
  { id: "KWT", name: "科威特", lat: 29.3, lng: 47.5, value: 2860, category: "healthcare" },
  { id: "OMN", name: "阿曼", lat: 21.5, lng: 55.9, value: 1920, category: "healthcare" },
  { id: "BHR", name: "巴林", lat: 26.0, lng: 50.5, value: 1140, category: "healthcare" },
  { id: "EGY", name: "埃及", lat: 26.8, lng: 30.8, value: 6820, category: "healthcare" },
  { id: "JOR", name: "约旦", lat: 31.2, lng: 36.5, value: 2210, category: "healthcare" },
  { id: "DEU", name: "德国", lat: 51.2, lng: 10.4, value: 15420, category: "environment" },
  { id: "FRA", name: "法国", lat: 46.2, lng: 2.2, value: 11980, category: "environment" },
  { id: "GBR", name: "英国", lat: 55.4, lng: -3.4, value: 10240, category: "environment" },
  { id: "USA", name: "美国", lat: 37.1, lng: -95.7, value: 28460, category: "environment" },
  { id: "CHN", name: "中国", lat: 35.9, lng: 104.2, value: 41280, category: "sanitation" },
  { id: "IND", name: "印度", lat: 20.6, lng: 78.9, value: 18640, category: "sanitation" },
  { id: "VNM", name: "越南", lat: 14.1, lng: 108.3, value: 7420, category: "sanitation" },
  { id: "IDN", name: "印度尼西亚", lat: -0.8, lng: 113.9, value: 6980, category: "sanitation" },
  { id: "TUR", name: "土耳其", lat: 38.9, lng: 35.2, value: 5240, category: "sanitation" },
  { id: "BRA", name: "巴西", lat: -14.2, lng: -51.9, value: 4680, category: "environment" },
  { id: "ZAF", name: "南非", lat: -30.6, lng: 22.9, value: 3120, category: "healthcare" },
  { id: "NGA", name: "尼日利亚", lat: 9.1, lng: 8.7, value: 2840, category: "healthcare" },
];

/** 关键指标（首屏数字滚动用） */
export const keyMetrics = [
  { label: "覆盖国家与地区", value: 193, suffix: "", hint: "全球主权国家" },
  { label: "追踪指标", value: 248, suffix: "+", hint: "跨 4 个数据域" },
  { label: "时间跨度", value: 10, suffix: " 年", hint: "2015–2024" },
  { label: "数据来源", value: 29, suffix: " 个", hint: "全部公开可溯源" },
];

/** 三个核心议题 */
export const topics = [
  {
    id: "sgd-3",
    sdg: "SDG 3",
    title: "医疗物资可及性",
    summary:
      "全球医疗防护用品的生产与流向如何分布？供应链集中度对中低收入国家的可及性意味着什么。",
    metric: { label: "覆盖国家", value: 193 },
    accent: "brand" as const,
  },
  {
    id: "sgd-6",
    sdg: "SDG 6",
    title: "卫生与感染控制",
    summary:
      "基础卫生设施与一次性防护耗材的使用强度之间的关系，以及区域差异的结构性成因。",
    metric: { label: "追踪指标", value: 86 },
    accent: "teal" as const,
  },
  {
    id: "sgd-12",
    sdg: "SDG 12 / 13",
    title: "一次性耗材与环境负荷",
    summary:
      "医疗防护需求增长带来的废弃物压力：从材料替代、回收路径到政策响应的完整链条。",
    metric: { label: "数据年份", value: 10 },
    accent: "amber" as const,
  },
];
