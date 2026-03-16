"use client";

import { useEffect, useState } from "react";
import { RuleHitsChart, RiskDistributionChart, VolumeChart } from "@/components/dashboard/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportData {
  summary: {
    totalToday: number;
    fraudRate: number;
    reviewCount: number;
    avgRisk: number;
    falsePositiveRate: number;
  };
  distribution: Array<{ level: string; value: number }>;
  volume: Array<{ day: string; volume: number; fraudRate: number }>;
  topRules: Array<{ name: string; hits: number }>;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/summary")
      .then((r) => r.json())
      .then((j) => { if (j.success) setData(j.data); })
      .finally(() => setLoading(false));
  }, []);

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Reports</h2>
        <p className="text-sm text-slate-500">
          Live operational and compliance reporting from Supabase.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading report data...</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              { label: "Transactions today", value: summary?.totalToday ?? 0 },
              { label: "Fraud rate", value: `${summary?.fraudRate ?? 0}%` },
              { label: "In review", value: summary?.reviewCount ?? 0 },
              { label: "Average risk score", value: summary?.avgRisk ?? 0 },
              { label: "False positive rate", value: `${summary?.falsePositiveRate ?? 0}%` },
            ].map((item) => (
              <Card key={item.label}>
                <CardHeader>
                  <CardTitle className="text-sm text-slate-500">{item.label}</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-semibold text-slate-950">{item.value}</CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <RiskDistributionChart data={data?.distribution ?? []} />
            <VolumeChart data={data?.volume ?? []} />
          </div>

          <RuleHitsChart data={data?.topRules ?? []} />
        </>
      )}
    </div>
  );
}
