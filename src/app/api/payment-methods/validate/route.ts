import { fail, ok } from "@/lib/api/response";
import { createServiceRoleClient } from "@/lib/supabase/server";

interface PaymentValidationPayload {
  bin?: string | null;
  last4?: string | null;
  scheme?: string | null;
}

export async function POST(request: Request) {
  const body = (await request.json()) as PaymentValidationPayload;

  if (!body.bin && !body.last4) {
    return fail("At least bin or last4 is required.", 422);
  }

  const supabase = createServiceRoleClient();

  if (!supabase || !body.bin) {
    // Heuristic-only fallback
    const highRisk =
      (body.bin ?? "").startsWith("000") || (body.bin ?? "").startsWith("999");

    return ok({
      verified: !highRisk,
      riskLevel: highRisk ? "high" : "low",
      source: supabase ? "heuristic" : "demo",
    });
  }

  const { data, error } = await supabase
    .from("payment_method_validations")
    .select("*")
    .eq("bin_prefix", body.bin)
    .maybeSingle();

  if (error) {
    return fail(error.message, 500);
  }

  if (!data) {
    return ok({
      verified: true,
      riskLevel: "low",
      source: "unknown_bin",
    });
  }

  return ok({
    verified: !data.is_blocked,
    riskLevel: data.is_blocked ? "high" : data.risk_level ?? "medium",
    scheme: data.scheme,
    issuerCountry: data.issuer_country,
    source: "validation_table",
  });
}


