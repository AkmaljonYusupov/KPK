import type { Metadata } from "next";

import { DashboardView } from "@/components/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "KPK platformasi bo'limlari va shaxsiy natijangiz.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
