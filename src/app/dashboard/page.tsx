"use client";

import dynamicImport from "next/dynamic";
import { SiteHeader } from "@/components/layout/site-header";
import { Reveal } from "@/components/motion/reveal";
import prices from "@/data/generated/valuechain-prices.json";
import freight from "@/data/generated/valuechain-freight.json";
import tradeJson from "@/data/generated/valuechain-trade.json";

const MaterialTrend = dynamicImport(
  () => import("@/components/dashboard/material-trend").then((m) => m.MaterialTrend),
  { ssr: false, loading: () => <Skeleton /> }
);
const FreightChart = dynamicImport(
  () => import("@/components/dashboard/freight-chart").then((m) => m.FreightChart),
  { ssr: false, loading: () => <Skeleton /> }
);
const TradeTrend = dynamicImport(
  () => import("@/components/dashboard/trade-trend").then((m) => m.TradeTrend),
  { ssr: false, loading: () => <Skeleton /> }
);

function Skeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-6 w-6 animate-pulse rounded-full bg-[var(--color-warm-gray)]" />
    </div>
  );
}

type S = { latest: [string, number]; unit: string; freq: string };
const P = prices.series as unknown as Record<string, S>;
const R = freight.routes as Record<string, { value: number; changePct: number | null }>;
const T = tradeJson as unknown as {
  years: number[];
  hs4: Record<string, { name: string; series: Record<string, { value: number; netWgt: number }> }>;
};

const brent = P.DCOILBRENTEU;
const resin = P.WPU0662;
const gulf = R["波斯湾20ft"];

// 2024 vs 2019：服装类
const garment = T.hs4["6210"];
const v2024 = garment?.series["2024"]?.value ?? 0;
const v2019 = garment?.series["2019"]?.value ?? 0;
const garmentDrop = v2019 ? ((v2024 - v2019) / v2019) * 100 : 0;

const dress = T.hs4["3006"];
const dressGrow = (() => {
  const a = dress?.series["2019"]?.value ?? 0;
  const b = dress?.series["2024"]?.value ?? 0;
  return a ? ((b - a) / a) * 100 : 0;
})();

const stats = [
  {
    label: "布伦特原油",
    value: brent?.latest[1] ?? 0,
    decimals: 2,
    prefix: "$",
    suffix: "",
    hint: brent?.latest[0] ?? "",
  },
  {
    label: "树脂 PPI",
    value: resin?.latest[1] ?? 0,
    decimals: 1,
    suffix: "",
    hint: resin?.latest[0] ?? "",
  },
  {
    label: "波斯湾运价",
    value: gulf?.value ?? 0,
    decimals: 0,
    suffix: "",
    hint: `周环比 ${(gulf?.changePct ?? 0) >= 0 ? "+" : ""}${(gulf?.changePct ?? 0).toFixed(1)}%`,
  },
  {
    label: "服装类进口",
    value: v2024 / 1e6,
    decimals: 0,
    prefix: "$",
    suffix: "M",
    hint: `较 2019 ${garmentDrop >= 0 ? "+" : ""}${garmentDrop.toFixed(0)}%`,
  },
  {
    label: "医用敷料进口",
    value: (dress?.series["2024"]?.value ?? 0) / 1e6,
    decimals: 0,
    prefix: "$",
    suffix: "M",
    hint: `较 2019 +${dressGrow.toFixed(0)}%`,
  },
  {
    label: "监测品类",
    value: 7,
    decimals: 0,
    suffix: " 类",
    hint: "HS 四位 + 六位",
  },
];

