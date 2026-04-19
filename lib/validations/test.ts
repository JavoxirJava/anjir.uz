import { z } from "zod";

export const questionOptionSchema = z.object({
  id: z.string().optional(),
  option_text: z.string().min(1, "Variant matni kiritilishi shart"),
  is_correct: z.boolean(),
});

export const questionSchema = z.object({
  id: z.string().optional(),
  question_text: z.string().min(1, "Savol matni kiritilishi shart"),
  question_type: z.enum(["single", "multiple", "true_false", "fill_blank"]),
  image_url: z.string().optional(),
  image_alt: z.string().optional(),
  points: z.number().int().min(1).default(1),
  order: z.number().int().min(0).default(0),
  options: z.array(questionOptionSchema).optional(),
});

export const testSchema = z.object({
  title: z.string().min(1, "Test nomi kiritilishi shart").max(200),
  description: z.string().max(500).optional(),
  subjectId: z.string().min(1, "Fan tanlanishi shart"),
  classIds: z.array(z.string()).min(1, "Kamida bitta sinf tanlanishi shart"),
  testType: z.enum(["entry", "post_topic", "home_study"]),
  timeLimit: z.number().int().min(1).nullable().optional(),
  maxAttempts: z.number().int().min(1).nullable().optional(),
  questions: z.array(questionSchema).min(1, "Kamida bitta savol qo'shilishi shart"),
});

export type TestInput = z.infer<typeof testSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type OptionInput = z.infer<typeof questionOptionSchema>;
