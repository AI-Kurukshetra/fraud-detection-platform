"use client";

import { useEffect, useState } from "react";

import { TransactionsTable } from "@/components/dashboard/data-table";

interface TxnRow {
  external_transaction_id: string;
  amount: number;
  currency: string;
  risk_level: string;
  status: string;
  created_at: string;
  merchants: { name: string } | null;
}

export default function TransactionsPage() {
  const [rows, setRows] = useState<TxnRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/transactions?limit=200")
      .then((r) => r.json())
      .then((j) => { if (j.success) setRows(j.data ?? []); })
      .finally(() => setLoading(false));
  }, []);

  const tableRows = rows.map((t) => ({
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
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Transactions</h2>
        <p className="text-sm text-slate-500">
          Search, review, and inspect transaction scoring outcomes across merchants.
        </p>
      </div>
      {loading ? (
        <p className="text-sm text-slate-400">Loading transactions...</p>
      ) : (
        <TransactionsTable title="Transaction queue" rows={tableRows} />
      )}
    </div>
  );
}
