"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAccessibility } from "@/components/providers/AccessibilityProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveEntryTestAction } from "@/app/actions/onboarding";

type Phase = "screening" | "entry_test" | "done";
type FontSize = "small" | "medium" | "large" | "xlarge";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  points: number;
  order: number;
  question_options: { id: string; option_text: string; is_correct: boolean }[];
}

interface Props {
  test: { id: string; title: string; description: string; time_limit: number } | null;
  questions: Question[];
}

export function OnboardingFlow({ test, questions }: Props) {
  const router = useRouter();
  const { updateSettings } = useAccessibility();
  const [isPending, startTransition] = useTransition();

  const [phase, setPhase] = useState<Phase>("screening");

  // Screening state
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [hearingOk, setHearingOk] = useState<boolean | null>(null);

  // Entry test state
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);

  function finishScreening() {
    updateSettings({ fontSize, reduceMotion });
    if (test && questions.length > 0) {
      setPhase("entry_test");
    } else {
      finishAll(0, 0);
    }
  }

  function selectAnswer(questionId: string, optionId: string) {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  }

  function nextQuestion() {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
    } else {
      // Natijani hisoblash
      let correct = 0;
      questions.forEach(q => {
        const chosen = answers[q.id];
        if (chosen) {
          const opt = q.question_options.find(o => o.id === chosen);
          if (opt?.is_correct) correct++;
        }
      });
      setScore(correct);
      setPhase("done");
      finishAll(correct, questions.length);
    }
  }

  function finishAll(correct: number, total: number) {
    startTransition(async () => {
      if (test) {
        await saveEntryTestAction(test.id, answers, correct, total);
      }
      localStorage.setItem("anjir_onboarding", "1");
    });
  }

  function goToPending() {
    router.push("/pending");
  }

  // ===== SCREENING PHASE =====
  if (phase === "screening") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="text-4xl">&#9881;&#65039;</div>
            <h1 className="text-2xl font-black">Interfeys sozlamalari</h1>
            <p className="text-muted-foreground text-sm">
              Qulay foydalanish uchun bir necha savolga javob bering. Istalgan vaqt o&apos;zgartirishingiz mumkin.
            </p>
          </div>

          {/* Shrift o'lchami */}
          <Card>
            <CardHeader><CardTitle className="text-base">&#128221; Shrift o&apos;lchami</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: "small", label: "Kichik", size: "text-sm" },
                  { value: "medium", label: "O'rta", size: "text-base" },
                  { value: "large", label: "Katta", size: "text-lg" },
                  { value: "xlarge", label: "Juda katta", size: "text-xl" },
                ] as { value: FontSize; label: string; size: string }[]).map(f => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFontSize(f.value)}
                    className={`rounded-xl border-2 p-4 text-left transition-all ${
                      fontSize === f.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <span className={`font-semibold ${f.size}`}>{f.label}</span>
                    <p className={`text-muted-foreground mt-1 ${f.size}`}>Namuna matn</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Eshitish */}
          <Card>
            <CardHeader><CardTitle className="text-base">&#128266; Ovoz va subtitrlar</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Video darslarda subtitrlarni doim ko&apos;rsatsinmi?</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setHearingOk(false)}
                  className={`flex-1 rounded-xl border-2 p-3 text-sm font-semibold transition-all ${
                    hearingOk === false ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                  }`}
                >
                  &#9989; Ha, doim ko&apos;rsat
                </button>
                <button
                  type="button"
                  onClick={() => setHearingOk(true)}
                  className={`flex-1 rounded-xl border-2 p-3 text-sm font-semibold transition-all ${
                    hearingOk === true ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                  }`}
                >
                  &#10060; Kerak emas
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Animatsiyalar */}
          <Card>
            <CardHeader><CardTitle className="text-base">&#10024; Animatsiyalar</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Ba&apos;zi foydalanuvchilar uchun animatsiyalar noqulaylik tug&apos;diradi.</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setReduceMotion(false)}
                  className={`flex-1 rounded-xl border-2 p-3 text-sm font-semibold transition-all ${
                    !reduceMotion ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                  }`}
                >
                  &#127916; Yoqilgan
                </button>
                <button
                  type="button"
                  onClick={() => setReduceMotion(true)}
                  className={`flex-1 rounded-xl border-2 p-3 text-sm font-semibold transition-all ${
                    reduceMotion ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                  }`}
                >
                  &#9209;&#65039; O&apos;chirilgan
                </button>
              </div>
            </CardContent>
          </Card>

          <Button onClick={finishScreening} className="w-full h-12 text-base font-bold rounded-xl">
            Davom etish &#8594; Kirish testi
          </Button>
        </div>
      </div>
    );
  }

  // ===== ENTRY TEST PHASE =====
  if (phase === "entry_test" && questions.length > 0) {
    const q = questions[currentQ];
    const selected = answers[q.id];
    const progress = ((currentQ) / questions.length) * 100;
    const isLast = currentQ === questions.length - 1;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground font-medium">
              {test?.title} &mdash; {currentQ + 1}/{questions.length}
            </p>
            {/* Progress bar */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full gradient-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Savol */}
          <Card>
            <CardContent className="pt-6 space-y-5">
              <p className="text-lg font-semibold leading-snug">{q.question_text}</p>

              <div className="space-y-2">
                {q.question_options.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => selectAnswer(q.id, opt.id)}
                    className={`w-full text-left rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                      selected === opt.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    {opt.option_text}
                  </button>
                ))}
              </div>

              <Button
                onClick={nextQuestion}
                disabled={!selected}
                className="w-full h-11 font-bold rounded-xl"
              >
                {isLast ? "Testni yakunlash \u2713" : "Keyingi savol \u2192"}
              </Button>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Bu test baholash uchun emas &mdash; o&apos;qituvchiga sizning darajangizni ko&apos;rsatish uchun.
          </p>
        </div>
      </div>
    );
  }

  // ===== DONE PHASE =====
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="text-6xl">&#127881;</div>
        <div>
          <h1 className="text-2xl font-black">Barakalla!</h1>
          <p className="text-muted-foreground mt-2">
            Sozlamalar saqlandi. Kirish testida{" "}
            <span className="font-bold text-primary">{score}/{questions.length}</span>{" "}
            to&apos;g&apos;ri javob berdingiz.
          </p>
        </div>

        <Card className="text-left">
          <CardContent className="pt-4 space-y-2 text-sm text-muted-foreground">
            <p>&#9203; Arizangiz ko&apos;rib chiqilmoqda</p>
            <p>&#9989; O&apos;qituvchi yoki direktor tasdiqlashi kerak</p>
            <p>&#128242; Tasdiqlangach, tizimga to&apos;liq kira olasiz</p>
          </CardContent>
        </Card>

        <Button
          onClick={goToPending}
          disabled={isPending}
          className="w-full h-12 text-base font-bold rounded-xl"
        >
          {isPending ? "Saqlanmoqda..." : "Davom etish \u2192"}
        </Button>
      </div>
    </div>
  );
}
