"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ChatRole = "user" | "assistant";

type AssignmentPatch = {
  title?: string | null;
  description?: string | null;
  deadline?: string | null;
  difficulty_level?: "low" | "medium" | "high" | null;
  is_for_disabled?: boolean | null;
};

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  patch?: AssignmentPatch | null;
};

interface Props {
  subjectName?: string;
  selectedClassNames: string[];
  draft: {
    title: string;
    description: string;
    deadline: string;
    difficulty_level: "low" | "medium" | "high";
    is_for_disabled: boolean;
  };
  onApplyPatch: (patch: AssignmentPatch) => void;
}

function hasPatchData(patch: AssignmentPatch | null | undefined) {
  if (!patch) return false;
  return Object.values(patch).some((v) => v !== null && v !== undefined && v !== "");
}

export function AssignmentAIChat({ subjectName, selectedClassNames, draft, onApplyPatch }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-assistant",
      role: "assistant",
      content: "Salom. Men topshiriqni yaxshilashda yordam beraman. Maqsad, sinf darajasi yoki cheklovlarni yozing.",
      patch: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const apiMessages = useMemo(
    () => messages.map((m) => ({ role: m.role, content: m.content })),
    [messages]
  );

  async function sendMessage() {
    const text = input.trim();
    if (!text || isSending) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/ai/assignment-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...apiMessages, { role: "user", content: text }],
          context: {
            subjectName,
            selectedClassNames,
            draft,
          },
        }),
      });

      const data = await res.json().catch(() => ({})) as {
        reply?: string;
        patch?: AssignmentPatch | null;
        error?: string;
      };

      if (!res.ok) {
        toast.error(data.error ?? "AI chatda xatolik");
        setMessages(nextMessages);
        return;
      }

      const assistantMessage: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.reply ?? "Javob olinmadi",
        patch: data.patch ?? null,
      };
      setMessages([...nextMessages, assistantMessage]);
    } catch {
      toast.error("AI chatga ulanishda xatolik");
      setMessages(nextMessages);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">🤖 AI yordamchi (Gemini)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-72 overflow-y-auto rounded-md border p-3 space-y-2">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[90%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.content}
                {m.role === "assistant" && hasPatchData(m.patch) && (
                  <div className="mt-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => {
                        if (!m.patch) return;
                        onApplyPatch(m.patch);
                        toast.success("AI taklifi formaga qo'llandi");
                      }}
                    >
                      Formaga qo&apos;llash
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="text-xs text-muted-foreground">AI javob yozmoqda...</div>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Masalan: 6-sinf uchun algebra bo'yicha ijodiy topshiriq yozib ber"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage();
              }
            }}
          />
          <Button type="button" onClick={() => void sendMessage()} disabled={isSending || !input.trim()}>
            Yuborish
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

