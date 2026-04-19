/**
 * Cloudflare Stream integratsiyasi — video yuklash va subtitr
 */

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID!;
const CF_STREAM_TOKEN = process.env.CLOUDFLARE_STREAM_TOKEN!;
const BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/stream`;

interface StreamUploadResponse {
  result: {
    uid: string;
    thumbnail: string;
    playback: { hls: string; dash: string };
    status: { state: string };
  };
  success: boolean;
  errors: { message: string }[];
}

/**
 * Cloudflare Stream ga video yuklash uchun TUS upload URL
 */
export async function createStreamUploadUrl(
  fileName: string,
  fileSizeBytes: number
): Promise<{ uploadUrl: string; uid: string }> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CF_STREAM_TOKEN}`,
      "Tus-Resumable": "1.0.0",
      "Upload-Length": String(fileSizeBytes),
      "Upload-Metadata": `name ${Buffer.from(fileName).toString("base64")}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Stream upload URL yaratishda xatolik: ${res.status}`);
  }

  const location = res.headers.get("location") ?? "";
  // UID URL da oxirgi qismda bo'ladi
  const uid = location.split("/").pop() ?? "";
  return { uploadUrl: location, uid };
}

/**
 * Stream video ma'lumotlarini olish
 */
export async function getStreamVideo(
  uid: string
): Promise<StreamUploadResponse["result"] | null> {
  const res = await fetch(`${BASE_URL}/${uid}`, {
    headers: { Authorization: `Bearer ${CF_STREAM_TOKEN}` },
  });
  if (!res.ok) return null;
  const data: StreamUploadResponse = await res.json();
  return data.result;
}

/**
 * Stream embed URL
 */
export function getStreamEmbedUrl(uid: string): string {
  return `https://iframe.videodelivery.net/${uid}`;
}

/**
 * Stream HLS URL
 */
export function getStreamHlsUrl(uid: string): string {
  return `https://videodelivery.net/${uid}/manifest/video.m3u8`;
}
