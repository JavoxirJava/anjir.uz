import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `${uz.director.subjects} — I-Imkon.uz`,
};

export default async function DirectorSubjectsPage() {
  const supabase = await createClient();

  // Global fanlar ro'yxati (admin tomonidan kiritilgan)
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name, description")
    .order("name");

  type Subject = { id: string; name: string; description: string | null };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{uz.director.subjects}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tizimda mavjud fanlar ro&apos;yxati
        </p>
      </div>

      {(subjects ?? []).length === 0 ? (
        <p className="text-muted-foreground">{uz.common.noData}</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list">
          {(subjects as Subject[]).map((s) => (
            <li key={s.id}>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="font-medium">{s.name}</p>
                  {s.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">{s.description}</p>
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
