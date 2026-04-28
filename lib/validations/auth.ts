import { z } from "zod";
import { uz } from "@/lib/strings/uz";

const phoneRegex = /^\+998[0-9]{9}$/;

export const loginSchema = z.object({
  phone: z
    .string()
    .min(1, uz.auth.phoneRequired)
    .regex(phoneRegex, uz.auth.phoneInvalid),
  password: z
    .string()
    .min(1, uz.auth.passwordRequired)
    .min(8, uz.auth.passwordMinLength),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, uz.auth.firstNameRequired).max(50),
  lastName: z.string().min(1, uz.auth.lastNameRequired).max(50),
  phone: z.string().min(1, uz.auth.phoneRequired).regex(phoneRegex, uz.auth.phoneInvalid),
  password: z.string().min(1, uz.auth.passwordRequired).min(8, uz.auth.passwordMinLength),
  role: z.enum(["student", "teacher", "parent"]).default("student"),
  // student fields
  schoolId: z.string().optional().default(""),
  classId: z.string().optional().default(""),
  // teacher fields — comma-separated classIds per school
  teacherSchoolId: z.string().optional().default(""),
  teacherClassIds: z.array(z.string()).optional().default([]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
