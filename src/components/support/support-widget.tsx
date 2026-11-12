"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 客服浮标 — 人工优先 + AI 辅助
 *
 * 设计原则（用户确认）：
 *   1. 人工客服是主体，AI 是辅助 —— 任何时候都能一键转人工
 *   2. WhatsApp 永远可达（AI 挂了、后端不可达、知识库没命中，都不影响转人工）
 *   3. AI 回答仅作参考，回答下方恒常显示「转人工」
 *
 * 后端：MCPForge `/mojin_chat/answer_question`
 *   未配置 / 不可达 → 直接降级为「WhatsApp 人工」，不显示错误给访客
 */

type Lang = "cn" | "en" | "ar";
type Msg = { role: "user" | "ai"; text: string; handoff?: boolean };

const API_BASE = process.env.NEXT_PUBLIC_CHAT_API ?? "";

const I18N: Record<Lang, Record<string, string | string[]>> = {
  cn: {
    title: "Mojin 在线客服",
    subtitle: "人工优先 · AI 辅助",
    fab: "联系客服",
    placeholder: "输入你想咨询的问题…",
    send: "发送",
    typing: "正在回复",
    welcome:
      "您好，这里是 Mojin 在线客服。可以直接提问，也可以随时点下方按钮转人工。",
    human: "转人工 · WhatsApp",
    humanNote: "人工客服会直接回复你",
    error: "AI 助手暂时不可用，请直接联系我们的人工客服。",
    aiNote: "AI 辅助回答，仅供参考",
    chips: ["有什么产品", "最小起订量", "能贴牌吗"],
  },
  en: {
    title: "Mojin Support",
    subtitle: "Human first · AI assisted",
    fab: "Chat with us",
    placeholder: "Type your question…",
    send: "Send",
    typing: "Replying",
    welcome:
      "Hi, this is Mojin support. Ask anything, or switch to a human agent anytime.",
    human: "Talk to a human · WhatsApp",
    humanNote: "A human agent replies directly",
    error: "AI assistant is unavailable. Please reach our human support.",
    aiNote: "AI-assisted answer, for reference only",
    chips: ["What do you produce", "Minimum order", "Can you do OEM"],
  },
  ar: {
    title: "دعم موجين",
    subtitle: "البشري أولًا · بمساعدة الذكاء الاصطناعي",
    fab: "تواصل معنا",
    placeholder: "اكتب سؤالك…",
    send: "إرسال",
    typing: "جارٍ الرد",
    welcome:
      "مرحبًا، هذا دعم موجين. اسأل عن أي شيء، أو تحدث مع موظف بشري في أي وقت.",
    human: "التحدث مع موظف · واتساب",
    humanNote: "موظف الدعم يرد عليك مباشرة",
    error: "المساعد الذكي غير متاح حاليًا. يرجى التواصل مع الدعم البشري.",
    aiNote: "إجابة بمساعدة الذكاء الاصطناعي، للاسترشاد فقط",
    chips: ["ماذا تنتجون", "أقل كمية للطلب", "هل تقبلون العلامة الخاصة"],
  },
};

