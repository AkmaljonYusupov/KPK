"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronsLeft,
  ChevronsRight,
  ClipboardCheck,
  LayoutDashboard,
  Lock,
  LogOut,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { EmblemLogo } from "@/components/emblem-logo";
import { MODULES } from "@/components/module-card";
import { useSidebar } from "@/components/sidebar-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useLanguage } from "@/i18n/language-provider";
import { isModuleUnlocked } from "@/lib/progress";
import { getStoredProgress } from "@/lib/storage";
import type { KpkUser } from "@/lib/types";
import { cn, getInitials } from "@/lib/utils";

interface DashboardSidebarProps {
  user: KpkUser;
  /** Mobil drawer'da havola bosilganda panelni yopish uchun. */
  onNavigate?: () => void;
  /** Mobil drawer'da panel doim to'liq — yig'ilish faqat desktopda. */
  forceExpanded?: boolean;
}

/** Bo'lim sarlavhasi: yozuv + qolgan joyni to'ldiruvchi ingichka chiziq. */
function SectionLabel({ children, collapsed }: { children: React.ReactNode; collapsed: boolean }) {
  // Yig'ilgan holatda yozuv sig'maydi — o'rniga qisqa ajratuvchi chiziq
  if (collapsed) {
    return <div className="mx-auto mb-2 h-px w-8 bg-[var(--kpk-border)]" aria-hidden />;
  }

  return (
    <div className="mb-2 flex items-center gap-2.5 px-3">
      <span className="text-[10.5px] font-black uppercase tracking-[0.12em] text-[var(--kpk-muted)]">
        {children}
      </span>
      <span className="h-px flex-1 bg-[var(--kpk-border)]" aria-hidden />
    </div>
  );
}

/**
 * Chap yon panel.
 *
 * Panel o'z fonini bermaydi (bg-transparent) — uni o'rab turgan
 * `kpk-bar` (desktop) yoki `SheetContent` (mobil) beradi.
 *
 * Qulflangan bo'limlar qulf belgisi bilan ko'rsatiladi va bosilmaydi:
 * ilgari ularni bosib, keyin dashboardga qaytarilardi — bu chalg'itardi.
 */
