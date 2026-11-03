"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/sections/footer";
import { Reveal } from "@/components/motion/reveal";
import { DataSection } from "@/components/sections/data-section";

const ENTRIES = [
  {
    sdg: "SDG 3",
    title: "中东医疗防护进口结构演变",
    summary:
      "沙特与海湾国家的防护用品进口在过去十年如何变化，品类结构向何处迁移。",
    status: "进行中",
    accent: "warm-blue",
  },
  {
    sdg: "SDG 6",
    title: "基础卫生设施与防护耗材使用强度",
    summary:
      "卫生基础设施水平与一次性防护耗材使用量之间的关系，以及区域差异的结构性成因。",
    status: "规划中",
    accent: "light-blue",
  },
  {
    sdg: "SDG 12 / 13",
    title: "一次性医疗耗材与环境负荷",
    summary:
      "从材料替代、回收路径到政策响应的完整链条——用 DPSIR 框架分析。",
    status: "规划中",
    accent: "desert-gold",
  },
];

export default function InsightsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden pt-36 pb-20">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" />
          <div className="relative mx-auto max-w-[1200px] px-6 lg:px-10">
            <Reveal>
              <p className="eyebrow mb-5">Insights</p>
              <h1 className="display mb-7 max-w-3xl">洞察</h1>
              <p className="body-lg max-w-2xl">
                按联合国可持续发展目标组织的议题追踪。每项分析都标注数据来源与计算方法。
              </p>
            </Reveal>
          </div>
        </section>

        <section className="pb-24">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <div className="space-y-5">
              {ENTRIES.map((e, i) => (
                <Reveal key={e.title} delay={i * 0.08}>
                  <article className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 transition-[border-color,box-shadow] hover:border-[var(--color-warm-blue)]/35 hover:shadow-[var(--shadow-hover)]">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                      <div className="max-w-2xl">
                        <div className="mb-3 flex items-center gap-3">
                          <span className="rounded-full bg-[var(--color-warm-blue)]/10 px-2.5 py-1 text-[10px] font-medium tracking-wide text-[var(--color-warm-blue)]">
                            {e.sdg}
                          </span>
                          <span className="text-[11px] text-[var(--color-ink-faint)]">{e.status}</span>
                        </div>
                        <h2 className="mb-2 text-xl font-semibold text-[var(--color-ink)]">{e.title}</h2>
                        <p className="text-sm leading-relaxed text-[var(--color-ink-soft)]">{e.summary}</p>
                      </div>
                      <span className="shrink-0 text-[var(--color-ink-faint)] transition-[transform,color] group-hover:translate-x-1 group-hover:text-[var(--color-warm-blue)]">
                        →
                      </span>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <div className="mt-12 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-warm-gray)] p-8 text-center">
                <p className="text-sm text-[var(--color-ink-soft)]">
                  更多议题正在整理中。想优先看到哪个方向？
                  <Link href="/contact/" className="ml-1 text-[var(--color-warm-blue)] hover:underline">
                    告诉我们
                  </Link>
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <DataSection />
      </main>
      <SiteFooter />
    </>
  );
}
