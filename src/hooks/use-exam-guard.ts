"use client";

import * as React from "react";

/* ══════════════════════════════════════════════════════════════
   TEST YAXLITLIGINI HIMOYA QILISH

   HALOL BAHOLASH: brauzer sahifasi operatsion tizimni boshqara
   olmaydi. Quyidagilarni HECH QANDAY veb-kod to'xtata olmaydi:

     • PrintScreen tugmasi (OS darajasida ishlaydi)
     • Snipping Tool, Lightshot va shunga o'xshash dasturlar
     • Telefon kamerasi bilan ekranni suratga olish
     • Ikkinchi monitor yoki virtual mashina

   "Screenshot'ni bloklash" deb taklif qilinadigan kodlar aslida
   faqat ko'rinish uchun ishlaydi va jiddiy foydalanuvchini
   to'xtatmaydi. Shuning uchun bu yerda boshqa yondashuv:

     1. NUSXA OLISHNING FOYDASINI YO'QOTISH — savollar 150 talik
        bazadan tasodifiy tanlanadi, variantlar ham aralashadi.
        Bitta urinishning surati keyingisida yordam bermaydi.

     2. QAYTA YUKLASHNING FOYDASINI YO'QOTISH — holat va tugash
        vaqti saqlanadi. Sahifa yangilansa test o'sha joyidan
        davom etadi va taymer orqaga qaytmaydi.

     3. URINISHLARNI QAYD QILISH — boshqa oynaga o'tish, nusxa
        olishga urinish, chop etish sanaladi va natijaga yoziladi.

     4. TO'SIQ QO'YISH — F5, Ctrl+R, Ctrl+P, Ctrl+S, DevTools
        yorliqlari, o'ng tugma va matn belgilash bloklanadi.
        Bular tasodifiy harakatlarning oldini oladi.
══════════════════════════════════════════════════════════════ */

export interface ExamGuardState {
  /** Nechta qoida buzilishi qayd etilgan. */
  violations: number;
  /** Oxirgi buzilish turi — foydalanuvchiga ko'rsatish uchun. */
  lastViolation: ViolationKind | null;
  /** Oyna fokusdan chiqqanmi — shunda kontent xiralashtiriladi. */
  hidden: boolean;
}

export type ViolationKind = "blur" | "copy" | "print" | "reload" | "contextmenu";

interface ExamGuardOptions {
  /** Himoya yoqilganmi (faqat test davom etayotganda). */
  active: boolean;
  /** Shuncha buzilishdan keyin chaqiriladi — odatda testni yakunlash. */
  maxViolations?: number;
  onLimitReached?: () => void;
  onViolation?: (kind: ViolationKind, total: number) => void;
}

export function useExamGuard({
  active,
  maxViolations = 3,
  onLimitReached,
  onViolation,
}: ExamGuardOptions): ExamGuardState {
  const [violations, setViolations] = React.useState(0);
  const [lastViolation, setLastViolation] = React.useState<ViolationKind | null>(null);
  const [hidden, setHidden] = React.useState(false);

  /* Callback'lar ref orqali — effektlar ular o'zgarganda qayta
     yaratilmasin, aks holda hodisa tinglovchilari uzilib qoladi. */
  const onViolationRef = React.useRef(onViolation);
  const onLimitRef = React.useRef(onLimitReached);
  onViolationRef.current = onViolation;
  onLimitRef.current = onLimitReached;

  const report = React.useCallback(
    (kind: ViolationKind) => {
      setLastViolation(kind);
      setViolations((previous) => {
        const total = previous + 1;
        onViolationRef.current?.(kind, total);
        if (total >= maxViolations) onLimitRef.current?.();
        return total;
      });
    },
    [maxViolations]
  );

  /* ── Sahifani yangilash / yopish ogohlantirishi ──
        Brauzer to'liq bloklashga ruxsat bermaydi, lekin tasdiqlash
        oynasini majburan ko'rsatadi. Tasodifan F5 bosilganda test
        yo'qolmaydi. */
  React.useEffect(() => {
    if (!active) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [active]);

  /* ── Klaviatura yorliqlari ── */
  React.useEffect(() => {
    if (!active) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const ctrl = event.ctrlKey || event.metaKey;

      // Yangilash: F5, Ctrl+R, Ctrl+Shift+R
      if (key === "f5" || (ctrl && key === "r")) {
        event.preventDefault();
        report("reload");
        return;
      }

      // Chop etish va saqlash
      if (ctrl && (key === "p" || key === "s")) {
        event.preventDefault();
        report("print");
        return;
      }

      // Nusxa olish, kesish, hammasini belgilash
      if (ctrl && (key === "c" || key === "x" || key === "a")) {
        event.preventDefault();
        report("copy");
        return;
      }

      // Manba kodi va DevTools
      if (ctrl && key === "u") {
        event.preventDefault();
        return;
      }
      if (key === "f12" || (ctrl && event.shiftKey && ["i", "j", "c"].includes(key))) {
        event.preventDefault();
        return;
      }

      /* PrintScreen: tugmani bosishning o'zini to'xtata olmaymiz,
         lekin bosilgach clipboard'ni tozalashga urinamiz. Bu faqat
         brauzer clipboard'iga tushgan nusxaga ta'sir qiladi —
         OS'ning screenshot vositalariga emas. */
      if (key === "printscreen") {
        void navigator.clipboard?.writeText("").catch(() => {});
        report("print");
      }
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [active, report]);

  /* ── O'ng tugma, nusxa olish, matn belgilash ── */
  React.useEffect(() => {
    if (!active) return;

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      report("contextmenu");
    };

    const onCopy = (event: ClipboardEvent) => {
      event.preventDefault();
      report("copy");
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("copy", onCopy);
    document.body.classList.add("kpk-exam-lock");

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("copy", onCopy);
      document.body.classList.remove("kpk-exam-lock");
    };
  }, [active, report]);

  /* ── Boshqa oynaga o'tish ──
        Eng foydali signal shu: talaba javobni boshqa joydan
        qidirayotgan bo'lsa, oyna fokusdan chiqadi. */
  React.useEffect(() => {
    if (!active) return;

    const onHide = () => {
      setHidden(true);
      report("blur");
    };

    const onShow = () => setHidden(false);

    const onVisibility = () => {
      if (document.hidden) onHide();
      else onShow();
    };

    window.addEventListener("blur", onHide);
    window.addEventListener("focus", onShow);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("blur", onHide);
      window.removeEventListener("focus", onShow);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active, report]);

  return { violations, lastViolation, hidden };
}