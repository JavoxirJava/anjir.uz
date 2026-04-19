"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

interface Props {
  children: React.ReactNode;
  active?: boolean;
  /** Focus qo'yish uchun id (modal ochilganda) */
  initialFocusId?: string;
}

/**
 * Modal va overlay larda focus ni qamab oladi.
 * ESC tugmasi bosilganda onClose chaqiriladi.
 */
export function FocusTrap({ children, active = true, initialFocusId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    // Dastlabki fokus
    if (initialFocusId) {
      const el = document.getElementById(initialFocusId);
      el?.focus();
    } else {
      const first = container.querySelectorAll<HTMLElement>(FOCUSABLE)[0];
      first?.focus();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const focusable = Array.from(container!.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, initialFocusId]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}
