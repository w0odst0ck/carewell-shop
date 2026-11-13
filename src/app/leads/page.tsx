"use client";

import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/sections/footer";
import { Reveal } from "@/components/motion/reveal";
import leads from "@/data/generated/leads.json";

type Lead = {
  id: string;
  title: string;
  buyer: string;
  date: string;
  place: string[];
  cpv: string;
  label: string;
  url: string;
};

const DATA = leads as unknown as {
  generatedAt: string;
  source: string;
  sourceUrl: string;
  coverage: string;
  windowDays: number;
  count: number;
  cpvStats: Record<string, { label: string; total: number; fetched: number }>;
  items: Lead[];
};

/** 从标题首段提取国家名（TED 标题格式：国家 – 品类 – 描述） */
function countryOf(title: string): string {
  const i = title.indexOf("–");
  return i > 0 ? title.slice(0, i).trim() : "";
}

/** 去掉国家前缀，只留描述 */
function descOf(title: string): string {
  const parts = title.split("–");
  return parts.length >= 2 ? parts.slice(1).join("–").trim() : title;
}

export default function LeadsPage() {
  const [active, setActive] = useState<string>("all");

  const labels = useMemo(() => {
    const m = new Map<string, number>();
    for (const it of DATA.items) m.set(it.label, (m.get(it.label) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, []);

  const items = useMemo(
    () =>
      (active === "all" ? DATA.items : DATA.items.filter((i) => i.label === active)).slice(0, 60),
    [active]
  );

  const totalLive = Object.values(DATA.cpvStats).reduce((n, s) => n + s.total, 0);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* 页头 */}
        <section className="relative overflow-hidden pt-32 pb-10">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" />
          <div className="relative mx-auto max-w-[1200px] px-6 lg:px-10">
            <Reveal>
              <p className="eyebrow mb-5">Opportunities</p>
              <h1 className="display mb-6 max-w-2xl">全球医疗耗材采购线索</h1>
              <p className="body-lg max-w-2xl">
                来自各国公共采购平台的公开招标公告，按品类归集。
                这里只做信息汇总与索引，不介入任何交易。
              </p>
            </Reveal>
          </div>
        </section>

        {/* 指标带 */}
        <section className="border-y border-[var(--color-border)] bg-[var(--color-card)]">
          <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-px bg-[var(--color-border)] sm:grid-cols-4">
            {[
              { label: "本次收录", value: String(DATA.count), hint: `近 ${DATA.windowDays} 天` },
              {
                label: "在库公告总量",
                value: totalLive.toLocaleString("en-US"),
                hint: "同期全部匹配公告",
              },
              { label: "覆盖品类", value: String(labels.length), hint: "CPV 采购分类" },
              {
                label: "数据源",
                value: "TED",
                hint: "欧盟官方采购公告库",
              },
            ].map((s) => (
              <div key={s.label} className="bg-[var(--color-card)] px-5 py-4">
                <div className="text-[10px] uppercase tracking-wider text-[var(--color-ink-faint)]">
                  {s.label}
                </div>
                <div className="mt-1.5 font-mono text-xl font-light text-[var(--color-ink)]">
                  {s.value}
                </div>
                <div className="mt-0.5 text-[9.5px] text-[var(--color-ink-faint)]">{s.hint}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 筛选 */}
        <section className="py-8">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActive("all")}
                className={`rounded-full px-3.5 py-1.5 text-[11.5px] transition-colors ${
                  active === "all"
                    ? "bg-[var(--color-warm-blue)] text-white"
                    : "border border-[var(--color-border)] text-[var(--color-ink-soft)] hover:border-[var(--color-warm-blue)]/40"
                }`}
              >
                全部 {DATA.count}
              </button>
              {labels.map(([label, n]) => (
                <button
                  key={label}
                  onClick={() => setActive(label)}
                  className={`rounded-full px-3.5 py-1.5 text-[11.5px] transition-colors ${
                    active === label
                      ? "bg-[var(--color-warm-blue)] text-white"
                      : "border border-[var(--color-border)] text-[var(--color-ink-soft)] hover:border-[var(--color-warm-blue)]/40"
                  }`}
                >
                  {label} {n}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 线索列表 */}
        <section className="pb-16">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
              {items.map((it) => (
                <a
                  key={it.id}
                  href={it.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-2 py-4 transition-colors hover:bg-[var(--color-warm-gray)]/30 sm:flex-row sm:items-start sm:gap-6"
                >
                  <div className="shrink-0 font-mono text-[10.5px] text-[var(--color-ink-faint)] sm:w-24 sm:pt-0.5">
                    {it.date}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="rounded bg-[var(--color-warm-blue)]/10 px-1.5 py-0.5 font-mono text-[9.5px] text-[var(--color-warm-blue)]">
                        {it.label}
                      </span>
                      {countryOf(it.title) && (
                        <span className="text-[10px] text-[var(--color-ink-faint)]">
                          {countryOf(it.title)}
                        </span>
                      )}
                    </div>
                    <div className="text-[13px] leading-snug text-[var(--color-ink)] group-hover:text-[var(--color-warm-blue)]">
                      {descOf(it.title)}
                    </div>
                    {it.buyer && (
                      <div className="mt-1 truncate text-[11px] text-[var(--color-ink-soft)]">
                        {it.buyer}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 font-mono text-[10px] text-[var(--color-ink-faint)] transition-transform group-hover:translate-x-0.5 sm:pt-1">
                    TED ↗
                  </div>
                </a>
              ))}
            </div>

            {items.length === 0 && (
              <p className="py-12 text-center text-[12px] text-[var(--color-ink-faint)]">
                该品类暂无收录
              </p>
            )}
          </div>
        </section>

        {/* 说明 */}
        <section className="border-t border-[var(--color-border)] bg-[var(--color-card)]/40 py-10">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <Reveal>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-faint)]">
                    数据来源
                  </div>
                  <p className="mb-2 text-[12px] leading-relaxed text-[var(--color-ink-soft)]">
                    全部线索来自 <span className="text-[var(--color-ink)]">{DATA.source}</span>
                    ，欧盟官方公开发布，无任何非公开渠道数据。
                  </p>
                  <a
                    href={DATA.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11.5px] text-[var(--color-warm-blue)] hover:underline"
                  >
                    {DATA.sourceUrl} ↗
                  </a>
                </div>

                <div>
                  <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-faint)]">
                    覆盖范围说明
                  </div>
                  <p className="mb-2 text-[12px] leading-relaxed text-[var(--color-ink-soft)]">
                    {DATA.coverage}
                  </p>
                  <p className="text-[11px] text-[var(--color-ink-faint)]">
                    最后更新：{DATA.generatedAt}
                  </p>
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