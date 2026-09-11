"use client";

import * as React from "react";
import Image from "next/image";

import { EMBLEM_URL } from "@/lib/constants";

/**
 * Gerb logotipi.
 *
 * Original loyihada rasm to'g'ridan-to'g'ri Wikimedia'dan olinardi.
 * Agar tashqi manba javob bermasa, brauzerda buzuq rasm ikonkasi
 * chiqib qolardi. Bu yerda xato bo'lsa avtomatik ravishda loyiha
 * ichidagi zaxira belgiga o'tiladi.
 *
 * Haqiqiy gerbni public/images/emblem.svg ga qo'ysangiz, tashqi
 * manbaga umuman bog'liq bo'lmaydi.
 */
export function EmblemLogo({
  size,
  className,
  priority = false,
}: {
  size: number;
  className?: string;
  priority?: boolean;
}) {
  const [src, setSrc] = React.useState(EMBLEM_URL);

  return (
    <Image
      src={src}
      alt="KPK Platform logotipi"
      width={size}
      height={size}
      className={className}
      priority={priority}
      unoptimized
      onError={() => setSrc("/images/emblem.svg")}
    />
  );
}
