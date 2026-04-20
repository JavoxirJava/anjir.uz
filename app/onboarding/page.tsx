export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { OnboardingFlow } from "./OnboardingFlow";

export default async function OnboardingPage() {
  const admin = createAdminClient();

  // Kirish testini va savollarni ol
  const { data: test } = await admin
    .from("tests")
    .select("id, title, description, time_limit")
    .eq("id", "10000000-0000-0000-0000-000000000001")
    .single();

  const { data: questions } = await admin
    .from("questions")
    .select("id, question_text, question_type, points, order, question_options(id, option_text, is_correct)")
    .eq("test_id", "10000000-0000-0000-0000-000000000001")
    .order("order");

  return <OnboardingFlow test={test} questions={questions ?? []} />;
}
