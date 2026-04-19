import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `${uz.student.lectures} — Anjir.uz`,
};

const TYPE_LABELS: Record<string, string> = {
  pdf:   uz.lectures.pdf,
  video: uz.lectures.video,
  audio: uz.lectures.audio,
  ppt:   uz.lectures.ppt,
};

const TYPE_EMOJI: Record<string, string> = {
  pdf:   "📄",
  video: "🎥",
  audio: "🎵",
  ppt:   "📊",
};

export default async function StudentLecturesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("class_id")
    .eq("user_id", user.id)
    .single();

  const classId = (profile as { class_id: string } | null)?.class_id;

  const { data: lectures } = classId
    ? await supabase
        .from("lectures")
        .select("id, title, description, content_type, subjects(name)")
        .eq("class_id", classId)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.student.lectures}</h1>

      {(lectures ?? []).length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{uz.common.noData}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list" aria-label={uz.student.lectures}>
          {(lectures ?? []).map((lec: unknown) => {
            const l = lec as {
              id: string;
              title: string;
              description: string | null;
              content_type: string;
              subjects?: { name: string } | { name: string }[] | null;
            };
            const subject = Array.isArray(l.subjects) ? l.subjects[0] : l.subjects;
            return (
              <li key={l.id}>
                <Link
                  href={`/app/lectures/${l.id}`}
                  className="block h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-xl"
                >
                  <Card className="h-full hover:border-primary/50 transition-colors">
                    <CardContent className="pt-5 pb-5 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl" aria-hidden="true">{TYPE_EMOJI[l.content_type]}</span>
                        <Badge variant="secondary">{TYPE_LABELS[l.content_type]}</Badge>
                      </div>
                      <h2 className="font-semibold">{l.title}</h2>
                      {l.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{l.description}</p>
                      )}
                      {subject && (
                        <p className="text-xs text-muted-foreground">📚 {subject.name}</p>
                      )}
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
