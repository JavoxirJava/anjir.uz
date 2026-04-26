import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { TeacherNav } from "@/components/nav/TeacherNav";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userData = await getCurrentUser();
  if (!userData) redirect("/login");
  if (userData.role !== "teacher") redirect("/app");

  return (
    <div className="min-h-screen flex flex-col">
      <TeacherNav
        userId={userData.id}
        userName={`${userData.first_name} ${userData.last_name}`}
      />
      <div className="flex-1 container mx-auto max-w-6xl px-4 py-6">
        {children}
      </div>
    </div>
  );
}
