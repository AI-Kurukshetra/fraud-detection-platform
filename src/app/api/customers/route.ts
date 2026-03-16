import { fail, ok } from "@/lib/api/response";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = createServiceRoleClient();
  if (!supabase) return fail("Service unavailable.", 503);

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  // Aggregate per user_account_id from transactions
  let query = supabase
    .from("transactions")
    .select(
      "user_account_id, risk_score, risk_level, status, amount, created_at, ip_address, billing_country",
    )
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("user_account_id", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) return fail(error.message, 500);

  // Group by user_account_id
  const map = new Map<
    string,
    {
      user_account_id: string;
      total_transactions: number;
      avg_risk_score: number;
      max_risk_score: number;
      risk_level: string;
      total_amount: number;
      declined_count: number;
      review_count: number;
      countries: Set<string>;
      ips: Set<string>;
      last_seen: string;
      first_seen: string;
    }
  >();

  for (const t of data ?? []) {
    const uid = t.user_account_id as string;
    if (!map.has(uid)) {
      map.set(uid, {
        user_account_id: uid,
        total_transactions: 0,
        avg_risk_score: 0,
        max_risk_score: 0,
        risk_level: "low",
        total_amount: 0,
        declined_count: 0,
        review_count: 0,
        countries: new Set(),
        ips: new Set(),
        last_seen: t.created_at as string,
        first_seen: t.created_at as string,
      });
    }
    const entry = map.get(uid)!;
    entry.total_transactions += 1;
    entry.total_amount += t.amount as number;
    entry.avg_risk_score =
      (entry.avg_risk_score * (entry.total_transactions - 1) + (t.risk_score as number)) /
      entry.total_transactions;
    entry.max_risk_score = Math.max(entry.max_risk_score, t.risk_score as number);
    if (t.status === "declined") entry.declined_count += 1;
    if (t.status === "review") entry.review_count += 1;
    if (t.billing_country) entry.countries.add(t.billing_country as string);
    if (t.ip_address) entry.ips.add(t.ip_address as string);
    if (t.created_at < entry.first_seen) entry.first_seen = t.created_at as string;
    if (t.created_at > entry.last_seen) entry.last_seen = t.created_at as string;
  }

  // Assign risk level based on max risk score
  const riskLevelFor = (score: number) => {
    if (score >= 80) return "critical";
    if (score >= 60) return "high";
    if (score >= 35) return "medium";
    return "low";
  };

  const customers = Array.from(map.values())
    .map((c) => ({
      user_account_id: c.user_account_id,
      total_transactions: c.total_transactions,
      avg_risk_score: Math.round(c.avg_risk_score),
      max_risk_score: Math.round(c.max_risk_score),
      risk_level: riskLevelFor(c.max_risk_score),
      total_amount: c.total_amount,
      declined_count: c.declined_count,
      review_count: c.review_count,
      country_count: c.countries.size,
      countries: Array.from(c.countries),
      ip_count: c.ips.size,
      last_seen: c.last_seen,
      first_seen: c.first_seen,
    }))
    .sort((a, b) => b.max_risk_score - a.max_risk_score);

  const total = customers.length;
  const paginated = customers.slice(offset, offset + limit);

  return ok(paginated, { total, page, limit });
}
