import { demoMerchants, demoTransactions } from "@/lib/demo/data";

import { TransactionsTable } from "@/components/dashboard/data-table";

export default function TransactionsPage() {
  const rows = demoTransactions.map((transaction) => ({
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
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Transactions</h2>
        <p className="text-sm text-slate-500">
          Search, review, and inspect transaction scoring outcomes across merchants.
        </p>
      </div>
      <TransactionsTable title="Transaction queue" rows={rows} />
    </div>
  );
}
