"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, toTitleCase } from "@/lib/utils/helpers";

interface CaseDetail {
  id: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  notes: Array<Record<string, unknown>>;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  transactions: {
    id: string;
    external_transaction_id: string;
    amount: number;
    currency: string;
    status: string;
    risk_score: number;
    risk_level: string;
    ip_address: string;
    billing_country: string | null;
    created_at: string;
    devices: {
      id: string;
      fingerprint_hash: string;
      browser: string | null;
      os: string | null;
      timezone: string | null;
      last_seen_at: string;
    } | null;
  } | null;
}

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [fraudCase, setFraudCase] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/cases/${id}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setFraudCase(j.data);
        else setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-sm text-slate-400">Loading case...</p>;
  if (notFound || !fraudCase) return (
    <div className="space-y-4">
      <Link href="/dashboard/cases" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-950">
        <ArrowLeft className="h-4 w-4" /> Back to cases
      </Link>
      <p className="text-sm text-slate-500">Case not found.</p>
    </div>
  );

  const transaction = fraudCase.transactions;
  const device = transaction?.devices;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/cases" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950 font-mono">{fraudCase.id.slice(0, 8)}…</h2>
          <p className="text-sm text-slate-500">Transaction-linked case investigation detail.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={fraudCase.status === "confirmed_fraud" ? "danger" : "warning"}>
            {toTitleCase(fraudCase.status)}
          </Badge>
          <Badge variant={fraudCase.priority === "critical" ? "danger" : "info"}>
            {toTitleCase(fraudCase.priority)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Transaction details</CardTitle></CardHeader>
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
              <div className="text-sm text-slate-500">IP Address</div>
              <div className="text-xl font-semibold text-slate-950 font-mono text-base">
                {transaction?.ip_address ?? "N/A"}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Country</div>
              <div className="text-xl font-semibold text-slate-950">{transaction?.billing_country ?? "N/A"}</div>
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
          <CardHeader><CardTitle>Device context</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>Device ID: {device?.id?.slice(0, 8) ?? "Unknown"}…</p>
            <p>Fingerprint: {device?.fingerprint_hash?.slice(0, 16) ?? "N/A"}…</p>
            <p>Browser: {device?.browser ?? "N/A"}</p>
            <p>OS: {device?.os ?? "N/A"}</p>
            <p>Timezone: {device?.timezone ?? "N/A"}</p>
            <p>Last seen: {device ? formatDate(device.last_seen_at) : "N/A"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {fraudCase.notes.length === 0 ? (
            <p className="text-sm text-slate-400">No notes yet.</p>
          ) : (
            fraudCase.notes.map((note, index) => (
              <div key={index} className="rounded-xl border bg-slate-50 p-4">
                <div className="text-sm font-medium text-slate-900">{String(note.by ?? "system")}</div>
                <div className="text-sm text-slate-600">{String(note.message ?? "")}</div>
                <div className="mt-2 text-xs text-slate-400">{formatDate(String(note.at ?? fraudCase.updated_at))}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
