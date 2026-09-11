"use client";

import { STORAGE_KEYS } from "@/lib/constants";
import type { KpkProgress, KpkUser } from "@/lib/types";

/* ══════════════════════════════════════════════════════════════
   localStorage bilan xavfsiz ishlash. SSR paytida window mavjud
   emas, shuning uchun har bir funksiya himoyalangan.
══════════════════════════════════════════════════════════════ */

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* kvota to'lgan bo'lsa jim o'tamiz */
  }
}

export function getStoredUser(): KpkUser | null {
  return readJson<KpkUser>(STORAGE_KEYS.user);
}

export function setStoredUser(user: KpkUser): void {
  writeJson(STORAGE_KEYS.user, user);
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.user);
}

export function getStoredProgress(): KpkProgress {
  return readJson<KpkProgress>(STORAGE_KEYS.progress) ?? {};
}

export function setStoredProgress(progress: KpkProgress): void {
  writeJson(STORAGE_KEYS.progress, progress);
}

export function clearStoredProgress(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.progress);
}

export function isAssessmentCompleted(progress?: KpkProgress): boolean {
  const value = progress ?? getStoredProgress();
  return value.initialTest?.completed === true;
}
