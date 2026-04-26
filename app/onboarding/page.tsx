export const dynamic = "force-dynamic";

import { apiGet } from "@/lib/api/server";
import { OnboardingFlow } from "./OnboardingFlow";

const ONBOARDING_TEST_ID = "10000000-0000-0000-0000-000000000001";

export default async function OnboardingPage() {
  const rawTest = await apiGet<{ id: string; title: string; description: string | null; time_limit: number | null } | null>(
    `/tests/${ONBOARDING_TEST_ID}`
  ).catch(() => null);

  const test = rawTest
    ? { ...rawTest, description: rawTest.description ?? "", time_limit: rawTest.time_limit ?? 0 }
    : null;

  return <OnboardingFlow test={test} questions={[]} />;
}
