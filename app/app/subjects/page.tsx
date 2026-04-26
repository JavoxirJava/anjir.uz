import { getCurrentUser } from "@/lib/api/auth";
import { apiGet } from "@/lib/api/server";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `${uz.student.subjects} — I-Imkon.uz`,
};

interface SubjectItem {
  id: string;
  name: string;
  lecture_count: number;
  test_count: number;
}

export default async function StudentSubjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const subjects = await apiGet<SubjectItem[]>("/students/me/subjects").catch(() => []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.student.subjects}</h1>

      {subjects.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{uz.common.noData}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4" role="list" aria-label={uz.student.subjects}>
          {subjects.map((s) => (
            <li key={s.id}>
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardContent className="pt-5 pb-5 flex flex-col gap-3">
                  <h2 className="font-semibold text-base">{s.name}</h2>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    {s.lecture_count > 0 && <p>📄 {s.lecture_count} ta ma&apos;ruza</p>}
                    {s.test_count > 0 && <p>📝 {s.test_count} ta test</p>}
                  </div>
                  <div className="flex flex-col gap-1.5 mt-auto">
                    <Link href={`/app/lectures?subject=${s.id}`} className="text-xs text-primary underline underline-offset-2 focus-visible:outline-2">
                      Ma&apos;ruzalar →
                    </Link>
                    <Link href={`/app/tests?subject=${s.id}`} className="text-xs text-primary underline underline-offset-2 focus-visible:outline-2">
                      Testlar →
                    </Link>
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
