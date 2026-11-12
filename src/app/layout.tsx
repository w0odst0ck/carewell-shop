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
  title: "MoJin Insights — 全球卫生 · 医疗 · 环境 议题研究",
  description:
    "用公开数据追踪全球卫生、医疗与环境议题：贸易流向、政策演进、可持续发展指标。数据可溯源，方法可复现。",
  keywords: [
    "global health",
    "sanitation",
    "medical supplies",
    "environment",
    "SDG",
    "trade data",
  ],
  openGraph: {
    title: "MoJin Insights",
    description: "全球卫生 · 医疗 · 环境 议题研究平台",
    type: "website",
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
