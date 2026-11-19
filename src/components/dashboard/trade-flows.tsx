"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Globe from "globe.gl";
import * as THREE from "three";
import { countryOf, SAUDI } from "@/lib/country-coords";
import { useDashboard } from "@/lib/dashboard-store";

/**
 * 贸易流向弧线球
 *
 * 为什么这个能成（对比之前三版）：
 *   价格时序是 2D 数据，硬塞进 3D 怎么都别扭；
 *   贸易流向本身就是地理 + 流动关系，弧线是它的自然表达。
 *
 * 数据：UN Comtrade 2024，沙特进口来源国（真实）
 * 视觉：globe.gl + Bloom 后处理
 */

type FlowCat = {
  name: string;
  total: number;
  partners: { code: number; iso: string | null; name: string | null; value: number; netWgt: number }[];
};

type FlowData = {
  reporter: string;
  period: number;
  source: string;
  categories: Record<string, FlowCat>;
};

type Arc = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  value: number;
  code: number;
  nameZh: string;
  name: string;
};

const CAT_COLORS: Record<string, string> = {
  "6210": "#e8703f", // 服装类：亮橙
  "6307": "#d99a1f", // 纺织：亮金
  "4015": "#2f8fc4", // 橡胶：亮蓝
  "3006": "#3aa876", // 敷料：亮绿
};

