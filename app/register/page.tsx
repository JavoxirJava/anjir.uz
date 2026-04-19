import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";
import { uz } from "@/lib/strings/uz";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: `${uz.auth.register} — Anjir.uz`,
};

export default async function RegisterPage() {
  const supabase = await createClient();

  const { data: schools } = await supabase
    .from("schools")
    .select("id, name")
    .order("name");

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Anjir.uz</h1>
          <p className="mt-2 text-muted-foreground">{uz.auth.register}</p>
        </div>
        <RegisterForm schools={schools ?? []} />
      </div>
    </div>
  );
}
