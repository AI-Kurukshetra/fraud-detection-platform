import { fail, ok } from "@/lib/api/response";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceRoleClient();
  if (!supabase) return fail("Service unavailable.", 503);

  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return fail(error.message, 500);
  return ok(data);
}

export async function PATCH(request: Request) {
  const supabase = createServiceRoleClient();
  if (!supabase) return fail("Service unavailable.", 503);

  const body = (await request.json()) as { id?: string; isRead?: boolean };
  if (!body.id) return fail("Alert id is required.", 422);

  const { data, error } = await supabase
    .from("alerts")
    .update({ is_read: body.isRead ?? true })
    .eq("id", body.id)
    .select()
    .maybeSingle();

  if (error) return fail(error.message, 500);
  return ok(data);
}
