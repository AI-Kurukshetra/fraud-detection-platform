import { fail, ok } from "@/lib/api/response";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = createServiceRoleClient();
  if (!supabase) return fail("Service unavailable.", 503);

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const priority = url.searchParams.get("priority");
  const assignedTo = url.searchParams.get("assignedTo");

  let query = supabase
    .from("fraud_cases")
    .select("*, transactions(external_transaction_id, amount, currency, status, risk_score, risk_level)")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);
  if (assignedTo) query = query.eq("assigned_to", assignedTo);

  const { data, error } = await query;
  if (error) return fail(error.message, 500);
  return ok(data);
}
