"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   AI javobini chiroyli ko'rsatish.

   Tashqi kutubxonasiz: ``` bloklari kod oynasiga, `matn` ichki
   kodga, **qalin** va - ro'yxatlar oddiy formatga aylanadi.
   Sintaksis bo'yash bir nechta keng tarqalgan til uchun qo'lda
   yozilgan — bu react-markdown + highlight.js dan ancha yengil
   va o'rnatishda muammo bermaydi.
══════════════════════════════════════════════════════════════ */

type Segment =
  | { kind: "text"; content: string }
  | { kind: "code"; content: string; lang: string };

/** Matnni ``` bloklari bo'yicha bo'laklarga ajratadi. */
function split(source: string): Segment[] {
  const segments: Segment[] = [];
  const fence = /```([\w+-]*)\n?([\s\S]*?)(?:```|$)/g;

  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = fence.exec(source)) !== null) {
    if (match.index > last) {
      segments.push({ kind: "text", content: source.slice(last, match.index) });
    }
    segments.push({
      kind: "code",
      lang: (match[1] || "").toLowerCase(),
      content: match[2].replace(/\n$/, ""),
    });
    last = fence.lastIndex;
  }

  if (last < source.length) {
    segments.push({ kind: "text", content: source.slice(last) });
  }

  return segments;
}

/* ── Sintaksis bo'yash ─────────────────────────────────────── */

const JS_KEYWORDS =
  "const|let|var|function|return|if|else|for|while|class|extends|new|import|from|export|default|async|await|try|catch|finally|throw|typeof|instanceof|switch|case|break|continue|this|super|null|undefined|true|false|interface|type|enum|implements|public|private|readonly";

const CSS_KEYWORDS = "important|media|keyframes|import|supports|charset|font-face";

const PY_KEYWORDS =
  "def|return|if|elif|else|for|while|class|import|from|as|with|try|except|finally|raise|lambda|None|True|False|and|or|not|in|is|pass|break|continue|async|await";

interface Rule {
  re: RegExp;
  cls: string;
}

/** Tilga qarab bo'yash qoidalarini tanlaydi.
 *  MUHIM: qoidalarda ushlab oluvchi guruh (…) bo'lmasligi kerak —
 *  ular birlashtirilgan regex'da guruh tartibini buzadi. */
