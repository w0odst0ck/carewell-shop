"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { Reveal } from "@/components/motion/reveal";

/** 折线：趋势（带关键事件标注） */
function TrendChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el, undefined, { renderer: "svg" });
    const years = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"];
    const healthcare = [820, 890, 1040, 1180, 1320, 1890, 2140, 2080, 2210, 2380];
    const environment = [540, 570, 610, 660, 700, 640, 760, 820, 870, 940];

    chart.setOption({
      backgroundColor: "transparent",
      grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#ffffff",
        borderColor: "#e8e2d8",
        textStyle: { color: "#3a3530", fontSize: 12 },
      },
      legend: {
        right: 0,
        top: 0,
        icon: "roundRect",
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { color: "#7a756e", fontSize: 11 },
      },
      xAxis: {
        type: "category",
        data: years,
        boundaryGap: false,
        axisLine: { lineStyle: { color: "#e8e2d8" } },
        axisTick: { show: false },
        axisLabel: { color: "#a8a29a", fontSize: 11 },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: "#f0ece5" } },
        axisLabel: { color: "#a8a29a", fontSize: 11 },
      },
      animationDuration: 1400,
      animationEasing: "cubicOut",
      animationDelay: (idx: number) => idx * 90,
      series: [
        {
          name: "医疗物资",
          type: "line",
          data: healthcare,
          smooth: true,
          symbol: "circle",
          symbolSize: 5,
          showSymbol: false,
          lineStyle: { width: 2, color: "#3a7b9e" },
          itemStyle: { color: "#3a7b9e" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(58,123,158,0.28)" },
              { offset: 1, color: "rgba(58,123,158,0)" },
            ]),
          },
          markPoint: {
            symbol: "circle",
            symbolSize: 8,
            itemStyle: { color: "#3a7b9e", borderColor: "#fcf8f4", borderWidth: 2 },
            label: {
              show: true,
              formatter: "疫情",
              position: "top",
              color: "#7a756e",
              fontSize: 10,
            },
            data: [{ coord: ["2020", 1890] }],
          },
        },
        {
          name: "环境负荷",
          type: "line",
          data: environment,
          smooth: true,
          symbol: "circle",
          symbolSize: 5,
          showSymbol: false,
          lineStyle: { width: 2, color: "#6d9fb8" },
          itemStyle: { color: "#6d9fb8" },
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
  return <div ref={ref} className="h-[280px] w-full" />;
}

/** 条形：国别排名（横向，动态） */
function RankChart() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el, undefined, { renderer: "svg" });

    const data = [
      { name: "中国", value: 41280 },
      { name: "美国", value: 28460 },
      { name: "印度", value: 18640 },
      { name: "德国", value: 15420 },
      { name: "沙特", value: 12480 },
      { name: "法国", value: 11980 },
      { name: "英国", value: 10240 },
    ].sort((a, b) => a.value - b.value);

    chart.setOption({
      backgroundColor: "transparent",
      grid: { left: 8, right: 48, top: 8, bottom: 8, containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "#ffffff",
        borderColor: "#e8e2d8",
        textStyle: { color: "#3a3530", fontSize: 12 },
      },
      xAxis: {
        type: "value",
        splitLine: { lineStyle: { color: "#f0ece5" } },
        axisLabel: { color: "#a8a29a", fontSize: 11 },
      },
      yAxis: {
        type: "category",
        data: data.map((d) => d.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#7a756e", fontSize: 12 },
      },
      animationDuration: 1200,
      animationEasing: "cubicOut",
      series: [
        {
          type: "bar",
          data: data.map((d) => d.value),
          barWidth: 10,
          itemStyle: {
            borderRadius: [0, 3, 3, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: "rgba(58,123,158,0.35)" },
              { offset: 1, color: "#3a7b9e" },
            ]),
          },
          label: {
            show: true,
            position: "right",
            color: "#7a756e",
            fontSize: 11,
            formatter: (p: { value: number }) => p.value.toLocaleString(),
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
  return <div ref={ref} className="h-[280px] w-full" />;
}

export function DataSection() {
  return (
    <section id="data" className="relative border-t border-[var(--color-border)] py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <Reveal>
          <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow mb-4">Data</p>
              <h2 className="h2 max-w-2xl">指标不是装饰，是判断的依据</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[var(--color-ink-soft)]">
              每个数字都可追溯到原始来源。图表展示的是结构性变化，而非单点波动。
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-7">
              <div className="mb-6 flex items-baseline justify-between">
                <div>
                  <h3 className="text-base font-medium text-[var(--color-ink)]">
                    医疗物资与环境负荷的十年演进
                  </h3>
                  <p className="mt-1 text-xs text-[var(--color-ink-soft)]">
                    2015–2024 · 指数化处理 · 单位：万吨
                  </p>
                </div>
                <span className="rounded border border-[var(--color-border)] px-2 py-1 text-[10px] text-[var(--color-ink-faint)]">
                  UN Comtrade
                </span>
              </div>
              <TrendChart />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="h-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-7">
              <div className="mb-6">
                <h3 className="text-base font-medium text-[var(--color-ink)]">主要经济体规模</h3>
                <p className="mt-1 text-xs text-[var(--color-ink-soft)]">2024 · 万美元</p>
              </div>
              <RankChart />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
