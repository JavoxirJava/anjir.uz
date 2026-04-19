"use client";

import { useAccessibility } from "@/components/providers/AccessibilityProvider";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FontSize, ContrastMode, ColorBlindMode } from "@/lib/supabase/types";

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: "small",   label: uz.a11y.fontSizeSmall },
  { value: "medium",  label: uz.a11y.fontSizeMedium },
  { value: "large",   label: uz.a11y.fontSizeLarge },
  { value: "xlarge",  label: uz.a11y.fontSizeXLarge },
];

const CONTRAST_MODES: { value: ContrastMode; label: string; icon: string }[] = [
  { value: "normal", label: uz.a11y.contrastNormal,  icon: "☀️" },
  { value: "high",   label: uz.a11y.contrastHigh,    icon: "🔆" },
  { value: "dark",   label: uz.a11y.contrastDark,    icon: "🌙" },
];

const COLOR_BLIND_MODES: { value: ColorBlindMode; label: string }[] = [
  { value: "normal",        label: uz.a11y.colorBlindNormal },
  { value: "protanopia",    label: uz.a11y.colorBlindProtanopia },
  { value: "deuteranopia",  label: uz.a11y.colorBlindDeuteranopia },
  { value: "tritanopia",    label: uz.a11y.colorBlindTritanopia },
];

export function AccessibilitySettingsPanel() {
  const { settings, updateSettings } = useAccessibility();

  return (
    <div className="space-y-6" aria-label={uz.a11y.accessibilitySettings}>
      {/* Shrift o'lchami */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shrift o&apos;lchami</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Shrift o'lchami">
            {FONT_SIZES.map((fs) => (
              <button
                key={fs.value}
                type="button"
                role="radio"
                aria-checked={settings.fontSize === fs.value}
                onClick={() => updateSettings({ fontSize: fs.value })}
                className={cn(
                  "rounded-lg border-2 p-3 text-sm text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  settings.fontSize === fs.value
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border hover:border-primary/40"
                )}
              >
                {fs.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-muted-foreground" style={{ fontSize: "var(--font-size)" }}>
            Namuna matn — bu shrift o&apos;lchamida ko&apos;rinadi
          </p>
        </CardContent>
      </Card>

      {/* Kontrast rejimi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kontrast rejimi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Kontrast rejimi">
            {CONTRAST_MODES.map((cm) => (
              <button
                key={cm.value}
                type="button"
                role="radio"
                aria-checked={settings.contrastMode === cm.value}
                onClick={() => updateSettings({ contrastMode: cm.value })}
                className={cn(
                  "rounded-lg border-2 p-4 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  settings.contrastMode === cm.value
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border hover:border-primary/40"
                )}
              >
                <div className="text-2xl mb-1" aria-hidden="true">{cm.icon}</div>
                <div className="text-sm">{cm.label}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rang ko'rish rejimi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rang ko&apos;rish imkoniyati</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Rang ko'rish rejimi">
            {COLOR_BLIND_MODES.map((cb) => (
              <button
                key={cb.value}
                type="button"
                role="radio"
                aria-checked={settings.colorBlindMode === cb.value}
                onClick={() => updateSettings({ colorBlindMode: cb.value })}
                className={cn(
                  "rounded-lg border-2 p-3 text-sm text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  settings.colorBlindMode === cb.value
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border hover:border-primary/40"
                )}
              >
                {cb.label}
              </button>
            ))}
          </div>

          {/* Rang ko'rish test sxemasi */}
          <div className="flex gap-3 p-3 rounded-lg border" aria-label="Rang testi">
            {["bg-red-500", "bg-green-500", "bg-blue-500", "bg-yellow-500", "bg-purple-500"].map((c) => (
              <div key={c} className={`w-8 h-8 rounded-full ${c}`} aria-hidden="true" />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Yuqoridagi ranglar qanday ko&apos;rinishiga qarab rejimni tanlang
          </p>
        </CardContent>
      </Card>

      {/* Animatsiyani kamaytirish */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Animatsiyalar</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.reduceMotion}
              onChange={(e) => updateSettings({ reduceMotion: e.target.checked })}
              className="w-5 h-5 accent-primary rounded"
              aria-label={uz.a11y.reduceMotion}
            />
            <span className="text-sm font-medium">{uz.a11y.reduceMotion}</span>
          </label>
          <p className="text-xs text-muted-foreground mt-2 ml-8">
            Epilepsiya va bosh aylanishi bo&apos;lganda foydali
          </p>
        </CardContent>
      </Card>

      <p className="text-xs text-center text-muted-foreground" role="status" aria-live="polite">
        Sozlamalar avtomatik saqlanadi
      </p>
    </div>
  );
}
