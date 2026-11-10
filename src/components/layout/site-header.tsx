"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard/", label: "看板" },
  { href: "/insights/", label: "洞察" },
  { href: "/reports/", label: "报告" },
  { href: "/about/", label: "关于" },
  { href: "/contact/", label: "联系" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-[var(--color-border)] bg-[var(--color-cream)]/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-10">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[var(--color-warm-blue)]/12 ring-1 ring-[var(--color-warm-blue)]/30">
            <span className="h-2 w-2 rounded-full bg-[var(--color-warm-blue)]" />
          </span>
          <span className="text-[15px] font-medium tracking-tight text-[var(--color-ink)]">
            MoJin <span className="text-[var(--color-ink-soft)]">Insights</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-ink)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/contact/"
          className="rounded-full bg-[var(--color-sand-orange)] px-4 py-1.5 text-[13px] font-medium text-white shadow-[var(--shadow-btn)] transition-[background-color,transform] hover:bg-[var(--color-light-orange)] active:scale-[0.98]"
        >
          联系我们
        </Link>
      </div>
    </header>
  );
}
