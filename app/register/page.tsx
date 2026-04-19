import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./RegisterForm";
import { uz } from "@/lib/strings/uz";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: `${uz.auth.register} — Anjir.uz`,
};

export default async function RegisterPage() {
  const supabase = await createClient();
  const { data: schools } = await supabase.from("schools").select("id, name").order("name");

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Chap: branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 gradient-primary text-white relative overflow-hidden">
        <div aria-hidden="true" className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, white, transparent)" }} />
        <div aria-hidden="true" className="absolute bottom-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, white, transparent)" }} />

        <Link href="/" className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-white w-fit">
          <span className="text-3xl" aria-hidden="true">🍑</span>
          <span className="text-2xl font-black tracking-tight">Anjir.uz</span>
        </Link>

        <div className="space-y-6 relative z-10">
          <h1 className="text-4xl font-black leading-tight">
            Bugun qo&apos;shiling,<br />
            bepul boshlang
          </h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-sm">
            O&apos;quvchi, o&apos;qituvchi yoki maktab direktorisiz — hammaga mo&apos;ljallangan.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "👨‍🎓", label: "O'quvchi" },
              { icon: "👨‍🏫", label: "O'qituvchi" },
              { icon: "🏫", label: "Direktor" },
              { icon: "⚙️", label: "Admin" },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-2 bg-white/15 rounded-2xl px-4 py-3">
                <span className="text-xl" aria-hidden="true">{r.icon}</span>
                <span className="font-semibold text-sm">{r.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/50 text-sm">© 2026 Anjir.uz</p>
      </div>

      {/* O'ng: forma */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 bg-background overflow-y-auto">
        <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden focus-visible:outline-2">
          <span className="text-2xl" aria-hidden="true">🍑</span>
          <span className="text-xl font-black text-gradient">Anjir.uz</span>
        </Link>

        <div className="w-full max-w-sm space-y-8">
          <div>
            <h2 className="text-3xl font-black">{uz.auth.register}</h2>
            <p className="text-muted-foreground mt-2">
              Akkauntingiz bormi?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline focus-visible:outline-2">
                Tizimga kiring
              </Link>
            </p>
          </div>
          <RegisterForm schools={schools ?? []} />
        </div>
      </div>
    </div>
  );
}
