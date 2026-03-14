import { fail, ok } from "@/lib/api/response";
import { createServiceRoleClient } from "@/lib/supabase/server";

interface IdentityVerificationPayload {
  userAccountId: string;
  method: "document" | "biometric" | "kyc_database";
  provider?: string;
  referenceId?: string;
  status?: "pending" | "passed" | "failed" | "manual_review";
  details?: Record<string, unknown>;
}

export async function GET() {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return ok([]);
  }

  const { data, error } = await supabase
    .from("identity_verifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

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

  const body = (await request.json()) as IdentityVerificationPayload;

  if (!body.userAccountId || !body.method) {
    return fail("userAccountId and method are required.", 422);
  }

  const { data, error } = await supabase
    .from("identity_verifications")
    .insert({
      user_account_id: body.userAccountId,
      method: body.method,
      provider: body.provider ?? null,
      reference_id: body.referenceId ?? null,
      status: body.status ?? "pending",
      details: body.details ?? {},
    })
    .select()
    .maybeSingle();

  if (error) {
    return fail(error.message, 500);
  }

  return ok(data);
}


