/**
 * UN M49 国家代码 → 名称 + 经纬度
 *
 * 只收录 flows.json 里实际出现的 67 个国家。
 * 坐标用于 3D 地球上的弧线端点（取国家地理中心近似值）。
 */

export type CountryInfo = { name: string; nameZh: string; lat: number; lng: number };

export const COUNTRIES: Record<number, CountryInfo> = {
  36: { name: "Australia", nameZh: "澳大利亚", lat: -25.3, lng: 133.8 },
  40: { name: "Austria", nameZh: "奥地利", lat: 47.5, lng: 14.6 },
  48: { name: "Bahrain", nameZh: "巴林", lat: 26.0, lng: 50.6 },
  50: { name: "Bangladesh", nameZh: "孟加拉国", lat: 23.7, lng: 90.4 },
  56: { name: "Belgium", nameZh: "比利时", lat: 50.5, lng: 4.5 },
  76: { name: "Brazil", nameZh: "巴西", lat: -14.2, lng: -51.9 },
  100: { name: "Bulgaria", nameZh: "保加利亚", lat: 42.7, lng: 25.5 },
  104: { name: "Myanmar", nameZh: "缅甸", lat: 21.9, lng: 95.96 },
  116: { name: "Cambodia", nameZh: "柬埔寨", lat: 12.6, lng: 104.99 },
  124: { name: "Canada", nameZh: "加拿大", lat: 56.1, lng: -106.3 },
  144: { name: "Sri Lanka", nameZh: "斯里兰卡", lat: 7.87, lng: 80.77 },
  156: { name: "China", nameZh: "中国", lat: 35.9, lng: 104.2 },
  170: { name: "Colombia", nameZh: "哥伦比亚", lat: 4.57, lng: -74.3 },
  188: { name: "Costa Rica", nameZh: "哥斯达黎加", lat: 9.75, lng: -83.75 },
  191: { name: "Croatia", nameZh: "克罗地亚", lat: 45.1, lng: 15.2 },
  203: { name: "Czechia", nameZh: "捷克", lat: 49.8, lng: 15.5 },
  208: { name: "Denmark", nameZh: "丹麦", lat: 56.3, lng: 9.5 },
  212: { name: "Dominican Rep.", nameZh: "多米尼加", lat: 18.7, lng: -70.2 },
  214: { name: "Dominican Republic", nameZh: "多米尼加", lat: 18.7, lng: -70.2 },
  246: { name: "Finland", nameZh: "芬兰", lat: 61.9, lng: 25.7 },
  251: { name: "France", nameZh: "法国", lat: 46.2, lng: 2.21 },
  276: { name: "Germany", nameZh: "德国", lat: 51.2, lng: 10.4 },
  300: { name: "Greece", nameZh: "希腊", lat: 39.1, lng: 21.8 },
  320: { name: "Guatemala", nameZh: "危地马拉", lat: 15.8, lng: -90.2 },
  344: { name: "Hong Kong", nameZh: "中国香港", lat: 22.3, lng: 114.2 },
  348: { name: "Hungary", nameZh: "匈牙利", lat: 47.2, lng: 19.5 },
  360: { name: "Indonesia", nameZh: "印度尼西亚", lat: -0.79, lng: 113.9 },
  372: { name: "Ireland", nameZh: "爱尔兰", lat: 53.4, lng: -8.24 },
  380: { name: "Italy", nameZh: "意大利", lat: 41.9, lng: 12.6 },
  392: { name: "Japan", nameZh: "日本", lat: 36.2, lng: 138.3 },
  400: { name: "Jordan", nameZh: "约旦", lat: 30.6, lng: 36.2 },
  410: { name: "South Korea", nameZh: "韩国", lat: 35.9, lng: 127.8 },
  414: { name: "Kuwait", nameZh: "科威特", lat: 29.3, lng: 47.5 },
  428: { name: "Latvia", nameZh: "拉脱维亚", lat: 56.9, lng: 24.6 },
  440: { name: "Lithuania", nameZh: "立陶宛", lat: 55.2, lng: 23.9 },
  458: { name: "Malaysia", nameZh: "马来西亚", lat: 4.21, lng: 101.9 },
  484: { name: "Mexico", nameZh: "墨西哥", lat: 23.6, lng: -102.6 },
  490: { name: "Other Asia, nes", nameZh: "亚洲其他", lat: 23.7, lng: 121.0 },
  504: { name: "Morocco", nameZh: "摩洛哥", lat: 31.8, lng: -7.09 },
  512: { name: "Oman", nameZh: "阿曼", lat: 21.5, lng: 55.9 },
  528: { name: "Netherlands", nameZh: "荷兰", lat: 52.1, lng: 5.29 },
  579: { name: "Norway", nameZh: "挪威", lat: 60.5, lng: 8.47 },
  586: { name: "Pakistan", nameZh: "巴基斯坦", lat: 30.4, lng: 69.3 },
  604: { name: "Peru", nameZh: "秘鲁", lat: -9.19, lng: -75.0 },
  608: { name: "Philippines", nameZh: "菲律宾", lat: 12.9, lng: 121.8 },
  616: { name: "Poland", nameZh: "波兰", lat: 51.9, lng: 19.1 },
  620: { name: "Portugal", nameZh: "葡萄牙", lat: 39.4, lng: -8.22 },
  642: { name: "Romania", nameZh: "罗马尼亚", lat: 45.9, lng: 24.97 },
  643: { name: "Russia", nameZh: "俄罗斯", lat: 61.5, lng: 105.3 },
  688: { name: "Serbia", nameZh: "塞尔维亚", lat: 44.0, lng: 21.0 },
  699: { name: "India", nameZh: "印度", lat: 22.0, lng: 79.0 },
  702: { name: "Singapore", nameZh: "新加坡", lat: 1.35, lng: 103.8 },
  703: { name: "Slovakia", nameZh: "斯洛伐克", lat: 48.7, lng: 19.7 },
  704: { name: "Vietnam", nameZh: "越南", lat: 14.1, lng: 108.3 },
  710: { name: "South Africa", nameZh: "南非", lat: -30.6, lng: 22.9 },
  724: { name: "Spain", nameZh: "西班牙", lat: 40.5, lng: -3.75 },
  752: { name: "Sweden", nameZh: "瑞典", lat: 60.1, lng: 18.6 },
  757: { name: "Switzerland", nameZh: "瑞士", lat: 46.8, lng: 8.23 },
  760: { name: "Syria", nameZh: "叙利亚", lat: 34.8, lng: 38.9 },
  764: { name: "Thailand", nameZh: "泰国", lat: 15.9, lng: 101.0 },
  784: { name: "UAE", nameZh: "阿联酋", lat: 23.4, lng: 53.8 },
  788: { name: "Tunisia", nameZh: "突尼斯", lat: 33.9, lng: 9.54 },
  792: { name: "Türkiye", nameZh: "土耳其", lat: 38.96, lng: 35.24 },
  804: { name: "Ukraine", nameZh: "乌克兰", lat: 48.4, lng: 31.2 },
  818: { name: "Egypt", nameZh: "埃及", lat: 26.8, lng: 30.8 },
  826: { name: "United Kingdom", nameZh: "英国", lat: 55.4, lng: -3.44 },
  842: { name: "USA", nameZh: "美国", lat: 37.1, lng: -95.7 },
};

export const SAUDI = { lat: 23.9, lng: 45.1 };

export function countryOf(code: number): CountryInfo | null {
  return COUNTRIES[code] ?? null;
}