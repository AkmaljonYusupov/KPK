"use client";

import * as React from "react";

import {
  DEFAULT_LANGUAGE,
  dictionaries,
  interpolate,
  LANGUAGES,
  type Dictionary,
  type Language,
} from "@/i18n/dictionaries";
import { STORAGE_KEYS } from "@/lib/constants";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  /** Kalit bo'yicha tarjimani qaytaradi. Ikkinchi argument — {placeholder} qiymatlari. */
  t: (key: keyof Dictionary, values?: Record<string, string | number>) => string;
  dict: Dictionary;
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

function isLanguage(value: string | null): value is Language {
  return value !== null && (LANGUAGES as readonly string[]).includes(value);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Language>(DEFAULT_LANGUAGE);

  // Server va klient HTML mos kelishi uchun til localStorage'dan mount'dan keyin o'qiladi.
  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEYS.lang);
    if (isLanguage(stored)) {
      setLangState(stored);
      document.documentElement.lang = stored;
    }
  }, []);

  const setLang = React.useCallback((next: Language) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEYS.lang, next);
    document.documentElement.lang = next;
  }, []);

  const value = React.useMemo<LanguageContextValue>(() => {
    const dict = dictionaries[lang];
    return {
      lang,
      setLang,
      dict,
      t: (key, values) => {
        const raw = dict[key] ?? dictionaries[DEFAULT_LANGUAGE][key] ?? String(key);
        return values ? interpolate(raw, values) : raw;
      },
    };
  }, [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage faqat <LanguageProvider> ichida ishlatiladi");
  }
  return context;
}
