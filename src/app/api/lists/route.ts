import { randomUUID } from "crypto";

import { fail, ok } from "@/lib/api/response";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { z } from "zod";

const createSchema = z.object({
  entity_type: z.enum(["ip", "device", "user", "card_bin", "email", "email_domain"]),
  entity_value: z.string().min(1),
  list_type: z.enum(["whitelist", "blacklist"]),
  reason: z.string().optional().nullable(),
  expires_at: z.string().datetime().optional().nullable(),
});

export async function GET() {
  const supabase = createServiceRoleClient();
  if (!supabase) return fail("Service unavailable.", 503);

  const { data, error } = await supabase
    .from("whitelists_blacklists")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return fail(error.message, 500);
  return ok(data);
}

export async function POST(request: Request) {
  const supabase = createServiceRoleClient();
  if (!supabase) return fail("Service unavailable.", 503);

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid payload.", 422, { issues: parsed.error.flatten() });

  const { data, error } = await supabase
    .from("whitelists_blacklists")
    .insert({
      id: randomUUID(),
      entity_type: parsed.data.entity_type,
      entity_value: parsed.data.entity_value,
      list_type: parsed.data.list_type,
      reason: parsed.data.reason ?? null,
      expires_at: parsed.data.expires_at ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return fail("This entry already exists in the list.", 409);
    return fail(error.message, 500);
  }
  return ok(data, undefined, 201);
}
