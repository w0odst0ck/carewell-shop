"use client";

import { useEffect, useRef } from "react";
import Globe from "globe.gl";
import { regionPoints } from "@/data/insights";

type Ring = { lat: number; lng: number; maxR: number; propagationSpeed: number; repeatPeriod: number };

const ACCENT: Record<string, string> = {
  healthcare: "#3a7b9e",   // 暖海蓝
  sanitation: "#6d9fb8",   // 浅海蓝
  environment: "#daa55c",  // 沙漠金
};

/**
 * 3D 地球 —— "全球议题"最直接的一张牌
 * globe.gl 底层基于 Three.js
 */
export function GlobeViz() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const globe = new Globe(el, { animateIn: !reduce })
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-day.jpg")
      .backgroundColor("rgba(0,0,0,0)")
      .showAtmosphere(true)
      .atmosphereColor("#3a7b9e")
      .atmosphereAltitude(0.12)
      .pointsData(regionPoints)
      .pointLat("lat")
      .pointLng("lng")
      .pointColor((d: object) => ACCENT[(d as { category: string }).category] ?? "#3a7b9e")
      .pointAltitude((d: object) => {
        const v = (d as { value: number }).value;
        return 0.01 + Math.min(v / 45000, 1) * 0.22;
      })
      .pointRadius(0.28)
      .pointsMerge(false)
      .pointLabel((d: object) => {
        const p = d as { name: string; value: number };
        return `<div style="font-family:ui-monospace,monospace;font-size:12px;background:#ffffff;border:1px solid #e8e2d8;padding:6px 10px;border-radius:6px;color:#3a3530;box-shadow:0 4px 20px rgba(58,53,48,0.10)">${p.name}<br/><span style="color:#7a756e">${p.value.toLocaleString()}</span></div>`;
      })
      .ringsData([])
      .ringColor(() => "#3a7b9e")
      .ringMaxRadius("maxR")
      .ringPropagationSpeed("propagationSpeed")
      .ringRepeatPeriod("repeatPeriod");

    // 慢速自转
    const controls = globe.controls();
    controls.autoRotate = !reduce;
    controls.autoRotateSpeed = 0.35;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 3.4;
    controls.maxPolarAngle = Math.PI / 1.6;

    // 初始视角对准中东—亚洲
    globe.pointOfView({ lat: 22, lng: 48, altitude: 2.4 }, reduce ? 0 : 1200);

    // 脉冲环：在几个高值点位循环
    const top = [...regionPoints].sort((a, b) => b.value - a.value).slice(0, 6);
    let idx = 0;
    const timer = window.setInterval(() => {
      const p = top[idx % top.length];
      idx += 1;
      const ring: Ring = { lat: p.lat, lng: p.lng, maxR: 4, propagationSpeed: 1.6, repeatPeriod: 900 };
      globe.ringsData([ring]);
    }, 2400);

    // 用 ResizeObserver 跟随父容器（grid 列宽会变，window.resize 不够）
    const applySize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) globe.width(w).height(h);
    };
    applySize();

    const ro = new ResizeObserver(() => applySize());
    ro.observe(el);

    return () => {
      window.clearInterval(timer);
      ro.disconnect();
      globe._destructor?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      aria-label="全球数据分布三维可视化"
      role="img"
    />
  );
}
