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

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch (err) {
    console.error("[upload] arrayBuffer xatosi:", err);
    return NextResponse.json({ error: "Faylni o'qishda xatolik" }, { status: 500 });
  }

  let fileUrl: string;
  try {
    fileUrl = await uploadToR2(key, buffer, contentType);
  } catch (err) {
    console.error("[upload] R2 upload xatosi:", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID ? "set" : "MISSING",
      accessKey: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ? "set" : "MISSING",
      secretKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ? "set" : "MISSING",
      publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL ? "set" : "MISSING",
    });
    return NextResponse.json(
      { error: `R2 yuklash xatosi: ${err instanceof Error ? err.message : "noma'lum"}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ fileUrl, key });
}
