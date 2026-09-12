"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  FileText,
  Paperclip,
  Sparkles,
  Square,
  Trash2,
  User,
  X,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { DashboardShell } from "@/components/dashboard-shell";
import { MarkdownMessage } from "@/components/markdown-message";
import { Button } from "@/components/ui/button";
import { kpkToast } from "@/components/ui/toast";
import { useLanguage } from "@/i18n/language-provider";
import type { Dictionary } from "@/i18n/dictionaries";
import { STORAGE_KEYS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════
   AI yordamchi.

   • Javob oqim ko'rinishida keladi va markdown sifatida chiziladi
     (kod bloklari, ro'yxatlar, qalin matn).
   • Rasm va matn fayllarini biriktirish mumkin.
   • Skroll SAHIFANING o'zida — ichki konteynerda emas. Kiritish
     maydoni pastda yopishib turadi, topbar esa fixed.
   • API kaliti serverda — bu komponent faqat /api/chat ga murojaat qiladi.
══════════════════════════════════════════════════════════════ */

/** Rasm bo'lsa data-URL, matn bo'lsa fayl mazmuni saqlanadi. */
interface Attachment {
  id: string;
  name: string;
  kind: "image" | "text";
  /** image: data:image/...;base64,... | text: fayl matni */
  data: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Faqat ko'rsatish uchun — tarixga saqlanadi, API'ga alohida yuboriladi. */
  images?: string[];
  files?: string[];
}

const SUGGESTION_KEYS: (keyof Dictionary)[] = [
  "aiSuggest1",
  "aiSuggest2",
  "aiSuggest3",
  "aiSuggest4",
];

const MAX_FILE_BYTES = 5 * 1024 * 1024;

const TEXT_EXTENSIONS = [
  ".txt", ".md", ".json", ".js", ".jsx", ".ts", ".tsx",
  ".css", ".scss", ".html", ".py", ".java", ".c", ".cpp", ".php", ".sql", ".yml", ".yaml",
];

function isTextFile(file: File): boolean {
  if (file.type.startsWith("text/")) return true;
  const lower = file.name.toLowerCase();
  return TEXT_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

function readStoredChat(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.aiChat);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export function AiAssistantView() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, isLoading } = useAuth();

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [atBottom, setAtBottom] = React.useState(true);

  const abortRef = React.useRef<AbortController | null>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

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
      // Rasmlar juda katta — saqlashda ularni tashlab ketamiz.
      const light = messages.slice(-40).map(({ images, ...rest }) => rest);
      window.localStorage.setItem(STORAGE_KEYS.aiChat, JSON.stringify(light));
    } catch {
      /* kvota to'lgan bo'lsa jim o'tamiz */
    }
  }, [messages]);

  /* ── Skroll holatini kuzatish: endi oynaning o'zi skroll bo'ladi,
        ichki konteyner emas. Shuning uchun window'ga quloq solamiz. ── */
  React.useEffect(() => {
    const onScroll = () => {
      const distance =
        document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
      setAtBottom(distance < 120);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* ── Yangi xabar kelganda pastga tushamiz, lekin faqat foydalanuvchi
        allaqachon pastda bo'lsa — o'qiyotgan odamni tortib ketmaymiz. ── */
  React.useEffect(() => {
    if (!atBottom) return;
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, atBottom]);

  /* ── Yuborgandan keyin darhol pastga tushamiz ── */
  const scrollToBottom = React.useCallback(() => {
    window.requestAnimationFrame(() =>
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    );
  }, []);

  /* ── Textarea balandligini matnga moslash ── */
  React.useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 180)}px`;
  }, [input]);

  const stop = React.useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  /* ── Fayl biriktirish ── */
  const addFiles = async (list: FileList | null) => {
    if (!list) return;

    for (const file of Array.from(list)) {
      if (file.size > MAX_FILE_BYTES) {
        kpkToast.error(t("aiFileTooBig"), t("aiFileTooBigText", { name: file.name }), "warning");
        continue;
      }

      const isImage = file.type.startsWith("image/");

      if (!isImage && !isTextFile(file)) {
        kpkToast.error(t("aiFileUnsupported"), t("aiFileUnsupportedText"), "warning");
        continue;
      }

      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);

        if (isImage) reader.readAsDataURL(file);
        else reader.readAsText(file);
      }).catch(() => "");

      if (!data) continue;

      setAttachments((previous) => [
        ...previous,
        { id: `${file.name}-${Date.now()}`, name: file.name, kind: isImage ? "image" : "text", data },
      ]);
    }
  };

  const removeAttachment = (id: string) =>
    setAttachments((previous) => previous.filter((item) => item.id !== id));

  /* ── Yuborish ── */
  const send = React.useCallback(
    async (text: string) => {
      const question = text.trim();
      const files = attachments;

      if ((!question && files.length === 0) || isStreaming) return;

      const images = files.filter((f) => f.kind === "image");
      const texts = files.filter((f) => f.kind === "text");

      // Matn fayllari savolga kod bloki sifatida qo'shiladi
      const fileBlocks = texts
        .map((f) => `\n\n\`\`\`\n// ${f.name}\n${f.data.slice(0, 20000)}\n\`\`\``)
        .join("");

      const promptText = `${question}${fileBlocks}`.trim() || "…";

      const userMessage: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: question || files.map((f) => f.name).join(", "),
        images: images.map((f) => f.data),
        files: texts.map((f) => f.name),
      };
      const replyId = `a-${Date.now()}`;

      const history = [...messages, userMessage];
      setMessages([...history, { id: replyId, role: "assistant", content: "" }]);
      setInput("");
      setAttachments([]);
      setIsStreaming(true);
      setAtBottom(true);
      scrollToBottom();

      const controller = new AbortController();
      abortRef.current = controller;

      // API uchun: oldingi xabarlar oddiy matn, oxirgisi matn + rasm
      const apiMessages = [
        ...messages.map(({ role, content }) => ({ role, content })),
        images.length > 0
          ? {
              role: "user" as const,
              content: [
                { type: "text" as const, text: promptText },
                ...images.map((f) => ({
                  type: "image_url" as const,
                  image_url: { url: f.data },
                })),
              ],
            }
          : { role: "user" as const, content: promptText },
      ];

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
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
    [attachments, isStreaming, messages, scrollToBottom, t]
  );

  const clearChat = () => {
    stop();
    setMessages([]);
    setAttachments([]);
    window.localStorage.removeItem(STORAGE_KEYS.aiChat);
  };

  const copyMessage = async (message: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedId(message.id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      /* clipboard ruxsati yo'q */
    }
  };

  const isEmpty = messages.length === 0;
  const canSend = input.trim() !== "" || attachments.length > 0;

  return (
    <DashboardShell user={user} title={t("aiTitle")} subtitle={t("aiSubtitle")}>
      <div className="mx-auto w-full max-w-3xl">
        {/* ── SUHBAT: alohida skroll yo'q, sahifaning o'zi skroll bo'ladi ── */}
        <div className="relative">
          <div className="space-y-5 pb-4">
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
                  <article key={message.id} className={cn("flex gap-3", isUser && "flex-row-reverse")}>
                    <div
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-2xl text-white",
                        isUser ? "bg-[#2563eb]" : "kpk-gradient"
                      )}
                      aria-hidden
                    >
                      {isUser ? <User className="size-5" /> : <Sparkles className="size-5" />}
                    </div>

                    <div className={cn("min-w-0 max-w-[82%]", isUser && "flex flex-col items-end")}>
                      <p className="mb-1.5 text-xs font-bold text-[var(--kpk-muted)]">
                        {isUser ? t("aiYou") : t("aiAssistant")}
                      </p>

                      {/* Biriktirilgan rasmlar */}
                      {message.images && message.images.length > 0 && (
                        <div className="mb-2 flex flex-wrap justify-end gap-2">
                          {message.images.map((src, i) => (
                            <Image
                              key={i}
                              src={src}
                              alt=""
                              width={160}
                              height={160}
                              unoptimized
                              className="h-28 w-auto rounded-2xl border border-[var(--kpk-border)] object-cover"
                            />
                          ))}
                        </div>
                      )}

                      {/* Biriktirilgan matn fayllari */}
                      {message.files && message.files.length > 0 && (
                        <div className="mb-2 flex flex-wrap justify-end gap-2">
                          {message.files.map((name) => (
                            <span
                              key={name}
                              className="flex items-center gap-1.5 rounded-xl border border-[var(--kpk-border)] bg-[var(--kpk-subtle)] px-2.5 py-1.5 text-xs font-bold text-[var(--kpk-muted)]"
                            >
                              <FileText className="size-3.5" />
                              {name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div
                        className={cn(
                          "inline-block max-w-full rounded-3xl px-5 py-3.5 text-left",
                          isUser
                            ? "rounded-tr-lg bg-[#2563eb] text-[15px] leading-relaxed text-white"
                            : "kpk-card rounded-tl-lg text-[var(--kpk-text)]"
                        )}
                      >
                        {isPending ? (
                          <span className="flex items-center gap-2 text-[15px] text-[var(--kpk-muted)]">
                            <span className="flex gap-1">
                              <span className="size-1.5 animate-bounce rounded-full bg-[var(--kpk-blue)] [animation-delay:-0.3s]" />
                              <span className="size-1.5 animate-bounce rounded-full bg-[var(--kpk-blue)] [animation-delay:-0.15s]" />
                              <span className="size-1.5 animate-bounce rounded-full bg-[var(--kpk-blue)]" />
                            </span>
                            {t("aiThinking")}
                          </span>
                        ) : isUser ? (
                          <span className="whitespace-pre-wrap break-words">{message.content}</span>
                        ) : (
                          <>
                            <MarkdownMessage content={message.content} />
                            {/* Javob hali yozilayotgan bo'lsa — yonib turuvchi kursor */}
                            {isStreaming && message.id === messages[messages.length - 1]?.id && (
                              <span className="kpk-caret" aria-hidden />
                            )}
                          </>
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
        </div>

        {/* Pastga qaytish tugmasi — kiritish maydoni ustida suzib turadi */}
        {!atBottom && !isEmpty && (
          <button
            type="button"
            aria-label={t("aiScrollDown")}
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })}
            className="kpk-card sticky bottom-[104px] left-1/2 z-10 flex size-10 -translate-x-1/2 items-center justify-center rounded-full text-[var(--kpk-primary)] transition-transform hover:scale-105"
          >
            <ArrowDown className="size-4" strokeWidth={2.5} />
          </button>
        )}

        {/* ── KIRITISH MAYDONI: pastda yopishib turadi ── */}
        <div className="kpk-card sticky bottom-4 z-10 rounded-[26px] p-3">
          {/* Biriktirilgan fayllar ro'yxati */}
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2 px-1">
              {attachments.map((item) => (
                <span
                  key={item.id}
                  className="flex items-center gap-2 rounded-xl border border-[var(--kpk-border)] bg-[var(--kpk-subtle)] py-1.5 pl-2 pr-1.5 text-xs font-bold text-[var(--kpk-text)]"
                >
                  {item.kind === "image" ? (
                    <Image
                      src={item.data}
                      alt=""
                      width={40}
                      height={40}
                      unoptimized
                      className="size-6 rounded-md object-cover"
                    />
                  ) : (
                    <FileText className="size-3.5 text-[var(--kpk-muted)]" />
                  )}

                  <span className="max-w-[160px] truncate">{item.name}</span>

                  <button
                    type="button"
                    aria-label={t("aiRemoveFile")}
                    onClick={() => removeAttachment(item.id)}
                    className="flex size-5 items-center justify-center rounded-md text-[var(--kpk-muted)] transition-colors hover:bg-[var(--kpk-danger-bg)] hover:text-[var(--kpk-danger-fg)]"
                  >
                    <X className="size-3" strokeWidth={3} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,.txt,.md,.json,.js,.jsx,.ts,.tsx,.css,.scss,.html,.py,.java,.c,.cpp,.php,.sql,.yml,.yaml"
              className="hidden"
              onChange={(event) => {
                void addFiles(event.target.files);
                event.target.value = "";
              }}
            />

            <Button
              variant="ghost"
              size="icon"
              className="size-11 shrink-0 rounded-2xl"
              onClick={() => fileRef.current?.click()}
              aria-label={t("aiAttach")}
              title={t("aiAttachHint")}
            >
              <Paperclip className="size-5" />
            </Button>

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
              onPaste={(event) => {
                // Rasm nusxalab qo'yilsa uni ham biriktiramiz
                const files = event.clipboardData?.files;
                if (files && files.length > 0) void addFiles(files);
              }}
              rows={1}
              placeholder={t("aiPlaceholder")}
              aria-label={t("aiPlaceholder")}
              className="kpk-scroll min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-[15px] leading-relaxed text-[var(--kpk-text)] outline-none placeholder:text-[var(--kpk-muted)]"
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
                disabled={!canSend}
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