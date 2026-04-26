/**
 * Auth helpers — replaces Supabase Auth.
 * Server-side: reads JWT from cookie, decodes user info.
 */
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, API_URL } from "./config";
import type { UserRole, UserStatus } from "@/lib/supabase/types";

export interface CurrentUser {
  id: string;
  phone: string;
  first_name: string;
  last_name: string;
  role: UserRole | "parent";
  status: UserStatus;
  created_at: string;
}

/** Server-side: get current user via /auth/me */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<CurrentUser>;
  } catch {
    return null;
  }
}

/** Server action: set tokens in cookies after login */
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  // access token — non-httpOnly so browser can read it too
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    path: "/",
    sameSite: "lax",
    secure: isProd,
    maxAge: 15 * 60, // 15 min
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

/** Get just the access token (server-side) */
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}