export function SupportWidget({
  waNumber,
  waDisplay,
}: {
  waNumber: string;
  waDisplay: string;
}) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("cn");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = useCallback(
    (k: string) => {
      const v = I18N[lang][k];
      return Array.isArray(v) ? v : (v as string);
    },
    [lang]
  );

  const waHref = useCallback(
    (text?: string) =>
      `https://wa.me/${waNumber}${text ? `?text=${encodeURIComponent(text)}` : ""}`,
    [waNumber]
  );

  // 欢迎语
  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([{ role: "ai", text: I18N[lang].welcome as string }]);
    }
  }, [open, msgs.length, lang]);

  // 滚动到底
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [msgs, busy]);

  // 打开时聚焦
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  // Esc 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setBusy(true);

    // 后端未配置 → 直接引导人工，不暴露技术细节
    if (!API_BASE) {
      setBusy(false);
      setMsgs((m) => [
        ...m,
        { role: "ai", text: t("error") as string, handoff: true },
      ]);
      return;
    }

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
        setMsgs((m) => [
          ...m,
          { role: "ai", text: t("error") as string, handoff: true },
        ]);
      } else {
        // 知识库未命中 → 一并给转人工
        const noHit = (data.hit_count ?? 0) === 0;
        setMsgs((m) => [
          ...m,
          { role: "ai", text: String(data.answer), handoff: noHit },
        ]);
      }
    } catch {
      setMsgs((m) => [
        ...m,
        { role: "ai", text: t("error") as string, handoff: true },
      ]);
    } finally {
      setBusy(false);
    }
  }

  const chips = t("chips") as string[];
  const isAr = lang === "ar";

  return (
    <>
      {/* 浮标 */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("fab") as string}
        className="fixed bottom-6 z-[9999] flex items-center gap-2 rounded-full bg-[var(--color-warm-blue)] px-5 py-3.5 text-sm font-medium text-white shadow-[0_6px_24px_rgba(58,123,158,0.35)] transition-transform hover:scale-[1.03] active:scale-[0.98] ltr:right-6 rtl:left-6"
        style={isAr ? { left: 24, right: "auto" } : undefined}
      >
        {open ? (
          <span className="text-base leading-none">✕</span>
        ) : (
          <>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-wa-green)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-wa-green)]" />
            </span>
            <span>{t("fab") as string}</span>
          </>
        )}
      </button>

      {/* 面板 */}
      {open && (
        <div
          dir={isAr ? "rtl" : "ltr"}
          className="fixed bottom-24 z-[9999] flex w-[calc(100vw-3rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-[0_12px_48px_rgba(0,0,0,0.14)] ltr:right-6 rtl:left-6"
          style={{ maxHeight: "min(70vh, 560px)", ...(isAr ? { left: 24, right: "auto" } : {}) }}
        >
          {/* 头部 */}
          <div className="flex items-start justify-between border-b border-[var(--color-border)] px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-[var(--color-ink)]">
                {t("title") as string}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[var(--color-ink-faint)]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-wa-green)]" />
                {t("subtitle") as string}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {(["cn", "en", "ar"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
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

          {/* 消息区 */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
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

                {/* AI 回答下方恒常标注 + 转人工 */}
                {m.role === "ai" && i > 0 && (
                  <div className="mt-1.5 space-y-1.5">
                    <div className="text-[9px] text-[var(--color-ink-faint)]">
                      {t("aiNote") as string}
                    </div>
                    <a
                      href={waHref(t("welcome") as string)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${
                        m.handoff
                          ? "bg-[var(--color-wa-green)] text-white hover:opacity-90"
                          : "border border-[var(--color-wa-green)]/40 text-[var(--color-wa-green)] hover:bg-[var(--color-wa-green)]/10"
                      }`}
                    >
                      {t("human") as string}
                    </a>
                  </div>
                )}
              </div>
            ))}

            {busy && (
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-faint)]">
                <span className="inline-block h-1 w-1 animate-bounce rounded-full bg-[var(--color-ink-faint)]" />
                <span
                  className="inline-block h-1 w-1 animate-bounce rounded-full bg-[var(--color-ink-faint)]"
                  style={{ animationDelay: "0.15s" }}
                />
                <span
                  className="inline-block h-1 w-1 animate-bounce rounded-full bg-[var(--color-ink-faint)]"
                  style={{ animationDelay: "0.3s" }}
                />
                <span className="ms-1">{t("typing") as string}</span>
              </div>
            )}
          </div>

          {/* 快捷问题 */}
          {msgs.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {chips.map((c) => (
                <button
                  key={c}
                  onClick={() => send(c)}
                  className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[10px] text-[var(--color-ink-soft)] transition-colors hover:border-[var(--color-warm-blue)]/40 hover:text-[var(--color-warm-blue)]"
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {/* 输入区 */}
          <div className="border-t border-[var(--color-border)] p-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder={t("placeholder") as string}
                className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 text-[12px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-warm-blue)]"
              />
              <button
                onClick={() => send(input)}
                disabled={busy || !input.trim()}
                className="rounded-lg bg-[var(--color-warm-blue)] px-3 py-2 text-[12px] font-medium text-white transition-opacity disabled:opacity-40"
              >
                {t("send") as string}
              </button>
            </div>

            {/* 常驻人工入口 */}
            <a
              href={waHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-[var(--color-wa-green)]/10 py-2 text-[11px] font-medium text-[var(--color-wa-green)] transition-colors hover:bg-[var(--color-wa-green)]/20"
            >
              {t("human") as string}
              <span className="text-[9px] opacity-70">· {waDisplay}</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}