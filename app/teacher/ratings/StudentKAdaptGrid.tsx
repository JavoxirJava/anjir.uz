"use client";

import { useState } from "react";

export type KAdaptDiag = "struggling" | "at_risk" | "on_track" | "excelling";

export interface StudentKAdapt {
  id: string;
  name: string;
  k: number; // 0–100
  track: string;
  udlMode: string;
  diag: KAdaptDiag;
  alert: boolean;
}

const CFG: Record<KAdaptDiag, { label: string; dot: string; bg: string; border: string; text: string; emoji: string }> = {
  struggling: { label: "Qiyinchilik", dot: "#ef4444", bg: "#fef2f2", border: "#fecaca", text: "#b91c1c", emoji: "⚠" },
  at_risk:    { label: "Xavf zonasi", dot: "#f97316", bg: "#fff7ed", border: "#fed7aa", text: "#c2410c", emoji: "📉" },
  on_track:   { label: "Yaxshi",      dot: "#10b981", bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46", emoji: "✓" },
  excelling:  { label: "Ilg'or",      dot: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", emoji: "★" },
};

type Filter = "all" | KAdaptDiag;

interface Props {
  students: StudentKAdapt[];
  subjects: { id: string; name: string }[];
  selectedSubjectId: string;
  onSubjectChange: (id: string) => void;
}

export function StudentKAdaptGrid({ students, subjects, selectedSubjectId, onSubjectChange }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const filtered = filter === "all" ? students : students.filter((s) => s.diag === filter);
  const alerts = students.filter((s) => s.alert && !dismissedAlerts.has(s.id));

  const total = students.length;
  const struggling = students.filter((s) => s.diag === "struggling").length;
  const excelling = students.filter((s) => s.diag === "excelling").length;
  const avgK = total > 0 ? Math.round(students.reduce((sum, s) => sum + s.k, 0) / total) : 0;

  const selectedStudent = selected ? students.find((s) => s.id === selected) ?? null : null;

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all",       label: "Hammasi" },
    { key: "struggling",label: "⚠ Qiyinchilik" },
    { key: "at_risk",   label: "📉 Xavf" },
    { key: "on_track",  label: "✓ Yaxshi" },
    { key: "excelling", label: "★ Ilg'or" },
  ];

  return (
    <div className="space-y-4 text-[13px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-medium">O'qituvchi Paneli</div>
          <div className="text-xs text-muted-foreground mt-0.5">Adaptive LMS · O'quvchilar K-adapt</div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">Ulangan</span>
        </div>
      </div>

      {/* Subject selector */}
      {subjects.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => onSubjectChange(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                selectedSubjectId === s.id
                  ? "bg-violet-600 text-white border-violet-600"
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "O'quvchilar", value: total, color: "text-foreground" },
          { label: "Yordam kerak", value: struggling, color: "text-red-500" },
          { label: "Ilg'or", value: excelling, color: "text-blue-500" },
          { label: "O'rt. K-adapt", value: `${avgK}%`, color: "text-violet-600" },
        ].map((s) => (
          <div key={s.label} className="bg-muted/50 rounded-lg p-3 text-center">
            <div className={`text-xl font-medium ${s.color}`}>{s.value}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-1.5">
          {alerts.slice(0, 3).map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 text-xs">
              <span>⚠ <strong>{s.name}</strong> qiyinchilikka duch kelmoqda — K-adapt: {s.k}%</span>
              <button
                onClick={() => setDismissedAlerts((prev) => new Set([...prev, s.id]))}
                aria-label="Yopish"
                className="shrink-0 hover:opacity-60"
              >✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              filter === f.key
                ? "bg-violet-600 text-white border-violet-600"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm">O'quvchi topilmadi</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {filtered.map((s) => {
            const c = CFG[s.diag];
            return (
              <button
                key={s.id}
                onClick={() => setSelected(selected === s.id ? null : s.id)}
                aria-pressed={selected === s.id}
                aria-label={`${s.name} K-adapt ${s.k}% ${c.label}`}
                className="relative text-left rounded-xl p-3 border transition-all hover:-translate-y-0.5 focus:outline-2 focus:outline-violet-500 focus:outline-offset-1"
                style={{
                  background: c.bg,
                  borderColor: selected === s.id ? "#7c3aed" : c.border,
                  outline: selected === s.id ? "2px solid #7c3aed" : undefined,
                }}
              >
                {s.alert && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold" aria-hidden="true">!</div>
                )}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.dot }} aria-hidden="true" />
                  <span className="font-medium text-[12px] leading-tight line-clamp-1">{s.name}</span>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                  <span>K-adapt</span>
                  <span className="font-semibold" style={{ color: c.text }}>{s.k}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-black/10 overflow-hidden mb-1.5">
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.k}%`, background: c.dot }} />
                </div>
                <div className="text-[11px]" style={{ color: c.text }}>{c.emoji} {c.label}</div>
                {s.udlMode && <div className="text-[10px] text-muted-foreground mt-0.5">{s.udlMode}</div>}
              </button>
            );
          })}
        </div>
      )}

      {/* Detail panel */}
      {selectedStudent && (() => {
        const s = selectedStudent;
        const c = CFG[s.diag];
        return (
          <div className="border rounded-xl p-5 bg-card space-y-4">
            <div className="flex justify-between items-start">
              <div className="font-medium text-base">{s.name} — Batafsil</div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Yopish"
                className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 text-sm"
              >✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "K-adapt koeffitsienti", value: `${s.k}%`, valueColor: "#7c3aed" },
                { label: "Holat", value: `${c.emoji} ${c.label}`, valueColor: c.text },
                { label: "Yo'nalish", value: s.track || "—", valueColor: undefined },
                { label: "UDL rejim", value: s.udlMode || "—", valueColor: undefined },
              ].map((item) => (
                <div key={item.label} className="bg-muted/50 rounded-lg p-3">
                  <div className="text-[11px] text-muted-foreground mb-1">{item.label}</div>
                  <div className="font-medium text-sm" style={item.valueColor ? { color: item.valueColor } : undefined}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Legend */}
      <div className="bg-muted/50 rounded-lg px-3 py-2.5">
        <div className="text-[11px] font-medium mb-1.5">Ranglar izohi (K-adapt):</div>
        <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          <span><span className="text-red-500">●</span> Qiyinchilik (&lt;40%)</span>
          <span><span className="text-orange-500">●</span> Xavf (40–55%)</span>
          <span><span className="text-emerald-500">●</span> Yaxshi (55–78%)</span>
          <span><span className="text-blue-500">●</span> Ilg'or (&gt;78%)</span>
        </div>
      </div>
    </div>
  );
}
