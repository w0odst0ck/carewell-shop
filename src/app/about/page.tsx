"use client";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/sections/footer";
import { Reveal } from "@/components/motion/reveal";
import { NumberTicker } from "@/components/motion/number-ticker";
import { companyIntro, story, capabilities, principles } from "@/data/about";
import { site } from "@/data/site";

const STATS = [
  { label: "防护用品生产经验", value: 5, suffix: "+ 年" },
  { label: "可生产品类", value: 12, suffix: " 大类" },
  { label: "公开数据源", value: 29, suffix: " 个" },
  { label: "覆盖国家", value: 193, suffix: "" },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* 头部 */}
        <section className="relative overflow-hidden pt-36 pb-20">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" />
          <div className="relative mx-auto max-w-[1200px] px-6 lg:px-10">
            <Reveal>
              <p className="eyebrow mb-5">{companyIntro.eyebrow}</p>
              <h1 className="display mb-7 max-w-3xl">{companyIntro.title}</h1>
              <p className="body-lg max-w-2xl">{companyIntro.lede}</p>
            </Reveal>

            <Reveal delay={0.1}>
              <dl className="mt-16 grid grid-cols-2 gap-8 border-t border-[var(--color-border)] pt-10 md:grid-cols-4">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <dd className="text-3xl font-semibold tracking-tight text-[var(--color-warm-blue)] md:text-4xl">
                      <NumberTicker value={s.value} suffix={s.suffix} />
                    </dd>
                    <dt className="mt-2 text-xs text-[var(--color-ink-soft)]">{s.label}</dt>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* 故事 */}
        <section className="border-t border-[var(--color-border)] bg-[var(--color-warm-gray)] py-24">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <Reveal>
              <h2 className="h2 mb-14">我们是谁</h2>
            </Reveal>
            <div className="grid gap-10 md:grid-cols-3">
              {story.map((s, i) => (
                <Reveal key={s.year} delay={i * 0.1}>
                  <article className="h-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-[var(--shadow-card)]">
                    <span className="mb-4 inline-block rounded-full bg-[var(--color-warm-blue)]/10 px-3 py-1 font-[family-name:var(--font-mono)] text-[11px] tracking-wide text-[var(--color-warm-blue)]">
                      {s.year}
                    </span>
                    <h3 className="mb-3 text-lg font-semibold text-[var(--color-ink)]">{s.title}</h3>
                    <p className="text-sm leading-relaxed text-[var(--color-ink-soft)]">{s.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 能力 */}
        <section className="py-24">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <Reveal>
              <p className="eyebrow mb-4">Capabilities</p>
              <h2 className="h2 mb-4">我们做什么</h2>
              <p className="body-lg mb-14 max-w-2xl">
                生产是我们立足的地方，数据研究是我们正在做的事。两者服务于同一个判断：什么值得做。
              </p>
            </Reveal>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2">
              {capabilities.map((c, i) => (
                <Reveal key={c.title} delay={i * 0.07}>
                  <div className="h-full bg-[var(--color-card)] p-8 transition-colors duration-300 hover:bg-[var(--color-cream)]">
                    <h3 className="mb-2 text-base font-semibold text-[var(--color-ink)]">{c.title}</h3>
                    <p className="text-sm leading-relaxed text-[var(--color-ink-soft)]">{c.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 原则 */}
        <section className="border-t border-[var(--color-border)] bg-[var(--color-warm-gray)] py-24">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <Reveal>
              <p className="eyebrow mb-4">Principles</p>
              <h2 className="h2 mb-14">三条原则</h2>
            </Reveal>
            <div className="grid gap-8 md:grid-cols-3">
              {principles.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.1}>
                  <div className="border-l-2 border-[var(--color-sand-orange)] pl-5">
                    <h3 className="mb-2 text-base font-semibold text-[var(--color-ink)]">{p.title}</h3>
                    <p className="text-sm leading-relaxed text-[var(--color-ink-soft)]">{p.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 公司信息 */}
        <section className="py-20">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <Reveal>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-10 shadow-[var(--shadow-card)]">
                <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-[var(--color-ink-faint)]">
                  公司信息
                </h3>
                <dl className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-[var(--color-ink-faint)]">公司名称</dt>
                    <dd className="mt-1 text-sm text-[var(--color-ink)]">{site.company.zh}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--color-ink-faint)]">English Name</dt>
                    <dd className="mt-1 text-sm text-[var(--color-ink)]">{site.company.en}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--color-ink-faint)]">品牌</dt>
                    <dd className="mt-1 text-sm text-[var(--color-ink)]">
                      {site.company.brand} · {site.company.brandAr}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--color-ink-faint)]">联系邮箱</dt>
                    <dd className="mt-1 text-sm text-[var(--color-ink)]">
                      <a href={`mailto:${site.email}`} className="text-[var(--color-warm-blue)] hover:underline">
                        {site.email}
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
