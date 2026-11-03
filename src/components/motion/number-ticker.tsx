"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  startOnView?: boolean;
};

/**
 * 数字滚动 —— 成本极低、观感提升极大
 * 1200-2000ms 慢起慢停，才有质感
 */
export function NumberTicker({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  duration = 1600,
  className,
  startOnView = true,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(value);
      return;
    }

    const run = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        // easeOutExpo
        const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        setDisplay(value * eased);
        if (p < 1) requestAnimationFrame(tick);
        else setDisplay(value);
      };
      requestAnimationFrame(tick);
    };

    if (!startOnView) {
      run();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration, startOnView]);

  const text = display.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={cn("tabular", className)}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}
