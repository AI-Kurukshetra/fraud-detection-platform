import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoCases, demoTransactions } from "@/lib/demo/data";
import { formatDate, toTitleCase } from "@/lib/utils/helpers";

export default function CasesPage() {
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
          <CardTitle>Case queue</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="pb-3">Case</th>
                <th className="pb-3">Transaction</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Assigned</th>
                <th className="pb-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {demoCases.map((item) => {
                const transaction = demoTransactions.find((txn) => txn.id === item.transaction_id);
                return (
                  <tr key={item.id} className="border-t">
                    <td className="py-3 font-medium text-slate-900">
                      <Link className="text-sky-700" href={`/dashboard/cases/${item.id}`}>
                        {item.id}
                      </Link>
                    </td>
                    <td className="py-3 text-slate-600">
                      {transaction?.external_transaction_id ?? item.transaction_id}
                    </td>
                    <td className="py-3 text-slate-600">{toTitleCase(item.status)}</td>
                    <td className="py-3">
                      <Badge variant={item.priority === "critical" ? "danger" : "warning"}>
                        {toTitleCase(item.priority)}
                      </Badge>
                    </td>
                    <td className="py-3 text-slate-600">{item.assigned_to ?? "Unassigned"}</td>
                    <td className="py-3 text-slate-600">{formatDate(item.updated_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
