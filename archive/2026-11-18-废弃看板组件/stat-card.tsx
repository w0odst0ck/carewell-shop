"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { NumberTicker } from "@/components/motion/number-ticker";

export type StatDelta = {
  /** 变化幅度（百分比或绝对值） */
  value: number;
  unit?: "pct" | "abs";
  /** 对比周期说明，如「较 30 天前」 */
  label: string;
};

/**
 * 指标卡 — 带涨跌指示与入场动效
 * 涨跌颜色：上行暖橙（成本上升=不利），下行青绿（成本下降=有利）
 */
export function StatCard({
  label,
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  hint,
  delta,
  series,
}: {
  label: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  hint?: string;
  delta?: StatDelta;
  /** 迷你走势（真实序列，取尾部若干点） */
  series?: number[];
}) {
  const up = (delta?.value ?? 0) > 0;
  const flat = Math.abs(delta?.value ?? 0) < 0.05;
  const deltaColor = flat
    ? "text-[var(--color-ink-faint)]"
    : up
      ? "text-[var(--color-sand-orange)]"
      : "text-[#4a9d7f]";

  return (
    <div className="stat-card group relative bg-[var(--color-card)] px-4 py-4 transition-colors hover:bg-[var(--color-warm-gray)]/30 opacity-0">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[10px] uppercase tracking-wider text-[var(--color-ink-faint)]">
          {label}
        </div>
        {series && series.length > 1 && <Sparkline data={series} up={up} flat={flat} />}
      </div>

      <div className="mt-1.5 font-mono text-xl font-light text-[var(--color-ink)]">
        {prefix}
        <NumberTicker value={value} decimals={decimals} duration={1500} />
        {suffix}
      </div>

      <div className="mt-0.5 flex items-center gap-1.5">
        {delta && (
          <span className={`font-mono text-[9.5px] ${deltaColor}`}>
            {flat ? "—" : up ? "▲" : "▼"}{" "}
            {Math.abs(delta.value).toFixed(1)}
            {delta.unit === "pct" ? "%" : ""}
          </span>
        )}
        <span className="font-mono text-[9px] text-[var(--color-ink-faint)]">
          {delta?.label ?? hint}
        </span>
      </div>
    </div>
  );
}

/** 迷你走势线（纯 SVG，无库依赖） */
function Sparkline({ data, up, flat }: { data: number[]; up: boolean; flat: boolean }) {
  const w = 40;
  const h = 16;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / span) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const color = flat ? "#a8a29a" : up ? "var(--color-sand-orange)" : "#4a9d7f";

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0 opacity-60">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 指标带容器 — 统一入场动画 */
export function StatBand({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = el.querySelectorAll(".stat-card");

    if (reduce) {
      gsap.set(cards, { opacity: 1, y: 0 });
      return;
    }

    const tw = gsap.fromTo(
      cards,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.06, ease: "power2.out", delay: 0.15 }
    );
    return () => {
      tw.kill();
    };
  }, []);

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 gap-px border-b border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-3 lg:grid-cols-6"
    >
      {children}
    </div>
  );
}

/** 面板 — 入场 + hover 边框 */
export function Panel({
  no,
  title,
  hint,
  children,
  className = "",
}: {
  no: string;
  title: string;
  hint: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`panel-card group relative min-h-[360px] bg-[var(--color-card)] p-5 opacity-0 transition-colors duration-300 hover:bg-[var(--color-card)] ${className}`}
    >
      {/* hover 时左上角高光 */}
      <div className="pointer-events-none absolute left-0 top-0 h-px w-0 bg-gradient-to-r from-[var(--color-warm-blue)] to-transparent transition-[width] duration-500 group-hover:w-full" />

      <div className="mb-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] text-[var(--color-warm-blue)]">{no}</span>
          <h2 className="text-[13px] font-semibold text-[var(--color-ink)]">{title}</h2>
        </div>
        <span className="text-[10px] text-[var(--color-ink-faint)]">{hint}</span>
      </div>
      <div className="h-[290px] w-full">{children}</div>
    </div>
  );
}

/** 判断条目 */
export function Insight({
  tag,
  color,
  text,
}: {
  tag: string;
  color: string;
  text: string;
}) {
  return (
    <div className="flex gap-2.5">
      <span
        className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <div>
        <span className="font-medium" style={{ color }}>
          {tag}
        </span>
        <span className="mx-1.5 text-[var(--color-ink-faint)]">·</span>
        <span className="text-[var(--color-ink-soft)]">{text}</span>
      </div>
    </div>
  );
}