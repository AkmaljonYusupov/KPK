"use client";

import * as React from "react";
import { CircleCheck, CircleX, ClipboardCheck, ListChecks, Lock, Timer, Unlock } from "lucide-react";

import { AssessmentQuiz } from "@/components/assessment-quiz";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Question } from "@/data/questions";
import { useLanguage } from "@/i18n/language-provider";
import { ASSESSMENT, MODULE_THRESHOLDS } from "@/lib/constants";
import { getUnlockedCount } from "@/lib/progress";
import type { InitialTestResult } from "@/lib/types";
import { cn } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════
   BO'LIMNI OCHISH MODALI

   Butun test shu oyna ichida o'tadi — alohida sahifa yo'q.
   Uch bosqich:

     1. intro  — nima uchun test kerakligi va shartlari
     2. quiz   — 15 ta savol, taymerlar bilan
     3. result — ball, foiz va nechta bo'lim ochilgani

   Natija localStorage'ga yoziladi; oyna yopilganda dashboard
   yangilanadi va ochilgan bo'limlar darhol ko'rinadi.
══════════════════════════════════════════════════════════════ */

type Phase = "intro" | "quiz" | "result";

interface ModuleGateDialogProps {
  /** Qaysi bo'lim bosilgani. null bo'lsa modal yopiq. */
  moduleId: number | null;
  /** Test topshirilganmi. */
  hasTest: boolean;
  /** Oxirgi natija (foiz). */
  percent: number;
  /** Nechanchi urinish bo'lgani. */
  attempt?: number;
  onOpenChange: (open: boolean) => void;
  /** Test yakunlangach dashboard progressni qayta o'qishi uchun. */
  onCompleted?: () => void;
}

