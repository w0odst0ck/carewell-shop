"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "span";
};

/**
 * 滚动渐显 —— "高级感"的第二大功臣
 * 元素进入视野时淡入 + 上移，ease-out，无弹跳
 */
export function Reveal({ children, className, delay = 0, y = 24, as = "div" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    const anim = gsap.fromTo(
      el,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
        },
      }
    );

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, [delay, y]);

  const Tag = as as "div";
  return (
    <Tag ref={ref} className={cn("reveal", className)}>
      {children}
    </Tag>
  );
}
