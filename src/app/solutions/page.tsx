"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/sections/footer";
import { Reveal } from "@/components/motion/reveal";
import { solutions, oemCapability, mixedContainer } from "@/data/solutions";
import { productCatalog } from "@/data/products";
import { site } from "@/data/site";

const CAT_MAP = new Map<string, (typeof productCatalog.categories)[number]>(
  productCatalog.categories.map((c) => [c.id as string, c])
);

export default function SolutionsPage() {
  const [active, setActive] = useState<string>(solutions[0].id);
  const cur = solutions.find((s) => s.id === active) ?? solutions[0];

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* 页头 */}
        <section className="relative overflow-hidden pt-32 pb-12">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" />
          <div className="relative mx-auto max-w-[1200px] px-6 lg:px-10">
            <Reveal>
              <p className="eyebrow mb-5">Solutions</p>
              <h1 className="display mb-6 max-w-2xl">按场景配货，不按品类下单</h1>
              <p className="body-lg max-w-xl">
                客户通常不会说「我要买口罩」——他们说「我开酒店」「我做餐饮」。
                下面六个场景，覆盖从日常消耗到手术室的完整需求。
              </p>
            </Reveal>
          </div>
        </section>

        {/* 方案切换 */}
        <section className="pb-8">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <Reveal delay={0.05}>
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-3 lg:grid-cols-6">
                {solutions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActive(s.id)}
                    className={`bg-[var(--color-card)] p-4 text-left transition-colors ${
                      active === s.id
                        ? "bg-[var(--color-warm-blue)]/5"
                        : "hover:bg-[var(--color-warm-gray)]/40"
                    }`}
                  >
                    <div className="mb-1.5 font-mono text-[10px] text-[var(--color-warm-blue)]">
                      {s.no}
                    </div>
                    <div className="text-[12.5px] font-medium leading-snug text-[var(--color-ink)]">
                      {s.name}
                    </div>
                    <div className="mt-0.5 text-[9.5px] leading-snug text-[var(--color-ink-faint)]">
                      {s.nameEn}
                    </div>
                  </button>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* 当前方案详情 */}
        <section className="pb-16">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
              {/* 左：场景与痛点 */}
              <Reveal>
                <div className="sticky top-24">
                  <div className="mb-2 font-mono text-[11px] text-[var(--color-warm-blue)]">
                    SCENARIO {cur.no}
                  </div>
                  <h2 className="mb-2 text-2xl font-semibold text-[var(--color-ink)]">
                    {cur.name}
                  </h2>
                  <p className="mb-8 text-[13px] text-[var(--color-ink-soft)]">{cur.scene}</p>

                  <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-faint)]">
                    常见问题
                  </div>
                  <ul className="space-y-2.5">
                    {cur.pain.map((p) => (
                      <li key={p} className="flex gap-2 text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">
                        <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--color-sand-orange)]" />
                        {p}
                      </li>
                    ))}
                  </ul>

                  {cur.highlight && (
                    <div className="mt-7 rounded-lg border border-[var(--color-warm-blue)]/25 bg-[var(--color-warm-blue)]/5 p-4">
                      <div className="mb-1 text-[10px] uppercase tracking-wider text-[var(--color-warm-blue)]">
                        方案特点
                      </div>
                      <p className="text-[12px] leading-relaxed text-[var(--color-ink)]">
                        {cur.highlight}
                      </p>
                    </div>
                  )}
                </div>
              </Reveal>

              {/* 右：品类组合 */}
              <Reveal delay={0.08}>
                <div className="mb-3 flex items-baseline justify-between">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-faint)]">
                    品类组合
                  </div>
                  <div className="font-mono text-[10px] text-[var(--color-ink-faint)]">
                    {cur.groups.reduce((n, g) => n + g.items.length, 0)} 项 ·{" "}
                    {cur.groups.length} 大类
                  </div>
                </div>

                <div className="space-y-3">
                  {cur.groups.map((g) => {
                    const cat = CAT_MAP.get(g.catId);
                    return (
                      <div
                        key={g.catId}
                        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4"
                      >
                        <div className="mb-2.5 flex items-baseline gap-2">
                          <span className="font-mono text-[10px] text-[var(--color-warm-blue)]">
                            {g.catId}
                          </span>
                          <span className="text-[12.5px] font-medium text-[var(--color-ink)]">
                            {cat?.nameZh ?? g.catId}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {g.items.map((it) => (
                            <span
                              key={it}
                              className="rounded-md bg-[var(--color-cream)] px-2 py-1 text-[11px] text-[var(--color-ink-soft)]"
                            >
                              {it}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <Link
                    href="/contact/"
                    className="flex-1 rounded-lg bg-[var(--color-sand-orange)] px-5 py-3 text-center text-[13px] font-medium text-white shadow-[var(--shadow-btn)] transition-[background-color] hover:bg-[var(--color-light-orange)]"
                  >
                    针对这个场景询盘
                  </Link>
                  <a
                    href={`https://wa.me/${site.waNumber}?text=${encodeURIComponent(
                      `你好，我在 mojin.store 看到「${cur.name}」方案，想了解详情。`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-lg border border-[var(--color-wa-green)] px-5 py-3 text-center text-[13px] font-medium text-[var(--color-wa-green)] transition-colors hover:bg-[var(--color-wa-green)]/10"
                  >
                    WhatsApp 直接问
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 横向能力 */}
        <section className="border-t border-[var(--color-border)] bg-[var(--color-card)]/40 py-16">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <Reveal>
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
                  <h3 className="mb-2 text-base font-semibold text-[var(--color-ink)]">
                    {mixedContainer.title}
                  </h3>
                  <p className="mb-5 text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">
                    {mixedContainer.desc}
                  </p>
                  <ul className="space-y-2">
                    {mixedContainer.points.map((p) => (
                      <li key={p} className="flex gap-2 text-[12px] text-[var(--color-ink-soft)]">
                        <span className="text-[var(--color-warm-blue)]">·</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
                  <h3 className="mb-2 text-base font-semibold text-[var(--color-ink)]">
                    {oemCapability.title}
                  </h3>
                  <p className="mb-5 text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">
                    {oemCapability.desc}
                  </p>
                  <ul className="space-y-2">
                    {oemCapability.points.map((p) => (
                      <li key={p} className="flex gap-2 text-[12px] text-[var(--color-ink-soft)]">
                        <span className="text-[var(--color-sand-orange)]">·</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}