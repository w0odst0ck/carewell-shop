"use client";

import { Reveal } from "@/components/motion/reveal";

const STEPS = [
  {
    n: "01",
    title: "公开数据源",
    desc: "联合国 Comtrade、WHO、世界银行、UN SDGs 等 29 个公开权威源，全部可溯源。",
  },
  {
    n: "02",
    title: "标准化处理",
    desc: "国家代码、品类编码、口径单位统一对齐；缺失与异常留痕，不静默修补。",
  },
  {
    n: "03",
    title: "指标计算",
    desc: "规模、结构、趋势、强度四类指标；RCA 等竞争力指标按 ITC 标准方法计算。",
  },
  {
    n: "04",
    title: "公开方法",
    desc: "每份分析附数据来源、口径说明与计算方法，读者可自行复现。",
  },
];

export function Method() {
  return (
    <section id="method" className="relative border-t border-[var(--color-border)] py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="eyebrow mb-4">Methodology</p>
            <h2 className="h2 mb-6">可复现，才值得引用</h2>
            <p className="body-lg mb-8">
              我们不以「独家数据」作为卖点，而是以<span className="text-[var(--color-ink)]">方法透明</span>建立可信度。
              任何人都可以用同样的公开数据，走同样的流程，得到同样的结论。
            </p>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
              <p className="text-xs leading-relaxed text-[var(--color-ink-soft)]">
                <span className="text-[var(--color-ink)]">引用说明：</span>
                转载或引用本平台图表与分析时，请注明来源与数据期。方法论部分不受版权限制。
              </p>
            </div>
          </Reveal>

          <div className="grid gap-px overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <div className="h-full bg-[var(--color-card)] p-7 transition-colors duration-300 hover:bg-[var(--color-warm-gray)]">
                  <div className="mb-4 font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-warm-blue)]">
                    {s.n}
                  </div>
                  <h3 className="mb-2 text-base font-medium text-[var(--color-ink)]">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--color-ink-soft)]">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
