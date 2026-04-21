import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { SkipLink } from "@/components/a11y/SkipLink";
import { Toaster } from "@/components/ui/sonner";
import { AccessibilityProvider } from "@/components/providers/AccessibilityProvider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "I-Imkon.uz — Inklyuziv ta'lim platformasi",
  description:
    "5–9-sinf o'quvchilari uchun inklyuziv ta'lim-test platformasi. Imkoniyati cheklangan o'quvchilar uchun to'liq moslashtirilgan.",
  keywords: ["ta'lim", "test", "maktab", "inklyuziv", "o'zbek"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Rang ko'rligi SVG filtrlari */}
        <svg className="sr-only" aria-hidden="true" focusable="false">
          <defs>
            <filter id="protanopia-filter">
              <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0" />
            </filter>
            <filter id="deuteranopia-filter">
              <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0" />
            </filter>
            <filter id="tritanopia-filter">
              <feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0" />
            </filter>
          </defs>
        </svg>

        <NextTopLoader
          color="#0d9488"
          height={3}
          showSpinner={false}
          shadow="0 0 10px #0d9488"
          easing="ease"
          speed={200}
        />
        <SkipLink />
        <AccessibilityProvider>
          <main id="main-content" className="flex-1 flex flex-col" tabIndex={-1}>
            {children}
          </main>
        </AccessibilityProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
