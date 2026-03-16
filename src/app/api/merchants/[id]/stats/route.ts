import { fail, ok } from "@/lib/api/response";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = createServiceRoleClient();
  if (!supabase) return fail("Service unavailable.", 503);

  const { id } = await params;

  const { data, error } = await supabase
    .from("transactions")
    .select("status, risk_level, amount")
    .eq("merchant_id", id);

  if (error) return fail(error.message, 500);

  const total = data.length;
  const approved = data.filter((t) => t.status === "approved").length;
  const declined = data.filter((t) => t.status === "declined").length;
  const review = data.filter((t) => t.status === "review").length;
  const totalVolume = data.reduce((sum, t) => sum + (t.amount ?? 0), 0);
  const highRisk = data.filter((t) => t.risk_level === "high" || t.risk_level === "critical").length;

  return ok({ total, approved, declined, review, totalVolume, highRisk });
}
