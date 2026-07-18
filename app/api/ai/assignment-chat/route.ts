import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/api/auth";

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1),
  })).min(1),
  context: z.object({
    subjectName: z.string().optional(),
    selectedClassNames: z.array(z.string()).optional(),
    draft: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      deadline: z.string().optional(),
      is_for_disabled: z.boolean().optional(),
    }).optional(),
  }).optional(),
});

type AssignmentPatch = {
  title?: string | null;
  description?: string | null;
  deadline?: string | null;
  is_for_disabled?: boolean | null;
};

function getGeminiApiKey(): string | null {
  return process.env.GEMINI_API_KEY
    ?? process.env.GOOGLE_GEMINI_API_KEY
    ?? process.env.GOOGLE_API_KEY
    ?? null;
}

function extractJson(text: string): string {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  return text.trim();
}

function normalizePatch(value: unknown): AssignmentPatch | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const out: AssignmentPatch = {};

  if ("title" in v) out.title = typeof v.title === "string" ? v.title : null;
  if ("description" in v) out.description = typeof v.description === "string" ? v.description : null;
  if ("deadline" in v) out.deadline = typeof v.deadline === "string" ? v.deadline : null;
  if ("is_for_disabled" in v) out.is_for_disabled = typeof v.is_for_disabled === "boolean" ? v.is_for_disabled : null;

  return Object.keys(out).length > 0 ? out : null;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  if (user.role !== "teacher" && user.role !== "super_admin") {
    return NextResponse.json({ error: "Faqat o'qituvchi uchun" }, { status: 403 });
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API kaliti topilmadi (GEMINI_API_KEY yoki GOOGLE_GEMINI_API_KEY)." },
      { status: 500 }
    );
  }

  const parsed = requestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Noto'g'ri so'rov" }, { status: 400 });
  }

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const context = parsed.data.context;
  const contextText = [
    context?.subjectName ? `Mavzu: ${context.subjectName}` : null,
    context?.selectedClassNames?.length ? `Sinflar: ${context.selectedClassNames.join(", ")}` : null,
    context?.draft?.title ? `Joriy sarlavha: ${context.draft.title}` : null,
    context?.draft?.description ? `Joriy tavsif: ${context.draft.description}` : null,
    context?.draft?.deadline ? `Joriy deadline: ${context.draft.deadline}` : null,
    typeof context?.draft?.is_for_disabled === "boolean"
      ? `Imkoniyati cheklanganlar uchun: ${context.draft.is_for_disabled ? "ha" : "yo'q"}`
      : null,
  ].filter(Boolean).join("\n");

  const systemInstruction = [
    "Siz o'qituvchiga topshiriq yaratishda yordam beradigan AI assistentsiz.",
    "Qisqa, aniq va amaliy javob bering. Uzbek tilida yozing.",
    "Agar foydali bo'lsa, topshiriq uchun yaxshilangan variant taklif qiling.",
    "HAR DOIM faqat JSON qaytaring, boshqa matn yo'q.",
    "JSON formati:",
    "{",
    '  "message": "o\'qituvchiga javob",',
    '  "patch": {',
    '    "title": "string yoki null",',
    '    "description": "string yoki null",',
    '    "deadline": "YYYY-MM-DD yoki null",',
    '    "is_for_disabled": true|false|null',
    "  }",
    "}",
    "Agar maydonni o'zgartirish shart bo'lmasa null qaytaring.",
    contextText ? `Kontekst:\n${contextText}` : "",
  ].filter(Boolean).join("\n");

  const contents = parsed.data.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1200,
        },
      }),
    }
  );

  if (!geminiRes.ok) {
    const errText = await geminiRes.text().catch(() => "");
    return NextResponse.json({ error: `Gemini xatosi: ${errText || geminiRes.status}` }, { status: 500 });
  }

  const geminiData = await geminiRes.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const rawText = geminiData.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
  if (!rawText) {
    return NextResponse.json({ error: "Gemini bo'sh javob qaytardi" }, { status: 500 });
  }

  try {
    const parsedJson = JSON.parse(extractJson(rawText)) as { message?: string; patch?: unknown };
    const reply = typeof parsedJson.message === "string" && parsedJson.message.trim()
      ? parsedJson.message.trim()
      : rawText;
    const patch = normalizePatch(parsedJson.patch);
    return NextResponse.json({ reply, patch });
  } catch {
    return NextResponse.json({ reply: rawText, patch: null });
  }
}
