"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ClipboardCheck,
  Gauge,
  Layers,
  MessageSquare,
  Sparkles,
  Trophy,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { DashboardShell } from "@/components/dashboard-shell";
import { ModuleGateDialog } from "@/components/module-gate-dialog";
import { MODULES, ModuleCard } from "@/components/module-card";
import { StatTile } from "@/components/stat-tile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/i18n/language-provider";
import type { Dictionary } from "@/i18n/dictionaries";
import { MODULE_COUNT, STORAGE_KEYS } from "@/lib/constants";
import { getUnlockedCount, isModuleUnlocked } from "@/lib/progress";
import { getStoredProgress } from "@/lib/storage";
import type { KpkProgress } from "@/lib/types";

const LEVEL_KEYS: Record<number, keyof Dictionary> = {
  1: "levelBeginner",
  2: "levelIntermediate",
  3: "levelAdvanced",
  4: "levelMaster",
};

function countAiMessages(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.aiChat);
    return raw ? (JSON.parse(raw) as unknown[]).length : 0;
  } catch {
    return 0;
  }
}

/**
 * Dashboard — asosiy sahifa.
 *
 * Tuzilishi:
 *   1. Hero — salomlashish va ikkita asosiy harakat
 *   2. Statistika plitkalari — ochiq bo'limlar, test, daraja, AI suhbati
 *   3. AI yordamchi banneri — beshinchi bo'lim
 *   4. O'quv bo'limlari tarmog'i
 *
 * Baholash testi majburiy emas: topshirilmagan bo'lsa barcha bo'limlar ochiq.
 */
