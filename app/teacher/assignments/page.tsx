import { getCurrentUser } from "@/lib/api/auth";
import type { Metadata } from "next";
import Link from "next/link";
import { getAssignmentsByTeacher } from "@/lib/db/assignments";
import { getTeacherSubjectsAndClasses } from "@/lib/db/teacher-assignments";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent } from "@/components/ui/card";
import { AssignmentDeleteButton } from "./AssignmentDeleteButton";
import { AssignmentSubjectEditor } from "./AssignmentSubjectEditor";

export const metadata: Metadata = {
  title: `${uz.teacher.myAssignments} — I-Imkon.uz`,
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" });
}

function difficultyLabel(level?: "low" | "medium" | "high") {
  if (level === "high") return "Yuqori";
  if (level === "medium") return "O'rta";
  return "Quyi";
}

export default async function TeacherAssignmentsPage() {
  const user = await getCurrentUser();
  const [assignments, options] = await Promise.all([
    getAssignmentsByTeacher(user!.id),
    getTeacherSubjectsAndClasses(user!.id),
  ]);
  const subjects = Array.from(
    new Map(options.subjects.map((s) => [s.id, { id: s.id, name: s.name }])).values()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">{uz.teacher.myAssignments}</h1>
        <Link
          href="/teacher/assignments/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          + {uz.teacher.addAssignment}
        </Link>
      </div>

      {assignments.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{uz.common.noData}</p>
          <Link href="/teacher/assignments/new" className="mt-4 inline-block text-sm text-primary underline">
            {uz.teacher.addAssignment}
          </Link>
        </div>
      ) : (
        <ul className="space-y-3" role="list" aria-label={uz.teacher.myAssignments}>
          {assignments.map((a) => (
            <li key={a.id}>
              <Card>
                <CardContent className="flex items-center justify-between gap-4 pt-4 pb-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    {(() => {
                      const classes = Array.isArray(a.classes)
                        ? a.classes
                        : (a.classes ? [a.classes] : []);
                      const classesText = classes
                        .map((cls) => `${cls.grade}-${cls.letter}`)
                        .join(", ");
                      return (
                        <>
                    <h2 className="font-medium">{a.title}</h2>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      {a.subjects && (
                        <span>📚 {Array.isArray(a.subjects)
                          ? (a.subjects[0] as { name: string })?.name
                          : (a.subjects as { name: string }).name}
                        </span>
                      )}
                      {(a.due_date || a.deadline) && (
                        <span>📅 Muddat: {formatDate(a.due_date ?? a.deadline ?? null)}</span>
                      )}
                      <span>⭐ Maks: {a.max_score ?? 100} ball</span>
                      <span>🎯 Daraja: {difficultyLabel(a.difficulty_level)}</span>
                      <span>📎 PDF: {a.file_url ? "Bor" : "Yo'q"}</span>
                      <span>♿ Imkoniyati cheklanganlar uchun: {a.is_for_disabled ? "Ha" : "Yo'q"}</span>
                      {classes.length > 0 && (
                        <span>🏫 Sinflar: {classesText}</span>
                      )}
                    </div>
                    {a.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{a.description}</p>
                    )}
                    <AssignmentSubjectEditor
                      assignmentId={a.id}
                      currentSubjectId={a.subject_id}
                      subjects={subjects}
                    />
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/teacher/assignments/${a.id}/submissions`}
                      className="rounded-md px-3 py-1.5 text-sm border hover:bg-muted focus-visible:outline-2"
                    >
                      Topshiriqlar
                    </Link>
                    <AssignmentDeleteButton id={a.id} />
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
