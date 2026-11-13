"use client";

import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import trade from "@/data/generated/valuechain-trade.json";

type Rec = { name: string; series: Record<string, { value: number; netWgt: number; unitPrice: number | null }> };
const DATA = trade as unknown as {
  years: number[];
  hs4: Record<string, Rec>;
  hs6: Record<string, Rec>;
};

const COLORS = ["#3a7b9e", "#daa55c", "#6d9fb8", "#4a9d7f"];

/** 到岸规模趋势：沙特分品类进口额 */
export function TradeTrend() {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const [metric, setMetric] = useState<"value" | "unitPrice">("value");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = chartRef.current ?? echarts.init(el, undefined, { renderer: "svg" });
    chartRef.current = chart;

    const years = DATA.years;
    const series = Object.entries(DATA.hs4).map(([, rec], i) => ({
      name: rec.name,
      type: "line" as const,
      smooth: true,
      symbol: "circle",
      symbolSize: 5,
      lineStyle: { width: 2, color: COLORS[i % 4] },
      itemStyle: { color: COLORS[i % 4] },
      data: years.map((y) => {
        const r = rec.series[String(y)];
        if (!r) return null;
        return metric === "value" ? +(r.value / 1e6).toFixed(1) : r.unitPrice;
      }),
    }));

    chart.setOption(
      {
        backgroundColor: "transparent",
        grid: { left: 4, right: 8, top: 26, bottom: 4, containLabel: true },
        tooltip: {
          trigger: "axis",
          backgroundColor: "#fff",
          borderColor: "#e8e2d8",
          textStyle: { color: "#3a3530", fontSize: 11 },
          valueFormatter: (v: number) => (v == null ? "—" : metric === "value" ? `$${v}M` : `$${v}/kg`),
        },
        legend: {
          top: 0,
          right: 0,
          icon: "roundRect",
          itemWidth: 8,
          itemHeight: 8,
          textStyle: { color: "#7a756e", fontSize: 9 },
        },
        xAxis: {
          type: "category",
          data: years,
          boundaryGap: false,
          axisLine: { lineStyle: { color: "#e8e2d8" } },
          axisTick: { show: false },
          axisLabel: { color: "#a8a29a", fontSize: 9 },
        },
        yAxis: {
          type: "value",
          name: metric === "value" ? "百万美元" : "USD/kg",
          nameTextStyle: { color: "#a8a29a", fontSize: 9 },
          splitLine: { lineStyle: { color: "#f0ece5" } },
          axisLabel: { color: "#a8a29a", fontSize: 9 },
        },
        animationDuration: 900,
        connectedNulls: false,
        series,
      },
      true
    );

    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [metric]);

  useEffect(() => {
    return () => {
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex gap-1.5">
        {([
          ["value", "进口额"],
          ["unitPrice", "单价"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setMetric(k)}
            className={`rounded px-2 py-0.5 text-[10px] transition-colors ${
              metric === k
                ? "bg-[var(--color-warm-blue)] text-white"
                : "text-[var(--color-ink-soft)] hover:bg-[var(--color-warm-gray)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div ref={ref} className="min-h-0 flex-1" />
    </div>
  );
}