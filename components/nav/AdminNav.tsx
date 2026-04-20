"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { uz } from "@/lib/strings/uz";
import { logoutAction } from "@/app/actions/auth";
import { MobileMenu } from "./MobileMenu";
import { AnjirLogo } from "@/components/AnjirLogo";

const NAV_ITEMS = [
  { href: "/admin",           label: "Asosiy",           exact: true, icon: "🏠" },
  { href: "/admin/schools",   label: "Maktablar",                     icon: "🏫" },
  { href: "/admin/directors", label: "Direktorlar",                   icon: "👔" },
  { href: "/admin/subjects",  label: "Fanlar",                        icon: "📖" },
  { href: "/admin/users",     label: "Foydalanuvchilar",              icon: "👥" },
  { href: "/admin/analytics", label: "Analitika",                     icon: "📊" },
];

export function AdminNav({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <header className="glass border-b sticky top-0 z-40" role="banner">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center gap-3">

          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-1.5 flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" aria-label="Admin panel">
            <AnjirLogo size={26} />
            <span className="font-black text-base text-gradient hidden sm:block">Anjir.uz</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full gradient-primary text-white">Admin</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex flex-1 min-w-0 relative">
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
              badge="Admin"
            />
          </div>

        </div>
      </div>
    </header>
  );
}
