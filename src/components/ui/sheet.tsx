"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/* Yon panel (drawer) — mobil ekranda sidebar shu ko'rinishda ochiladi. */

type OverlayProps = React.ComponentProps<typeof SheetPrimitive.Overlay>;
type ContentProps = React.ComponentProps<typeof SheetPrimitive.Content> & {
  hideClose?: boolean;
};
type TitleProps = React.ComponentProps<typeof SheetPrimitive.Title>;
type DescriptionProps = React.ComponentProps<typeof SheetPrimitive.Description>;

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;
export const SheetPortal = SheetPrimitive.Portal;

export function SheetOverlay({ className, ...props }: OverlayProps) {
  return (
    <SheetPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-[9998] bg-[rgba(6,12,24,0.55)] backdrop-blur-[6px]",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
}

export function SheetContent({ className, children, hideClose = false, ...props }: ContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        className={cn(
          "fixed inset-y-0 left-0 z-[9999] flex h-full w-[280px] flex-col",
          "border-r border-[var(--kpk-border)] bg-[var(--kpk-surface-solid)] backdrop-blur-xl",
          "shadow-[var(--kpk-shadow)]",
          "transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:duration-250 data-[state=open]:duration-300",
          "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
          className
        )}
        {...props}
      >
        {children}

        {hideClose ? null : (
          <SheetPrimitive.Close
            className={cn(
              "absolute right-4 top-4 flex size-9 items-center justify-center rounded-xl",
              "bg-[var(--kpk-hover)] text-[var(--kpk-text)] transition-colors",
              "hover:bg-[var(--kpk-accent-soft)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <X className="size-4" strokeWidth={2.5} />
            <span className="sr-only">Yopish</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

export function SheetTitle({ className, ...props }: TitleProps) {
  return (
    <SheetPrimitive.Title
      className={cn("text-lg font-extrabold text-[var(--kpk-primary)]", className)}
      {...props}
    />
  );
}

export function SheetDescription({ className, ...props }: DescriptionProps) {
  return (
    <SheetPrimitive.Description
      className={cn("text-sm text-[var(--kpk-muted)]", className)}
      {...props}
    />
  );
}