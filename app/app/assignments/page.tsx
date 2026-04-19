import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAssignmentsForStudent } from "@/lib/db/assignments";
import { uz } from "@/lib/strings/uz";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `${uz.student.assignments} — Anjir.uz`,
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  const now = new Date();
  const isOverdue = d < now;
  return { text: d.toLocaleDateString("uz-UZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }), isOverdue };
}

export default async function StudentAssignmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("class_id")
    .eq("user_id", user.id)
    .single();

  const assignments = profile?.class_id
    ? await getAssignmentsForStudent(profile.class_id)
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.student.assignments}</h1>

      {assignments.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{uz.common.noData}</p>
          <p className="text-sm text-muted-foreground mt-1">
            O&apos;qituvchingiz vazifa berishi kutilmoqda
          </p>
        </div>
      ) : (
        <ul className="space-y-3" role="list" aria-label={uz.student.assignments}>
          {assignments.map((a) => {
            const due = formatDate(a.due_date);
            return (
              <li key={a.id}>
                <Link
                  href={`/app/assignments/${a.id}`}
                  className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-xl"
                >
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardContent className="pt-4 pb-4 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <h2 className="font-medium">{a.title}</h2>
                          {a.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {a.max_score} ball
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        {a.subjects && (
                          <span>📚 {Array.isArray(a.subjects)
                            ? (a.subjects[0] as { name: string })?.name
                            : (a.subjects as { name: string }).name}
                          </span>
                        )}
                        {due && (
                          <span className={due.isOverdue ? "text-destructive font-medium" : ""}>
                            📅 {due.isOverdue ? "Muddati o'tgan: " : ""}{due.text}
                          </span>
                        )}
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
