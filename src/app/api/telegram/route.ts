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

type Action = "LOGIN" | "LOGOUT";

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
}

/** Telegram HTML rejimida xavfli belgilarni ekranlaydi. */
function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildMessage(payload: TelegramPayload): string {
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

  if (payload.action !== "LOGIN" && payload.action !== "LOGOUT") {
    return NextResponse.json({ ok: false, reason: "invalid-action" }, { status: 400 });
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
