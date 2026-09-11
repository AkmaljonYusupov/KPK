import type { Metadata } from "next";

import { AiAssistantView } from "@/components/ai-assistant-view";

export const metadata: Metadata = {
  title: "AI yordamchi",
  description: "Bo'limlar bo'yicha savollaringizga javob beradigan AI yordamchi.",
};

export default function AiPage() {
  return <AiAssistantView />;
}