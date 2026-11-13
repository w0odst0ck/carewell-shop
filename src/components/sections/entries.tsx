"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NumberTicker } from "@/components/motion/number-ticker";
import { entries } from "@/data/home";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ACCENT: Record<
  string,
  { text: string; glow: string; border: string; dot: string }
> = {
  brand: {
    text: "text-[var(--color-warm-blue)]",
    glow: "bg-[var(--color-warm-blue)]/12",
    border: "group-hover:border-[var(--color-warm-blue)]/40",
    dot: "bg-[var(--color-warm-blue)]",
  },
  amber: {
    text: "text-[var(--color-sand-orange)]",
    glow: "bg-[var(--color-sand-orange)]/12",
    border: "group-hover:border-[var(--color-sand-orange)]/40",
    dot: "bg-[var(--color-sand-orange)]",
  },
  teal: {
    text: "text-[var(--color-light-blue)]",
    glow: "bg-[var(--color-light-blue)]/12",
    border: "group-hover:border-[var(--color-light-blue)]/40",
    dot: "bg-[var(--color-light-blue)]",
  },
};

export function Entries() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      gsap.set(".entry-head, .entry-card", { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".entry-head",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 78%" },
        }
      );

      gsap.fromTo(
        ".entry-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.14,
          ease: "power3.out",
          scrollTrigger: { trigger: ".entry-grid", start: "top 82%" },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative border-t border-[var(--color-border)] py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="entry-head mb-16 opacity-0">
          <p className="eyebrow mb-4">What you can find</p>
          <h2 className="h2 mb-6 max-w-3xl">三块内容，分别回答三个问题</h2>
          <p className="body-lg max-w-2xl">
            市场在怎么变（看板）、你的场景该配什么（方案）、哪里有在采购（线索）。
          </p>
        </div>

        <div className="entry-grid grid gap-6 md:grid-cols-3">
          {entries.map((e) => {
            const a = ACCENT[e.accent];
            return (
              <a
                key={e.id}
                href={e.href}
                className={`entry-card group relative flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 opacity-0 transition-[border-color,transform,box-shadow] duration-400 hover:-translate-y-1.5 hover:shadow-[var(--shadow-card)] ${a.border}`}
              >
                {/* 角落光晕 */}
                <div
                  className={`pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 ${a.glow}`}
                />

                <div className="mb-7 flex items-center justify-between">
                  <span className={`font-mono text-[11px] ${a.text}`}>{e.no}</span>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">
                    {e.eyebrow}
                  </span>
                </div>

                <h3 className="mb-3 text-xl font-medium tracking-tight text-[var(--color-ink)]">
                  {e.title}
                </h3>
                <p className="mb-8 flex-1 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                  {e.desc}
                </p>

                <div className="flex items-end justify-between border-t border-[var(--color-border)] pt-5">
                  <div>
                    <div className="font-mono text-2xl font-light tracking-tight text-[var(--color-ink)]">
                      <NumberTicker value={e.metric.value} duration={1400} />
                      <span className="ml-0.5 text-sm text-[var(--color-ink-soft)]">
                        {e.metric.suffix}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--color-ink-soft)]">
                      {e.metric.label}
                    </div>
                  </div>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-ink-faint)] transition-[transform,color,border-color] duration-300 group-hover:translate-x-1 group-hover:text-[var(--color-ink)]`}
                  >
                    →
                  </span>
                </div>

                {/* 底部进度条式装饰 */}
                <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden">
                  <div
                    className={`h-full w-0 transition-[width] duration-700 ease-out group-hover:w-full ${a.dot} opacity-60`}
                  />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}