"use client";

import { useEffect, useRef } from "react";

interface Props {
  message: string;
  politeness?: "polite" | "assertive";
}

/**
 * Screen reader uchun dinamik xabarlar.
 * Xabar o'zgarganda AT tomonidan e'lon qilinadi.
 */
export function LiveRegion({ message, politeness = "polite" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = "";
      // Kichik kechikish bilan AT ni ishga tushirish uchun
      const t = setTimeout(() => {
        if (ref.current) ref.current.textContent = message;
      }, 50);
      return () => clearTimeout(t);
    }
  }, [message]);

  return (
    <div
      ref={ref}
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    />
  );
}
