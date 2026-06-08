import { z } from "zod";

export const lectureSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  schoolId: z.string().optional(),
  subjectId: z.string().min(1, "Fan tanlanishi shart"),
  classId: z.string().optional(),
  contentType: z.enum(["pdf", "video", "audio", "ppt", "link"], {
    error: "Kontent turi tanlanishi shart",
  }),
  fileUrl: z.string().min(1, "Fayl/Havola kiritilishi shart"),
  subtitleVttUrl: z.string().optional(),
  subtitleSource: z.enum(["manual", "ai"]).optional(),
}).superRefine((data, ctx) => {
  if (data.contentType !== "link" && !data.title?.trim()) {
    ctx.addIssue({ code: "custom", message: "Sarlavha kiritilishi shart", path: ["title"] });
  }
  if (data.contentType === "link" && !data.classId) {
    ctx.addIssue({ code: "custom", message: "Sinf tanlanishi shart", path: ["classId"] });
  }
});

export type LectureInput = z.infer<typeof lectureSchema>;
