"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

/* forwardRef generiklari ishlatilmaydi — React 19 da ref oddiy prop,
   bundan tashqari kodni nusxalashda "<" belgisi yo'qolib qolmaydi. */

type RootProps = React.ComponentProps<typeof AvatarPrimitive.Root>;
type ImageProps = React.ComponentProps<typeof AvatarPrimitive.Image>;
type FallbackProps = React.ComponentProps<typeof AvatarPrimitive.Fallback>;

export function Avatar({ className, ...props }: RootProps) {
  return (
    <AvatarPrimitive.Root
      className={cn("relative flex size-10 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    />
  );
}

export function AvatarImage({ className, ...props }: ImageProps) {
  return (
    <AvatarPrimitive.Image
      className={cn("aspect-square size-full bg-[var(--kpk-surface-solid)] object-cover", className)}
      {...props}
    />
  );
}

export function AvatarFallback({ className, ...props }: FallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "flex size-full items-center justify-center rounded-full",
        "bg-[var(--kpk-accent-soft)] text-sm font-extrabold text-[var(--kpk-primary)]",
        className
      )}
      {...props}
    />
  );
}