"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, LayoutDashboard, LogOut, Sparkles } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { EmblemLogo } from "@/components/emblem-logo";
import { MODULES } from "@/components/module-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/i18n/language-provider";
import type { KpkUser } from "@/lib/types";
import { cn, getInitials } from "@/lib/utils";

interface DashboardSidebarProps {
  user: KpkUser;
  /** Mobil drawer'da havola bosilganda panelni yopish uchun. */
  onNavigate?: () => void;
}

/**
 * Chap yon panel — admin ko'rinishidagi navigatsiya.
 * Havolalar ikki guruhga bo'lingan: asosiy va ta'lim bo'limlari.
 *
 * Panel o'z fonini bermaydi (bg-transparent) — uni o'rab turgan
 * `kpk-bar` (desktop) yoki `SheetContent` (mobil) beradi. Shu sababli
 * mavzu almashganda ikki qatlam bir-biriga qarshi ishlamaydi.
 */
export function DashboardSidebar({ user, onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { signOutUser } = useAuth();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const mainLinks = [
    { href: "/dashboard", label: t("navOverview"), icon: LayoutDashboard, highlight: false },
    // AI yordamchi ajralib tursin — gradient ikonka bilan
    { href: "/ai", label: t("navAi"), icon: Sparkles, highlight: true },
    { href: "/assessment", label: t("navAssessment"), icon: ClipboardCheck, highlight: false },
  ];

  return (
    <div className="flex h-full flex-col bg-transparent">
      {/* LOGO */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="kpk-gradient flex size-[52px] shrink-0 items-center justify-center rounded-2xl p-[2px] shadow-[0_10px_24px_rgba(13,110,253,0.22)]">
          <span className="flex size-full items-center justify-center rounded-[14px] bg-[var(--kpk-surface-solid)]">
            <EmblemLogo size={36} className="size-9 object-contain" />
          </span>
        </div>

        <div className="min-w-0">
          <p className="truncate text-[17px] font-extrabold leading-tight text-[var(--kpk-primary)]">
            KPK Platform
          </p>
          <p className="truncate text-xs text-[var(--kpk-muted)]">{t("sidebarTagline")}</p>
        </div>
      </div>

      <Separator />

      {/* NAVIGATSIYA */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={t("navMenu")}>
        <p className="px-3 pb-2 text-[11px] font-black uppercase tracking-wider text-[var(--kpk-muted)]">
          {t("navMain")}
        </p>

        <ul className="space-y-1">
          {mainLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-2xl py-2.5 pl-3 pr-3 text-sm font-bold transition-all",
                    active
                      ? "bg-[var(--kpk-accent-soft)] text-[var(--kpk-blue)]"
                      : "text-[var(--kpk-text)] hover:bg-[var(--kpk-hover)]"
                  )}
                >
                  {/* Faol havolaning chap chekkasidagi indikator */}
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full transition-all",
                      active ? "kpk-gradient opacity-100" : "opacity-0"
                    )}
                    aria-hidden
                  />

                  {link.highlight ? (
                    <span className="kpk-gradient flex size-[26px] shrink-0 items-center justify-center rounded-lg text-white shadow-[0_6px_14px_rgba(13,110,253,0.28)]">
                      <Icon className="size-4" strokeWidth={2.4} />
                    </span>
                  ) : (
                    <Icon className="size-[18px] shrink-0" />
                  )}

                  <span className="truncate">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="px-3 pb-2 pt-5 text-[11px] font-black uppercase tracking-wider text-[var(--kpk-muted)]">
          {t("navLearning")}
        </p>

        <ul className="space-y-1">
          {MODULES.map((module) => {
            const href = `/modules/${module.id}`;
            const active = isActive(href);
            const Icon = module.icon;

            return (
              <li key={module.id}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-3 rounded-2xl py-2.5 pl-3 pr-3 text-sm font-bold transition-all",
                    active
                      ? "bg-[var(--kpk-accent-soft)] text-[var(--kpk-blue)]"
                      : "text-[var(--kpk-text)] hover:bg-[var(--kpk-hover)]"
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full transition-all",
                      active ? "kpk-gradient opacity-100" : "opacity-0"
                    )}
                    aria-hidden
                  />

                  <span
                    className={cn(
                      "flex size-[26px] shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white",
                      module.accent
                    )}
                  >
                    <Icon className="size-4" strokeWidth={2.4} />
                  </span>

                  <span className="truncate">{t(module.titleKey)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator />

      {/* FOYDALANUVCHI */}
      <div className="p-3">
        <div className="mb-2 flex items-center gap-3 rounded-2xl bg-[var(--kpk-subtle)] p-3">
          <Avatar className="size-10 shrink-0">
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-[var(--kpk-primary)]">
              {user.name}
            </p>
            <p className="truncate text-xs text-[var(--kpk-muted)]">{user.email}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 rounded-2xl px-3 text-[var(--kpk-danger-fg)] hover:bg-[var(--kpk-danger-bg)]"
          onClick={() => void signOutUser()}
        >
          <LogOut className="size-[18px]" />
          {t("logout")}
        </Button>
      </div>
    </div>
  );
}