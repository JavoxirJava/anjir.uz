import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/api/auth";
import { generateKey, getUploadUrl, validateFile, type AllowedContentType } from "@/lib/storage/r2";

export const dynamic = "force-dynamic";

/**
 * POST /api/upload/presign
 * Body: { fileName, contentType, folder?, fileSize }
 * Returns: { presignedUrl, fileUrl, key }
 *
 * Brauzer to'g'ridan-to'g'ri R2 ga PUT qiladi (Netlify size limiti chetlab o'tiladi).
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Body kerak" }, { status: 400 });
  }

  const { fileName, contentType, folder = "lectures", fileSize } = body as {
    fileName: string;
    contentType: string;
    folder?: string;
    fileSize: number;
  };

  if (!fileName || !contentType || !fileSize) {
    return NextResponse.json({ error: "fileName, contentType, fileSize kerak" }, { status: 400 });
  }

  const validation = validateFile(contentType, fileSize);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const key = generateKey(folder, fileName);
  const presignedUrl = await getUploadUrl(key, contentType as AllowedContentType);
  const fileUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;

  return NextResponse.json({ presignedUrl, fileUrl, key });
}
