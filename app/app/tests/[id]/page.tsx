import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { getTestById, getStudentAttempts, createAttempt } from "@/lib/db/tests";
import { uz } from "@/lib/strings/uz";
import { TestRunner } from "./TestRunner";
import { Badge } from "@/components/ui/badge";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const test = await getTestById(id);
  return { title: test ? `${test.title} — I-Imkon.uz` : "Test" };
}

export default async function TestPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const test = await getTestById(id);
  if (!test) notFound();

  const attempts = await getStudentAttempts(user.id, id);
  const completedAttempts = attempts.filter((a: { finished_at: string | null }) => a.finished_at);

  // Max urinishlar tekshiruvi
  if (test.max_attempts && completedAttempts.length >= test.max_attempts) {
    redirect(`/app/tests/${id}/result`);
  }

  // Yangi attempt yaratamiz
  const attemptId = await createAttempt(user.id, id);

  const TEST_TYPE_LABELS: Record<string, string> = {
    entry: uz.tests.entryTest,
    post_topic: uz.tests.postTopic,
    home_study: uz.tests.homeStudy,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">{TEST_TYPE_LABELS[test.test_type]}</Badge>
          {test.time_limit && (
            <Badge variant="outline">⏱ {test.time_limit} daqiqa</Badge>
          )}
          {completedAttempts.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {uz.student.attempts}: {completedAttempts.length}
              {test.max_attempts ? `/${test.max_attempts}` : ""}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold">{test.title}</h1>
        {test.description && (
          <p className="text-muted-foreground">{test.description}</p>
        )}
      </header>

      <TestRunner
        test={test as Parameters<typeof TestRunner>[0]["test"]}
        attemptId={attemptId}
        timeLimitMinutes={test.time_limit ?? null}
      />
    </div>
  );
}
