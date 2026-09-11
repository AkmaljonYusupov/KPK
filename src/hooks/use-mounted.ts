"use client";

import * as React from "react";

/**
 * Komponent brauzerda mount bo'lganini bildiradi.
 *
 * Server'da HTML tayyorlanayotganda localStorage mavjud emas, shuning uchun
 * unga bog'liq har qanday narsa (til, foydalanuvchi) faqat mount'dan keyin
 * chizilishi kerak. Aks holda server va klient HTML'i mos kelmay qoladi —
 * React buni "hydration mismatch" deb ogohlantiradi.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}