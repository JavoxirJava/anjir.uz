"use client";

import { uz } from "@/lib/strings/uz";

/**
 * Klaviatura foydalanuvchilari uchun navigatsiyani o'tkazib yuborish havolasi.
 * Faqat focus bo'lganda ko'rinadi.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="
        fixed left-4 top-4 z-[9999] -translate-y-20 rounded-md
        bg-primary px-4 py-2 text-sm font-medium text-primary-foreground
        shadow-lg ring-2 ring-primary ring-offset-2
        transition-transform duration-150
        focus:translate-y-0
        focus:outline-none
      "
    >
      {uz.a11y.skipToContent}
    </a>
  );
}
