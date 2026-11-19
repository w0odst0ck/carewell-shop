"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import freight from "@/data/generated/valuechain-freight.json";

const R = freight.routes as Record<
  string,
  { en: string; value: number; prev: number | null; changePct: number | null }
>;

/** 物流成本波动：SCFI 各航线当前值与周环比 */
export function FreightChart() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el, undefined, { renderer: "svg" });

    const rows = Object.entries(R)
      .filter(([k]) => k !== "综合指数")
      .sort((a, b) => b[1].value - a[1].value);

    const names = rows.map(([k]) => k.replace("ft", " ft"));
    const values = rows.map(([, v]) => v.value);
    const changes = rows.map(([, v]) => v.changePct ?? 0);

    chart.setOption({
      backgroundColor: "transparent",
      grid: { left: 4, right: 56, top: 10, bottom: 4, containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "#fff",
        borderColor: "#e8e2d8",
        textStyle: { color: "#3a3530", fontSize: 11 },
        formatter: (p: { dataIndex: number }[]) => {
          const i = p[0].dataIndex;
          const chg = changes[i];
          const color = chg >= 0 ? "#d97757" : "#4a9d7f";
          return `<b>${names[i]}</b><br/>指数 ${values[i].toFixed(0)}<br/>周环比 <b style="color:${color}">${chg >= 0 ? "+" : ""}${chg.toFixed(1)}%</b>`;
        },
      },
      xAxis: {
        type: "value",
        splitLine: { lineStyle: { color: "#f0ece5" } },
        axisLabel: { color: "#a8a29a", fontSize: 9 },
      },
      yAxis: {
        type: "category",
        data: names,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#3a3530", fontSize: 11 },
      },
      animationDuration: 900,
      series: [
        {
          type: "bar",
          data: values.map((v, i) => ({
            value: v,
            itemStyle: {
              borderRadius: [0, 3, 3, 0],
              color:
                changes[i] >= 0
                  ? new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                      { offset: 0, color: "rgba(217,119,87,0.30)" },
                      { offset: 1, color: "#d97757" },
                    ])
                  : new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                      { offset: 0, color: "rgba(74,157,127,0.30)" },
                      { offset: 1, color: "#4a9d7f" },
                    ]),
            },
          })),
          barWidth: 12,
          label: {
            show: true,
            position: "right",
            fontSize: 10,
            formatter: (p: { dataIndex: number }) => {
              const c = changes[p.dataIndex];
              return `${c >= 0 ? "+" : ""}${c.toFixed(1)}%`;
            },
            color: "#7a756e",
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
  }, []);

  return <div ref={ref} className="h-full w-full" />;
}