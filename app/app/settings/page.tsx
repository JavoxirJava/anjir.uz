import type { Metadata } from "next";
import { uz } from "@/lib/strings/uz";
import { AccessibilitySettingsPanel } from "./AccessibilitySettingsPanel";

export const metadata: Metadata = {
  title: `${uz.a11y.accessibilitySettings} — I-Imkon.uz`,
};

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{uz.a11y.accessibilitySettings}</h1>
      <AccessibilitySettingsPanel />
    </div>
  );
}
