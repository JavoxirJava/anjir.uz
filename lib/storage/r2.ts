import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL!;

export type AllowedContentType =
  | "application/pdf"
  | "video/mp4"
  | "video/webm"
  | "audio/mpeg"
  | "audio/mp4"
  | "audio/ogg"
  | "audio/wav"
  | "application/vnd.ms-powerpoint"
  | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "text/vtt";

const MAX_SIZES: Record<string, number> = {
  "application/pdf": 5 * 1024 * 1024,      // 5 MB
  "video/mp4": 100 * 1024 * 1024,           // 100 MB
  "video/webm": 100 * 1024 * 1024,
  "audio/mpeg": 20 * 1024 * 1024,          // 20 MB
  "audio/mp4": 20 * 1024 * 1024,
  "audio/ogg": 20 * 1024 * 1024,
  "audio/wav": 20 * 1024 * 1024,
  "application/vnd.ms-powerpoint": 10 * 1024 * 1024,
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": 10 * 1024 * 1024,
  "image/jpeg": 5 * 1024 * 1024,
  "image/png": 5 * 1024 * 1024,
  "image/webp": 5 * 1024 * 1024,
  "text/vtt": 1 * 1024 * 1024,
};

export function validateFile(
  contentType: string,
  sizeBytes: number
): { ok: true } | { ok: false; error: string } {
  const maxSize = MAX_SIZES[contentType];
  if (!maxSize) {
    return { ok: false, error: `${contentType} turi qo'llab-quvvatlanmaydi` };
  }
  if (sizeBytes > maxSize) {
    const mb = Math.round(maxSize / 1024 / 1024);
    return { ok: false, error: `Fayl hajmi ${mb} MB dan oshmasligi kerak` };
  }
  return { ok: true };
}

/**
 * Brauzerdan to'g'ridan-to'g'ri R2 ga yuklash uchun presigned URL
 */
export async function getUploadUrl(
  key: string,
  contentType: AllowedContentType,
  expiresIn = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2, command, { expiresIn });
}

/**
 * Server tomonidan to'g'ridan-to'g'ri R2 ga yuklash
 */
export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return `${PUBLIC_URL}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

/**
 * Fayl URL dan key ni ajratib olish
 */
export function keyFromUrl(url: string): string {
  return url.replace(`${PUBLIC_URL}/`, "");
}

/**
 * Unikal fayl nomini yaratish
 */
export function generateKey(folder: string, originalName: string): string {
  const ext = originalName.split(".").pop() ?? "";
  const uid = crypto.randomUUID();
  return `${folder}/${uid}.${ext}`;
}
