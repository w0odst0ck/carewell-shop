"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as echarts from "echarts";
import { Reveal } from "@/components/motion/reveal";
import { tradeTrend, materialSeries } from "@/data/home";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const COLORS = ["#3a7b9e", "#daa55c", "#6d9fb8", "#4a9d7f"];

/** 沙特四大类进口趋势（真实 Comtrade 数据） */
function TradeChart() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el, undefined, { renderer: "svg" });

    chart.setOption({
      backgroundColor: "transparent",
      grid: { left: 8, right: 16, top: 30, bottom: 8, containLabel: true },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#ffffff",
        borderColor: "#e8e2d8",
        textStyle: { color: "#3a3530", fontSize: 12 },
        valueFormatter: (v: number) => (v == null ? "—" : `$${v}M`),
      },
      legend: {
        right: 0,
        top: 0,
        icon: "roundRect",
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { color: "#7a756e", fontSize: 10 },
      },
      xAxis: {
        type: "category",
        data: tradeTrend.years,
        boundaryGap: false,
        axisLine: { lineStyle: { color: "#e8e2d8" } },
        axisTick: { show: false },
        axisLabel: { color: "#a8a29a", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        name: "百万美元",
        nameTextStyle: { color: "#a8a29a", fontSize: 9 },
        splitLine: { lineStyle: { color: "#f0ece5" } },
        axisLabel: { color: "#a8a29a", fontSize: 10 },
      },
      animationDuration: 1600,
      animationEasing: "cubicOut",
      series: tradeTrend.categories.map((c, i) => ({
        name: c.name.split("（")[0],
        type: "line",
        data: c.values,
        smooth: true,
        symbol: "circle",
        symbolSize: 4,
        showSymbol: false,
        lineStyle: { width: 2, color: COLORS[i % 4] },
        itemStyle: { color: COLORS[i % 4] },
        emphasis: { focus: "series" },
      })),
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

/** 原料传导（原油 vs 树脂 PPI，指数化真实数据） */
function MaterialChart() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = echarts.init(el, undefined, { renderer: "svg" });

    chart.setOption({
      backgroundColor: "transparent",
      grid: { left: 8, right: 16, top: 30, bottom: 8, containLabel: true },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#ffffff",
        borderColor: "#e8e2d8",
        textStyle: { color: "#3a3530", fontSize: 12 },
        valueFormatter: (v: number) => `${v.toFixed(1)}`,
      },
      legend: {
        right: 0,
        top: 0,
        icon: "roundRect",
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { color: "#7a756e", fontSize: 10 },
      },
      xAxis: {
        type: "time",
        axisLine: { lineStyle: { color: "#e8e2d8" } },
        axisTick: { show: false },
        axisLabel: { color: "#a8a29a", fontSize: 10 },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        name: "指数（2019=100）",
        nameTextStyle: { color: "#a8a29a", fontSize: 9 },
        splitLine: { lineStyle: { color: "#f0ece5" } },
        axisLabel: { color: "#a8a29a", fontSize: 10 },
      },
      animationDuration: 1800,
      animationEasing: "cubicOut",
      series: materialSeries.map((s) => ({
        name: s.name,
        type: "line",
        data: s.data,
        smooth: true,
        symbol: "none",
        lineStyle: { width: 1.8, color: s.color },
        itemStyle: { color: s.color },
        emphasis: { focus: "series" },
      })),
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

export function DataSection() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".data-head",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 78%" },
        }
      );
      gsap.fromTo(
        ".data-panel",
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.16,
          ease: "power3.out",
          scrollTrigger: { trigger: ".data-grid", start: "top 82%" },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative border-t border-[var(--color-border)] py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="data-head mb-16 opacity-0">
          <p className="eyebrow mb-4">Live Data</p>
          <h2 className="h2 mb-6 max-w-3xl">数字不是装饰，是判断的依据</h2>
          <p className="body-lg max-w-2xl">
            下面两张图来自实时采集：左边是原料价格如何传导，右边是沙特市场的品类结构变迁。
          </p>
        </div>

        <div className="data-grid grid gap-6 lg:grid-cols-2">
          {/* 原料传导 */}
          <div className="data-panel rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 opacity-0">
            <div className="mb-4 flex items-baseline justify-between">
              <h3 className="text-base font-medium text-[var(--color-ink)]">原料价格传导</h3>
              <span className="font-mono text-[10px] text-[var(--color-ink-faint)]">
                FRED · 2019 至今
              </span>
            </div>
            <div className="h-[320px] w-full">
              <MaterialChart />
            </div>
            <p className="mt-4 text-[11.5px] leading-relaxed text-[var(--color-ink-soft)]">
              原油与树脂 PPI 的走势差异，反映的是传导滞后与加工环节的缓冲能力。
            </p>
          </div>

          {/* 沙特进口 */}
          <div className="data-panel rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 opacity-0">
            <div className="mb-4 flex items-baseline justify-between">
              <h3 className="text-base font-medium text-[var(--color-ink)]">沙特进口品类结构</h3>
              <span className="font-mono text-[10px] text-[var(--color-ink-faint)]">
                UN Comtrade · 2019–2024
              </span>
            </div>
            <div className="h-[320px] w-full">
              <TradeChart />
            </div>
            <p className="mt-4 text-[11.5px] leading-relaxed text-[var(--color-ink-soft)]">
              服装类从 2019 年的 $424M 降至 2024 年的 $89M，医用敷料逆势增至 $193M。
            </p>
          </div>
        </div>

        <Reveal>
          <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-3">
            {[
              {
                k: "-79%",
                label: "服装类进口（2019→2024）",
                desc: "疫情透支后的需求已回落到常态以下",
              },
              {
                k: "+45%",
                label: "医用敷料 / 急救包",
                desc: "四大类中唯一持续增长的品类",
              },
              {
                k: "4×",
                label: "口罩单价波动幅度",
                desc: "$21.26/kg（2020）→ $5.41/kg（2024）",
              },
            ].map((s) => (
              <div key={s.label} className="bg-[var(--color-card)] p-6">
                <div className="mb-1.5 font-mono text-2xl font-light text-[var(--color-ink)]">
                  {s.k}
                </div>
                <div className="mb-1 text-[12px] font-medium text-[var(--color-ink)]">
                  {s.label}
                </div>
                <div className="text-[11px] leading-relaxed text-[var(--color-ink-soft)]">
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}