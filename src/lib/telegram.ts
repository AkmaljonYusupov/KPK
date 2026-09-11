"use client";

import type { KpkUser } from "@/lib/types";

/* ══════════════════════════════════════════════════════════════
   Telegram log — klient tomoni.
   Bot token bu yerda YO'Q. Faqat /api/telegram ga so'rov ketadi.
══════════════════════════════════════════════════════════════ */

export type TelegramAction = "LOGIN" | "LOGOUT";

export type TelegramResult = "sent" | "skipped" | "failed";

export async function sendTelegramLog(
  action: TelegramAction,
  user: KpkUser,
  language: string
): Promise<TelegramResult> {
  try {
    const response = await fetch("/api/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        user: {
          uid: user.uid,
          name: user.name,
          email: user.email,
          provider: user.provider,
        },
        page: typeof window !== "undefined" ? window.location.href : "",
        platform: typeof navigator !== "undefined" ? navigator.userAgent : "",
        language,
      }),
    });

    const data = (await response.json()) as { ok?: boolean; reason?: string };

    if (data.reason === "not-configured") return "skipped";
    return data.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}
