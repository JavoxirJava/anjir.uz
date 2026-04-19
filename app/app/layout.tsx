import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StudentNav } from "@/components/nav/StudentNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: userData } = await supabase
    .from("users")
    .select("role, status, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (!userData) redirect("/login");
  if (userData.status !== "active") redirect("/pending");
  if (userData.role !== "student") {
    if (userData.role === "teacher") redirect("/teacher");
    if (userData.role === "director") redirect("/director");
    if (userData.role === "super_admin") redirect("/admin");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StudentNav
        userName={`${userData.first_name} ${userData.last_name}`}
        userId={user.id}
      />
      <div className="flex-1 container mx-auto max-w-5xl px-4 py-6">
        {children}
      </div>
    </div>
  );
}
