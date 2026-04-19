"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { uz } from "@/lib/strings/uz";
import { logoutAction } from "@/app/actions/auth";

const NAV_ITEMS = [
  { href: "/director", label: "Bosh sahifa", exact: true },
  { href: "/director/teachers", label: "O'qituvchilar" },
  { href: "/director/classes", label: "Sinflar" },
  { href: "/director/students", label: "O'quvchilar" },
  { href: "/director/subjects", label: "Fanlar" },
  { href: "/director/lectures", label: "Ma'ruzalar" },
  { href: "/director/analytics", label: "Analitika" },
];

export function DirectorNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  return (
    <header className="glass border-b sticky top-0 z-40" role="banner">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/director" className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label="Anjir.uz bosh sahifaga o'tish">
            <span className="text-xl" aria-hidden="true">🍑</span>
            <span className="font-black text-lg text-gradient">Anjir.uz</span>
          </Link>
          <nav aria-label={uz.nav.mainMenu} className="overflow-x-auto">
            <ul className="flex items-center gap-0.5 flex-nowrap" role="list">
              {NAV_ITEMS.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <li key={item.href} className="flex-shrink-0">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "rounded-xl px-3 py-2 text-sm font-medium transition-all focus-visible:outline-2 whitespace-nowrap",
                        active
                          ? "gradient-primary text-white shadow-glow"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/70 text-sm font-medium">
              <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold" aria-hidden="true">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[80px] truncate">{userName}</span>
            </span>
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
