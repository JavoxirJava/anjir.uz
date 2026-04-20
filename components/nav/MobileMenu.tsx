"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
  icon?: string;
}

interface Props {
  items: NavItem[];
  userName: string;
  userInitial: string;
  profileHref?: string;
  badge?: string;
}

export function MobileMenu({ items, userName, userInitial, profileHref, badge }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Portal faqat client'da ishlaydi
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const overlay = open ? (
    <>
      {/* Qora backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 9998,
          background: "rgba(0,0,0,0.6)",
        }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: 300, maxWidth: "88vw", zIndex: 9999,
        display: "flex", flexDirection: "column",
        background: "#fff",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px", borderBottom: "1px solid #e5e7eb",
          background: "#f9fafb", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "linear-gradient(135deg,#7C3AED,#4F46E5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 16, fontWeight: 700, flexShrink: 0,
            }}>
              {userInitial}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{userName}</div>
              {badge && <div style={{ fontSize: 11, color: "#7C3AED", fontWeight: 700 }}>{badge}</div>}
            </div>
          </div>
          <button onClick={() => setOpen(false)} style={{
            width: 36, height: 36, borderRadius: 10,
            border: "1px solid #e5e7eb", background: "#fff",
            fontSize: 18, cursor: "pointer", color: "#6b7280",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        {/* Nav items — flex:1 to fill remaining height */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
          {items.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "13px 14px", borderRadius: 12, marginBottom: 4,
                textDecoration: "none", fontSize: 15, fontWeight: 500,
                color: active ? "#fff" : "#111827",
                background: active
                  ? "linear-gradient(135deg,#7C3AED,#4F46E5)"
                  : "#f3f4f6",
              }}>
                {item.icon && (
                  <span style={{ fontSize: 20, width: 26, textAlign: "center", flexShrink: 0 }}>
                    {item.icon}
                  </span>
                )}
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: "1px solid #e5e7eb",
          padding: "10px 12px",
          background: "#f9fafb", flexShrink: 0,
        }}>
          {profileHref && (
            <Link href={profileHref} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px", borderRadius: 12, marginBottom: 4,
              textDecoration: "none", fontSize: 15, fontWeight: 500,
              color: "#111827", background: "#f3f4f6",
            }}>
              <span style={{ fontSize: 20, width: 26, textAlign: "center" }}>👤</span>
              Profil
            </Link>
          )}
          <form action={logoutAction}>
            <button type="submit" style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px", borderRadius: 12, border: "none",
              cursor: "pointer", fontSize: 15, fontWeight: 500,
              color: "#dc2626", background: "#fff1f2",
            }}>
              <span style={{ fontSize: 20, width: 26, textAlign: "center" }}>🚪</span>
              Chiqish
            </button>
          </form>
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      {/* ☰ Hamburger */}
      <button
        type="button"
        aria-label="Menyuni ochish"
        onClick={() => setOpen(true)}
        className="flex flex-col justify-center items-center w-10 h-10 rounded-xl gap-[5px]"
      >
        <span className="block h-0.5 w-5 bg-current rounded" />
        <span className="block h-0.5 w-5 bg-current rounded" />
        <span className="block h-0.5 w-5 bg-current rounded" />
      </button>

      {/* Portal — backdrop-filter'dan chiqib, to'g'ri document.body'ga render */}
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
