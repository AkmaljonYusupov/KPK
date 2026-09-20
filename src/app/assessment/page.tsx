import { redirect } from "next/navigation";

/* Baholash testi endi alohida sahifada emas — dashboard ustidagi
   modal oynada o'tadi. Eski havolalar ishlashda davom etsin uchun
   bu yo'l modalni ochadigan manzilga yo'naltiradi. */
export default function AssessmentPage() {
  redirect("/dashboard?test=1");
}