"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/sections/footer";
import { Reveal } from "@/components/motion/reveal";

const REPORTS = [
  {
    id: "r-001",
    title: "中东医疗防护用品进口结构（2015–2024）",
    period: "2026 Q4",
    pages: 18,
    desc: "基于 UN Comtrade 的十年贸易数据，分析品类结构迁移与主要供应国份额变化。",
    ready: false,
  },
  {
    id: "r-002",
    title: "一次性医疗耗材环境负荷：DPSIR 框架分析",
    period: "2026 Q4",
    pages: 24,
    desc: "从驱动力到政策响应，梳理一次性耗材的环境影响链条。",
    ready: false,
  },
];

export default function ReportsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden pt-36 pb-20">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" />
          <div className="relative mx-auto max-w-[1200px] px-6 lg:px-10">
            <Reveal>
              <p className="eyebrow mb-5">Reports</p>
              <h1 className="display mb-7 max-w-3xl">研究报告</h1>
              <p className="body-lg max-w-2xl">
                每份报告都附数据来源、口径说明与计算方法。不做无法核验的推断。
              </p>
            </Reveal>
          </div>
        </section>

        <section className="pb-24">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <div className="grid gap-6 md:grid-cols-2">
              {REPORTS.map((r, i) => (
                <Reveal key={r.id} delay={i * 0.1}>
                  <article className="flex h-full flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-[var(--shadow-card)]">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-warm-blue)]">
                        {r.id.toUpperCase()}
                      </span>
                      <span className="rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-[10px] text-[var(--color-ink-soft)]">
                        {r.ready ? "可下载" : "筹备中"}
                      </span>
                    </div>
                    <h2 className="mb-3 text-lg font-semibold leading-snug text-[var(--color-ink)]">
                      {r.title}
                    </h2>
                    <p className="mb-6 flex-1 text-sm leading-relaxed text-[var(--color-ink-soft)]">{r.desc}</p>
                    <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-5 text-xs text-[var(--color-ink-faint)]">
                      <span>{r.period} · 约 {r.pages} 页</span>
                      <span className={r.ready ? "text-[var(--color-warm-blue)]" : "opacity-50"}>
                        {r.ready ? "下载 PDF →" : "即将发布"}
                      </span>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <div className="mt-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-8">
                <h3 className="mb-2 text-sm font-semibold text-[var(--color-ink)]">报告更新节奏</h3>
                <p className="text-sm leading-relaxed text-[var(--color-ink-soft)]">
                  季度更新。数据出现结构性变化时会提前发布简报，
                  不再做无变化的内容更新。
                  <Link href="/contact/" className="ml-1 text-[var(--color-warm-blue)] hover:underline">
                    订阅更新
                  </Link>
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
