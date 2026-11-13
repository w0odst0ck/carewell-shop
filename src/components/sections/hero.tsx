"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NumberTicker } from "@/components/motion/number-ticker";
import { heroMetrics } from "@/data/home";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const targets = [
        ".hero-eyebrow",
        ".hero-line",
        ".hero-sub",
        ".hero-cta",
        ".hero-metrics",
        ".hero-scroll",
      ];

      if (reduce) {
        gsap.set(targets, { opacity: 1, y: 0, clearProps: "transform" });
        return;
      }

      // 入场序列
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(".hero-eyebrow", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 })
        .fromTo(
          ".hero-line",
          { opacity: 0, y: 28, filter: "blur(6px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.0,
            stagger: 0.13,
          },
          "-=0.4"
        )
        .fromTo(".hero-sub", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.55")
        .fromTo(".hero-cta", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
        .fromTo(
          ".hero-metric",
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.09 },
          "-=0.5"
        )
        .fromTo(".hero-scroll", { opacity: 0 }, { opacity: 1, duration: 0.6 }, "-=0.3");

      // 光晕缓慢呼吸
      gsap.to(".hero-glow", {
        scale: 1.15,
        opacity: 0.2,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 网格轻微视差
      gsap.to(".hero-grid", {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      // 内容随滚动淡出
      gsap.to(".hero-inner", {
        opacity: 0.15,
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "40% top",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pt-20"
    >
      {/* 网格背景 */}
      <div className="hero-grid pointer-events-none absolute inset-0 grid-bg opacity-40" />

      {/* 光晕 */}
      <div
        className="hero-glow pointer-events-none absolute -top-[18%] left-1/2 h-[70vh] w-[90vw] -translate-x-1/2 rounded-full opacity-[0.14] blur-[120px]"
        style={{ background: "radial-gradient(circle, #3a7b9e 0%, transparent 65%)" }}
      />

      <div className="hero-inner relative mx-auto w-full max-w-[1400px] px-6 lg:px-10">
        <p className="hero-eyebrow eyebrow mb-8 opacity-0">
          Medical Consumables · Price &amp; Sourcing Intelligence
        </p>

        <h1 className="display mb-8 max-w-4xl">
          <span className="hero-line block opacity-0">一次性防护用品的</span>
          <span className="hero-line block opacity-0 text-[var(--color-warm-blue)]">
            价格、货源与市场
          </span>
          <span className="hero-line block opacity-0">用真实数据看清楚</span>
        </h1>

        <p className="hero-sub body-lg mb-10 max-w-xl opacity-0">
          从原油与树脂的原料价格，到出口运价与到岸成本，再到各国公共采购公告——
          所有数字来自公开权威源，<span className="text-[var(--color-ink)]">可溯源、可复现</span>。
        </p>

        <div className="hero-cta flex flex-wrap items-center gap-4 opacity-0">
          <a
            href="/dashboard/"
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-warm-blue)] px-6 py-3 text-sm font-medium text-white transition-[background-color,transform] hover:bg-[var(--color-light-blue)] active:scale-[0.98]"
          >
            查看看板
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </a>
          <a
            href="/solutions/"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-6 py-3 text-sm text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink-faint)] hover:bg-[var(--color-warm-gray)]"
          >
            场景方案
          </a>
          <a
            href="/leads/"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-6 py-3 text-sm text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink-faint)] hover:bg-[var(--color-warm-gray)]"
          >
            采购线索
          </a>
        </div>

        {/* 指标条 */}
        <dl className="hero-metrics mt-16 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-[var(--color-border)] pt-8 sm:grid-cols-4">
          {heroMetrics.map((m) => (
            <div key={m.label} className="hero-metric opacity-0">
              <dd className="text-2xl font-medium tracking-tight text-[var(--color-ink)] sm:text-[1.75rem]">
                <span className="font-mono">
                  {m.prefix}
                  <NumberTicker value={m.value} decimals={m.decimals} duration={1600} />
                </span>
              </dd>
              <dt className="mt-1.5 text-[11px] font-medium text-[var(--color-ink-soft)]">
                {m.label}
              </dt>
              <dd className="mt-0.5 font-mono text-[9.5px] text-[var(--color-ink-faint)]">
                {m.date}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* 滚动提示 */}
      <div className="hero-scroll pointer-events-none absolute inset-x-0 bottom-8 flex justify-center opacity-0">
        <div className="flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[var(--color-ink-faint)]">
          <span>Scroll</span>
          <span className="h-8 w-px animate-pulse bg-gradient-to-b from-[var(--color-border)] to-transparent" />
        </div>
      </div>
    </section>
  );
}