export function ModuleGateDialog({
  moduleId,
  hasTest,
  percent,
  attempt,
  onOpenChange,
  onCompleted,
}: ModuleGateDialogProps) {
  const { t } = useLanguage();

  const [phase, setPhase] = React.useState<Phase>("intro");
  const [result, setResult] = React.useState<InitialTestResult | null>(null);
  const [reviewed, setReviewed] = React.useState<Question[]>([]);
  const [answers, setAnswers] = React.useState<(number | null)[]>([]);

  const open = moduleId !== null;

  /* Oyna har ochilganda boshidan boshlanadi — aks holda oldingi
     urinishning natija ekrani qolib ketardi. */
  React.useEffect(() => {
    if (open) setPhase("intro");
  }, [open]);

  const threshold = moduleId ? (MODULE_THRESHOLDS[moduleId] ?? 0) : 0;
  const minutes = Math.round(ASSESSMENT.questionSeconds / 60);

  const handleFinish = React.useCallback(
    (finished: InitialTestResult, quizQuestions: Question[]) => {
      setResult(finished);
      setReviewed(quizQuestions);
      setAnswers(finished.answers ?? []);
      setPhase("result");
      onCompleted?.();
    },
    [onCompleted]
  );

  /* Test ketayotganda tasodifan yopilib qolmasin — foydalanuvchi
     faqat "Testni yakunlash" orqali chiqadi. */
  const handleOpenChange = (next: boolean) => {
    if (!next && phase === "quiz") return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        hideClose={phase === "quiz"}
        className={cn(
          "text-center",
          phase === "intro"
            ? "w-[min(430px,calc(100vw-32px))]"
            : "w-[min(620px,calc(100vw-24px))] max-w-none p-6 max-sm:p-4"
        )}
      >
        {/* ══ 1. KIRISH ══ */}
        {phase === "intro" && (
          <>
            <div
              className={cn(
                "mx-auto mb-[18px] flex size-[82px] items-center justify-center rounded-3xl text-white max-sm:size-[72px]",
                hasTest
                  ? "bg-[linear-gradient(135deg,#fbbf24,#d97706)] shadow-[0_18px_45px_rgba(217,119,6,0.28)]"
                  : "kpk-gradient shadow-[0_18px_45px_rgba(13,110,253,0.28)]"
              )}
              aria-hidden
            >
              {hasTest ? <Lock className="size-9" /> : <ClipboardCheck className="size-9" />}
            </div>

            <DialogHeader>
              <DialogTitle>{t("gateTitle")}</DialogTitle>
              <DialogDescription>
                {hasTest
                  ? t("gateTextLocked", { percent: threshold, current: percent })
                  : t("gateText", { count: ASSESSMENT.questionCount, minutes })}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-[var(--kpk-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--kpk-muted)]">
                <ListChecks className="size-3.5" />
                {t("gateQuestions", { count: ASSESSMENT.questionCount })}
              </span>

              <span className="flex items-center gap-1.5 rounded-full bg-[var(--kpk-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--kpk-muted)]">
                <Timer className="size-3.5" />
                {t("gateMinutes", { minutes: Math.round(ASSESSMENT.totalSeconds / 60) })}
              </span>

              {hasTest && attempt ? (
                <span className="flex items-center gap-1.5 rounded-full bg-[var(--kpk-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--kpk-muted)]">
                  {t("gateAttempt", { count: attempt })}
                </span>
              ) : null}
            </div>

            <DialogFooter className="mt-7">
              <Button variant="secondary" size="lg" onClick={() => onOpenChange(false)}>
                {t("gateLater")}
              </Button>

              <Button variant="gradient" size="lg" onClick={() => setPhase("quiz")}>
                <ClipboardCheck className="size-4" />
                {hasTest ? t("gateRetake") : t("gateStart")}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ══ 2. TEST ══ */}
        {phase === "quiz" && (
          <>
            <DialogTitle className="mb-1 text-left text-lg">{t("assessmentTitle")}</DialogTitle>
            <DialogDescription className="mb-4 text-left text-[13px]">
              {t("assessmentDesc")}
            </DialogDescription>

            <AssessmentQuiz onFinish={handleFinish} />
          </>
        )}

        {/* ══ 3. NATIJA ══ */}
        {phase === "result" && result && (
          <ResultPanel
            result={result}
            answers={answers}
            reviewed={reviewed}
            onClose={() => onOpenChange(false)}
            onRetake={() => setPhase("quiz")}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ── Natija ekrani ─────────────────────────────────────────── */

function ResultPanel({
  result,
  answers,
  reviewed,
  onClose,
  onRetake,
}: {
  result: InitialTestResult;
  answers: (number | null)[];
  reviewed: Question[];
  onClose: () => void;
  onRetake: () => void;
}) {
  const { t } = useLanguage();
  const unlocked = getUnlockedCount(result.percent, true);

  const tone =
    result.percent >= 70 ? "ok" : result.percent >= 40 ? "warn" : "danger";

  const toneClass = {
    ok: "bg-[linear-gradient(135deg,#22c55e,#4ade80)]",
    warn: "bg-[linear-gradient(135deg,#eab308,#facc15)]",
    danger: "bg-[linear-gradient(135deg,#ef4444,#f87171)]",
  }[tone];

  return (
    <div>
      <DialogTitle className="sr-only">{t("resultTitle")}</DialogTitle>

      <div
        className={cn(
          "mx-auto mb-4 flex size-[110px] flex-col items-center justify-center rounded-full text-white shadow-[var(--kpk-shadow)]",
          toneClass
        )}
      >
        <strong className="text-[34px] font-black leading-none">{result.percent}%</strong>
        <span className="mt-1 text-xs font-bold opacity-90">
          {result.score} / {result.total}
        </span>
      </div>

      <h2 className="mb-1.5 text-xl font-extrabold text-[var(--kpk-primary)]">
        {t("resultTitle")}
      </h2>

      <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--kpk-accent-soft)] px-4 py-2 text-sm font-bold text-[var(--kpk-blue)]">
        <Unlock className="size-4" />
        {t("resultUnlocked", { count: unlocked })}
      </div>

      {/* Javoblar tahlili — modal ichida skroll bo'ladi */}
      <section className="kpk-scroll max-h-[38vh] overflow-y-auto pr-1 text-left">
        <h3 className="mb-2.5 text-sm font-bold text-[var(--kpk-primary)]">{t("reviewTitle")}</h3>

        <ul className="space-y-2">
          {reviewed.map((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correct;

            return (
              <li
                key={question.id}
                className={cn(
                  "rounded-xl border-l-4 p-3 text-[13px]",
                  isCorrect
                    ? "border-l-[var(--kpk-ok-fg)] bg-[var(--kpk-ok-bg)]"
                    : "border-l-[var(--kpk-danger-fg)] bg-[var(--kpk-danger-bg)]"
                )}
              >
                <div className="mb-1.5 flex items-start gap-2 font-semibold text-[var(--kpk-text)]">
                  {isCorrect ? (
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-[var(--kpk-ok-fg)]" />
                  ) : (
                    <CircleX className="mt-0.5 size-4 shrink-0 text-[var(--kpk-danger-fg)]" />
                  )}
                  <span>
                    {index + 1}. {question.question}
                  </span>
                </div>

                <p className="text-[var(--kpk-muted)]">
                  {t("resultUserAnswer")}{" "}
                  <strong className="text-[var(--kpk-text)]">
                    {userAnswer !== null ? question.options[userAnswer] : t("resultNoAnswer")}
                  </strong>
                </p>

                {isCorrect ? null : (
                  <p className="mt-0.5 text-[var(--kpk-muted)]">
                    {t("resultCorrectAnswer")}{" "}
                    <strong className="text-[var(--kpk-ok-fg)]">
                      {question.options[question.correct]}
                    </strong>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <DialogFooter className="mt-5">
        <Button variant="secondary" size="lg" onClick={onRetake}>
          {t("retakeTest")}
        </Button>

        <Button variant="gradient" size="lg" onClick={onClose}>
          {t("resultGoDashboard")}
        </Button>
      </DialogFooter>
    </div>
  );
}