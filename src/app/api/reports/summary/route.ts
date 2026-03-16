import { fail, ok } from "@/lib/api/response";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceRoleClient();
  if (!supabase) return fail("Service unavailable.", 503);

  const [txnResult, caseResult, scoreResult] = await Promise.all([
    supabase.from("transactions").select("status, risk_score, risk_level, created_at"),
    supabase.from("fraud_cases").select("status, priority"),
    supabase.from("risk_scores").select("explanation").limit(500),
  ]);

  if (txnResult.error) return fail(txnResult.error.message, 500);

  const all = txnResult.data ?? [];
  const allCases = caseResult.data ?? [];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const totalToday = all.filter((t) => new Date(t.created_at) >= todayStart).length;
  const declined = all.filter((t) => t.status === "declined").length;
  const reviewCount = all.filter((t) => t.status === "review").length;
  const fraudRate = all.length > 0 ? +((declined / all.length) * 100).toFixed(1) : 0;
  const avgRisk =
    all.length > 0
      ? Math.round(all.reduce((s, t) => s + (t.risk_score ?? 0), 0) / all.length)
      : 0;
  const fpCount = allCases.filter((c) => c.status === "false_positive").length;
  const falsePositiveRate =
    allCases.length > 0 ? +((fpCount / allCases.length) * 100).toFixed(1) : 0;

  const distribution = ["low", "medium", "high", "critical"].map((level) => ({
    level,
    value: all.filter((t) => t.risk_level === level).length,
  }));

  const now = Date.now();
  const volume = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now - (13 - i) * 86_400_000);
    const dayStr = d.toISOString().slice(0, 10);
    const dayTxns = all.filter((t) => t.created_at.slice(0, 10) === dayStr);
    const dayDeclined = dayTxns.filter((t) => t.status === "declined").length;
    return {
      day: dayStr.slice(5),
      volume: dayTxns.length,
      fraudRate: dayTxns.length > 0 ? +((dayDeclined / dayTxns.length) * 100).toFixed(1) : 0,
    };
  });

  const ruleHitMap = new Map<string, number>();
  for (const score of scoreResult.data ?? []) {
    const rules = (score.explanation as Record<string, unknown>)?.triggeredRules;
    if (Array.isArray(rules)) {
      for (const rule of rules) {
        const name = String(rule);
        ruleHitMap.set(name, (ruleHitMap.get(name) ?? 0) + 1);
      }
    }
  }
  const topRules = Array.from(ruleHitMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, hits]) => ({ name, hits }));

  return ok({
    summary: { totalToday, fraudRate, reviewCount, avgRisk, falsePositiveRate },
    distribution,
    volume,
    topRules,
  });
}
