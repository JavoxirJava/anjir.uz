export const dynamic = "force-dynamic";

import { apiGet } from "@/lib/api/server";
import { getCurrentUser } from "@/lib/api/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ParentActions } from "./ParentActions";
import { ParentChatButton } from "./ParentChatButton";

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

const STATUS_LABELS: Record<string, string> = {
  active: "Faol",
  pending: "Kutilmoqda",
  rejected: "Rad etilgan",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  active: "default",
  pending: "secondary",
  rejected: "destructive",
};

export default async function TeacherParentsPage() {
  const user = await getCurrentUser();
  const parents = await apiGet<ParentRow[]>("/parents/list").catch(() => []);

  const pending = parents.filter((p) => p.status === "pending");
  const active  = parents.filter((p) => p.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ota-onalar</h1>
        <p className="text-sm text-muted-foreground mt-1">{parents.length} ta ota-ona</p>
      </div>

      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-yellow-700">
            Kutilayotganlar ({pending.length})
          </h2>
          <ul className="space-y-2">
            {pending.map((p) => (
              <li key={p.id}>
                <Card className="border-yellow-200">
                  <CardContent className="flex items-center justify-between gap-4 pt-3 pb-3">
                    <ParentInfo p={p} />
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary">Kutilmoqda</Badge>
                      <ParentActions userId={p.id} />
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      {active.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Tasdiqlangan ota-onalar ({active.length})</h2>
          <ul className="space-y-2">
            {active.map((p) => (
              <li key={p.id}>
                <Card>
                  <CardContent className="flex items-center justify-between gap-4 pt-3 pb-3">
                    <ParentInfo p={p} />
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={STATUS_VARIANT[p.status] ?? "outline"}>
                        {STATUS_LABELS[p.status] ?? p.status}
                      </Badge>
                      {p.children && p.children.length > 0 && user && (
                        <ParentChatButton
                          parentId={p.id}
                          parentName={`${p.first_name} ${p.last_name}`}
                          studentId={p.children[0].id}
                          teacherId={user.id}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      {parents.length === 0 && (
        <p className="text-muted-foreground">Hali ota-onalar yo'q</p>
      )}
    </div>
  );
}

function ParentInfo({ p }: { p: ParentRow }) {
  return (
    <div>
      <p className="font-medium">{p.first_name} {p.last_name}</p>
      <p className="text-xs text-muted-foreground">{p.phone}</p>
      {p.children && p.children.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Farzandlar: {p.children.map((c) => `${c.first_name} ${c.last_name}`).join(", ")}
        </p>
      )}
    </div>
  );
}
