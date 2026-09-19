/* ══════════════════════════════════════════════════════════════
   Umumiy konstantalar. localStorage kalitlari original loyiha
   bilan bir xil — eski foydalanuvchilar ma'lumoti yo'qolmaydi.
══════════════════════════════════════════════════════════════ */

export const STORAGE_KEYS = {
  user: "kpk-user",
  progress: "kpk-progress",
  lang: "kpk-lang",
  currentModule: "current-module",
  aiChat: "kpk-ai-chat",
  sidebar: "kpk-sidebar",
} as const;

/** Kirish testi sozlamalari (original assessment.js bilan bir xil). */
export const ASSESSMENT = {
  /** Umumiy vaqt — 20 daqiqa. */
  totalSeconds: 1200,
  /** Har bir savol uchun vaqt — 30 soniya. */
  questionSeconds: 30,
} as const;

/** Bo'limlarni ochish uchun kerakli minimal foiz. */
export const MODULE_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 56,
  3: 71,
  4: 90,
};

export const MODULE_COUNT = 4;

export const EMBLEM_URL =
  "https://upload.wikimedia.org/wikipedia/commons/7/77/Emblem_of_Uzbekistan.svg";

export type AuthProviderName = "google" | "github";