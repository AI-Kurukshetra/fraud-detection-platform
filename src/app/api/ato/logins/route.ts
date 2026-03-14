import { fail, ok } from "@/lib/api/response";
import { createServiceRoleClient } from "@/lib/supabase/server";

interface LoginEventPayload {
  userId?: string;
  userAccountId?: string;
  ipAddress: string;
  deviceId?: string;
  userAgent?: string;
  country?: string;
  city?: string;
  success?: boolean;
  riskScore?: number;
}

export async function POST(request: Request) {
  const body = (await request.json()) as LoginEventPayload;

  if (!body.ipAddress) {
    return fail("ipAddress is required.", 422);
  }

  const supabase = createServiceRoleClient();

  if (!supabase) {
    return ok({
      stored: false,
      reason: "Supabase is not configured; login event accepted in demo mode only.",
    });
  }

  const { error } = await supabase.from("login_events").insert({
    user_id: body.userId ?? null,
    user_account_id: body.userAccountId ?? null,
    ip_address: body.ipAddress,
    device_id: body.deviceId ?? null,
    user_agent: body.userAgent ?? null,
    country: body.country ?? null,
    city: body.city ?? null,
    success: body.success ?? true,
    risk_score: body.riskScore ?? 0,
  });

  if (error) {
    return fail(error.message, 500);
  }

  return ok({ stored: true });
}


