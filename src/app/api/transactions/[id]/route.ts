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
    .select("*, risk_scores(*), merchants(name)")
    .eq("id", id)
    .maybeSingle();

  if (error) return fail(error.message, 500);
  if (!data) return fail("Transaction not found.", 404);
  return ok(data);
}
