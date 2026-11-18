"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSurfaceData, type SurfaceGrid } from "@/lib/surface-data";
import { useDashboard, RANGE_START } from "@/lib/dashboard-store";

/**
 * 价格波动地形曲面（可交互版）
 *
 * 原则（用户 2026-11-16）：3D 负责视觉丰富度，2D 负责准确表达数据
 *   → 曲面只表达形状，切片高亮表达时点，精确读数交给侧栏 2D 图
 *
 * 文字标签用 CanvasTexture 贴图，不用 drei 的 <Html>（避免 DOM 与 canvas 的卸载冲突）
 */

const GRID_X = 72;
const GRID_Y = 44;
const W = 12;
const D = 5;
const H_MAX = 2.6;

type Props = {
  data: Record<string, { name: string; freq: string; data: [string, number][] }>;
};

/* ── 文字贴图（无 DOM 依赖） ─────────────────────────── */
function makeTextTexture(text: string, color: string, scale = 1) {
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 2;
  const fontPx = 26 * scale;
  const pad = 8;

  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = `500 ${fontPx}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  const w = Math.ceil(measure.measureText(text).width) + pad * 2;
  const h = Math.ceil(fontPx * 1.5);

  const canvas = document.createElement("canvas");
  canvas.width = w * dpr;
  canvas.height = h * dpr;

  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  ctx.font = `500 ${fontPx}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, h / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;

  return { tex, aspect: w / h };
}

function TextLabel({
  text,
  color,
  position,
  scale = 0.055,
}: {
  text: string;
  color: string;
  position: [number, number, number];
  scale?: number;
}) {
  const { tex, aspect } = useMemo(() => makeTextTexture(text, color), [text, color]);

  useEffect(() => {
    return () => {
      tex.dispose();
    };
  }, [tex]);

  return (
    <sprite position={position} scale={[aspect * scale * 4, scale * 4, 1]}>
      <spriteMaterial map={tex} transparent depthWrite={false} opacity={0.9} />
    </sprite>
  );
}

/* ── 曲面几何 ───────────────────────────────────────── */
function useGeometry(grid: SurfaceGrid) {
  return useMemo(() => {
    const nX = GRID_X + 1;
    const nY = GRID_Y + 1;
    const positions = new Float32Array(nX * nY * 3);
    const colors = new Float32Array(nX * nY * 3);
    const indices: number[] = [];

    const range = grid.max - grid.min || 1;
    const rows = grid.series.map((s) => s.values);
    const rowCount = rows.length;

    const sampleRow = (row: (number | null)[], t: number): number => {
      if (!row.length) return grid.min;
      const pos = t * (row.length - 1);
      const i0 = Math.floor(pos);
      const i1 = Math.min(i0 + 1, row.length - 1);
      const f = pos - i0;
      const a = row[i0] ?? grid.min;
      const b = row[i1] ?? grid.min;
      return a + (b - a) * f;
    };

    const stops = [
      { v: 0.0, c: new THREE.Color("#eae5dc") },
      { v: 0.28, c: new THREE.Color("#a8ccdc") },
      { v: 0.52, c: new THREE.Color("#3a7b9e") },
      { v: 0.76, c: new THREE.Color("#daa55c") },
      { v: 1.0, c: new THREE.Color("#d97757") },
    ];

    const colorAt = (t: number) => {
      const v = Math.max(0, Math.min(1, t));
      for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i];
        const b = stops[i + 1];
        if (v >= a.v && v <= b.v) {
          const f = (v - a.v) / (b.v - a.v || 1);
          return a.c.clone().lerp(b.c, f);
        }
      }
      return stops[stops.length - 1].c.clone();
    };

    for (let yi = 0; yi < nY; yi++) {
      const ty = yi / GRID_Y;
      const posY = ty * (rowCount - 1);
      const r0 = Math.floor(posY);
      const r1 = Math.min(r0 + 1, rowCount - 1);
      const fy = posY - r0;

      for (let xi = 0; xi < nX; xi++) {
        const tx = xi / GRID_X;
        const v0 = sampleRow(rows[r0] ?? [], tx);
        const v1 = sampleRow(rows[r1] ?? [], tx);
        const val = v0 + (v1 - v0) * fy;
        const norm = (val - grid.min) / range;
        const idx = yi * nX + xi;

        positions[idx * 3] = (tx - 0.5) * W;
        positions[idx * 3 + 1] = norm * H_MAX;
        positions[idx * 3 + 2] = (ty - 0.5) * D;

        const c = colorAt(norm);
        colors[idx * 3] = c.r;
        colors[idx * 3 + 1] = c.g;
        colors[idx * 3 + 2] = c.b;
      }
    }

    for (let yi = 0; yi < GRID_Y; yi++) {
      for (let xi = 0; xi < GRID_X; xi++) {
        const a = yi * nX + xi;
        const b = a + 1;
        const c = a + nX;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [grid]);
}

function Surface({ grid }: { grid: SurfaceGrid }) {
  const geo = useGeometry(grid);

  useEffect(() => {
    return () => {
      geo.dispose();
    };
  }, [geo]);

  return (
    <mesh geometry={geo}>
      <meshStandardMaterial
        vertexColors
        side={THREE.DoubleSide}
        roughness={0.5}
        metalness={0.18}
      />
    </mesh>
  );
}

/** 时间切片：竖直半透明面 */
function SlicePlane({ x }: { x: number }) {
  const height = H_MAX * 1.06;
  return (
    <group position={[x, height / 2, 0]}>
      <mesh>
        <boxGeometry args={[0.018, height, D * 1.03]} />
        <meshBasicMaterial color="#e8874e" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, height / 2 + 0.02, D / 2 + 0.2]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshBasicMaterial color="#e8874e" />
      </mesh>
    </group>
  );
}

