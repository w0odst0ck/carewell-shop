"use client";

import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import type { DashboardData } from "@/data/types";

const CAT_COLORS = ["#3a7b9e", "#6d9fb8", "#daa55c"];

export function RankingChart({ data }: { data: DashboardData }) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const [mode, setMode] = useState<"total" | string>("total");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el, undefined, { renderer: "svg" });
    chartRef.current = chart;

    const rows = [...data.ranking].reverse();
    const values =
      mode === "total"
        ? rows.map((r) => r.value)
        : rows.map((r) => r.bycat[mode] ?? 0);

    chart.setOption(
      {
        backgroundColor: "transparent",
        grid: { left: 4, right: 62, top: 8, bottom: 4, containLabel: true },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          backgroundColor: "#fff",
          borderColor: "#e8e2d8",
          textStyle: { color: "#3a3530", fontSize: 12 },
          formatter: (p: { name: string; value: number }[]) => {
            const v = p[0];
            return `<b>${v.name}</b><br/>${(v.value / 1e6).toFixed(1)}M USD`;
          },
        },
        xAxis: {
          type: "value",
          splitLine: { lineStyle: { color: "#f0ece5" } },
          axisLabel: {
            color: "#a8a29a",
            fontSize: 10,
            formatter: (v: number) => (v >= 1e9 ? `${v / 1e9}B` : `${v / 1e6}M`),
          },
        },
        yAxis: {
          type: "category",
          data: rows.map((r) => r.name),
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: "#3a3530", fontSize: 12 },
        },
        animationDuration: 900,
        animationEasing: "cubicOut",
        series: [
          {
            type: "bar",
            data: values,
            barWidth: 9,
            itemStyle: {
              borderRadius: [0, 3, 3, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: "rgba(58,123,158,0.30)" },
                { offset: 1, color: "#3a7b9e" },
              ]),
            },
            label: {
              show: true,
              position: "right",
              color: "#7a756e",
              fontSize: 10,
              formatter: (p: { value: number }) =>
                p.value >= 1e9 ? `${(p.value / 1e9).toFixed(2)}B` : `${(p.value / 1e6).toFixed(0)}M`,
            },
          },
        ],
      },
      true
    );

    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(el);
    return () => {
      ro.disconnect();
      chart.dispose();
    };
  }, [data, mode]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setMode("total")}
          className={`rounded px-2 py-0.5 text-[10px] transition-colors ${
            mode === "total"
              ? "bg-[var(--color-warm-blue)] text-white"
              : "text-[var(--color-ink-soft)] hover:bg-[var(--color-warm-gray)]"
          }`}
        >
          合计
        </button>
        {data.categories.map((c, i) => (
          <button
            key={c.code}
            onClick={() => setMode(c.code)}
            className={`rounded px-2 py-0.5 text-[10px] transition-colors ${
              mode === c.code
                ? "text-white"
                : "text-[var(--color-ink-soft)] hover:bg-[var(--color-warm-gray)]"
            }`}
            style={mode === c.code ? { backgroundColor: CAT_COLORS[i % 3] } : undefined}
          >
            {c.name.split(" · ").pop()}
          </button>
        ))}
      </div>
      <div ref={ref} className="min-h-0 flex-1" />
    </div>
  );
}
