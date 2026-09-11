"use client";

import * as React from "react";
import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  LogOut,
  Send,
  SendHorizonal,
  ShieldAlert,
  WifiOff,
  X,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════
   Original loyihadagi ".modern-toast" ni shadcn/sonner ustida
   1:1 qayta yaratish: gradient ikon plitkasi, sarlavha, matn,
   yopish tugmasi va pastda kamayib boruvchi progress chizig'i.
══════════════════════════════════════════════════════════════ */

export type ToastType = "info" | "success" | "error";

export type ToastIconName =
  | "info"
  | "check"
  | "send"
  | "send-check"
  | "send-error"
  | "shield"
  | "wifi-off"
  | "warning"
  | "logout"
  | "error";

const ICONS: Record<ToastIconName, React.ComponentType<{ className?: string }>> = {
  info: Info,
  check: CheckCircle2,
  send: Send,
  "send-check": SendHorizonal,
  "send-error": XCircle,
  shield: ShieldAlert,
  "wifi-off": WifiOff,
  warning: AlertTriangle,
  logout: LogOut,
  error: XCircle,
};

const TONE: Record<ToastType, { icon: string; bar: string }> = {
  info: {
    icon: "bg-[linear-gradient(135deg,#0ea5ff,#2563eb)]",
    bar: "bg-[linear-gradient(90deg,#0ea5ff,#2563eb)]",
  },
  success: {
    icon: "bg-[linear-gradient(135deg,#00c896,#16a34a)]",
    bar: "bg-[linear-gradient(90deg,#00c896,#16a34a)]",
  },
  error: {
    icon: "bg-[linear-gradient(135deg,#ff4d6d,#dc2626)]",
    bar: "bg-[linear-gradient(90deg,#ff4d6d,#dc2626)]",
  },
};

export interface KpkToastOptions {
  title: string;
  message: string;
  type?: ToastType;
  icon?: ToastIconName;
  duration?: number;
}

interface KpkToastCardProps extends KpkToastOptions {
  onDismiss: () => void;
}

function KpkToastCard({
  title,
  message,
  type = "info",
  icon = "info",
  onDismiss,
}: KpkToastCardProps) {
  const Icon = ICONS[icon] ?? Info;
  const tone = TONE[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "relative flex w-[380px] max-w-[calc(100vw-28px)] items-start gap-3.5 overflow-hidden p-[18px]",
        "rounded-[26px] border border-white/95 bg-white/92 shadow-[0_24px_70px_rgba(31,53,82,0.18)] backdrop-blur-[22px]",
        "max-sm:w-[calc(100vw-28px)] max-sm:rounded-[22px]"
      )}
    >
      <div
        className={cn(
          "flex size-[52px] shrink-0 items-center justify-center rounded-[18px] text-white",
          tone.icon
        )}
      >
        <Icon className="size-6" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="mb-1 text-[17px] font-extrabold text-[#17375f]">{title}</h3>
        <p className="text-sm leading-relaxed text-[#5d718b]">{message}</p>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Bildirishnomani yopish"
        className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(13,110,253,0.08)] text-[var(--kpk-primary)] transition-colors hover:bg-[rgba(13,110,253,0.16)]"
      >
        <X className="size-4" strokeWidth={2.5} />
      </button>

      <div className={cn("kpk-toast-progress", tone.bar)} />
    </div>
  );
}

/** KPK uslubidagi bildirishnoma ko'rsatadi. */
export function kpkToast({ duration = 4500, ...options }: KpkToastOptions) {
  return sonnerToast.custom(
    (id) => <KpkToastCard {...options} onDismiss={() => sonnerToast.dismiss(id)} />,
    { duration }
  );
}

kpkToast.success = (title: string, message: string, icon: ToastIconName = "check") =>
  kpkToast({ title, message, type: "success", icon });

kpkToast.error = (title: string, message: string, icon: ToastIconName = "warning") =>
  kpkToast({ title, message, type: "error", icon });

kpkToast.info = (title: string, message: string, icon: ToastIconName = "info") =>
  kpkToast({ title, message, type: "info", icon });

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      offset={24}
      gap={14}
      visibleToasts={3}
      toastOptions={{ unstyled: true, classNames: { toast: "bg-transparent p-0 shadow-none" } }}
    />
  );
}
