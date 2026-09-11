"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type OverlayProps = React.ComponentProps<typeof DialogPrimitive.Overlay>;
type ContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  hideClose?: boolean;
};
type TitleProps = React.ComponentProps<typeof DialogPrimitive.Title>;
type DescriptionProps = React.ComponentProps<typeof DialogPrimitive.Description>;

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export function DialogOverlay({ className, ...props }: OverlayProps) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-[99998] bg-[rgba(6,12,24,0.55)] backdrop-blur-[8px]",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
}

export function DialogContent({ className, children, hideClose = false, ...props }: ContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-[99999] w-[min(430px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2",
          "kpk-card rounded-[28px] p-[34px_30px] text-center",
          "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "max-sm:w-[calc(100vw-28px)] max-sm:max-w-[420px] max-sm:rounded-[30px] max-sm:p-[34px_22px_26px]",
          className
        )}
        {...props}
      >
        {children}

        {hideClose ? null : (
          <DialogPrimitive.Close
            className={cn(
              "absolute right-4 top-4 flex size-[38px] items-center justify-center rounded-xl",
              "bg-[var(--kpk-hover)] text-[var(--kpk-text)] transition-colors",
              "hover:bg-[var(--kpk-accent-soft)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "max-sm:right-[18px] max-sm:top-[18px] max-sm:size-11 max-sm:rounded-2xl"
            )}
          >
            <X className="size-4" strokeWidth={2.5} />
            <span className="sr-only">Yopish</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-2 text-center", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex w-full gap-3 max-sm:flex-col", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: TitleProps) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "break-words text-[28px] font-extrabold leading-[1.2] text-[var(--kpk-primary)] max-sm:text-2xl",
        className
      )}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }: DescriptionProps) {
  return (
    <DialogPrimitive.Description
      className={cn(
        "break-words text-[15px] leading-[1.7] text-[var(--kpk-muted)] max-sm:text-sm",
        className
      )}
      {...props}
    />
  );
}