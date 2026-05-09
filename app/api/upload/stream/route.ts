import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/api/auth";
import { createDirectUploadUrl, getStreamEmbedUrl } from "@/lib/storage/stream";

export const dynamic = "force-dynamic";

/**
 * POST /api/upload/stream
 * Returns: { uploadURL, uid, fileUrl }
 *
 * Brauzer to'g'ridan-to'g'ri Stream ga POST qiladi (Netlify limit yo'q).
 * fileUrl = embed URL, lectures.file_url sifatida saqlanadi.
 */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  try {
    const { uploadURL, uid } = await createDirectUploadUrl();
    const fileUrl = getStreamEmbedUrl(uid);
    return NextResponse.json({ uploadURL, uid, fileUrl });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Stream URL yaratishda xatolik" },
      { status: 500 }
    );
  }
}
