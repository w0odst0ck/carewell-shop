import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { SupportWidget } from "@/components/support/support-widget";
import { site } from "@/data/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-jet",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MoJin Insights — 一次性防护用品的价格 · 货源与市场",
  description:
    "从原油与树脂的原料价格，到出口运价与到岸成本，再到各国公共采购公告。所有数字来自公开权威源，可溯源、可复现。",
  keywords: [
    "disposable medical supplies",
    "protective equipment",
    "medical consumables",
    "price monitor",
    "procurement leads",
    "Saudi Arabia market",
    "nonwoven",
  ],
  openGraph: {
    title: "MoJin Insights",
    description: "一次性防护用品的价格、货源与市场",
    type: "website",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#fcf8f4",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-cream)] text-[var(--color-ink)]">
        <SmoothScroll>{children}</SmoothScroll>
        {/* 客服浮标：人工优先 + AI 辅助，全站常驻 */}
        <SupportWidget
          waNumber={site.waNumber}
          waDisplay={site.waDisplay}
          email={site.email}
        />
      </body>
    </html>
  );
}