export default function DashboardPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[var(--color-cream)] pt-16">
        {/* 标题条 */}
        <div className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
          <div className="mx-auto flex max-w-[1520px] flex-col gap-2 px-5 py-4 lg:flex-row lg:items-baseline lg:justify-between lg:px-8">
            <div className="flex items-baseline gap-3">
              <h1 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
                一次性防护用品 · 价格波动监控
              </h1>
              <span className="font-mono text-[11px] text-[var(--color-ink-faint)]">
                PRICE TREND MONITOR
              </span>
            </div>
            <div className="flex items-center gap-4 font-mono text-[10px] text-[var(--color-ink-faint)]">
              <span>沙特市场 · 2019–2024</span>
              <span>FRED · SCFI · UN COMTRADE</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1520px] px-5 lg:px-8">
          {/* 指标带 */}
          <div className="grid grid-cols-2 gap-px border-b border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-3 lg:grid-cols-6">
            {stats.map((s) => (
              <div key={s.label} className="bg-[var(--color-card)] px-4 py-4">
                <div className="text-[10px] uppercase tracking-wider text-[var(--color-ink-faint)]">
                  {s.label}
                </div>
                <div className="mt-1.5 font-mono text-xl font-light text-[var(--color-ink)]">
                  {s.prefix ?? ""}
                  {s.value.toLocaleString("en-US", {
                    minimumFractionDigits: s.decimals,
                    maximumFractionDigits: s.decimals,
                  })}
                  {s.suffix ?? ""}
                </div>
                <div className="mt-0.5 font-mono text-[9.5px] text-[var(--color-ink-faint)]">
                  {s.hint}
                </div>
              </div>
            ))}
          </div>

          {/* 四象限 */}
          <div className="grid grid-cols-1 gap-px border-b border-[var(--color-border)] bg-[var(--color-border)] lg:grid-cols-2">
            <Panel no="01" title="原料端波动" hint="起点=100 · 可切换序列">
              <MaterialTrend />
            </Panel>

            <Panel no="02" title="物流成本（当期）" hint="SCFI 运价指数 · 无历史序列">
              <FreightChart />
            </Panel>

            <Panel no="03" title="到岸规模与单价" hint="沙特进口 · 四大类">
              <TradeTrend />
            </Panel>

            <Panel no="04" title="关键判断" hint="从上述数据得出">
              <div className="space-y-3 text-[12px] leading-relaxed text-[var(--color-ink)]">
                <Insight
                  tag="结构性回落"
                  color="#d97757"
                  text={`服装类进口从 2019 年 $${(v2019 / 1e6).toFixed(0)}M 降至 2024 年 $${(v2024 / 1e6).toFixed(0)}M（${garmentDrop.toFixed(0)}%）。疫情透支后的需求已回落到常态水平以下。`}
                />
                <Insight
                  tag="逆势增长"
                  color="#4a9d7f"
                  text={`医用敷料/急救包从 $${((dress?.series["2019"]?.value ?? 0) / 1e6).toFixed(0)}M 增至 $${((dress?.series["2024"]?.value ?? 0) / 1e6).toFixed(0)}M（+${dressGrow.toFixed(0)}%），是四类中唯一持续增长的品类。`}
                />
                <Insight
                  tag="价格波动剧烈"
                  color="#daa55c"
                  text="口罩类进口单价 2020 年达 $21.26/kg，2024 年降至 $5.41/kg，五年波动近 4 倍。防护服类同理。价格窗口比销量窗口更重要。"
                />
                <Insight
                  tag="运价信号"
                  color="#3a7b9e"
                  text={`波斯湾航线本周 ${(gulf?.changePct ?? 0) >= 0 ? "上涨" : "下跌"} ${Math.abs(gulf?.changePct ?? 0).toFixed(1)}%，当前指数 ${(gulf?.value ?? 0).toFixed(0)}。运价上行会压缩到岸利润空间。`}
                />
              </div>
            </Panel>
          </div>

          {/* 页脚 */}
          <Reveal>
            <div className="flex flex-col gap-2 py-5 text-[10px] text-[var(--color-ink-faint)] sm:flex-row sm:items-center sm:justify-between">
              <p>
                数据来源：FRED（美联储/BLS）· SCFI（上海航运交易所）· UN Comtrade ｜
                用途：价格趋势监控，非成本核算
              </p>
              <p className="font-mono">MoJin Insights · Price Monitor</p>
            </div>
          </Reveal>
        </div>
      </main>
    </>
  );
}

function Panel({
  no,
  title,
  hint,
  children,
}: {
  no: string;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[360px] bg-[var(--color-card)] p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] text-[var(--color-warm-blue)]">{no}</span>
          <h2 className="text-[13px] font-semibold text-[var(--color-ink)]">{title}</h2>
        </div>
        <span className="text-[10px] text-[var(--color-ink-faint)]">{hint}</span>
      </div>
      <div className="h-[290px] w-full">{children}</div>
    </div>
  );
}

function Insight({ tag, color, text }: { tag: string; color: string; text: string }) {
  return (
    <div className="flex gap-2.5">
      <span
        className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <div>
        <span className="font-medium" style={{ color }}>
          {tag}
        </span>
        <span className="mx-1.5 text-[var(--color-ink-faint)]">·</span>
        <span className="text-[var(--color-ink-soft)]">{text}</span>
      </div>
    </div>
  );
}