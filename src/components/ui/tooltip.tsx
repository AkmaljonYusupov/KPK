"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════
   YENGIL TOOLTIP

   Radix'ning tooltip paketi ishlatilmaydi — qo'shimcha bog'liqlik
   kerak emas va bu yerda vazifa oddiy: element ustiga kursor
   kelganda yonida yozuv chiqarish.

   Ko'rsatish CSS bilan (group-hover), shuning uchun JavaScript
   ishlamasa ham ishlaydi va hech qanday qayta chizish bo'lmaydi.
══════════════════════════════════════════════════════════════ */

interface TooltipProps {
  /** Yozuv matni. Bo'sh bo'lsa tooltip umuman chizilmaydi. */
  label?: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ label, children, className }: TooltipProps) {
  if (!label) return <>{children}</>;

  return (
    <span className={cn("group/tt relative flex", className)}>
      {children}

      <span role="tooltip" className="kpk-tooltip">
        {label}
      </span>
    </span>
  );
}