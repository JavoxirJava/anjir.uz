import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent } from "@/components/ui/card";
import { AddClassForm } from "./AddClassForm";

export const metadata: Metadata = {
  title: `${uz.director.classes} — I-Imkon.uz`,
};

export default async function DirectorClassesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: school } = await supabase
    .from("schools")
    .select("id, name")
    .eq("director_id", user!.id)
    .single();

  const schoolId = (school as { id: string } | null)?.id;

  const { data: classes } = await supabase
    .from("classes")
    .select("id, grade, letter")
    .eq("school_id", schoolId ?? "")
    .order("grade");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.director.classes}</h1>
      {schoolId && <AddClassForm schoolId={schoolId} />}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="list">
        {(classes ?? []).map((cls: { id: string; grade: number; letter: string }) => (
          <Card key={cls.id} role="listitem">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold">{cls.grade}{cls.letter}</p>
              <p className="text-xs text-muted-foreground mt-1">{uz.school.className}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
