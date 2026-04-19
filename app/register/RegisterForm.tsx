"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerAction } from "@/app/actions/auth";
import { uz } from "@/lib/strings/uz";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

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

export function RegisterForm({ schools }: Props) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "+998",
      password: "",
      schoolId: "",
      classId: "",
    },
  });

  const selectedSchoolId = form.watch("schoolId");

  // Maktab tanlanganida sinflarni yuklash
  useEffect(() => {
    if (!selectedSchoolId) {
      setClasses([]);
      form.setValue("classId", "");
      return;
    }

    setLoadingClasses(true);
    const supabase = createClient();
    supabase
      .from("classes")
      .select("id, grade, letter")
      .eq("school_id", selectedSchoolId)
      .order("grade")
      .order("letter")
      .then(({ data }) => {
        setClasses(data ?? []);
        setLoadingClasses(false);
      });
  }, [selectedSchoolId, form]);

  function onSubmit(values: RegisterInput) {
    setServerError(null);
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(values).forEach(([k, v]) => formData.set(k, String(v)));

      const result = await registerAction(formData);
      if (result?.error) {
        setServerError(result.error);
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate aria-label={uz.auth.register}>
          <CardContent className="pt-6 space-y-4">
            {serverError && (
              <div
                role="alert"
                aria-live="assertive"
                className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive"
              >
                {serverError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{uz.auth.firstName}</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="given-name"
                        aria-required="true"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{uz.auth.lastName}</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="family-name"
                        aria-required="true"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{uz.auth.phone}</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder={uz.auth.phonePlaceholder}
                      aria-required="true"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{uz.auth.password}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder={uz.auth.passwordPlaceholder}
                      aria-required="true"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="schoolId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{uz.auth.school}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger aria-required="true">
                        <SelectValue placeholder={uz.auth.schoolPlaceholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {schools.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{uz.auth.class}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedSchoolId || loadingClasses}
                  >
                    <FormControl>
                      <SelectTrigger aria-required="true">
                        <SelectValue
                          placeholder={
                            loadingClasses
                              ? uz.common.loading
                              : uz.auth.classPlaceholder
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.grade}-sinf {c.letter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
              aria-busy={isPending}
            >
              {isPending ? uz.common.loading : uz.auth.register}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              {uz.auth.haveAccount}{" "}
              <Link
                href="/login"
                className="font-medium text-primary underline underline-offset-4 hover:no-underline"
              >
                {uz.auth.login}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
