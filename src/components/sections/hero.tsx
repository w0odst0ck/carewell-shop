"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import dynamic from "next/dynamic";
import { NumberTicker } from "@/components/motion/number-ticker";
import { keyMetrics } from "@/data/insights";

const GlobeViz = dynamic(
  () => import("@/components/viz/globe").then((m) => m.GlobeViz),
  { ssr: false, loading: () => <div className="h-full w-full" /> }
);

export function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set([".hero-eyebrow", ".hero-line", ".hero-sub", ".hero-cta", ".hero-metrics"], {
          opacity: 1,
          y: 0,
        });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.7 })
        .to(
          ".hero-line",
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 },
          "-=0.35"
        )
        .to(".hero-sub", { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
        .to(".hero-cta", { opacity: 1, y: 0, duration: 0.7 }, "-=0.55")
        .to(".hero-metrics", { opacity: 1, y: 0, duration: 0.8 }, "-=0.5");
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pt-16"
    >
      {/* 网格背景 */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />

      {/* 光晕 */}
      <div
        className="pointer-events-none absolute -top-[20%] left-1/2 h-[70vh] w-[90vw] -translate-x-1/2 rounded-full opacity-[0.14] blur-[120px]"
        style={{ background: "radial-gradient(circle, #3a7b9e 0%, transparent 65%)" }}
      />

      <div className="relative mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        {/* 左：文字 */}
        <div className="z-10 min-w-0">
          <p className="hero-eyebrow eyebrow mb-8 opacity-0 translate-y-4">
            Global Health · Sanitation · Environment
          </p>

          <h1 className="display mb-8">
            <span className="hero-line block opacity-0 translate-y-6">用数据看清</span>
            <span className="hero-line block opacity-0 translate-y-6 text-[var(--color-warm-blue)]">
              全球卫生与环境
            </span>
            <span className="hero-line block opacity-0 translate-y-6">的真实走向</span>
          </h1>

          <p className="hero-sub body-lg mb-10 max-w-xl opacity-0 translate-y-4">
            MoJin Insights 追踪医疗物资供应链、基础卫生设施与环境负荷的全球演进。
            所有数据来自公开权威来源，<span className="text-[var(--color-ink)]">可溯源、可复现</span>。
          </p>

          <div className="hero-cta flex flex-wrap items-center gap-4 opacity-0 translate-y-4">
            <a
              href="/solutions/"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-warm-blue)] px-6 py-3 text-sm font-medium text-white transition-[background-color,transform] hover:bg-[var(--color-warm-blue)] active:scale-[0.98]"
            >
              查看方案
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </a>
            <a
              href="/about/"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-6 py-3 text-sm text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink-faint)] hover:bg-white/[0.03]"
            >
              查看方法
            </a>
          </div>

          {/* 指标条 */}
          <dl className="hero-metrics mt-16 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-[var(--color-border)] pt-8 opacity-0 translate-y-4 sm:grid-cols-4">
            {keyMetrics.map((m) => (
              <div key={m.label}>
                <dd className="text-2xl font-medium tracking-tight text-[var(--color-ink)] sm:text-3xl">
                  <NumberTicker value={m.value} suffix={m.suffix} duration={1800} />
                </dd>
                <dt className="mt-1 text-[11px] leading-tight text-[var(--color-ink-soft)]">
                  {m.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>

        {/* 右：地球 */}
        <div className="relative h-[46vh] w-full min-w-0 overflow-hidden lg:h-[78vh]">
          <GlobeViz />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--color-cream)] to-transparent" />
        </div>
      </div>

      {/* 滚动提示 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
        <div className="flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[var(--color-ink-faint)]">
          <span>Scroll</span>
          <span className="h-8 w-px bg-gradient-to-b from-[var(--color-border)] to-transparent" />
        </div>
      </div>
    </section>
  );
}
