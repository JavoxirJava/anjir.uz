"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { uz } from "@/lib/strings/uz";
import { logoutAction } from "@/app/actions/auth";

const NAV_ITEMS = [
  { href: "/app", label: "Bosh sahifa", exact: true, icon: "🏠" },
  { href: "/app/subjects", label: "Fanlar", icon: "📖" },
  { href: "/app/lectures", label: "Ma'ruzalar", icon: "📄" },
  { href: "/app/tests", label: "Testlar", icon: "📝" },
  { href: "/app/games", label: "O'yinlar", icon: "🎮" },
  { href: "/app/assignments", label: "Topshiriqlar", icon: "✏️" },
  { href: "/app/books", label: "Kitoblar", icon: "📚" },
  { href: "/app/leaderboard", label: "Reyting", icon: "🏆" },
  { href: "/app/settings", label: "Sozlamalar", icon: "⚙️" },
];

export function StudentNav({ userName }: { userName: string; userId: string }) {
  const pathname = usePathname();

  return (
    <header className="glass border-b sticky top-0 z-40" role="banner">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/app"
            className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring flex-shrink-0"
          >
            <span className="text-xl" aria-hidden="true">🍑</span>
            <span className="font-black text-lg text-gradient hidden sm:block">Anjir.uz</span>
          </Link>

          <nav aria-label={uz.nav.mainMenu} className="flex-1 overflow-x-auto">
            <ul className="flex items-center gap-0.5 flex-nowrap px-1" role="list">
              {NAV_ITEMS.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <li key={item.href} className="flex-shrink-0">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all focus-visible:outline-2 whitespace-nowrap",
                        active
                          ? "gradient-primary text-white shadow-glow"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                      )}
                    >
                      <span className="text-base" aria-hidden="true">{item.icon}</span>
                      <span className="hidden md:inline">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/app/profile"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/70 hover:bg-muted transition-colors focus-visible:outline-2"
            >
              <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold" aria-hidden="true">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium max-w-[80px] truncate">{userName}</span>
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="rounded-xl px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors focus-visible:outline-2">
                {uz.nav.logout}
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
