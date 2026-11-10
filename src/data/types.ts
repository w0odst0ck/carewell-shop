export type CategoryRow = {
  code: string;
  name: string;
  nameEn: string;
  total: number;
  countries: number;
};

export type RankingRow = {
  name: string;
  iso: string;
  value: number;
  partners: number;
  bycat: Record<string, number>;
};

export type DashboardData = {
  period: number;
  source: string;
  categories: CategoryRow[];
  ranking: RankingRow[];
  worldTotal: number;
  countryCount: number;
  categoryCount: number;
};
