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
  { href: "/app",              label: "Asosiy",       exact: true, icon: "🏠" },
  { href: "/app/subjects",     label: "Fanlar",                    icon: "📖" },
  { href: "/app/lectures",     label: "Ma'ruzalar",                icon: "📄" },
  { href: "/app/tests",        label: "Testlar",                   icon: "📝" },
  { href: "/app/games",        label: "O'yinlar",                  icon: "🎮" },
  { href: "/app/assignments",  label: "Topshiriqlar",              icon: "✏️" },
  { href: "/app/books",        label: "Kitoblar",                  icon: "📚" },
  { href: "/app/leaderboard",  label: "Reyting",                   icon: "🏆" },
  { href: "/app/settings",     label: "Sozlamalar",                icon: "⚙️" },
];

export function StudentNav({ userName }: { userName: string; userId: string }) {
  const pathname = usePathname();

  return (
    <>
      {/* Accessibility bar */}
      <div style={{ background: "#134e4a" }} className="sticky top-0 z-40">
        <div className="container mx-auto max-w-5xl px-4 h-8 flex items-center justify-between text-xs text-white/70">
          <span>I-Imkon.uz — Ta&apos;lim platformasi</span>
          <span className="hidden sm:block">♿ Hamma uchun moslashtirilgan</span>
        </div>
      </div>

      {/* Main header */}
      <header style={{ background: "#0f766e" }} className="sticky top-8 z-40" role="banner">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="flex h-13 items-center gap-3">

            {/* Logo */}
            <Link href="/app" className="flex items-center gap-2 flex-shrink-0 focus-visible:outline-2 focus-visible:outline-white" aria-label="I-Imkon.uz">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <IImkonLogo size={22} />
              </div>
              <div className="hidden sm:block">
                <div className="text-white font-black text-sm leading-tight">I-IMKON.UZ</div>
              </div>
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
                            "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap",
                            active ? "bg-white text-[#0f766e]" : "text-white/80 hover:text-white hover:bg-white/15"
                          )}>
                          <span aria-hidden="true">{item.icon}</span>
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
              <Link href="/app/profile" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 transition-colors focus-visible:outline-2 focus-visible:outline-white">
                <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-white text-[10px] font-bold" aria-hidden="true">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-white max-w-[70px] truncate">{userName}</span>
              </Link>
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
                profileHref="/app/profile"
              />
            </div>

          </div>
        </div>
      </header>
    </>
  );
}
