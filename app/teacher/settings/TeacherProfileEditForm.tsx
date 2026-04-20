"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateTeacherProfileAction, updateTeacherPasswordAction } from "@/app/actions/teacher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  firstName: string;
  lastName: string;
}

export function TeacherProfileEditForm({ firstName, lastName }: Props) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [isPendingProfile, startProfile] = useTransition();
  const [isPendingPassword, startPassword] = useTransition();

  const [fn, setFn] = useState(firstName);
  const [ln, setLn] = useState(lastName);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    startProfile(async () => {
      const fd = new FormData();
      fd.set("firstName", fn.trim());
      fd.set("lastName", ln.trim());
      const result = await updateTeacherProfileAction(fd);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Ma'lumotlar yangilandi");
        setEditingProfile(false);
      }
    });
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pw !== pw2) { toast.error("Parollar mos kelmadi"); return; }
    startPassword(async () => {
      const fd = new FormData();
      fd.set("password", pw);
      const result = await updateTeacherPasswordAction(fd);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Parol o'zgartirildi");
        setPw(""); setPw2("");
        setEditingPassword(false);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* --- Ism/Familiya --- */}
      {!editingProfile ? (
        <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>
          ✏️ Ism-familiyani o&apos;zgartirish
        </Button>
      ) : (
        <form onSubmit={handleProfileSubmit} className="space-y-3 rounded-xl border bg-muted/30 p-4">
          <p className="text-sm font-semibold">Ism-familiyani tahrirlash</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="t-fn">Ism</Label>
              <Input
                id="t-fn"
                value={fn}
                onChange={(e) => setFn(e.target.value)}
                disabled={isPendingProfile}
                placeholder="Ism"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-ln">Familiya</Label>
              <Input
                id="t-ln"
                value={ln}
                onChange={(e) => setLn(e.target.value)}
                disabled={isPendingProfile}
                placeholder="Familiya"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPendingProfile}>
              {isPendingProfile ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => { setFn(firstName); setLn(lastName); setEditingProfile(false); }} disabled={isPendingProfile}>
              Bekor qilish
            </Button>
          </div>
        </form>
      )}

      {/* --- Parol --- */}
      {!editingPassword ? (
        <Button variant="outline" size="sm" onClick={() => setEditingPassword(true)}>
          🔒 Parolni o&apos;zgartirish
        </Button>
      ) : (
        <form onSubmit={handlePasswordSubmit} className="space-y-3 rounded-xl border bg-muted/30 p-4">
          <p className="text-sm font-semibold">Yangi parol</p>
          <div className="space-y-1.5">
            <Label htmlFor="t-pw">Yangi parol (kamida 8 belgi)</Label>
            <Input
              id="t-pw"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              disabled={isPendingPassword}
              placeholder="Yangi parol"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-pw2">Parolni takrorlang</Label>
            <Input
              id="t-pw2"
              type="password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              disabled={isPendingPassword}
              placeholder="Parolni takrorlang"
              autoComplete="new-password"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPendingPassword}>
              {isPendingPassword ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => { setPw(""); setPw2(""); setEditingPassword(false); }} disabled={isPendingPassword}>
              Bekor qilish
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
