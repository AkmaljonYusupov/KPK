"use client";

import { Check, ChevronDown } from "lucide-react";

import { FlagIcon } from "@/components/flag-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMounted } from "@/hooks/use-mounted";
import { LANGUAGE_META, LANGUAGES, type Language } from "@/i18n/dictionaries";
import { useLanguage } from "@/i18n/language-provider";
import { cn } from "@/lib/utils";

/**
 * Til tanlagich.
 *
 * Tanlangan til localStorage'da saqlanadi, ya'ni server uni bilmaydi.
 * Shuning uchun mount bo'lgunicha oddiy (Radix'siz) o'rin egallovchi
 * chiziladi — shunda server va klient HTML'i bir xil bo'ladi va
 * hydration ogohlantirishi chiqmaydi.
 */
export function LanguageSwitcher({
  variant = "login",
}: {
  variant?: "login" | "dashboard";
}) {
  const { lang, setLang, t } = useLanguage();
  const mounted = useMounted();

  const isDashboard = variant === "dashboard";

  const triggerClass = cn(
    "flex items-center justify-between gap-2.5 font-extrabold text-[var(--kpk-primary)] transition-colors outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    // Zaxira dark: sinflari — CSS o'zgaruvchisi yetib kelmasa ham to'q qoladi
    "dark:border-white/10 dark:bg-[#18233a] dark:text-[#e8f0fd]",
    isDashboard &&
      "h-[52px] min-w-[110px] rounded-2xl border border-[var(--kpk-border)] bg-[var(--kpk-surface-solid)] px-4 shadow-[var(--kpk-shadow-sm)]",
    !isDashboard &&
      "h-11 min-w-[104px] rounded-2xl border border-[var(--kpk-border)] bg-[var(--kpk-surface-solid)] px-3 shadow-[var(--kpk-shadow-sm)]"
  );

  // ── Mount bo'lgunicha: bir xil o'lchamdagi statik o'rin egallovchi ──
  if (!mounted) {
    return (
      <div className={triggerClass} aria-hidden>
        <span className="flex items-center gap-2.5">
          <span className="h-[18px] w-[27px] rounded-[3px] bg-[var(--kpk-track)]" />
          <span className="h-4 w-6 rounded bg-[var(--kpk-track)]" />
        </span>
        <ChevronDown className="size-4 text-[var(--kpk-muted)]" strokeWidth={2.5} />
      </div>
    );
  }

  const current = LANGUAGE_META[lang];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={t("languageLabel")} className={triggerClass}>
        <span className="flex items-center gap-2.5">
          <FlagIcon lang={lang} />
          <span>{current.label}</span>
        </span>
        <ChevronDown className="size-4 text-[var(--kpk-muted)]" strokeWidth={2.5} />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={isDashboard ? "w-[210px] rounded-[22px] p-2.5" : "w-44"}
      >
        {LANGUAGES.map((code: Language) => {
          const meta = LANGUAGE_META[code];
          const isActive = code === lang;

          return (
            <DropdownMenuItem
              key={code}
              onSelect={() => setLang(code)}
              className={cn(
                isDashboard && "h-[52px] rounded-[14px] px-3.5",
                isActive && "bg-[var(--kpk-accent-soft)] text-[var(--kpk-blue)]"
              )}
            >
              <FlagIcon lang={code} />
              <span className="flex-1">{meta.name}</span>
              {isActive && <Check className="size-4" strokeWidth={3} />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}