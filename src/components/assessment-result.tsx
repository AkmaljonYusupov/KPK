"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CircleCheck, CircleX, Unlock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { questions } from "@/data/questions";
import { useLanguage } from "@/i18n/language-provider";
import { getUnlockedCount } from "@/lib/progress";
import type { InitialTestResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AssessmentResultProps {
  result: InitialTestResult;
  answers: (number | null)[];
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
export function AssessmentResult({ result, answers }: AssessmentResultProps) {
  const { t, lang } = useLanguage();
  const tone = toneFor(result.percent);
  const unlocked = getUnlockedCount(result.percent);

  return (
    <div className="mx-auto w-full max-w-[620px] rounded-[20px] border border-[#e2e8f0] bg-white p-7 px-9 shadow-[0_10px_35px_rgba(0,0,0,0.08)] max-[640px]:px-6 max-[640px]:py-6">
      <div className="px-5 py-[30px] text-center">
        <div
          className={cn(
            "mx-auto mb-6 flex size-40 items-center justify-center rounded-full text-5xl font-extrabold text-white shadow-[0_15px_40px_rgba(0,0,0,0.2)]",
            TONE_CLASS[tone]
          )}
          role="img"
          aria-label={`${result.percent}%`}
        >
          {result.percent}%
        </div>

        <h1 className="text-2xl font-extrabold text-[var(--kpk-primary)]">{t("resultTitle")}</h1>

        <p className="mb-6 mt-4 text-lg text-[#475569]">
          {t("resultSummary")}{" "}
          <strong className="text-[var(--kpk-primary)]">
            {result.score} / {result.total}
          </strong>
        </p>

        <div className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full bg-[#eaf3ff] px-4 py-2 text-sm font-bold text-[#0d6efd]">
          <Unlock className="size-4" />
          {t("resultUnlocked", { count: unlocked })}
        </div>
      </div>

      {/* JAVOBLAR TAHLILI */}
      <section className="my-6 text-left">
        <h2 className="mb-3.5 text-base font-bold text-[var(--kpk-primary)]">{t("reviewTitle")}</h2>

        <ul className="space-y-3">
          {questions.map((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correct;
            const options = question.options[lang];

            return (
              <li
                key={question.id}
                className={cn(
                  "rounded-[14px] border-l-[5px] p-4",
                  isCorrect
                    ? "border-l-[#22c55e] bg-[#f0fdf4]"
                    : "border-l-[#ef4444] bg-[#fef2f2]"
                )}
              >
                <div className="mb-2.5 flex items-start gap-2 text-base text-[#1e293b]">
                  {isCorrect ? (
                    <CircleCheck className="mt-0.5 size-[18px] shrink-0 text-[#22c55e]" />
                  ) : (
                    <CircleX className="mt-0.5 size-[18px] shrink-0 text-[#ef4444]" />
                  )}
                  <span>
                    <strong>{index + 1}.</strong> {question.question[lang]}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <p className="rounded-lg bg-[#e0f2fe] px-3 py-1.5 text-[15px]">
                    {t("resultUserAnswer")}{" "}
                    <strong>
                      {userAnswer !== null ? options[userAnswer] : t("resultNoAnswer")}
                    </strong>
                  </p>

                  {!isCorrect && (
                    <p className="rounded-lg bg-[#dcfce7] px-3 py-1.5 text-[15px] text-[#166534]">
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
