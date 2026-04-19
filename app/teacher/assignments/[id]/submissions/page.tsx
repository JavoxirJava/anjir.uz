import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAssignmentById, getSubmissionsForAssignment } from "@/lib/db/assignments";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GradeForm } from "./GradeForm";

export const metadata: Metadata = {
  title: "Topshiriqlar — Anjir.uz",
};

interface Props { params: Promise<{ id: string }> }

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("uz-UZ", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

export default async function SubmissionsPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const assignment = await getAssignmentById(id);
  if (!assignment) notFound();
  if (assignment.teacher_id !== user.id) redirect("/teacher/assignments");

  const submissions = await getSubmissionsForAssignment(id);

  const submitted = submissions.filter((s) => s.submitted_at);
  const graded = submissions.filter((s) => s.graded_at);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{assignment.title}</h1>
        <p className="text-sm text-muted-foreground">
          {submitted.length} topshiriq • {graded.length} baholangan
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">Hali hech kim topshirmagan</p>
        </div>
      ) : (
        <ul className="space-y-4" role="list" aria-label="O'quvchi topshiriqlari">
          {submissions.map((sub) => {
            const student = sub.users as { first_name: string; last_name: string } | null;
            const isGraded = !!sub.graded_at;
            return (
              <li key={sub.id}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <CardTitle className="text-base">
                        {student
                          ? `${student.first_name} ${student.last_name}`
                          : "Noma'lum o'quvchi"}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {isGraded ? (
                          <Badge variant="default">
                            {sub.score}/{assignment.max_score} ball
                          </Badge>
                        ) : sub.submitted_at ? (
                          <Badge variant="secondary">Baholanmagan</Badge>
                        ) : (
                          <Badge variant="outline">Topshirilmagan</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(sub.submitted_at)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {sub.content && (
                      <div className="rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                        {sub.content}
                      </div>
                    )}
                    {sub.file_url && (
                      <a
                        href={sub.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-primary underline focus-visible:outline-2"
                      >
                        📎 Fayl ko&apos;rish
                      </a>
                    )}
                    {sub.teacher_comment && (
                      <div className="text-sm text-muted-foreground italic">
                        Izoh: {sub.teacher_comment}
                      </div>
                    )}
                    {sub.submitted_at && (
                      <GradeForm
                        submissionId={sub.id}
                        assignmentId={id}
                        maxScore={assignment.max_score}
                        currentScore={sub.score}
                        currentComment={sub.teacher_comment}
                      />
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
