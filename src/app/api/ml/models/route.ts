import { fail, ok } from "@/lib/api/response";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return ok([]);
  }

  const { data, error } = await supabase
    .from("ml_models")
    .select("id, name, provider, description, created_at");

  if (error) {
    return fail(error.message, 500);
  }

  return ok(data);
}

export async function POST(request: Request) {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return fail("Supabase is not configured.", 500);
  }

  const body = (await request.json()) as {
    name?: string;
    provider?: string;
    description?: string | null;
  };

  if (!body.name || !body.provider) {
    return fail("name and provider are required.", 422);
  }

  const { data, error } = await supabase
    .from("ml_models")
    .insert({
      name: body.name,
      provider: body.provider,
      description: body.description ?? null,
    })
    .select()
    .maybeSingle();

  if (error) {
    return fail(error.message, 500);
  }

  return ok(data);
}


