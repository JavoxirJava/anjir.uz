"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { uz } from "@/lib/strings/uz";
import { logoutAction } from "@/app/actions/auth";
import { MobileMenu } from "./MobileMenu";
import { IImkonLogo } from "@/components/IImkonLogo";
import { AccessibilityBar } from "@/components/AccessibilityBar";

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
    <>
      <AccessibilityBar />

      {/* Main header */}
      <header style={{ background: "#0f766e" }} className="sticky top-8 z-40" role="banner">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex h-13 items-center gap-3">

            {/* Logo */}
            <Link href="/admin" className="flex items-center gap-2 flex-shrink-0 focus-visible:outline-2 focus-visible:outline-white" aria-label="I-Imkon.uz — Admin panel">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <IImkonLogo size={22} />
              </div>
              <div className="hidden sm:block">
                <div className="text-white font-black text-sm leading-tight">I-IMKON.UZ</div>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white">Admin</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex flex-1 min-w-0">
              <nav aria-label={uz.nav.mainMenu} className="overflow-x-auto no-scrollbar flex-1">
                <ul className="flex items-center gap-0.5 flex-nowrap py-1 px-1" role="list">
                  {NAV_ITEMS.map((item) => {
                    const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                    return (
                      <li key={item.href} className="flex-shrink-0">
                        <Link href={item.href} aria-current={active ? "page" : undefined}
                          className={cn(
                            "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap",
                            active ? "bg-white text-[#0f766e]" : "text-white/80 hover:text-white hover:bg-white/15"
                          )}>
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* Desktop user + logout */}
            <div className="hidden md:flex items-center gap-1.5 flex-shrink-0 ml-auto">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/15">
                <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-white text-[10px] font-bold" aria-hidden="true">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-white max-w-[80px] truncate">{userName}</span>
              </div>
              <form action={logoutAction}>
                <button type="submit" className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/15 transition-colors">
                  Chiqish
                </button>
              </form>
            </div>

            {/* Mobile hamburger */}
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
    </>
  );
}
