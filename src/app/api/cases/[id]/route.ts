import { fail, ok } from "@/lib/api/response";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { caseUpdateSchema } from "@/lib/validation/schemas";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = createServiceRoleClient();
  if (!supabase) return fail("Service unavailable.", 503);

  const { id } = await params;
  const { data, error } = await supabase
    .from("fraud_cases")
    .select("*, transactions(*, devices(*)), users!fraud_cases_assigned_to_fkey(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) return fail(error.message, 500);
  if (!data) return fail("Case not found.", 404);
  return ok(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = createServiceRoleClient();
  if (!supabase) return fail("Service unavailable.", 503);

  const { id } = await params;
  const body = await request.json();
  const parsed = caseUpdateSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid case update payload.", 422, { issues: parsed.error.flatten() });

  const { data: current } = await supabase
    .from("fraud_cases")
    .select("notes")
    .eq("id", id)
    .maybeSingle();

  const nextNotes = parsed.data.note
    ? [
        ...(Array.isArray(current?.notes) ? current.notes : []),
        { by: "analyst", message: parsed.data.note, at: new Date().toISOString() },
      ]
    : current?.notes;

  const { data, error } = await supabase
    .from("fraud_cases")
    .update({
      status: parsed.data.status,
      assigned_to: parsed.data.assignedTo,
      priority: parsed.data.priority,
      notes: nextNotes,
    })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) return fail(error.message, 500);
  return ok(data);
}
