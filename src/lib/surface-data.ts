"use client";

import { useMemo } from "react";

/**
 * 3D 曲面数据预处理
 *
 * 目的：把真实价格序列转成「时间 × 品种」的网格，供 3D 曲面使用
 * 原则：3D 只表达形状与趋势，不承担读数（读数交给 2D 图表）
 */

export type SurfacePoint = {
  month: string; // YYYY-MM
  label: string; // 品种短名
  /** 指数化值（2019-01 = 100） */
  index: number;
};

export type SurfaceGrid = {
  months: string[];
  series: { key: string; name: string; color: string; values: (number | null)[] }[];
  min: number;
  max: number;
};

type RawSeries = { name: string; freq: string; data: [string, number][] };

const SERIES_DEFS = [
  { key: "DCOILBRENTEU", name: "布伦特原油", color: "#daa55c" },
  { key: "WPU061", name: "化工原料", color: "#3a7b9e" },
  { key: "WPU0662", name: "树脂", color: "#6d9fb8" },
  { key: "PCU325211325211", name: "塑料制品", color: "#8fb8cc" },
];

/** 按月份聚合：日频取月内均值，月频直接取当月 */
function toMonthly(data: [string, number][]): Map<string, number> {
  const buckets = new Map<string, number[]>();
  for (const [date, v] of data) {
    const m = date.slice(0, 7);
    if (!buckets.has(m)) buckets.set(m, []);
    buckets.get(m)!.push(v);
  }
  const out = new Map<string, number>();
  for (const [m, arr] of buckets) {
    out.set(m, arr.reduce((a, b) => a + b, 0) / arr.length);
  }
  return out;
}

export function buildSurface(raw: Record<string, RawSeries>): SurfaceGrid {
  // 1. 全部序列转月频
  const monthly = new Map<string, Map<string, number>>();
  for (const def of SERIES_DEFS) {
    const s = raw[def.key];
    if (!s?.data?.length) continue;
    monthly.set(def.key, toMonthly(s.data));
  }

  // 2. 取所有月份的并集并排序（限制在 2019-01 之后）
  const monthSet = new Set<string>();
  for (const m of monthly.values()) {
    for (const k of m.keys()) {
      if (k >= "2019-01") monthSet.add(k);
    }
  }
  const months = [...monthSet].sort();

  // 3. 指数化：每个品种以自身最早可用月 = 100
  const series = SERIES_DEFS.map((def) => {
    const m = monthly.get(def.key);
    if (!m) return null;

    const avail = months.map((mo) => m.get(mo)).filter((v): v is number => v != null);
    if (!avail.length) return null;
    const base = avail[0];

    return {
      key: def.key,
      name: def.name,
      color: def.color,
      values: months.map((mo) => {
        const v = m.get(mo);
        return v == null ? null : +((v / base) * 100).toFixed(2);
      }),
    };
  }).filter(Boolean) as SurfaceGrid["series"];

  // 4. 值域（用于着色与高度归一化）
  const all = series.flatMap((s) => s.values).filter((v): v is number => v != null);
  const min = Math.floor(Math.min(...all));
  const max = Math.ceil(Math.max(...all));

  return { months, series, min, max };
}

/** Hook 版本 */
export function useSurfaceData(raw: Record<string, RawSeries>): SurfaceGrid {
  return useMemo(() => buildSurface(raw), [raw]);
}