export function DashboardSidebar({
  user,
  onNavigate,
  forceExpanded = false,
}: DashboardSidebarProps) {
  const { collapsed: rawCollapsed, toggle } = useSidebar();
  const collapsed = forceExpanded ? false : rawCollapsed;

  const pathname = usePathname();
  const { t } = useLanguage();
  const { signOutUser } = useAuth();

  /* Qaysi bo'limlar ochiqligini bilish uchun test natijasi kerak.
     localStorage faqat brauzerda bor — shuning uchun mount'dan keyin. */
  const [unlocked, setUnlocked] = React.useState<Record<number, boolean>>({});

  React.useEffect(() => {
    const progress = getStoredProgress();
    const hasTest = progress.initialTest?.completed === true;
    const percent = progress.initialTest?.percent ?? 0;

    const next: Record<number, boolean> = {};
    for (const module of MODULES) {
      next[module.id] = isModuleUnlocked(module.id, percent, hasTest);
    }
    setUnlocked(next);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const mainLinks = [
    { href: "/dashboard", label: t("navOverview"), icon: LayoutDashboard, highlight: false },
    // AI yordamchi ajralib tursin — gradient ikonka bilan
    { href: "/ai", label: t("navAi"), icon: Sparkles, highlight: true },
    // Test alohida sahifada emas, dashboard ustidagi modalda ochiladi
    { href: "/dashboard?test=1", label: t("navAssessment"), icon: ClipboardCheck, highlight: false },
  ];

  /** Barcha havolalar uchun umumiy ko'rinish. */
  const linkClass = (active: boolean, locked = false) =>
    cn(
      "group relative flex h-[46px] items-center rounded-2xl text-sm font-bold transition-all duration-200",
      collapsed ? "w-[46px] justify-center px-0" : "gap-3 pl-3.5 pr-3",
      locked
        ? "cursor-not-allowed text-[var(--kpk-muted)] opacity-55"
        : active
          ? "bg-[var(--kpk-accent-soft)] text-[var(--kpk-blue)]"
          : cn(
            "text-[var(--kpk-text)] hover:bg-[var(--kpk-hover)]",
            !collapsed && "hover:translate-x-0.5"
          )
    );

  /** Faol havolaning chap chekkasidagi gradient indikator. */
  const Indicator = ({ active }: { active: boolean }) => (
    <span
      className={cn(
        "absolute left-0 top-1/2 w-1 -translate-y-1/2 rounded-r-full transition-all duration-200",
        active ? "kpk-gradient h-7 opacity-100" : "h-0 opacity-0"
      )}
      aria-hidden
    />
  );

  return (
    <div className="flex h-full flex-col bg-transparent">
      {/* ── LOGO ── */}
      <div
        className={cn(
          "flex items-center py-6",
          collapsed ? "flex-col gap-3 px-3" : "gap-3 px-5"
        )}
      >
        <div
          className={cn(
            "kpk-gradient flex shrink-0 items-center justify-center rounded-2xl p-[2px] shadow-[0_10px_24px_rgba(13,110,253,0.22)]",
            collapsed ? "size-11" : "size-[52px]"
          )}
        >
          <span className="flex size-full items-center justify-center rounded-[14px] bg-[var(--kpk-surface-solid)]">
            <EmblemLogo size={collapsed ? 30 : 36} className="object-contain" />
          </span>
        </div>

        {collapsed ? null : (
          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-extrabold leading-tight text-[var(--kpk-primary)]">
              KPK Platform
            </p>
            <p className="truncate text-xs text-[var(--kpk-muted)]">{t("sidebarTagline")}</p>
          </div>
        )}

        {/* Yig'ish/yoyish tugmasi — faqat desktopda */}
        {forceExpanded ? null : (
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? t("navExpand") : t("navCollapse")}
            title={collapsed ? t("navExpand") : t("navCollapse")}
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-xl",
              "text-[var(--kpk-muted)] transition-colors hover:bg-[var(--kpk-hover)] hover:text-[var(--kpk-blue)]",
              "outline-none focus-visible:ring-2 focus-visible:ring-[var(--kpk-blue)]"
            )}
          >
            {collapsed ? (
              <ChevronsRight className="size-[18px]" strokeWidth={2.4} />
            ) : (
              <ChevronsLeft className="size-[18px]" strokeWidth={2.4} />
            )}
          </button>
        )}
      </div>

      {/* ── NAVIGATSIYA ── */}
      {/* Yig'ilganda overflow OCHIQ qoldiriladi: aks holda panel
          chetidan chiqadigan tooltip kesilib qoladi. Yig'ilgan
          ro'yxat kalta, shuning uchun skroll kerak emas. */}
      <nav
        className={cn(
          "kpk-scroll flex-1 px-3 pb-4",
          collapsed ? "overflow-visible" : "overflow-y-auto"
        )}
        aria-label={t("navMenu")}
      >
        <SectionLabel collapsed={collapsed}>{t("navMain")}</SectionLabel>

        <ul className={cn("space-y-1", collapsed && "flex flex-col items-center")}>
          {mainLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);

            return (
              <li key={link.href}>
                <Tooltip label={collapsed ? link.label : undefined}>
                <Link
                  href={link.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={linkClass(active)}
                >
                  <Indicator active={active} />

                  {link.highlight ? (
                    <span className="kpk-gradient flex size-7 shrink-0 items-center justify-center rounded-[10px] text-white shadow-[0_6px_14px_rgba(13,110,253,0.28)]">
                      <Icon className="size-[15px]" strokeWidth={2.4} />
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-[10px] transition-colors",
                        active
                          ? "bg-[var(--kpk-blue)] text-white"
                          : "bg-[var(--kpk-subtle)] text-[var(--kpk-muted)] group-hover:text-[var(--kpk-blue)]"
                      )}
                    >
                      <Icon className="size-[15px]" strokeWidth={2.4} />
                    </span>
                  )}

                  {collapsed ? null : <span className="truncate">{link.label}</span>}
                </Link>
                </Tooltip>
              </li>
            );
          })}
        </ul>

        <div className="pt-5">
          <SectionLabel collapsed={collapsed}>{t("navLearning")}</SectionLabel>
        </div>

        <ul className={cn("space-y-1", collapsed && "flex flex-col items-center")}>
          {MODULES.map((module) => {
            const href = `/modules/${module.id}`;
            const active = isActive(href);
            const Icon = module.icon;
            // unlocked hali yuklanmagan bo'lsa ochiq deb hisoblaymiz —
            // aks holda sahifa yuklanishida hamma qulf bo'lib ko'rinadi.
            const open = unlocked[module.id] ?? true;

            const content = (
              <>
                <Indicator active={active} />

                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br text-white shadow-sm transition-transform duration-200",
                    module.accent,
                    !open && "grayscale",
                    open && "group-hover:scale-105"
                  )}
                >
                  <Icon className="size-[15px]" strokeWidth={2.4} />
                </span>

                {collapsed ? null : <span className="truncate">{t(module.titleKey)}</span>}

                {/* Yig'ilganda qulf ikonka ustida kichik nishon bo'lib chiqadi */}
                {open ? null : collapsed ? (
                  <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[var(--kpk-surface-solid)] ring-1 ring-[var(--kpk-border)]">
                    <Lock className="size-2.5" strokeWidth={3} aria-hidden />
                  </span>
                ) : (
                  <Lock className="ml-auto size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                )}
              </>
            );

            const label = collapsed
              ? `${t(module.titleKey)}${open ? "" : ` — ${t("moduleLocked")}`}`
              : undefined;

            return (
              <li key={module.id}>
                <Tooltip label={label}>
                  {open ? (
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={linkClass(active)}
                    >
                      {content}
                    </Link>
                  ) : (
                    <span
                      className={linkClass(false, true)}
                      aria-disabled
                      title={collapsed ? undefined : t("moduleLocked")}
                    >
                      {content}
                    </span>
                  )}
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── FOYDALANUVCHI ── */}
      <div className={cn("border-t border-[var(--kpk-border)] p-3", collapsed && "px-3")}>
        <Tooltip label={collapsed ? user.name : undefined}>
          <div
            className={cn(
              "mb-2 flex items-center rounded-2xl bg-[var(--kpk-subtle)]",
              collapsed ? "size-[46px] justify-center p-0" : "w-full gap-3 p-3"
            )}
          >
            <Avatar
              className={cn(
                "shrink-0 ring-2 ring-[var(--kpk-border)]",
                collapsed ? "size-8" : "size-10"
              )}
            >
              {user.image && <AvatarImage src={user.image} alt={user.name} />}
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>

            {collapsed ? null : (
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-[var(--kpk-primary)]">
                  {user.name}
                </p>
                <p className="truncate text-xs text-[var(--kpk-muted)]">{user.email}</p>
              </div>
            )}
          </div>
        </Tooltip>

        <Tooltip label={collapsed ? t("logout") : undefined}>
          <Button
            variant="ghost"
            className={cn(
              "h-11 rounded-2xl text-[var(--kpk-danger-fg)] hover:bg-[var(--kpk-danger-bg)]",
              collapsed ? "size-[46px] justify-center p-0" : "w-full justify-start gap-3 px-3.5"
            )}
            onClick={() => void signOutUser()}
            aria-label={t("logout")}
          >
            <LogOut className="size-[18px] shrink-0" />
            {collapsed ? null : t("logout")}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}