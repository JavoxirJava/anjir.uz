import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAssignmentsByTeacher } from "@/lib/db/assignments";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent } from "@/components/ui/card";
import { AssignmentDeleteButton } from "./AssignmentDeleteButton";

export const metadata: Metadata = {
  title: `${uz.teacher.myAssignments} — I-Imkon.uz`,
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" });
}

export default async function TeacherAssignmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const assignments = await getAssignmentsByTeacher(user!.id);

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
                    <h2 className="font-medium">{a.title}</h2>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      {a.subjects && (
                        <span>📚 {Array.isArray(a.subjects)
                          ? (a.subjects[0] as { name: string })?.name
                          : (a.subjects as { name: string }).name}
                        </span>
                      )}
                      {a.due_date && (
                        <span>📅 {formatDate(a.due_date)}</span>
                      )}
                      <span>⭐ Maks: {a.max_score} ball</span>
                    </div>
                    {a.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{a.description}</p>
                    )}
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
