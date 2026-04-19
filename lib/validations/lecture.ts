import { z } from "zod";

export const lectureSchema = z.object({
  title: z.string().min(1, "Sarlavha kiritilishi shart").max(200),
  description: z.string().max(1000).optional(),
  subjectId: z.string().min(1, "Fan tanlanishi shart"),
  classId: z.string().optional(),
  contentType: z.enum(["pdf", "video", "audio", "ppt"], {
    error: "Kontent turi tanlanishi shart",
  }),
  // Fayl URL server tomonidan qo'yiladi, validatsiya keyinroq
  fileUrl: z.string().min(1, "Fayl yuklanishi shart"),
  // Video uchun subtitr
  subtitleVttUrl: z.string().optional(),
  subtitleSource: z.enum(["manual", "ai"]).optional(),
});

export type LectureInput = z.infer<typeof lectureSchema>;