export function TradeFlows({ data }: { data: FlowData }) {
  const { cat } = useDashboard();
  const ref = useRef<HTMLDivElement>(null);
  const globeRef = useRef<InstanceType<typeof Globe> | null>(null);
  const [hovered, setHovered] = useState<Arc | null>(null);

  // 按品类筛选 + 构建弧线
  const arcs: Arc[] = useMemo(() => {
    const keys = Object.keys(data.categories).filter((k) => cat === "all" || k === cat);
    const out: Arc[] = [];

    for (const k of keys) {
      const c = data.categories[k];
      if (!c) continue;
      const color = CAT_COLORS[k] ?? "#3a7b9e";
      for (const p of c.partners) {
        const info = countryOf(p.code);
        if (!info) continue;
        if (info.lat === SAUDI.lat && info.lng === SAUDI.lng) continue;
        out.push({
          startLat: info.lat,
          startLng: info.lng,
          endLat: SAUDI.lat,
          endLng: SAUDI.lng,
          color,
          value: p.value,
          code: p.code,
          nameZh: info.nameZh,
          name: info.name,
        });
      }
    }
    // 按金额排序，保证大额弧线在上层
    return out.sort((a, b) => a.value - b.value);
  }, [data, cat]);

  const maxVal = useMemo(() => Math.max(...arcs.map((a) => a.value), 1), [arcs]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const globe = new Globe(el)
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-day.jpg")
      // 压暗贴图：保留地理细节，整体偏暗蓝，避免刺眼也避免死黑
      .globeMaterial(
        new THREE.MeshPhongMaterial({
          color: new THREE.Color("#6f8ba8"),
          emissive: new THREE.Color("#0f2231"),
          emissiveIntensity: 0.55,
          specular: new THREE.Color("#1a2b38"),
          shininess: 12,
        })
      )
      .backgroundColor("rgba(0,0,0,0)")
      .showAtmosphere(true)
      .atmosphereColor("#5aa3cc")
      .atmosphereAltitude(0.12)
      .arcsData(arcs)
      .arcStartLat("startLat")
      .arcStartLng("startLng")
      .arcEndLat("endLat")
      .arcEndLng("endLng")
      .arcColor((d: object) => [(d as Arc).color, (d as Arc).color])
      .arcAltitudeAutoScale(0.42)
      .arcStroke((d: object) => {
        const t = (d as Arc).value / maxVal;
        return 0.28 + Math.pow(t, 0.55) * 0.9;
      })
      .arcDashLength(0.42)
      .arcDashGap(0.22)
      .arcDashInitialGap(() => Math.random())
      .arcDashAnimateTime((d: object) => {
        const t = (d as Arc).value / maxVal;
        return 5200 - t * 3400; // 大额流得快
      })
      .arcsTransitionDuration(reduce ? 0 : 900)
      .onArcHover((d: object | null) => {
        setHovered(d ? (d as Arc) : null);
        if (el) el.style.cursor = d ? "pointer" : "grab";
      })
      // 沙特标记
      .pointsData([{ lat: SAUDI.lat, lng: SAUDI.lng }])
      .pointLat("lat")
      .pointLng("lng")
      .pointColor(() => "#e8874e")
      .pointAltitude(0.028)
      .pointRadius(0.42)
      .pointLabel(
        () =>
          `<div style="font-family:ui-monospace,monospace;font-size:11px;background:#fff;border:1px solid #e8e2d8;padding:5px 9px;border-radius:5px;color:#3a3530">沙特阿拉伯（目的国）</div>`
      );

    globeRef.current = globe;

    const ctl = globe.controls();
    ctl.autoRotate = false; // 用户明确要求不要自动旋转
    ctl.enableZoom = false;
    ctl.enablePan = false;
    ctl.minPolarAngle = Math.PI / 3.6;
    ctl.maxPolarAngle = Math.PI / 1.55;

    globe.pointOfView({ lat: 26, lng: 52, altitude: 2.35 }, reduce ? 0 : 1100);

    const applySize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) globe.width(w).height(h);
    };
    applySize();
    const ro = new ResizeObserver(applySize);
    ro.observe(el);

    return () => {
      ro.disconnect();
      globe._destructor?.();
      globeRef.current = null;
    };
  }, [arcs, maxVal]);

  // 统计
  const stats = useMemo(() => {
    const byCat = Object.entries(data.categories)
      .filter(([k]) => cat === "all" || k === cat)
      .map(([k, c]) => ({
        key: k,
        name: c.name,
        color: CAT_COLORS[k],
        total: c.total,
        count: c.partners.length,
      }));
    const total = byCat.reduce((n, c) => n + c.total, 0);
    return { byCat, total };
  }, [data, cat]);

  return (
    <div className="relative h-full w-full">
      <div ref={ref} className="h-full w-full cursor-grab active:cursor-grabbing" />

      {/* 左上：说明 */}
      <div className="pointer-events-none absolute left-3 top-2 space-y-0.5">
        <div className="font-mono text-[9px] text-[var(--color-ink-faint)] opacity-70">
          弧线 = 进口来源 · 粗细 = 金额 · 拖拽旋转
        </div>
        <div className="font-mono text-[9px] text-[var(--color-ink-faint)] opacity-70">
          {data.period} · {stats.byCat.reduce((n, c) => n + c.count, 0)} 个来源国
        </div>
      </div>

      {/* 右上：品类图例 */}
      <div className="absolute right-3 top-2 space-y-1">
        {stats.byCat.map((c) => (
          <div key={c.key} className="flex items-center gap-1.5">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: c.color, boxShadow: `0 0 5px ${c.color}` }}
            />
            <span className="font-mono text-[9px] text-[var(--color-ink-soft)]">{c.name}</span>
            <span className="font-mono text-[9px] text-[var(--color-ink-faint)]">
              ${(c.total / 1e6).toFixed(0)}M
            </span>
          </div>
        ))}
      </div>

      {/* 悬停提示 */}
      {hovered && (
        <div className="pointer-events-none absolute bottom-12 left-1/2 -translate-x-1/2 rounded-md bg-[var(--color-card)]/92 px-3 py-1.5 backdrop-blur-sm">
          <span className="font-mono text-[11.5px] text-[var(--color-ink)]">
            {hovered.nameZh}
          </span>
          <span className="mx-1.5 text-[var(--color-ink-faint)]">·</span>
          <span className="font-mono text-[11.5px] text-[var(--color-warm-blue)]">
            ${(hovered.value / 1e6).toFixed(1)}M
          </span>
        </div>
      )}

      {/* 底部汇总 */}
      <div className="pointer-events-none absolute inset-x-3 bottom-1.5 flex items-center justify-between font-mono text-[9px] text-[var(--color-ink-faint)]">
        <span>
          合计 ${(stats.total / 1e6).toFixed(0)}M · 沙特进口
        </span>
        <span>UN Comtrade</span>
      </div>
    </div>
  );
}