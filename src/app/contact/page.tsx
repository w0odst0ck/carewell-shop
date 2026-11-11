"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/sections/footer";
import { Reveal } from "@/components/motion/reveal";
import { site } from "@/data/site";
import { productCatalog } from "@/data/products";
import productImages from "@/data/generated/product-images.json";

const IMAGES = productImages.byCategory as Record<string, string[]>;

const TOPICS = [
  "产品与定制咨询（OEM / ODM）",
  "样品与规格确认",
  "数据与研究合作",
  "报告与分析方法咨询",
  "其他",
];

export default function ContactPage() {
  const waHref = `https://wa.me/${site.waNumber}`;
  const [active, setActive] = useState<string | null>(null);

  const category = productCatalog.categories.find((c) => c.id === active);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* ============ 一、产品能力 ============ */}
        <section className="relative overflow-hidden pt-32 pb-16">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" />

          <div className="relative mx-auto max-w-[1200px] px-6 lg:px-10">
            <Reveal>
              <p className="eyebrow mb-5">Capability</p>
              <h1 className="display mb-6 max-w-2xl">我们能生产什么</h1>
              <p className="body-lg mb-4 max-w-xl">
                12 大类，{productCatalog.totalItems} 个细分品类。克重、层数、尺寸、包装均可按需定制，
                支持贴牌生产。
              </p>
              <p className="mb-12 max-w-xl text-sm text-[var(--color-ink-soft)]">
                {productCatalog.note}
              </p>
            </Reveal>

            {/* 品类网格 */}
            <Reveal delay={0.05}>
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-3 lg:grid-cols-4">
                {productCatalog.categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActive(active === c.id ? null : c.id)}
                    className={`group bg-[var(--color-card)] p-5 text-left transition-colors ${
                      active === c.id
                        ? "bg-[var(--color-warm-blue)]/5"
                        : "hover:bg-[var(--color-warm-gray)]/40"
                    }`}
                  >
                    {/* 产品图：有图显示，无图占位 */}
                    <div className="mb-3 aspect-square w-full overflow-hidden rounded-lg bg-white">
                      {IMAGES[c.id]?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={IMAGES[c.id][0]}
                          alt={c.nameZh}
                          loading="lazy"
                          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center border border-dashed border-[var(--color-border)]">
                          <span className="font-[family-name:var(--font-mono)] text-[2rem] font-light text-[var(--color-border)]">
                            {c.id}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mb-2 flex items-baseline justify-between">
                      <span className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--color-warm-blue)]">
                        {c.id}
                      </span>
                      <span className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--color-ink-faint)]">
                        {c.count}
                      </span>
                    </div>
                    <div className="mb-1 text-[13px] font-medium leading-snug text-[var(--color-ink)]">
                      {c.nameZh}
                    </div>
                    <div className="text-[10px] leading-snug text-[var(--color-ink-faint)]">
                      {c.nameEn}
                    </div>
                  </button>
                ))}
              </div>
            </Reveal>

            {/* 展开的品类明细 */}
            {category && (
              <div className="mt-8 rounded-xl border border-[var(--color-warm-blue)]/25 bg-[var(--color-card)] p-6">
                <div className="mb-1 flex items-baseline justify-between">
                  <h2 className="text-base font-semibold text-[var(--color-ink)]">
                    {category.nameZh}
                  </h2>
                  <button
                    onClick={() => setActive(null)}
                    className="text-[11px] text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-ink)]"
                  >
                    收起 ✕
                  </button>
                </div>
                <p className="mb-5 text-xs text-[var(--color-ink-soft)]">{category.note}</p>
                <div className="flex flex-wrap gap-2">
                  {category.items.map((it) => (
                    <span
                      key={it.en}
                      className="rounded-md border border-[var(--color-border)] bg-[var(--color-cream)] px-2.5 py-1.5 text-[11px] text-[var(--color-ink-soft)]"
                      title={it.en}
                    >
                      {it.zh}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!category && (
              <p className="mt-6 text-center text-[11px] text-[var(--color-ink-faint)]">
                点击任一大类查看细分品类
              </p>
            )}
          </div>
        </section>

        {/* ============ 二、询盘 ============ */}
        <section className="relative border-t border-[var(--color-border)] py-20">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
            <div className="grid gap-16 lg:grid-cols-[0.95fr_1.05fr]">
              {/* 左：文案 + 联系方式 */}
              <Reveal>
                <p className="eyebrow mb-5">Inquiry</p>
                <h2 className="display mb-7" style={{ fontSize: "clamp(1.9rem, 3vw, 2.6rem)" }}>
                  说说你的规格
                </h2>
                <p className="body-lg mb-4 max-w-lg">
                  告诉我们品类、克重、数量与目标市场，我们会给出可执行的方案。
                </p>
                <p className="mb-10 max-w-lg text-sm text-[var(--color-ink-soft)]">
                  所有询盘由我们的团队直接回复，不是自动应答。
                </p>

                <div className="space-y-4">
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 transition-[border-color,box-shadow] hover:border-[var(--color-wa-green)]/40 hover:shadow-[var(--shadow-card)]"
                  >
                    <div>
                      <div className="text-sm font-medium text-[var(--color-ink)]">WhatsApp</div>
                      <div className="mt-0.5 font-[family-name:var(--font-mono)] text-xs text-[var(--color-ink-soft)]">
                        {site.waDisplay}
                      </div>
                    </div>
                    <span className="text-[var(--color-ink-faint)] transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </a>

                  <a
                    href={`mailto:${site.email}`}
                    className="group flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 transition-[border-color,box-shadow] hover:border-[var(--color-warm-blue)]/40 hover:shadow-[var(--shadow-card)]"
                  >
                    <div>
                      <div className="text-sm font-medium text-[var(--color-ink)]">Email</div>
                      <div className="mt-0.5 font-[family-name:var(--font-mono)] text-xs text-[var(--color-ink-soft)]">
                        {site.email}
                      </div>
                    </div>
                    <span className="text-[var(--color-ink-faint)] transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </a>
                </div>

                {/* 建议填写的字段 */}
                <div className="mt-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/60 p-5">
                  <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-[var(--color-ink-faint)]">
                    提供这些信息会加快报价
                  </div>
                  <ul className="space-y-1.5 text-[12px] text-[var(--color-ink-soft)]">
                    {[
                      "品类 + 规格（克重 / 层数 / 尺寸）",
                      "数量与目标市场",
                      "是否需要贴牌、灭菌、独立包装",
                      "期望交期",
                    ].map((t) => (
                      <li key={t} className="flex gap-2">
                        <span className="text-[var(--color-sand-orange)]">·</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              {/* 右：表单 */}
              <Reveal delay={0.1}>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-[var(--shadow-card)]">
                  <h2 className="mb-1 text-lg font-semibold text-[var(--color-ink)]">发送询盘</h2>
                  <p className="mb-7 text-xs text-[var(--color-ink-soft)]">
                    填写后通过 WhatsApp 发送，团队直接接收并回复
                  </p>

                  <form
                    className="space-y-5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget as HTMLFormElement);
                      const text = [
                        `姓名：${fd.get("name") || ""}`,
                        `公司：${fd.get("company") || ""}`,
                        `邮箱：${fd.get("email") || ""}`,
                        `主题：${fd.get("topic") || ""}`,
                        ``,
                        `${fd.get("message") || ""}`,
                      ].join("\n");
                      window.open(`${waHref}?text=${encodeURIComponent(text)}`, "_blank");
                    }}
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="姓名" name="name" required />
                      <Field label="公司" name="company" />
                    </div>
                    <Field label="邮箱" name="email" type="email" required />

                    <div>
                      <label
                        htmlFor="topic"
                        className="mb-2 block text-xs font-medium text-[var(--color-ink-soft)]"
                      >
                        询盘类型
                      </label>
                      <select
                        id="topic"
                        name="topic"
                        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-warm-blue)]"
                      >
                        {TOPICS.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="mb-2 block text-xs font-medium text-[var(--color-ink-soft)]"
                      >
                        需求描述
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        required
                        placeholder="例如：50g SMS 隔离衣 5 万件，出口沙特，需要贴牌和独立包装，希望 30 天内交货。"
                        className="w-full resize-y rounded-lg border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-warm-blue)]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-lg bg-[var(--color-sand-orange)] px-6 py-3 text-sm font-medium text-white shadow-[var(--shadow-btn)] transition-[background-color,transform] hover:bg-[var(--color-light-orange)] active:scale-[0.99]"
                    >
                      通过 WhatsApp 发送
                    </button>
                    <p className="text-center text-[11px] text-[var(--color-ink-faint)]">
                      点击后将跳转 WhatsApp，内容已自动填入 · 也可直接发邮件
                    </p>
                  </form>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-xs font-medium text-[var(--color-ink-soft)]">
        {label}
        {required && <span className="ml-0.5 text-[var(--color-sand-orange)]">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-cream)] px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-warm-blue)]"
      />
    </div>
  );
}