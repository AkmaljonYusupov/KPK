import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ══════════════════════════════════════════════════════════════
   TELEGRAM LOG — SERVER TOMONI

   MUHIM XAVFSIZLIK O'ZGARISHI:
   Original loyihada bot token brauzerdagi JavaScript ichida edi,
   ya'ni saytga kirgan har kim uni ko'rib, botni to'liq boshqara
   olardi. Bu yerda token faqat serverda qoladi va brauzerga
   hech qachon yuborilmaydi.
══════════════════════════════════════════════════════════════ */

type Action = "LOGIN" | "LOGOUT" | "TEST_RESULT";

/** Test natijasi bilan birga keladigan qo'shimcha ma'lumot. */
interface TestPayload {
  score: number;
  total: number;
  percent: number;
  /** Nechta bo'lim ochilgani. */
  unlocked: number;
  /** Nechanchi urinish. */
  attempt?: number;
  /** Qoida buzilishlari soni. */
  violations?: number;
  /** Chegaradan oshgani uchun avtomatik yakunlanganmi. */
  autoSubmitted?: boolean;
  /** Testga sarflangan vaqt (soniya). */
  duration?: number;
}

interface TelegramPayload {
  action: Action;
  user: {
    uid?: string;
    name?: string;
    email?: string;
    provider?: string;
  };
  page?: string;
  platform?: string;
  language?: string;
  test?: TestPayload;
}

/** Telegram HTML rejimida xavfli belgilarni ekranlaydi. */
function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Soniyani "12:34" ko'rinishiga keltiradi. */
function clock(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  return `${Math.floor(safe / 60)} daq ${safe % 60} son`;
}

/** Foizga qarab 10 bo'limli vizual shkala chizadi. */
function bar(percent: number): string {
  const filled = Math.round((Math.min(100, Math.max(0, percent)) / 100) * 10);
  return "█".repeat(filled) + "░".repeat(10 - filled);
}

/** Natijaga qarab baho belgisi. */
function grade(percent: number): string {
  if (percent >= 90) return "🏆 A'lo";
  if (percent >= 71) return "🥇 Yaxshi";
  if (percent >= 56) return "🥈 Qoniqarli";
  return "📕 Past";
}

function buildTestMessage(payload: TelegramPayload): string {
  const { user, test, language, platform } = payload;
  if (!test) return "";

  const time = new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });

  const lines = [
    "📝 <b>BILIMNI BAHOLASH TESTI</b>",
    "━━━━━━━━━━━━━━━━━━━━",
    "",
    `👤 <b>${escapeHtml(user.name ?? "—")}</b>`,
    `📧 <code>${escapeHtml(user.email ?? "—")}</code>`,
    "",
    `<code>${bar(test.percent)}</code>  <b>${test.percent}%</b>`,
    "",
    `✅ To'g'ri javob: <b>${test.score} / ${test.total}</b>`,
    `🎯 Baho: ${grade(test.percent)}`,
    `🔓 Ochilgan bo'limlar: <b>${test.unlocked} / 4</b>`,
  ];

  if (test.attempt) lines.push(`🔁 Urinish: <b>${test.attempt}</b>`);
  if (test.duration) lines.push(`⏱ Sarflangan vaqt: <b>${clock(test.duration)}</b>`);

  // Qoida buzilishlari — faqat bo'lsa ko'rsatiladi
  if (test.violations && test.violations > 0) {
    lines.push("", `⚠️ Qoida buzilishi: <b>${test.violations}</b>`);
  }

  if (test.autoSubmitted) {
    lines.push("🚫 <b>Avtomatik yakunlandi</b> (chegara oshib ketdi)");
  }

  lines.push("", "━━━━━━━━━━━━━━━━━━━━");
  lines.push(`🌍 Til: ${escapeHtml(language ?? "—")}`);
  lines.push(`📱 ${escapeHtml((platform ?? "—").slice(0, 80))}`);
  lines.push(`⏰ ${time}`);

  return lines.join("\n");
}

function buildMessage(payload: TelegramPayload): string {
  if (payload.action === "TEST_RESULT") return buildTestMessage(payload);

  const { action, user, page, platform, language } = payload;
  const header = action === "LOGIN" ? "✅ TIZIMGA KIRDI" : "🚪 TIZIMDAN CHIQDI";
  const time = new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });

  const rows = [
    `👤 Ism: ${escapeHtml(user.name ?? "—")}`,
    `📧 Email: ${escapeHtml(user.email ?? "—")}`,
    `🔐 Provider: ${escapeHtml(user.provider ?? "—")}`,
    `🆔 UID: ${escapeHtml(user.uid ?? "—")}`,
    `🌐 Sahifa: ${escapeHtml(page ?? "—")}`,
    `📱 Qurilma: ${escapeHtml(platform ?? "—")}`,
    `🌍 Til: ${escapeHtml(language ?? "—")}`,
    `⏰ Vaqt: ${time}`,
  ];

  return `<b>${header}</b>\n\n${rows.join("\n")}`;
}

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Token sozlanmagan bo'lsa — bu xato emas, shunchaki log o'chirilgan.
  if (!token || !chatId) {
    return NextResponse.json(
      { ok: false, reason: "not-configured" },
      { status: 200 }
    );
  }

  let payload: TelegramPayload;
  try {
    payload = (await request.json()) as TelegramPayload;
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid-json" }, { status: 400 });
  }

  const allowed: Action[] = ["LOGIN", "LOGOUT", "TEST_RESULT"];

  if (!allowed.includes(payload.action)) {
    return NextResponse.json({ ok: false, reason: "invalid-action" }, { status: 400 });
  }

  if (payload.action === "TEST_RESULT" && !payload.test) {
    return NextResponse.json({ ok: false, reason: "missing-test" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildMessage(payload),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      cache: "no-store",
    });

    const result = (await response.json()) as { ok?: boolean };

    if (!response.ok || !result.ok) {
      return NextResponse.json({ ok: false, reason: "telegram-rejected" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, reason: "network" }, { status: 502 });
  }
}