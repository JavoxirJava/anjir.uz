"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/browser";
import { ChatWindow } from "../chat/ChatWindow";
import { ACCESS_TOKEN_COOKIE } from "@/lib/api/config";

function getCurrentUserId(): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|; )${ACCESS_TOKEN_COOKIE}=([^;]*)`));
  if (!m) return "";
  try {
    const payload = JSON.parse(atob(m[1].split(".")[1]));
    return payload.sub ?? "";
  } catch { return ""; }
}

interface Props {
  parentId: string;
  parentName: string;
  studentId: string;
  teacherId: string;
}

export function ParentChatButton({ parentId, parentName, studentId, teacherId }: Props) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function openChat() {
    if (roomId) { setOpen(true); return; }
    startTransition(async () => {
      try {
        const room = await apiFetch<{ id: string }>("/chat/rooms", {
          method: "POST",
          body: JSON.stringify({ teacher_id: teacherId, student_id: studentId, parent_id: parentId }),
        });
        setRoomId(room.id);
        setOpen(true);
      } catch {
        // Xona allaqachon bor — GET orqali topamiz
        const rooms = await apiFetch<{ id: string; parent_id: string }[]>("/chat/rooms");
        const existing = rooms.find((r) => r.parent_id === parentId);
        if (existing) { setRoomId(existing.id); setOpen(true); }
      }
    });
  }

  const currentUserId = getCurrentUserId();

  return (
    <>
      <Button size="sm" variant="outline" onClick={openChat} disabled={isPending}>
        {isPending ? "..." : "💬 Chat"}
      </Button>

      {open && roomId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="w-full max-w-md h-[500px] bg-background rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold">{parentName} bilan chat</span>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
            </div>
            <div className="flex-1 min-h-0">
              <ChatWindow
                roomId={roomId}
                currentUserId={currentUserId}
                partnerName={parentName}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
