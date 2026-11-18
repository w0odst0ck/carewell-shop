"use client";

import { createContext, useContext, useMemo, useState } from "react";

/**
 * 看板全局交互状态
 *
 * 核心交互（2026-11-18 用户确认）：
 *   1. 时间范围切换 → 所有时序图联动
 *   2. 3D 曲面拖拽
 *   3. 时间切片联动（拖动 → 3D 高亮 + 图表高亮 + KPI 变）
 *   4. 品类筛选
 */

export type TimeRange = "all" | "3y" | "1y";

export const RANGE_LABEL: Record<TimeRange, string> = {
  all: "全部",
  "3y": "近 3 年",
  "1y": "近 1 年",
};

/** 时间范围起点（月份字符串，用于过滤序列） */
export const RANGE_START: Record<TimeRange, string> = {
  all: "2019-01",
  "3y": "2023-11",
  "1y": "2025-11",
};

export type CatKey = "all" | "6210" | "6307" | "4015" | "3006";

export const CAT_LABEL: Record<CatKey, string> = {
  all: "全部品类",
  "6210": "服装类",
  "6307": "纺织制成品",
  "4015": "橡胶手套",
  "3006": "医用敷料",
};

export const CAT_COLOR: Record<CatKey, string> = {
  all: "#3a7b9e",
  "6210": "#d97757",
  "6307": "#daa55c",
  "4015": "#3a7b9e",
  "3006": "#4a9d7f",
};

type Ctx = {
  range: TimeRange;
  setRange: (r: TimeRange) => void;
  cat: CatKey;
  setCat: (c: CatKey) => void;
  /** 时间切片：月份（YYYY-MM），null = 未选 */
  slice: string | null;
  setSlice: (s: string | null) => void;
};

const DashboardCtx = createContext<Ctx | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [range, setRange] = useState<TimeRange>("all");
  const [cat, setCat] = useState<CatKey>("all");
  const [slice, setSlice] = useState<string | null>(null);

  const value = useMemo(
    () => ({ range, setRange, cat, setCat, slice, setSlice }),
    [range, cat, slice]
  );

  return <DashboardCtx.Provider value={value}>{children}</DashboardCtx.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardCtx);
  if (!ctx) throw new Error("useDashboard 必须在 DashboardProvider 内使用");
  return ctx;
}