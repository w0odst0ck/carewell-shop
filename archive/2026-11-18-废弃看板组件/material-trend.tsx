"use client";

import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import prices from "@/data/generated/valuechain-prices.json";

type Series = {
  name: string;
  unit: string;
  freq: string;
  latest: [string, number];
  window: string;
  data: [string, number][];
};

const S = prices.series as unknown as Record<string, Series>;

/** 原料端波动：原油 + 树脂 PPI + 化工 PPI */
export function MaterialTrend() {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const [keys, setKeys] = useState<string[]>(["DCOILBRENTEU", "WPU0662"]);

  const OPTIONS: { key: string; label: string }[] = [
    { key: "DCOILBRENTEU", label: "布伦特原油" },
    { key: "DCOILWTICO", label: "WTI 原油" },
    { key: "WPU0662", label: "树脂 PPI" },
    { key: "WPU061", label: "化工 PPI" },
    { key: "PCU325211325211", label: "塑料制品 PPI" },
  ];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = chartRef.current ?? echarts.init(el, undefined, { renderer: "svg" });
    chartRef.current = chart;

    const COLORS: Record<string, string> = {
      DCOILBRENTEU: "#daa55c",
      DCOILWTICO: "#e8a87c",
      WPU0662: "#3a7b9e",
      WPU061: "#6d9fb8",
      PCU325211325211: "#8fb8cc",
    };

    // 各自归一化到起点=100，便于跨量纲对照
    const series = keys
      .map((k) => {
        const s = S[k];
        if (!s || !s.data.length) return null;
        const base = s.data[0][1];
        return {
          name: s.name,
          type: "line" as const,
          data: s.data.map((d) => [d[0], +((d[1] / base) * 100).toFixed(2)]),
          smooth: true,
          symbol: "none",
          lineStyle: { width: 1.8, color: COLORS[k] },
          itemStyle: { color: COLORS[k] },
          emphasis: { focus: "series" as const },
        };
      })
      .filter(Boolean);

    chart.setOption(
      {
        backgroundColor: "transparent",
        grid: { left: 4, right: 8, top: 26, bottom: 4, containLabel: true },
        tooltip: {
          trigger: "axis",
          backgroundColor: "#fff",
          borderColor: "#e8e2d8",
          textStyle: { color: "#3a3530", fontSize: 11 },
          valueFormatter: (v: number) => `${v.toFixed(1)}（起点=100）`,
        },
        legend: {
          top: 0,
          right: 0,
          icon: "roundRect",
          itemWidth: 8,
          itemHeight: 8,
          textStyle: { color: "#7a756e", fontSize: 10 },
        },
        xAxis: {
          type: "time",
          axisLine: { lineStyle: { color: "#e8e2d8" } },
          axisTick: { show: false },
          axisLabel: { color: "#a8a29a", fontSize: 9 },
          splitLine: { show: false },
        },
        yAxis: {
          type: "value",
          name: "指数化（起点=100）",
          nameTextStyle: { color: "#a8a29a", fontSize: 9 },
          splitLine: { lineStyle: { color: "#f0ece5" } },
          axisLabel: { color: "#a8a29a", fontSize: 9 },
        },
        animationDuration: 900,
        series,
      },
      true
    );

    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [keys]);

  useEffect(() => {
    return () => {
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {OPTIONS.map((o) => {
          const on = keys.includes(o.key);
          return (
            <button
              key={o.key}
              onClick={() =>
                setKeys((prev) =>
                  prev.includes(o.key)
                    ? prev.length > 1
                      ? prev.filter((k) => k !== o.key)
                      : prev
                    : [...prev, o.key]
                )
              }
              className={`rounded px-2 py-0.5 text-[10px] transition-colors ${
                on
                  ? "bg-[var(--color-warm-blue)] text-white"
                  : "text-[var(--color-ink-soft)] hover:bg-[var(--color-warm-gray)]"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <div ref={ref} className="min-h-0 flex-1" />
    </div>
  );
}