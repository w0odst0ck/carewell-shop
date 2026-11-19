"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import unitPriceData from "@/data/generated/unitprice.json";

type Row = {
  cat: string;
  catName: string;
  country: string;
  iso: string;
  unitPrice: number;
};

const data = unitPriceData as { period: number; rows: Row[] };

const CAT_COLORS: Record<string, string> = {
  "621010": "#3a7b9e",
  "630790": "#6d9fb8",
  "401519": "#daa55c",
};

const CAT_SHORT: Record<string, string> = {
  "621010": "隔离衣",
  "630790": "口罩",
  "401519": "手套",
};

export function UnitPriceChart() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el, undefined, { renderer: "svg" });

    // 按国家聚合：每个国家一个点，三个品类作系列
    const countries = [...new Set(data.rows.map((r) => r.country))];
    const cats = [...new Set(data.rows.map((r) => r.cat))];

    const series = cats.map((cat) => ({
      name: CAT_SHORT[cat] ?? cat,
      type: "scatter" as const,
      symbolSize: 9,
      itemStyle: {
        color: CAT_COLORS[cat] ?? "#3a7b9e",
        borderColor: "#fff",
        borderWidth: 1.5,
      },
      data: countries.map((c) => {
        const row = data.rows.find((r) => r.country === c && r.cat === cat);
        return row ? [c, row.unitPrice] : null;
      }).filter(Boolean),
      label: {
        show: true,
        position: "top" as const,
        fontSize: 9,
        color: "#7a756e",
        formatter: (p: { value: [string, number] }) => `$${p.value[1]}`,
      },
    }));

    chart.setOption({
      backgroundColor: "transparent",
      grid: { left: 4, right: 10, top: 28, bottom: 4, containLabel: true },
      tooltip: {
        trigger: "item",
        backgroundColor: "#fff",
        borderColor: "#e8e2d8",
        textStyle: { color: "#3a3530", fontSize: 11 },
        formatter: (p: { seriesName: string; value: [string, number] }) =>
          `<b>${p.value[0]}</b><br/>${p.seriesName}: <b>$${p.value[1]}/kg</b>`,
      },
      legend: {
        top: 0,
        right: 0,
        icon: "circle",
        itemWidth: 7,
        itemHeight: 7,
        textStyle: { color: "#7a756e", fontSize: 10 },
      },
      xAxis: {
        type: "category",
        data: countries,
        axisLine: { lineStyle: { color: "#e8e2d8" } },
        axisTick: { show: false },
        axisLabel: { color: "#3a3530", fontSize: 10, interval: 0, rotate: 0 },
      },
      yAxis: {
        type: "value",
        name: "USD/kg",
        nameTextStyle: { color: "#a8a29a", fontSize: 9 },
        splitLine: { lineStyle: { color: "#f0ece5" } },
        axisLabel: { color: "#a8a29a", fontSize: 9, formatter: "${value}" },
      },
      animationDuration: 900,
      animationEasing: "cubicOut",
      series,
    });

    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(el);
    return () => {
      ro.disconnect();
      chart.dispose();
    };
  }, []);

  return <div ref={ref} className="h-full w-full" />;
}
