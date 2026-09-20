"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Crown,
  Lock,
  Star,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/language-provider";
import type { Dictionary } from "@/i18n/dictionaries";
import { MODULE_THRESHOLDS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ModuleMeta {
  id: number;
  icon: LucideIcon;
  badgeLabel: string;
  titleKey: keyof Dictionary;
  descKey: keyof Dictionary;
  /** Kartochkaning yuqori chekkasidagi rangli chiziq va ikonka foni. */
  accent: string;
  /** Nishon (badge) ranglari. */
  chip: string;
}

/** To'rt bo'lim — har biri o'z rang oilasiga ega, daraja o'sishi ko'rinib turadi. */
export const MODULES: ModuleMeta[] = [
  {
    id: 1,
    icon: BookOpen,
    badgeLabel: "BEGINNER",
    titleKey: "module1Title",
    descKey: "module1Desc",
    accent: "from-[#34d399] to-[#059669]",
    chip: "bg-[var(--kpk-ok-bg)] text-[var(--kpk-ok-fg)]",
  },
  {
    id: 2,
    icon: TrendingUp,
    badgeLabel: "INTERMEDIATE",
    titleKey: "module2Title",
    descKey: "module2Desc",
    accent: "from-[#fbbf24] to-[#d97706]",
    chip: "bg-[var(--kpk-warn-bg)] text-[var(--kpk-warn-fg)]",
  },
  {
    id: 3,
    icon: Star,
    badgeLabel: "ADVANCED",
    titleKey: "module3Title",
    descKey: "module3Desc",
    accent: "from-[#38bdf8] to-[#0d6efd]",
    chip: "bg-[var(--kpk-info-bg)] text-[var(--kpk-info-fg)]",
  },
  {
    id: 4,
    icon: Crown,
    badgeLabel: "MASTER",
    titleKey: "module4Title",
    descKey: "module4Desc",
    accent: "from-[#f472b6] to-[#d63384]",
    chip: "bg-[var(--kpk-pink-bg)] text-[var(--kpk-pink-fg)]",
  },
];

interface ModuleCardProps {
  module: ModuleMeta;
  unlocked: boolean;
  /** Qulflangan kartochka bosilganda chaqiriladi — dashboard
      modal oynani ochadi. Berilmasa kartochka shunchaki jim turadi. */
  onLockedClick?: (moduleId: number) => void;
}

export function ModuleCard({ module, unlocked, onLockedClick }: ModuleCardProps) {
  const { t } = useLanguage();
  const Icon = module.icon;
  const threshold = MODULE_THRESHOLDS[module.id] ?? 0;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[28px] kpk-card transition-all duration-300",
        unlocked
          ? "hover:-translate-y-1"
          : "shadow-none"
      )}
    >
      {/* Yuqori rangli chiziq — daraja rangini bildiradi */}
      <div className={cn("h-1.5 w-full bg-gradient-to-r", module.accent)} aria-hidden />

      <div className="p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300",
              module.accent,
              unlocked && "group-hover:scale-105"
            )}
          >
            <Icon className="size-7" strokeWidth={2.2} />
          </div>

          <span
            className={cn(
              "rounded-full px-3 py-1.5 text-[11px] font-black tracking-wider",
              module.chip
            )}
          >
            {module.badgeLabel}
          </span>
        </div>

        {/* Bo'lim raqami nozik fon sifatida — ketma-ketlikni ko'rsatadi */}
        <span
          className="pointer-events-none absolute right-5 top-16 text-[80px] font-black leading-none text-[var(--kpk-track)] opacity-60"
          aria-hidden
        >
          {module.id}
        </span>

        <h3 className="mb-1.5 text-2xl font-black text-[var(--kpk-primary)]">
          {t(module.titleKey)}
        </h3>

        <p className="mb-5 min-h-10 text-[15px] leading-relaxed text-[var(--kpk-muted)]">
          {unlocked ? t(module.descKey) : t("moduleLockedHint", { percent: threshold })}
        </p>

        {/* Progress — hozircha darslar qo'shilmagani uchun 0% */}
        <div className="mb-5">
          <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-[var(--kpk-muted)]">
            <span>{t("moduleProgress")}</span>
            <span>0%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--kpk-track)]">
            <div className={cn("h-full rounded-full bg-gradient-to-r", module.accent)} style={{ width: "0%" }} />
          </div>
        </div>

        {unlocked ? (
          <Button asChild variant="gradient" size="lg" className="w-full rounded-2xl">
            <Link href={`/modules/${module.id}`}>
              {t("moduleStart")}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        ) : (
          <Button
            variant="soft"
            size="lg"
            className="w-full rounded-2xl bg-[var(--kpk-track)] text-[var(--kpk-muted)]"
            onClick={() => onLockedClick?.(module.id)}
          >
            <Lock className="size-4" />
            {t("moduleLocked")}
          </Button>
        )}
      </div>

      {/* Qulf qoplamasi butun kartochkani yopadi va bosiladi —
          shunda foydalanuvchi nima qilish kerakligini biladi. */}
      {unlocked ? null : (
        <button
          type="button"
          onClick={() => onLockedClick?.(module.id)}
          aria-label={`${t(module.titleKey)} — ${t("moduleLocked")}`}
          className="absolute inset-0 flex items-center justify-center bg-[var(--kpk-surface)] backdrop-blur-[3px] transition-colors hover:bg-[var(--kpk-surface-solid)]/70"
        >
          <span className="flex size-16 items-center justify-center rounded-2xl bg-[var(--kpk-surface-solid)] shadow-lg transition-transform duration-200 hover:scale-105">
            <Lock className="size-7 text-[var(--kpk-muted)]" strokeWidth={2} />
          </span>
        </button>
      )}
    </article>
  );
}