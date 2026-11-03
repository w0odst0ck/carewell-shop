"use client";

import { Reveal } from "@/components/motion/reveal";
import { NumberTicker } from "@/components/motion/number-ticker";
import { topics } from "@/data/insights";

const ACCENT_CLASS: Record<string, { text: string; ring: string; glow: string }> = {
  brand: {
    text: "text-[var(--color-warm-blue)]",
    ring: "group-hover:ring-[var(--color-warm-blue)]/40",
    glow: "bg-[var(--color-warm-blue)]/10",
  },
  teal: {
    text: "text-[var(--color-warm-blue)]",
    ring: "group-hover:ring-[var(--color-warm-blue)]/40",
    glow: "bg-[var(--color-warm-blue)]/10",
  },
  amber: {
    text: "text-[var(--color-sand-orange)]",
    ring: "group-hover:ring-[var(--color-sand-orange)]/40",
    glow: "bg-[var(--color-sand-orange)]/10",
  },
};

export function Topics() {
  return (
    <section id="topics" className="relative border-t border-[var(--color-border)] py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <Reveal>
          <p className="eyebrow mb-4">Research Areas</p>
          <h2 className="h2 mb-6 max-w-3xl">三个与可持续发展目标对齐的研究方向</h2>
          <p className="body-lg max-w-2xl">
            每个议题都对应联合国可持续发展目标的具体指标，用可复现的方法追踪其演进。
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {topics.map((t, i) => {
            const accent = ACCENT_CLASS[t.accent];
            return (
              <Reveal key={t.id} delay={i * 0.1} as="div">
                <article
                  className={`group relative flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 ring-1 ring-transparent transition-[border-color,transform] duration-300 hover:border-[var(--color-border-soft)] hover:-translate-y-1 ${accent.ring}`}
                >
                  <div
                    className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 ${accent.glow}`}
                  />

                  <div className="mb-6 flex items-center justify-between">
                    <span
                      className={`rounded-full border border-current/20 px-2.5 py-1 text-[10px] font-medium tracking-wide ${accent.text}`}
                    >
                      {t.sdg}
                    </span>
                    <span className="text-[11px] text-[var(--color-ink-faint)]">
                      0{i + 1}
                    </span>
                  </div>

                  <h3 className="mb-3 text-xl font-medium tracking-tight text-[var(--color-ink)]">
                    {t.title}
                  </h3>
                  <p className="mb-8 flex-1 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                    {t.summary}
                  </p>

                  <div className="flex items-end justify-between border-t border-[var(--color-border)] pt-5">
                    <div>
                      <div className="text-2xl font-medium tracking-tight text-[var(--color-ink)]">
                        <NumberTicker value={t.metric.value} duration={1400} />
                      </div>
                      <div className="mt-0.5 text-[11px] text-[var(--color-ink-soft)]">
                        {t.metric.label}
                      </div>
                    </div>
                    <span className="text-[var(--color-ink-faint)] transition-[transform,color] duration-300 group-hover:translate-x-1 group-hover:text-[var(--color-ink)]">
                      →
                    </span>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
