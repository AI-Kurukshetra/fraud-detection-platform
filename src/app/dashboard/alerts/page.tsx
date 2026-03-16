"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/helpers";

interface Alert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  transaction_id: string | null;
  is_read: boolean;
  created_at: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((j) => { if (j.success) setAlerts(j.data ?? []); })
      .finally(() => setLoading(false));
  }, []);

  async function markRead(id: string) {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isRead: true }),
    });
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_read: true } : a)));
  }

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Alerts</h2>
        <p className="text-sm text-slate-500">
          Real-time fraud alert feed and acknowledgement queue.
        </p>
      </div>

      {unreadCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <span className="text-sm font-medium text-amber-800">{unreadCount} unread alert{unreadCount > 1 ? "s" : ""}</span>
          <button
            onClick={() => alerts.filter((a) => !a.is_read).forEach((a) => markRead(a.id))}
            className="text-xs text-amber-700 underline hover:no-underline"
          >
            Mark all read
          </button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Live alert feed ({alerts.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-slate-400">Loading alerts...</p>
          ) : alerts.length === 0 ? (
            <p className="text-sm text-slate-400">No alerts.</p>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-xl border p-4 transition ${alert.is_read ? "bg-white opacity-60" : "bg-white"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-950">{alert.title}</div>
                    <div className="text-sm text-slate-600">{alert.message}</div>
                    <div className="mt-2 text-xs text-slate-400">{formatDate(alert.created_at)}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant={alert.severity === "critical" ? "danger" : alert.severity === "warning" ? "warning" : "info"}>
                      {alert.severity}
                    </Badge>
                    <div className="flex gap-3 text-xs">
                      {alert.transaction_id && (
                        <Link className="text-sky-700 font-medium hover:underline" href="/dashboard/transactions">
                          View transaction
                        </Link>
                      )}
                      {!alert.is_read && (
                        <button
                          onClick={() => markRead(alert.id)}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
