"use client";

import * as React from "react";

import { EmblemLogo } from "@/components/emblem-logo";
import { useLanguage } from "@/i18n/language-provider";

/**
 * Sahifa yuklanish ekrani.
 * Original script.js dagi 900 ms kechikish saqlab qolingan.
 */
export function LoaderScreen({ delay = 900 }: { delay?: number }) {
  const { t } = useLanguage();
  const [hidden, setHidden] = React.useState(false);
  const [removed, setRemoved] = React.useState(false);

  React.useEffect(() => {
    const hideTimer = window.setTimeout(() => setHidden(true), delay);
    // Fade tugagach DOM'dan olib tashlaymiz — ortiqcha qatlam qolmaydi.
    const removeTimer = window.setTimeout(() => setRemoved(true), delay + 700);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(removeTimer);
    };
  }, [delay]);

  if (removed) return null;

  return (
    <div className="kpk-loader" data-hidden={hidden} role="status" aria-live="polite">
      <div className="kpk-card relative z-[2] w-[min(360px,calc(100vw-32px))] rounded-[28px] p-[34px_28px] text-center">
        <div className="kpk-loader-logo mx-auto mb-[18px] flex size-[118px] items-center justify-center rounded-full border border-[var(--kpk-border)] bg-[var(--kpk-surface-solid)] shadow-[var(--kpk-shadow)]">
          <EmblemLogo size={86} priority className="size-[86px] object-contain" />
        </div>

        <h1 className="mb-2 text-[25px] font-extrabold text-[var(--kpk-primary)]">KPK Platform</h1>
        <p className="mb-5 text-[15px] text-[var(--kpk-muted)]">{t("loadingText")}</p>

        <div className="kpk-loader-line h-2 w-full overflow-hidden rounded-full bg-[var(--kpk-track)]">
          <span />
        </div>
      </div>
    </div>
  );
}