import { AlertTriangle, ClipboardList, CreditCard, PercentCircle } from "lucide-react";

import { RuleHitsChart, RiskDistributionChart, VolumeChart } from "@/components/dashboard/charts";
import { TransactionsTable } from "@/components/dashboard/data-table";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  demoCases,
  demoMerchants,
  demoTransactions,
  getRuleHits,
  getSummary,
  getTransactionDistribution,
  getVolumeSeries,
} from "@/lib/demo/data";

export default function DashboardOverviewPage() {
  const summary = getSummary();
  const transactions = demoTransactions.slice(0, 5).map((transaction) => ({
    id: transaction.external_transaction_id,
    merchant: demoMerchants.find((merchant) => merchant.id === transaction.merchant_id)?.name ?? "Unknown",
    amount: transaction.amount,
    currency: transaction.currency,
    riskLevel: transaction.risk_level,
    status: transaction.status,
    createdAt: transaction.created_at,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="Transactions today" value={String(summary.totalToday)} change="+18% vs yesterday" icon={CreditCard} />
        <MetricCard title="Fraud rate" value={`${summary.fraudRate}%`} change="+2.4%" icon={PercentCircle} />
        <MetricCard title="In review" value={String(summary.reviewCount)} change="Queue stable" icon={ClipboardList} />
        <MetricCard title="Average risk score" value={String(summary.avgRisk)} change="+5 pts" icon={AlertTriangle} />
        <MetricCard title="False positive rate" value={`${summary.falsePositiveRate}%`} change="-1.1%" direction="down" icon={PercentCircle} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
        <RiskDistributionChart data={getTransactionDistribution()} />
        <VolumeChart data={getVolumeSeries()} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <TransactionsTable title="Recent high-risk transactions" rows={transactions} />
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Open cases summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["critical", "high", "medium", "low"].map((priority) => {
                const count = demoCases.filter((item) => item.priority === priority).length;
                return (
                  <div key={priority} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <span className="text-sm font-medium capitalize text-slate-700">{priority}</span>
                    <span className="text-lg font-semibold text-slate-950">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <RuleHitsChart data={getRuleHits()} />
        </div>
      </div>
    </div>
  );
}
