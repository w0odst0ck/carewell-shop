"use client";

import dynamicImport from "next/dynamic";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SiteHeader } from "@/components/layout/site-header";
import { Reveal } from "@/components/motion/reveal";
import { StatCard, StatBand, Panel, Insight } from "@/components/dashboard/stat-card";
import prices from "@/data/generated/valuechain-prices.json";
import freight from "@/data/generated/valuechain-freight.json";
import tradeJson from "@/data/generated/valuechain-trade.json";

const MaterialTrend = dynamicImport(
  () => import("@/components/dashboard/material-trend").then((m) => m.MaterialTrend),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const FreightChart = dynamicImport(
  () => import("@/components/dashboard/freight-chart").then((m) => m.FreightChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const TradeTrend = dynamicImport(
  () => import("@/components/dashboard/trade-trend").then((m) => m.TradeTrend),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

function ChartSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-5 w-5 animate-pulse rounded-full bg-[var(--color-warm-gray)]" />
    </div>
  );
}

type Series = { latest: [string, number]; data: [string, number][] };
const P = prices.series as unknown as Record<string, Series>;
const R = freight.routes as Record<string, { value: number; changePct: number | null; prev: number | null }>;
const T = tradeJson as unknown as {
  years: number[];
  hs4: Record<string, { name: string; series: Record<string, { value: number; netWgt: number }> }>;
};

/** 按日期回溯，算真实涨跌 */
function deltaOf(series: Series, days: number): number {
  const d = series.data;
  if (d.length < 2) return 0;
  const [curDate, curVal] = d[d.length - 1];
  const target = new Date(curDate);
  target.setDate(target.getDate() - days);
  const iso = target.toISOString().slice(0, 10);
  const past = d.find(([date]) => date >= iso);
  if (!past || !past[1]) return 0;
  return ((curVal - past[1]) / past[1]) * 100;
}

/** 取尾部 N 点做迷你走势 */
function tail(series: Series, n = 14): number[] {
  return series.data.slice(-n).map(([, v]) => v);
}

const brent = P.DCOILBRENTEU;
const resin = P.WPU0662;
const chem = P.WPU061;
const gulf = R["波斯湾20ft"];

const garment = T.hs4["6210"];
const dress = T.hs4["3006"];
const gloves = T.hs4["4015"];
const mask = T.hs4["6307"];

const g2024 = garment?.series["2024"]?.value ?? 0;
const g2019 = garment?.series["2019"]?.value ?? 0;
const garmentChg = g2019 ? ((g2024 - g2019) / g2019) * 100 : 0;

const d2024 = dress?.series["2024"]?.value ?? 0;
const d2019 = dress?.series["2019"]?.value ?? 0;
const dressChg = d2019 ? ((d2024 - d2019) / d2019) * 100 : 0;

/** 服装类年度序列（做迷你走势） */
const garmentSeries = T.years.map((y) => (garment?.series[String(y)]?.value ?? 0) / 1e6);
const dressSeries = T.years.map((y) => (dress?.series[String(y)]?.value ?? 0) / 1e6);

const brentChg30 = deltaOf(brent, 30);
const resinChgYr = deltaOf(resin, 365);
const chemChgYr = deltaOf(chem, 365);

export default function DashboardPage() {
  const panelsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = panelsRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = el.querySelectorAll(".panel-card");
    if (reduce) {
      gsap.set(cards, { opacity: 1, y: 0 });
      return;
    }
    const tw = gsap.fromTo(
      cards,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power3.out", delay: 0.25 }
    );
    return () => {
      tw.kill();
    };
  }, []);

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[var(--color-cream)] pt-16">
        {/* 标题条 */}
        <div className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
          <div className="mx-auto flex max-w-[1520px] flex-col gap-2 px-5 py-4 lg:flex-row lg:items-baseline lg:justify-between lg:px-8">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
                一次性防护用品 · 价格波动监控
              </h1>
              <span className="font-mono text-[11px] tracking-wide text-[var(--color-ink-faint)]">
                PRICE TREND MONITOR
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-[var(--color-ink-faint)]">
              <span>沙特市场 · 2019–2024</span>
              <span className="hidden sm:inline">FRED · SCFI · UN COMTRADE</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1520px] px-5 lg:px-8">
          {/* 指标带 */}
          <StatBand>
            <StatCard
              label="布伦特原油"
              value={brent.latest[1]}
              decimals={2}
              prefix="$"
              delta={{ value: brentChg30, unit: "pct", label: "较 30 天前" }}
              series={tail(brent)}
            />
            <StatCard
              label="树脂 PPI"
              value={resin.latest[1]}
              decimals={1}
              delta={{ value: resinChgYr, unit: "pct", label: "较一年前" }}
              series={tail(resin)}
            />
            <StatCard
              label="波斯湾运价"
              value={gulf?.value ?? 0}
              decimals={0}
              delta={{
                value: gulf?.changePct ?? 0,
                unit: "pct",
                label: "周环比",
              }}
            />
            <StatCard
              label="服装类进口"
              value={g2024 / 1e6}
              decimals={0}
              prefix="$"
              suffix="M"
              delta={{ value: garmentChg, unit: "pct", label: "较 2019" }}
              series={garmentSeries}
            />
            <StatCard
              label="医用敷料进口"
              value={d2024 / 1e6}
              decimals={0}
              prefix="$"
              suffix="M"
              delta={{ value: dressChg, unit: "pct", label: "较 2019" }}
              series={dressSeries}
            />
            <StatCard
              label="化工原料 PPI"
              value={chem.latest[1]}
              decimals={1}
              delta={{ value: chemChgYr, unit: "pct", label: "较一年前" }}
              series={tail(chem)}
            />
          </StatBand>

          {/* 四象限 */}
          <div
            ref={panelsRef}
            className="grid grid-cols-1 gap-px border-b border-[var(--color-border)] bg-[var(--color-border)] lg:grid-cols-2"
          >
            <Panel no="01" title="原料端波动" hint="起点 = 100 · 可切换序列">
              <MaterialTrend />
            </Panel>

            <Panel no="02" title="物流成本" hint="SCFI 运价指数 · 当期值">
              <FreightChart />
            </Panel>

            <Panel no="03" title="到岸规模与单价" hint="沙特进口 · 四大类">
              <TradeTrend />
            </Panel>

            <Panel no="04" title="关键判断" hint="从上述数据可直接读出">
              <div className="flex h-full flex-col justify-center space-y-4 text-[12px] leading-relaxed">
                <Insight
                  tag="结构性回落"
                  color="#d97757"
                  text={`服装类进口从 2019 年的 $${(g2019 / 1e6).toFixed(0)}M 降至 2024 年的 $${(g2024 / 1e6).toFixed(0)}M，跌幅 ${Math.abs(garmentChg).toFixed(0)}%。疫情透支的需求没有回补，已低于疫情前水平。`}
                />

                <Insight
                  tag="逆势增长"
                  color="#4a9d7f"
                  text={`医用敷料与急救包从 $${(d2019 / 1e6).toFixed(0)}M 增至 $${(d2024 / 1e6).toFixed(0)}M，五年增长 ${dressChg.toFixed(0)}%。四大类中唯一持续上行，属于刚需而非防疫驱动。`}
                />

                <Insight
                  tag="价格窗口大于销量窗口"
                  color="#daa55c"
                  text="口罩类进口单价 2020 年达 $21.26/kg，2024 年降至 $5.41/kg，五年落差近四倍。同一品类，选错进场时点，量与价会同时错。"
                />

                <Insight
                  tag="原料与运价的反向运动"
                  color="#3a7b9e"
                  text={`布伦特原油较 30 天前 ${brentChg30 >= 0 ? "上涨" : "下跌"} ${Math.abs(brentChg30).toFixed(1)}%，而树脂 PPI 较一年前仍 ${resinChgYr >= 0 ? "高于" : "低于"}去年同期 ${Math.abs(resinChgYr).toFixed(1)}%。上游成本并未随油价同步回落。`}
                />

                <Insight
                  tag="运价预警"
                  color="#8b6bb5"
                  text={`波斯湾航线本周${(gulf?.changePct ?? 0) >= 0 ? "上涨" : "下跌"} ${Math.abs(gulf?.changePct ?? 0).toFixed(1)}%，当前指数 ${(gulf?.value ?? 0).toFixed(0)}。运价上行会在两到三周内体现为到岸成本抬升。`}
                />
              </div>
            </Panel>
          </div>

          {/* 品类明细（真实数据速览） */}
          <div className="border-b border-[var(--color-border)] py-8">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[13px] font-semibold text-[var(--color-ink)]">
                四大类进口额速览
              </h2>
              <span className="font-mono text-[10px] text-[var(--color-ink-faint)]">
                UN Comtrade · 沙特 · 2019–2024
              </span>
            </div>
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-4">
              {[
                { rec: garment, label: "服装类", accent: "#d97757" },
                { rec: mask, label: "纺织制成品", accent: "#daa55c" },
                { rec: gloves, label: "橡胶手套", accent: "#3a7b9e" },
                { rec: dress, label: "医用敷料", accent: "#4a9d7f" },
              ].map(({ rec, label, accent }) => {
                const v19 = rec?.series["2019"]?.value ?? 0;
                const v24 = rec?.series["2024"]?.value ?? 0;
                const chg = v19 ? ((v24 - v19) / v19) * 100 : 0;
                const peak = Math.max(
                  ...T.years.map((y) => rec?.series[String(y)]?.value ?? 0)
                );
                return (
                  <div key={label} className="bg-[var(--color-card)] p-5">
                    <div className="mb-3 flex items-baseline justify-between">
                      <span className="text-[11px] text-[var(--color-ink-soft)]">{label}</span>
                      <span
                        className="font-mono text-[10px]"
                        style={{ color: chg >= 0 ? "#4a9d7f" : "#d97757" }}
                      >
                        {chg >= 0 ? "+" : ""}
                        {chg.toFixed(0)}%
                      </span>
                    </div>
                    <div className="font-mono text-2xl font-light text-[var(--color-ink)]">
                      ${(v24 / 1e6).toFixed(0)}M
                    </div>
                    <div className="mt-1 font-mono text-[9.5px] text-[var(--color-ink-faint)]">
                      2024 · 峰值 ${(peak / 1e6).toFixed(0)}M
                    </div>
                    {/* 年度小条 */}
                    <div className="mt-3 flex h-8 items-end gap-0.5">
                      {T.years.map((y) => {
                        const v = rec?.series[String(y)]?.value ?? 0;
                        const h = peak ? (v / peak) * 100 : 0;
                        return (
                          <div
                            key={y}
                            className="flex-1 rounded-sm transition-[height] duration-500"
                            style={{
                              height: `${Math.max(h, 4)}%`,
                              backgroundColor: accent,
                              opacity: y === 2024 ? 1 : 0.35,
                            }}
                            title={`${y}: $${(v / 1e6).toFixed(0)}M`}
                          />
                        );
                      })}
                    </div>
                    <div className="mt-1 flex justify-between font-mono text-[8.5px] text-[var(--color-ink-faint)]">
                      <span>{T.years[0]}</span>
                      <span>{T.years[T.years.length - 1]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 页脚 */}
          <Reveal>
            <div className="flex flex-col gap-2 py-5 text-[10px] text-[var(--color-ink-faint)] sm:flex-row sm:items-center sm:justify-between">
              <p>
                数据来源：FRED（美联储 / BLS）· SCFI（上海航运交易所）· UN Comtrade ｜
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