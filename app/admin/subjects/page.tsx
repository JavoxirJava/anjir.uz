import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent } from "@/components/ui/card";
import { AddSubjectForm } from "./AddSubjectForm";
import { SubjectActions } from "./SubjectActions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${uz.admin.subjects} — I-Imkon.uz`,
};

export default async function AdminSubjectsPage() {
  const admin = createAdminClient();
  const { data: subjects } = await admin
    .from("subjects")
    .select("id, name")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">{uz.admin.subjects}</h1>
        <span className="text-sm text-muted-foreground">{subjects?.length ?? 0} ta fan</span>
      </div>

      <AddSubjectForm />

      <ul className="space-y-2" role="list">
        {(subjects ?? []).map((s: { id: string; name: string }) => (
          <li key={s.id}>
            <Card>
              <CardContent className="flex items-center justify-between gap-3 pt-3 pb-3">
                <span className="text-sm font-medium">{s.name}</span>
                <SubjectActions subject={s} />
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      {(subjects ?? []).length === 0 && (
        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground text-sm">
          Hali fan qo&apos;shilmagan. Yuqoridagi formadan fanning nomini kiriting.
        </div>
      )}
    </div>
  );
}
