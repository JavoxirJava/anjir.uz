import { getCurrentUser } from "@/lib/api/auth";
import type { Metadata } from "next";
import Link from "next/link";
import { uz } from "@/lib/strings/uz";
import { getLecturesByTeacher } from "@/lib/db/lectures";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LectureDeleteButton } from "./LectureDeleteButton";

export const metadata: Metadata = {
  title: `${uz.teacher.myLectures} — I-Imkon.uz`,
};

const TYPE_LABELS: Record<string, string> = {
  pdf: "PDF",
  video: "Video",
  audio: "Audio",
  ppt: "PPT",
};

const TYPE_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pdf: "destructive",
  video: "default",
  audio: "secondary",
  ppt: "outline",
};

export default async function TeacherLecturesPage() {
  const user = await getCurrentUser();
  const lectures = await getLecturesByTeacher(user!.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">{uz.teacher.myLectures}</h1>
        <Link
          href="/teacher/lectures/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          + {uz.teacher.addLecture}
        </Link>
      </div>

      {lectures.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{uz.common.noData}</p>
          <Link
            href="/teacher/lectures/new"
            className="mt-4 inline-block text-sm text-primary underline underline-offset-4 hover:no-underline focus-visible:outline-2"
          >
            {uz.teacher.addLecture}
          </Link>
        </div>
      ) : (
        <ul className="space-y-3" role="list" aria-label={uz.teacher.myLectures}>
          {lectures.map((lecture) => (
            <li key={lecture.id}>
              <Card>
                <CardContent className="flex items-start justify-between gap-4 pt-4 pb-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={TYPE_COLORS[lecture.content_type]}>
                        {TYPE_LABELS[lecture.content_type]}
                      </Badge>
                      {lecture.subjects && (
                        <span className="text-xs text-muted-foreground">
                          {lecture.subjects.name}
                        </span>
                      )}
                      {lecture.classes && (
                        <span className="text-xs text-muted-foreground">
                          {lecture.classes.grade}-sinf {lecture.classes.letter}
                        </span>
                      )}
                    </div>
                    <h2 className="font-medium truncate">
                      <Link
                        href={`/app/lectures/${lecture.id}`}
                        className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        {lecture.title}
                      </Link>
                    </h2>
                    {lecture.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {lecture.description}
                      </p>
                    )}
                    {lecture.content_type === "video" && lecture.lecture_subtitles?.length === 0 && (
                      <p className="text-xs text-amber-600" role="alert">
                        ⚠ Subtitr qo&apos;shilmagan
                      </p>
                    )}
                  </div>
                  <LectureDeleteButton id={lecture.id} fileUrl={lecture.file_url ?? ""} />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
