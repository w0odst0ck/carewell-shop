"use client";

import { NumberTicker } from "@/components/motion/number-ticker";

type Stat = {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  hint: string;
};

export function StatBand({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 divide-x divide-[var(--color-border)] border-y border-[var(--color-border)] sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`px-4 py-5 ${
            i >= 2 ? "border-t border-[var(--color-border)] lg:border-t-0" : ""
          } ${i % 2 === 1 ? "" : ""}`}
        >
          <div className="font-mono text-2xl font-semibold tracking-tight text-[var(--color-ink)] lg:text-[26px]">
            <NumberTicker
              value={s.value}
              decimals={s.decimals ?? 0}
              prefix={s.prefix}
              suffix={s.suffix}
              duration={1600}
            />
          </div>
          <div className="mt-1.5 text-[11px] font-medium text-[var(--color-ink)]">{s.label}</div>
          <div className="mt-0.5 text-[10px] leading-tight text-[var(--color-ink-faint)]">{s.hint}</div>
        </div>
      ))}
    </div>
  );
}
