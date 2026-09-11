import { notFound } from "next/navigation";

import { ModuleView } from "@/components/module-view";
import { MODULE_COUNT } from "@/lib/constants";

/* Original loyihada module1.html … module4.html fayllari yo'q edi va
   "Boshlash" tugmasi 404 ga olib borardi. Endi bitta dinamik sahifa
   barcha bo'limlarga xizmat qiladi. */

export function generateStaticParams() {
  return Array.from({ length: MODULE_COUNT }, (_, index) => ({ id: String(index + 1) }));
}

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const moduleId = Number.parseInt(id, 10);

  if (Number.isNaN(moduleId) || moduleId < 1 || moduleId > MODULE_COUNT) {
    notFound();
  }

  return <ModuleView moduleId={moduleId} />;
}
