import { type NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/api/config";

// Protected route prefixes → required roles
const PROTECTED: Record<string, string[]> = {
  "/app":      ["student"],
  "/teacher":  ["teacher"],
  "/director": ["director"],
  "/admin":    ["super_admin"],
  "/parent":   ["parent"],
};

const DASHBOARD_BY_ROLE: Record<string, string> = {
  student:     "/app",
  teacher:     "/teacher",
  director:    "/director",
  super_admin: "/admin",
  parent:      "/parent",
};

interface JwtClaims {
  sub?: string;
  role?: string;
  exp?: number;
}

/**
 * JWT payload'ini imzosini tekshirmasdan lokal o'qiymiz (faqat marshrutlash uchun).
 * Haqiqiy autentifikatsiya backend'da har API so'rovida amalga oshadi, status esa
 * layout'larda `getCurrentUser()` orqali tekshiriladi. Bu middleware'da har
 * navigatsiyada `/auth/me` tarmoq so'rovini yuborishdan qutqaradi.
 */
function decodeJwt(token: string): JwtClaims | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — pass through
  const publicPaths = ["/login", "/register", "/onboarding", "/pending"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Find which protected prefix matches
  const matchedPrefix = Object.keys(PROTECTED).find((prefix) =>
    pathname.startsWith(prefix)
  );
  if (!matchedPrefix) return NextResponse.next();

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const claims = decodeJwt(token);
  // Token o'qib bo'lmasa yoki muddati o'tgan bo'lsa — login'ga.
  if (!claims?.role || (claims.exp && claims.exp * 1000 < Date.now())) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Rol bo'limga mos kelmasa — o'z dashboard'iga yo'naltiramiz.
  // (Status tekshiruvi — pending/rejected → /pending — layout'larda bajariladi.)
  const allowedRoles = PROTECTED[matchedPrefix];
  if (!allowedRoles.includes(claims.role)) {
    const target = DASHBOARD_BY_ROLE[claims.role] ?? "/login";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
