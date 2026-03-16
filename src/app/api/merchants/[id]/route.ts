import { fail, ok } from "@/lib/api/response";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { z } from "zod";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  webhook_url: z.string().url().optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = createServiceRoleClient();
  if (!supabase) return fail("Service unavailable.", 503);

  const { id } = await params;
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid payload.", 422, { issues: parsed.error.flatten() });

  const { data, error } = await supabase
    .from("merchants")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) return fail(error.message, 500);
  return ok(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = createServiceRoleClient();
  if (!supabase) return fail("Service unavailable.", 503);

  const { id } = await params;
  const { error } = await supabase.from("merchants").delete().eq("id", id);

  if (error) return fail(error.message, 500);
  return ok({ id });
}
