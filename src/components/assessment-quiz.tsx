"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  EyeOff,
  Flag,
  Hourglass,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { kpkToast } from "@/components/ui/toast";
import { pickRandomQuestions, questions as allQuestions, type Question } from "@/data/questions";
import { useExamGuard, type ViolationKind } from "@/hooks/use-exam-guard";
import { useAuth } from "@/components/auth-provider";
import { useLanguage } from "@/i18n/language-provider";
import { ASSESSMENT, STORAGE_KEYS } from "@/lib/constants";
import { buildProgress, getUnlockedCount } from "@/lib/progress";
import { getStoredProgress, setStoredProgress } from "@/lib/storage";
import { sendTelegramTestResult } from "@/lib/telegram";
import type { InitialTestResult } from "@/lib/types";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════
   BILIMNI BAHOLASH TESTI — modal ichidagi versiya.

   Yaxlitlikni himoya qilish uchun uchta tamoyil:

   1. TUGASH VAQTI — ABSOLUT. localStorage'da `deadline` sifatida
      saqlanadi. Sahifa yangilansa taymer o'sha joyidan davom
      etadi, orqaga qaytmaydi. Qayta yuklashdan foyda yo'q.

   2. HOLAT SAQLANADI. Savollar, javoblar va joriy savol indeksi
      yoziladi — tasodifan yopilsa test yo'qolmaydi.

   3. BUZILISHLAR SANALADI. Boshqa oynaga o'tish, nusxa olish,
      chop etishga urinish qayd etiladi va natijaga yoziladi.
══════════════════════════════════════════════════════════════ */

const MAX_VIOLATIONS = 3;

/** localStorage'da saqlanadigan sessiya. */
interface QuizSession {
  questionIds: number[];
  answers: (number | null)[];
  currentIndex: number;
  /** Test boshlangan vaqt — sarflangan vaqtni hisoblash uchun. */
  startedAt: number;
  /** Testning tugash vaqti (Unix ms) — taymer shunga qarab hisoblanadi. */
  deadline: number;
  /** Joriy savolning tugash vaqti. */
  questionDeadline: number;
  violations: number;
}

