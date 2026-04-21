import Link from "next/link";
import { IImkonLogo } from "@/components/IImkonLogo";

const FEATURES = [
  {
    title: "Interaktiv darslar",
    desc: "PDF, video, audio va prezentatsiya formatida",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    title: "Aqlli testlar",
    desc: "Tanlov, ko'p javobli, to'ldirish turlari",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 0 0 2.25 2.25h.75m0-3.75h3.75" />
      </svg>
    ),
  },
  {
    title: "O'yin orqali o'rganish",
    desc: "So'z moslash, tartib tuzish, xotira o'yinlari",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z" />
      </svg>
    ),
  },
  {
    title: "Inklyuziv dizayn",
    desc: "Imkoniyati cheklangan o'quvchilar uchun moslashtirilgan",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
  },
  {
    title: "Analitika",
    desc: "O'qituvchi va direktorlar uchun batafsil statistika",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    title: "Reyting tizimi",
    desc: "Haftalik va umumiy liderlar jadvali",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
      </svg>
    ),
  },
];

const ROLES = [
  { label: "O'quvchi",   desc: "Darslar, testlar, o'yinlar, kitoblar" },
  { label: "O'qituvchi", desc: "Kontent yaratish, sinf boshqaruvi, analitika" },
  { label: "Direktor",   desc: "Maktab nazorati va hisobotlar" },
  { label: "Admin",      desc: "Tizim va maktablarni boshqarish" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── Nav ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="container mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IImkonLogo size={26} />
            <span className="font-bold text-base tracking-tight text-gradient">I-Imkon.uz</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/login"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
              Kirish
            </Link>
            <Link href="/register"
              className="px-4 py-2 rounded-lg text-sm font-semibold gradient-primary text-white hover:opacity-90 transition-opacity">
              Ro&apos;yxatdan o&apos;tish
            </Link>
          </nav>
        </div>
      </header>

      <main>

        {/* ── Hero ────────────────────────────────────── */}
        <section className="pt-16 pb-20 px-4 border-b border-gray-100">
          <div className="container mx-auto max-w-5xl">
            <div className="grid lg:grid-cols-[1fr_auto] gap-12 items-center">

              {/* Matn */}
              <div className="space-y-6 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold uppercase tracking-wide">
                  5–9-sinf o&apos;quvchilari uchun
                </div>

                <h1 className="text-4xl sm:text-5xl font-black leading-tight text-gray-900">
                  Hamma uchun<br />
                  <span className="text-gradient">ta&apos;lim muhiti</span>
                </h1>

                {/* Shior */}
                <div className="pl-4 border-l-2 border-violet-500">
                  <p className="text-gray-800 font-bold text-lg leading-snug">
                    Ilmda chegara yo&apos;q,
                  </p>
                  <p className="text-violet-600 font-bold text-lg leading-snug italic">
                    I-Imkonda to&apos;siq!
                  </p>
                </div>

                <p className="text-gray-500 text-base leading-relaxed">
                  Imkoniyati cheklangan o&apos;quvchilar uchun to&apos;liq moslashtirilgan
                  ta&apos;lim-test platformasi.
                </p>

                <div className="flex gap-3 flex-wrap">
                  <Link href="/register"
                    className="inline-flex items-center gap-2 h-11 px-6 rounded-lg text-sm font-semibold gradient-primary text-white hover:opacity-90 transition-opacity">
                    Boshlash — Bepul
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                  <Link href="/login"
                    className="inline-flex items-center h-11 px-6 rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
                    Tizimga kirish
                  </Link>
                </div>
              </div>

              {/* Stats — o'ng tomonda */}
              <div className="hidden lg:grid grid-cols-2 gap-3 w-60">
                {[
                  { value: "5–9",     label: "Sinflar" },
                  { value: "4",       label: "Rol turi" },
                  { value: "100%",    label: "Moslashtirilgan" },
                  { value: "WCAG 2.1", label: "Standart" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center">
                    <div className="text-xl font-black text-gradient">{s.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* ── Imkoniyatlar ────────────────────────────── */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">

            <div className="mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                Nima uchun <span className="text-gradient">I-Imkon.uz</span>?
              </h2>
              <p className="text-gray-500 mt-2 text-sm">
                Zamonaviy pedagogika va inklyuziv dizayn birlashgan platforma
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
              {FEATURES.map((f) => (
                <div key={f.title}
                  className="bg-white p-5 hover:bg-violet-50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 mb-3 group-hover:bg-violet-200 transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Kimlar uchun ────────────────────────────── */}
        <section className="py-16 px-4 bg-white border-t border-gray-100">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-8">Kim uchun?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLES.map((r, i) => (
                <div key={r.label}
                  className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/40 transition-all">
                  <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{r.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────── */}
        <section className="py-14 px-4 bg-gray-50 border-t border-gray-100">
          <div className="container mx-auto max-w-2xl text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Bugun boshlang — <span className="text-gradient">bepul</span>
            </h2>
            <p className="text-gray-500 text-sm">
              Maktabingizni ro&apos;yxatdan o&apos;tkazing va o&apos;quvchilaringiz uchun yangi imkoniyatlar yarating
            </p>
            <Link href="/register"
              className="inline-flex items-center gap-2 h-11 px-8 rounded-lg text-sm font-semibold gradient-primary text-white hover:opacity-90 transition-opacity">
              Ro&apos;yxatdan o&apos;tish
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </section>

      </main>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-6 px-4 bg-white">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <IImkonLogo size={18} />
            <span className="font-semibold text-gray-600">I-Imkon.uz</span>
            <span>— Inklyuziv ta&apos;lim platformasi</span>
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
