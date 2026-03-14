import { fail, ok } from "@/lib/api/response";
import { demoCases, demoDevices, demoTransactions } from "@/lib/demo/data";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { caseUpdateSchema } from "@/lib/validation/schemas";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = createServiceRoleClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("fraud_cases")
      .select("*, transactions(*), users!fraud_cases_assigned_to_fkey(*)")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return fail(error.message, 500);
    }
    if (!data) {
      return fail("Case not found.", 404);
    }

    return ok(data);
  }

  const fraudCase = demoCases.find((item) => item.id === id);
  if (!fraudCase) {
    return fail("Case not found.", 404);
  }

  const transaction = demoTransactions.find((item) => item.id === fraudCase.transaction_id) ?? null;
  const device = demoDevices.find((item) => item.id === transaction?.device_id) ?? null;

  return ok({
    ...fraudCase,
    transaction,
    device,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = caseUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Invalid case update payload.", 422, { issues: parsed.error.flatten() });
  }

  const supabase = createServiceRoleClient();
  if (supabase) {
    const nextNotes = parsed.data.note
      ? [
          {
            by: "system",
            message: parsed.data.note,
            at: new Date().toISOString(),
          },
        ]
      : undefined;

    const { data: current } = await supabase
      .from("fraud_cases")
      .select("notes")
      .eq("id", id)
      .maybeSingle();

    const { data, error } = await supabase
      .from("fraud_cases")
      .update({
        status: parsed.data.status,
        assigned_to: parsed.data.assignedTo,
        priority: parsed.data.priority,
        notes: nextNotes ? [...((current?.notes as unknown[]) ?? []), ...nextNotes] : current?.notes,
      })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      return fail(error.message, 500);
    }

    return ok(data);
  }

  return ok({
    id,
    ...parsed.data,
  });
}
