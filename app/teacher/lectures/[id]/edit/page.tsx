import { getCurrentUser } from "@/lib/api/auth";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLectureById } from "@/lib/db/lectures";
import { getTeacherSubjectsAndClasses } from "@/lib/db/teacher-assignments";
import { EditLectureForm } from "./EditLectureForm";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ma'ruzani tahrirlash — I-Imkon.uz",
};

export default async function EditLecturePage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const lecture = await getLectureById(id);
  if (!lecture) notFound();
  if (lecture.creator_id !== user.id) redirect("/teacher/lectures");

  const { subjects, classes } = await getTeacherSubjectsAndClasses(user.id);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Ma&apos;ruzani tahrirlash</h1>
      <EditLectureForm
        lectureId={id}
        subjects={subjects}
        classes={classes}
        initial={{
          title: lecture.title,
          description: lecture.description ?? "",
          subjectId: lecture.subjects?.id ?? "",
          classId: lecture.classes?.id ?? "",
          contentType: lecture.content_type as "pdf" | "video" | "audio" | "ppt",
          fileUrl: lecture.file_url ?? "",
          subtitleVttUrl: lecture.lecture_subtitles?.[0]?.vtt_url ?? "",
          subtitleSource: (lecture.lecture_subtitles?.[0]?.source as "manual" | "ai" | undefined) ?? "",
        }}
      />
    </div>
  );
}
