"use client";

import * as React from "react";
import { Github, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GoogleIcon } from "@/components/icons";
import { useAuth } from "@/components/auth-provider";
import { useLanguage } from "@/i18n/language-provider";
import type { AuthProviderName } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AuthDialogProps {
  provider: AuthProviderName | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * Kirishni tasdiqlash oynasi.
 * Escape, tashqariga bosish va fokus tuzog'i Radix Dialog tomonidan
 * tayyor holda ta'minlanadi.
 */
export function AuthDialog({ provider, onOpenChange }: AuthDialogProps) {
  const { t } = useLanguage();
  const { signIn, isSigningIn } = useAuth();

  const isGoogle = provider !== "github";

  const handleContinue = async () => {
    if (!provider) return;
    await signIn(provider);
    onOpenChange(false);
  };

  return (
    <Dialog open={provider !== null} onOpenChange={(open) => !isSigningIn && onOpenChange(open)}>
      <DialogContent>
        <div
          className={cn(
            "mx-auto mb-[18px] flex size-[82px] items-center justify-center rounded-3xl text-white max-sm:size-[78px]",
            isGoogle
              ? "kpk-gradient shadow-[0_18px_45px_rgba(13,110,253,0.28)]"
              : "kpk-gradient-dark shadow-[0_18px_45px_rgba(17,24,39,0.25)]"
          )}
        >
          {isGoogle ? <GoogleIcon className="size-9" /> : <Github className="size-9" />}
        </div>

        <DialogHeader>
          <DialogTitle>{isGoogle ? t("modalGoogleTitle") : t("modalGithubTitle")}</DialogTitle>
          <DialogDescription>
            {isGoogle ? t("modalGoogleText") : t("modalGithubText")}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-7 max-sm:mt-[26px]">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1 max-sm:h-[54px] max-sm:w-full"
            onClick={() => onOpenChange(false)}
            disabled={isSigningIn}
          >
            {t("modalCancel")}
          </Button>

          <Button
            variant="gradient"
            size="lg"
            className="flex-1 max-sm:h-[54px] max-sm:w-full"
            onClick={handleContinue}
            disabled={isSigningIn}
          >
            {isSigningIn ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t("modalLoading")}
              </>
            ) : (
              t("modalContinue")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}