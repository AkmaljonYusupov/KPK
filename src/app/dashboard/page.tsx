import { Suspense } from "react";
import type { Metadata } from "next";

import { DashboardView } from "@/components/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "KPK platformasi bo'limlari va shaxsiy natijangiz.",
};

export default function DashboardPage() {
  /* DashboardView useSearchParams ishlatadi (?test=1 bilan modalni
     ochish uchun) — Next.js buni Suspense ichida talab qiladi. */
  return (
    <Suspense fallback={null}>
      <DashboardView />
    </Suspense>
  );
}