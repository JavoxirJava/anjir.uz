"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { API_URL, ACCESS_TOKEN_COOKIE } from "@/lib/api/config";
import { apiFetch } from "@/lib/api/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender_first: string;
  sender_last: string;
  sender_role: string;
  read_at: string | null;
}

function getToken(): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|; )${ACCESS_TOKEN_COOKIE}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : "";
}

interface Props {
  roomId: string;
  currentUserId: string;
  partnerName: string;
}

export function ChatWindow({ roomId, currentUserId, partnerName }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    apiFetch<Message[]>(`/chat/rooms/${roomId}/messages`)
      .then((msgs) => { setMessages(msgs); setTimeout(scrollBottom, 50); })
      .catch(() => {});

    const socket = io(API_URL, { auth: { token: getToken() }, transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join_room", roomId);
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("new_message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(scrollBottom, 50);
    });

    return () => { socket.disconnect(); };
  }, [roomId, scrollBottom]);

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content || !socketRef.current) return;
    socketRef.current.emit("send_message", { roomId, content });
    setText("");
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b flex items-center gap-2 bg-muted/30">
        <span className="font-semibold text-sm">{partnerName}</span>
        <span className={`ml-auto text-xs ${connected ? "text-green-600" : "text-muted-foreground"}`}>
          {connected ? "● Ulangan" : "○ Ulanmoqda..."}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">Xabarlar yo'q</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"
              }`}>
                {!isMe && (
                  <p className="text-xs font-semibold opacity-70 mb-0.5">
                    {msg.sender_first} {msg.sender_last}
                  </p>
                )}
                <p>{msg.content}</p>
                <p className={`text-[10px] mt-0.5 ${isMe ? "opacity-60 text-right" : "opacity-50"}`}>
                  {new Date(msg.created_at).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Xabar yozing..."
          className="flex-1 rounded-xl"
          disabled={!connected}
        />
        <Button type="submit" disabled={!connected || !text.trim()} className="rounded-xl px-4">
          Yuborish
        </Button>
      </form>
    </div>
  );
}
