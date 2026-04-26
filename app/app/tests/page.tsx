import { getCurrentUser } from "@/lib/api/auth";
import { apiGet } from "@/lib/api/server";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
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

interface TestItem {
  id: string;
  title: string;
  description: string | null;
  test_type: string;
  time_limit: number | null;
  max_attempts: number | null;
  subjects: { name: string } | null;
  my_attempts: { score: number | null }[];
}

export default async function StudentTestsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tests = await apiGet<TestItem[]>("/students/me/tests").catch(() => []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.student.tests}</h1>

      {tests.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{uz.common.noData}</p>
        </div>
      ) : (
        <ul className="space-y-3" role="list" aria-label={uz.student.tests}>
          {tests.map((t) => {
            const bestScore = t.my_attempts.length > 0
              ? Math.round(Math.max(...t.my_attempts.map((a) => a.score ?? 0)))
              : null;
            const isLocked = t.max_attempts ? t.my_attempts.length >= t.max_attempts : false;

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
                            {t.subjects && <span className="text-xs text-muted-foreground">{t.subjects.name}</span>}
                            {t.time_limit && <span className="text-xs text-muted-foreground">⏱ {t.time_limit} daq</span>}
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
                          {t.my_attempts.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {t.my_attempts.length}{t.max_attempts ? `/${t.max_attempts}` : ""} urinish
                            </div>
                          )}
                          {isLocked && <Badge variant="outline" className="mt-1 text-xs">Tugatildi</Badge>}
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