function rulesFor(lang: string): Rule[] {
  if (["html", "xml", "svg", "vue"].includes(lang)) {
    return [
      { re: /&lt;!--[\s\S]*?--&gt;/g, cls: "kpk-tok-comment" },
      { re: /&lt;\/?[\w-]+/g, cls: "kpk-tok-tag" },
      { re: /[\w-]+(?==)/g, cls: "kpk-tok-attr" },
      { re: /"[^"]*"|'[^']*'/g, cls: "kpk-tok-string" },
    ];
  }

  if (["css", "scss", "less"].includes(lang)) {
    return [
      { re: /\/\*[\s\S]*?\*\//g, cls: "kpk-tok-comment" },
      { re: new RegExp(`@(?:${CSS_KEYWORDS})\\b`, "g"), cls: "kpk-tok-keyword" },
      { re: /"[^"]*"|'[^']*'/g, cls: "kpk-tok-string" },
      {
        re: /#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|%|s|ms|vh|vw)?\b/g,
        cls: "kpk-tok-number",
      },
      { re: /[\w-]+(?=\s*:)/g, cls: "kpk-tok-attr" },
    ];
  }

  if (["python", "py"].includes(lang)) {
    return [
      { re: /#[^\n]*/g, cls: "kpk-tok-comment" },
      { re: /"""[\s\S]*?"""|"[^"]*"|'[^']*'/g, cls: "kpk-tok-string" },
      { re: new RegExp(`\\b(?:${PY_KEYWORDS})\\b`, "g"), cls: "kpk-tok-keyword" },
      { re: /\b\d+(?:\.\d+)?\b/g, cls: "kpk-tok-number" },
    ];
  }

  if (lang === "json") {
    return [
      { re: /"[^"]*"(?=\s*:)/g, cls: "kpk-tok-attr" },
      { re: /"[^"]*"/g, cls: "kpk-tok-string" },
      { re: /\b(?:true|false|null)\b/g, cls: "kpk-tok-keyword" },
      { re: /\b-?\d+(?:\.\d+)?\b/g, cls: "kpk-tok-number" },
    ];
  }

  // JavaScript / TypeScript va boshqa C-oilasidagi tillar
  return [
    { re: /\/\/[^\n]*|\/\*[\s\S]*?\*\//g, cls: "kpk-tok-comment" },
    { re: /`[^`]*`|"[^"]*"|'[^']*'/g, cls: "kpk-tok-string" },
    { re: new RegExp(`\\b(?:${JS_KEYWORDS})\\b`, "g"), cls: "kpk-tok-keyword" },
    { re: /\b\d+(?:\.\d+)?\b/g, cls: "kpk-tok-number" },
    { re: /\b[A-Za-z_$][\w$]*(?=\()/g, cls: "kpk-tok-fn" },
  ];
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Kodni HTML'ga aylantiradi.
 *
 * Barcha qoidalar BITTA regex'ga birlashtiriladi va matn bir marta
 * o'tiladi. Ilgari qoidalar ketma-ket qo'llanardi va keyingi qoida
 * oldingisining natijasini buzib yuborardi (masalan raqam qoidasi
 * o'rin egallovchi indeksini ushlab olardi).
 */
function highlight(code: string, lang: string): string {
  const rules = rulesFor(lang);
  if (rules.length === 0) return escapeHtml(code);

  const escaped = escapeHtml(code);

  // Har bir qoidani alohida guruhga o'raymiz: qaysi guruh mos kelsa,
  // o'sha qoidaning sinfini qo'llaymiz.
  const combined = new RegExp(rules.map((rule) => `(${rule.re.source})`).join("|"), "g");

  return escaped.replace(combined, (match, ...groups) => {
    const index = groups.findIndex(
      (group, i) => i < rules.length && typeof group === "string" && group !== undefined
    );
    const cls = index >= 0 ? rules[index].cls : "";
    return cls ? `<span class="${cls}">${match}</span>` : match;
  });
}

/* ── Kod oynasi ────────────────────────────────────────────── */

/** Til nomiga qarab nuqta rangi — kod oynasiga xarakter beradi. */
const LANG_DOT: Record<string, string> = {
  js: "#f7df1e",
  jsx: "#f7df1e",
  javascript: "#f7df1e",
  ts: "#3178c6",
  tsx: "#3178c6",
  typescript: "#3178c6",
  html: "#e34f26",
  css: "#2965f1",
  scss: "#cf649a",
  json: "#8bc34a",
  python: "#3572a5",
  py: "#3572a5",
  sql: "#e38c00",
  bash: "#4eaa25",
  sh: "#4eaa25",
};

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = React.useState(false);

  const lines = React.useMemo(() => code.split("\n"), [code]);
  const dot = LANG_DOT[lang] ?? "#7c8aa5";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard ruxsati yo'q */
    }
  };

  return (
    <div className="kpk-code my-3.5 overflow-hidden rounded-2xl">
      {/* Sarlavha qatori — muharrir oynasi taassurotini beradi */}
      <div className="kpk-code-bar flex items-center justify-between gap-3 px-4 py-2.5">
        <span className="flex items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: dot }}
            aria-hidden
          />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8ea3c0]">
            {lang || "code"}
          </span>
        </span>

        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold text-[#8ea3c0] transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "OK" : "Copy"}
        </button>
      </div>

      {/* Qator raqamlari + kod. Ikkalasi bir xil leading'da, shuning
          uchun raqamlar kod qatorlariga aniq to'g'ri keladi. */}
      <div className="kpk-scroll overflow-x-auto">
        <div className="flex min-w-full">
          <div
            className="shrink-0 select-none border-r border-white/8 px-3 py-3.5 text-right font-mono text-[13px] leading-[1.7] text-[#4d5f7a]"
            aria-hidden
          >
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          <pre className="min-w-0 flex-1 px-4 py-3.5">
            <code
              className="block whitespace-pre font-mono text-[13px] leading-[1.7]"
              dangerouslySetInnerHTML={{ __html: highlight(code, lang) }}
            />
          </pre>
        </div>
      </div>
    </div>
  );
}

/* ── Oddiy matn: **qalin**, `kod`, ro'yxatlar, sarlavhalar ──── */

function renderInline(line: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*)/g;

  let last = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > last) parts.push(line.slice(last, match.index));

    const token = match[0];
    index += 1;

    if (token.startsWith("`")) {
      parts.push(
        <code
          key={`${keyPrefix}-c${index}`}
          className="kpk-inline-code rounded-md px-1.5 py-0.5 font-mono text-[13.5px]"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else {
      parts.push(<strong key={`${keyPrefix}-b${index}`}>{token.slice(2, -2)}</strong>);
    }

    last = pattern.lastIndex;
  }

  if (last < line.length) parts.push(line.slice(last));
  return parts;
}

function TextBlock({ content, idPrefix }: { content: string; idPrefix: string }) {
  const lines = content.split("\n");

  return (
    <>
      {lines.map((line, i) => {
        const key = `${idPrefix}-l${i}`;
        const trimmed = line.trim();

        if (trimmed === "") return <div key={key} className="h-2" />;

        // ## Sarlavha
        const heading = /^(#{1,4})\s+(.*)$/.exec(trimmed);
        if (heading) {
          return (
            <p key={key} className="mb-1 mt-3 font-extrabold text-[var(--kpk-primary)]">
              {renderInline(heading[2], key)}
            </p>
          );
        }

        // - yoki * ro'yxat
        const bullet = /^[-*]\s+(.*)$/.exec(trimmed);
        if (bullet) {
          return (
            <div key={key} className="flex gap-2 py-0.5">
              <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-[var(--kpk-blue)]" />
              <span>{renderInline(bullet[1], key)}</span>
            </div>
          );
        }

        // 1. raqamli ro'yxat
        const numbered = /^(\d+)\.\s+(.*)$/.exec(trimmed);
        if (numbered) {
          return (
            <div key={key} className="flex gap-2 py-0.5">
              <span className="shrink-0 font-bold text-[var(--kpk-blue)]">{numbered[1]}.</span>
              <span>{renderInline(numbered[2], key)}</span>
            </div>
          );
        }

        return (
          <p key={key} className="py-0.5">
            {renderInline(line, key)}
          </p>
        );
      })}
    </>
  );
}

export function MarkdownMessage({ content }: { content: string }) {
  const segments = React.useMemo(() => split(content), [content]);

  return (
    <div className="text-[15px] leading-relaxed">
      {segments.map((segment, i) =>
        segment.kind === "code" ? (
          <CodeBlock key={`s${i}`} code={segment.content} lang={segment.lang} />
        ) : (
          <TextBlock key={`s${i}`} content={segment.content} idPrefix={`s${i}`} />
        )
      )}
    </div>
  );
}