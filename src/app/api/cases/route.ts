import { demoCases } from "@/lib/demo/data";
import { fail, ok } from "@/lib/api/response";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const priority = url.searchParams.get("priority");
  const assignedTo = url.searchParams.get("assignedTo");
  const supabase = createServiceRoleClient();

  if (supabase) {
    let query = supabase
      .from("fraud_cases")
      .select("*, transactions(*)")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    if (priority) query = query.eq("priority", priority);
    if (assignedTo) query = query.eq("assigned_to", assignedTo);

    const { data, error } = await query;

    if (error) {
      return fail(error.message, 500);
    }

    return ok(data);
  }

  return ok(
    demoCases.filter(
      (item) =>
        (!status || item.status === status) &&
        (!priority || item.priority === priority) &&
        (!assignedTo || item.assigned_to === assignedTo),
    ),
  );
}
