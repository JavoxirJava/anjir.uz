import Link from "next/link";
import { IImkonLogo } from "@/components/IImkonLogo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f8fafc" }}>
      <div style={{ background: "#134e4a" }}>
        <div className="container mx-auto max-w-6xl px-4 h-8 flex items-center text-xs text-white/60">
          I-Imkon.uz — Ta&apos;lim platformasi
        </div>
      </div>
      <header style={{ background: "#0f766e" }}>
        <div className="container mx-auto max-w-6xl px-4 h-13 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <IImkonLogo size={22} />
            </div>
            <span className="text-white font-black">I-IMKON.UZ</span>
          </Link>
        </div>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
        <IImkonLogo size={64} />
        <h1 className="text-3xl font-black text-gray-900">404 — Sahifa topilmadi</h1>
        <p className="text-gray-500">Siz qidirayotgan sahifa mavjud emas.</p>
        <Link href="/" className="font-semibold hover:underline" style={{ color: "#0f766e" }}>Bosh sahifaga qaytish →</Link>
      </div>
    </div>
  );
}
