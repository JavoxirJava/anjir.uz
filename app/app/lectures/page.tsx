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
  searchParams: Promise<{ subject?: string | string[]; topic?: string | string[] }>;
}

type LectureItem = {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  topic_id?: string | null;
  topics?: { id?: string; name?: string; subject_id?: string } | null;
  fans?: { id?: string; name?: string } | null;
  subjects?: { id?: string; name?: string } | null;
};

type TopicGroup = {
  topicId: string;
  topicName: string | undefined;
  subjectId: string | undefined;
  subjectName: string | undefined;
  items: LectureItem[];
};

type SubjectGroup = {
  subjectId: string;
  subjectName: string | undefined;
  topics: TopicGroup[];
};

function groupByTopic(lectures: LectureItem[]): TopicGroup[] {
  const map = new Map<string, TopicGroup>();
  for (const l of lectures) {
    const key = l.topic_id ?? l.topics?.id ?? "__none__";
    let group = map.get(key);
    if (!group) {
      group = {
        topicId: key,
        topicName: l.topics?.name,
        subjectId: l.topics?.subject_id ?? l.fans?.id,
        subjectName: l.fans?.name,
        items: [],
      };
      map.set(key, group);
    }
    group.items.push(l);
  }
  // Darslarni nom bo'yicha tabiiy saralash: "1-dars" < "2-dars" < "10-dars"
  for (const group of map.values()) {
    group.items.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
  }
  return Array.from(map.values());
}

function groupBySubject(groups: TopicGroup[]): SubjectGroup[] {
  const map = new Map<string, SubjectGroup>();
  for (const g of groups) {
    const key = g.subjectId ?? "__none__";
    let sg = map.get(key);
    if (!sg) {
      sg = { subjectId: key, subjectName: g.subjectName, topics: [] };
      map.set(key, sg);
    }
    sg.topics.push(g);
  }
  return Array.from(map.values());
}

// Mavzudagi darslar tarkibi: takrorlanmas tur ro'yxati (tartibni saqlab)
function distinctTypes(items: LectureItem[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const i of items) {
    if (!seen.has(i.content_type)) {
      seen.add(i.content_type);
      out.push(i.content_type);
    }
  }
  return out;
}

export default async function StudentLecturesPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const q = await searchParams;
  const subjectId = typeof q.subject === "string" ? q.subject : undefined;
  const topicId = typeof q.topic === "string" ? q.topic : undefined;

  const profile = await apiGet<{ class_id: string | null } | null>("/students/me").catch(() => null);
  const classId = profile?.class_id ?? null;

  const allLectures = classId
    ? await apiGet<LectureItem[]>(`/lectures?class_id=${classId}`).catch(() => [])
    : [];
  const topicGroups = groupByTopic(allLectures);

  // ── 2-bosqich: mavzu tanlangan → shu mavzu darslari ──────────────────────
  if (topicId) {
    const group = topicGroups.find((g) => g.topicId === topicId);
    const items = group?.items ?? [];
    const backHref = group?.subjectId && group.subjectId !== "__none__"
      ? `/app/lectures?subject=${group.subjectId}`
      : "/app/lectures";

    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-sm text-primary underline underline-offset-2 focus-visible:outline-2"
          >
            ← Mavzular
          </Link>
          {group?.subjectName && (
            <p className="text-xs text-muted-foreground">📘 {group.subjectName}</p>
          )}
          <h1 className="text-2xl font-bold">📚 {group?.topicName ?? "Mavzu"}</h1>
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">{uz.common.noData}</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list" aria-label={group?.topicName ?? uz.student.lectures}>
            {items.map((l) => (
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

  // ── 1-bosqich: mavzular ro'yxati (tugmalar) ──────────────────────────────
  const visibleGroups = subjectId
    ? topicGroups.filter((g) => g.subjectId === subjectId)
    : topicGroups;
  const subjectGroups = groupBySubject(visibleGroups);
  const activeSubjectName = subjectId ? visibleGroups[0]?.subjectName ?? "Fan" : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.student.lectures}</h1>
      {subjectId && (
        <div className="flex items-center gap-3 flex-wrap rounded-lg border bg-muted/40 px-4 py-2">
          <span className="text-sm">📘 Fan: <strong>{activeSubjectName}</strong></span>
          <Link href="/app/lectures" className="text-xs text-primary underline underline-offset-2">
            Filterni tozalash
          </Link>
        </div>
      )}

      {visibleGroups.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{uz.common.noData}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Server vaqtincha javob bermasa, sahifani yangilab qayta urinib ko&apos;ring.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {subjectGroups.map((sg) => (
            <section key={sg.subjectId} aria-labelledby={`subject-${sg.subjectId}`}>
              {sg.subjectName && (
                <h2 id={`subject-${sg.subjectId}`} className="text-sm font-medium text-muted-foreground mb-3">
                  📘 {sg.subjectName}
                </h2>
              )}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list">
                {sg.topics.map((g) => (
                  <li key={g.topicId}>
                    <Link
                      href={`/app/lectures?topic=${g.topicId}`}
                      className="block h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-xl"
                    >
                      <Card className="h-full hover:border-primary/50 transition-colors">
                        <CardContent className="pt-5 pb-5 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold">📚 {g.topicName ?? "Mavzusiz"}</h3>
                            <span className="text-muted-foreground text-lg shrink-0" aria-hidden="true">→</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{g.items.length} ta dars</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {distinctTypes(g.items).map((t) => (
                              <Badge key={t} variant="secondary" className="font-normal">
                                <span aria-hidden="true">{TYPE_EMOJI[t]}</span> {TYPE_LABELS[t] ?? t}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
