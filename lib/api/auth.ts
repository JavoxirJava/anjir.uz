/**
 * Auth helpers.
 * Server-side: reads JWT from cookie, decodes user info.
 */
import { cache } from "react";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, API_URL } from "./config";
import type { UserRole, UserStatus } from "@/lib/types/domain";

export interface CurrentUser {
  id: string;
  phone: string;
  first_name: string;
  last_name: string;
  role: UserRole | "parent";
  status: UserStatus;
  created_at: string;
}

/**
 * Server-side: get current user via /auth/me.
 *
 * React `cache()` bir so'rov davomida natijani memoize qiladi — shuning uchun
 * bitta sahifa yuklanishida layout + page + generateMetadata uchun faqat BITTA
 * `/auth/me` chaqiruvi ketadi. `no-store` har bir so'rovda yangi ma'lumot beradi
 * (foydalanuvchilararo Data Cache aralashuvi bo'lmaydi, status darhol yangilanadi).
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json() as Promise<CurrentUser>;
  } catch {
    return null;
  }
});

/** Server action: set tokens in cookies after login */
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  // access token — non-httpOnly so browser can read it too
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    path: "/",
    sameSite: "lax",
    secure: isProd,
    maxAge: 8 * 60 * 60, // 8 soat
  });

  // refresh token — httpOnly
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

/** Server action: clear auth cookies */
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}
