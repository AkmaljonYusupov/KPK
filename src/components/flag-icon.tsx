import * as React from "react";

import type { Language } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";

/**
 * Til bayroqlari — SVG ko'rinishida.
 *
 * Ilgari 80×40 PNG rasm ishlatilardi: u 27×19 o'lchamga siqilganda
 * xiralashardi va Retina ekranlarda yanada yomon ko'rinardi. SVG esa
 * har qanday o'lchamda va har qanday piksel zichligida tiniq qoladi,
 * bundan tashqari qo'shimcha tarmoq so'rovi talab qilmaydi.
 *
 * Barchasi 3:2 nisbatda chizilgan, shunda ro'yxatda bir tekis turadi.
 */

/** O'zbekiston: ko'k / oq / yashil, orasida ingichka qizil chiziqlar,
 *  ko'k maydonda yarim oy va 12 ta besh burchakli yulduz. */
function UzFlag({ uid }: { uid: string }) {
  // Yulduzlar: pastdan yuqoriga 3, 4, 5 tadan joylashadi
  const stars: Array<[number, number]> = [];
  [3, 4, 5].forEach((count, rowIndex) => {
    for (let i = 0; i < count; i += 1) {
      stars.push([150 + i * 32, 30 + rowIndex * 29]);
    }
  });

  return (
    <svg viewBox="0 0 600 400" className="size-full" aria-hidden focusable="false">
      <defs>
        <polygon
          id={`star-${uid}`}
          points="0.00,-10.00 2.41,-3.32 9.51,-3.09 3.80,1.27 5.88,8.09 0.00,4.10 -5.88,8.09 -3.80,1.27 -9.51,-3.09 -2.41,-3.32"
          fill="#ffffff"
        />
      </defs>

      {/* Uch asosiy chiziq va ular orasidagi ingichka qizil ajratgichlar */}
      <rect width="600" height="400" fill="#0099b5" />
      <rect y="130" width="600" height="140" fill="#ce1126" />
      <rect y="137" width="600" height="126" fill="#ffffff" />
      <rect y="270" width="600" height="130" fill="#1eb53a" />

      {/* Yarim oy: doiradan ikkinchi doirani kesib olamiz */}
      <circle cx="84" cy="62" r="38" fill="#ffffff" />
      <circle cx="102" cy="62" r="38" fill="#0099b5" />

      {stars.map(([x, y]) => (
        <use key={`${x}-${y}`} href={`#star-${uid}`} x={x} y={y} />
      ))}
    </svg>
  );
}

/** Buyuk Britaniya bayrog'i (ingliz tili uchun). */
function GbFlag({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 60 40" className="size-full" aria-hidden focusable="false">
      <clipPath id={`gb-clip-${uid}`}>
        <rect width="60" height="40" />
      </clipPath>
      <clipPath id={`gb-diag-${uid}`}>
        <path d="M30,20 h30 v20 z v20 h-30 z h-30 v-20 z v-20 h30 z" />
      </clipPath>

      <g clipPath={`url(#gb-clip-${uid})`}>
        <rect width="60" height="40" fill="#012169" />
        {/* Oq diagonal xochlar */}
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#ffffff" strokeWidth="8" />
        {/* Qizil diagonallar — yarmi kesilgan */}
        <path
          d="M0,0 L60,40 M60,0 L0,40"
          clipPath={`url(#gb-diag-${uid})`}
          stroke="#c8102e"
          strokeWidth="5"
        />
        {/* To'g'ri xoch */}
        <path d="M30,0 v40 M0,20 h60" stroke="#ffffff" strokeWidth="13" />
        <path d="M30,0 v40 M0,20 h60" stroke="#c8102e" strokeWidth="8" />
      </g>
    </svg>
  );
}

/** Rossiya: oq / ko'k / qizil. */
function RuFlag() {
  return (
    <svg viewBox="0 0 600 400" className="size-full" aria-hidden focusable="false">
      <rect width="600" height="400" fill="#ffffff" />
      <rect y="133" width="600" height="134" fill="#0039a6" />
      <rect y="267" width="600" height="133" fill="#d52b1e" />
    </svg>
  );
}

export function FlagIcon({ lang, className }: { lang: Language; className?: string }) {
  // clipPath va gradient id'lari sahifada takrorlanmasligi kerak
  const uid = React.useId().replace(/:/g, "");

  return (
    <span
      className={cn(
        "block h-[18px] w-[27px] shrink-0 overflow-hidden rounded-[3px]",
        "ring-1 ring-black/15 dark:ring-white/20",
        className
      )}
    >
      {lang === "uz" && <UzFlag uid={uid} />}
      {lang === "en" && <GbFlag uid={uid} />}
      {lang === "ru" && <RuFlag />}
    </span>
  );
}