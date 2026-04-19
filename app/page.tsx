import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center px-4 py-20">
      <h1 className="text-4xl font-bold">Anjir.uz</h1>
      <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
        5–9-sinf o&apos;quvchilari uchun inklyuziv ta&apos;lim-test platformasi.
        Imkoniyati cheklangan o&apos;quvchilar uchun to&apos;liq moslashtirilgan.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          href="/login"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Tizimga kirish
        </Link>
        <Link
          href="/register"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-6 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Ro&apos;yxatdan o&apos;tish
        </Link>
      </div>
    </div>
  );
}
