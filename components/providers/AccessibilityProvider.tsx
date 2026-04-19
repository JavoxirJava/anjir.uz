"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ContrastMode, ColorBlindMode, FontSize } from "@/lib/supabase/types";

interface AccessibilitySettings {
  fontSize: FontSize;
  contrastMode: ContrastMode;
  colorBlindMode: ColorBlindMode;
  reduceMotion: boolean;
}

interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  updateSettings: (partial: Partial<AccessibilitySettings>) => void;
}

const defaults: AccessibilitySettings = {
  fontSize: "medium",
  contrastMode: "normal",
  colorBlindMode: "normal",
  reduceMotion: false,
};

const AccessibilityContext = createContext<AccessibilityContextValue>({
  settings: defaults,
  updateSettings: () => {},
});

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaults);

  // localStorage dan tiklash
  useEffect(() => {
    try {
      const saved = localStorage.getItem("anjir_a11y");
      if (saved) {
        setSettings({ ...defaults, ...JSON.parse(saved) });
      }
    } catch {}
  }, []);

  // HTML data atributlarini yangilash
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-font-size", settings.fontSize);
    html.setAttribute("data-contrast", settings.contrastMode);
    html.setAttribute("data-color-blind", settings.colorBlindMode);

    if (settings.reduceMotion) {
      html.style.setProperty("--motion-duration", "0.01ms");
    } else {
      html.style.removeProperty("--motion-duration");
    }

    if (settings.contrastMode === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [settings]);

  function updateSettings(partial: Partial<AccessibilitySettings>) {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem("anjir_a11y", JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
