"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAccessibility } from "@/components/providers/AccessibilityProvider";
import { uz } from "@/lib/strings/uz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FontSize, ContrastMode } from "@/lib/supabase/types";

type Step = "intro" | "vision" | "hearing" | "motor" | "done";

/**
 * Sensor tekshiruvi — WCAG 2.1 AA
 * Ko'rish: shrift o'lchami va kontrast
 * Eshitish: ovoz bor/yo'qligini belgilash
 * Motorika: katta tugmalar va sichqoncha/touch
 */
export function SensorScreening() {
  const router = useRouter();
  const { updateSettings } = useAccessibility();
  const [step, setStep] = useState<Step>("intro");
  const [tapCount, setTapCount]       = useState(0);
  const [motorOk, setMotorOk]         = useState<boolean | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [heardSound, setHeardSound]   = useState<boolean | null>(null);
  const [fontSize, setFontSize]       = useState<FontSize>("medium");
  const [contrast, setContrast]       = useState<ContrastMode>("normal");

  // Skip: agar allaqachon onboarding o'tilgan bo'lsa
  useEffect(() => {
    const done = localStorage.getItem("anjir_onboarding");
    if (done === "1") router.replace("/app");
  }, [router]);

  // Motor test — 5 ta tap qilish kerak
  const handleMotorTap = useCallback(() => {
    setTapCount((c) => {
      const next = c + 1;
      if (next >= 5) setMotorOk(true);
      return next;
    });
  }, []);

  // Ovoz sinovi
  function playTestSound() {
    if (!audioRef.current) {
      // 440Hz sine wave — Web Audio API orqali
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 440;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
        osc.start();
        osc.stop(ctx.currentTime + 1);
      } catch {}
    }
  }

  function applyAndFinish() {
    updateSettings({
      fontSize,
      contrastMode: contrast,
      reduceMotion: motorOk === false,
    });
    localStorage.setItem("anjir_onboarding", "1");
    router.push("/pending");
  }

  function skip() {
    localStorage.setItem("anjir_onboarding", "1");
    router.push("/pending");
  }

  // ---- Intro ----
  if (step === "intro") {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="text-5xl mb-2" aria-hidden="true">♿</div>
          <CardTitle className="text-xl">{uz.a11y.screeningTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">{uz.a11y.screeningIntro}</p>
          <p className="text-sm text-muted-foreground">
            Bu tekshiruv 3 bosqichdan iborat va taxminan 1 daqiqa davom etadi.
            Har qanday paytda &quot;O&apos;tkazib yuborish&quot; tugmasini bosishingiz mumkin.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => setStep("vision")} size="lg" className="min-h-[52px]">
              {uz.a11y.startScreening}
            </Button>
            <Button variant="outline" onClick={skip} size="lg" className="min-h-[52px]">
              {uz.a11y.skipScreening}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ---- Ko'rish testi ----
  if (step === "vision") {
    const fontOptions: { value: FontSize; label: string; size: string }[] = [
      { value: "small",   label: "Kichik",       size: "14px" },
      { value: "medium",  label: "O'rta",        size: "16px" },
      { value: "large",   label: "Katta",        size: "20px" },
      { value: "xlarge",  label: "Juda katta",   size: "24px" },
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span aria-hidden="true">👁️</span> {uz.a11y.visionTest}
          </CardTitle>
          <p className="text-sm text-muted-foreground">1/3 bosqich</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="font-medium mb-3">Qaysi shrift o&apos;lchami sizga qulay?</p>
            <div className="space-y-2" role="radiogroup" aria-label="Shrift o'lchami">
              {fontOptions.map((fo) => (
                <button
                  key={fo.value}
                  type="button"
                  role="radio"
                  aria-checked={fontSize === fo.value}
                  onClick={() => setFontSize(fo.value)}
                  style={{ fontSize: fo.size }}
                  className={cn(
                    "w-full text-left rounded-lg border-2 px-4 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    fontSize === fo.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  {fo.label} — Bu matn shu o&apos;lchamda ko&apos;rinadi
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-medium mb-3">Kontrast rejimi:</p>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Kontrast">
              {[
                { value: "normal" as ContrastMode, label: "Oddiy",          preview: "bg-white text-gray-900 border" },
                { value: "high"   as ContrastMode, label: "Yuqori kontrast", preview: "bg-white text-black border-2 border-black" },
                { value: "dark"   as ContrastMode, label: "Qorong'i",        preview: "bg-gray-900 text-white" },
              ].map((c) => (
                <button
                  key={c.value}
                  type="button"
                  role="radio"
                  aria-checked={contrast === c.value}
                  onClick={() => setContrast(c.value)}
                  className={cn(
                    "rounded-lg border-2 overflow-hidden transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    contrast === c.value ? "border-primary ring-2 ring-primary" : "border-border"
                  )}
                >
                  <div className={`p-3 text-xs font-medium ${c.preview}`}>
                    Aa
                  </div>
                  <div className="p-2 text-xs bg-background border-t">{c.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setStep("hearing")} size="lg" className="min-h-[52px]">
              {uz.a11y.nextStep} →
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ---- Eshitish testi ----
  if (step === "hearing") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span aria-hidden="true">👂</span> {uz.a11y.hearingTest}
          </CardTitle>
          <p className="text-sm text-muted-foreground">2/3 bosqich</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Quyidagi tugmani bosing va ovoz eshitilganini tekshiring.
            Ovoz eshita olmasangiz, platforma subtitrlarni har doim ko&apos;rsatadi.
          </p>

          <div className="text-center space-y-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="min-h-[64px] text-lg"
              onClick={() => { playTestSound(); }}
              aria-label="Test ovozini chalish"
            >
              🔊 Ovozni chalish
            </Button>

            <p className="text-sm font-medium">Ovoz eshita oldingizmi?</p>
            <div className="flex gap-3 justify-center" role="group" aria-label="Ovoz testi natijasi">
              <Button
                variant={heardSound === true ? "default" : "outline"}
                onClick={() => setHeardSound(true)}
                className="min-h-[52px] min-w-[100px]"
                aria-pressed={heardSound === true}
              >
                Ha
              </Button>
              <Button
                variant={heardSound === false ? "default" : "outline"}
                onClick={() => setHeardSound(false)}
                className="min-h-[52px] min-w-[100px]"
                aria-pressed={heardSound === false}
              >
                Yo&apos;q
              </Button>
            </div>

            {heardSound === false && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 text-sm text-left" role="status">
                <p className="font-medium text-blue-800 dark:text-blue-300">
                  Subtitrlar avtomatik yoqildi
                </p>
                <p className="text-blue-700 dark:text-blue-400 mt-1">
                  Barcha video va audio darslarda matn ko&apos;rsatiladi.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setStep("motor")}
              size="lg"
              className="min-h-[52px]"
              disabled={heardSound === null}
            >
              {uz.a11y.nextStep} →
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ---- Motorika testi ----
  if (step === "motor") {
    const progress = Math.min(tapCount, 5);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span aria-hidden="true">🖐️</span> {uz.a11y.motorTest}
          </CardTitle>
          <p className="text-sm text-muted-foreground">3/3 bosqich</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Quyidagi tugmani 5 marta bosing. Bu klaviatura va mouse/touch imkoniyatini tekshiradi.
          </p>

          <div className="text-center space-y-4">
            <button
              type="button"
              onClick={handleMotorTap}
              disabled={motorOk === true}
              aria-label={`Tugmani bosing (${progress}/5)`}
              aria-describedby="tap-progress"
              className={cn(
                "w-32 h-32 rounded-full text-4xl font-bold transition-all focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-primary",
                motorOk === true
                  ? "bg-green-500 text-white cursor-default"
                  : "bg-primary text-primary-foreground hover:scale-105 active:scale-95"
              )}
            >
              {motorOk === true ? "✓" : "👆"}
            </button>

            <div id="tap-progress" className="space-y-1" aria-live="polite">
              <div className="flex justify-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-3 h-3 rounded-full transition-colors",
                      i < progress ? "bg-primary" : "bg-muted-foreground/20"
                    )}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {motorOk === true ? "Ajoyib!" : `${progress}/5 ta bosildi`}
              </p>
            </div>

            {motorOk !== true && (
              <button
                type="button"
                className="text-sm text-muted-foreground underline focus-visible:outline-2"
                onClick={() => { setMotorOk(false); }}
              >
                Bosish qiyin — o&apos;tkazib yuborish
              </button>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setStep("done")}
              size="lg"
              className="min-h-[52px]"
              disabled={motorOk === null}
            >
              {uz.a11y.nextStep} →
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ---- Natija ----
  if (step === "done") {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="text-5xl mb-2" aria-hidden="true">✅</div>
          <CardTitle className="text-xl">Sozlamalar tayyor!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="space-y-2 text-sm" aria-label="Tanlangan sozlamalar">
            <li className="flex items-center gap-2">
              <span aria-hidden="true">📝</span>
              <span>Shrift: <strong>{fontSize}</strong></span>
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden="true">🎨</span>
              <span>Kontrast: <strong>{contrast}</strong></span>
            </li>
            {heardSound === false && (
              <li className="flex items-center gap-2">
                <span aria-hidden="true">💬</span>
                <span>Subtitrlar: <strong>har doim ko&apos;rsatiladi</strong></span>
              </li>
            )}
            {motorOk === false && (
              <li className="flex items-center gap-2">
                <span aria-hidden="true">🎯</span>
                <span>Katta tugmalar rejimi: <strong>yoqildi</strong></span>
              </li>
            )}
          </ul>

          <p className="text-sm text-muted-foreground">
            Bu sozlamalarni istalgan vaqt Sozlamalar sahifasida o&apos;zgartirishingiz mumkin.
          </p>

          <Button
            onClick={applyAndFinish}
            size="lg"
            className="w-full min-h-[52px]"
          >
            Boshqaruvga o&apos;tish →
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
