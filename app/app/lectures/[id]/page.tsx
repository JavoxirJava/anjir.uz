import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { getLectureById } from "@/lib/db/lectures";
import { PdfViewer } from "@/components/lectures/PdfViewer";
import { VideoPlayer } from "@/components/lectures/VideoPlayer";
import { AudioPlayer } from "@/components/lectures/AudioPlayer";
import { ReadAloudButton } from "@/components/lectures/ReadAloudButton";
import { VttReadAloudButton } from "@/components/lectures/VttReadAloudButton";
import { VttSubtitlePreview } from "@/components/lectures/VttSubtitlePreview";
import { PdfReadAloudButton } from "@/components/lectures/PdfReadAloudButton";
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

  // Foydalanuvchi va ma'ruza bir-biriga bog'liq emas — parallel olamiz.
  const [user, lecture] = await Promise.all([getCurrentUser(), getLectureById(id)]);
  if (!user) redirect("/login");
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
          {lecture.fans && (
            <span className="text-sm text-muted-foreground">Fan: {lecture.fans.name}</span>
          )}
          {lecture.topics && (
            <span className="text-sm text-muted-foreground">Mavzu: {lecture.topics.name}</span>
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

      {/* PDF/PPT uchun matn o'qish */}
      {(lecture.content_type === "pdf" || lecture.content_type === "ppt") && lecture.file_url && (
        <section aria-label="Qo'shimcha amallar" className="flex items-center gap-3 flex-wrap">
          <PdfReadAloudButton pdfUrl={lecture.file_url} />
          <span className="text-xs text-muted-foreground">
            PDF ichidagi matnni ovozli o&apos;qib beradi
          </span>
        </section>
      )}

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

      {/* Ovozli o'qish (sarlavha + tavsif) */}
      {lecture.description && lecture.content_type !== "pdf" && lecture.content_type !== "ppt" && (
        <section aria-label="Qo'shimcha amallar" className="flex items-center gap-3 flex-wrap">
          <ReadAloudButton text={`${lecture.title}. ${lecture.description}`} />
          <span className="text-xs text-muted-foreground">
            {uz.student.readAloud} — sarlavha va tavsifni o&apos;qib beradi
          </span>
        </section>
      )}

      {lecture.content_type === "video" && subtitle && (
        <section aria-label="Subtitr amallari" className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <VttReadAloudButton vttUrl={subtitle.vtt_url} />
            <a
              href={subtitle.vtt_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary underline"
            >
              VTT faylni ochish
            </a>
          </div>
          <VttSubtitlePreview vttUrl={subtitle.vtt_url} />
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
