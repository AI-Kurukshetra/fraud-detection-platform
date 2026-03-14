import { ok } from "@/lib/api/response";
import { getRuleHits, getSummary, getTransactionDistribution, getVolumeSeries } from "@/lib/demo/data";

export async function GET() {
  return ok({
    summary: getSummary(),
    distribution: getTransactionDistribution(),
    volume: getVolumeSeries(),
    topRules: getRuleHits(),
  });
}
