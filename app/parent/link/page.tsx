"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logoutAction } from "@/app/actions/auth";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

export default function ParentLinkPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [phone, setPhone] = useState("+998");
  const [linked, setLinked] = useState<Student[]>([]);

  function handleLink(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await apiFetch<{ ok: boolean; student: Student }>("/parents/link", {
          method: "POST",
          body: JSON.stringify({ phone }),
        });
        setLinked((prev) => [...prev, res.student]);
        setPhone("+998");
        toast.success(`${res.student.first_name} ${res.student.last_name} bog'landi`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Xatolik");
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 text-4xl" aria-hidden="true">👨‍👩‍👧</div>
            <CardTitle>Farzandingizni bog'lang</CardTitle>
            <p className="text-sm text-muted-foreground">
              Farzandingizning telefon raqamini kiriting
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLink} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Farzand telefon raqami</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998901234567"
                  disabled={isPending}
                  className="h-11 rounded-xl"
                />
              </div>
              <Button type="submit" disabled={isPending} className="w-full h-11 rounded-xl">
                {isPending ? "Qidirilmoqda..." : "Bog'lash"}
              </Button>
            </form>

            {linked.length > 0 && (
              <div className="rounded-xl border bg-muted/40 p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Bog'langan farzandlar</p>
                {linked.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">✓</span>
                    {s.first_name} {s.last_name}
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/pending")}
              disabled={isPending}
            >
              Tasdiqlashga yuborish
            </Button>

            <form action={logoutAction}>
              <Button type="submit" variant="ghost" className="w-full text-sm text-muted-foreground">
                Chiqish
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
