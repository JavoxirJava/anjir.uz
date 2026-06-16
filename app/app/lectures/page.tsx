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

// Kontent turlari barqaror tartibda ko'rsatiladi.
const TYPE_ORDER = ["video", "pdf", "audio", "ppt"] as const;

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

/** Ma'ruzaning mavzu (subject) id va nomini bir joydan olamiz. */
function mavzuIdOf(l: LectureItem): string | null {
  return l.subject_id ?? l.subjects?.id ?? null;
}
function mavzuNameOf(l: LectureItem): string {
  return l.subjects?.name ?? l.subject_name ?? "Mavzu";
}

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

  // ===== MAVZU TANLANGAN: shu mavzuning barcha kontenti (video/pdf/audio/ppt) =====
  if (subjectId) {
    const lectures = allLectures.filter((l) => mavzuIdOf(l) === subjectId);
    const mavzuName = lectures[0] ? mavzuNameOf(lectures[0]) : "Mavzu";
    const fanName = lectures[0]?.fans?.name ?? null;

    // Kontentni turi bo'yicha guruhlaymiz va barqaror tartibda chiqaramiz.
    const byType = TYPE_ORDER
      .map((type) => ({ type, items: lectures.filter((l) => l.content_type === type) }))
      .filter((g) => g.items.length > 0);
    // Noma'lum turdagilar (bo'lsa) oxirida.
    const knownTypes = new Set(TYPE_ORDER as readonly string[]);
    const otherItems = lectures.filter((l) => !knownTypes.has(l.content_type));

    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <Link
            href="/app/lectures"
            className="text-sm text-primary underline underline-offset-2 focus-visible:outline-2"
          >
            ← {uz.student.lectures}
          </Link>
          <h1 className="text-2xl font-bold">{mavzuName}</h1>
          {fanName && <p className="text-sm text-muted-foreground">📘 Fan: {fanName}</p>}
        </div>

        {lectures.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">{uz.common.noData}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {byType.map((group) => (
              <section key={group.type} className="space-y-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <span aria-hidden="true">{TYPE_EMOJI[group.type]}</span>
                  {TYPE_LABELS[group.type] ?? group.type}
                  <span className="font-normal">({group.items.length})</span>
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list">
                  {group.items.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={`/app/lectures/${l.id}`}
                        className="block h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-xl"
                      >
                        <Card className="h-full hover:border-primary/50 transition-colors">
                          <CardContent className="pt-5 pb-5 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl" aria-hidden="true">{TYPE_EMOJI[l.content_type]}</span>
                              <Badge variant="secondary">{TYPE_LABELS[l.content_type] ?? l.content_type}</Badge>
                            </div>
                            <h3 className="font-semibold">{l.title}</h3>
                            {l.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{l.description}</p>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {otherItems.length > 0 && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list">
                {otherItems.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/app/lectures/${l.id}`}
                      className="block h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-xl"
                    >
                      <Card className="h-full hover:border-primary/50 transition-colors">
                        <CardContent className="pt-5 pb-5 space-y-1">
                          <h3 className="font-semibold">{l.title}</h3>
                          {l.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{l.description}</p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  }

  // ===== MAVZU RO'YXATI: ma'ruzalar mavzu bo'yicha guruhlanadi =====
  type MavzuGroup = {
    id: string;
    name: string;
    fan: string | null;
    typeCounts: Record<string, number>;
    total: number;
  };
  const groupsMap = new Map<string, MavzuGroup>();
  for (const l of allLectures) {
    const mid = mavzuIdOf(l);
    if (!mid) continue;
    let g = groupsMap.get(mid);
    if (!g) {
      g = { id: mid, name: mavzuNameOf(l), fan: l.fans?.name ?? null, typeCounts: {}, total: 0 };
      groupsMap.set(mid, g);
    }
    g.typeCounts[l.content_type] = (g.typeCounts[l.content_type] ?? 0) + 1;
    g.total += 1;
  }
  const groups = [...groupsMap.values()].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.student.lectures}</h1>

      {groups.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{uz.common.noData}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Server vaqtincha javob bermasa, sahifani yangilab qayta urinib ko&apos;ring.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list" aria-label={uz.student.lectures}>
          {groups.map((g) => (
            <li key={g.id}>
              <Link
                href={`/app/lectures?subject=${g.id}`}
                className="block h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-xl"
              >
                <Card className="h-full hover:border-primary/50 transition-colors">
                  <CardContent className="pt-5 pb-5 space-y-3">
                    <div className="space-y-1">
                      <h2 className="font-semibold flex items-center gap-2">
                        <span aria-hidden="true">📚</span>
                        {g.name}
                      </h2>
                      {g.fan && (
                        <p className="text-xs text-muted-foreground">📘 Fan: {g.fan}</p>
                      )}
                    </div>
                    {/* Mavzudagi kontent turlari */}
                    <div className="flex flex-wrap gap-2" aria-label="Mavzudagi materiallar">
                      {TYPE_ORDER.filter((t) => g.typeCounts[t]).map((t) => (
                        <Badge key={t} variant="secondary" className="gap-1">
                          <span aria-hidden="true">{TYPE_EMOJI[t]}</span>
                          {TYPE_LABELS[t]}
                          <span className="opacity-70">· {g.typeCounts[t]}</span>
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-primary">
                      Ochish — {g.total} ta material →
                    </p>
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
