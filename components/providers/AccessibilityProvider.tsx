"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ContrastMode, ColorBlindMode, FontSize } from "@/lib/types/domain";

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
      html.setAttribute("data-reduce-motion", "true");
    } else {
      html.removeAttribute("data-reduce-motion");
    }

    if (settings.contrastMode === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [settings]);

  const updateSettings = useCallback((partial: Partial<AccessibilitySettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem("anjir_a11y", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const value = useMemo(() => ({ settings, updateSettings }), [settings, updateSettings]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
