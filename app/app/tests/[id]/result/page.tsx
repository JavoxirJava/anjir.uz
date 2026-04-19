import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Test natijasi — Anjir.uz" };

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attemptId?: string; score?: string }>;
}

export default async function TestResultPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { attemptId, score: scoreParam } = await searchParams;
  const supabase = await createClient();

  // So'nggi attempt natijasi
  let score = scoreParam ? parseInt(scoreParam) : null;
  let attemptData: { score: number | null; finished_at: string | null } | null = null;

  if (attemptId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("test_attempts")
      .select("score, finished_at")
      .eq("id", attemptId)
      .single() as { data: { score: number | null; finished_at: string | null } | null };
    attemptData = data;
    if (attemptData?.score !== undefined && attemptData.score !== null) {
      score = Math.round(attemptData.score);
    }
  }

  const { data: testData } = await supabase
    .from("tests")
    .select("title, max_attempts")
    .eq("id", id)
    .single();

  const { data: allAttempts } = await supabase
    .from("test_attempts")
    .select("score, finished_at")
    .eq("test_id", id)
    .not("finished_at", "is", null)
    .order("finished_at", { ascending: false });

  const completedAttempts = (allAttempts ?? []) as { score: number | null; finished_at: string | null }[];

  const getGrade = (s: number) => {
    if (s >= 86) return { label: "A'lo", color: "text-green-600", emoji: "🏆" };
    if (s >= 71) return { label: "Yaxshi", color: "text-blue-600", emoji: "⭐" };
    if (s >= 56) return { label: "Qoniqarli", color: "text-yellow-600", emoji: "👍" };
    return { label: "Qoniqarsiz", color: "text-destructive", emoji: "📚" };
  };

  const grade = score !== null ? getGrade(score) : null;
  const maxAttempts = (testData as { max_attempts?: number | null } | null)?.max_attempts;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{uz.student.result}</h1>

      {/* Asosiy natija */}
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
          <p className="font-medium text-lg">{(testData as { title?: string } | null)?.title}</p>
          <p className="text-sm text-muted-foreground">
            {completedAttempts.length} ta urinish
            {maxAttempts ? ` (${maxAttempts} ta ruxsat)` : ""}
          </p>
        </CardContent>
      </Card>

      {/* Urinishlar tarixi */}
      {completedAttempts.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Urinishlar tarixi</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2" role="list" aria-label="Urinishlar tarixi">
              {completedAttempts.slice(0, 5).map((a, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {i + 1}-urinish
                  </span>
                  <span className="font-medium">
                    {a.score !== null ? `${Math.round(a.score)}%` : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Harakatlar */}
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
