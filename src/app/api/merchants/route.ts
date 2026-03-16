import { randomUUID } from "crypto";

import { fail, ok } from "@/lib/api/response";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  webhook_url: z.string().url().optional().nullable(),
});

export async function GET() {
  const supabase = createServiceRoleClient();
  if (!supabase) return fail("Service unavailable.", 503);

  const { data, error } = await supabase
    .from("merchants")
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

  const apiKey = `mk_live_${randomUUID().replace(/-/g, "")}`;

  const { data, error } = await supabase
    .from("merchants")
    .insert({
      id: randomUUID(),
      name: parsed.data.name,
      api_key_hash: apiKey,
      webhook_url: parsed.data.webhook_url ?? null,
      status: "active",
    })
    .select()
    .single();

  if (error) return fail(error.message, 500);
  return ok(data, undefined, 201);
}
