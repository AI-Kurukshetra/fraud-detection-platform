import { randomUUID } from "crypto";

import { fail, ok } from "@/lib/api/response";
import { demoRules } from "@/lib/demo/data";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { ruleSchema } from "@/lib/validation/schemas";

export async function GET() {
  const supabase = createServiceRoleClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("risk_rules")
      .select("*")
      .order("priority", { ascending: true });

    if (error) {
      return fail(error.message, 500);
    }

    return ok(data);
  }

  return ok(demoRules);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = ruleSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Invalid rule payload.", 422, { issues: parsed.error.flatten() });
  }

  const supabase = createServiceRoleClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("risk_rules")
      .insert({
        id: randomUUID(),
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        condition: parsed.data.condition,
        action: parsed.data.action,
        score_impact: parsed.data.scoreImpact,
        is_active: parsed.data.isActive,
        priority: parsed.data.priority,
      })
      .select()
      .maybeSingle();

    if (error) {
      return fail(error.message, 500);
    }

    return ok(data);
  }

  return ok({
    id: randomUUID(),
    ...parsed.data,
  });
}