export function DashboardView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { user, isLoading } = useAuth();

  const [progress, setProgress] = React.useState<KpkProgress | null>(null);
  const [aiMessages, setAiMessages] = React.useState(0);
  /** Qulflangan qaysi bo'lim bosilgani — modal shunga qarab ochiladi. */
  const [gateModule, setGateModule] = React.useState<number | null>(null);

  /** Progressni localStorage'dan qayta o'qiydi — test modal ichida
      yakunlangach chaqiriladi, shunda ochilgan bo'limlar darhol ko'rinadi. */
  const refresh = React.useCallback(() => {
    setProgress(getStoredProgress());
    setAiMessages(countAiMessages());
  }, []);

  React.useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/");
      return;
    }

    refresh();
  }, [isLoading, user, router, refresh]);

  /* Sidebar'dagi "Baholash testi" havolasi /dashboard?test=1 ga
     olib keladi — shunda modal darhol ochiladi. */
  React.useEffect(() => {
    if (searchParams.get("test") === "1") setGateModule(1);
  }, [searchParams]);

  const testResult = progress?.initialTest;
  const hasTest = testResult?.completed === true;
  const percent = testResult?.percent ?? 0;

  const unlockedCount = getUnlockedCount(percent, hasTest);
  const levelKey = hasTest ? LEVEL_KEYS[progress?.maxLevel ?? 1] : undefined;
  const firstName = user?.name?.split(/\s+/)[0] ?? "";

  return (
    <DashboardShell
      user={user}
      title={t("dashboardTitle")}
      subtitle={user ? t("overviewGreeting", { name: firstName }) : t("welcomeDashboard")}
    >
      {progress ? (
        <div className="space-y-7">
          {/* ═══ 1. HERO ═══ */}
          <section className="kpk-card relative overflow-hidden rounded-[32px] p-8 max-md:p-6">
            {/* Yumshoq rangli yorug'lik — kartochkaga chuqurlik beradi */}
            <div
              className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-[radial-gradient(circle,rgba(0,183,255,0.22),transparent_70%)] blur-2xl"
              aria-hidden
            />

            <div className="relative flex items-end justify-between gap-8 max-lg:flex-col max-lg:items-start max-lg:gap-6">
              <div className="min-w-0">
                <h2 className="mb-2.5 text-[32px] font-black leading-tight text-[var(--kpk-primary)] max-md:text-2xl">
                  {t("heroTitle")}
                </h2>
                <p className="max-w-[62ch] text-base leading-relaxed text-[var(--kpk-muted)]">
                  {t("heroText")}
                </p>
              </div>

              <div className="flex shrink-0 gap-3 max-md:w-full max-md:flex-col">
                <Button asChild variant="gradient" size="xl" className="rounded-2xl max-md:w-full">
                  <Link href="/ai">
                    <Sparkles className="size-5" />
                    {t("navAi")}
                  </Link>
                </Button>

                <Button asChild variant="outline" size="xl" className="rounded-2xl max-md:w-full">
                  <Link href="/assessment">
                    <ClipboardCheck className="size-5" />
                    {hasTest ? t("retakeTest") : t("startTest")}
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* ═══ 2. STATISTIKA ═══ */}
          <section className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
            <StatTile
              icon={Layers}
              label={t("statOpenModules")}
              value={`${unlockedCount} / ${MODULE_COUNT}`}
              accent="from-[#38bdf8] to-[#0d6efd]"
            />
            <StatTile
              icon={Gauge}
              label={t("statTestScore")}
              value={hasTest ? `${percent}%` : t("statNotTaken")}
              accent="from-[#34d399] to-[#059669]"
            />
            <StatTile
              icon={Trophy}
              label={t("statLevel")}
              value={levelKey ? t(levelKey) : t("levelUnknown")}
              accent="from-[#fbbf24] to-[#d97706]"
            />
            <StatTile
              icon={MessageSquare}
              label={t("statAiChats")}
              value={`${aiMessages} ${t("statMessages")}`}
              accent="from-[#f472b6] to-[#d63384]"
            />
          </section>

          {/* ═══ 3. AI YORDAMCHI BANNERI ═══ */}
          <section className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(120deg,#16233b,#21466d_55%,#0d6efd)] p-8 max-md:p-6">
            <div
              className="pointer-events-none absolute -bottom-24 -right-12 size-72 rounded-full bg-[radial-gradient(circle,rgba(0,183,255,0.5),transparent_65%)] blur-3xl"
              aria-hidden
            />

            <div className="relative flex items-center justify-between gap-8 max-lg:flex-col max-lg:items-start max-lg:gap-6">
              <div className="flex min-w-0 items-start gap-5 max-md:flex-col max-md:gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-3xl bg-white/12 text-white ring-1 ring-white/25 backdrop-blur">
                  <Sparkles className="size-8" />
                </div>

                <div className="min-w-0">
                  <h2 className="mb-2 text-2xl font-black leading-tight text-white max-md:text-xl">
                    {t("aiCardTitle")}
                  </h2>
                  <p className="max-w-[60ch] text-[15px] leading-relaxed text-white/70">
                    {t("aiCardText")}
                  </p>
                </div>
              </div>

              <Button
                asChild
                size="xl"
                variant="ghost"
                // Banner doim to'q ko'k, shuning uchun matn rangi qat'iy — mavzuga bog'liq emas
                className="shrink-0 rounded-2xl bg-white text-[#1b3a63] hover:bg-white/90 max-md:w-full"
              >
                <Link href="/ai">
                  {t("aiCardAction")}
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
            </div>
          </section>

          {/* ═══ 4. BO'LIMLAR ═══ */}
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-extrabold text-[var(--kpk-primary)]">
                {t("sectionModules")}
              </h2>
              <p className="text-[15px] text-[var(--kpk-muted)]">{t("sectionModulesText")}</p>
            </div>

            <div className="grid grid-cols-4 gap-5 max-xl:grid-cols-2 max-sm:grid-cols-1">
              {MODULES.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  unlocked={isModuleUnlocked(module.id, percent, hasTest)}
                  onLockedClick={setGateModule}
                />
              ))}
            </div>
          </section>
          {/* Qulflangan bo'lim bosilganda chiqadigan modal */}
          <ModuleGateDialog
            moduleId={gateModule}
            hasTest={hasTest}
            percent={percent}
            attempt={testResult?.attempt}
            onOpenChange={(open) => {
              if (open) return;
              setGateModule(null);
              // Manzildan ?test=1 ni olib tashlaymiz — aks holda
              // sahifa yangilanganda modal yana ochilardi.
              if (searchParams.get("test") === "1") router.replace("/dashboard");
            }}
            onCompleted={refresh}
          />
        </div>
      ) : (
        /* ── Yuklanish holati ── */
        <div className="space-y-7">
          <Skeleton className="h-[172px] rounded-[32px]" />
          <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-[76px] rounded-3xl" />
            ))}
          </div>
          <Skeleton className="h-[164px] rounded-[32px]" />
          <div className="grid grid-cols-4 gap-5 max-xl:grid-cols-2 max-sm:grid-cols-1">
            {MODULES.map((module) => (
              <Skeleton key={module.id} className="h-[380px] rounded-[28px]" />
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}