"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { useMounted } from "@/hooks/use-mounted";
import { useLanguage } from "@/i18n/language-provider";
import { cn } from "@/lib/utils";

/**
 * Light / dark almashtirgich.
 *
 * Bosilganda ikkita narsa bo'ladi:
 *   1. Quyosh va oy ikonkalari aylanib bir-biriga almashadi
 *   2. Tugma markazidan butun ekran bo'ylab doira kengayadi
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const mounted = useMounted();

  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const isDark = mounted && resolvedTheme === "dark";

  const handleClick = () => {
    const rect = buttonRef.current?.getBoundingClientRect();

    // Doira aynan tugma markazidan ochiladi.
    toggleTheme(
      rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : undefined
    );
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={t("themeToggle")}
      title={isDark ? t("themeLight") : t("themeDark")}
      onClick={handleClick}
      className={cn(
        "relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl",
        "border border-[var(--kpk-border)] bg-[var(--kpk-surface-solid)]",
        "transition-colors duration-300 hover:bg-[var(--kpk-hover)]",
        "dark:border-white/10 dark:bg-[#18233a]",
        "outline-none focus-visible:ring-2 focus-visible:ring-[var(--kpk-blue)] focus-visible:ring-offset-2",
        className
      )}
    >
      {/* Quyosh: yorug' rejimda markazda, qorong'ida aylanib chiqib ketadi */}
      <Sun
        className={cn(
          "absolute size-[19px] text-[#f0a01e] transition-all duration-500 ease-out",
          isDark
            ? "-translate-y-6 rotate-90 scale-50 opacity-0"
            : "translate-y-0 rotate-0 scale-100 opacity-100"
        )}
        strokeWidth={2.2}
      />

      {/* Oy: qorong'i rejimda markazda, yorug'da aylanib chiqib ketadi */}
      <Moon
        className={cn(
          "absolute size-[19px] text-[#8fb4ff] transition-all duration-500 ease-out",
          isDark
            ? "translate-y-0 rotate-0 scale-100 opacity-100"
            : "translate-y-6 -rotate-90 scale-50 opacity-0"
        )}
        strokeWidth={2.2}
      />
    </button>
  );
}