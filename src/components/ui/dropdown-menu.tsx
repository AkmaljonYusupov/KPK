"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import { cn } from "@/lib/utils";

type ContentProps = React.ComponentProps<typeof DropdownMenuPrimitive.Content>;
type ItemProps = React.ComponentProps<typeof DropdownMenuPrimitive.Item> & { inset?: boolean };
type LabelProps = React.ComponentProps<typeof DropdownMenuPrimitive.Label>;
type SeparatorProps = React.ComponentProps<typeof DropdownMenuPrimitive.Separator>;

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

export function DropdownMenuContent({ className, sideOffset = 10, ...props }: ContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-[18px] p-2",
          "border border-[var(--kpk-border)] bg-[var(--kpk-surface-solid)]",
          "text-[var(--kpk-text)] shadow-[var(--kpk-shadow)] backdrop-blur-xl",
          // Zaxira: CSS o'zgaruvchisi yetib kelmasa ham to'q qoladi
          "dark:border-white/10 dark:bg-[#18233a] dark:text-[#dde7f6]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({ className, inset, ...props }: ItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center gap-3 rounded-[13px] px-3 py-2.5",
        "text-sm font-bold text-[var(--kpk-text)] outline-none transition-colors",
        "focus:bg-[var(--kpk-accent-soft)] focus:text-[var(--kpk-blue)]",
        "dark:focus:bg-[rgba(13,110,253,0.22)]",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({ className, ...props }: LabelProps) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn("px-3 py-2 text-xs font-bold text-[var(--kpk-muted)]", className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({ className, ...props }: SeparatorProps) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-[var(--kpk-border)]", className)}
      {...props}
    />
  );
}