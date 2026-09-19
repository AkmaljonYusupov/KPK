"use client";

import * as React from "react";

import { STORAGE_KEYS } from "@/lib/constants";

/* ══════════════════════════════════════════════════════════════
   SIDEBAR HOLATI

   Yig'ilgan/yoyilgan holat localStorage'da saqlanadi — sahifalar
   orasida yurganda ham foydalanuvchi tanlovi saqlanib qoladi.
   Server bu qiymatni bilmaydi, shuning uchun boshlang'ich holat
   doim "yoyilgan" va mount'dan keyin tiklanadi (hydration toza).
══════════════════════════════════════════════════════════════ */

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  /** Mount bo'ldimi — animatsiyani birinchi chizishda o'chirish uchun. */
  ready: boolean;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(STORAGE_KEYS.sidebar) === "1");
    } catch {
      /* ruxsat yo'q — yoyilgan holatda qolamiz */
    }
    setReady(true);
  }, []);

  const toggle = React.useCallback(() => {
    setCollapsed((previous) => {
      const next = !previous;
      try {
        window.localStorage.setItem(STORAGE_KEYS.sidebar, next ? "1" : "0");
      } catch {
        /* jim o'tamiz */
      }
      return next;
    });
  }, []);

  const value = React.useMemo(() => ({ collapsed, toggle, ready }), [collapsed, toggle, ready]);

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar(): SidebarContextValue {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar faqat <SidebarProvider> ichida ishlatiladi");
  }
  return context;
}