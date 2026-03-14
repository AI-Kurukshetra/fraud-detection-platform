import { fail, ok } from "@/lib/api/response";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return ok([]);
  }

  const { data, error } = await supabase
    .from("compliance_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

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
    reportType: "pci_dss" | "gdpr" | "sox" | "regional";
    periodStart: string;
    periodEnd: string;
    storageUrl?: string;
    metadata?: Record<string, unknown>;
  };

  if (!body.reportType || !body.periodStart || !body.periodEnd) {
    return fail("reportType, periodStart and periodEnd are required.", 422);
  }

  const { data, error } = await supabase
    .from("compliance_reports")
    .insert({
      report_type: body.reportType,
      period_start: body.periodStart,
      period_end: body.periodEnd,
      storage_url: body.storageUrl ?? null,
      metadata: body.metadata ?? {},
    })
    .select()
    .maybeSingle();

  if (error) {
    return fail(error.message, 500);
  }

  return ok(data);
}


