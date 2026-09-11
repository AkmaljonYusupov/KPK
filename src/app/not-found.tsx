"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageBackground } from "@/components/page-background";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/language-provider";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <>
      <PageBackground />

      <main className="relative z-[2] flex min-h-screen items-center justify-center p-6">
        <div className="kpk-card w-[min(520px,100%)] rounded-[28px] p-10 text-center">
          <p className="mb-3 text-[64px] font-black leading-none text-[var(--kpk-primary)]">404</p>
          <h1 className="mb-3 text-2xl font-extrabold text-[var(--kpk-primary)]">
            {t("notFoundTitle")}
          </h1>
          <p className="mb-8 leading-relaxed text-[var(--kpk-muted)]">{t("notFoundText")}</p>

          <Button asChild variant="gradient" size="xl">
            <Link href="/">
              <ArrowLeft className="size-5" />
              {t("notFoundAction")}
            </Link>
          </Button>
        </div>
      </main>
    </>
  );
}