import { randomUUID } from "crypto";
import { headers } from "next/headers";

import { authenticateMerchant } from "@/lib/api/auth";
import { enforceRateLimit } from "@/lib/api/rate-limit";
import { fail, ok } from "@/lib/api/response";
import { inferCasePriority, inferCaseStatus, makeTransactionResponse } from "@/lib/demo/data";
import { scoreTransaction } from "@/lib/scoring/engine";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { transactionSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const merchant = await authenticateMerchant();
  if (!merchant) {
    return fail("Invalid or missing merchant API key.", 401);
  }

  const requestHeaders = await headers();
  const rate = enforceRateLimit(
    requestHeaders.get("x-forwarded-for") ?? requestHeaders.get("x-real-ip") ?? merchant.id,
    100,
    60_000,
  );

  if (!rate.allowed) {
    return fail("Rate limit exceeded.", 429, { resetAt: rate.resetAt });
  }

  const body = await request.json();
  const parsed = transactionSchema.safeParse({
    ...body,
    merchantId: merchant.id,
  });
  if (!parsed.success) {
    return fail("Invalid transaction payload.", 422, { issues: parsed.error.flatten() });
  }

  const result = await scoreTransaction(parsed.data);
  const supabase = createServiceRoleClient();

  if (supabase) {
    const transactionId = randomUUID();
    await supabase.from("transactions").insert({
      id: transactionId,
      merchant_id: merchant.id,
      external_transaction_id: parsed.data.externalTransactionId,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      payment_method_type: parsed.data.paymentMethodType,
      card_bin: parsed.data.cardBin ?? null,
      card_last4: parsed.data.cardLast4 ?? null,
      billing_country: parsed.data.billingCountry ?? null,
      shipping_country: parsed.data.shippingCountry ?? null,
      ip_address: parsed.data.ipAddress,
      device_id: parsed.data.deviceId ?? null,
      user_account_id: parsed.data.userAccountId,
      channel: parsed.data.channel ?? "web",
      risk_score: result.overallScore,
      risk_level: result.riskLevel,
      status: result.decision,
      metadata: parsed.data.metadata ?? {},
      scored_at: new Date().toISOString(),
    });

    await supabase.from("risk_scores").insert({
      transaction_id: transactionId,
      overall_score: result.overallScore,
      velocity_score: result.breakdown.velocityScore,
      device_score: result.breakdown.deviceScore,
      geo_score: result.breakdown.geoScore,
      behavioral_score: result.breakdown.behavioralScore,
      rule_score: result.breakdown.ruleScore,
      ml_score: result.breakdown.mlScore,
      explanation: {
        reasons: result.reasons,
        triggeredRules: result.triggeredRules,
      },
    });

    if (result.decision !== "approved") {
      await supabase.from("fraud_cases").insert({
        transaction_id: transactionId,
        status: inferCaseStatus(result.decision),
        priority: inferCasePriority(result.overallScore),
        notes: [
          {
            by: "system",
            message: `Auto-created from ${result.decision} decision.`,
            at: new Date().toISOString(),
          },
        ],
      });
    }

    if (result.decision === "declined" || result.overallScore > 75) {
      await supabase.from("alerts").insert({
        type: result.decision === "declined" ? "transaction_declined" : "risk_threshold_exceeded",
        severity: result.overallScore > 75 ? "critical" : "warning",
        title: "High-risk transaction scored",
        message: `Transaction ${parsed.data.externalTransactionId} scored ${result.overallScore}.`,
        transaction_id: transactionId,
      });
    }
  }

  return ok(makeTransactionResponse(result, parsed.data).data, {
    merchantId: merchant.id,
    rateLimitRemaining: rate.remaining,
  });
}
