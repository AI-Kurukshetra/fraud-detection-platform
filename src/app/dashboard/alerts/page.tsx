import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoAlerts } from "@/lib/demo/data";
import { formatDate } from "@/lib/utils/helpers";

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Alerts</h2>
        <p className="text-sm text-slate-500">
          Real-time fraud alert feed and acknowledgement queue.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Live alert feed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {demoAlerts.map((alert) => (
            <div key={alert.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-slate-950">{alert.title}</div>
                  <div className="text-sm text-slate-600">{alert.message}</div>
                  <div className="mt-2 text-xs text-slate-400">{formatDate(alert.created_at)}</div>
                </div>
                <div className="space-y-2 text-right">
                  <Badge variant={alert.severity === "critical" ? "danger" : "warning"}>
                    {alert.severity}
                  </Badge>
                  <div>
                    <Link className="text-sm font-medium text-sky-700" href="/dashboard/transactions">
                      View transaction
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
