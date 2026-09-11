import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full font-black tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--kpk-accent-soft)] text-[var(--kpk-primary)]",
        beginner: "bg-[var(--kpk-ok-bg)] text-[var(--kpk-ok-fg)]",
        intermediate: "bg-[var(--kpk-warn-bg)] text-[var(--kpk-warn-fg)]",
        advanced: "bg-[var(--kpk-info-bg)] text-[var(--kpk-info-fg)]",
        master: "bg-[var(--kpk-pink-bg)] text-[var(--kpk-pink-fg)]",
        provider: "bg-[var(--kpk-accent-soft)] text-[var(--kpk-info-fg)]",
      },
      size: {
        default: "h-9 px-[18px] text-[13px]",
        sm: "px-2.5 py-[5px] text-xs",
        lg: "px-[15px] py-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };