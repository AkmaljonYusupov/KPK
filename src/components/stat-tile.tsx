import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
  /** Ikonka plitkasining gradient sinflari, masalan "from-[#34d399] to-[#059669]". */
  accent: string;
}

/** Dashboard yuqorisidagi ixcham statistika plitkasi. */
export function StatTile({ icon: Icon, label, value, accent }: StatTileProps) {
  return (
    <div className="kpk-card flex items-center gap-3.5 rounded-3xl px-5 py-4">
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white",
          accent
        )}
      >
        <Icon className="size-5" strokeWidth={2.2} />
      </div>

      <div className="min-w-0">
        <p className="truncate text-xs font-bold text-[var(--kpk-muted)]">{label}</p>
        <p className="truncate text-lg font-black text-[var(--kpk-primary)]">{value}</p>
      </div>
    </div>
  );
}