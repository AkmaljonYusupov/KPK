"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";

import { useLanguage } from "@/i18n/language-provider";
import { kpkToast } from "@/components/ui/toast";
import {
  createGithubProvider,
  createGoogleProvider,
  getFirebaseAuth,
  isFirebaseConfigured,
} from "@/lib/firebase";
import type { AuthProviderName } from "@/lib/constants";
import { sendTelegramLog } from "@/lib/telegram";
import {
  clearStoredProgress,
  clearStoredUser,
  getStoredUser,
  setStoredUser,
} from "@/lib/storage";
import type { KpkUser } from "@/lib/types";

interface AuthContextValue {
  user: KpkUser | null;
  /** localStorage hali o'qilmagan bo'lsa true — sahifalar shu paytda skeleton ko'rsatadi. */
  isLoading: boolean;
  isSigningIn: boolean;
  signIn: (provider: AuthProviderName) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

interface FirebaseError {
  code?: string;
  message?: string;
}

function toKpkUser(
  firebaseUser: User,
  provider: AuthProviderName,
  noEmailLabel: string,
  userFallback: string
): KpkUser {
  const email =
    firebaseUser.email ??
    firebaseUser.providerData.find((entry) => entry?.email)?.email ??
    noEmailLabel;

  return {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName ?? userFallback,
    email,
    image: firebaseUser.photoURL,
    provider,
    createdAt: firebaseUser.metadata.creationTime ?? "Unknown",
    lastLoginAt: firebaseUser.metadata.lastSignInTime ?? "Unknown",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { t, lang } = useLanguage();

  const [user, setUser] = React.useState<KpkUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  // 1) Avval localStorage — sahifa darhol to'g'ri holatni ko'rsatadi.
  React.useEffect(() => {
    setUser(getStoredUser());
    setIsLoading(false);
  }, []);

  // 2) So'ng Firebase sessiyasi bilan sinxronlash: sessiya tugagan bo'lsa
  //    localStorage'dagi eskirgan user tozalanadi.
  React.useEffect(() => {
    if (!isFirebaseConfigured()) return;

    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (firebaseUser) => {
      if (!firebaseUser) {
        clearStoredUser();
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = React.useCallback(
    async (providerName: AuthProviderName) => {
      if (!isFirebaseConfigured()) {
        kpkToast.error(t("configMissingTitle"), t("configMissingText"), "shield");
        return;
      }

      setIsSigningIn(true);

      try {
        const provider =
          providerName === "github" ? createGithubProvider() : createGoogleProvider();

        const result = await signInWithPopup(getFirebaseAuth(), provider);
        const kpkUser = toKpkUser(result.user, providerName, t("noEmail"), t("userFallback"));

        setStoredUser(kpkUser);
        setUser(kpkUser);

        kpkToast.success(
          t("loginSuccessTitle"),
          `${kpkUser.name} — ${t("loginSuccessText")}`,
          "check"
        );

        // Telegram log — muvaffaqiyatsiz bo'lsa ham kirish jarayoni to'xtamaydi.
        void sendTelegramLog("LOGIN", kpkUser, lang).then((status) => {
          if (status === "sent") {
            kpkToast.success(t("telegramSuccessTitle"), t("telegramLoginText"), "send-check");
          } else if (status === "failed") {
            kpkToast.error(t("telegramErrorTitle"), t("telegramLoginFailedText"), "send-error");
          }
        });

        // Baholash testi ixtiyoriy — foydalanuvchi to'g'ridan-to'g'ri dashboardga tushadi.
        router.replace("/dashboard");
      } catch (error) {
        const { code } = error as FirebaseError;

        // Foydalanuvchi oynani o'zi yopgan bo'lsa — bu xato emas, jim o'tamiz.
        if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
          return;
        }

        if (code === "auth/unauthorized-domain") {
          kpkToast.error(t("unauthorizedDomainTitle"), t("unauthorizedDomainText"), "shield");
          return;
        }

        if (code === "auth/account-exists-with-different-credential") {
          kpkToast.error(t("loginErrorTitle"), t("accountExistsText"), "warning");
          return;
        }

        if (code === "auth/popup-blocked") {
          kpkToast.error(t("loginErrorTitle"), t("popupClosedText"), "warning");
          return;
        }

        kpkToast.error(t("loginErrorTitle"), t("loginErrorText"), "warning");
      } finally {
        setIsSigningIn(false);
      }
    },
    [lang, router, t]
  );

  const signOutUser = React.useCallback(async () => {
    try {
      const current = getStoredUser();

      if (current) {
        const status = await sendTelegramLog("LOGOUT", current, lang);
        if (status === "failed") {
          kpkToast.error(t("telegramErrorTitle"), t("telegramLogoutFailedText"), "send-error");
        }
      }

      if (isFirebaseConfigured()) {
        await signOut(getFirebaseAuth());
      }

      clearStoredUser();
      clearStoredProgress();
      setUser(null);

      kpkToast.success(t("logoutSuccessTitle"), t("logoutSuccessText"), "logout");

      router.replace("/");
    } catch {
      kpkToast.error(t("logoutErrorTitle"), t("logoutErrorText"), "error");
    }
  }, [lang, router, t]);

  const value = React.useMemo<AuthContextValue>(
    () => ({ user, isLoading, isSigningIn, signIn, signOutUser }),
    [user, isLoading, isSigningIn, signIn, signOutUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth faqat <AuthProvider> ichida ishlatiladi");
  }
  return context;
}