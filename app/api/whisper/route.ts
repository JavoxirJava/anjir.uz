import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/api/auth";
import { uploadToR2, generateKey } from "@/lib/storage/r2";

/**
 * POST /api/whisper
 * Body: FormData { audioUrl: string, lectureId: string }
 *
 * Audio URL dan Whisper API orqali subtitr (VTT) generatsiya qiladi
 * va R2 ga saqlaydi.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { audioUrl, lectureId } = await req.json() as {
    audioUrl: string;
    lectureId: string;
  };

  if (!audioUrl || !lectureId) {
    return NextResponse.json({ error: "audioUrl va lectureId kerak" }, { status: 400 });
  }

  // Audio faylni olamiz
  const audioRes = await fetch(audioUrl);
  if (!audioRes.ok) {
    return NextResponse.json({ error: "Audio fayl yuklab bo'lmadi" }, { status: 400 });
  }
  const audioBuffer = Buffer.from(await audioRes.arrayBuffer());

  // Whisper API ga yuboramiz
  const formData = new FormData();
  const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
  formData.append("file", blob, "audio.mp3");
  formData.append("model", "whisper-1");
  formData.append("language", "uz");
  formData.append("response_format", "vtt");

  const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: formData,
  });

  if (!whisperRes.ok) {
    const err = await whisperRes.text();
    return NextResponse.json(
      { error: `Whisper xatoligi: ${err}` },
      { status: 500 }
    );
  }

  const vttContent = await whisperRes.text();

  // VTT faylni R2 ga saqlaymiz
  const key = generateKey("subtitles", `${lectureId}.vtt`);
  const vttUrl = await uploadToR2(
    key,
    Buffer.from(vttContent),
    "text/vtt"
  );

  // DB ga yozamiz
  await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/lectures/${lectureId}/subtitles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vtt_url: vttUrl, language: "uz", source: "ai" }),
  });

  return NextResponse.json({ vttUrl });
}
