import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";

export const metadata: Metadata = {
  title: `${uz.teacher.dashboard} — I-Imkon.uz`,
};

export default async function TeacherDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("users")
    .select("first_name, last_name")
    .eq("id", user!.id)
    .single();

  const [{ count: lectureCount }, { count: testCount }, { count: gameCount }, { count: pendingCount }] =
    await Promise.all([
      supabase.from("lectures").select("id", { count: "exact", head: true }).eq("creator_id", user!.id),
      supabase.from("tests").select("id", { count: "exact", head: true }).eq("teacher_id", user!.id),
      supabase.from("games").select("id", { count: "exact", head: true }).eq("teacher_id", user!.id),
      supabase
        .from("student_profiles")
        .select("user_id", { count: "exact", head: true })
        .in(
          "class_id",
          (await supabase.from("teacher_assignments").select("class_id").eq("teacher_id", user!.id))
            .data?.map((r: { class_id: string }) => r.class_id) ?? []
        )
        .is("approved_at", null),
    ]);

  const firstName = (userData as { first_name: string } | null)?.first_name ?? "O'qituvchi";

  const stats = [
    { label: "Ma'ruzalar", value: lectureCount ?? 0, href: "/teacher/lectures", icon: "📄", color: "#0f766e" },
    { label: "Testlar", value: testCount ?? 0, href: "/teacher/tests", icon: "📝", color: "#0d9488" },
    { label: "O'yinlar", value: gameCount ?? 0, href: "/teacher/games", icon: "🎮", color: "#0891b2" },
    { label: "Kutayotgan o'quvchilar", value: pendingCount ?? 0, href: "/teacher/students", icon: "👥", color: "#f59e0b", highlight: (pendingCount ?? 0) > 0 },
  ];

  const quickActions = [
    { href: "/teacher/lectures/new", label: "Ma'ruza qo'shish", icon: "📄", desc: "Yangi dars yaratish" },
    { href: "/teacher/tests/new", label: "Test yaratish", icon: "📝", desc: "Yangi test qo'shish" },
    { href: "/teacher/games/new", label: "O'yin qo'shish", icon: "🎮", desc: "Interaktiv o'yin" },
    { href: "/teacher/assignments/new", label: "Topshiriq berish", icon: "✏️", desc: "Uy ishi berish" },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-8 gradient-primary text-white relative overflow-hidden">
        <div aria-hidden="true" className="absolute top-[-40px] right-[-40px] w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, white, transparent)" }} />
        <h1 className="text-xl sm:text-3xl font-black relative z-10">
          Xush kelibsiz, {firstName}! 👋
        </h1>
        <p className="text-white/80 mt-1 text-sm relative z-10">Bugun o&apos;quvchilaringiz uchun nima tayyorlaysiz?</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-2xl">
            <div className={`rounded-2xl p-4 border bg-card hover:shadow-glow transition-all hover:border-primary/30 cursor-pointer ${s.highlight ? "border-orange-300 bg-orange-50" : ""}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: `${s.color}22` }} aria-hidden="true">
                  {s.icon}
                </div>
                {s.highlight && <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" aria-label="Yangi" />}
              </div>
              <p className="text-2xl sm:text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium leading-tight">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-bold mb-4">Tezkor harakatlar</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group rounded-2xl p-4 border bg-card hover:shadow-glow hover:border-primary/30 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring flex items-center gap-3 sm:flex-col sm:items-start sm:p-5"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 transition-transform group-hover:scale-110" aria-hidden="true">
                {a.icon}
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">{a.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/teacher/students"
          className="flex items-center justify-between rounded-2xl border p-5 bg-card hover:shadow-glow hover:border-primary/30 transition-all focus-visible:outline-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl" aria-hidden="true">👥</div>
            <div>
              <p className="font-bold">O&apos;quvchilarni boshqarish</p>
              <p className="text-xs text-muted-foreground">Tasdiqlash va ko&apos;rish</p>
            </div>
          </div>
          <span className="text-muted-foreground" aria-hidden="true">→</span>
        </Link>
        <Link href="/teacher/analytics"
          className="flex items-center justify-between rounded-2xl border p-5 bg-card hover:shadow-glow hover:border-primary/30 transition-all focus-visible:outline-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl" aria-hidden="true">📊</div>
            <div>
              <p className="font-bold">Analitika</p>
              <p className="text-xs text-muted-foreground">Statistika va natijalar</p>
            </div>
          </div>
          <span className="text-muted-foreground" aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
