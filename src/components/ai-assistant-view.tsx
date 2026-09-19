"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Download,
  FileText,
  ImagePlus,
  Maximize2,
  Paperclip,
  Pencil,
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { kpkToast } from "@/components/ui/toast";
import { useLanguage } from "@/i18n/language-provider";
import type { Dictionary } from "@/i18n/dictionaries";
import { STORAGE_KEYS } from "@/lib/constants";
import { clearImages, loadAllImages, saveImages } from "@/lib/image-store";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════
   AI yordamchi.

   • Javob oqim ko'rinishida keladi va markdown sifatida chiziladi
     (kod bloklari, ro'yxatlar, qalin matn).
   • Rasm va matn fayllarini biriktirish mumkin.
   • Rasm chizish rejimi — /api/image orqali.
   • Skroll SAHIFANING o'zida. Foydalanuvchi yuqoriga chiqsa,
     yangi xabar uni pastga tortib ketmaydi.
   • API kaliti serverda — bu komponent faqat /api/* ga murojaat qiladi.
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
  /** AI chizgan rasm (data-URL). Faqat assistant xabarlarida bo'ladi. */
  generated?: string;
  /** Foydalanuvchi xabari qaysi rejimda yuborilgan — tahrirlashda shu rejim bilan qayta yuboriladi. */
  mode?: "chat" | "image";
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

/** Rasmni yuklab olish. Anchor teg o'rniga JS — JSX soddaroq qoladi. */
function downloadImage(dataUrl: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `kpk-ai-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
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
  const [showJump, setShowJump] = React.useState(false);
  const [imageMode, setImageMode] = React.useState(false);
  /** Hozir chizilayotgan assistant xabarining id'si. */
  const [drawingId, setDrawingId] = React.useState<string | null>(null);
  /** Kattalashtirilgan rasm (lightbox). */
  const [lightbox, setLightbox] = React.useState<string | null>(null);
  /** Hozir tahrirlanayotgan foydalanuvchi xabarining id'si va uning matni. */
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editText, setEditText] = React.useState("");
  /* `fixed` elementlarni portal orqali document.body'ga chiqarish uchun —
     shunda ota-elementlardagi transform/filter ularni "qamab qolmaydi". */
  const [mounted, setMounted] = React.useState(false);

  const abortRef = React.useRef<AbortController | null>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  /** Kontent ustunining o'zi — chap panel (sidebar) kengligini hisobga
      olib, pastki panelni aynan shu ustunga moslab markazlashtirish uchun. */
  const contentRef = React.useRef<HTMLDivElement>(null);
  /** Pastki panel egallashi kerak bo'lgan aniq chap chekka va kenglik. */
  const [barBox, setBarBox] = React.useState<{ left: number; width: number } | null>(null);

  /* Pastdamizmi — REF sifatida saqlanadi, state emas.
     State bo'lsa har o'zgarishda avtoskroll effekti qayta ishga
     tushib, foydalanuvchini pastga tortib ketardi. */
  const atBottomRef = React.useRef(true);

  /* ── Kirish nazorati ── */
  React.useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace("/");
  }, [isLoading, user, router]);

  /* ── Portal faqat brauzerda ishlaydi ── */
  React.useEffect(() => {
    setMounted(true);
  }, []);

  /* ── Pastki panel qayerga joylashishini o'lchash.
        Mobil'da (sidebar yashiringan holatda) butun ekran eniga,
        desktopda esa kontent ustuniga (sidebar'dan keyingi qismga)
        moslab markazlashtiramiz — DashboardShell'ning sidebar
        kengligi qanday bo'lishidan qat'i nazar ishlaydi. ── */
  React.useEffect(() => {
    const measure = () => {
      const isDesktop = window.innerWidth >= 768;

      if (!isDesktop) {
        setBarBox({ left: 0, width: window.innerWidth });
        return;
      }

      const rect = contentRef.current?.getBoundingClientRect();
      if (rect) setBarBox({ left: rect.left, width: rect.width });
    };

    measure();
    window.addEventListener("resize", measure);

    const el = contentRef.current;
    const observer = new ResizeObserver(measure);

    if (el) {
      observer.observe(el);

      /* MUHIM: ota-elementni ham kuzatamiz.

         ResizeObserver faqat O'LCHAMNI kuzatadi, joylashuvni emas.
         Sidebar yig'ilganda kontent ustuni chapga siljiydi, lekin
         max-w-3xl tufayli kengligi o'zgarmaydi — shuning uchun
         observer ishga tushmaydi va barBox.left eski qiymatda
         qolib ketadi (panel ~100px o'ngga siljib ko'rinadi).

         <main> ning kengligi esa sidebar bilan birga o'zgaradi,
         shuning uchun uni kuzatish siljishni ham ushlaydi. */
      const parent = el.closest("main") ?? el.parentElement;
      if (parent) observer.observe(parent);
    }

    return () => {
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, []);

  /* ── Saqlangan suhbatni tiklash: matn localStorage'dan,
        rasmlar esa IndexedDB'dan (ular juda katta). ── */
  React.useEffect(() => {
    const stored = readStoredChat();
    setMessages(stored);

    if (stored.length === 0) return;

    void loadAllImages().then((store) => {
      if (Object.keys(store).length === 0) return;

      setMessages((previous) =>
        previous.map((message) => {
          const saved = store[message.id];
          if (!saved || saved.length === 0) return message;

          // Birinchi element — AI chizgan rasm, qolganlari biriktirilganlar
          return message.role === "assistant"
            ? { ...message, generated: saved[0] }
            : { ...message, images: saved };
        })
      );
    });
  }, []);

  /* ── Har o'zgarishda saqlash ── */
  React.useEffect(() => {
    if (messages.length === 0) return;

    const recent = messages.slice(-40);

    try {
      // localStorage'ga faqat matn — rasmlar uning kvotasiga sig'maydi.
      const light = recent.map(({ images, generated, ...rest }) => rest);
      window.localStorage.setItem(STORAGE_KEYS.aiChat, JSON.stringify(light));
    } catch {
      /* kvota to'lgan bo'lsa jim o'tamiz */
    }

    // Rasmlar IndexedDB'ga — u yerda joy ancha ko'p.
    for (const message of recent) {
      const files = message.generated ? [message.generated] : message.images;
      if (files && files.length > 0) void saveImages(message.id, files);
    }
  }, [messages]);

  /* ── Pastga yaqinmi? ── */
  const isNearBottom = React.useCallback(() => {
    const doc = document.documentElement;
    return doc.scrollHeight - window.scrollY - window.innerHeight < 140;
  }, []);

  /* ── Skroll kuzatuvi: oynaning o'zi skroll bo'ladi ── */
  React.useEffect(() => {
    const onScroll = () => {
      const near = isNearBottom();
      atBottomRef.current = near;
      setShowJump(!near);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isNearBottom]);

  /* ── Pastga tushirish.
        scrollIntoView ishlatilmaydi: u eng yaqin skroll konteynerini
        (masalan kod blokining gorizontal skrollini) ham surib yuboradi
        va sahifa sakrab ketadi. window.scrollTo aniq va xavfsiz. ── */
  const scrollToBottom = React.useCallback((smooth = false) => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  /* ── Yangi xabar kelganda pastga tushamiz.
        Bog'liqlikda FAQAT messages bor — atBottom yo'q. Shuning uchun
        foydalanuvchi yuqoriga chiqib qaytganda sahifa sakramaydi. ── */
  React.useEffect(() => {
    if (!atBottomRef.current) return;
    scrollToBottom(false);
  }, [messages, scrollToBottom]);

  /* ── Textarea balandligini matnga moslash ── */
  React.useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 180)}px`;
  }, [input]);

  /* ── Tahrirlash maydonini ham matnga moslab o'stiramiz,
        va tahrirlash boshlanganda darhol fokus beramiz. ── */
  React.useEffect(() => {
    const element = editTextareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 220)}px`;
  }, [editText, editingId]);

  React.useEffect(() => {
    if (!editingId) return;
    const element = editTextareaRef.current;
    if (!element) return;
    element.focus();
    element.setSelectionRange(element.value.length, element.value.length);
  }, [editingId]);

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

  /* ── Rasm chizish: alohida endpoint, oqim yo'q ──
        `historyBase` berilsa (xabar tahrirlanganda), suhbat undan
        davom etadi — asl xabar va undan keyingi javob o'chiriladi. */
  const draw = React.useCallback(
    async (text: string, options?: { historyBase?: ChatMessage[] }) => {
      const prompt = text.trim();
      if (!prompt || isStreaming) return;

      const baseHistory = options?.historyBase ?? messages;

      const userMessage: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: prompt,
        mode: "image",
      };
      const replyId = `a-${Date.now()}`;

      const history = [...baseHistory, userMessage];
      setMessages([...history, { id: replyId, role: "assistant", content: "" }]);
      setInput("");
      setIsStreaming(true);
      setDrawingId(replyId);
      atBottomRef.current = true;
      setShowJump(false);
      scrollToBottom(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
          signal: controller.signal,
        });

        if (response.status === 503) {
          kpkToast.error(t("aiNotConfiguredTitle"), t("aiNotConfiguredText"), "shield");
          setMessages(history);
          return;
        }

        const result = (await response.json().catch(() => null)) as { image?: string } | null;

        if (!response.ok || !result?.image) {
          kpkToast.error(t("aiImageError"), t("aiImageErrorText"), "warning");
          setMessages(history);
          return;
        }

        setMessages((previous) =>
          previous.map((message) =>
            message.id === replyId
              ? { ...message, content: t("aiImageResult"), generated: result.image }
              : message
          )
        );
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          kpkToast.error(t("aiImageError"), t("aiImageErrorText"), "warning");
          setMessages(history);
        }
      } finally {
        abortRef.current = null;
        setIsStreaming(false);
        setDrawingId(null);
      }
    },
    [isStreaming, messages, scrollToBottom, t]
  );

  /* ── Yuborish ──
        `historyBase` va `filesOverride` tahrirlangan xabarni qayta
        yuborishda ishlatiladi: suhbat asl xabardan oldingi holatga
        qaytariladi va unga bog'langan rasmlar saqlab qolinadi. */
  const send = React.useCallback(
    async (text: string, options?: { historyBase?: ChatMessage[]; filesOverride?: Attachment[] }) => {
      const question = text.trim();
      const isEdit = options?.filesOverride !== undefined;
      const files = options?.filesOverride ?? attachments;

      if ((!question && files.length === 0) || isStreaming) return;

      const baseHistory = options?.historyBase ?? messages;
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
        mode: "chat",
      };
      const replyId = `a-${Date.now()}`;

      const history = [...baseHistory, userMessage];
      setMessages([...history, { id: replyId, role: "assistant", content: "" }]);
      setInput("");
      if (!isEdit) setAttachments([]);
      setIsStreaming(true);
      atBottomRef.current = true;
      setShowJump(false);
      scrollToBottom(true);

      const controller = new AbortController();
      abortRef.current = controller;

      // API uchun: oldingi xabarlar oddiy matn, oxirgisi matn + rasm
      const apiMessages = [
        ...baseHistory.map(({ role, content }) => ({ role, content })),
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
    void clearImages();
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

  /** Rejimga qarab: matn yoki rasm. */
  const submit = React.useCallback(
    (text: string) => (imageMode ? void draw(text) : void send(text)),
    [draw, imageMode, send]
  );

  /* ── Xabarni tahrirlash ── */
  const startEdit = React.useCallback(
    (message: ChatMessage) => {
      if (isStreaming) return;
      setEditingId(message.id);
      setEditText(message.content);
    },
    [isStreaming]
  );

  const cancelEdit = React.useCallback(() => {
    setEditingId(null);
    setEditText("");
  }, []);

  /* Tahrirlangan xabarni saqlaydi: undan keyingi butun suhbat
     (shu jumladan eski javob) o'chiriladi va yangi matn bilan
     asl rejim (matn yoki rasm) saqlangan holda qayta yuboriladi. */
  const saveEdit = React.useCallback(() => {
    const id = editingId;
    const newText = editText.trim();
    if (!id || !newText || isStreaming) return;

    const index = messages.findIndex((message) => message.id === id);
    if (index === -1) return;

    const original = messages[index];
    const historyBase = messages.slice(0, index);

    setEditingId(null);
    setEditText("");

    if (original.mode === "image") {
      void draw(newText, { historyBase });
      return;
    }

    // Asl xabarga biriktirilgan rasmlar saqlab qolinadi.
    const filesOverride: Attachment[] = (original.images ?? []).map((data, i) => ({
      id: `edit-${id}-img-${i}`,
      name: `image-${i + 1}`,
      kind: "image" as const,
      data,
    }));

    void send(newText, { historyBase, filesOverride });
  }, [draw, editText, editingId, isStreaming, messages, send]);

  const isEmpty = messages.length === 0;
  const canSend = imageMode ? input.trim() !== "" : input.trim() !== "" || attachments.length > 0;

  return (
    <DashboardShell user={user} title={t("aiTitle")} subtitle={t("aiSubtitle")}>
      <div ref={contentRef} className="mx-auto w-full max-w-3xl pb-[calc(120px+env(safe-area-inset-bottom))] md:pb-28">
        {/* ── SUHBAT: alohida skroll yo'q, sahifaning o'zi skroll bo'ladi ── */}
        <div className="relative">
          <div className="space-y-5 pb-4">
            {isEmpty ? (
              <div className="kpk-card rounded-[28px] p-8 text-center max-md:p-6">
                <div className="kpk-gradient kpk-ai-avatar mx-auto mb-4 flex size-16 items-center justify-center rounded-3xl text-white">
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
                      onClick={() => submit(t(key))}
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
                const isDrawingThis = drawingId === message.id;
                const isEditingThis = isUser && editingId === message.id;
                const isLive =
                  !isUser &&
                  (isPending || isDrawingThis || (isStreaming && message.id === messages[messages.length - 1]?.id));

                return (
                  <article
                    key={message.id}
                    className={cn("kpk-msg-enter flex gap-3", isUser && "flex-row-reverse")}
                  >
                    <div
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-2xl text-white",
                        isUser ? "bg-[#2563eb]" : "kpk-gradient",
                        isLive && "kpk-ai-avatar"
                      )}
                      aria-hidden
                    >
                      {isUser ? <User className="size-5" /> : <Sparkles className="size-5" />}
                    </div>

                    <div
                      className={cn(
                        "min-w-0",
                        isUser && "flex flex-col items-end",
                        isEditingThis ? "w-full max-w-[440px]" : "max-w-[82%]"
                      )}
                    >
                      <p className="mb-1.5 text-xs font-bold text-[var(--kpk-muted)]">
                        {isEditingThis ? t("aiEditMessage") : isUser ? t("aiYou") : t("aiAssistant")}
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
                          isEditingThis
                            ? "kpk-card w-full min-w-[260px] rounded-tr-lg ring-1 ring-[var(--kpk-blue)]/25 sm:min-w-[380px]"
                            : isUser
                              ? "rounded-tr-lg bg-[#2563eb] text-[15px] leading-relaxed text-white"
                              : "kpk-card rounded-tl-lg text-[var(--kpk-text)]"
                        )}
                      >
                        {isEditingThis ? (
                          <div className="w-full">
                            <textarea
                              ref={editTextareaRef}
                              value={editText}
                              onChange={(event) => setEditText(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                  event.preventDefault();
                                  saveEdit();
                                }
                                if (event.key === "Escape") {
                                  event.preventDefault();
                                  cancelEdit();
                                }
                              }}
                              rows={1}
                              aria-label={t("aiEditMessage")}
                              className="kpk-scroll w-full resize-none bg-transparent text-[15px] leading-relaxed text-[var(--kpk-text)] outline-none placeholder:text-[var(--kpk-muted)]"
                            />

                            <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-[var(--kpk-border)] pt-2.5">
                              <p className="text-[11px] text-[var(--kpk-muted)]">{t("aiHint")}</p>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  aria-label={t("aiEditCancel")}
                                  title={t("aiEditCancel")}
                                  className="flex size-8 items-center justify-center rounded-full text-[var(--kpk-muted)] transition-colors hover:bg-[var(--kpk-hover)] hover:text-[var(--kpk-text)]"
                                >
                                  <X className="size-4" strokeWidth={2.5} />
                                </button>
                                <button
                                  type="button"
                                  onClick={saveEdit}
                                  disabled={!editText.trim()}
                                  aria-label={t("aiEditSave")}
                                  title={t("aiEditSave")}
                                  className="kpk-gradient flex size-8 items-center justify-center rounded-full text-white shadow-[0_6px_16px_rgba(13,110,253,0.32)] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                                >
                                  <ArrowUp className="size-4" strokeWidth={2.5} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : drawingId === message.id ? (
                          <div className="space-y-2.5">
                            {/* Aylanuvchi gradient ramka ichida yaltirab turuvchi maydon —
                                ustida skanerlovchi nur va chaqnovchi uchqunlar bilan */}
                            <div className="kpk-drawing w-full max-w-[380px]">
                              <div className="kpk-shimmer relative aspect-square w-full rounded-2xl">
                                <div className="kpk-scan" aria-hidden />
                                <span className="kpk-sparkle left-[18%] top-[28%] size-1.5 [animation-delay:0s]" aria-hidden />
                                <span className="kpk-sparkle left-[72%] top-[22%] size-1 [animation-delay:0.5s]" aria-hidden />
                                <span className="kpk-sparkle left-[34%] top-[68%] size-1 [animation-delay:0.9s]" aria-hidden />
                                <span className="kpk-sparkle left-[78%] top-[64%] size-1.5 [animation-delay:1.3s]" aria-hidden />
                                <span className="kpk-sparkle left-[52%] top-[45%] size-1 [animation-delay:1.7s]" aria-hidden />
                              </div>
                            </div>

                            <p className="flex items-center gap-2 text-[13px] font-semibold">
                              <Sparkles className="size-4 animate-pulse text-[var(--kpk-blue)]" />
                              <span className="kpk-ai-thinking-text">{t("aiImageDrawing")}</span>
                              <span className="flex gap-1">
                                <span className="size-1 animate-bounce rounded-full bg-[var(--kpk-blue)] [animation-delay:-0.3s]" />
                                <span className="size-1 animate-bounce rounded-full bg-[var(--kpk-blue)] [animation-delay:-0.15s]" />
                                <span className="size-1 animate-bounce rounded-full bg-[var(--kpk-blue)]" />
                              </span>
                            </p>
                          </div>
                        ) : isPending ? (
                          <span className="flex items-center gap-2 text-[15px]">
                            <span className="flex gap-1">
                              <span className="size-1.5 animate-bounce rounded-full bg-[var(--kpk-blue)] [animation-delay:-0.3s]" />
                              <span className="size-1.5 animate-bounce rounded-full bg-[var(--kpk-blue)] [animation-delay:-0.15s]" />
                              <span className="size-1.5 animate-bounce rounded-full bg-[var(--kpk-blue)]" />
                            </span>
                            <span className="kpk-ai-thinking-text font-semibold">{t("aiThinking")}</span>
                          </span>
                        ) : isUser ? (
                          <span className="whitespace-pre-wrap break-words">{message.content}</span>
                        ) : message.generated ? (
                          <div className="space-y-2">
                            {/* Bosilganda to'liq ekranda ochiladi — paydo bo'lishi
                                yumshoq kattalashib-tiniqlashib ochilish bilan */}
                            <button
                              type="button"
                              onClick={() => setLightbox(message.generated!)}
                              aria-label={t("aiImageOpen")}
                              className="kpk-image-reveal group relative block w-full max-w-[420px] overflow-hidden rounded-2xl border border-[var(--kpk-border)]"
                            >
                              <Image
                                src={message.generated}
                                alt={message.content}
                                width={512}
                                height={512}
                                unoptimized
                                className="w-full transition-transform duration-300 group-hover:scale-[1.03]"
                              />

                              <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/25 group-hover:opacity-100">
                                <span className="flex size-11 items-center justify-center rounded-full bg-white/90 text-[#1b3a63]">
                                  <Maximize2 className="size-5" />
                                </span>
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => downloadImage(message.generated!)}
                              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-[var(--kpk-muted)] transition-colors hover:bg-[var(--kpk-hover)] hover:text-[var(--kpk-blue)]"
                            >
                              <Download className="size-3.5" />
                              {t("aiImageDownload")}
                            </button>
                          </div>
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

                      {!isUser && message.content !== "" && !message.generated && (
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

                      {isUser && !isEditingThis && !isStreaming && (
                        <button
                          type="button"
                          onClick={() => startEdit(message)}
                          className="mt-1.5 flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-[var(--kpk-muted)] transition-colors hover:bg-[var(--kpk-hover)] hover:text-[var(--kpk-blue)]"
                        >
                          <Pencil className="size-3.5" />
                          {t("aiEdit")}
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

        {/* Pastga qaytish tugmasi va kiritish paneli — ikkalasi ham
              document.body'ga portal orqali chiqariladi (transform/filter'li
              ota-wrapper'lar ularni "qamab qolmasligi" uchun), va kontent
              ustunining o'lchangan chap chekkasi/kengligiga (barBox)
              moslab joylashtiriladi — shunda sidebar bo'lsa ham panel
              haqiqiy chat ustuniga nisbatan markazda turadi. */}
        {mounted &&
          barBox &&
          createPortal(
            <>
              {showJump && !isEmpty && (
                <button
                  type="button"
                  aria-label={t("aiScrollDown")}
                  onClick={() => {
                    atBottomRef.current = true;
                    setShowJump(false);
                    scrollToBottom(true);
                  }}
                  style={{ left: barBox.left + barBox.width / 2 }}
                  className="kpk-card fixed z-30 flex size-10 -translate-x-1/2 items-center justify-center rounded-full text-[var(--kpk-primary)] transition-transform hover:scale-105 bottom-[calc(104px+env(safe-area-inset-bottom))] md:bottom-[104px]"
                >
                  <ArrowDown className="size-4" strokeWidth={2.5} />
                </button>
              )}

              {/* ── KIRITISH MAYDONI: pastda yopishib turadi, aynan
                    kontent ustuni (barBox) kengligida — mobil'da bu
                    butun ekran (sidebar yashiringan), desktopda esa
                    sidebar'dan keyingi chat ustuni bilan bir xil. ── */}
              <div
                style={{ left: barBox.left, width: barBox.width }}
                className="fixed bottom-0 z-20 px-0 md:bottom-4 md:px-4"
              >
                {/* Kiritish paneli — shishasimon (glass/blur) effektsiz, to'liq
                    oq fon. Fokus holatida yupqa ko'k-binafsha gradient nur
                    (AI xarakteri) uyg'onadi, aks holda tinch va neytral. */}
                <div className="group relative mx-auto w-full">
                  <div className="pointer-events-none absolute -inset-px rounded-none bg-gradient-to-r from-[#2563eb] via-[#4f7df0] to-[#7c6ef0] opacity-0 blur-[6px] transition-opacity duration-300 group-focus-within:opacity-40 md:-inset-[3px] md:rounded-[28px] md:blur-md" />

                  <div className="relative w-full border-t border-[var(--kpk-border)] bg-[var(--kpk-surface-solid)] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-6px_24px_rgba(15,23,42,0.06)] transition-shadow duration-300 sm:p-3.5 md:rounded-[28px] md:border md:pb-3.5 md:shadow-[0_10px_36px_rgba(15,23,42,0.10)] md:group-focus-within:shadow-[0_14px_40px_rgba(37,99,235,0.16)]">
                    {/* Yupqa gradient chiziq — AI panelini imzolaydi */}
                    <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#2563eb]/40 to-transparent md:inset-x-8" />

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

          <div className="flex items-end gap-1.5 sm:gap-2">
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

            {/* Fayl biriktirish faqat matn rejimida mantiqli */}
            {!imageMode && (
              <Button
                variant="ghost"
                size="icon"
                className="size-10 shrink-0 rounded-2xl sm:size-11"
                onClick={() => fileRef.current?.click()}
                aria-label={t("aiAttach")}
                title={t("aiAttachHint")}
              >
                <Paperclip className="size-[18px] sm:size-5" />
              </Button>
            )}

            {/* Rasm chizish rejimi */}
            <Button
              variant={imageMode ? "gradient" : "ghost"}
              size="icon"
              className="size-10 shrink-0 rounded-2xl sm:size-11"
              aria-pressed={imageMode}
              aria-label={t("aiImageMode")}
              title={t("aiImageMode")}
              onClick={() => {
                const next = !imageMode;
                setImageMode(next);
                if (next) {
                  setAttachments([]);
                  kpkToast.info(t("aiImageOn"), t("aiImageOnText"), "check");
                }
              }}
            >
              <ImagePlus className="size-[18px] sm:size-5" />
            </Button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit(input);
                }
              }}
              onPaste={(event) => {
                // Rasm nusxalab qo'yilsa uni ham biriktiramiz
                const files = event.clipboardData?.files;
                if (files && files.length > 0) void addFiles(files);
              }}
              rows={1}
              placeholder={imageMode ? t("aiImagePlaceholder") : t("aiPlaceholder")}
              aria-label={imageMode ? t("aiImagePlaceholder") : t("aiPlaceholder")}
              className="kpk-scroll min-h-10 flex-1 resize-none bg-transparent px-1.5 py-2 text-[14px] leading-relaxed text-[var(--kpk-text)] outline-none placeholder:text-[var(--kpk-muted)] sm:min-h-11 sm:px-2 sm:py-2.5 sm:text-[15px]"
            />

            {isStreaming ? (
              <Button
                variant="secondary"
                size="icon"
                className="size-10 shrink-0 rounded-2xl sm:size-11"
                onClick={stop}
                aria-label={t("aiThinking")}
              >
                <Square className="size-4 fill-current" />
              </Button>
            ) : (
              <Button
                variant="gradient"
                size="icon"
                className="size-10 shrink-0 rounded-2xl transition-transform active:scale-95 sm:size-11"
                onClick={() => submit(input)}
                disabled={!canSend}
                aria-label={t("aiSend")}
              >
                <ArrowUp className="size-[18px] sm:size-5" strokeWidth={2.5} />
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 px-3 pt-1">
            <p className="text-xs text-[var(--kpk-muted)]">{t("aiHint")}</p>

            {!isEmpty && (
              <button
                type="button"
                onClick={clearChat}
                aria-label={t("aiClear")}
                title={t("aiClear")}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-[var(--kpk-muted)] transition-colors hover:bg-[var(--kpk-danger-bg)] hover:text-[var(--kpk-danger-fg)] max-md:p-2"
              >
                <Trash2 className="size-3.5" />
                <span className="max-md:hidden">{t("aiClear")}</span>
              </button>
            )}
          </div>
                  </div>
                </div>
              </div>
            </>,
            document.body
          )}
      </div>

      {/* ── RASMNI TO'LIQ EKRANDA KO'RISH ── */}
      <Dialog open={lightbox !== null} onOpenChange={(open) => !open && setLightbox(null)}>
        <DialogContent className="w-[min(900px,calc(100vw-32px))] max-w-none rounded-[24px] p-4">
          <DialogTitle className="sr-only">{t("aiImageResult")}</DialogTitle>

          {lightbox && (
            <div className="space-y-3">
              <Image
                src={lightbox}
                alt={t("aiImageResult")}
                width={1024}
                height={1024}
                unoptimized
                className="max-h-[72vh] w-full rounded-2xl object-contain"
              />

              <div className="flex justify-center">
                <Button variant="outline" size="lg" onClick={() => downloadImage(lightbox)}>
                  <Download className="size-4" />
                  {t("aiImageDownload")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}