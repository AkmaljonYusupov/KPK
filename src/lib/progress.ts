import { MODULE_COUNT, MODULE_THRESHOLDS } from "@/lib/constants";
import type { KpkProgress, ModuleState } from "@/lib/types";

/* ══════════════════════════════════════════════════════════════
   Test natijasidan bo'limlarni ochish mantiqi.
   Original chegaralar: 56% → 2-bo'lim, 71% → 3-bo'lim, 90% → 4.
══════════════════════════════════════════════════════════════ */

/**
 * Bo'lim ochiqmi?
 *
 * Baholash testi endi MAJBURIY: u topshirilmaguncha hech bir bo'lim
 * ochilmaydi. Foydalanuvchi qulflangan kartochkani bosganda modal
 * oyna chiqib, testga yo'naltiradi.
 *
 * Test topshirilgandan keyin foizga qarab chegaralar qo'llanadi:
 * 0% → 1-bo'lim, 56% → 2-bo'lim, 71% → 3-bo'lim, 90% → 4-bo'lim.
 */
export function isModuleUnlocked(
  moduleId: number,
  percent: number,
  hasTest = true
): boolean {
  const threshold = MODULE_THRESHOLDS[moduleId];
  if (threshold === undefined) return false;

  // Test topshirilmagan — hamma bo'lim yopiq.
  if (!hasTest) return false;

  return percent >= threshold;
}

export function getMaxLevel(percent: number): number {
  if (percent >= 90) return 4;
  if (percent >= 71) return 3;
  if (percent >= 56) return 2;
  return 1;
}

export function buildModuleStates(percent: number): Record<string, ModuleState> {
  const modules: Record<string, ModuleState> = {};
  for (let id = 1; id <= MODULE_COUNT; id += 1) {
    modules[String(id)] = { unlocked: isModuleUnlocked(id, percent), completed: false };
  }
  return modules;
}

export function buildProgress(params: {
  previous: KpkProgress;
  score: number;
  total: number;
  answers: (number | null)[];
}): KpkProgress {
  const { previous, score, total, answers } = params;
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;

  return {
    ...previous,
    initialTest: {
      score,
      percent,
      total,
      completed: true,
      answers,
      finishedAt: new Date().toISOString(),
    },
    maxLevel: getMaxLevel(percent),
    modules: buildModuleStates(percent),
  };
}

/** Nechta bo'lim ochiq. `hasTest` false bo'lsa — 0. */
export function getUnlockedCount(percent: number, hasTest = true): number {
  if (!hasTest) return 0;

  let count = 0;
  for (let id = 1; id <= MODULE_COUNT; id += 1) {
    if (isModuleUnlocked(id, percent)) count += 1;
  }
  return count;
}