import { type NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, API_URL } from "@/lib/api/config";

// Protected route prefixes → required roles
const PROTECTED: Record<string, string[]> = {
  "/app":      ["student"],
  "/teacher":  ["teacher"],
  "/director": ["director"],
  "/admin":    ["super_admin"],
  "/parent":   ["parent"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

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

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify token via /auth/me
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const user = await res.json() as { role: string; status: string };

    if (user.status === "pending" || user.status === "rejected") {
      if (!pathname.startsWith("/pending")) {
        return NextResponse.redirect(new URL("/pending", request.url));
      }
      return NextResponse.next();
    }

    const allowedRoles = PROTECTED[matchedPrefix];
    if (!allowedRoles.includes(user.role)) {
      // Redirect to their correct dashboard
      const dashboardMap: Record<string, string> = {
        student:     "/app",
        teacher:     "/teacher",
        director:    "/director",
        super_admin: "/admin",
        parent:      "/parent",
      };
      const target = dashboardMap[user.role] ?? "/login";
      return NextResponse.redirect(new URL(target, request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
