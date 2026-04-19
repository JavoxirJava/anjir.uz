import type { Metadata } from "next";
import { uz } from "@/lib/strings/uz";
import { SensorScreening } from "./SensorScreening";

export const metadata: Metadata = {
  title: `${uz.a11y.screeningTitle} — Anjir.uz`,
};

export default function OnboardingPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <SensorScreening />
    </div>
  );
}
