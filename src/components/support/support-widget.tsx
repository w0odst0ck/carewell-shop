"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 客服浮标 — 人工客服接待（全站常驻）
 *
 * 当前策略（用户 2026-11-12 拍板）：
 *   - 人工客服团队是主体，浮标是刚需
 *   - AI 客服作为技术储备，**暂不对外上线**（可行性已验证）
 *   - 后端将迁移至服务器，本机不跑
 *
 * 因此：默认情况下面板只呈现人工接待（WhatsApp / 邮件），不出现对话框。
 * 若将来配置了 NEXT_PUBLIC_CHAT_API，会自动启用 AI 辅助模式：
 *   AI 回答 + 每条回答下方恒常「转人工」，未命中/超时/不可达一律降级人工。
 *
 * AI 相关代码保留在此文件内作为储备实现，不删除。
 */

type Lang = "cn" | "en" | "ar";
type Msg = { role: "user" | "ai"; text: string; handoff?: boolean };

/** 空字符串 = AI 未启用（当前默认） */
const API_BASE = process.env.NEXT_PUBLIC_CHAT_API ?? "";
const AI_ENABLED = API_BASE.length > 0;

const I18N: Record<Lang, Record<string, string | string[]>> = {
  cn: {
    title: "Mojin 在线客服",
    subtitle: "人工客服直接回复",
    fab: "联系客服",
    welcome: "您好，这里是 Mojin 客服。产品、报价、订单相关问题，直接联系我们，人工回复。",
    placeholder: "输入你想咨询的问题…",
    send: "发送",
    typing: "正在回复",
    human: "联系人工客服",
    humanSub: "WhatsApp · 点击直接对话",
    email: "邮件联系",
    aiNote: "AI 辅助回答，仅供参考",
    error: "暂时无法回复，请直接联系人工客服。",
    chips: ["产品与定制", "报价与起订量", "订单与物流"],
  },
  en: {
    title: "Mojin Support",
    subtitle: "Replied by our team",
    fab: "Chat with us",
    welcome:
      "Hello, this is Mojin support. For products, pricing or orders, contact us directly — a human replies.",
    placeholder: "Type your question…",
    send: "Send",
    typing: "Replying",
    human: "Talk to our team",
    humanSub: "WhatsApp · opens a direct chat",
    email: "Email us",
    aiNote: "AI-assisted answer, for reference only",
    error: "Unable to reply right now. Please contact our team directly.",
    chips: ["Products & OEM", "Pricing & MOQ", "Order & shipping"],
  },
  ar: {
    title: "دعم موجين",
    subtitle: "يرد عليك فريقنا",
    fab: "تواصل معنا",
    welcome:
      "مرحبًا، هذا دعم موجين. لأي استفسار عن المنتجات أو الأسعار أو الطلبات، تواصل معنا مباشرة — يرد عليك موظف.",
    placeholder: "اكتب سؤالك…",
    send: "إرسال",
    typing: "جارٍ الرد",
    human: "تحدث مع فريقنا",
    humanSub: "واتساب · يفتح محادثة مباشرة",
    email: "راسلنا بالبريد",
    aiNote: "إجابة بمساعدة الذكاء الاصطناعي، للاسترشاد فقط",
    error: "لا يمكن الرد حاليًا. يرجى التواصل مع فريقنا مباشرة.",
    chips: ["المنتجات والتخصيص", "الأسعار وأقل كمية", "الطلب والشحن"],
  },
};

