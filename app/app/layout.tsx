import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { StudentNav } from "@/components/nav/StudentNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const userData = await getCurrentUser();
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
        userId={userData.id}
      />
      <div className="flex-1 container mx-auto max-w-5xl px-4 py-6">
        {children}
      </div>
    </div>
  );
}
