import { cn } from "@/lib/utils";

/** Yuklanish paytidagi kulrang joy egallovchi. Rangi mavzuga moslashadi. */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("animate-pulse rounded-2xl bg-[var(--kpk-track)]", className)} {...props} />
  );
}

export { Skeleton };