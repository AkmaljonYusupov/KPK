"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Check, Copy, Sparkles, Square, Trash2, User } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { kpkToast } from "@/components/ui/toast";
import { useLanguage } from "@/i18n/language-provider";
import type { Dictionary } from "@/i18n/dictionaries";
import { STORAGE_KEYS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTION_KEYS: (keyof Dictionary)[] = [
  "aiSuggest1",
  "aiSuggest2",
  "aiSuggest3",
  "aiSuggest4",
];

function readStoredChat(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.aiChat);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

/**
 * AI yordamchi — beshinchi bo'lim.
 *
 * Javob oqim ko'rinishida keladi: matn yozilayotgan paytda ko'rinadi.
 * Suhbat localStorage'da saqlanadi, sahifani yangilasangiz yo'qolmaydi.
 * API kaliti serverda — bu komponent faqat /api/chat ga murojaat qiladi.
 *
 * Barcha ranglar mavzu o'zgaruvchilaridan olinadi. Istisno: foydalanuvchi
 * pufakchasi doim ko'k (#2563eb), chunki matni oq — u mavzuga bog'liq emas.
 */
export function AiAssistantView() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, isLoading } = useAuth();

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const abortRef = React.useRef<AbortController | null>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  /* ── Kirish nazorati ── */
  React.useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace("/");
  }, [isLoading, user, router]);

  /* ── Saqlangan suhbatni tiklash ── */
  React.useEffect(() => {
    setMessages(readStoredChat());
  }, []);

  /* ── Har o'zgarishda saqlash ── */
  React.useEffect(() => {
    if (messages.length === 0) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.aiChat, JSON.stringify(messages.slice(-40)));
    } catch {
      /* kvota to'lgan bo'lsa jim o'tamiz */
    }
  }, [messages]);

  /* ── Yangi xabarga aylantirish ── */
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  /* ── Textarea balandligini matnga moslash ── */
  React.useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 200)}px`;
  }, [input]);

  const stop = React.useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const send = React.useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || isStreaming) return;

      const userMessage: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: question,
      };
      const replyId = `a-${Date.now()}`;

      const history = [...messages, userMessage];
      setMessages([...history, { id: replyId, role: "assistant", content: "" }]);
      setInput("");
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map(({ role, content }) => ({ role, content })),
          }),
          signal: controller.signal,
        });

        if (response.status === 503) {
          kpkToast.error(t("aiNotConfiguredTitle"), t("aiNotConfiguredText"), "shield");
          setMessages(history);
          return;
        }

        if (!response.ok || !response.body) {
          kpkToast.error(t("aiErrorTitle"), t("aiErrorText"), "warning");
          setMessages(history);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let answer = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;

          answer += decoder.decode(value, { stream: true });

          setMessages((previous) =>
            previous.map((message) =>
              message.id === replyId ? { ...message, content: answer } : message
            )
          );
        }

        // Bo'sh javob kelsa, quruq pufakcha qoldirmaymiz.
        if (!answer.trim()) {
          kpkToast.error(t("aiErrorTitle"), t("aiErrorText"), "warning");
          setMessages(history);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          kpkToast.error(t("aiErrorTitle"), t("aiErrorText"), "warning");
          setMessages(history);
        }
      } finally {
        abortRef.current = null;
        setIsStreaming(false);
      }
    },
    [isStreaming, messages, t]
  );

  const clearChat = () => {
    stop();
    setMessages([]);
    window.localStorage.removeItem(STORAGE_KEYS.aiChat);
  };

  const copyMessage = async (message: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedId(message.id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      /* clipboard ruxsati yo'q — jim o'tamiz */
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <DashboardShell user={user} title={t("aiTitle")} subtitle={t("aiSubtitle")}>
      <div className="mx-auto flex min-h-[calc(100vh-180px)] w-full max-w-3xl flex-col">
        {/* ── SUHBAT ── */}
        <div className="flex-1 space-y-5 pb-6">
          {isEmpty ? (
            <div className="kpk-card rounded-[28px] p-8 text-center max-md:p-6">
              <div className="kpk-gradient mx-auto mb-4 flex size-16 items-center justify-center rounded-3xl text-white shadow-[0_18px_40px_rgba(13,110,253,0.24)]">
                <Sparkles className="size-8" />
              </div>

              <h2 className="mb-2 text-xl font-extrabold text-[var(--kpk-primary)]">
                {t("aiEmptyTitle")}
              </h2>
              <p className="mx-auto mb-6 max-w-[52ch] text-[15px] leading-relaxed text-[var(--kpk-muted)]">
                {t("aiEmptyText")}
              </p>

              <div className="grid grid-cols-2 gap-3 text-left max-md:grid-cols-1">
                {SUGGESTION_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => void send(t(key))}
                    className="rounded-2xl border border-[var(--kpk-border)] bg-[var(--kpk-surface-solid)] px-4 py-3 text-sm font-semibold text-[var(--kpk-text)] transition-all hover:-translate-y-0.5 hover:border-[var(--kpk-blue)] hover:bg-[var(--kpk-hover)]"
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isUser = message.role === "user";
              const isPending = !isUser && message.content === "" && isStreaming;

              return (
                <article
                  key={message.id}
                  className={cn("flex gap-3", isUser && "flex-row-reverse")}
                >
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-2xl text-white",
                      isUser ? "bg-[#2563eb]" : "kpk-gradient"
                    )}
                    aria-hidden
                  >
                    {isUser ? <User className="size-5" /> : <Sparkles className="size-5" />}
                  </div>

                  <div className={cn("min-w-0 max-w-[80%]", isUser && "text-right")}>
                    <p className="mb-1.5 text-xs font-bold text-[var(--kpk-muted)]">
                      {isUser ? t("aiYou") : t("aiAssistant")}
                    </p>

                    <div
                      className={cn(
                        "inline-block rounded-3xl px-5 py-3.5 text-left text-[15px] leading-relaxed",
                        isUser
                          ? "rounded-tr-lg bg-[#2563eb] text-white"
                          : "kpk-card rounded-tl-lg text-[var(--kpk-text)]"
                      )}
                    >
                      {isPending ? (
                        <span className="flex items-center gap-2 text-[var(--kpk-muted)]">
                          <span className="flex gap-1">
                            <span className="size-1.5 animate-bounce rounded-full bg-[var(--kpk-blue)] [animation-delay:-0.3s]" />
                            <span className="size-1.5 animate-bounce rounded-full bg-[var(--kpk-blue)] [animation-delay:-0.15s]" />
                            <span className="size-1.5 animate-bounce rounded-full bg-[var(--kpk-blue)]" />
                          </span>
                          {t("aiThinking")}
                        </span>
                      ) : (
                        <span className="whitespace-pre-wrap break-words">{message.content}</span>
                      )}
                    </div>

                    {!isUser && message.content !== "" && (
                      <button
                        type="button"
                        onClick={() => void copyMessage(message)}
                        className="mt-1.5 flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-[var(--kpk-muted)] transition-colors hover:bg-[var(--kpk-hover)] hover:text-[var(--kpk-blue)]"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="size-3.5" />
                            {t("aiCopied")}
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5" />
                            {t("aiCopy")}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── KIRITISH MAYDONI ── */}
        <div className="kpk-card sticky bottom-4 rounded-[26px] p-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send(input);
                }
              }}
              rows={1}
              placeholder={t("aiPlaceholder")}
              aria-label={t("aiPlaceholder")}
              className="min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-relaxed text-[var(--kpk-text)] outline-none placeholder:text-[var(--kpk-muted)]"
            />

            {isStreaming ? (
              <Button
                variant="secondary"
                size="icon"
                className="size-11 shrink-0 rounded-2xl"
                onClick={stop}
                aria-label={t("aiThinking")}
              >
                <Square className="size-4 fill-current" />
              </Button>
            ) : (
              <Button
                variant="gradient"
                size="icon"
                className="size-11 shrink-0 rounded-2xl"
                onClick={() => void send(input)}
                disabled={input.trim() === ""}
                aria-label={t("aiSend")}
              >
                <ArrowUp className="size-5" strokeWidth={2.5} />
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 px-3 pt-1">
            <p className="text-xs text-[var(--kpk-muted)]">{t("aiHint")}</p>

            {!isEmpty && (
              <button
                type="button"
                onClick={clearChat}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-[var(--kpk-muted)] transition-colors hover:bg-[var(--kpk-danger-bg)] hover:text-[var(--kpk-danger-fg)]"
              >
                <Trash2 className="size-3.5" />
                {t("aiClear")}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}