function readSession(): QuizSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.quizSession);
    if (!raw) return null;

    const session = JSON.parse(raw) as QuizSession;
    // Vaqti tugagan sessiya tiklanmaydi.
    if (!session.deadline || session.deadline <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

function writeSession(session: QuizSession) {
  try {
    window.localStorage.setItem(STORAGE_KEYS.quizSession, JSON.stringify(session));
  } catch {
    /* kvota to'lgan bo'lsa jim o'tamiz */
  }
}

function clearSession() {
  try {
    window.localStorage.removeItem(STORAGE_KEYS.quizSession);
  } catch {
    /* jim o'tamiz */
  }
}

/** Soniyani 00:00 ko'rinishiga keltiradi. */
function clock(seconds: number): string {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

interface AssessmentQuizProps {
  onFinish: (result: InitialTestResult, quizQuestions: Question[]) => void;
}

export function AssessmentQuiz({ onFinish }: AssessmentQuizProps) {
  const { t, lang } = useLanguage();
  const { user } = useAuth();

  /* ── Sessiyani tiklash yoki yangisini boshlash ──
        useState'ning lazy initializer'i faqat birinchi renderda
        ishlaydi, shuning uchun savollar qayta chizishda o'zgarmaydi. */
  const [session, setSession] = React.useState<QuizSession>(() => {
    const saved = readSession();

    if (saved) {
      return saved;
    }

    const picked = pickRandomQuestions(ASSESSMENT.questionCount);
    const now = Date.now();

    return {
      questionIds: picked.map((question) => question.id),
      answers: picked.map(() => null),
      currentIndex: 0,
      startedAt: now,
      deadline: now + ASSESSMENT.totalSeconds * 1000,
      questionDeadline: now + ASSESSMENT.questionSeconds * 1000,
      violations: 0,
    };
  });

  const [resumed] = React.useState(() => readSession() !== null);
  const [done, setDone] = React.useState(false);
  const [now, setNow] = React.useState(() => Date.now());

  /* Savollarni id bo'yicha tiklaymiz — sessiyada faqat id'lar
     saqlanadi, matnlar bazadan olinadi. */
  const quizQuestions = React.useMemo<Question[]>(() => {
    const byId = new Map(allQuestions.map((question) => [question.id, question]));
    return session.questionIds
      .map((id) => byId.get(id))
      .filter((question): question is Question => question !== undefined);
  }, [session.questionIds]);

  const total = quizQuestions.length;
  const { currentIndex, answers } = session;
  const isLast = currentIndex === total - 1;
  const answeredCount = answers.filter((value) => value !== null).length;

  const totalLeft = Math.ceil((session.deadline - now) / 1000);
  const questionLeft = Math.ceil((session.questionDeadline - now) / 1000);

  /* ── Yakunlash ── */
  const sessionRef = React.useRef(session);
  sessionRef.current = session;

  const finish = React.useCallback(
    (reason?: "limit") => {
      if (done) return;
      setDone(true);
      clearSession();

      const current = sessionRef.current;
      const byId = new Map(allQuestions.map((question) => [question.id, question]));
      const list = current.questionIds
        .map((id) => byId.get(id))
        .filter((question): question is Question => question !== undefined);

      const score = list.reduce(
        (sum, question, index) => (current.answers[index] === question.correct ? sum + 1 : sum),
        0
      );

      const previous = getStoredProgress();

      const progress = buildProgress({
        previous,
        score,
        total: list.length,
        answers: current.answers,
      });

      if (progress.initialTest) {
        progress.initialTest.questionIds = current.questionIds;
        progress.initialTest.attempt = (previous.initialTest?.attempt ?? 0) + 1;
        progress.initialTest.violations = current.violations;
        progress.initialTest.autoSubmitted = reason === "limit";
      }

      setStoredProgress(progress);

      /* Natijani Telegram botga yuboramiz. Bu fon jarayoni:
         yuborilmasa ham natija localStorage'da saqlangan, shuning
         uchun foydalanuvchi ishi to'xtamaydi. */
      if (user && progress.initialTest) {
        const finished = progress.initialTest;

        kpkToast.info(t("tgResultSending"), t("tgResultSendingText"), "send");

        void sendTelegramTestResult(
          user,
          {
            score: finished.score,
            total: finished.total,
            percent: finished.percent,
            unlocked: getUnlockedCount(finished.percent, true),
            attempt: finished.attempt,
            violations: finished.violations,
            autoSubmitted: finished.autoSubmitted,
            duration: Math.round((Date.now() - current.startedAt) / 1000),
          },
          lang
        ).then((status) => {
          if (status === "sent") {
            kpkToast.success(t("tgResultSent"), t("tgResultSentText"), "send-check");
          } else if (status === "failed") {
            kpkToast.error(t("tgResultFailed"), t("tgResultFailedText"), "send-error");
          }
          // "skipped" — bot sozlanmagan, xabar chiqarmaymiz
        });
      }

      if (progress.initialTest) onFinish(progress.initialTest, list);
    },
    [done, lang, onFinish, t, user]
  );

  /* ── Himoya ── */
  const violationLabel = React.useCallback(
    (kind: ViolationKind) =>
      ({
        blur: t("examViolationBlur"),
        copy: t("examViolationCopy"),
        print: t("examViolationPrint"),
        reload: t("examViolationReload"),
        contextmenu: t("examViolationMenu"),
      })[kind],
    [t]
  );

  const guard = useExamGuard({
    active: !done,
    maxViolations: MAX_VIOLATIONS,
    onViolation: (kind, count) => {
      setSession((previous) => ({ ...previous, violations: count }));

      if (count < MAX_VIOLATIONS) {
        kpkToast.error(
          violationLabel(kind),
          t("examViolation", { count, max: MAX_VIOLATIONS }),
          "warning"
        );
      }
    },
    onLimitReached: () => {
      kpkToast.error(t("examLimitTitle"), t("examLimitText", { max: MAX_VIOLATIONS }), "shield");
      finish("limit");
    },
  });

  /* ── Tiklangani haqida xabar ── */
  React.useEffect(() => {
    if (resumed) kpkToast.info(t("examResumed"), t("examResumedText"), "check");
  }, [resumed, t]);

  /* ── Yagona taymer: har soniyada joriy vaqtni yangilaydi.
        Vaqtlar absolut bo'lgani uchun sahifa yangilansa ham
        hisob to'g'ri qoladi. ── */
  React.useEffect(() => {
    if (done) return;

    const interval = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(interval);
  }, [done]);

  /* ── Vaqt tugashi ── */
  React.useEffect(() => {
    if (done) return;

    if (totalLeft <= 0) {
      finish();
      return;
    }

    if (questionLeft <= 0) {
      if (isLast) {
        finish();
      } else {
        setSession((previous) => ({
          ...previous,
          currentIndex: previous.currentIndex + 1,
          questionDeadline: Date.now() + ASSESSMENT.questionSeconds * 1000,
        }));
      }
    }
  }, [done, finish, isLast, questionLeft, totalLeft]);

  /* ── Har o'zgarishda sessiyani saqlaymiz ── */
  React.useEffect(() => {
    if (done) return;
    writeSession(session);
  }, [done, session]);

  const goTo = (index: number) =>
    setSession((previous) => ({
      ...previous,
      currentIndex: Math.max(0, Math.min(total - 1, index)),
      questionDeadline: Date.now() + ASSESSMENT.questionSeconds * 1000,
    }));

  const selectAnswer = (optionIndex: number) =>
    setSession((previous) => {
      const next = [...previous.answers];
      next[previous.currentIndex] = optionIndex;
      return { ...previous, answers: next };
    });

  const question = quizQuestions[currentIndex];
  if (!question) return null;

  const timeLow = questionLeft <= 10;
  const totalLow = totalLeft <= 60;
  const progressPercent = ((currentIndex + 1) / total) * 100;

  return (
    <div className="text-left">
      {/* ══ YUQORI PANEL: taymerlar va buzilishlar ══ */}
      <div className="mb-3 flex items-center gap-2">
        {/* Umumiy vaqt — halqa shaklida */}
        <div
          className={cn(
            "flex flex-1 items-center gap-2.5 rounded-2xl px-3.5 py-2.5 transition-colors",
            totalLow ? "bg-[var(--kpk-danger-bg)]" : "bg-[var(--kpk-subtle)]"
          )}
        >
          <Hourglass
            className={cn(
              "size-4 shrink-0",
              totalLow ? "text-[var(--kpk-danger-fg)]" : "text-[var(--kpk-muted)]"
            )}
          />
          <span className="truncate text-xs font-semibold text-[var(--kpk-muted)]">
            {t("remainingTime")}
          </span>
          <strong
            className={cn(
              "ml-auto text-[15px] font-black tabular-nums",
              totalLow ? "text-[var(--kpk-danger-fg)]" : "text-[var(--kpk-primary)]"
            )}
            aria-live="polite"
          >
            {clock(totalLeft)}
          </strong>
        </div>

        {/* Savol vaqti — aylanma indikator */}
        <div
          className={cn(
            "relative grid size-[46px] shrink-0 place-items-center rounded-2xl text-[15px] font-black tabular-nums transition-colors",
            timeLow
              ? "bg-[var(--kpk-danger-bg)] text-[var(--kpk-danger-fg)]"
              : "bg-[var(--kpk-subtle)] text-[var(--kpk-primary)]"
          )}
          title={t("questionTime")}
        >
          {Math.max(0, questionLeft)}
        </div>

        {/* Buzilishlar hisoblagichi */}
        {guard.violations > 0 && (
          <div
            className="flex shrink-0 items-center gap-1.5 rounded-2xl bg-[var(--kpk-warn-bg)] px-3 py-2.5 text-xs font-black text-[var(--kpk-warn-fg)]"
            title={t("examViolation", { count: guard.violations, max: MAX_VIOLATIONS })}
          >
            <AlertTriangle className="size-4" />
            {guard.violations}/{MAX_VIOLATIONS}
          </div>
        )}
      </div>

      {/* ══ PROGRESS ══ */}
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--kpk-track)]">
        <div
          className="kpk-gradient h-full rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ══ SAVOLLAR XARITASI ══ */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {quizQuestions.map((item, index) => {
          const isCurrent = index === currentIndex;
          const isAnswered = answers[index] !== null;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={t("questionOf", { current: index + 1, total })}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "relative size-[30px] rounded-xl text-xs font-black transition-all duration-200",
                isCurrent
                  ? "kpk-gradient scale-110 text-white shadow-[0_6px_14px_rgba(13,110,253,0.3)]"
                  : isAnswered
                    ? "bg-[var(--kpk-info-bg)] text-[var(--kpk-info-fg)]"
                    : "bg-[var(--kpk-subtle)] text-[var(--kpk-muted)] hover:bg-[var(--kpk-hover)]"
              )}
            >
              {index + 1}
              {isAnswered && !isCurrent && (
                <CheckCircle2 className="absolute -right-1 -top-1 size-3.5 rounded-full bg-[var(--kpk-surface-solid)] text-[var(--kpk-ok-fg)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* ══ SAVOL VA VARIANTLAR ══
            Oyna fokusdan chiqsa xiralashadi — boshqa oynadan
            turib suratga olish qiyinlashadi. */}
      <div className="relative">
        <div
          key={question.id}
          className={cn(
            "animate-in fade-in-0 slide-in-from-right-3 duration-300",
            guard.hidden && "kpk-exam-blur"
          )}
        >
          <h3 className="mb-3.5 text-[17px] font-bold leading-snug text-[var(--kpk-text)]">
            <span className="mr-1.5 text-[var(--kpk-blue)]">{currentIndex + 1}.</span>
            {question.question}
          </h3>

          <div role="radiogroup" aria-label={question.question} className="space-y-2">
            {question.options.map((option, index) => {
              const isSelected = answers[currentIndex] === index;

              return (
                <button
                  key={index}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => selectAnswer(index)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left text-sm leading-snug transition-all duration-200",
                    isSelected
                      ? "border-transparent bg-[var(--kpk-blue)] text-white shadow-[0_8px_20px_rgba(13,110,253,0.24)]"
                      : "border-[var(--kpk-border)] bg-[var(--kpk-subtle)] text-[var(--kpk-text)] hover:-translate-y-0.5 hover:border-[var(--kpk-blue)]"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-colors",
                      isSelected
                        ? "bg-white/25 text-white"
                        : "bg-[var(--kpk-surface-solid)] text-[var(--kpk-muted)] group-hover:text-[var(--kpk-blue)]"
                    )}
                    aria-hidden
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="min-w-0 flex-1">{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fokus yo'qolganda ustiga ogohlantirish chiqadi */}
        {guard.hidden && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-[var(--kpk-surface)]/80 text-center backdrop-blur-sm">
            <EyeOff className="size-7 text-[var(--kpk-danger-fg)]" />
            <p className="max-w-[28ch] text-sm font-bold text-[var(--kpk-danger-fg)]">
              {t("examBlurText")}
            </p>
          </div>
        )}
      </div>

      {/* ══ NAVIGATSIYA ══ */}
      <div className="mt-4 flex items-center gap-2 border-t border-[var(--kpk-border)] pt-3.5">
        <Button
          variant="secondary"
          size="sm"
          className="rounded-xl"
          disabled={currentIndex === 0}
          onClick={() => goTo(currentIndex - 1)}
        >
          <ArrowLeft className="size-4" />
          {t("prev")}
        </Button>

        <span className="mx-auto text-xs font-black tabular-nums text-[var(--kpk-muted)]">
          {answeredCount} / {total}
        </span>

        {isLast ? (
          <Button variant="gradient" size="sm" className="rounded-xl" onClick={() => finish()}>
            <Flag className="size-4" />
            {t("finish")}
          </Button>
        ) : (
          <Button
            variant="gradient"
            size="sm"
            className="rounded-xl"
            onClick={() => goTo(currentIndex + 1)}
          >
            {t("next")}
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}