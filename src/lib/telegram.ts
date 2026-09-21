"use client";

import type { KpkUser } from "@/lib/types";

/* ══════════════════════════════════════════════════════════════
   Telegram log — klient tomoni.
   Bot token bu yerda YO'Q. Faqat /api/telegram ga so'rov ketadi.
══════════════════════════════════════════════════════════════ */

export type TelegramAction = "LOGIN" | "LOGOUT" | "TEST_RESULT";

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

/** Test natijasi bilan yuboriladigan ma'lumot. */
export interface TelegramTestPayload {
  score: number;
  total: number;
  percent: number;
  unlocked: number;
  attempt?: number;
  violations?: number;
  autoSubmitted?: boolean;
  /** Testga sarflangan vaqt (soniya). */
  duration?: number;
}

/**
 * Baholash testi natijasini Telegram botga yuboradi.
 *
 * Token serverda qoladi — bu funksiya faqat /api/telegram ga
 * murojaat qiladi, xuddi kirish/chiqish loglari kabi.
 */
export async function sendTelegramTestResult(
  user: KpkUser,
  test: TelegramTestPayload,
  language: string
): Promise<TelegramResult> {
  try {
    const response = await fetch("/api/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "TEST_RESULT",
        user: {
          uid: user.uid,
          name: user.name,
          email: user.email,
          provider: user.provider,
        },
        test,
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