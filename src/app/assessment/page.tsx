import type { Metadata } from "next";

import { AuroraBackground } from "@/components/aurora-background";
import { AssessmentView } from "@/components/assessment-view";

export const metadata: Metadata = {
  title: "Baholash testi",
  description: "Kirish testi orqali bilim darajangiz aniqlanadi.",
};

export default function AssessmentPage() {
  return (
    <div className="relative flex min-h-screen w-full items-start justify-center p-5">
      <AuroraBackground />
      <div className="relative z-[2] w-full">
        <AssessmentView />
      </div>
    </div>
  );
}