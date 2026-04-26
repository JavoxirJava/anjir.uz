"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { apiPost } from "@/lib/api/browser";
import { uz } from "@/lib/strings/uz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AddSchoolForm() {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [open, setOpen] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Maktab nomi kiritilishi shart"); return; }

    startTransition(async () => {
      try {
        await apiPost("/schools", { name: name.trim(), address: address.trim() || null });
        toast.success("Maktab qo'shildi");
        setName(""); setAddress(""); setOpen(false);
        window.location.reload();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Xatolik");
      }
    });
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline">
        + {uz.admin.addSchool}
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{uz.admin.addSchool}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="school-name">{uz.school.name} *</Label>
            <Input id="school-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="1-maktab" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="school-address">{uz.school.address}</Label>
            <Input id="school-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Toshkent sh., ..." />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isPending} aria-busy={isPending}>
              {isPending ? uz.common.loading : uz.common.save}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {uz.common.cancel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
