"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Github, Layers, Lock, ShieldCheck, Sparkles, Target } from "lucide-react";

import { AuthDialog } from "@/components/auth-dialog";
import { useAuth } from "@/components/auth-provider";
import { EmblemLogo } from "@/components/emblem-logo";
import { GoogleIcon } from "@/components/icons";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LoaderScreen } from "@/components/loader-screen";
import { PageBackground } from "@/components/page-background";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/i18n/language-provider";
import type { AuthProviderName } from "@/lib/constants";

/**
 * Kirish sahifasi — rasmiy va vazmin ko'rinish.
 *
 * Tuzilishi: yuqorida sarlavha qatori, o'rtada ikki ustun
 * (chapda platforma haqida, o'ngda kirish paneli), pastda footer.
 * Ranglar mavzu o'zgaruvchilaridan olinadi — light va dark'da bir xil ishlaydi.
 */
export function LoginView() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, isLoading } = useAuth();

  const [dialogProvider, setDialogProvider] = React.useState<AuthProviderName | null>(null);
  const [year, setYear] = React.useState<number | null>(null);

  React.useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  React.useEffect(() => {
    if (isLoading || !user) return;
    router.replace("/dashboard");
  }, [isLoading, user, router]);

  const features = [
    { icon: Sparkles, title: t("featureAiTitle"), text: t("featureAiText") },
    { icon: Layers, title: t("featureModulesTitle"), text: t("featureModulesText") },
    { icon: Target, title: t("featureTestTitle"), text: t("featureTestText") },
  ];

  return (
    <>
      <LoaderScreen />
      <PageBackground />

      <div className="relative z-[2] flex min-h-screen flex-col">
        {/* ── SARLAVHA QATORI ── */}
        <header className="kpk-bar border-b">
          <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-4 px-10 py-4 max-xl:px-8 max-md:px-4 max-md:py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-[52px] items-center justify-center rounded-2xl border border-[var(--kpk-border)] bg-[var(--kpk-surface-solid)]">
                <EmblemLogo size={38} priority className="size-[38px] object-contain" />
              </div>

              <div className="min-w-0">
                <p className="text-[15px] font-extrabold leading-tight text-[var(--kpk-primary)]">
                  KPK Platform
                </p>
                <p className="truncate text-xs text-[var(--kpk-muted)] max-sm:hidden">
                  {t("sidebarTagline")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </header>

        {/* ── ASOSIY QISM ── */}
        <main className="mx-auto flex w-full max-w-[1320px] flex-1 items-center px-10 py-16 max-xl:px-8 max-lg:py-12 max-md:px-4 max-md:py-8">
          <div className="grid w-full grid-cols-[minmax(0,1.25fr)_minmax(380px,0.75fr)] items-center gap-16 max-xl:gap-12 max-lg:grid-cols-1 max-lg:gap-10">
            {/* ── CHAP: platforma haqida ── */}
            <section className="min-w-0">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--kpk-border)] bg-[var(--kpk-accent-soft)] py-1.5 pl-1.5 pr-3.5">
                <span className="kpk-gradient flex size-6 items-center justify-center rounded-full">
                  <Sparkles className="size-3.5 text-white" />
                </span>
                <span className="text-[13px] font-bold text-[var(--kpk-blue)]">
                  {t("heroPill")}
                </span>
              </div>

              <h1 className="mb-5 text-[clamp(30px,3.7vw,46px)] font-black leading-[1.14] tracking-tight text-[var(--kpk-primary)]">
                {t("heroLead")}
              </h1>

              <p className="mb-9 max-w-[64ch] text-[17px] leading-[1.75] text-[var(--kpk-muted)] max-md:text-base">
                {t("heroSub")}
              </p>

              {/* Imkoniyatlar: to'liq kenglikda, ustma-ust */}
                          {/* Imkoniyatlar: keng ekranda yonma-yon uch ustun, torroqda ustma-ust */}
              <ul className="flex w-full flex-wrap gap-4">
                {features.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <li
                      key={feature.title}
                      className="kpk-card flex min-w-[190px] flex-1 basis-0 flex-col gap-3.5 rounded-3xl px-6 py-6 transition-transform duration-200 hover:-translate-y-1 max-sm:min-w-full max-sm:flex-row max-sm:items-center max-sm:gap-4 max-sm:px-5 max-sm:py-4"
                    >
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--kpk-border)] bg-[var(--kpk-accent-soft)] text-[var(--kpk-blue)]">
                        <Icon className="size-[22px]" strokeWidth={2.2} />
                      </span>

                      <div className="min-w-0">
                        <p className="mb-1 text-[15px] font-extrabold leading-tight text-[var(--kpk-primary)]">
                          {feature.title}
                        </p>
                        <p className="text-[13.5px] leading-snug text-[var(--kpk-muted)]">
                          {feature.text}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* ── O'NG: kirish paneli ── */}
            <section className="kpk-card min-w-0 rounded-[28px] p-9 max-lg:mx-auto max-lg:w-full max-lg:max-w-[520px] max-md:p-6">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-5 flex size-[112px] items-center justify-center rounded-full border border-[var(--kpk-border)] bg-[var(--kpk-surface-solid)]">
                  <EmblemLogo size={78} priority className="size-[78px] object-contain" />
                </div>

                <h2 className="mb-2 text-[26px] font-black leading-tight text-[var(--kpk-primary)]">
                  {t("welcome")}
                </h2>
                <p className="mx-auto max-w-[38ch] text-[15px] leading-relaxed text-[var(--kpk-muted)]">
                  {t("authDesc")}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="xl"
                  className="h-14 w-full justify-center rounded-2xl text-[15px]"
                  onClick={() => setDialogProvider("google")}
                >
                  <GoogleIcon className="size-5 shrink-0 text-[#0d6efd]" />
                  {t("signInGoogle")}
                </Button>

                <Button
                  variant="outline"
                  size="xl"
                  className="h-14 w-full justify-center rounded-2xl text-[15px]"
                  onClick={() => setDialogProvider("github")}
                >
                  <Github className="size-5 shrink-0" />
                  {t("signInGithub")}
                </Button>
              </div>

              <Separator className="my-6" />

              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
                <span className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-[var(--kpk-muted)]">
                  <ShieldCheck className="size-4 shrink-0" />
                  {t("authSecure")}
                </span>
                <span className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-[var(--kpk-muted)]">
                  <Lock className="size-4 shrink-0" />
                  {t("authNoPassword")}
                </span>
              </div>
            </section>
          </div>
        </main>

        <footer className="border-t border-[var(--kpk-border)]">
          <p className="mx-auto w-full max-w-[1320px] px-10 py-5 text-center text-sm text-[var(--kpk-muted)] max-md:px-4">
            © {year ?? ""} KPK Platform
          </p>
        </footer>
      </div>

      <AuthDialog
        provider={dialogProvider}
        onOpenChange={(open) => !open && setDialogProvider(null)}
      />
    </>
  );
}