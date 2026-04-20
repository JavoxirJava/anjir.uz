"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function OnboardingRedirect() {
  const router = useRouter();
  useEffect(() => {
    const done = localStorage.getItem("anjir_onboarding");
    if (!done) {
      router.replace("/app/onboarding");
    }
  }, [router]);
  return null;
}
