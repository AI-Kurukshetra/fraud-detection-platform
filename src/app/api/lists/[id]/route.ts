import { fail, ok } from "@/lib/api/response";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createServiceRoleClient();
  if (!supabase) return fail("Service unavailable.", 503);

  const { id } = await params;
  const { error } = await supabase.from("whitelists_blacklists").delete().eq("id", id);

  if (error) return fail(error.message, 500);
  return ok({ id });
}
