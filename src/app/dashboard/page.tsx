"use client";

import dynamicImport from "next/dynamic";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SiteHeader } from "@/components/layout/site-header";
import {
  DashboardProvider,
  useDashboard,
  RANGE_LABEL,
  CAT_LABEL,
  type TimeRange,
  type CatKey,
} from "@/lib/dashboard-store";
import prices from "@/data/generated/valuechain-prices.json";
import freightJson from "@/data/generated/valuechain-freight.json";
import tradeJson from "@/data/generated/valuechain-trade.json";
import flowsJson from "@/data/generated/flows.json";

const TradeFlows = dynamicImport(
  () => import("@/components/dashboard/trade-flows").then((m) => m.TradeFlows),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const ImportStructure = dynamicImport(
  () => import("@/components/dashboard/side-charts").then((m) => m.ImportStructure),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const FreightBars = dynamicImport(
  () => import("@/components/dashboard/side-charts").then((m) => m.FreightBars),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const PriceVolumeBubble = dynamicImport(
  () => import("@/components/dashboard/side-charts").then((m) => m.PriceVolumeBubble),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

function ChartSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-4 w-4 animate-pulse rounded-full bg-[var(--color-warm-gray)]" />
    </div>
  );
}

type Series = {
  name: string;
  unit: string;
  freq: string;
  latest: [string, number];
  data: [string, number][];
};
const P = prices.series as unknown as Record<string, Series>;
const ROUTES = (freightJson.routes as unknown) as Record<
  string,
  { value: number; changePct: number | null; prev: number | null }
>;
const T = tradeJson as unknown as {
  years: number[];
  hs4: Record<string, { name: string; series: Record<string, { value: number; netWgt: number }> }>;
};
const FLOWS = flowsJson as unknown as {
  reporter: string;
  period: number;
  source: string;
  categories: Record<
    string,
    {
      name: string;
      total: number;
      partners: { code: number; iso: string | null; name: string | null; value: number; netWgt: number }[];
    }
  >;
};

function deltaOf(series: Series, days: number): number {
  const d = series.data;
  if (d.length < 2) return 0;
  const [curDate, curVal] = d[d.length - 1];
  const t = new Date(curDate);
  t.setDate(t.getDate() - days);
  const iso = t.toISOString().slice(0, 10);
  const past = d.find(([date]) => date >= iso);
  if (!past || !past[1]) return 0;
  return ((curVal - past[1]) / past[1]) * 100;
}

const brent = P.DCOILBRENTEU;
const resin = P.WPU0662;
const chem = P.WPU061;
const gulf = ROUTES["波斯湾20ft"];

const garment = T.hs4["6210"];
const dress = T.hs4["3006"];
const g2024 = garment?.series["2024"]?.value ?? 0;
const g2019 = garment?.series["2019"]?.value ?? 0;
const d2024 = dress?.series["2024"]?.value ?? 0;
const d2019 = dress?.series["2019"]?.value ?? 0;

const KPIS = [
  {
    label: "布伦特原油",
    value: brent.latest[1],
    decimals: 2,
    prefix: "$",
    delta: deltaOf(brent, 30),
    deltaLabel: "30天",
    series: brent.data.slice(-20).map(([, v]) => v),
  },
  {
    label: "树脂 PPI",
    value: resin.latest[1],
    decimals: 1,
    delta: deltaOf(resin, 365),
    deltaLabel: "一年",
    series: resin.data.slice(-16).map(([, v]) => v),
  },
  {
    label: "波斯湾运价",
    value: gulf?.value ?? 0,
    decimals: 0,
    delta: gulf?.changePct ?? 0,
    deltaLabel: "周环比",
  },
  {
    label: "服装类进口",
    value: g2024 / 1e6,
    decimals: 0,
    prefix: "$",
    suffix: "M",
    delta: g2019 ? ((g2024 - g2019) / g2019) * 100 : 0,
    deltaLabel: "较2019",
  },
  {
    label: "医用敷料进口",
    value: d2024 / 1e6,
    decimals: 0,
    prefix: "$",
    suffix: "M",
    delta: d2019 ? ((d2024 - d2019) / d2019) * 100 : 0,
    deltaLabel: "较2019",
  },
  {
    label: "化工原料 PPI",
    value: chem.latest[1],
    decimals: 1,
    delta: deltaOf(chem, 365),
    deltaLabel: "一年",
    series: chem.data.slice(-16).map(([, v]) => v),
  },
];

function KpiStrip() {
  return (
    <div className="grid grid-cols-2 gap-px border-t border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-3 lg:grid-cols-6">
      {KPIS.map((k) => {
        const up = k.delta > 0;
        const flat = Math.abs(k.delta) < 0.05;
        return (
          <div
            key={k.label}
            className="kpi-card px-4 py-3 opacity-0"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-ink-faint)]">
                {k.label}
              </span>
              {k.series && <MiniSpark data={k.series} up={up} flat={flat} />}
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-[1.15rem] font-light leading-none text-[var(--color-ink)]">
                {k.prefix ?? ""}
                {k.value.toLocaleString("en-US", {
                  minimumFractionDigits: k.decimals,
                  maximumFractionDigits: k.decimals,
                })}
                {k.suffix ?? ""}
              </span>
              <span
                className="font-mono text-[9px]"
                style={{ color: flat ? "#a8a29a" : up ? "#d97757" : "#4a9d7f" }}
              >
                {flat ? "—" : up ? "▲" : "▼"}
                {Math.abs(k.delta).toFixed(1)}%
              </span>
            </div>
            <div className="mt-0.5 font-mono text-[9px] text-[var(--color-ink-faint)]">
              {k.deltaLabel}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MiniSpark({ data, up, flat }: { data: number[]; up: boolean; flat: boolean }) {
  const w = 32;
  const h = 12;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data
    .map((v, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(h - ((v - min) / span) * h).toFixed(1)}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="shrink-0 opacity-50">
      <polyline
        points={pts}
        fill="none"
        stroke={flat ? "#a8a29a" : up ? "#d97757" : "#4a9d7f"}
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Controls() {
  const { range, setRange, cat, setCat } = useDashboard();
  const ranges: TimeRange[] = ["all", "3y", "1y"];
  const cats: CatKey[] = ["all", "6210", "6307", "4015", "3006"];

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-[var(--color-border)] px-4 py-2.5">
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-ink-faint)]">
          时间
        </span>
        {ranges.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`rounded px-2 py-0.5 text-[10px] transition-colors ${
              range === r
                ? "bg-[var(--color-warm-blue)] text-white"
                : "text-[var(--color-ink-soft)] hover:bg-[var(--color-warm-gray)]"
            }`}
          >
            {RANGE_LABEL[r]}
          </button>
        ))}
      </div>

      <span className="hidden h-3 w-px bg-[var(--color-border)] sm:block" />

      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-ink-faint)]">
          品类
        </span>
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded px-2 py-0.5 text-[10px] transition-colors ${
              cat === c
                ? "bg-[var(--color-warm-blue)] text-white"
                : "text-[var(--color-ink-soft)] hover:bg-[var(--color-warm-gray)]"
            }`}
          >
            {CAT_LABEL[c]}
          </button>
        ))}
      </div>
    </div>
  );
}

function DashboardBody() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = el.querySelectorAll(".kpi-card, .dash-panel");
    if (reduce) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }
    const tw = gsap.fromTo(
      targets,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power3.out", delay: 0.1 }
    );
    return () => {
      tw.kill();
    };
  }, []);

  return (
    <div ref={rootRef} className="mx-auto max-w-[1680px] px-3 py-3 lg:px-5">
      <Controls />

      {/* 主视觉 + 侧栏 */}
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1.62fr_1fr]">
        {/* 3D 曲面 */}
        <div className="dash-panel panel-hero relative overflow-hidden rounded-lg border opacity-0">
          <div className="flex items-baseline justify-between border-b border-[var(--color-border)] px-4 py-2">
            <h2 className="text-[11.5px] font-semibold text-[var(--color-ink)]">
              进口来源流向 · 谁在供货
            </h2>
            <span className="font-mono text-[9px] text-[var(--color-ink-faint)]">
              FRED · 2019-01 → 2026-11
            </span>
          </div>
          <div className="h-[min(62vh,560px)] w-full">
            <TradeFlows data={FLOWS} />
          </div>
        </div>

        {/* 侧栏三图 */}
        <div className="flex flex-col gap-3">
          <div className="dash-panel panel-sub flex-1 overflow-hidden rounded-lg border opacity-0">
            <div className="flex items-baseline justify-between border-b border-[var(--color-border)] px-3 py-1.5">
              <h3 className="text-[11.5px] font-medium text-[var(--color-ink)]">进口结构</h3>
              <span className="font-mono text-[9px] text-[var(--color-ink-faint)]">
                UN Comtrade · 点击年份联动
              </span>
            </div>
            <div className="h-[clamp(110px,17vh,160px)] w-full px-1">
              <ImportStructure />
            </div>
          </div>

          <div className="dash-panel panel-sub flex-1 overflow-hidden rounded-lg border opacity-0">
            <div className="flex items-baseline justify-between border-b border-[var(--color-border)] px-3 py-1.5">
              <h3 className="text-[11.5px] font-medium text-[var(--color-ink)]">运价指数</h3>
              <span className="font-mono text-[9px] text-[var(--color-ink-faint)]">SCFI · 周环比</span>
            </div>
            <div className="h-[clamp(100px,15vh,145px)] w-full px-1">
              <FreightBars routes={ROUTES} />
            </div>
          </div>

          <div className="dash-panel panel-sub flex-1 overflow-hidden rounded-lg border opacity-0">
            <div className="flex items-baseline justify-between border-b border-[var(--color-border)] px-3 py-1.5">
              <h3 className="text-[11.5px] font-medium text-[var(--color-ink)]">单价 vs 进口量</h3>
              <span className="font-mono text-[9px] text-[var(--color-ink-faint)]">气泡 = 总额</span>
            </div>
            <div className="h-[clamp(110px,17vh,160px)] w-full px-1">
              <PriceVolumeBubble />
            </div>
          </div>
        </div>
      </div>

      {/* KPI 带 */}
      <div className="mt-3">
        <KpiStrip />
      </div>

      {/* 页脚说明 */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 font-mono text-[9px] text-[var(--color-ink-faint)]">
        <span>
          FRED（美联储/BLS）· SCFI（上海航交所）· UN Comtrade ｜ 价格趋势监控，非成本核算
        </span>
        <span>MoJin Insights · Price Monitor</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[var(--color-cream)] pt-16">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
          <div className="mx-auto flex max-w-[1680px] flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2.5 lg:px-5">
            <h1 className="text-[15px] font-semibold tracking-tight text-[var(--color-ink)]">
              一次性防护用品 · 价格波动监控
            </h1>
            <span className="font-mono text-[10px] tracking-wide text-[var(--color-ink-faint)]">
              PRICE TREND MONITOR
            </span>
          </div>
        </div>
        <DashboardProvider>
          <DashboardBody />
        </DashboardProvider>
      </main>
    </>
  );
}