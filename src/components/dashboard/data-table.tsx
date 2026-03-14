import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RISK_LEVEL_COLORS } from "@/lib/utils/constants";
import { formatCurrency, formatDate, toTitleCase } from "@/lib/utils/helpers";

export function TransactionsTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<{
    id: string;
    merchant: string;
    amount: number;
    currency: string;
    riskLevel: keyof typeof RISK_LEVEL_COLORS;
    status: string;
    createdAt: string;
  }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="pb-3">Transaction</th>
              <th className="pb-3">Merchant</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Risk</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="py-3 font-medium text-slate-900">{row.id}</td>
                <td className="py-3 text-slate-600">{row.merchant}</td>
                <td className="py-3 text-slate-600">{formatCurrency(row.amount, row.currency)}</td>
                <td className="py-3">
                  <Badge className={RISK_LEVEL_COLORS[row.riskLevel]}>{toTitleCase(row.riskLevel)}</Badge>
                </td>
                <td className="py-3 text-slate-600">{toTitleCase(row.status)}</td>
                <td className="py-3 text-slate-600">{formatDate(row.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
