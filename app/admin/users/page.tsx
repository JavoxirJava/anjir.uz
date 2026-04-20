import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UserActions, StatusBadge } from "./UserActions";

export const metadata: Metadata = {
  title: `${uz.admin.users} — Anjir.uz`,
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Admin",
  director: "Direktor",
  teacher: "O'qituvchi",
  student: "O'quvchi",
};

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("users")
    .select("id, first_name, last_name, role, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.admin.users}</h1>

      <ul className="space-y-2" role="list" aria-label={uz.admin.users}>
        {(users ?? []).map((u: {
          id: string;
          first_name: string;
          last_name: string;
          role: string;
          status: string;
          created_at: string;
        }) => (
          <li key={u.id}>
            <Card>
              <CardContent className="flex items-center justify-between gap-3 pt-3 pb-3">
                <div>
                  <p className="font-medium">{u.first_name} {u.last_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString("uz-UZ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{ROLE_LABELS[u.role] ?? u.role}</Badge>
                  <StatusBadge status={u.status} />
                  <UserActions userId={u.id} status={u.status} />
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