function AxisLabels({ grid }: { grid: SurfaceGrid }) {
  const years = useMemo(() => {
    const seen = new Set<string>();
    const out: { label: string; t: number }[] = [];
    grid.months.forEach((m, i) => {
      const y = m.slice(0, 4);
      if (!seen.has(y)) {
        seen.add(y);
        out.push({ label: y, t: i / (grid.months.length - 1) });
      }
    });
    return out;
  }, [grid.months]);

  return (
    <group position={[0, -0.16, D / 2 + 0.42]}>
      {years.map((y) => (
        <TextLabel
          key={y.label}
          text={y.label}
          color="#a8a29a"
          position={[(y.t - 0.5) * W, 0, 0]}
          scale={0.042}
        />
      ))}
    </group>
  );
}

function SeriesLabels({ grid }: { grid: SurfaceGrid }) {
  return (
    <group position={[-W / 2 - 0.55, 0.06, 0]}>
      {grid.series.map((s, i) => {
        const t = grid.series.length > 1 ? i / (grid.series.length - 1) : 0.5;
        return (
          <TextLabel
            key={s.key}
            text={s.name}
            color={s.color}
            position={[0, 0, (t - 0.5) * D]}
            scale={0.045}
          />
        );
      })}
    </group>
  );
}

/** 自动旋转 + 拖拽 */
function Scene({
  grid,
  paused,
  sliceIndex,
}: {
  grid: SurfaceGrid;
  paused: boolean;
  sliceIndex: number | null;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const dragging = useRef(false);

  useEffect(() => {
    const el = gl.domElement;
    let lastX = 0;
    let lastY = 0;

    const down = (e: PointerEvent) => {
      dragging.current = true;
      lastX = e.clientX;
      lastY = e.clientY;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    const move = (e: PointerEvent) => {
      if (!dragging.current || !groupRef.current) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      groupRef.current.rotation.y += dx * 0.006;
      const rx = groupRef.current.rotation.x + dy * 0.003;
      groupRef.current.rotation.x = Math.max(-0.45, Math.min(0.45, rx));
    };

    const up = (e: PointerEvent) => {
      dragging.current = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointerleave", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointerleave", up);
    };
  }, [gl]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (!paused && !dragging.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  const sliceX =
    sliceIndex != null && grid.months.length > 1
      ? (sliceIndex / (grid.months.length - 1) - 0.5) * W
      : null;

  return (
    <group ref={groupRef}>
      <Surface grid={grid} />
      <AxisLabels grid={grid} />
      <SeriesLabels grid={grid} />
      {sliceX != null && <SlicePlane x={sliceX} />}
    </group>
  );
}

export function PriceSurface({ data }: Props) {
  const { range, slice, setSlice } = useDashboard();
  const [paused, setPaused] = useState(false);

  const grid = useSurfaceData(data);

  const visible = useMemo(() => {
    const start = RANGE_START[range];
    const idx = grid.months.findIndex((m) => m >= start);
    const cut = idx > 0 ? idx : 0;
    const months = grid.months.slice(cut);
    const series = grid.series.map((s) => ({ ...s, values: s.values.slice(cut) }));
    const all = series.flatMap((s) => s.values).filter((v): v is number => v != null);
    return {
      months,
      series,
      min: Math.floor(Math.min(...all)),
      max: Math.ceil(Math.max(...all)),
    } as SurfaceGrid;
  }, [grid, range]);

  const sliceIndex = useMemo(() => {
    if (!slice) return null;
    const i = visible.months.findIndex((m) => m >= slice);
    return i >= 0 ? i : null;
  }, [slice, visible.months]);

  const sliceInfo = useMemo(() => {
    if (sliceIndex == null) return null;
    return visible.series.map((s) => ({
      name: s.name,
      color: s.color,
      value: s.values[sliceIndex],
    }));
  }, [sliceIndex, visible.series]);

  const peak = useMemo(() => {
    return visible.series
      .map((s) => {
        const valid = s.values.filter((v): v is number => v != null);
        return { name: s.name, max: Math.max(...valid) };
      })
      .sort((a, b) => b.max - a.max)[0];
  }, [visible.series]);

  return (
    <div className="relative h-full w-full">
      <div
        className="h-full w-full cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <Canvas
          camera={{ position: [0, 5.4, 9.8], fov: 42 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.78} />
          <directionalLight position={[6, 11, 6]} intensity={1.2} />
          <directionalLight position={[-9, 5, -6]} intensity={0.42} color="#8fb8cc" />
          <Scene grid={visible} paused={paused} sliceIndex={sliceIndex} />
        </Canvas>
      </div>

      <div className="pointer-events-none absolute left-3 top-2 font-mono text-[9px] text-[var(--color-ink-faint)] opacity-70">
        2019 = 100 · 月度均值 · 拖拽旋转
      </div>
      {peak && (
        <div className="pointer-events-none absolute right-3 top-2 font-mono text-[9px] text-[var(--color-ink-faint)] opacity-70">
          波动最大 {peak.name} 峰值 {peak.max.toFixed(0)}
        </div>
      )}

      {sliceInfo && (
        <div className="pointer-events-none absolute left-3 top-7 space-y-0.5">
          <div className="font-mono text-[10px] font-medium" style={{ color: "#e8874e" }}>
            {slice}
          </div>
          {sliceInfo.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5 font-mono text-[9px]">
              <span
                className="inline-block h-1 w-1 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-[var(--color-ink-soft)]">{s.name}</span>
              <span className="text-[var(--color-ink)]">
                {s.value == null ? "—" : s.value.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="absolute inset-x-4 bottom-2.5">
        <input
          type="range"
          min={0}
          max={Math.max(visible.months.length - 1, 0)}
          value={sliceIndex ?? 0}
          onChange={(e) => setSlice(visible.months[Number(e.target.value)])}
          onMouseDown={() => setPaused(true)}
          onMouseUp={() => setPaused(false)}
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-border)] accent-[#e8874e]"
          aria-label="时间切片"
        />
        <div className="mt-1 flex justify-between font-mono text-[8px] text-[var(--color-ink-faint)]">
          <span>{visible.months[0]}</span>
          <span>{visible.months[visible.months.length - 1]}</span>
        </div>
      </div>
    </div>
  );
}