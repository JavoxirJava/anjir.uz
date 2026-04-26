import { getCurrentUser } from "@/lib/api/auth";
import { redirect } from "next/navigation";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const userData = await getCurrentUser();
  if (!userData) redirect("/login");
  if (userData.status === "active") redirect("/app");
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
