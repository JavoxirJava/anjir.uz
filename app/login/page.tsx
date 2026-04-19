import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { uz } from "@/lib/strings/uz";

export const metadata: Metadata = {
  title: `${uz.auth.login} — Anjir.uz`,
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Anjir.uz
          </h1>
          <p className="mt-2 text-muted-foreground">
            {uz.auth.login}
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
