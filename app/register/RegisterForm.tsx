"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { registerAction } from "@/app/actions/auth";
import { uz } from "@/lib/strings/uz";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface ClassItem {
  id: string;
  grade: number;
  letter: string;
}

interface Props {
  schools: School[];
}

type Role = "student" | "teacher";

export function RegisterForm({ schools }: Props) {
  const [isPending, startTransition] = useTransition();

  const [role, setRole] = useState<Role>("student");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("+998");
  const [password, setPassword] = useState("");

  const [schoolId, setSchoolId] = useState("");
  const [classId, setClassId] = useState("");

  const [teacherSchoolId, setTeacherSchoolId] = useState("");
  const [teacherClassIds, setTeacherClassIds] = useState<string[]>([]);

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [classError, setClassError] = useState<string | null>(null);

  const activeSchoolId = role === "student" ? schoolId : teacherSchoolId;

  useEffect(() => {
    if (!activeSchoolId) {
      setClasses([]);
      setClassId("");
      setTeacherClassIds([]);
      return;
    }
    setLoadingClasses(true);
    const supabase = createClient();
    supabase
      .from("classes")
      .select("id, grade, letter")
      .eq("school_id", activeSchoolId)
      .order("grade")
      .order("letter")
      .then(({ data }) => {
        setClasses(data ?? []);
        setLoadingClasses(false);
      });
  }, [activeSchoolId]);

  function handleRoleChange(newRole: Role) {
    setRole(newRole);
    setSchoolId("");
    setClassId("");
    setTeacherSchoolId("");
    setTeacherClassIds([]);
    setClasses([]);
    setClassError(null);
  }

  function toggleTeacherClass(id: string) {
    setClassError(null);
    setTeacherClassIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (role === "teacher" && teacherSchoolId && classes.length > 0 && teacherClassIds.length === 0) {
      setClassError("Kamida bitta sinfni tanlang");
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.set("firstName", firstName);
      fd.set("lastName", lastName);
      fd.set("phone", phone);
      fd.set("password", password);
      fd.set("role", role);

      if (role === "student") {
        fd.set("schoolId", schoolId);
        fd.set("classId", classId);
      } else {
        fd.set("teacherSchoolId", teacherSchoolId);
        teacherClassIds.forEach((id) => fd.append("teacherClassIds", id));
      }

      const result = await registerAction(fd);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label={uz.auth.register} className="space-y-5">

      {/* Role toggle — pill style */}
      <div className="flex gap-1.5 p-1.5 bg-muted rounded-2xl">
        {(["student", "teacher"] as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => handleRoleChange(r)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
              role === r
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span aria-hidden="true">{r === "student" ? "👨‍🎓" : "👨‍🏫"}</span>
            {r === "student" ? "O'quvchi" : "O'qituvchi"}
          </button>
        ))}
      </div>

      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {uz.auth.firstName}
          </Label>
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            aria-required="true"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isPending}
            className="h-11 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {uz.auth.lastName}
          </Label>
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            aria-required="true"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={isPending}
            className="h-11 rounded-xl"
          />
        </div>
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {uz.auth.phone}
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={uz.auth.phonePlaceholder}
          aria-required="true"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isPending}
          className="h-11 rounded-xl"
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {uz.auth.password}
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder={uz.auth.passwordPlaceholder}
          aria-required="true"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
          className="h-11 rounded-xl"
        />
      </div>

      {/* Student: school + class */}
      {role === "student" && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="schoolId" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {uz.auth.school}
            </Label>
            <Select
              value={schoolId}
              onValueChange={(v) => { setSchoolId(v ?? ""); setClassId(""); }}
              disabled={isPending}
            >
              <SelectTrigger id="schoolId" className="h-11 rounded-xl">
                <SelectValue placeholder={uz.auth.schoolPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {schools.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                    Hozircha maktablar qo&apos;shilmagan
                  </div>
                ) : (
                  schools.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="classId" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {uz.auth.class}
            </Label>
            <Select
              value={classId}
              onValueChange={(v) => setClassId(v ?? "")}
              disabled={!schoolId || loadingClasses || isPending}
            >
              <SelectTrigger id="classId" className="h-11 rounded-xl">
                <SelectValue placeholder={loadingClasses ? uz.common.loading : uz.auth.classPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.grade}-sinf {c.letter}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* Teacher: school + multi-class checkboxes */}
      {role === "teacher" && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="teacherSchoolId" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {uz.auth.school}
            </Label>
            <Select
              value={teacherSchoolId}
              onValueChange={(v) => { setTeacherSchoolId(v ?? ""); setTeacherClassIds([]); setClassError(null); }}
              disabled={isPending}
            >
              <SelectTrigger id="teacherSchoolId" className="h-11 rounded-xl">
                <SelectValue placeholder={uz.auth.schoolPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {schools.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                    Hozircha maktablar qo&apos;shilmagan
                  </div>
                ) : (
                  schools.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {teacherSchoolId && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {uz.auth.class}{" "}
                <span className="normal-case font-normal">(bir yoki bir nechta)</span>
              </Label>
              {loadingClasses ? (
                <p className="text-sm text-muted-foreground py-2">{uz.common.loading}</p>
              ) : classes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">{uz.common.noData}</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 rounded-xl border bg-muted/40 p-3">
                  {classes.map((c) => {
                    const checked = teacherClassIds.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          checked ? "bg-primary/10 text-primary" : "hover:bg-background"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleTeacherClass(c.id)}
                          disabled={isPending}
                          className="accent-primary"
                        />
                        {c.grade}-sinf {c.letter}
                      </label>
                    );
                  })}
                </div>
              )}
              {classError && (
                <p className="text-sm text-destructive font-medium">{classError}</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Divider */}
      <div className="h-px bg-border" aria-hidden="true" />

      {/* Submit button */}
      <Button
        type="submit"
        className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            {uz.common.loading}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {uz.auth.register}
            <span aria-hidden="true">→</span>
          </span>
        )}
      </Button>

      <p className="text-sm text-center text-muted-foreground">
        {uz.auth.haveAccount}{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline underline-offset-4 focus-visible:outline-2"
        >
          {uz.auth.login}
        </Link>
      </p>
    </form>
  );
}
