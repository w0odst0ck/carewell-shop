"use client";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/sections/footer";
import { Reveal } from "@/components/motion/reveal";
import { site } from "@/data/site";

const TOPICS = [
  "产品与定制咨询（OEM / ODM）",
  "数据与研究合作",
  "报告与分析方法咨询",
  "其他",
];

export default function ContactPage() {
  const waHref = `https://wa.me/${site.waNumber}`;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden pt-36 pb-24">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" />

          <div className="relative mx-auto max-w-[1200px] px-6 lg:px-10">
            <div className="grid gap-16 lg:grid-cols-[0.95fr_1.05fr]">
              {/* 左：文案 + 联系方式 */}
              <Reveal>
                <p className="eyebrow mb-5">Contact</p>
                <h1 className="display mb-7">聊聊你的问题</h1>
                <p className="body-lg mb-10 max-w-lg">
                  无论是产品定制、市场准入，还是想了解某个品类的数据，
                  都可以直接联系我们。我们会说明能做什么、不能做什么。
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
                    <span className="text-[var(--color-ink-faint)] transition-transform group-hover:translate-x-1">→</span>
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
                    <span className="text-[var(--color-ink-faint)] transition-transform group-hover:translate-x-1">→</span>
                  </a>
                </div>
              </Reveal>

              {/* 右：表单 */}
              <Reveal delay={0.1}>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-[var(--shadow-card)]">
                  <h2 className="mb-1 text-lg font-semibold text-[var(--color-ink)]">发送咨询</h2>
                  <p className="mb-7 text-xs text-[var(--color-ink-soft)]">
                    填写后我们会在 1 个工作日内回复
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
                      <label htmlFor="topic" className="mb-2 block text-xs font-medium text-[var(--color-ink-soft)]">
                        咨询类型
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
                      <label htmlFor="message" className="mb-2 block text-xs font-medium text-[var(--color-ink-soft)]">
                        内容
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        required
                        placeholder="请描述你的需求，例如：需要 50g 无纺布隔离衣 5 万件，出口沙特。"
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
                      点击后将跳转 WhatsApp，内容已自动填入
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
