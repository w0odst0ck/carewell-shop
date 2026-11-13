"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sources } from "@/data/home";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function Method() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".src-head",
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
        ".src-row",
        { opacity: 0, x: -16 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: { trigger: ".src-list", start: "top 84%" },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative border-t border-[var(--color-border)] py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="src-head opacity-0">
            <p className="eyebrow mb-4">Data Sources</p>
            <h2 className="h2 mb-6">只用公开数据</h2>
            <p className="body-lg mb-8">
              全部指标来自政府、国际组织与官方采购平台的公开数据。
              不用爬虫抓商业平台，不碰个人信息，不绕过任何访问限制。
            </p>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
              <p className="text-xs leading-relaxed text-[var(--color-ink-soft)]">
                <span className="text-[var(--color-ink)]">引用说明：</span>
                转载或引用本平台图表与分析时，请注明来源与数据期。
              </p>
            </div>
          </div>

          <div className="src-list divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {sources.map((s, i) => (
              <div
                key={s.name}
                className="src-row group flex items-start gap-6 py-6 opacity-0 transition-colors hover:bg-[var(--color-warm-gray)]/30"
              >
                <span className="mt-1 shrink-0 font-mono text-[11px] text-[var(--color-warm-blue)]">
                  0{i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-baseline gap-2">
                    <span className="text-[15px] font-medium text-[var(--color-ink)]">
                      {s.name}
                    </span>
                    <span className="text-[11px] text-[var(--color-ink-faint)]">{s.desc}</span>
                  </div>
                  <p className="text-[12px] text-[var(--color-ink-soft)]">{s.use}</p>
                </div>
                <span className="mt-1 shrink-0 text-[10px] uppercase tracking-wider text-[var(--color-ink-faint)] opacity-0 transition-opacity group-hover:opacity-100">
                  公开
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}