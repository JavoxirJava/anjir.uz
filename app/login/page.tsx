import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { uz } from "@/lib/strings/uz";
import { IImkonLogo } from "@/components/IImkonLogo";

export const metadata: Metadata = {
  title: `${uz.auth.login} — I-Imkon.uz`,
};

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1.1fr]">

      {/* ===== CHAP: Gradient info panel ===== */}
      <div className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden" style={{ background: "#0f766e" }}>
        <div aria-hidden="true"
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)" }} />
        <div aria-hidden="true"
          className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)" }} />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 w-fit focus-visible:outline-2 focus-visible:outline-white">
          <IImkonLogo size={44} />
          <span className="text-2xl font-black tracking-tight">I-Imkon.uz</span>
        </Link>

        {/* Matn */}
        <div className="space-y-8 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-sm font-semibold">
              👋 Qaytib kelganingizdan xursandmiz
            </div>
            <h1 className="text-4xl xl:text-5xl font-black leading-tight">
              Hamma uchun<br />ta&apos;lim platforma
            </h1>
            {/* Shior */}
            <div className="relative pl-5 py-1">
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-white/60" />
              <p className="text-white text-2xl xl:text-3xl font-black leading-tight tracking-tight">
                Ilmda chegara yo&apos;q,
              </p>
              <p className="text-white/90 text-2xl xl:text-3xl font-black leading-tight tracking-tight italic">
                I-Imkonda to&apos;siq!
              </p>
            </div>
            <p className="text-white/65 text-base leading-relaxed max-w-sm">
              5–9-sinf o&apos;quvchilari uchun inklyuziv ta&apos;lim —
              testlar, o&apos;yinlar va interaktiv darslar.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {[
              { icon: "📚", text: "100+ dars formati", sub: "Video, matn, audio" },
              { icon: "♿", text: "Inklyuziv dizayn", sub: "Hamma uchun moslashtirilgan" },
              { icon: "🏆", text: "Reyting tizimi", sub: "O'zingizni sinab ko'ring" },
              { icon: "🎮", text: "Interaktiv o'yinlar", sub: "O'ynab o'rganing" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-xl flex-shrink-0" aria-hidden="true">
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm leading-tight">{f.text}</p>
                  <p className="text-white/55 text-xs">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/40 text-sm">© 2026 I-Imkon.uz</p>
      </div>

      {/* ===== O'NG: Forma ===== */}
      <div className="flex flex-col min-h-screen lg:min-h-0 bg-background">
        {/* Mobile header */}
        <div className="flex items-center justify-between px-6 py-4 lg:hidden border-b border-border/50">
          <Link href="/" className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-primary">
            <IImkonLogo size={32} />
            <span className="font-black" style={{ color: "#0f766e" }}>I-Imkon.uz</span>
          </Link>
          <Link href="/register" className="text-sm font-semibold hover:underline" style={{ color: "#0f766e" }}>
            Ro&apos;yxatdan o&apos;ting →
          </Link>
        </div>

        {/* Forma container */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:py-12">
          <div className="w-full max-w-md">

            {/* Sarlavha */}
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                {uz.auth.login}
              </h2>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Akkauntingiz yo&apos;qmi?{" "}
                <Link href="/register" className="text-primary font-semibold hover:underline focus-visible:outline-2">
                  Ro&apos;yxatdan o&apos;ting
                </Link>
              </p>
            </div>

            {/* Card */}
            <div className="bg-card border border-border/60 rounded-3xl shadow-xl shadow-black/5 overflow-hidden">
              <div className="h-1 gradient-primary" aria-hidden="true" />
              <div className="p-6 sm:p-8">
                <LoginForm />
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground/50 mt-6">
              I-Imkon.uz — Inklyuziv ta&apos;lim platformasi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
