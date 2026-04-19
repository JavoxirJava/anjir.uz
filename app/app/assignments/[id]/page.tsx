import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAssignmentById, getStudentSubmission } from "@/lib/db/assignments";
import { uz } from "@/lib/strings/uz";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmissionForm } from "./SubmissionForm";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const a = await getAssignmentById(id);
  return { title: a ? `${a.title} — Anjir.uz` : "Vazifa" };
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("uz-UZ", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

export default async function StudentAssignmentPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const assignment = await getAssignmentById(id);
  if (!assignment) notFound();

  const submission = await getStudentSubmission(id, user.id);
  const isGraded = !!submission?.graded_at;
  const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;
  const isOverdue = dueDate ? dueDate < new Date() : false;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="space-y-2">
        {assignment.subjects && (
          <Badge variant="secondary">
            📚 {Array.isArray(assignment.subjects)
              ? (assignment.subjects[0] as { name: string })?.name
              : (assignment.subjects as { name: string }).name}
          </Badge>
        )}
        <h1 className="text-2xl font-bold">{assignment.title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
          <span>⭐ Maksimal ball: {assignment.max_score}</span>
          {dueDate && (
            <span className={isOverdue && !submission ? "text-destructive font-medium" : ""}>
              📅 Muddat: {formatDate(assignment.due_date)}
              {isOverdue && !submission ? " (o'tib ketdi!)" : ""}
            </span>
          )}
        </div>
      </header>

      {/* Tavsif */}
      {assignment.description && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{assignment.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Yuborilgan topshiriq */}
      {submission && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Topshiriq</span>
              {isGraded ? (
                <Badge variant="default">
                  {submission.score}/{assignment.max_score} ball
                </Badge>
              ) : (
                <Badge variant="secondary">Baholanmagan</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {submission.content && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                {submission.content}
              </div>
            )}
            {submission.file_url && (
              <a
                href={submission.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary underline focus-visible:outline-2"
              >
                📎 Yuklangan fayl
              </a>
            )}
            {submission.teacher_comment && (
              <div className="rounded-lg border-l-4 border-primary pl-3 text-sm">
                <p className="text-xs text-muted-foreground mb-1">O&apos;qituvchi izohi:</p>
                <p>{submission.teacher_comment}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Yuborish formasi (agar baholanmagan bo'lsa yoki hali yuborilmagan bo'lsa) */}
      {!isGraded && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {submission ? "Topshiriqni yangilash" : "Topshiriq yuborish"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SubmissionForm
              assignmentId={id}
              existingContent={submission?.content ?? ""}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
