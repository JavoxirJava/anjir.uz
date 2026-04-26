"use client";

import { useState } from "react";
import { StudentKAdaptGrid, type StudentKAdapt, type KAdaptDiag } from "./StudentKAdaptGrid";

interface RawStudent {
  id: string;
  name: string;
  scores: Record<string, number[]>; // subjectId -> scores[]
  udlMode: string;
  track: string;
}

interface Props {
  subjects: { id: string; name: string }[];
  students: RawStudent[];
}

function getDiag(k: number): KAdaptDiag {
  if (k < 40) return "struggling";
  if (k < 55) return "at_risk";
  if (k < 78) return "on_track";
  return "excelling";
}

export function RatingsClient({ subjects, students }: Props) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");

  const mapped: StudentKAdapt[] = students.map((s) => {
    const subjectScores = s.scores[subjectId] ?? [];
    const k = subjectScores.length > 0
      ? Math.round(subjectScores.reduce((a, b) => a + b, 0) / subjectScores.length)
      : 0;
    const diag = getDiag(k);
    return { id: s.id, name: s.name, k, track: s.track, udlMode: s.udlMode, diag, alert: k < 40 };
  });

  return (
    <StudentKAdaptGrid
      students={mapped}
      subjects={subjects}
      selectedSubjectId={subjectId}
      onSubjectChange={setSubjectId}
    />
  );
}
