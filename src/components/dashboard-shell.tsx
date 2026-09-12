"use client";

import * as React from "react";
import { LogOut, Menu } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { PageBackground } from "@/components/page-background";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/i18n/language-provider";
import type { KpkUser } from "@/lib/types";
import { cn, getInitials } from "@/lib/utils";

interface DashboardShellProps {
  user: KpkUser | null;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

/**
 * Admin ko'rinishidagi karkas: chapda sidebar, o'ngda topbar + main.
 *
 *   ┌────────────┬────────────────────────────────┐
 *   │            │  topbar — FIXED, qimirlamaydi  │
 *   │  sidebar   ├────────────────────────────────┤
 *   │            │  main (sahifa tarkibi)         │
 *   └────────────┴────────────────────────────────┘
 *
 * Skroll sahifaning o'zida bo'ladi — ichki konteynerlar emas.
 * 1024px dan tor ekranlarda sidebar drawer sifatida ochiladi.
 */
export function DashboardShell({ user, title, subtitle, children }: DashboardShellProps) {
  const { t } = useLanguage();
  const { signOutUser } = useAuth();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <div className="relative min-h-screen">
      <PageBackground />

      {/* ── SIDEBAR: doimiy, faqat katta ekranlarda ── */}
      <aside className="kpk-bar fixed inset-y-0 left-0 z-30 hidden w-[280px] border-r lg:block">
        {user ? (
          <DashboardSidebar user={user} />
        ) : (
          <div className="space-y-3 p-5">
            <Skeleton className="h-11 w-full rounded-2xl" />
            <Skeleton className="h-9 w-full rounded-2xl" />
            <Skeleton className="h-9 w-full rounded-2xl" />
            <Skeleton className="h-9 w-full rounded-2xl" />
          </div>
        )}
      </aside>

      {/* ── ASOSIY USTUN ── */}
      <div className="relative z-[1] lg:pl-[280px]">
        {/* TOPBAR */}
        <header
          className={cn(
            // FIXED: sahifa skroll bo'lganda ham joyida qoladi.
            // Chap chekka sidebar kengligiga teng — u bilan ustma-ust tushmaydi.
            "kpk-bar fixed inset-x-0 top-0 z-20 flex min-h-[95px] items-center gap-4",
            "border-b px-8 py-4 max-md:px-4 lg:left-[280px]"
          )}
        >
          {/* Mobil menyu tugmasi */}
          {user && (
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger
                aria-label={t("navOpenMenu")}
                className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--kpk-border)] bg-[var(--kpk-surface-solid)] text-[var(--kpk-primary)] shadow-[var(--kpk-shadow-sm)] outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
              >
                <Menu className="size-5" />
              </SheetTrigger>

              <SheetContent hideClose>
                <SheetTitle className="sr-only">{t("navMenu")}</SheetTitle>
                <DashboardSidebar user={user} onNavigate={() => setDrawerOpen(false)} />
              </SheetContent>
            </Sheet>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[32px] font-black leading-tight text-[var(--kpk-primary)] max-md:text-2xl">
              {title}
            </h1>
            {subtitle && (
              <p className="truncate text-[15px] text-[var(--kpk-muted)] max-md:text-[13px]">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher variant="dashboard" />

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={t("profile")}
                  className="kpk-gradient flex size-[52px] items-center justify-center rounded-full p-[3px] shadow-[0_14px_35px_rgba(13,110,253,0.2)] outline-none transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 max-md:hidden"
                >
                  <Avatar className="size-full">
                    {user.image && <AvatarImage src={user.image} alt={user.name} />}
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-[300px] rounded-[26px] p-[15px]">
                  <div className="mb-3 flex items-center gap-3.5 rounded-[18px] bg-[var(--kpk-subtle)] p-3">
                    <Avatar className="size-[58px]">
                      {user.image && <AvatarImage src={user.image} alt={user.name} />}
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <h2 className="mb-0.5 truncate text-[17px] font-extrabold text-[var(--kpk-primary)]">
                        {user.name || t("defaultUserName")}
                      </h2>
                      <p className="truncate text-[13px] text-[var(--kpk-muted)]">
                        {user.email || t("defaultUserEmail")}
                      </p>
                      <Badge variant="provider" size="sm" className="mt-1.5">
                        {user.provider === "github" ? "GitHub" : "Google"}
                      </Badge>
                    </div>
                  </div>

                  <DropdownMenuItem
                    onSelect={() => void signOutUser()}
                    className="h-[50px] rounded-[15px] px-3.5 text-[var(--kpk-danger-fg)] focus:bg-[var(--kpk-danger-bg)] focus:text-[var(--kpk-danger-fg)]"
                  >
                    <LogOut className="size-[18px]" />
                    <span>{t("logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        {/* MAIN — fixed header o'rni pt bilan qoplanadi */}
        <main className="px-8 pb-8 pt-[119px] max-md:px-4 max-md:pb-5 max-md:pt-[111px]">
          {children}
        </main>
      </div>
    </div>
  );
}