import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  // active foydalanuvchilar allaqachon onboarding o'tgan
  const { data: userData } = await supabase
    .from("users").select("status").eq("id", user.id).single();
  if (userData?.status === "active") redirect("/app");
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
