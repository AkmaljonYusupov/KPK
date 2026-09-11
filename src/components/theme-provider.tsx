"use client";

import * as React from "react";
import { flushSync } from "react-dom";

/* ══════════════════════════════════════════════════════════════
   MAVZU (light / dark)

   Telegram'dagi kabi: qorong'iga o'tganda doira tugmadan boshlab
   kengayadi, yorug'ga qaytganda o'sha doira orqaga yig'iladi.
   Buning uchun brauzerning View Transitions API'si ishlatiladi.
   Qo'llab-quvvatlamaydigan brauzerlarda mavzu shunchaki almashadi.

   Animatsiyaning o'zi globals.css da e'lon qilingan. Bu yerda
   faqat doira markazi va radiusi CSS o'zgaruvchisi sifatida
   beriladi — shunda animatsiya birinchi kadridayoq boshlanadi.
══════════════════════════════════════════════════════════════ */

export type Theme = "light" | "dark" | "system";

/** Sahifa yuklanishida oq/qora "chaqnash" bo'lmasligi uchun <head> ga qo'yiladigan skript. */
export const THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('kpk-theme') || 'system';
    var dark = stored === 'dark' ||
      (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {}
})();
`;

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  /** Bosilgan nuqtani bersangiz, o'sha yerdan doira ochiladi. */
  toggleTheme: (origin?: { x: number; y: number }) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "kpk-theme";

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function apply(theme: Theme): "light" | "dark" {
  const dark = theme === "dark" || (theme === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  return dark ? "dark" : "light";
}

/** Brauzer doira effektini qo'llab-quvvatlaydimi? */
function supportsViewTransition(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof (document as Document & { startViewTransition?: unknown }).startViewTransition ===
      "function"
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial: Theme = stored ?? "system";
    setThemeState(initial);
    setResolvedTheme(apply(initial));
  }, []);

  // "system" tanlangan bo'lsa, tizim sozlamasi o'zgarishiga ergashamiz.
  React.useEffect(() => {
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolvedTheme(apply("system"));

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  const commit = React.useCallback((next: Theme) => {
    setThemeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    setResolvedTheme(apply(next));
  }, []);

  const setTheme = React.useCallback(
    (next: Theme) => {
      commit(next);
    },
    [commit]
  );

  const toggleTheme = React.useCallback(
    (origin?: { x: number; y: number }) => {
      const goingDark = resolvedTheme !== "dark";
      const next: Theme = goingDark ? "dark" : "light";

      // Doira effekti mumkin bo'lmasa — oddiy almashtirish.
      if (!origin || !supportsViewTransition() || prefersReducedMotion()) {
        commit(next);
        return;
      }

      const { x, y } = origin;
      const root = document.documentElement;

      // Doira ekranning eng uzoq burchagigacha yetishi kerak.
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      // Markaz va radiusni CSS'ga uzatamiz. Animatsiyaning o'zi
      // globals.css da e'lon qilingan — shuning uchun u o'tishning
      // birinchi kadridayoq boshlanadi va "qotib turgan kadr" bo'lmaydi.
      root.style.setProperty("--kpk-vt-x", `${x}px`);
      root.style.setProperty("--kpk-vt-y", `${y}px`);
      root.style.setProperty("--kpk-vt-r", `${radius}px`);

      // Yo'nalish CSS'ga qaysi animatsiya ishlashini aytadi:
      //   "in"  — qorong'iga o'tish, doira kengayadi
      //   "out" — yorug'ga qaytish, doira yig'iladi
      root.dataset.themeVt = goingDark ? "in" : "out";

      const transition = (
        document as Document & {
          startViewTransition: (cb: () => void) => { finished: Promise<void> };
        }
      ).startViewTransition(() => {
        // React holatini darhol qo'llaymiz — snapshot to'g'ri olinishi uchun.
        flushSync(() => commit(next));
      });

      // .finally — o'tish bekor bo'lsa ham atribut albatta tozalanadi.
      // Aks holda u sahifada qolib, barcha animatsiyalarni to'xtatib qo'yadi.
      void transition.finished.finally(() => {
        delete root.dataset.themeVt;
      });
    },
    [commit, resolvedTheme]
  );

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme faqat <ThemeProvider> ichida ishlatiladi");
  }
  return context;
}