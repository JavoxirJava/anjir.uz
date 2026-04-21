import Link from "next/link";
import { IImkonLogo } from "@/components/IImkonLogo";

const FEATURES = [
  {
    icon: "📚",
    title: "Interaktiv darslar",
    desc: "PDF, video, audio va prezentatsiya formatidagi ma'ruzalar",
    color: "oklch(0.93 0.05 270)",
  },
  {
    icon: "🧪",
    title: "Aqlli testlar",
    desc: "Bir nechta test turi: tanlov, ko'p javobli, to'ldirish",
    color: "oklch(0.93 0.05 300)",
  },
  {
    icon: "🎮",
    title: "O'yin orqali o'rganish",
    desc: "So'z moslash, tartib tuzish va xotira o'yinlari",
    color: "oklch(0.93 0.05 200)",
  },
  {
    icon: "♿",
    title: "Inklyuziv dizayn",
    desc: "Ko'rish, eshitish va harakatlanish imkoniyatlari cheklangan o'quvchilar uchun",
    color: "oklch(0.93 0.05 150)",
  },
  {
    icon: "📊",
    title: "Analitika",
    desc: "O'qituvchilar va direktorlar uchun batafsil statistika",
    color: "oklch(0.93 0.05 60)",
  },
  {
    icon: "🏆",
    title: "Reyting tizimi",
    desc: "Haftalik va umumiy liderlar jadvali",
    color: "oklch(0.93 0.05 30)",
  },
];

const STATS = [
  { value: "5–9", label: "Sinflar" },
  { value: "4", label: "Rol turi" },
  { value: "100%", label: "Moslashtirilgan" },
  { value: "WCAG 2.1", label: "AA standart" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IImkonLogo size={28} />
            <span className="font-bold text-xl tracking-tight text-gradient">I-Imkon.uz</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors focus-visible:outline-2"
            >
              Kirish
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl text-sm font-semibold gradient-primary text-white shadow-glow hover:opacity-90 transition-opacity focus-visible:outline-2"
            >
              Ro&apos;yxatdan o&apos;tish
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="gradient-hero py-24 px-4 relative overflow-hidden">
          {/* Decorative blobs */}
          <div
            aria-hidden="true"
            className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, oklch(0.65 0.2 300), transparent)" }}
          />
          <div
            aria-hidden="true"
            className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, oklch(0.65 0.2 270), transparent)" }}
          />

          <div className="container mx-auto max-w-4xl text-center relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-glow"
              style={{ background: "oklch(1 0 0 / 0.8)" }}>
              <span aria-hidden="true">✨</span>
              <span className="text-gradient font-semibold">Yangi avlod ta&apos;lim platformasi</span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-tight">
              <span className="text-gradient">I-Imkon.uz</span>
              <br />
              <span className="text-foreground text-3xl sm:text-4xl font-bold">
                Hamma uchun ta&apos;lim
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              5–9-sinf o&apos;quvchilari uchun inklyuziv ta&apos;lim-test platformasi.
              Imkoniyati cheklangan o&apos;quvchilar uchun <strong className="text-foreground">to&apos;liq moslashtirilgan</strong>.
            </p>

            <div className="flex gap-4 flex-wrap justify-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 h-14 px-8 rounded-2xl text-base font-semibold gradient-primary text-white shadow-glow hover:opacity-90 transition-all hover:scale-105 focus-visible:outline-2"
              >
                Boshlash — Bepul
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 h-14 px-8 rounded-2xl text-base font-semibold bg-white border border-border hover:bg-muted/50 transition-all hover:scale-105 focus-visible:outline-2"
              >
                Tizimga kirish
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl p-4 text-center"
                  style={{ background: "oklch(1 0 0 / 0.6)", backdropFilter: "blur(8px)" }}
                >
                  <div className="text-2xl font-black text-gradient">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 px-4 bg-background" aria-labelledby="features-heading">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16 space-y-4">
              <h2 id="features-heading" className="text-3xl sm:text-4xl font-black">
                Nima uchun{" "}
                <span className="text-gradient">I-Imkon.uz</span>?
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Zamonaviy pedagogika va inklyuziv dizayn birlashgan platforma
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-3xl p-6 border border-border hover:border-primary/30 hover:shadow-glow transition-all duration-300 bg-card"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110"
                    style={{ background: f.color }}
                    aria-hidden="true"
                  >
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles */}
        <section className="py-24 px-4" style={{ background: "oklch(0.97 0.01 270)" }}>
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16 space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black">Kim uchun?</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: "👨‍🎓", role: "O'quvchi", desc: "Darslar, testlar, o'yinlar va kitoblar", color: "oklch(0.55 0.22 270)" },
                { icon: "👨‍🏫", role: "O'qituvchi", desc: "Kontent yaratish, baholash, analitika", color: "oklch(0.58 0.22 300)" },
                { icon: "🏫", role: "Direktor", desc: "Maktab nazorati va statistika", color: "oklch(0.55 0.18 200)" },
                { icon: "⚙️", role: "Admin", desc: "Tizim boshqaruvi va maktablar", color: "oklch(0.52 0.15 150)" },
              ].map((r) => (
                <div key={r.role} className="rounded-3xl p-6 bg-card border border-border text-center space-y-3 hover:shadow-glow transition-all">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto"
                    style={{ background: `${r.color}22` }}
                    aria-hidden="true"
                  >
                    {r.icon}
                  </div>
                  <h3 className="font-bold text-base" style={{ color: r.color }}>{r.role}</h3>
                  <p className="text-muted-foreground text-sm">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 gradient-hero">
          <div className="container mx-auto max-w-2xl text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl font-black">
              Bugun boshlang — <span className="text-gradient">Bepul</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Maktabingizni ro&apos;yxatdan o&apos;tkazing va o&apos;quvchilaringiz uchun yangi imkoniyatlar yarating
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 h-14 px-10 rounded-2xl text-base font-semibold gradient-primary text-white shadow-glow hover:opacity-90 transition-all hover:scale-105 focus-visible:outline-2"
            >
              Ro&apos;yxatdan o&apos;tish
              <span aria-hidden="true">🚀</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-background">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <IImkonLogo size={20} />
            <span className="font-semibold text-foreground">I-Imkon.uz</span>
            <span>— Inklyuziv ta&apos;lim platformasi</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-foreground transition-colors">Kirish</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Ro&apos;yxat</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
