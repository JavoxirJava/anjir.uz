"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { submitTestAction } from "@/app/actions/tests";
import { uz } from "@/lib/strings/uz";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReadAloudButton } from "@/components/lectures/ReadAloudButton";
import { LiveRegion } from "@/components/a11y/LiveRegion";
import type { QuestionRow } from "@/lib/db/tests";

interface TestRunnerProps {
  test: {
    id: string;
    title: string;
    questions: QuestionRow[];
  };
  attemptId: string;
  timeLimitMinutes: number | null;
}

type AnswerMap = Record<string, {
  selectedOptionIds: string[];
  answerText: string;
}>;

export function TestRunner({ test, attemptId, timeLimitMinutes }: TestRunnerProps) {
  const router = useRouter();
  const questions = test.questions;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [secondsLeft, setSecondsLeft] = useState(
    timeLimitMinutes ? timeLimitMinutes * 60 : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveMsg, setLiveMsg] = useState("");
  const submitRef = useRef(false);

  const q = questions[current];

  // Local storage zaxirasi
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`test_${attemptId}`);
      if (saved) setAnswers(JSON.parse(saved));
    } catch {}
  }, [attemptId]);

  useEffect(() => {
    try {
      localStorage.setItem(`test_${attemptId}`, JSON.stringify(answers));
    } catch {}
  }, [answers, attemptId]);

  // Timer
  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s !== null ? s - 1 : null)), 1000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const handleSubmit = useCallback(async () => {
    if (submitRef.current) return;
    submitRef.current = true;
    setIsSubmitting(true);

    // Ball hisoblash
    let totalPoints = 0;
    let earnedPoints = 0;

    const answersPayload = questions.map((question) => {
      const ans = answers[question.id] ?? { selectedOptionIds: [], answerText: "" };
      const points = question.points ?? 1;
      totalPoints += points;

      let isCorrect = false;

      if (question.question_type === "fill_blank") {
        const correct = question.question_options?.[0]?.option_text ?? "";
        isCorrect = ans.answerText.trim().toLowerCase() === correct.trim().toLowerCase();
      } else if (question.question_type === "multiple") {
        const correctIds = (question.question_options ?? [])
          .filter((o) => o.is_correct)
          .map((o) => o.id);
        const selected = ans.selectedOptionIds;
        isCorrect =
          correctIds.length === selected.length &&
          correctIds.every((id) => selected.includes(id));
      } else {
        const correctId = question.question_options?.find((o) => o.is_correct)?.id;
        isCorrect = ans.selectedOptionIds.includes(correctId ?? "");
      }

      if (isCorrect) earnedPoints += points;

      return {
        questionId: question.id,
        selectedOptionIds: ans.selectedOptionIds,
        answerText: ans.answerText,
        isCorrect,
      };
    });

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    const result = await submitTestAction(attemptId, answersPayload, Math.round(score));

    // Local storage tozalash
    try { localStorage.removeItem(`test_${attemptId}`); } catch {}

    if (result?.error) {
      toast.error(result.error);
      submitRef.current = false;
      setIsSubmitting(false);
    } else {
      router.push(`/app/tests/${test.id}/result?attemptId=${attemptId}&score=${Math.round(score)}`);
    }
  }, [answers, attemptId, questions, router, test.id]);

  // Keyboard navigatsiyasi
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === "n") {
        if (current < questions.length - 1) setCurrent((c) => c + 1);
      }
      if (e.key === "ArrowLeft" || e.key === "p") {
        if (current > 0) setCurrent((c) => c - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, questions.length]);

  function setSelectedOptions(questionId: string, optionId: string, type: string) {
    setAnswers((prev) => {
      const cur = prev[questionId] ?? { selectedOptionIds: [], answerText: "" };
      let selected: string[];
      if (type === "single" || type === "true_false") {
        selected = [optionId];
      } else {
        selected = cur.selectedOptionIds.includes(optionId)
          ? cur.selectedOptionIds.filter((id) => id !== optionId)
          : [...cur.selectedOptionIds, optionId];
      }
      return { ...prev, [questionId]: { ...cur, selectedOptionIds: selected } };
    });
  }

  function setAnswerText(questionId: string, text: string) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...(prev[questionId] ?? { selectedOptionIds: [] }), answerText: text },
    }));
  }

  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    if (!a) return false;
    if (q.question_type === "fill_blank") return a.answerText.trim().length > 0;
    return a.selectedOptionIds.length > 0;
  }).length;

  const timerClass = secondsLeft !== null && secondsLeft < 60
    ? "text-destructive font-bold"
    : "text-muted-foreground";

  function formatTimer(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  return (
    <div className="space-y-4">
      <LiveRegion message={liveMsg} />

      {/* Progress va timer */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {/* Savol navigatsiya tugmalari */}
          <div className="flex gap-1 flex-wrap" role="group" aria-label="Savollar navigatsiyasi">
            {questions.map((_, i) => {
              const isAnswered = !!answers[questions[i].id]?.selectedOptionIds?.length ||
                !!answers[questions[i].id]?.answerText?.trim();
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setCurrent(i); setLiveMsg(`${i + 1}-savol`); }}
                  aria-label={`${i + 1}-savol${isAnswered ? " (javob berilgan)" : ""}`}
                  aria-current={i === current ? "step" : undefined}
                  className={`w-8 h-8 rounded text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring transition-colors ${
                    i === current
                      ? "bg-primary text-primary-foreground"
                      : isAnswered
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "border hover:bg-muted"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <span className="text-sm text-muted-foreground">
            {answeredCount}/{questions.length} javob
          </span>
        </div>

        {secondsLeft !== null && (
          <div
            className={`text-sm font-mono ${timerClass}`}
            aria-live={secondsLeft < 60 ? "assertive" : "off"}
            aria-label={`Qolgan vaqt: ${formatTimer(secondsLeft)}`}
            role="timer"
          >
            ⏱ {formatTimer(secondsLeft)}
          </div>
        )}
      </div>

      {/* Joriy savol */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">
                  {current + 1}/{questions.length}
                </span>
                <span className="text-xs text-muted-foreground">
                  {q.points} ball
                </span>
              </div>

              {/* Savol rasmi */}
              {q.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={q.image_url}
                  alt={q.image_alt ?? "Savol rasmi"}
                  className="max-h-48 rounded-lg object-contain border"
                />
              )}

              {/* Savol matni */}
              <p
                className="text-base font-medium leading-relaxed"
                id={`question-${q.id}`}
              >
                {q.question_text}
              </p>

              {/* Ovozli o'qish */}
              <ReadAloudButton
                text={`${current + 1}-savol. ${q.question_text}`}
                className="text-xs"
              />
            </div>
          </div>

          {/* Variantlar */}
          <fieldset aria-labelledby={`question-${q.id}`}>
            <legend className="sr-only">Javob variantlari</legend>

            {q.question_type === "fill_blank" ? (
              <div className="space-y-2">
                <label htmlFor={`fill-${q.id}`} className="text-sm text-muted-foreground">
                  Javobingizni kiriting:
                </label>
                <input
                  id={`fill-${q.id}`}
                  type="text"
                  value={answers[q.id]?.answerText ?? ""}
                  onChange={(e) => setAnswerText(q.id, e.target.value)}
                  placeholder="Javob..."
                  className="w-full rounded-lg border px-4 py-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  aria-required="true"
                />
              </div>
            ) : (
              <div className="space-y-2" role="group">
                {(q.question_options ?? []).map((opt, oi) => {
                  const isSelected = answers[q.id]?.selectedOptionIds?.includes(opt.id);
                  const inputType = q.question_type === "multiple" ? "checkbox" : "radio";

                  return (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type={inputType}
                        name={`q-${q.id}`}
                        checked={!!isSelected}
                        onChange={() => setSelectedOptions(q.id, opt.id, q.question_type)}
                        className="w-4 h-4 accent-primary"
                        aria-label={`${oi + 1}-variant: ${opt.option_text}`}
                      />
                      <span className="text-sm flex-1">
                        <span
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full border text-xs mr-2 font-medium"
                          aria-hidden="true"
                        >
                          {String.fromCharCode(65 + oi)}
                        </span>
                        {opt.option_text}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </fieldset>
        </CardContent>
      </Card>

      {/* Navigatsiya tugmalari */}
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => { setCurrent((c) => c - 1); setLiveMsg(`${current}-savol`); }}
          disabled={current === 0}
          aria-label={uz.student.prevQuestion}
        >
          ← {uz.student.prevQuestion}
        </Button>

        {current < questions.length - 1 ? (
          <Button
            type="button"
            onClick={() => { setCurrent((c) => c + 1); setLiveMsg(`${current + 2}-savol`); }}
            aria-label={uz.student.nextQuestion}
          >
            {uz.student.nextQuestion} →
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting ? uz.common.loading : uz.student.submitTest}
          </Button>
        )}
      </div>

      {/* Klaviatura yordam */}
      <p className="text-xs text-muted-foreground text-center" aria-label="Klaviatura yordam">
        ← → yoki N/P tugmalari bilan savollar o&apos;rtasida o&apos;tish mumkin
      </p>
    </div>
  );
}
