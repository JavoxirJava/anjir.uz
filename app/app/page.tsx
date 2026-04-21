import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: `${uz.student.dashboard} — I-Imkon.uz`,
};

const CONTENT_EMOJI: Record<string, string> = {
  pdf: "📄", video: "🎥", audio: "🎵", ppt: "📊",
};

const TYPE_LABELS: Record<string, string> = {
  pdf: "PDF", video: "Video", audio: "Audio", ppt: "PPT",
};

export default async function StudentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("users")
    .select("first_name, last_name")
    .eq("id", user!.id)
    .single();

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("class_id")
    .eq("user_id", user!.id)
    .single();

  const { data: lecturesRaw } = await supabase
    .from("lectures")
    .select("id, title, content_type, subjects(name)")
    .eq("class_id", profile?.class_id ?? "")
    .order("created_at", { ascending: false })
    .limit(4);

  type LectureItem = {
    id: string; title: string; content_type: string;
    subjects?: { name: string } | { name: string }[] | null;
  };
  const lectures = (lecturesRaw ?? []) as unknown as LectureItem[];

  const { data: testClassesData } = await supabase
    .from("test_classes")
    .select("test_id")
    .eq("class_id", profile?.class_id ?? "");

  const testIds = (testClassesData ?? []).map((r: { test_id: string }) => r.test_id);
  const { data: testsRaw } = testIds.length
    ? await supabase.from("tests").select("id, title, test_type, time_limit").in("id", testIds).limit(4)
    : { data: [] };

  const tests = (testsRaw ?? []) as { id: string; title: string; test_type: string; time_limit: number | null }[];

  const { data: attemptsRaw } = await supabase
    .from("test_attempts")
    .select("test_id, score")
    .eq("student_id", user!.id)
    .not("finished_at", "is", null)
    .order("score", { ascending: false })
    .limit(5);

  const attempts = attemptsRaw ?? [];
  const completedCount = new Set(attempts.map((a: { test_id: string }) => a.test_id)).size;
  const bestScore = attempts.length > 0
    ? Math.round(Math.max(...attempts.map((a: { score: number | null }) => a.score ?? 0)))
    : null;

  const firstName = (userData as { first_name: string } | null)?.first_name ?? "O'quvchi";

  const TYPE_TEST: Record<string, string> = {
    entry: "Kirish", post_topic: "Mavzu oxiri", home_study: "Mustaqil",
  };

  return (
    <div className="space-y-8">
      {/* Greeting banner */}
      <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-8 gradient-primary text-white relative overflow-hidden">
        <div aria-hidden="true" className="absolute top-[-40px] right-[-40px] w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, white, transparent)" }} />
        <h1 className="text-xl sm:text-3xl font-black relative z-10">
          Salom, {firstName}! 👋
        </h1>
        <p className="text-white/80 mt-1 text-sm relative z-10">Bugungi darslaringiz tayyor. Davom eting!</p>
        {/* Mini stats */}
        <div className="flex flex-wrap gap-4 mt-4 relative z-10">
          <div>
            <div className="text-xl sm:text-2xl font-black">{completedCount}</div>
            <div className="text-xs text-white/70">Yakunlangan test</div>
          </div>
          {bestScore !== null && (
            <div>
              <div className="text-xl sm:text-2xl font-black">{bestScore}%</div>
              <div className="text-xs text-white/70">Eng yaxshi ball</div>
            </div>
          )}
          <div>
            <div className="text-xl sm:text-2xl font-black">{lectures.length}</div>
            <div className="text-xs text-white/70">Mavjud dars</div>
          </div>
        </div>
      </div>

      {/* Quick nav cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { href: "/app/subjects", icon: "📖", label: "Fanlar", color: "#0f766e" },
          { href: "/app/lectures", icon: "📄", label: "Darslar", color: "#0d9488" },
          { href: "/app/tests", icon: "📝", label: "Testlar", color: "#0891b2" },
          { href: "/app/games", icon: "🎮", label: "O'yinlar", color: "oklch(0.6 0.18 150)" },
          { href: "/app/books", icon: "📚", label: "Kitoblar", color: "#f59e0b" },
          { href: "/app/leaderboard", icon: "🏆", label: "Reyting", color: "oklch(0.65 0.18 60)" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-2 rounded-2xl p-4 border bg-card hover:shadow-glow hover:border-primary/30 transition-all focus-visible:outline-2 text-center group"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
              style={{ background: `${item.color}22` }}
              aria-hidden="true"
            >
              {item.icon}
            </div>
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* So'nggi ma'ruzalar */}
      <section aria-labelledby="lectures-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="lectures-heading" className="text-lg font-bold">So&apos;nggi darslar</h2>
          <Link href="/app/lectures" className="text-sm text-primary font-semibold hover:underline focus-visible:outline-2">
            Barchasi →
          </Link>
        </div>

        {!lectures.length ? (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <p className="text-4xl mb-2" aria-hidden="true">📭</p>
            <p className="text-muted-foreground">{uz.common.noData}</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list">
            {lectures.map((l) => {
              const subject = Array.isArray(l.subjects) ? l.subjects[0] : l.subjects;
              return (
                <li key={l.id}>
                  <Link href={`/app/lectures/${l.id}`} className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-2xl">
                    <div className="group rounded-2xl border bg-card p-5 hover:shadow-glow hover:border-primary/30 transition-all h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl transition-transform group-hover:scale-110" aria-hidden="true">
                          {CONTENT_EMOJI[l.content_type] ?? "📄"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{TYPE_LABELS[l.content_type]}</Badge>
                          {subject && <span className="text-xs text-muted-foreground">{subject.name}</span>}
                        </div>
                      </div>
                      <p className="font-semibold text-sm leading-snug">{l.title}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Testlar */}
      <section aria-labelledby="tests-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="tests-heading" className="text-lg font-bold">Testlar</h2>
          <Link href="/app/tests" className="text-sm text-primary font-semibold hover:underline focus-visible:outline-2">
            Barchasi →
          </Link>
        </div>

        {!tests.length ? (
          <div className="rounded-2xl border border-dashed p-10 text-center">
            <p className="text-4xl mb-2" aria-hidden="true">📭</p>
            <p className="text-muted-foreground">{uz.common.noData}</p>
          </div>
        ) : (
          <ul className="space-y-2" role="list">
            {tests.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/app/tests/${t.id}`}
                  className="flex items-center justify-between rounded-2xl border bg-card px-4 py-3 hover:shadow-glow hover:border-primary/30 transition-all focus-visible:outline-2 gap-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-lg flex-shrink-0" aria-hidden="true">📝</div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{t.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{TYPE_TEST[t.test_type]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {t.time_limit && (
                      <Badge variant="outline" className="text-xs hidden sm:flex">⏱ {t.time_limit} daq</Badge>
                    )}
                    <span aria-hidden="true" className="text-primary text-sm">→</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
