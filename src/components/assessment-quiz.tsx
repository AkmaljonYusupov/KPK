"use client";

import * as React from "react";
import { ArrowLeftCircle, ArrowRightCircle, Hourglass, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { pickRandomQuestions, type Question } from "@/data/questions";
import { useLanguage } from "@/i18n/language-provider";
import { ASSESSMENT } from "@/lib/constants";
import { buildProgress } from "@/lib/progress";
import { getStoredProgress, setStoredProgress } from "@/lib/storage";
import type { InitialTestResult } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════
   BILIMNI BAHOLASH TESTI — modal ichida ishlaydigan ixcham versiya.

   • 150 talik bazadan tasodifiy 15 ta savol
   • har savolga 1 daqiqa, vaqt tugasa avtomatik keyingisiga
   • umumiy vaqt 15 daqiqa, tugasa test yakunlanadi

   Natija localStorage'ga yoziladi va `onFinish` orqali qaytariladi,
   shunda modal darhol natija ekraniga o'tadi.
══════════════════════════════════════════════════════════════ */

interface AssessmentQuizProps {
  onFinish: (result: InitialTestResult, quizQuestions: Question[]) => void;
}

export function AssessmentQuiz({ onFinish }: AssessmentQuizProps) {
  const { t } = useLanguage();

  /* Savollar bir marta tanlanadi — lazy initializer faqat birinchi
     renderda ishlaydi, shuning uchun qayta chizishda o'zgarmaydi. */
  const [quizQuestions] = React.useState<Question[]>(() =>
    pickRandomQuestions(ASSESSMENT.questionCount)
  );

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<(number | null)[]>(() =>
    Array.from({ length: ASSESSMENT.questionCount }, () => null)
  );
  const [totalTime, setTotalTime] = React.useState<number>(ASSESSMENT.totalSeconds);
  const [questionTime, setQuestionTime] = React.useState<number>(ASSESSMENT.questionSeconds);
  const [done, setDone] = React.useState(false);

  const total = quizQuestions.length;
  const isLast = currentIndex === total - 1;
  const answeredCount = answers.filter((value) => value !== null).length;

  /* Yakunlash callback'i eng so'nggi javoblarni ko'rishi kerak,
     shuning uchun ref orqali beriladi — taymer effektlari qayta
     yaratilmaydi va sanoq uzilmaydi. */
  const answersRef = React.useRef(answers);
  answersRef.current = answers;

  const finish = React.useCallback(() => {
    if (done) return;
    setDone(true);

    const current = answersRef.current;

    const score = quizQuestions.reduce(
      (sum, question, index) => (current[index] === question.correct ? sum + 1 : sum),
      0
    );

    const previous = getStoredProgress();

    const progress = buildProgress({
      previous,
      score,
      total,
      answers: current,
    });

    if (progress.initialTest) {
      // Qaysi savollar tushgani va nechanchi urinish ekani ham saqlanadi.
      progress.initialTest.questionIds = quizQuestions.map((question) => question.id);
      progress.initialTest.attempt = (previous.initialTest?.attempt ?? 0) + 1;
    }

    setStoredProgress(progress);

    if (progress.initialTest) onFinish(progress.initialTest, quizQuestions);
  }, [done, onFinish, quizQuestions, total]);

  /* ── Umumiy taymer ── */
  React.useEffect(() => {
    if (done) return;

    const interval = window.setInterval(() => {
      setTotalTime((previous) => {
        if (previous <= 1) {
          window.clearInterval(interval);
          finish();
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [done, finish]);

  /* ── Savol taymeri: har savolda qaytadan boshlanadi ── */
  React.useEffect(() => {
    if (done) return;

    setQuestionTime(ASSESSMENT.questionSeconds);

    const interval = window.setInterval(() => {
      setQuestionTime((previous) => {
        if (previous <= 1) {
          window.clearInterval(interval);
          if (isLast) finish();
          else setCurrentIndex((index) => index + 1);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [currentIndex, done, isLast, finish]);

  const selectAnswer = (optionIndex: number) => {
    setAnswers((previous) => {
      const next = [...previous];
      next[currentIndex] = optionIndex;
      return next;
    });
  };

  const question = quizQuestions[currentIndex];
  const percent = ((currentIndex + 1) / total) * 100;
  const timeLow = questionTime <= 10;

  return (
    <div className="text-left">
      {/* ── TAYMERLAR ── */}
      <div className="mb-3 flex items-center gap-2">
        <span className="flex flex-1 items-center gap-2 rounded-xl bg-[var(--kpk-subtle)] px-3 py-2">
          <Timer className="size-4 shrink-0 text-[var(--kpk-muted)]" />
          <span className="truncate text-xs text-[var(--kpk-muted)]">{t("remainingTime")}</span>
          <strong
            className={cn(
              "ml-auto text-sm font-bold tabular-nums",
              totalTime <= 60 ? "text-[var(--kpk-danger-fg)]" : "text-[var(--kpk-text)]"
            )}
            aria-live="polite"
          >
            {formatTime(totalTime)}
          </strong>
        </span>

        <span
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold tabular-nums",
            timeLow
              ? "bg-[var(--kpk-danger-bg)] text-[var(--kpk-danger-fg)]"
              : "bg-[var(--kpk-subtle)] text-[var(--kpk-text)]"
          )}
        >
          <Hourglass className="size-4" />
          {questionTime}
        </span>
      </div>

      {/* ── PROGRESS ── */}
      <Progress
        value={percent}
        className="mb-3"
        aria-label={t("questionOf", { current: currentIndex + 1, total })}
      />

      {/* ── SAVOLLAR XARITASI ── */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {quizQuestions.map((item, index) => {
          const isCurrent = index === currentIndex;
          const isAnswered = answers[index] !== null;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={t("questionOf", { current: index + 1, total })}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "size-7 rounded-lg border text-xs font-bold transition-all",
                isCurrent
                  ? "border-[var(--kpk-blue)] bg-[var(--kpk-blue)] text-white"
                  : isAnswered
                    ? "border-[var(--kpk-border)] bg-[var(--kpk-info-bg)] text-[var(--kpk-info-fg)]"
                    : "border-[var(--kpk-border)] bg-[var(--kpk-subtle)] text-[var(--kpk-muted)] hover:border-[var(--kpk-blue)]"
              )}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* ── SAVOL ── */}
      <div key={question.id} className="animate-in fade-in-0 slide-in-from-right-2 duration-300">
        <h3 className="mb-3.5 text-[17px] font-bold leading-snug text-[var(--kpk-text)]">
          {currentIndex + 1}. {question.question}
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
                  "flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-sm leading-snug transition-all",
                  isSelected
                    ? "border-[var(--kpk-blue)] bg-[var(--kpk-blue)] text-white"
                    : "border-[var(--kpk-border)] bg-[var(--kpk-subtle)] text-[var(--kpk-text)] hover:border-[var(--kpk-blue)] hover:bg-[var(--kpk-hover)]"
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-[var(--kpk-surface-solid)] text-[var(--kpk-muted)]"
                  )}
                  aria-hidden
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── NAVIGATSIYA ── */}
      <div className="mt-4 flex items-center gap-2 border-t border-[var(--kpk-border)] pt-3.5">
        <Button
          variant="secondary"
          size="sm"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
        >
          <ArrowLeftCircle className="size-4" />
          {t("prev")}
        </Button>

        <span className="mx-auto text-xs font-bold text-[var(--kpk-muted)]">
          {answeredCount} / {total}
        </span>

        {isLast ? (
          <Button variant="gradient" size="sm" onClick={finish}>
            {t("finish")}
          </Button>
        ) : (
          <Button
            variant="gradient"
            size="sm"
            onClick={() => setCurrentIndex((index) => Math.min(total - 1, index + 1))}
          >
            {t("next")}
            <ArrowRightCircle className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}