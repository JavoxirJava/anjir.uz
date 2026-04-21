import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent } from "@/components/ui/card";
import { AddSubjectForm } from "./AddSubjectForm";
import { SubjectActions } from "./SubjectActions";

export const metadata: Metadata = {
  title: `${uz.admin.subjects} — I-Imkon.uz`,
};

export default async function AdminSubjectsPage() {
  const supabase = await createClient();
  const { data: subjects } = await supabase.from("subjects").select("id, name").order("name");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.admin.subjects}</h1>
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
    </div>
  );
}
