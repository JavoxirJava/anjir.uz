"use client";

import { useAccessibility } from "@/components/providers/AccessibilityProvider";

export function AccessibilityBar() {
  const { settings, updateSettings } = useAccessibility();

  function increaseFontSize() {
    const order = ["small", "medium", "large", "xlarge"] as const;
    const i = order.indexOf(settings.fontSize);
    if (i < order.length - 1) updateSettings({ fontSize: order[i + 1] });
  }

  function decreaseFontSize() {
    const order = ["small", "medium", "large", "xlarge"] as const;
    const i = order.indexOf(settings.fontSize);
    if (i > 0) updateSettings({ fontSize: order[i - 1] });
  }

  function toggleContrast() {
    updateSettings({
      contrastMode: settings.contrastMode === "high" ? "normal" : "high",
    });
  }

  const isHigh = settings.contrastMode === "high";

  return (
    <div style={{ background: "#134e4a" }}>
      <div className="container mx-auto max-w-6xl px-4 h-9 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-white/60 hidden sm:block">Maxsus imkoniyatlar:</span>
          <button
            onClick={increaseFontSize}
            aria-label="Shriftni kattalashtirish"
            className="px-2 py-0.5 rounded font-bold text-white transition-colors focus-visible:outline-2 focus-visible:outline-white"
            style={{ background: "rgba(255,255,255,0.15)", minHeight: "unset" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
          >
            A+
          </button>
          <button
            onClick={decreaseFontSize}
            aria-label="Shriftni kichraytirish"
            className="px-2 py-0.5 rounded font-bold text-white transition-colors focus-visible:outline-2 focus-visible:outline-white"
            style={{ background: "rgba(255,255,255,0.15)", minHeight: "unset" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
          >
            A−
          </button>
          <button
            onClick={toggleContrast}
            aria-label="Yuqori kontrastni yoqish/o'chirish"
            aria-pressed={isHigh}
            className="px-2 py-0.5 rounded font-medium transition-colors focus-visible:outline-2 focus-visible:outline-white"
            style={{
              background: isHigh ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
              color: isHigh ? "#134e4a" : "white",
              minHeight: "unset",
            }}
            onMouseEnter={e => !isHigh && (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
            onMouseLeave={e => !isHigh && (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
          >
            Yuqori kontrast {isHigh ? "✓" : ""}
          </button>
        </div>
        <span className="hidden sm:block text-white/50">♿ Hamma uchun moslashtirilgan</span>
      </div>
    </div>
  );
}
