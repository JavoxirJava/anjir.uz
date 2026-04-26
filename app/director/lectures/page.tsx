import { getCurrentUser } from "@/lib/api/auth";
import { apiGet } from "@/lib/api/server";
import type { Metadata } from "next";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: `${uz.director.lectures} — I-Imkon.uz`,
};

type Lecture = {
  id: string;
  title: string;
  class_id: string;
  created_at: string;
  subject_name: string | null;
};

export default async function DirectorLecturesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const school = await apiGet<{ id: string } | null>("/schools/my").catch(() => null);
  const lectures = school
    ? await apiGet<Lecture[]>(`/schools/${school.id}/lectures`).catch(() => [])
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{uz.director.lectures}</h1>
        <p className="text-sm text-muted-foreground mt-1">{lectures.length} ta ma&apos;ruza</p>
      </div>

      {lectures.length === 0 ? (
        <p className="text-muted-foreground">{uz.common.noData}</p>
      ) : (
        <ul className="space-y-2" role="list" aria-label={uz.director.lectures}>
          {lectures.map((l) => (
            <li key={l.id}>
              <Card>
                <CardContent className="flex items-center justify-between gap-4 pt-3 pb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{l.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(l.created_at).toLocaleDateString("uz-UZ")}
                    </p>
                  </div>
                  {l.subject_name && (
                    <Badge variant="secondary">{l.subject_name}</Badge>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
