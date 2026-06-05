import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { getAssignmentById, getStudentSubmission } from "@/lib/db/assignments";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PdfReadAloudButton } from "@/components/lectures/PdfReadAloudButton";
import { ProgressActions } from "./ProgressActions";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const a = await getAssignmentById(id);
  return { title: a ? `${a.title} — I-Imkon.uz` : "Vazifa" };
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  const d = isDateOnly ? new Date(`${iso}T23:59:59.999`) : new Date(iso);
  return d.toLocaleDateString("uz-UZ", isDateOnly
    ? { day: "numeric", month: "long", year: "numeric" }
    : { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function StudentAssignmentPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const assignment = await getAssignmentById(id);
  if (!assignment) notFound();

  const submission = await getStudentSubmission(id, user.id);
  const isGraded = !!submission?.graded_at;
  const dueRaw = assignment.due_date ?? assignment.deadline ?? null;
  const dueDate = dueRaw
    ? (/^\d{4}-\d{2}-\d{2}$/.test(dueRaw) ? new Date(`${dueRaw}T23:59:59.999`) : new Date(dueRaw))
    : null;
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
              📅 Muddat: {formatDate(dueRaw)}
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

      {assignment.link && (
        <Card>
          <CardContent className="pt-4 pb-4 space-y-2">
            <p className="text-sm font-medium">🔗 Havola</p>
            <a
              href={assignment.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary underline break-all focus-visible:outline-2"
            >
              {assignment.link}
            </a>
            <p className="text-xs text-muted-foreground">
              Yangi oynada ochiladi
            </p>
          </CardContent>
        </Card>
      )}

      {assignment.file_url && (
        <Card>
          <CardContent className="pt-4 pb-4 space-y-3">
            <p className="text-sm font-medium">📄 Tavsif PDF</p>
            <div className="flex items-center gap-3 flex-wrap">
              <PdfReadAloudButton pdfUrl={assignment.file_url} />
              <span className="text-xs text-muted-foreground">
                PDF ichidagi matnni ovozli o&apos;qib beradi
              </span>
            </div>
            <div className="rounded-lg border overflow-hidden bg-muted" style={{ height: "65vh", minHeight: "360px" }}>
              <iframe
                src={`${assignment.file_url}#toolbar=1&navpanes=0&scrollbar=1`}
                title={`${assignment.title} tavsif PDF`}
                className="w-full h-full border-0"
              />
            </div>
            <a
              href={assignment.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary underline"
            >
              Yangi oynada ochish
            </a>
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

      {!isGraded && (
        <Card>
          <CardContent className="pt-4 pb-4 text-sm text-muted-foreground">
            Topshiriqni o&apos;qituvchi tekshiradi.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Topshiriq holati</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressActions
            assignmentId={id}
            progressState={submission?.progress_state ?? null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
