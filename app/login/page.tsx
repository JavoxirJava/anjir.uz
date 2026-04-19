import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { uz } from "@/lib/strings/uz";

export const metadata: Metadata = {
  title: `${uz.auth.login} — Anjir.uz`,
};

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Chap: branding panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 gradient-primary text-white relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, white, transparent)" }}
        />
        <div
          aria-hidden="true"
          className="absolute bottom-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, white, transparent)" }}
        />

        <Link href="/" className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-white w-fit">
          <span className="text-3xl" aria-hidden="true">🍑</span>
          <span className="text-2xl font-black tracking-tight">Anjir.uz</span>
        </Link>

        <div className="space-y-6 relative z-10">
          <h1 className="text-4xl font-black leading-tight">
            Hamma uchun<br />ta&apos;lim platforma
          </h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-sm">
            5–9-sinf o&apos;quvchilari uchun inklyuziv ta&apos;lim — testlar, o&apos;yinlar va interaktiv darslar.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { icon: "📚", text: "100+ dars formati" },
              { icon: "♿", text: "Inklyuziv dizayn" },
              { icon: "🏆", text: "Reyting tizimi" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg flex-shrink-0" aria-hidden="true">
                  {f.icon}
                </div>
                <span className="text-white/90 font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/50 text-sm">© 2026 Anjir.uz</p>
      </div>

      {/* O'ng: forma */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 bg-background">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden focus-visible:outline-2">
          <span className="text-2xl" aria-hidden="true">🍑</span>
          <span className="text-xl font-black text-gradient">Anjir.uz</span>
        </Link>

        <div className="w-full max-w-sm space-y-8">
          <div>
            <h2 className="text-3xl font-black">{uz.auth.login}</h2>
            <p className="text-muted-foreground mt-2">
              Akkauntingiz yo&apos;qmi?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline focus-visible:outline-2">
                Ro&apos;yxatdan o&apos;ting
              </Link>
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
