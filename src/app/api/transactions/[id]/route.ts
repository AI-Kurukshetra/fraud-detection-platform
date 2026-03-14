import { demoTransactions } from "@/lib/demo/data";
import { fail, ok } from "@/lib/api/response";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("transactions")
      .select("*, risk_scores(*)")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return fail(error.message, 500);
    }

    if (!data) {
      return fail("Transaction not found.", 404);
    }

    return ok(data);
  }

  const transaction =
    demoTransactions.find((item) => item.id === id || item.external_transaction_id === id) ?? null;
  if (!transaction) {
    return fail("Transaction not found.", 404);
  }

  return ok(transaction);
}
