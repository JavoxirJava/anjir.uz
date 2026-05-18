import { getCurrentUser } from "@/lib/api/auth";
import { apiGet } from "@/lib/api/server";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { uz } from "@/lib/strings/uz";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `${uz.student.lectures} — I-Imkon.uz`,
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

interface Props {
  searchParams: Promise<{ subject?: string | string[] }>;
}

type LectureItem = {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  subject_id?: string | null;
  subject_name?: string | null;
  subjects?: { id?: string; name?: string } | null;
  fans?: { id?: string; name?: string } | null;
};

export default async function StudentLecturesPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const q = await searchParams;
  const subjectId = typeof q.subject === "string" ? q.subject : undefined;

  const profile = await apiGet<{ class_id: string | null } | null>("/students/me").catch(() => null);
  const classId = profile?.class_id ?? null;

  const allLectures = classId
    ? await apiGet<LectureItem[]>(`/lectures?class_id=${classId}`).catch(() => [])
    : [];
  const lectures = subjectId
    ? allLectures.filter((l) => (l.subject_id ?? l.subjects?.id) === subjectId)
    : allLectures;
  const activeSubjectName = subjectId
    ? allLectures.find((l) => (l.subject_id ?? l.subjects?.id) === subjectId)?.subjects?.name
      ?? allLectures.find((l) => (l.subject_id ?? l.subjects?.id) === subjectId)?.subject_name
      ?? "Mavzu"
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.student.lectures}</h1>
      {subjectId && (
        <div className="flex items-center gap-3 flex-wrap rounded-lg border bg-muted/40 px-4 py-2">
          <span className="text-sm">📚 Mavzu: <strong>{activeSubjectName}</strong></span>
          <Link href="/app/lectures" className="text-xs text-primary underline underline-offset-2">
            Filterni tozalash
          </Link>
        </div>
      )}

      {lectures.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{uz.common.noData}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Server vaqtincha javob bermasa, sahifani yangilab qayta urinib ko&apos;ring.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list" aria-label={uz.student.lectures}>
          {lectures.map((l) => (
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
                    {l.fans?.name && (
                      <p className="text-xs text-muted-foreground">📘 Fan: {l.fans.name}</p>
                    )}
                    {(l.subjects?.name || l.subject_name) && (
                      <p className="text-xs text-muted-foreground">📚 Mavzu: {l.subjects?.name ?? l.subject_name}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
