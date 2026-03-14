import { fail, ok } from "@/lib/api/response";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { webhookSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = webhookSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Invalid webhook payload.", 422, { issues: parsed.error.flatten() });
  }

  const supabase = createServiceRoleClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("merchants")
      .update({ webhook_url: parsed.data.webhookUrl })
      .eq("id", parsed.data.merchantId)
      .select()
      .maybeSingle();

    if (error) {
      return fail(error.message, 500);
    }

    return ok(data);
  }

  return ok({
    merchantId: parsed.data.merchantId,
    webhookUrl: parsed.data.webhookUrl,
  });
}
