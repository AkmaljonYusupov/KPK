"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

type ProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root> & {
  indicatorClassName?: string;
};

export function Progress({ className, value, indicatorClassName, ...props }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        "relative h-[7px] w-full overflow-hidden rounded-full bg-[var(--kpk-track)]",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 rounded-full bg-[linear-gradient(90deg,#0d6efd,#00b7ff)]",
          "transition-transform duration-400 ease-out",
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}