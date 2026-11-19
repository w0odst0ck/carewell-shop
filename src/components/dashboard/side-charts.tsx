"use client";

import { useEffect, useRef, useMemo } from "react";
import * as echarts from "echarts";
import tradeJson from "@/data/generated/valuechain-trade.json";
import { useDashboard, CAT_COLOR, type CatKey } from "@/lib/dashboard-store";

type Rec = { name: string; series: Record<string, { value: number; netWgt: number; unitPrice: number | null }> };
const T = tradeJson as unknown as { years: number[]; hs4: Record<string, Rec> };

const HS_KEYS = ["6210", "6307", "4015", "3006"] as const;
const COLORS = ["#e8703f", "#d99a1f", "#2f8fc4", "#3aa876"];

/** 沙特进口结构：堆叠面积图（联动品类筛选 + 时间切片） */
export function ImportStructure() {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const { cat, slice, setSlice } = useDashboard();

  const seriesData = useMemo(() => {
    const keys = HS_KEYS.filter((k) => cat === "all" || k === cat);
    return keys.map((k) => {
      const rec = T.hs4[k];
      return {
        key: k,
        name: rec?.name.split("（")[0] ?? k,
        color: COLORS[HS_KEYS.indexOf(k)],
        values: T.years.map((y) => {
          const v = rec?.series[String(y)]?.value ?? 0;
          return +(v / 1e6).toFixed(1);
        }),
      };
    });
  }, [cat]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = chartRef.current ?? echarts.init(el, undefined, { renderer: "svg" });
    chartRef.current = chart;

    const sliceYear = slice ? slice.slice(0, 4) : null;
    const markerIdx = sliceYear ? T.years.indexOf(Number(sliceYear)) : -1;

    chart.setOption(
      {
        backgroundColor: "transparent",
        grid: { left: 2, right: 8, top: 22, bottom: 2, containLabel: true },
        tooltip: {
          trigger: "axis",
          backgroundColor: "#fff",
          borderColor: "#e8e2d8",
          textStyle: { color: "#3a3530", fontSize: 11 },
          valueFormatter: (v: number) => `$${v}M`,
        },
        legend: {
          top: 0,
          right: 0,
          icon: "roundRect",
          itemWidth: 7,
          itemHeight: 7,
          itemGap: 10,
          textStyle: { color: "#7a756e", fontSize: 10 },
        },
        xAxis: {
          type: "category",
          data: T.years,
          boundaryGap: false,
          axisLine: { lineStyle: { color: "#e8e2d8" } },
          axisTick: { show: false },
          axisLabel: { color: "#a8a29a", fontSize: 10 },
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { color: "#f0ece5" } },
          axisLabel: { color: "#a8a29a", fontSize: 10, formatter: "${value}M" },
        },
        animationDuration: 700,
        series: seriesData.map((s) => ({
          name: s.name,
          type: "line",
          stack: "total",
          data: s.values,
          smooth: true,
          symbol: "circle",
          symbolSize: 4,
          showSymbol: false,
          lineStyle: { width: 1.2, color: s.color },
          itemStyle: { color: s.color },
          areaStyle: { color: s.color, opacity: 0.42 },
          markLine:
            markerIdx >= 0
              ? {
                  silent: true,
                  symbol: "none",
                  data: [{ xAxis: markerIdx }],
                  lineStyle: { color: "#e8703f", width: 1.2, type: "solid", opacity: 0.85 },
                  label: { show: false },
                }
              : undefined,
        })),
      },
      true
    );

    // 点击年份 → 联动切片
    chart.off("click");
    chart.on("click", (p) => {
      const v = (p as { value?: unknown }).value;
      const y = typeof v === "string" || typeof v === "number" ? String(v) : "";
      if (/^\d{4}$/.test(y)) setSlice(`${y}-06`);
    });

    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [seriesData, slice, setSlice]);

  useEffect(() => {
    return () => {
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  return <div ref={ref} className="h-full w-full" />;
}

/** 运价指数：横向条形 + 周环比 */
export function FreightBars({ routes }: { routes: Record<string, { value: number; changePct: number | null }> }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el, undefined, { renderer: "svg" });

    const rows = Object.entries(routes)
      .filter(([k]) => k !== "综合指数")
      .sort((a, b) => b[1].value - a[1].value);

    const names = rows.map(([k]) => k.replace("ft", " ft"));
    const values = rows.map(([, v]) => v.value);
    const changes = rows.map(([, v]) => v.changePct ?? 0);

    chart.setOption({
      backgroundColor: "transparent",
      grid: { left: 2, right: 52, top: 4, bottom: 2, containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "#fff",
        borderColor: "#e8e2d8",
        textStyle: { color: "#3a3530", fontSize: 11 },
        formatter: (p: { dataIndex: number }[]) => {
          const i = p[0].dataIndex;
          const c = changes[i];
          return `<b>${names[i]}</b><br/>指数 ${values[i].toFixed(0)}<br/>周环比 <b style="color:${c >= 0 ? "#e8703f" : "#3aa876"}">${c >= 0 ? "+" : ""}${c.toFixed(1)}%</b>`;
        },
      },
      xAxis: {
        type: "value",
        splitLine: { lineStyle: { color: "#f0ece5" } },
        axisLabel: { color: "#a8a29a", fontSize: 10 },
      },
      yAxis: {
        type: "category",
        data: names,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#3a3530", fontSize: 10 },
      },
      animationDuration: 700,
      series: [
        {
          type: "bar",
          barWidth: 10,
          data: values.map((v, i) => ({
            value: v,
            itemStyle: {
              borderRadius: [0, 3, 3, 0],
              color: changes[i] >= 0 ? "#e8703f" : "#3aa876",
              opacity: 0.85,
            },
          })),
          label: {
            show: true,
            position: "right",
            fontSize: 10,
            color: "#7a756e",
            formatter: (p: { dataIndex: number }) => {
              const c = changes[p.dataIndex];
              return `${c >= 0 ? "+" : ""}${c.toFixed(1)}%`;
            },
          },
        },
      ],
    });

    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(el);
    return () => {
      ro.disconnect();
      chart.dispose();
    };
  }, [routes]);

  return <div ref={ref} className="h-full w-full" />;
}

/** 单价 vs 进口量：气泡散点（x=量, y=单价, 气泡大小=金额） */
export function PriceVolumeBubble() {
  const ref = useRef<HTMLDivElement>(null);
  const { cat, slice } = useDashboard();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el, undefined, { renderer: "svg" });

    const sliceYear = slice ? Number(slice.slice(0, 4)) : 2024;
    const year = T.years.includes(sliceYear) ? sliceYear : 2024;

    const keys = HS_KEYS.filter((k) => cat === "all" || k === cat);
    const points = keys.map((k, i) => {
      const rec = T.hs4[k];
      const r = rec?.series[String(year)];
      const value = r?.value ?? 0;
      const wgt = r?.netWgt ?? 0;
      const price = wgt ? value / wgt : 0;
      return {
        name: rec?.name.split("（")[0] ?? k,
        value: [+(wgt / 1e6).toFixed(2), +price.toFixed(2), +(value / 1e6).toFixed(0)],
        color: COLORS[HS_KEYS.indexOf(k)] ?? COLORS[i],
      };
    });

    const maxVal = Math.max(...points.map((p) => p.value[2]), 1);

    chart.setOption({
      backgroundColor: "transparent",
      grid: { left: 2, right: 12, top: 16, bottom: 2, containLabel: true },
      tooltip: {
        trigger: "item",
        backgroundColor: "#fff",
        borderColor: "#e8e2d8",
        textStyle: { color: "#3a3530", fontSize: 11 },
        formatter: (p: { data: { name: string; value: number[] } }) =>
          `<b>${p.data.name}</b><br/>进口量 ${p.data.value[0]} 千吨<br/>单价 $${p.data.value[1]}/kg<br/>总额 $${p.data.value[2]}M`,
      },
      xAxis: {
        type: "value",
        name: "进口量（千吨）",
        nameTextStyle: { color: "#a8a29a", fontSize: 10, padding: [8, 0, 0, 0] },
        splitLine: { lineStyle: { color: "#f0ece5" } },
        axisLabel: { color: "#a8a29a", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        name: "单价 $/kg",
        nameTextStyle: { color: "#a8a29a", fontSize: 10 },
        splitLine: { lineStyle: { color: "#f0ece5" } },
        axisLabel: { color: "#a8a29a", fontSize: 10 },
      },
      animationDuration: 700,
      series: [
        {
          type: "scatter",
          data: points.map((p) => ({
            name: p.name,
            value: p.value,
            itemStyle: { color: p.color, opacity: 0.78 },
          })),
          symbolSize: (val: number[]) => 12 + (val[2] / maxVal) * 26,
          label: {
            show: true,
            position: "top",
            fontSize: 10,
            color: "#7a756e",
            formatter: (p: { data: { name: string } }) => p.data.name,
          },
          emphasis: { scale: 1.15 },
        },
      ],
    });

    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(el);
    return () => {
      ro.disconnect();
      chart.dispose();
    };
  }, [cat, slice]);

  return (
    <div className="relative h-full w-full">
      <div ref={ref} className="h-full w-full" />
      <div className="pointer-events-none absolute right-1 top-0 font-mono text-[9px] text-[var(--color-ink-faint)] opacity-70">
        {slice ? slice.slice(0, 4) : 2024}
      </div>
    </div>
  );
}