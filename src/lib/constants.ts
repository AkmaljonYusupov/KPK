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

/** Bilimni baholash testi sozlamalari. */
export const ASSESSMENT = {
  /** 150 talik bazadan har safar tasodifiy shuncha savol tanlanadi. */
  questionCount: 15,
  /** Har bir savol uchun vaqt — 1 daqiqa. */
  questionSeconds: 60,
  /** Umumiy vaqt = savollar soni × savol vaqti. */
  get totalSeconds() {
    return this.questionCount * this.questionSeconds;
  },
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