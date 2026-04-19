"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { loginAction } from "@/app/actions/auth";
import { uz } from "@/lib/strings/uz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "+998",
      password: "",
      rememberMe: false,
    },
  });

  function onSubmit(values: LoginInput) {
    setServerError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("phone", values.phone);
      formData.set("password", values.password);
      if (values.rememberMe) formData.set("rememberMe", "on");

      const result = await loginAction(formData);
      if (result?.error) {
        setServerError(result.error);
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate aria-label={uz.auth.login}>
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

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="phone">{uz.auth.phone}</FormLabel>
                  <FormControl>
                    <Input
                      id="phone"
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
                  <FormLabel htmlFor="password">{uz.auth.password}</FormLabel>
                  <FormControl>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
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
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      id="rememberMe"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <Label htmlFor="rememberMe" className="cursor-pointer font-normal">
                    {uz.auth.rememberMe}
                  </Label>
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
              {isPending ? uz.common.loading : uz.auth.login}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              {uz.auth.noAccount}{" "}
              <Link
                href="/register"
                className="font-medium text-primary underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {uz.auth.register}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
