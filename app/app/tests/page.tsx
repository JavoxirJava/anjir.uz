import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `${uz.student.tests} — I-Imkon.uz`,
};

const TYPE_LABELS: Record<string, string> = {
  entry: uz.tests.entryTest,
  post_topic: uz.tests.postTopic,
  home_study: uz.tests.homeStudy,
};

export default async function StudentTestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("class_id")
    .eq("user_id", user.id)
    .single();

  const classId = (profile as { class_id: string } | null)?.class_id;

  // Testlar (test_classes orqali bu sinfga biriktirilgan)
  const { data: tests } = classId
    ? await supabase
        .from("tests")
        .select("id, title, description, test_type, time_limit, max_attempts, subjects(name), test_classes!inner(class_id)")
        .eq("test_classes.class_id", classId)
        .order("created_at", { ascending: false })
    : { data: [] };

  // O'quvchi urinishlari
  const { data: attempts } = await supabase
    .from("test_attempts")
    .select("test_id, score, finished_at")
    .eq("student_id", user.id)
    .not("finished_at", "is", null);

  const attemptsByTest = new Map<string, { score: number | null; finished_at: string | null }[]>();
  (attempts ?? []).forEach((a: { test_id: string; score: number | null; finished_at: string | null }) => {
    if (!attemptsByTest.has(a.test_id)) attemptsByTest.set(a.test_id, []);
    attemptsByTest.get(a.test_id)!.push(a);
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.student.tests}</h1>

      {(tests ?? []).length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{uz.common.noData}</p>
        </div>
      ) : (
        <ul className="space-y-3" role="list" aria-label={uz.student.tests}>
          {(tests ?? []).map((test: unknown) => {
            const t = test as {
              id: string;
              title: string;
              description: string | null;
              test_type: string;
              time_limit: number | null;
              max_attempts: number | null;
              subjects?: { name: string } | { name: string }[] | null;
            };
            const myAttempts = attemptsByTest.get(t.id) ?? [];
            const bestScore = myAttempts.length > 0
              ? Math.round(Math.max(...myAttempts.map((a) => a.score ?? 0)))
              : null;
            const isLocked = t.max_attempts ? myAttempts.length >= t.max_attempts : false;
            const subject = Array.isArray(t.subjects) ? t.subjects[0] : t.subjects;

            return (
              <li key={t.id}>
                <Link
                  href={isLocked ? `/app/tests/${t.id}/result` : `/app/tests/${t.id}`}
                  className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-xl"
                >
                  <Card className={`hover:border-primary/50 transition-colors ${isLocked ? "opacity-75" : ""}`}>
                    <CardContent className="pt-4 pb-4 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary">{TYPE_LABELS[t.test_type]}</Badge>
                            {subject && (
                              <span className="text-xs text-muted-foreground">{subject.name}</span>
                            )}
                            {t.time_limit && (
                              <span className="text-xs text-muted-foreground">⏱ {t.time_limit} daq</span>
                            )}
                          </div>
                          <h2 className="font-medium">{t.title}</h2>
                          {t.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{t.description}</p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          {bestScore !== null && (
                            <div className="text-lg font-bold text-primary">{bestScore}%</div>
                          )}
                          {myAttempts.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {myAttempts.length}{t.max_attempts ? `/${t.max_attempts}` : ""} urinish
                            </div>
                          )}
                          {isLocked && (
                            <Badge variant="outline" className="mt-1 text-xs">Tugatildi</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
