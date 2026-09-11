import type { Metadata, Viewport } from "next";

import { AuthProvider } from "@/components/auth-provider";
import { THEME_SCRIPT, ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toast";
import { LanguageProvider } from "@/i18n/language-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "KPK Platform",
    template: "%s — KPK Platform",
  },
  description:
    "KPK — Kreativlik. Potentsial. Kasbiy o‘sish. Oliy ta’lim muassasasi talabalaridagi ijodkorlik va salohiyatni amaliy o‘sishga yo‘naltirish platformasi.",
  applicationName: "KPK Platform",
  keywords: ["KPK", "ta'lim", "platforma", "talaba", "test", "kasbiy o'sish"],
  authors: [{ name: "KPK Platform" }],
  openGraph: {
    title: "KPK Platform",
    description: "Kreativlik. Potentsial. Kasbiy o‘sish.",
    type: "website",
    locale: "uz_UZ",
  },
  icons: {
    icon: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f8fd" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1626" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        {/* Sahifa chizilishidan oldin mavzuni qo'yamiz — "oq chaqnash" bo'lmaydi */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}