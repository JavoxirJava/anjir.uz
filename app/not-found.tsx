import Link from "next/link";
import { AnjirLogo } from "@/components/AnjirLogo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <AnjirLogo size={64} />
      <h1 className="text-3xl font-black">404 — Sahifa topilmadi</h1>
      <p className="text-muted-foreground">Siz qidirayotgan sahifa mavjud emas.</p>
      <Link href="/" className="text-primary font-semibold hover:underline">Bosh sahifaga qaytish →</Link>
    </div>
  );
}
