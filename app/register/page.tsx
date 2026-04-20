import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./RegisterForm";
import { uz } from "@/lib/strings/uz";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${uz.auth.register} — Anjir.uz`,
};

export default async function RegisterPage() {
  // Admin client ishlatamiz — ro'yxatdan o'tish sahifasida foydalanuvchi
  // hali login qilmagan, shuning uchun RLS auth.uid() = null qaytaradi
  const supabase = createAdminClient();
  const { data: schools } = await supabase.from("schools").select("id, name").order("name");

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1.1fr]">

      {/* ===== CHAP: Gradient info panel ===== */}
      <div className="hidden lg:flex flex-col justify-between p-12 gradient-primary text-white relative overflow-hidden">
        {/* Dekor doiralar */}
        <div aria-hidden="true"
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)" }} />
        <div aria-hidden="true"
          className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)" }} />
        <div aria-hidden="true"
          className="absolute top-1/2 right-8 w-48 h-48 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)" }} />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 w-fit focus-visible:outline-2 focus-visible:outline-white">
          <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl shadow-lg">
            🍑
          </div>
          <span className="text-2xl font-black tracking-tight">Anjir.uz</span>
        </Link>

        {/* Asosiy matn */}
        <div className="space-y-8 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-sm font-semibold">
              ✨ Bepul boshlang
            </div>
            <h1 className="text-4xl xl:text-5xl font-black leading-tight">
              Bugun qo&apos;shiling,<br />
              kelajakni quring
            </h1>
            <p className="text-white/75 text-lg leading-relaxed max-w-sm">
              5–9-sinf o&apos;quvchilari uchun inklyuziv ta&apos;lim platformasi.
              Testlar, darslar va o&apos;yinlar bir joyda.
            </p>
          </div>

          {/* Rol kartochkalari */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "👨‍🎓", role: "O'quvchi", desc: "Testlar & darslar" },
              { icon: "👨‍🏫", role: "O'qituvchi", desc: "Sinflarni boshqarish" },
              { icon: "🏫", role: "Direktor", desc: "Maktab nazorati" },
              { icon: "⚙️", role: "Admin", desc: "Tizim boshqaruvi" },
            ].map((r) => (
              <div key={r.role}
                className="flex items-center gap-3 bg-white/15 backdrop-blur rounded-2xl px-4 py-3 border border-white/10">
                <span className="text-2xl" aria-hidden="true">{r.icon}</span>
                <div>
                  <p className="font-bold text-sm leading-tight">{r.role}</p>
                  <p className="text-white/60 text-xs">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-6 pt-2">
            {[
              { n: "100+", label: "Dars" },
              { n: "5–9", label: "Sinflar" },
              { n: "∞", label: "Testlar" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-black">{s.n}</p>
                <p className="text-white/60 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/40 text-sm relative z-10">© 2026 Anjir.uz</p>
      </div>

      {/* ===== O'NG: Forma ===== */}
      <div className="flex flex-col min-h-screen lg:min-h-0 bg-background">
        {/* Mobile header */}
        <div className="flex items-center justify-between px-6 py-4 lg:hidden border-b border-border/50">
          <Link href="/" className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-primary">
            <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center text-base shadow-sm">
              🍑
            </div>
            <span className="font-black text-gradient">Anjir.uz</span>
          </Link>
          <Link href="/login" className="text-sm text-primary font-semibold hover:underline">
            Kirish →
          </Link>
        </div>

        {/* Forma container */}
        <div className="flex-1 flex items-start lg:items-center justify-center px-6 py-8 lg:py-12 overflow-y-auto">
          <div className="w-full max-w-md">

            {/* Sarlavha */}
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                {uz.auth.register}
              </h2>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Akkauntingiz bormi?{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline focus-visible:outline-2">
                  Tizimga kiring
                </Link>
              </p>
            </div>

            {/* Forma */}
            <div className="bg-card border border-border/60 rounded-3xl shadow-xl shadow-black/5 overflow-hidden">
              <div className="h-1 gradient-primary" aria-hidden="true" />
              <div className="p-6 sm:p-8">
                <RegisterForm schools={schools ?? []} />
              </div>
            </div>

            {/* Pastki text */}
            <p className="text-center text-xs text-muted-foreground/50 mt-6">
              Ro&apos;yxatdan o&apos;tish orqali siz{" "}
              <span className="underline cursor-pointer">foydalanish shartlari</span>
              {" "}ga rozilik bildirasiz
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
