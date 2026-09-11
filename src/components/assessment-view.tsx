"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowLeftCircle,
  ArrowRightCircle,
  GraduationCap,
  Hourglass,
  Timer,
} from "lucide-react";

import { AssessmentResult } from "@/components/assessment-result";
import { useAuth } from "@/components/auth-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { questions } from "@/data/questions";
import { useLanguage } from "@/i18n/language-provider";
import { ASSESSMENT } from "@/lib/constants";
import { buildProgress } from "@/lib/progress";
import { getStoredProgress, setStoredProgress } from "@/lib/storage";
import type { KpkProgress } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";

type Phase = "checking" | "running" | "finished";

/**
 * Baholash testi — IXTIYORIY.
 *   • 20 daqiqalik umumiy vaqt
 *   • har bir savol uchun 30 soniya, tugasa avtomatik keyingisiga o'tadi
 *   • istalgan vaqtda qayta topshirsa bo'ladi
 * Qo'shimchalar: savollar xaritasi, klaviatura yorliqlari,
 * yakunlashni tasdiqlash va sahifadan chiqishdan ogohlantirish.
 */
export function AssessmentView() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const { user, isLoading } = useAuth();

  const [phase, setPhase] = React.useState<Phase>("checking");
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<(number | null)[]>(() =>
    questions.map(() => null)
  );
  const [totalTime, setTotalTime] = React.useState<number>(ASSESSMENT.totalSeconds);
  const [questionTime, setQuestionTime] = React.useState<number>(ASSESSMENT.questionSeconds);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [result, setResult] = React.useState<KpkProgress["initialTest"] | null>(null);

  const total = questions.length;
  const isLast = currentIndex === total - 1;
  const answeredCount = answers.filter((value) => value !== null).length;
  const unanswered = total - answeredCount;

  /* ── Kirish nazorati: faqat mehmon login sahifasiga qaytariladi ── */
  React.useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/");
      return;
    }

    // Test ixtiyoriy: avval topshirgan bo'lsa ham qayta topshirsa bo'ladi.
    setPhase("running");
  }, [isLoading, user, router]);

  /* ── Testni yakunlash ── */
  const finish = React.useCallback(() => {
    setPhase((previous) => {
      if (previous !== "running") return previous;

      const score = questions.reduce(
        (sum, question, index) => (answers[index] === question.correct ? sum + 1 : sum),
        0
      );

      const progress = buildProgress({
        previous: getStoredProgress(),
        score,
        total,
        answers,
      });

      setStoredProgress(progress);
      setResult(progress.initialTest ?? null);

      return "finished";
    });
  }, [answers, total]);

  /* ── Umumiy taymer ── */
  React.useEffect(() => {
    if (phase !== "running") return;

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
  }, [phase, finish]);

  /* ── Keyingi savolga o'tish ── */
  const goNext = React.useCallback(() => {
    setCurrentIndex((previous) => {
      if (previous < total - 1) return previous + 1;
      return previous;
    });
  }, [total]);

  /* ── Savol taymeri: har savolda 30 soniyadan qayta boshlanadi ── */
  React.useEffect(() => {
    if (phase !== "running") return;

    setQuestionTime(ASSESSMENT.questionSeconds);

    const interval = window.setInterval(() => {
      setQuestionTime((previous) => {
        if (previous <= 1) {
          window.clearInterval(interval);
          if (isLast) {
            finish();
          } else {
            goNext();
          }
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [phase, currentIndex, isLast, finish, goNext]);

  /* ── Tasodifan sahifani yopishdan ogohlantirish ── */
  React.useEffect(() => {
    if (phase !== "running") return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [phase]);

  /* ── Klaviatura yorliqlari: 1–4 variant, ←/→ navigatsiya ── */
  React.useEffect(() => {
    if (phase !== "running" || confirmOpen) return;

    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.tagName === "INPUT") return;

      const optionCount = questions[currentIndex].options[lang].length;
      const numeric = Number.parseInt(event.key, 10);

      if (!Number.isNaN(numeric) && numeric >= 1 && numeric <= optionCount) {
        event.preventDefault();
        selectAnswer(numeric - 1);
        return;
      }

      if (event.key === "ArrowRight" && !isLast) {
        event.preventDefault();
        goNext();
      }

      if (event.key === "ArrowLeft" && currentIndex > 0) {
        event.preventDefault();
        setCurrentIndex((previous) => previous - 1);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, confirmOpen, currentIndex, isLast, lang, goNext]);

  function selectAnswer(optionIndex: number) {
    setAnswers((previous) => {
      const next = [...previous];
      next[currentIndex] = optionIndex;
      return next;
    });
  }

  /* ── Yuklanish holati ── */
  if (phase === "checking") {
    return (
      <div className="mx-auto w-full max-w-[620px] rounded-[20px] border border-[#e2e8f0] bg-white p-7 px-9 shadow-[0_10px_35px_rgba(0,0,0,0.08)] max-[640px]:px-6 max-[640px]:py-6">
        <div className="mb-5 flex items-center gap-3">
          <Skeleton className="size-12 rounded-[14px]" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3.5 w-1/2" />
          </div>
        </div>
        <Skeleton className="mb-[18px] h-11 w-full rounded-[14px]" />
        <Skeleton className="mb-6 h-[7px] w-full" />
        <Skeleton className="mb-5 h-6 w-3/4" />
        <div className="space-y-2.5">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-[52px] w-full rounded-[14px]" />
          ))}
        </div>
        <span className="sr-only">{t("loadingQuestions")}</span>
      </div>
    );
  }

  /* ── Natija ── */
  if (phase === "finished" && result) {
    return <AssessmentResult result={result} answers={answers} />;
  }

  const question = questions[currentIndex];
  const percent = ((currentIndex + 1) / total) * 100;
  const questionTimeLow = questionTime <= 5;

  return (
    <>
      <div className="mx-auto w-full max-w-[620px] rounded-[20px] border border-[#e2e8f0] bg-white p-7 px-9 shadow-[0_10px_35px_rgba(0,0,0,0.08)] max-[640px]:px-6 max-[640px]:py-6">
        {/* HEADER */}
        <div className="mb-5 flex items-center gap-3">
          <div className="kpk-gradient flex size-12 shrink-0 items-center justify-center rounded-[14px] text-white">
            <GraduationCap className="size-6" />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-[22px] font-bold leading-tight text-[#1e293b] max-[640px]:text-lg">
              {t("assessmentTitle")}
            </h1>
            <p className="text-sm text-[#64748b]">{t("assessmentDesc")}</p>
          </div>

          <LanguageSwitcher />
        </div>

        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/dashboard">
            <ArrowLeft className="size-4" />
            {t("moduleBack")}
          </Link>
        </Button>

        {/* UMUMIY TAYMER */}
        <div className="mb-[18px] flex items-center gap-2.5 rounded-[14px] bg-[#f8fafc] px-4 py-2.5">
          <Timer className="size-[18px] text-[#64748b]" />
          <span className="text-sm text-[#64748b]">{t("remainingTime")}</span>
          <strong
            className={cn(
              "ml-auto text-[22px] font-bold tabular-nums",
              totalTime <= 60 ? "text-[#dc2626]" : "text-[#1e293b]"
            )}
            aria-live="polite"
          >
            {formatTime(totalTime)}
          </strong>
        </div>

        {/* PROGRESS */}
        <Progress
          value={percent}
          className="mb-6"
          aria-label={t("questionOf", { current: currentIndex + 1, total })}
        />

        {/* SAVOLLAR XARITASI */}
        <div className="mb-6 flex flex-wrap gap-2">
          {questions.map((item, index) => {
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
                  "size-9 rounded-xl border-2 text-sm font-bold transition-all",
                  isCurrent
                    ? "border-[#0d6efd] bg-[#0d6efd] text-white"
                    : isAnswered
                      ? "border-[#bfdbfe] bg-[#e0f2fe] text-[#0d6efd]"
                      : "border-[#e2e8f0] bg-[#f8fafc] text-[#94a3b8] hover:border-[#94a3b8]"
                )}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {/* SAVOL */}
        <div key={question.id} className="animate-in fade-in-0 slide-in-from-right-2 duration-300">
          <h2 className="mb-[22px] text-xl font-semibold leading-[1.45] text-[#1e293b]">
            {currentIndex + 1}. {question.question[lang]}
          </h2>

          <div role="radiogroup" aria-label={question.question[lang]}>
            {question.options[lang].map((option, index) => {
              const isSelected = answers[currentIndex] === index;

              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => selectAnswer(index)}
                  className={cn(
                    "mb-2.5 flex w-full items-center gap-3 rounded-[14px] border-2 px-[18px] py-3.5 text-left text-[15.8px] transition-all duration-200",
                    isSelected
                      ? "border-[#0d6efd] bg-[#0d6efd] text-white"
                      : "border-[#e2e8f0] bg-[#f8fafc] hover:border-[#94a3b8] hover:bg-[#f0f7ff]"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                      isSelected ? "bg-white/20 text-white" : "bg-white text-[#94a3b8]"
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

        {/* SAVOL TAYMERI */}
        <div className="my-4 flex items-center gap-2 text-sm text-[#64748b]">
          <Hourglass className={cn("size-4", questionTimeLow && "text-[#dc2626]")} />
          <span>{t("questionTime")}</span>
          <strong
            className={cn("tabular-nums", questionTimeLow ? "text-[#dc2626]" : "text-[#1e293b]")}
            aria-live="polite"
          >
            {questionTime}
          </strong>
          <span>{t("seconds")}</span>

          <span className="ml-auto text-xs text-[#94a3b8]">
            {answeredCount} / {total}
          </span>
        </div>

        {/* NAVIGATSIYA */}
        <div className="mt-6 flex gap-3">
          <Button
            variant="soft"
            size="lg"
            className="h-12 flex-1 rounded-xl"
            onClick={() => setCurrentIndex((previous) => Math.max(0, previous - 1))}
            disabled={currentIndex === 0}
          >
            <ArrowLeftCircle className="size-[18px]" />
            {t("prev")}
          </Button>

          {isLast ? (
            <Button
              variant="gradient"
              size="lg"
              className="h-12 flex-1 rounded-xl"
              onClick={() => setConfirmOpen(true)}
            >
              {t("finish")}
            </Button>
          ) : (
            <Button
              variant="gradient"
              size="lg"
              className="h-12 flex-1 rounded-xl"
              onClick={goNext}
            >
              {t("next")}
              <ArrowRightCircle className="size-[18px]" />
            </Button>
          )}
        </div>
      </div>

      {/* YAKUNLASHNI TASDIQLASH */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmFinishTitle")}</DialogTitle>
            <DialogDescription className="mb-7">
              {unanswered > 0
                ? t("confirmFinishText", { unanswered })
                : t("confirmFinishTextAll")}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={() => setConfirmOpen(false)}
            >
              {t("confirmFinishCancel")}
            </Button>
            <Button
              variant="gradient"
              size="lg"
              className="flex-1"
              onClick={() => {
                setConfirmOpen(false);
                finish();
              }}
            >
              {t("confirmFinishOk")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}