export const dynamic = "force-dynamic";

import { apiGet } from "@/lib/api/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParentActions } from "./ParentActions";

interface Child { id: string; first_name: string; last_name: string }
interface ParentRow {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  status: string;
  created_at: string;
  children: Child[] | null;
}

export default async function DirectorParentsPage() {
  const parents = await apiGet<ParentRow[]>("/parents/pending").catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ota-onalar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {parents.length} ta kutilayotgan so'rov
        </p>
      </div>

      {parents.length === 0 ? (
        <p className="text-muted-foreground">Kutilayotgan so'rovlar yo'q</p>
      ) : (
        <ul className="space-y-2" role="list">
          {parents.map((p) => (
            <li key={p.id}>
              <Card className="border-yellow-200">
                <CardContent className="flex items-center justify-between gap-4 pt-3 pb-3">
                  <div>
                    <p className="font-medium">{p.first_name} {p.last_name}</p>
                    <p className="text-xs text-muted-foreground">{p.phone}</p>
                    {p.children && p.children.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Farzandlar: {p.children.map((c) => `${c.first_name} ${c.last_name}`).join(", ")}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString("uz-UZ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Kutilmoqda</Badge>
                    <ParentActions userId={p.id} />
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
