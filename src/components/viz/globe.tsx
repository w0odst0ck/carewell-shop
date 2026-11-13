"use client";

import { useEffect, useRef } from "react";
import Globe from "globe.gl";
import dashboard from "@/data/generated/dashboard.json";

type RankingRow = { name: string; iso: string; value: number; partners: number };
const DATA = dashboard as unknown as { ranking: RankingRow[]; period: number };

/** ISO → 经纬度（真实国家坐标） */
const COORDS: Record<string, [number, number]> = {
  JPN: [36.2, 138.3],
  DEU: [51.2, 10.4],
  GBR: [54.0, -2.9],
  KOR: [36.5, 127.9],
  CHN: [35.9, 104.2],
  ARE: [23.4, 53.8],
  MYS: [4.2, 101.9],
  SAU: [23.9, 45.1],
  USA: [39.8, -98.6],
  IND: [22.0, 79.0],
};

type Pt = { lat: number; lng: number; name: string; iso: string; value: number; partners: number };

/**
 * 3D 地球 — 沙特医疗防护进口来源国分布
 * 真实数据：UN Comtrade 2023，8 个经济体
 * 点位高度 = 进口规模，脉冲环标注主要来源国
 */
export function GlobeViz() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const pts: Pt[] = DATA.ranking
      .map((r) => {
        const c = COORDS[r.iso];
        if (!c) return null;
        return {
          lat: c[0],
          lng: c[1],
          name: r.name,
          iso: r.iso,
          value: r.value,
          partners: r.partners,
        };
      })
      .filter(Boolean) as Pt[];

    const max = Math.max(...pts.map((p) => p.value), 1);

    const globe = new Globe(el, { animateIn: !reduce })
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-day.jpg")
      .backgroundColor("rgba(0,0,0,0)")
      .showAtmosphere(true)
      .atmosphereColor("#3a7b9e")
      .atmosphereAltitude(0.12)
      .pointsData(pts)
      .pointLat("lat")
      .pointLng("lng")
      // 沙特用沙漠橙突出，其余用海蓝
      .pointColor((d: object) => ((d as Pt).iso === "SAU" ? "#e8874e" : "#3a7b9e"))
      .pointAltitude((d: object) => 0.01 + ((d as Pt).value / max) * 0.24)
      .pointRadius((d: object) => ((d as Pt).iso === "SAU" ? 0.42 : 0.3))
      .pointsMerge(false)
      .pointLabel((d: object) => {
        const p = d as Pt;
        const usd = (p.value / 1e9).toFixed(3);
        return `<div style="font-family:ui-monospace,monospace;font-size:12px;background:#ffffff;border:1px solid #e8e2d8;padding:6px 10px;border-radius:6px;color:#3a3530;box-shadow:0 4px 20px rgba(58,53,48,0.10)">${p.name}<br/><span style="color:#7a756e">$${usd}B · ${p.partners} 个贸易伙伴</span></div>`;
      })
      .ringsData([])
      .ringColor(() => "#e8874e")
      .ringMaxRadius("maxR")
      .ringPropagationSpeed("propagationSpeed")
      .ringRepeatPeriod("repeatPeriod");

    const controls = globe.controls();
    controls.autoRotate = !reduce;
    controls.autoRotateSpeed = 0.4;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 3.4;
    controls.maxPolarAngle = Math.PI / 1.6;

    // 视角对准中东
    globe.pointOfView({ lat: 24, lng: 50, altitude: 2.3 }, reduce ? 0 : 1200);

    // 脉冲环：沙特 + 主要来源国轮播
    const order = ["SAU", "JPN", "DEU", "CHN", "ARE"];
    const top = order.map((iso) => pts.find((p) => p.iso === iso)).filter(Boolean) as Pt[];
    let idx = 0;
    const timer = window.setInterval(() => {
      if (!top.length) return;
      const p = top[idx % top.length];
      idx += 1;
      globe.ringsData([
        { lat: p.lat, lng: p.lng, maxR: 4, propagationSpeed: 1.5, repeatPeriod: 900 },
      ]);
    }, 2200);

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
      aria-label="沙特医疗防护进口来源国分布三维可视化"
      role="img"
    />
  );
}