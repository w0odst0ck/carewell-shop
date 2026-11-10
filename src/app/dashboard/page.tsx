"use client";

import dynamicImport from "next/dynamic";
import { SiteHeader } from "@/components/layout/site-header";
import { Reveal } from "@/components/motion/reveal";
import { StatBand } from "@/components/dashboard/stat-band";
import dashboard from "@/data/generated/dashboard.json";
import type { DashboardData } from "@/data/types";

// 图表库（ECharts / globe.gl）在模块加载时会访问 window，
// 静态导出预渲染阶段没有 window —— 必须关闭 SSR 动态加载。
const RankingChart = dynamicImport(
  () => import("@/components/dashboard/ranking-chart").then((m) => m.RankingChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const UnitPriceChart = dynamicImport(
  () => import("@/components/dashboard/unit-price-chart").then((m) => m.UnitPriceChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const MiniGlobe = dynamicImport(
  () => import("@/components/dashboard/mini-globe").then((m) => m.MiniGlobe),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

function ChartSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-6 w-6 animate-pulse rounded-full bg-[var(--color-warm-gray)]" />
    </div>
  );
}

const data = dashboard as DashboardData;

const stats = [
  { label: "全球贸易规模", value: data.worldTotal / 1e9, decimals: 2, suffix: "B", prefix: "$", hint: "医疗防护三品类合计" },
  { label: "覆盖经济体", value: data.countryCount, suffix: "", hint: "主要进口国" },
  { label: "跟踪品类", value: data.categoryCount, suffix: "", hint: "HS 编码口径" },
  { label: "贸易伙伴", value: Math.max(...data.ranking.map((r) => r.partners)), suffix: "+", hint: "单国最多伙伴数" },
  { label: "数据年份", value: data.period, suffix: "", hint: "UN Comtrade" },
  { label: "数据来源", value: 3, suffix: " 个", hint: "全部公开可溯源" },
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
                全球医疗防护贸易看板
              </h1>
              <span className="font-mono text-[11px] text-[var(--color-ink-faint)]">
                GLOBAL MEDICAL PROTECTION TRADE
              </span>
            </div>
            <div className="flex items-center gap-4 font-mono text-[10px] text-[var(--color-ink-faint)]">
              <span>{data.period} · ANNUAL</span>
              <span>SRC: UN COMTRADE</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1520px] px-5 lg:px-8">
          {/* 指标带 */}
          <StatBand stats={stats} />

          {/* 四象限 */}
          <div className="grid grid-cols-1 gap-px border-b border-[var(--color-border)] bg-[var(--color-border)] lg:grid-cols-2">
            {/* ① 全球分布 */}
            <div className="relative min-h-[340px] bg-[var(--color-card)] p-5">
              <PanelHead no="01" title="全球进口分布" hint="按经济体规模 · 点位高度" />
              <div className="h-[280px] w-full">
                <MiniGlobe
                  posting={data.ranking.map((r) => ({ iso: r.iso, value: r.value, name: r.name }))}
                />
              </div>
            </div>

            {/* ② 原料价格趋势 */}
            <div className="min-h-[340px] bg-[var(--color-card)] p-5">
              <PanelHead no="02" title="单位进口价格" hint="USD/kg · 同品类跨国对比" />
              <div className="h-[280px] w-full">
                <UnitPriceChart />
              </div>
            </div>

            {/* ③ 国家排名 */}
            <div className="min-h-[340px] bg-[var(--color-card)] p-5">
              <PanelHead no="03" title="进口规模排名" hint={`${data.countryCount} 个经济体 · 可切换品类`} />
              <div className="h-[280px] w-full">
                <RankingChart data={data} />
              </div>
            </div>

            {/* ④ 品类结构 */}
            <div className="min-h-[340px] bg-[var(--color-card)] p-5">
              <PanelHead no="04" title="品类结构" hint="三大品类 · 市场占比" />
              <div className="mt-4 space-y-3">
                {data.categories.map((c, i) => {
                  const pct = (c.total / data.worldTotal) * 100;
                  const colors = ["#3a7b9e", "#6d9fb8", "#daa55c"];
                  return (
                    <div key={c.code}>
                      <div className="mb-1 flex items-baseline justify-between">
                        <span className="text-[12px] text-[var(--color-ink)]">{c.name}</span>
                        <span className="font-mono text-[11px] text-[var(--color-ink-soft)]">
                          ${(c.total / 1e9).toFixed(2)}B · {pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-warm-gray)]">
                        <div
                          className="h-full rounded-full transition-[width] duration-1000"
                          style={{ width: `${pct}%`, backgroundColor: colors[i % 3] }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="mt-6 border-t border-[var(--color-border)] pt-4">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[var(--color-ink-faint)]">
                    最大市场
                  </div>
                  {data.ranking.slice(0, 3).map((r, i) => (
                    <div key={r.iso} className="flex items-center justify-between py-1.5">
                      <span className="flex items-center gap-2 text-[12px] text-[var(--color-ink)]">
                        <span className="font-mono text-[10px] text-[var(--color-ink-faint)]">
                          0{i + 1}
                        </span>
                        {r.name}
                      </span>
                      <span className="font-mono text-[11px] text-[var(--color-warm-blue)]">
                        ${(r.value / 1e9).toFixed(2)}B
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 页脚说明 */}
          <Reveal>
            <div className="flex flex-col gap-2 py-5 text-[10px] text-[var(--color-ink-faint)] sm:flex-row sm:items-center sm:justify-between">
              <p>
                数据来源：UN Comtrade · World Bank · FRED ｜ 口径：HS 六位码 · 年度进口额
              </p>
              <p className="font-mono">MoJin Insights · {data.period}</p>
            </div>
          </Reveal>
        </div>
      </main>
    </>
  );
}

function PanelHead({ no, title, hint }: { no: string; title: string; hint: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[10px] text-[var(--color-warm-blue)]">{no}</span>
        <h2 className="text-[13px] font-semibold text-[var(--color-ink)]">{title}</h2>
      </div>
      <span className="text-[10px] text-[var(--color-ink-faint)]">{hint}</span>
    </div>
  );
}
