import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "parent") redirect("/login");

  return <>{children}</>;
}
