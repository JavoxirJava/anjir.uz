import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TeacherNav } from "@/components/nav/TeacherNav";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: userData } = await supabase
    .from("users")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (!userData || userData.role !== "teacher") {
    redirect("/app");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TeacherNav
        userId={user.id}
        userName={`${userData.first_name} ${userData.last_name}`}
      />
      <div className="flex-1 container mx-auto max-w-6xl px-4 py-6">
        {children}
      </div>
    </div>
  );
}
