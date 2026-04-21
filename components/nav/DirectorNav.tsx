"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { uz } from "@/lib/strings/uz";
import { logoutAction } from "@/app/actions/auth";
import { MobileMenu } from "./MobileMenu";
import { IImkonLogo } from "@/components/IImkonLogo";

const NAV_ITEMS = [
  { href: "/director",           label: "Asosiy",        exact: true, icon: "🏠" },
  { href: "/director/teachers",  label: "O'qituvchilar",              icon: "👨‍🏫" },
  { href: "/director/classes",   label: "Sinflar",                    icon: "🏫" },
  { href: "/director/students",  label: "O'quvchilar",                icon: "👨‍🎓" },
  { href: "/director/subjects",  label: "Fanlar",                     icon: "📖" },
  { href: "/director/lectures",  label: "Ma'ruzalar",                 icon: "📄" },
  { href: "/director/analytics", label: "Analitika",                  icon: "📊" },
];

export function DirectorNav({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <header className="glass border-b sticky top-0 z-40" role="banner">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center gap-3">

          {/* Logo */}
          <Link href="/director" className="flex items-center gap-1.5 flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" aria-label="I-Imkon.uz">
            <IImkonLogo size={28} />
            <span className="font-black text-base text-gradient">I-Imkon.uz</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex flex-1 min-w-0 relative">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent z-10" aria-hidden="true" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10" aria-hidden="true" />
            <nav aria-label={uz.nav.mainMenu} className="overflow-x-auto no-scrollbar flex-1">
              <ul className="flex items-center gap-0.5 flex-nowrap py-1.5 px-1" role="list">
                {NAV_ITEMS.map((item) => {
                  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                  return (
                    <li key={item.href} className="flex-shrink-0">
                      <Link href={item.href} aria-current={active ? "page" : undefined}
                        className={cn(
                          "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all focus-visible:outline-2 whitespace-nowrap",
                          active ? "gradient-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                        )}>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Desktop: user + logout */}
          <div className="hidden md:flex items-center gap-1.5 flex-shrink-0 ml-auto">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-muted/70">
              <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center text-white text-[10px] font-bold" aria-hidden="true">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium max-w-[80px] truncate">{userName}</span>
            </div>
            <form action={logoutAction}>
              <button type="submit" className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors focus-visible:outline-2">
                Chiqish
              </button>
            </form>
          </div>

          {/* Mobile: hamburger */}
          <div className="md:hidden ml-auto">
            <MobileMenu
              items={NAV_ITEMS}
              userName={userName}
              userInitial={userName.charAt(0).toUpperCase()}
            />
          </div>

        </div>
      </div>
    </header>
  );
}
