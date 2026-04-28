"use client";

import { useState, useTransition } from "react";
import { apiFetch } from "@/lib/api/browser";
import { ACCESS_TOKEN_COOKIE } from "@/lib/api/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatWindow } from "@/components/chat/ChatWindow";

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  subject_name: string;
}

interface Room { id: string }

interface Props {
  child: {
    id: string;
    first_name: string;
    last_name: string;
    grade: number | null;
    letter: string | null;
    school_name: string | null;
    approved_at: string | null;
  };
  parentId: string;
}

function getCurrentUserId(): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|; )${ACCESS_TOKEN_COOKIE}=([^;]*)`));
  if (!m) return "";
  try {
    const payload = JSON.parse(atob(m[1].split(".")[1]));
    return payload.sub ?? "";
  } catch { return ""; }
}

export function ChildCard({ child, parentId }: Props) {
  const [teachers, setTeachers] = useState<Teacher[] | null>(null);
  const [loadingTeachers, startLoadTeachers] = useTransition();
  const [activeRoom, setActiveRoom] = useState<{ id: string; teacherName: string } | null>(null);
  const [openingChat, startOpenChat] = useTransition();

  function loadTeachers() {
    if (teachers) { setTeachers(null); return; }
    startLoadTeachers(async () => {
      const data = await apiFetch<Teacher[]>(`/parents/children/${child.id}/teachers`).catch(() => []);
      setTeachers(data);
    });
  }

  function openChat(teacher: Teacher) {
    startOpenChat(async () => {
      try {
        const room = await apiFetch<Room>("/chat/rooms", {
          method: "POST",
          body: JSON.stringify({
            teacher_id: teacher.id,
            student_id: child.id,
            parent_id:  parentId,
          }),
        });
        setActiveRoom({ id: room.id, teacherName: `${teacher.first_name} ${teacher.last_name}` });
      } catch {
        const rooms = await apiFetch<(Room & { teacher_id: string })[]>("/chat/rooms").catch(() => []);
        const ex = rooms.find((r) => r.teacher_id === teacher.id);
        if (ex) setActiveRoom({ id: ex.id, teacherName: `${teacher.first_name} ${teacher.last_name}` });
      }
    });
  }

  const currentUserId = getCurrentUserId();

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span>{child.first_name} {child.last_name}</span>
            {child.approved_at && (
              <Button size="sm" variant="outline" onClick={loadTeachers} disabled={loadingTeachers}>
                {loadingTeachers ? "..." : teachers ? "Yopish" : "💬 O'qituvchilar"}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {child.school_name && (
            <p>🏫 {child.school_name}{child.grade ? ` — ${child.grade}-sinf ${child.letter}` : ""}</p>
          )}
          <p>
            {child.approved_at
              ? <span className="text-green-600 font-medium">✓ Tasdiqlangan</span>
              : <span className="text-yellow-600 font-medium">⏳ Tasdiqlanmagan</span>}
          </p>

          {teachers !== null && (
            <div className="mt-2 space-y-1.5 border-t pt-2">
              {teachers.length === 0 ? (
                <p className="text-xs">O'qituvchilar topilmadi</p>
              ) : (
                teachers.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-2">
                    <span className="text-xs">
                      {t.first_name} {t.last_name}
                      <span className="text-muted-foreground/60 ml-1">({t.subject_name})</span>
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 text-xs"
                      onClick={() => openChat(t)}
                      disabled={openingChat}
                    >
                      💬 Chat
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {activeRoom && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setActiveRoom(null); }}
        >
          <div className="w-full max-w-md h-[500px] bg-background rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-sm">{activeRoom.teacherName} bilan chat</span>
              <button onClick={() => setActiveRoom(null)} className="text-muted-foreground hover:text-foreground text-xl">×</button>
            </div>
            <div className="flex-1 min-h-0">
              <ChatWindow
                roomId={activeRoom.id}
                currentUserId={currentUserId}
                partnerName={activeRoom.teacherName}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
