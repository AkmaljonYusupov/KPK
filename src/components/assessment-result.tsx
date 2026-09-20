"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CircleCheck, CircleX, Unlock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { questions, type Question } from "@/data/questions";
import { useLanguage } from "@/i18n/language-provider";
import { getUnlockedCount } from "@/lib/progress";
import type { InitialTestResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AssessmentResultProps {
  result: InitialTestResult;
  answers: (number | null)[];
  /** Shu urinishda tushgan savollar. Berilmasa, natijadagi
      questionIds bo'yicha bazadan tiklanadi. */
  quizQuestions?: Question[];
}

/** Foizga qarab natija doirasining rangini tanlaydi. */
function toneFor(percent: number): "success" | "warning" | "danger" {
  if (percent >= 70) return "success";
  if (percent >= 40) return "warning";
  return "danger";
}

const TONE_CLASS = {
  success: "bg-[linear-gradient(135deg,#22c55e,#4ade80)]",
  warning: "bg-[linear-gradient(135deg,#eab308,#facc15)]",
  danger: "bg-[linear-gradient(135deg,#ef4444,#f87171)]",
} as const;

/**
 * Test natijasi sahifasi — original finishAssessment() chiqargan
 * HTML ning React ko'rinishi: foiz doirasi, xulosa va javoblar tahlili.
 */
export function AssessmentResult({ result, answers, quizQuestions }: AssessmentResultProps) {
  const { t } = useLanguage();

  /* Tahlil uchun aynan shu urinishda tushgan savollar kerak.
     Sahifa yangilangan bo'lsa ular prop orqali kelmaydi —
     o'shanda saqlangan id'lar bo'yicha bazadan topamiz. */
  const reviewed = React.useMemo<Question[]>(() => {
    if (quizQuestions && quizQuestions.length > 0) return quizQuestions;

    const ids = result.questionIds ?? [];
    const byId = new Map(questions.map((question) => [question.id, question]));

    return ids
      .map((id) => byId.get(id))
      .filter((question): question is Question => question !== undefined);
  }, [quizQuestions, result.questionIds]);

  const tone = toneFor(result.percent);
  const unlocked = getUnlockedCount(result.percent);

  return (
    <div className="mx-auto w-full max-w-[620px] rounded-[20px] border border-[var(--kpk-border)] bg-[var(--kpk-surface-solid)] p-7 px-9 shadow-[var(--kpk-shadow)] max-[640px]:px-6 max-[640px]:py-6">
      <div className="px-5 py-[30px] text-center">
        <div
          className={cn(
            "mx-auto mb-6 flex size-40 items-center justify-center rounded-full text-5xl font-extrabold text-white shadow-[var(--kpk-shadow)]",
            TONE_CLASS[tone]
          )}
          role="img"
          aria-label={`${result.percent}%`}
        >
          {result.percent}%
        </div>

        <h1 className="text-2xl font-extrabold text-[var(--kpk-primary)]">{t("resultTitle")}</h1>

        <p className="mb-6 mt-4 text-lg text-[var(--kpk-muted)]">
          {t("resultSummary")}{" "}
          <strong className="text-[var(--kpk-primary)]">
            {result.score} / {result.total}
          </strong>
        </p>

        <div className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--kpk-accent-soft)] px-4 py-2 text-sm font-bold text-[#0d6efd]">
          <Unlock className="size-4" />
          {t("resultUnlocked", { count: unlocked })}
        </div>
      </div>

      {/* JAVOBLAR TAHLILI */}
      <section className="my-6 text-left">
        <h2 className="mb-3.5 text-base font-bold text-[var(--kpk-primary)]">{t("reviewTitle")}</h2>

        <ul className="space-y-3">
          {reviewed.map((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correct;
            const options = question.options;

            return (
              <li
                key={question.id}
                className={cn(
                  "rounded-[14px] border-l-[5px] p-4",
                  isCorrect
                    ? "border-l-[var(--kpk-ok-fg)] bg-[var(--kpk-ok-bg)]"
                    : "border-l-[var(--kpk-danger-fg)] bg-[var(--kpk-danger-bg)]"
                )}
              >
                <div className="mb-2.5 flex items-start gap-2 text-base text-[var(--kpk-text)]">
                  {isCorrect ? (
                    <CircleCheck className="mt-0.5 size-[18px] shrink-0 text-[var(--kpk-ok-fg)]" />
                  ) : (
                    <CircleX className="mt-0.5 size-[18px] shrink-0 text-[var(--kpk-danger-fg)]" />
                  )}
                  <span>
                    <strong>{index + 1}.</strong> {question.question}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <p className="rounded-lg bg-[var(--kpk-info-bg)] px-3 py-1.5 text-[15px]">
                    {t("resultUserAnswer")}{" "}
                    <strong>
                      {userAnswer !== null ? options[userAnswer] : t("resultNoAnswer")}
                    </strong>
                  </p>

                  {!isCorrect && (
                    <p className="rounded-lg bg-[var(--kpk-ok-bg)] px-3 py-1.5 text-[15px] text-[var(--kpk-ok-fg)]">
                      {t("resultCorrectAnswer")} <strong>{options[question.correct]}</strong>
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <Button asChild variant="gradient" size="xl" className="w-full">
        <Link href="/dashboard">
          {t("resultGoDashboard")}
          <ArrowRight className="size-5" />
        </Link>
      </Button>
    </div>
  );
}