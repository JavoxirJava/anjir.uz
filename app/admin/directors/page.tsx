import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: `${uz.admin.directors} — Anjir.uz`,
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  pending: "secondary",
  rejected: "destructive",
};

export default async function AdminDirectorsPage() {
  const supabase = await createClient();

  const { data: directors } = await supabase
    .from("users")
    .select("id, first_name, last_name, status, created_at")
    .eq("role", "director")
    .order("first_name");

  // Maktablar bilan bog'lash
  const { data: schools } = await supabase
    .from("schools")
    .select("id, name, director_id");

  const schoolByDirector = Object.fromEntries(
    (schools ?? []).map((s: { id: string; name: string; director_id: string | null }) => [
      s.director_id ?? "",
      s,
    ])
  );

  type Director = { id: string; first_name: string; last_name: string; status: string; created_at: string };
  type School = { id: string; name: string };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{uz.admin.directors}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {(directors ?? []).length} ta direktor
        </p>
      </div>

      {(directors ?? []).length === 0 ? (
        <p className="text-muted-foreground">{uz.common.noData}</p>
      ) : (
        <ul className="space-y-2" role="list" aria-label={uz.admin.directors}>
          {(directors as Director[]).map((d) => {
            const school = schoolByDirector[d.id] as School | undefined;
            return (
              <li key={d.id}>
                <Card>
                  <CardContent className="flex items-center justify-between gap-4 pt-3 pb-3">
                    <div>
                      <p className="font-medium">{d.first_name} {d.last_name}</p>
                      {school ? (
                        <p className="text-xs text-muted-foreground">{school.name}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Maktab biriktirilmagan</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(d.created_at).toLocaleDateString("uz-UZ")}
                      </p>
                    </div>
                    <Badge variant={STATUS_VARIANT[d.status] ?? "outline"}>{d.status}</Badge>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
