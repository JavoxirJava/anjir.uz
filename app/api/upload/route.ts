import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/api/auth";
import { generateKey, uploadToR2, validateFile, type AllowedContentType } from "@/lib/storage/r2";

// App Router route handler — body size Node.js darajasida chegaralanadi
export const dynamic = "force-dynamic";

/**
 * POST /api/upload
 * Body: multipart/form-data { file: File, folder?: string }
 * Returns: { fileUrl, key }
 *
 * Fayl server orqali to'g'ridan-to'g'ri R2 ga yuklanadi (CORS muammosi yo'q).
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string | null) ?? "lectures";

  if (!file) {
    return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
  }

  const contentType = file.type as AllowedContentType;
  const validation = validateFile(contentType, file.size);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const key = generateKey(folder, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileUrl = await uploadToR2(key, buffer, contentType);

  return NextResponse.json({ fileUrl, key });
}
