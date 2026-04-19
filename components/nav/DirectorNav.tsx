"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { uz } from "@/lib/strings/uz";
import { logoutAction } from "@/app/actions/auth";

const NAV_ITEMS = [
  { href: "/director", label: uz.director.dashboard, exact: true },
  { href: "/director/teachers", label: uz.director.teachers },
  { href: "/director/classes", label: uz.director.classes },
  { href: "/director/students", label: uz.director.students },
  { href: "/director/subjects", label: uz.director.subjects },
  { href: "/director/analytics", label: uz.director.analytics },
];

export function DirectorNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  return (
    <header className="border-b bg-background sticky top-0 z-40" role="banner">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          <Link
            href="/director"
            className="font-bold text-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label="Anjir.uz bosh sahifaga o'tish"
          >
            Anjir.uz
          </Link>
          <nav aria-label={uz.nav.mainMenu}>
            <ul className="flex items-center gap-1 flex-wrap" role="list">
              {NAV_ITEMS.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{userName}</span>
            <form action={logoutAction}>
              <button type="submit" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted focus-visible:outline-2">
                {uz.nav.logout}
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
