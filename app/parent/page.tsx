export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { apiGet } from "@/lib/api/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logoutAction } from "@/app/actions/auth";

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  status: string;
  grade: number | null;
  letter: string | null;
  school_name: string | null;
  approved_at: string | null;
}

export default async function ParentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const children = await apiGet<Child[]>("/parents/children").catch(() => []);

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Farzandlarim</h1>
            <p className="text-sm text-muted-foreground">{user.first_name} {user.last_name}</p>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm">Chiqish</Button>
          </form>
        </div>

        {children.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <div className="text-4xl" aria-hidden="true">👨‍👩‍👧</div>
              <p className="text-muted-foreground">Hali farzand bog'lanmagan</p>
              <Link href="/parent/link">
                <Button>Farzand qo'shish</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {children.map((child) => (
              <Card key={child.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {child.first_name} {child.last_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {child.school_name && (
                    <p>🏫 {child.school_name}{child.grade ? ` — ${child.grade}-sinf ${child.letter}` : ""}</p>
                  )}
                  <p>
                    {child.approved_at
                      ? <span className="text-green-600 font-medium">✓ Tasdiqlangan</span>
                      : <span className="text-yellow-600 font-medium">⏳ Tasdiqlanmagan</span>}
                  </p>
                </CardContent>
              </Card>
            ))}

            <Link href="/parent/link">
              <Button variant="outline" className="w-full">+ Yana farzand qo'shish</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
