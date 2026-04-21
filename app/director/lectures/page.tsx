import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: `${uz.director.lectures} — I-Imkon.uz`,
};

export default async function DirectorLecturesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: school } = await supabase
    .from("schools")
    .select("id")
    .eq("director_id", user!.id)
    .single();

  const schoolId = (school as { id: string } | null)?.id;

  // Shu maktabga tegishli sinflar
  const { data: classes } = await supabase
    .from("classes")
    .select("id")
    .eq("school_id", schoolId ?? "");

  const classIds = (classes ?? []).map((c: { id: string }) => c.id);

  // O'sha sinflarga biriktirilgan ma'ruzalar
  const { data: lectures } = classIds.length > 0
    ? await supabase
        .from("lectures")
        .select("id, title, subject_id, class_id, created_at, subjects(name)")
        .in("class_id", classIds)
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  type Lecture = {
    id: string;
    title: string;
    class_id: string;
    created_at: string;
    subjects: { name: string } | null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{uz.director.lectures}</h1>
        <p className="text-sm text-muted-foreground mt-1">{(lectures ?? []).length} ta ma'ruza</p>
      </div>

      {(lectures ?? []).length === 0 ? (
        <p className="text-muted-foreground">{uz.common.noData}</p>
      ) : (
        <ul className="space-y-2" role="list" aria-label={uz.director.lectures}>
          {(lectures as Lecture[]).map((l) => (
            <li key={l.id}>
              <Card>
                <CardContent className="flex items-center justify-between gap-4 pt-3 pb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{l.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(l.created_at).toLocaleDateString("uz-UZ")}
                    </p>
                  </div>
                  {l.subjects && (
                    <Badge variant="secondary">{l.subjects.name}</Badge>
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