export function SupportWidget({
  waNumber,
  waDisplay,
  email,
}: {
  waNumber: string;
  waDisplay: string;
  email?: string;
}) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("cn");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  /** 取字符串文案；数组类（chips）请用 chipsOf */
  const t = useCallback(
    (k: string): string => {
      const v = I18N[lang][k];
      return Array.isArray(v) ? v.join("") : v;
    },
    [lang]
  );

  const waHref = useCallback(
    (text?: string) =>
      `https://wa.me/${waNumber}${text ? `?text=${encodeURIComponent(text)}` : ""}`,
    [waNumber]
  );

  // AI 模式下的欢迎语
  useEffect(() => {
    if (AI_ENABLED && open && msgs.length === 0) {
      setMsgs([{ role: "ai", text: I18N[lang].welcome as string }]);
    }
  }, [open, msgs.length, lang]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [msgs, busy]);

  useEffect(() => {
    if (open && AI_ENABLED) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /** 人工模式：把输入内容带去 WhatsApp 人工客服 */
  function sendToHuman(text: string) {
    const q = text.trim();
    if (!q) return;
    const suffix =
      lang === "ar" ? "\n\n(من موقع موجين)" : lang === "en" ? "\n\n(from mojin.store)" : "\n\n(来自 mojin.store)";
    window.open(waHref(q + suffix), "_blank", "noopener,noreferrer");
    setInput("");
  }

  /** AI 辅助问答 —— 仅在配置了 NEXT_PUBLIC_CHAT_API 时可用（当前未启用） */
  async function send(text: string) {
    const q = text.trim();
    if (!q || busy || !AI_ENABLED) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setBusy(true);

    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 30000);
      const res = await fetch(
        `${API_BASE}/mojin_chat/answer_question?query=${encodeURIComponent(q)}&lang=${lang}`,
        { signal: ctl.signal }
      );
      clearTimeout(timer);
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();

      if (data?.error || !data?.answer) {
        setMsgs((m) => [...m, { role: "ai", text: t("error"), handoff: true }]);
      } else {
        const noHit = (data.hit_count ?? 0) === 0;
        setMsgs((m) => [
          ...m,
          { role: "ai", text: String(data.answer), handoff: noHit },
        ]);
      }
    } catch {
      setMsgs((m) => [...m, { role: "ai", text: t("error"), handoff: true }]);
    } finally {
      setBusy(false);
    }
  }

  const chips = I18N[lang].chips as string[];
  const isAr = lang === "ar";
  const side = isAr ? { left: 24, right: "auto" } : undefined;

  return (
    <>
      {/* 浮标 */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("fab")}
        className="fixed bottom-6 z-[9999] flex items-center gap-2 rounded-full bg-[var(--color-warm-blue)] px-5 py-3.5 text-sm font-medium text-white shadow-[0_6px_24px_rgba(58,123,158,0.35)] transition-transform hover:scale-[1.03] active:scale-[0.98] ltr:right-6 rtl:left-6"
        style={side}
      >
        {open ? (
          <span className="text-base leading-none">✕</span>
        ) : (
          <>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-wa-green)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-wa-green)]" />
            </span>
            <span>{t("fab")}</span>
          </>
        )}
      </button>

      {/* 面板 */}
      {open && (
        <div
          dir={isAr ? "rtl" : "ltr"}
          className="fixed bottom-24 z-[9999] flex w-[calc(100vw-3rem)] max-w-[360px] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-[0_12px_48px_rgba(0,0,0,0.14)] ltr:right-6 rtl:left-6"
          style={{ maxHeight: "min(72vh, 540px)", ...side }}
        >
          {/* 头部 */}
          <div className="flex items-start justify-between border-b border-[var(--color-border)] px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-[var(--color-ink)]">{t("title")}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[var(--color-ink-faint)]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-wa-green)]" />
                {t("subtitle")}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {(["cn", "en", "ar"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLang(l);
                    setMsgs([]);
                  }}
                  className={`rounded px-1.5 py-0.5 text-[10px] transition-colors ${
                    lang === l
                      ? "bg-[var(--color-warm-blue)] text-white"
                      : "text-[var(--color-ink-faint)] hover:bg-[var(--color-warm-gray)]"
                  }`}
                >
                  {l === "cn" ? "中" : l === "en" ? "EN" : "ع"}
                </button>
              ))}
            </div>
          </div>

          {/* 主体 */}
          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4">
            {/* 欢迎语 */}
            <div className="mb-4 rounded-xl bg-[var(--color-warm-gray)] px-3 py-2.5 text-[12.5px] leading-relaxed text-[var(--color-ink)]">
              {t("welcome")}
            </div>

            {/* AI 模式：对话流（当前不启用） */}
            {AI_ENABLED && (
              <>
                <div className="space-y-3">
                  {msgs.map((m, i) => (
                    <div key={i}>
                      <div
                        className={`max-w-[86%] rounded-xl px-3 py-2 text-[13px] leading-relaxed ${
                          m.role === "user"
                            ? "ms-auto bg-[var(--color-warm-blue)] text-white"
                            : "bg-[var(--color-warm-gray)] text-[var(--color-ink)]"
                        }`}
                      >
                        {m.text}
                      </div>
                      {m.role === "ai" && i > 0 && (
                        <div className="mt-1.5 space-y-1.5">
                          <div className="text-[9px] text-[var(--color-ink-faint)]">
                            {t("aiNote")}
                          </div>
                          <a
                            href={waHref(t("welcome"))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium ${
                              m.handoff
                                ? "bg-[var(--color-wa-green)] text-white hover:opacity-90"
                                : "border border-[var(--color-wa-green)]/40 text-[var(--color-wa-green)] hover:bg-[var(--color-wa-green)]/10"
                            }`}
                          >
                            {t("human")}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                  {busy && (
                    <div className="text-[11px] text-[var(--color-ink-faint)]">
                      {t("typing")}…
                    </div>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {chips.map((c) => (
                    <button
                      key={c}
                      onClick={() => send(c)}
                      className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[10px] text-[var(--color-ink-soft)] hover:border-[var(--color-warm-blue)]/40 hover:text-[var(--color-warm-blue)]"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* 人工接待（默认模式） */}
            {!AI_ENABLED && (
              <>
                <a
                  href={waHref(`${t("welcome")} (mojin.store)`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mb-2 flex items-center justify-between rounded-xl bg-[var(--color-wa-green)] px-4 py-3 text-white transition-opacity hover:opacity-95"
                >
                  <div>
                    <div className="text-[13px] font-semibold">{t("human")}</div>
                    <div className="mt-0.5 text-[10px] opacity-85">{t("humanSub")}</div>
                  </div>
                  <span className="font-[family-name:var(--font-mono)] text-[11px] opacity-90">
                    {waDisplay}
                  </span>
                </a>

                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center justify-between rounded-xl border border-[var(--color-border)] px-4 py-2.5 transition-colors hover:border-[var(--color-warm-blue)]/40"
                  >
                    <span className="text-[12px] text-[var(--color-ink)]">{t("email")}</span>
                    <span className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--color-ink-faint)]">
                      {email}
                    </span>
                  </a>
                )}

                {/* 快捷主题 → 预填 WhatsApp 消息 */}
                <div className="mt-4">
                  <div className="mb-2 text-[10px] uppercase tracking-wider text-[var(--color-ink-faint)]">
                    {isAr ? "مواضيع شائعة" : lang === "en" ? "Common topics" : "常见咨询"}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {chips.map((c) => (
                      <a
                        key={c}
                        href={waHref(`${c} — ${lang === "ar" ? "من موقع موجين" : lang === "en" ? "from mojin.store" : "来自 mojin.store"}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[10px] text-[var(--color-ink-soft)] transition-colors hover:border-[var(--color-wa-green)]/40 hover:text-[var(--color-wa-green)]"
                      >
                        {c}
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* AI 模式：输入框（储备实现，当前不启用） */}
          {AI_ENABLED && (
            <div className="border-t border-[var(--color-border)] p-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder={t("placeholder")}
                  className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 text-[12px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-warm-blue)]"
                />
                <button
                  onClick={() => send(input)}
                  disabled={busy || !input.trim()}
                  className="rounded-lg bg-[var(--color-warm-blue)] px-3 py-2 text-[12px] font-medium text-white transition-opacity disabled:opacity-40"
                >
                  {t("send")}
                </button>
              </div>
              <a
                href={waHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-[var(--color-wa-green)]/10 py-2 text-[11px] font-medium text-[var(--color-wa-green)] transition-colors hover:bg-[var(--color-wa-green)]/20"
              >
                {t("human")}
                <span className="text-[9px] opacity-70">· {waDisplay}</span>
              </a>
            </div>
          )}

          {/* 人工模式：输入框 → 发送到 WhatsApp */}
          {!AI_ENABLED && (
            <div className="border-t border-[var(--color-border)] p-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendToHuman(input);
                    }
                  }}
                  rows={1}
                  placeholder={t("placeholder")}
                  className="min-h-[38px] max-h-24 min-w-0 flex-1 resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2.5 text-[12px] leading-snug text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-warm-blue)]"
                />
                <button
                  onClick={() => sendToHuman(input)}
                  disabled={!input.trim()}
                  className="shrink-0 rounded-lg bg-[var(--color-wa-green)] px-3 py-2.5 text-[12px] font-medium text-white transition-opacity disabled:opacity-40"
                >
                  {t("send")}
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
}