"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ClipboardList, CreditCard, PercentCircle } from "lucide-react";

import { RuleHitsChart, RiskDistributionChart, VolumeChart } from "@/components/dashboard/charts";
import { TransactionsTable } from "@/components/dashboard/data-table";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Summary {
  totalToday: number;
  fraudRate: number;
  reviewCount: number;
  avgRisk: number;
  falsePositiveRate: number;
}

interface ReportData {
  summary: Summary;
  distribution: Array<{ level: string; value: number }>;
  volume: Array<{ day: string; volume: number; fraudRate: number }>;
  topRules: Array<{ name: string; hits: number }>;
}

interface TxnRow {
  id: string;
  external_transaction_id: string;
  amount: number;
  currency: string;
  risk_level: string;
  status: string;
  created_at: string;
  merchants: { name: string } | null;
}

export default function DashboardOverviewPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [recentTxns, setRecentTxns] = useState<TxnRow[]>([]);
  const [cases, setCases] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/reports/summary")
      .then((r) => r.json())
      .then((j) => { if (j.success) setReport(j.data); });

    fetch("/api/transactions?limit=5")
      .then((r) => r.json())
      .then((j) => { if (j.success) setRecentTxns(j.data ?? []); });

    fetch("/api/cases")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data) {
          const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
          for (const c of j.data) counts[c.priority] = (counts[c.priority] ?? 0) + 1;
          setCases(counts);
        }
      });
  }, []);

  const summary = report?.summary;
  const rows = recentTxns.map((t) => ({
    id: t.external_transaction_id,
    merchant: t.merchants?.name ?? "Unknown",
    amount: t.amount,
    currency: t.currency,
    riskLevel: t.risk_level as "low" | "medium" | "high" | "critical",
    status: t.status as "approved" | "declined" | "review",
    createdAt: t.created_at,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="Transactions today" value={String(summary?.totalToday ?? "—")} change="+18% vs yesterday" icon={CreditCard} />
        <MetricCard title="Fraud rate" value={summary ? `${summary.fraudRate}%` : "—"} change="+2.4%" icon={PercentCircle} />
        <MetricCard title="In review" value={String(summary?.reviewCount ?? "—")} change="Queue stable" icon={ClipboardList} />
        <MetricCard title="Average risk score" value={String(summary?.avgRisk ?? "—")} change="+5 pts" icon={AlertTriangle} />
        <MetricCard title="False positive rate" value={summary ? `${summary.falsePositiveRate}%` : "—"} change="-1.1%" direction="down" icon={PercentCircle} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
        <RiskDistributionChart data={report?.distribution ?? []} />
        <VolumeChart data={report?.volume ?? []} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <TransactionsTable title="Recent high-risk transactions" rows={rows} />
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Open cases summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["critical", "high", "medium", "low"].map((priority) => (
                <div key={priority} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium capitalize text-slate-700">{priority}</span>
                  <span className="text-lg font-semibold text-slate-950">{cases[priority] ?? 0}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <RuleHitsChart data={report?.topRules ?? []} />
        </div>
      </div>
    </div>
  );
}
