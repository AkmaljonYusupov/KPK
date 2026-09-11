import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--kpk-blue)] text-white shadow-[0_15px_35px_rgba(13,110,253,0.22)] hover:brightness-105",
        gradient:
          "kpk-gradient text-white shadow-[0_15px_35px_rgba(13,110,253,0.22)] hover:brightness-105",
        dark: "kpk-gradient-dark text-white shadow-[0_15px_35px_rgba(17,24,39,0.2)] hover:brightness-125",
        destructive: "bg-destructive text-destructive-foreground hover:brightness-105",
        outline:
          "border border-[var(--kpk-border)] bg-[var(--kpk-surface-solid)] text-[var(--kpk-primary)] shadow-[0_10px_24px_rgba(27,58,99,0.07)] hover:bg-[var(--kpk-hover)]",
        secondary: "bg-[var(--kpk-subtle)] text-[var(--kpk-text)] hover:bg-[var(--kpk-hover)]",
        ghost: "text-[var(--kpk-primary)] hover:bg-[var(--kpk-hover)]",
        soft: "bg-[var(--kpk-subtle)] text-[var(--kpk-muted)] hover:bg-[var(--kpk-hover)]",
        link: "text-[var(--kpk-blue)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 [&_svg]:size-4",
        sm: "h-9 rounded-xl px-3 text-[13px] [&_svg]:size-4",
        lg: "h-[52px] px-6 text-[15px] [&_svg]:size-5",
        xl: "h-[58px] px-6 text-[15px] [&_svg]:size-5",
        icon: "size-10 [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/* forwardRef generiklari ishlatilmaydi — React 19 da ref oddiy prop,
   bundan tashqari kodni nusxalashda "<" belgisi yo'qolib qolmaydi. */
export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { buttonVariants };