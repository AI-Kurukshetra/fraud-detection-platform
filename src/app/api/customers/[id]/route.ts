import { fail, ok } from "@/lib/api/response";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = createServiceRoleClient();
  if (!supabase) return fail("Service unavailable.", 503);

  const { id } = await params;
  const userId = decodeURIComponent(id);

  // Fetch all transactions for this user
  const { data: txns, error } = await supabase
    .from("transactions")
    .select("*, risk_scores(overall_score, velocity_score, device_score, geo_score, behavioral_score, rule_score, ml_score, explanation)")
    .eq("user_account_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return fail(error.message, 500);

  // Fraud cases for this user's transactions
  const txnIds = (txns ?? []).map((t) => t.id as string);
  let cases: unknown[] = [];
  if (txnIds.length > 0) {
    const { data: casesData } = await supabase
      .from("fraud_cases")
      .select("*")
      .in("transaction_id", txnIds)
      .order("created_at", { ascending: false });
    cases = casesData ?? [];
  }

  return ok({ transactions: txns ?? [], cases });
}
