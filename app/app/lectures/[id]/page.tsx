import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { getLectureById } from "@/lib/db/lectures";
import { PdfViewer } from "@/components/lectures/PdfViewer";
import { VideoPlayer } from "@/components/lectures/VideoPlayer";
import { AudioPlayer } from "@/components/lectures/AudioPlayer";
import { ReadAloudButton } from "@/components/lectures/ReadAloudButton";
import { Badge } from "@/components/ui/badge";
import { uz } from "@/lib/strings/uz";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const lecture = await getLectureById(id);
  return { title: lecture ? `${lecture.title} — I-Imkon.uz` : "Ma'ruza" };
}

export default async function LecturePage({ params }: Props) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const lecture = await getLectureById(id);
  if (!lecture) notFound();

  const subtitle = lecture.lecture_subtitles?.[0];

  return (
    <article className="max-w-4xl mx-auto space-y-6">
      {/* Sarlavha */}
      <header className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">
            {lecture.content_type.toUpperCase()}
          </Badge>
          {lecture.subjects && (
            <span className="text-sm text-muted-foreground">{lecture.subjects.name}</span>
          )}
          {lecture.classes && (
            <span className="text-sm text-muted-foreground">
              {lecture.classes.grade}-sinf {lecture.classes.letter}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold">{lecture.title}</h1>
        {lecture.description && (
          <p className="text-muted-foreground">{lecture.description}</p>
        )}
      </header>

      {/* Kontent */}
      <section aria-label="Ma'ruza kontenti">
        {lecture.content_type === "pdf" || lecture.content_type === "ppt" ? (
          <PdfViewer src={lecture.file_url ?? ""} title={lecture.title} />
        ) : lecture.content_type === "video" ? (
          <VideoPlayer
            src={lecture.file_url ?? ""}
            title={lecture.title}
            subtitleUrl={subtitle?.vtt_url}
          />
        ) : (
          <AudioPlayer src={lecture.file_url ?? ""} title={lecture.title} />
        )}
      </section>

      {/* Ovozli o'qish */}
      {lecture.description && (
        <section aria-label="Qo'shimcha amallar" className="flex items-center gap-3 flex-wrap">
          <ReadAloudButton
            text={`${lecture.title}. ${lecture.description}`}
          />
          <span className="text-xs text-muted-foreground">
            {uz.student.readAloud} — sarlavha va tavsifni o&apos;qib beradi
          </span>
        </section>
      )}

      {/* Video subtitr holati */}
      {lecture.content_type === "video" && !subtitle && (
        <div
          role="note"
          className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-400"
        >
          Ushbu video uchun subtitr qo&apos;shilmagan.
        </div>
      )}
    </article>
  );
}
