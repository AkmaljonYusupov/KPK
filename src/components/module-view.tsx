"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Construction } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { DashboardShell } from "@/components/dashboard-shell";
import { MODULES } from "@/components/module-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/i18n/language-provider";
import { isModuleUnlocked } from "@/lib/progress";
import { getStoredProgress } from "@/lib/storage";
import { cn } from "@/lib/utils";

/**
 * Bo'lim sahifasi.
 * Ochilmagan bo'limga to'g'ridan-to'g'ri URL orqali kirib bo'lmaydi —
 * foydalanuvchi dashboardga qaytariladi.
 *
 * Ikonka va nishon ranglari MODULES ro'yxatidan olinadi, qolgan
 * yuzalar mavzu o'zgaruvchilariga bog'langan.
 */
export function ModuleView({ moduleId }: { moduleId: number }) {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, isLoading } = useAuth();

  const [allowed, setAllowed] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/");
      return;
    }

    const progress = getStoredProgress();
    const hasTest = progress.initialTest?.completed === true;
    const percent = progress.initialTest?.percent ?? 0;

    // Test topshirilmagan bo'lsa barcha bo'limlar ochiq (test ixtiyoriy).
    if (!isModuleUnlocked(moduleId, percent, hasTest)) {
      router.replace("/dashboard");
      return;
    }

    setAllowed(true);
  }, [isLoading, user, moduleId, router]);

  const meta = MODULES.find((item) => item.id === moduleId);
  const Icon = meta?.icon;

  return (
    <DashboardShell
      user={user}
      title={meta ? t(meta.titleKey) : t("navModules")}
      subtitle={meta ? t(meta.descKey) : undefined}
    >
      <div className="mx-auto w-full max-w-4xl">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="size-4" />
            {t("moduleBack")}
          </Link>
        </Button>

        {allowed && meta ? (
          <article className="kpk-card rounded-[34px] p-10 max-md:p-6">
            <div className="mb-6 flex items-center gap-4">
              <div
                className={cn(
                  "flex size-[68px] shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br text-white shadow-lg",
                  meta.accent
                )}
              >
                {Icon ? <Icon className="size-8" strokeWidth={2.2} /> : null}
              </div>

              <div>
                <span
                  className={cn(
                    "mb-2 inline-block rounded-full px-3 py-1.5 text-[11px] font-black tracking-wider",
                    meta.chip
                  )}
                >
                  {meta.badgeLabel}
                </span>
                <h1 className="text-4xl font-black text-[var(--kpk-primary)] max-md:text-3xl">
                  {t(meta.titleKey)}
                </h1>
              </div>
            </div>

            <p className="mb-8 text-base text-[var(--kpk-muted)]">{t(meta.descKey)}</p>

            <div className="flex items-start gap-4 rounded-3xl border border-[var(--kpk-border)] bg-[var(--kpk-subtle)] p-6">
              <Construction className="mt-0.5 size-6 shrink-0 text-[var(--kpk-warn-fg)]" />
              <div>
                <h2 className="mb-1.5 text-lg font-bold text-[var(--kpk-primary)]">
                  {t("moduleComingSoon")}
                </h2>
                <p className="leading-relaxed text-[var(--kpk-muted)]">
                  {t("moduleComingSoonText")}
                </p>
              </div>
            </div>
          </article>
        ) : (
          <Skeleton className="h-[420px] rounded-[34px]" />
        )}
      </div>
    </DashboardShell>
  );
}