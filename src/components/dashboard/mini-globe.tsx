"use client";

import { useEffect, useRef } from "react";
import Globe from "globe.gl";

const COORDS: Record<string, [number, number]> = {
  SAU: [23.9, 45.1], ARE: [23.4, 53.8], GBR: [55.4, -3.4], USA: [37.1, -95.7],
  CHN: [35.9, 104.2], DEU: [51.2, 10.4], IND: [20.6, 78.9], JPN: [35.7, 139.7],
  KOR: [35.9, 127.8], MYS: [4.2, 101.9],
};

export function MiniGlobe({ posting }: { posting: { iso: string; value: number; name: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const pts = posting
      .map((p) => {
        const c = COORDS[p.iso];
        return c ? { lat: c[0], lng: c[1], value: p.value, name: p.name } : null;
      })
      .filter(Boolean) as { lat: number; lng: number; value: number; name: string }[];

    const max = Math.max(...pts.map((p) => p.value), 1);

    const globe = new Globe(el, { animateIn: !reduce })
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-day.jpg")
      .backgroundColor("rgba(0,0,0,0)")
      .showAtmosphere(true)
      .atmosphereColor("#3a7b9e")
      .atmosphereAltitude(0.1)
      .pointsData(pts)
      .pointLat("lat")
      .pointLng("lng")
      .pointColor(() => "#e8874e")
      .pointAltitude((d: object) => 0.01 + ((d as { value: number }).value / max) * 0.18)
      .pointRadius(0.32)
      .pointLabel(
        (d: object) =>
          `<div style="font-size:11px;background:#fff;border:1px solid #e8e2d8;padding:4px 8px;border-radius:4px;color:#3a3530">${
            (d as { name: string }).name
          }</div>`
      );

    const ctl = globe.controls();
    ctl.autoRotate = !reduce;
    ctl.autoRotateSpeed = 0.5;
    ctl.enableZoom = false;
    ctl.enablePan = false;

    globe.pointOfView({ lat: 25, lng: 60, altitude: 2.2 }, reduce ? 0 : 900);

    const applySize = () => {
      if (el.clientWidth > 0 && el.clientHeight > 0) {
        globe.width(el.clientWidth).height(el.clientHeight);
      }
    };
    applySize();
    const ro = new ResizeObserver(applySize);
    ro.observe(el);

    return () => {
      ro.disconnect();
      globe._destructor?.();
    };
  }, [posting]);

  return <div ref={ref} className="h-full w-full" />;
}
