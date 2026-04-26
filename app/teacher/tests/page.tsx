import { getCurrentUser } from "@/lib/api/auth";
import type { Metadata } from "next";
import Link from "next/link";
import { getTestsByTeacher } from "@/lib/db/tests";
import { uz } from "@/lib/strings/uz";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TestDeleteButton } from "./TestDeleteButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${uz.teacher.myTests} — I-Imkon.uz`,
};

const TYPE_LABELS: Record<string, string> = {
  entry: uz.tests.entryTest,
  post_topic: uz.tests.postTopic,
  home_study: uz.tests.homeStudy,
};

export default async function TeacherTestsPage() {
  const user = await getCurrentUser();
  const tests = await getTestsByTeacher(user!.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">{uz.teacher.myTests}</h1>
        <Link
          href="/teacher/tests/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          + {uz.teacher.addTest}
        </Link>
      </div>

      {tests.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{uz.common.noData}</p>
          <Link href="/teacher/tests/new" className="mt-4 inline-block text-sm text-primary underline">
            {uz.teacher.addTest}
          </Link>
        </div>
      ) : (
        <ul className="space-y-3" role="list" aria-label={uz.teacher.myTests}>
          {tests.map((test) => (
            <li key={test.id}>
              <Card>
                <CardContent className="flex items-center justify-between gap-4 pt-4 pb-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{TYPE_LABELS[test.test_type]}</Badge>
                      {test.subjects && (
                        <span className="text-xs text-muted-foreground">{test.subjects.name}</span>
                      )}
                      {test.time_limit && (
                        <span className="text-xs text-muted-foreground">⏱ {test.time_limit} daq</span>
                      )}
                    </div>
                    <h2 className="font-medium">{test.title}</h2>
                    {test.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{test.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/teacher/tests/${test.id}/edit`}
                      className="rounded-md px-3 py-1.5 text-sm border hover:bg-muted focus-visible:outline-2"
                    >
                      {uz.common.edit}
                    </Link>
                    <TestDeleteButton id={test.id} />
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
