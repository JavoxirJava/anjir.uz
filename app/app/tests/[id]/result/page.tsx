import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/api/auth";
import { apiGet } from "@/lib/api/server";
import { redirect } from "next/navigation";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Test natijasi — I-Imkon.uz" };

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attemptId?: string; score?: string }>;
}

interface AttemptData {
  score: number | null;
  finished_at: string | null;
}

interface TestData {
  title: string;
  max_attempts: number | null;
  attempts: AttemptData[];
}

function getGrade(s: number) {
  if (s >= 86) return { label: "A'lo", color: "text-green-600", emoji: "🏆" };
  if (s >= 71) return { label: "Yaxshi", color: "text-blue-600", emoji: "⭐" };
  if (s >= 56) return { label: "Qoniqarli", color: "text-yellow-600", emoji: "👍" };
  return { label: "Qoniqarsiz", color: "text-destructive", emoji: "📚" };
}

export default async function TestResultPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { score: scoreParam } = await searchParams;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const testData = await apiGet<TestData>(`/tests/${id}/result?student_id=${user.id}`).catch(() => null);

  let score = scoreParam ? parseInt(scoreParam) : null;
  if (score === null && testData?.attempts?.length) {
    const last = testData.attempts[0];
    if (last.score !== null) score = Math.round(last.score);
  }

  const grade = score !== null ? getGrade(score) : null;
  const completedAttempts = testData?.attempts ?? [];
  const maxAttempts = testData?.max_attempts ?? null;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{uz.student.result}</h1>

      <Card>
        <CardHeader className="text-center pb-2">
          <div className="text-5xl mb-2" aria-hidden="true">{grade?.emoji ?? "📊"}</div>
          <CardTitle className="text-3xl">
            {score !== null ? `${score}%` : "—"}
          </CardTitle>
          {grade && (
            <p className={`text-lg font-semibold ${grade.color}`} role="status">
              {grade.label}
            </p>
          )}
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <p className="font-medium text-lg">{testData?.title}</p>
          <p className="text-sm text-muted-foreground">
            {completedAttempts.length} ta urinish
            {maxAttempts ? ` (${maxAttempts} ta ruxsat)` : ""}
          </p>
        </CardContent>
      </Card>

      {completedAttempts.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Urinishlar tarixi</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2" role="list" aria-label="Urinishlar tarixi">
              {completedAttempts.slice(0, 5).map((a, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{i + 1}-urinish</span>
                  <span className="font-medium">
                    {a.score !== null ? `${Math.round(a.score)}%` : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {(!maxAttempts || completedAttempts.length < maxAttempts) && (
          <Link
            href={`/app/tests/${id}`}
            className="flex items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium hover:bg-muted transition-colors focus-visible:outline-2"
          >
            Qayta yechish
          </Link>
        )}
        <Link
          href="/app"
          className="flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-2"
        >
          {uz.student.dashboard}ga qaytish
        </Link>
      </div>
    </div>
  );
}
