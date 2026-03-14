import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoCases, demoDevices, demoTransactions } from "@/lib/demo/data";
import { formatCurrency, formatDate, toTitleCase } from "@/lib/utils/helpers";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fraudCase = demoCases.find((item) => item.id === id);

  if (!fraudCase) {
    notFound();
  }

  const transaction = demoTransactions.find((item) => item.id === fraudCase.transaction_id);
  const device = demoDevices.find((item) => item.id === transaction?.device_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">{fraudCase.id}</h2>
          <p className="text-sm text-slate-500">Transaction-linked case investigation detail.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="warning">{toTitleCase(fraudCase.status)}</Badge>
          <Badge variant={fraudCase.priority === "critical" ? "danger" : "info"}>
            {toTitleCase(fraudCase.priority)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Transaction details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Amount</div>
              <div className="text-xl font-semibold text-slate-950">
                {transaction ? formatCurrency(transaction.amount, transaction.currency) : "N/A"}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Decision</div>
              <div className="text-xl font-semibold text-slate-950">
                {transaction ? toTitleCase(transaction.status) : "N/A"}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Risk score</div>
              <div className="text-xl font-semibold text-slate-950">{transaction?.risk_score ?? "N/A"}</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Created</div>
              <div className="text-xl font-semibold text-slate-950">
                {transaction ? formatDate(transaction.created_at) : "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Device context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>Device: {device?.id ?? "Unknown"}</p>
            <p>Fingerprint: {device?.fingerprint_hash ?? "N/A"}</p>
            <p>Browser: {device?.browser ?? "N/A"}</p>
            <p>Timezone: {device?.timezone ?? "N/A"}</p>
            <p>Last seen: {device ? formatDate(device.last_seen_at) : "N/A"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {fraudCase.notes.map((note, index) => (
            <div key={`${fraudCase.id}-${index}`} className="rounded-xl border bg-slate-50 p-4">
              <div className="text-sm font-medium text-slate-900">{String(note.by ?? "system")}</div>
              <div className="text-sm text-slate-600">{String(note.message ?? "")}</div>
              <div className="mt-2 text-xs text-slate-400">{formatDate(String(note.at ?? fraudCase.updated_at))}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
