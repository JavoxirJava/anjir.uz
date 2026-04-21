import Link from "next/link";
import { IImkonLogo } from "@/components/IImkonLogo";

const FEATURES = [
  {
    title: "Interaktiv darslar",
    desc: "PDF, video, audio va prezentatsiya",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    color: "#0d9488",
  },
  {
    title: "Aqlli testlar",
    desc: "Tanlov, ko'p javobli, to'ldirish",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 0 0 2.25 2.25h.75" />
      </svg>
    ),
    color: "#7c3aed",
  },
  {
    title: "O'yin orqali o'rganish",
    desc: "So'z moslash, tartib tuzish, xotira",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    ),
    color: "#f59e0b",
  },
  {
    title: "Reyting tizimi",
    desc: "Haftalik va umumiy liderlar jadvali",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    color: "#ef4444",
  },
  {
    title: "Topshiriqlar",
    desc: "Uy ishi, loyiha va baholash",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
      </svg>
    ),
    color: "#0891b2",
  },
  {
    title: "Maxsus imkoniyatlar",
    desc: "Shrift o'lchami, kontrast, ovoz",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
    color: "#16a34a",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f8fafc" }}>

      {/* ── Accessibility bar ───────────────────────── */}
      <div style={{ background: "#134e4a", color: "white" }}>
        <div className="container mx-auto max-w-6xl px-4 h-9 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="text-white/70">Maxsus imkoniyatlar:</span>
            <button className="px-2 py-0.5 rounded bg-white/15 hover:bg-white/25 font-bold transition-colors focus-visible:outline-2 focus-visible:outline-white">A+</button>
            <button className="px-2 py-0.5 rounded bg-white/15 hover:bg-white/25 font-bold transition-colors focus-visible:outline-2 focus-visible:outline-white">A−</button>
            <button className="px-2 py-0.5 rounded bg-white/15 hover:bg-white/25 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-white">Yuqori kontrast</button>
          </div>
          <span className="hidden sm:block text-white/60">♿ Hamma uchun moslashtirilgan</span>
        </div>
      </div>

      {/* ── Header ──────────────────────────────────── */}
      <header style={{ background: "#0f766e" }}>
        <div className="container mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <IImkonLogo size={24} />
            </div>
            <div>
              <div className="text-white font-black text-base leading-tight">I-IMKON.UZ</div>
              <div className="text-white/60 text-[10px] leading-tight">Ta&apos;lim platformasi</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-2">
            <Link href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              Kirish
            </Link>
            <Link href="/register"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#0f766e] text-sm font-bold hover:bg-white/90 transition-colors">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
              Ro&apos;yxatdan o&apos;tish
            </Link>
          </nav>

        </div>
      </header>

      <main>

        {/* ── Hero ────────────────────────────────────── */}
        <section className="bg-white border-b border-gray-100 py-12 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-3">
                📚 Inklyuziv ta&apos;lim muhiti —<br />
                <span style={{ color: "#0f766e" }}>5–9-sinf o&apos;quvchilari uchun</span>
              </h1>
              <p className="text-gray-500 text-base mb-2">
                O&apos;z sinfingizni tanlang va darslarni boshlang
              </p>

              {/* Shior */}
              <div className="flex items-center gap-3 mt-4 mb-6">
                <div className="w-1 h-10 rounded-full" style={{ background: "#0f766e" }} />
                <div>
                  <p className="font-bold text-gray-800 text-base leading-tight">Ilmda chegara yo&apos;q,</p>
                  <p className="font-bold italic text-base leading-tight" style={{ color: "#0f766e" }}>I-Imkonda to&apos;siq!</p>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <Link href="/register"
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "#0f766e" }}>
                  Boshlash — Bepul
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link href="/login"
                  className="inline-flex items-center h-10 px-5 rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
                  Tizimga kirish
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Imkoniyatlar ────────────────────────────── */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">Platforma imkoniyatlari</h2>
                <p className="text-gray-500 text-sm mt-0.5">Zamonaviy pedagogika va qulay muhit</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f) => (
                <div key={f.title}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all group">
                  {/* Badge + icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{ background: `${f.color}15`, color: f.color }}>
                      {f.icon}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${f.color}15`, color: f.color }}>
                      I-Imkon
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Rollar ──────────────────────────────────── */}
        <section className="py-12 px-4 bg-white border-t border-gray-100">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-xl font-black text-gray-900 mb-6">Kim uchun?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "O'quvchi",   icon: "👨‍🎓", desc: "Darslar, testlar, o'yinlar" },
                { label: "O'qituvchi", icon: "👨‍🏫", desc: "Kontent yaratish, analitika" },
                { label: "Direktor",   icon: "🏫",  desc: "Maktab nazorati" },
                { label: "Admin",      icon: "⚙️",  desc: "Tizim boshqaruvi" },
              ].map((r) => (
                <div key={r.label}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center hover:border-teal-200 hover:bg-teal-50/40 transition-all">
                  <div className="text-3xl mb-2" aria-hidden="true">{r.icon}</div>
                  <p className="font-bold text-sm text-gray-900">{r.label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────── */}
        <section className="py-12 px-4" style={{ background: "#0f766e" }}>
          <div className="container mx-auto max-w-2xl text-center space-y-4">
            <h2 className="text-2xl font-black text-white">
              Bugun boshlang — bepul
            </h2>
            <p className="text-white/70 text-sm">
              Maktabingizni ro&apos;yxatdan o&apos;tkazing va o&apos;quvchilaringiz uchun yangi imkoniyatlar yarating
            </p>
            <Link href="/register"
              className="inline-flex items-center gap-2 h-10 px-7 rounded-lg text-sm font-bold bg-white hover:bg-white/90 transition-colors"
              style={{ color: "#0f766e" }}>
              Ro&apos;yxatdan o&apos;tish
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </section>

      </main>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-5 px-4 bg-white">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <IImkonLogo size={16} />
            <span className="font-semibold text-gray-600">I-Imkon.uz</span>
            <span>— Ta&apos;lim platformasi</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-gray-700 transition-colors">Kirish</Link>
            <Link href="/register" className="hover:text-gray-700 transition-colors">Ro&apos;yxat</Link>
            <span>© 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
