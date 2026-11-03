"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/motion/reveal";

export function SiteFooter() {
  // 预渲染时不能用 new Date()，客户端挂载后再取年份
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <>
      {/* 订阅 CTA */}
      <section id="subscribe" className="relative border-t border-[var(--color-border)] py-28">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 100%, #3a7b9e 0%, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-[1400px] px-6 text-center lg:px-10">
          <Reveal>
            <p className="eyebrow mb-5">Stay Informed</p>
            <h2 className="h2 mx-auto mb-6 max-w-2xl">每月一封，只推送有变化的议题</h2>
            <p className="body-lg mx-auto mb-10 max-w-xl">
              不做内容营销，只在数据出现结构性变化时发出提醒。
            </p>
            <form
              className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-5 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-warm-blue)]/60"
              />
              <button
                type="submit"
                className="rounded-full bg-[var(--color-warm-blue)] px-6 py-3 text-sm font-medium text-white transition-[background-color,transform] hover:bg-[var(--color-warm-blue)] active:scale-[0.98]"
              >
                订阅
              </button>
            </form>
          </Reveal>
        </div>
      </section>

      {/* 页脚 */}
      <footer id="site-footer" className="border-t border-[var(--color-border)] py-14">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="flex flex-col justify-between gap-10 md:flex-row">
            <div className="max-w-sm">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-[var(--color-warm-blue)]/12 ring-1 ring-[var(--color-warm-blue)]/30">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-warm-blue)]" />
                </span>
                <span className="text-[15px] font-medium text-[var(--color-ink)]">
                  MoJin <span className="text-[var(--color-ink-soft)]">Insights</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[var(--color-ink-soft)]">
                全球卫生、医疗与环境议题的公开数据研究。
                数据可溯源，方法可复现。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
              <div>
                <h4 className="mb-4 text-[11px] uppercase tracking-wider text-[var(--color-ink-faint)]">
                  研究
                </h4>
                <ul className="space-y-2.5 text-sm text-[var(--color-ink-soft)]">
                  <li><a className="transition-colors hover:text-[var(--color-ink)]" href="/insights/">洞察</a></li>
                  <li><a className="transition-colors hover:text-[var(--color-ink)]" href="/reports/">报告</a></li>
                  <li><a className="transition-colors hover:text-[var(--color-ink)]" href="/about/">关于</a></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-[11px] uppercase tracking-wider text-[var(--color-ink-faint)]">
                  数据源
                </h4>
                <ul className="space-y-2.5 text-sm text-[var(--color-ink-soft)]">
                  <li>UN Comtrade</li>
                  <li>WHO GHO</li>
                  <li>World Bank</li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-[11px] uppercase tracking-wider text-[var(--color-ink-faint)]">
                  联系
                </h4>
                <ul className="space-y-2.5 text-sm text-[var(--color-ink-soft)]">
                  <li><a className="transition-colors hover:text-[var(--color-ink)]" href="mailto:info@mojin.store">info@mojin.store</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="hairline my-10" />

          <div className="flex flex-col items-start justify-between gap-3 text-[11px] text-[var(--color-ink-faint)] sm:flex-row sm:items-center">
            <p>© {year ?? ""} MoJin Insights · 数据来自公开来源</p>
            <p className="font-[family-name:var(--font-mono)]">
              Built with Next.js · Three.js · ECharts
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
