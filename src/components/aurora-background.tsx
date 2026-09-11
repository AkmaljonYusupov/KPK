"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/** To'q fon uchun zarrachalar — pozitsiyalari doimiy, har render'da sakramaydi. */
const SPARKS = [
  { left: "8%", delay: "0s", duration: "17s" },
  { left: "19%", delay: "3.4s", duration: "21s" },
  { left: "31%", delay: "1.2s", duration: "19s" },
  { left: "43%", delay: "6.1s", duration: "23s" },
  { left: "55%", delay: "2.5s", duration: "18s" },
  { left: "64%", delay: "8.2s", duration: "25s" },
  { left: "76%", delay: "4.7s", duration: "20s" },
  { left: "88%", delay: "10.3s", duration: "22s" },
  { left: "95%", delay: "7.1s", duration: "24s" },
];

interface AuroraBackgroundProps {
  /** "app" — ilova ichidagi yorug' fon, "hero" — kirish sahifasidagi to'q fon. */
  variant?: "app" | "hero";
  className?: string;
}

/**
 * Aurora fon.
 *
 * Eski katakli (grid) animatsiya olib tashlandi. O'rniga uch qatlam:
 *   1. sekin suzuvchi rangli bulutlar
 *   2. juda sekin aylanuvchi konus nuri
 *   3. nozik don qatlami — gradientlar tekis ko'rinishi uchun
 * To'q variantda ustiga yuqoriga uchuvchi zarrachalar qo'shiladi.
 *
 * Barchasi CSS bilan ishlaydi, `prefers-reduced-motion` hurmat qilinadi.
 */
export function AuroraBackground({ variant = "app", className }: AuroraBackgroundProps) {
  const isHero = variant === "hero";

  return (
    <div
      className={cn("kpk-bg", isHero ? "kpk-bg--dark" : "kpk-bg--light", className)}
      aria-hidden
    >
      <div className="kpk-beam" />

      <div className="kpk-cloud kpk-cloud--a" />
      <div className="kpk-cloud kpk-cloud--b" />
      <div className="kpk-cloud kpk-cloud--c" />

      {isHero &&
        SPARKS.map((spark) => (
          <span
            key={spark.left}
            className="kpk-spark"
            style={{
              left: spark.left,
              bottom: "-10px",
              animationDelay: spark.delay,
              animationDuration: spark.duration,
            }}
          />
        ))}

      <div className="kpk-grain" />
    </div>
  );
}