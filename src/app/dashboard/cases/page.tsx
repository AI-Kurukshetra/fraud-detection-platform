"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, toTitleCase } from "@/lib/utils/helpers";

interface FraudCase {
  id: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  updated_at: string;
  transactions: {
    external_transaction_id: string;
    amount: number;
    currency: string;
    status: string;
    risk_score: number;
    risk_level: string;
  } | null;
}

export default function CasesPage() {
  const [cases, setCases] = useState<FraudCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cases")
      .then((r) => r.json())
      .then((j) => { if (j.success) setCases(j.data ?? []); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Fraud cases</h2>
        <p className="text-sm text-slate-500">
          Queue and workflow management for transactions that need analyst action.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Case queue ({cases.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <p className="text-sm text-slate-400">Loading cases...</p>
          ) : cases.length === 0 ? (
            <p className="text-sm text-slate-400">No cases found.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="pb-3 pr-4">Case ID</th>
                  <th className="pb-3 pr-4">Transaction</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Risk</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Priority</th>
                  <th className="pb-3 pr-4">Assigned</th>
                  <th className="pb-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-slate-50">
                    <td className="py-3 pr-4 font-medium">
                      <Link className="text-sky-700 hover:underline" href={`/dashboard/cases/${item.id}`}>
                        {item.id.slice(0, 8)}…
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-slate-600 font-mono text-xs">
                      {item.transactions?.external_transaction_id ?? "—"}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {item.transactions
                        ? `${item.transactions.currency} ${item.transactions.amount.toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="py-3 pr-4">
                      {item.transactions ? (
                        <span className="font-medium text-slate-700">{item.transactions.risk_score}</span>
                      ) : "—"}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{toTitleCase(item.status)}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={item.priority === "critical" ? "danger" : item.priority === "high" ? "warning" : "default"}>
                        {toTitleCase(item.priority)}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{item.assigned_to ?? "Unassigned"}</td>
                    <td className="py-3 text-slate-600">{formatDate(item.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
