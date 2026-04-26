import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/api/auth";
import { apiGet } from "@/lib/api/server";
import { RatingsClient } from "./RatingsClient";

export const metadata: Metadata = {
  title: "Reyting paneli — I-Imkon.uz",
};

interface StudentData {
  id: string;
  first_name: string;
  last_name: string;
  k_adapt: number;
  attempt_count: number;
  contrast_mode: string | null;
  color_blind_mode: string | null;
}

export default async function TeacherRatingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [subjects, students] = await Promise.all([
    apiGet<{ id: string; name: string }[]>(`/teachers/${user.id}/subjects`).catch(() => []),
    apiGet<StudentData[]>(`/teachers/${user.id}/students`).catch(() => []),
  ]);

  if (subjects.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Reyting paneli</h1>
        <p className="text-muted-foreground">Hali sinf biriktirilmagan.</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Reyting paneli</h1>
        <p className="text-muted-foreground">Hali tasdiqlangan o'quvchi yo'q.</p>
      </div>
    );
  }

  const mappedStudents = students.map((s) => {
    const udlMode = [
      s.contrast_mode && s.contrast_mode !== "normal" ? s.contrast_mode : null,
      s.color_blind_mode && s.color_blind_mode !== "normal" ? s.color_blind_mode : null,
    ].filter(Boolean).join(", ") || "standard";

    return {
      id: s.id,
      name: `${s.first_name} ${s.last_name}`,
      scores: { [subjects[0]?.id ?? ""]: [s.k_adapt] },
      udlMode,
      track: "standard",
    };
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reyting paneli</h1>
      <RatingsClient subjects={subjects} students={mappedStudents} />
    </div>
  );
}
