"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createDirectorAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface School {
  id: string;
  name: string;
}

export function AddDirectorForm({ schools }: { schools: School[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("+998");
  const [password, setPassword] = useState("");
  const [schoolId, setSchoolId] = useState("");

  function reset() {
    setFirstName(""); setLastName(""); setPhone("+998");
    setPassword(""); setSchoolId(""); setOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) { toast.error("Ism va familiya kiritilishi shart"); return; }
    if (!/^\+998[0-9]{9}$/.test(phone)) { toast.error("Telefon: +998XXXXXXXXX formatida"); return; }
    if (password.length < 8) { toast.error("Parol kamida 8 ta belgi"); return; }

    startTransition(async () => {
      const fd = new FormData();
      fd.set("firstName", firstName.trim());
      fd.set("lastName", lastName.trim());
      fd.set("phone", phone);
      fd.set("password", password);
      if (schoolId) fd.set("schoolId", schoolId);

      const result = await createDirectorAction(fd);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Direktor qo'shildi!");
        reset();
        window.location.reload();
      }
    });
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gradient-primary text-white">
        + Direktor qo&apos;shish
      </Button>
    );
  }

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="text-base">Yangi direktor</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dir-fn">Ism *</Label>
              <Input id="dir-fn" value={firstName} onChange={e => setFirstName(e.target.value)}
                placeholder="Ism" disabled={isPending} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dir-ln">Familiya *</Label>
              <Input id="dir-ln" value={lastName} onChange={e => setLastName(e.target.value)}
                placeholder="Familiya" disabled={isPending} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dir-phone">Telefon raqam *</Label>
            <Input id="dir-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+998901234567" disabled={isPending} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dir-pass">Parol * (kamida 8 belgi)</Label>
            <Input id="dir-pass" type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Parol kiriting" disabled={isPending} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dir-school">Maktab (ixtiyoriy)</Label>
            <Select value={schoolId} onValueChange={v => setSchoolId(v ?? "")} disabled={isPending}>
              <SelectTrigger id="dir-school">
                <SelectValue placeholder="Maktab tanlang">
                  {schoolId ? schools.find(s => s.id === schoolId)?.name : "Maktab tanlang"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {schools.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={isPending} aria-busy={isPending}>
              {isPending ? "Qo'shilmoqda..." : "Direktor yaratish"}
            </Button>
            <Button type="button" variant="outline" onClick={reset} disabled={isPending}>
              Bekor qilish
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
