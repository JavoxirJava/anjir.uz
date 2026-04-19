import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { uz } from "@/lib/strings/uz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logoutAction } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: `${uz.pending.title} — Anjir.uz`,
};

export default async function PendingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: userData } = await supabase
    .from("users")
    .select("status, first_name")
    .eq("id", user.id)
    .single();

  if (userData?.status === "active") {
    redirect("/app");
  }

  const isRejected = userData?.status === "rejected";

  // Rad etilish sababini olish
  let rejectionReason: string | null = null;
  if (isRejected) {
    const { data: profile } = await supabase
      .from("student_profiles")
      .select("rejection_reason")
      .eq("user_id", user.id)
      .single();
    rejectionReason = profile?.rejection_reason ?? null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div
              className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              aria-hidden="true"
              style={{
                background: isRejected
                  ? "hsl(var(--destructive) / 0.1)"
                  : "hsl(var(--primary) / 0.1)",
              }}
            >
              {isRejected ? "✗" : "⏳"}
            </div>
            <CardTitle className="text-xl">
              {isRejected ? uz.pending.rejected : uz.pending.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-center">
            {isRejected ? (
              <>
                {rejectionReason && (
                  <div
                    className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-left"
                    role="alert"
                  >
                    <p className="font-medium">{uz.pending.rejectedReason}:</p>
                    <p className="mt-1">{rejectionReason}</p>
                  </div>
                )}
                <Link href="/register">
                  <Button variant="outline" className="w-full">
                    {uz.pending.reapply}
                  </Button>
                </Link>
              </>
            ) : (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {uz.pending.description}
              </p>
            )}

            <p className="text-xs text-muted-foreground">{uz.pending.contact}</p>

            <form action={logoutAction}>
              <Button type="submit" variant="ghost" className="w-full text-sm">
                {uz.nav.logout}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
