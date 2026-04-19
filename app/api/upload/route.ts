import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateKey, getUploadUrl, validateFile, type AllowedContentType } from "@/lib/storage/r2";

/**
 * POST /api/upload
 * Body: { contentType, fileName, fileSize }
 * Returns: { uploadUrl, fileUrl, key }
 *
 * Brauzer presigned URL orqali to'g'ridan-to'g'ri R2 ga yuklaydi.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const { contentType, fileName, fileSize, folder = "lectures" } = await req.json() as {
    contentType: AllowedContentType;
    fileName: string;
    fileSize: number;
    folder?: string;
  };

  const validation = validateFile(contentType, fileSize);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const key = generateKey(folder, fileName);
  const uploadUrl = await getUploadUrl(key, contentType);
  const fileUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;

  return NextResponse.json({ uploadUrl, fileUrl, key });
}
