"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Globe,
  Monitor,
  Search,
  Shield,
  TrendingUp,
  User,
  Users,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RISK_LEVEL_COLORS } from "@/lib/utils/constants";
import { formatCurrency, formatDate } from "@/lib/utils/helpers";

interface CustomerProfile {
  user_account_id: string;
  total_transactions: number;
  avg_risk_score: number;
  max_risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  total_amount: number;
  declined_count: number;
  review_count: number;
  country_count: number;
  countries: string[];
  ip_count: number;
  last_seen: string;
  first_seen: string;
}

interface TransactionDetail {
  id: string;
  amount: number;
  currency: string;
  status: string;
  risk_score: number;
  risk_level: string;
  payment_method_type: string;
  ip_address: string;
  billing_country: string | null;
  created_at: string;
}

interface FraudCase {
  id: string;
  status: string;
  priority: string;
  created_at: string;
}

interface CustomerDetail {
  transactions: TransactionDetail[];
  cases: FraudCase[];
}

const riskVariant = (level: string) => {
  if (level === "critical") return "danger";
  if (level === "high") return "warning";
  if (level === "medium") return "info";
  return "success";
};

const statusVariant = (status: string) => {
  if (status === "declined") return "danger";
  if (status === "review") return "warning";
  return "success";
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CustomerProfile | null>(null);
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    fetch(`/api/customers?${params}`)
      .then((r) => r.json())
      .then((json: { success: boolean; data?: CustomerProfile[] }) => {
        if (json.success && json.data) setCustomers(json.data);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [query]);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setQuery(search);
  }

  async function openProfile(customer: CustomerProfile) {
    setSelected(customer);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/customers/${encodeURIComponent(customer.user_account_id)}`);
      const json = (await res.json()) as { success: boolean; data?: CustomerDetail };
      if (json.success && json.data) setDetail(json.data);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeProfile() {
    setSelected(null);
    setDetail(null);
  }

  // Summary stats
  const highRiskCount = customers.filter(
    (c) => c.risk_level === "high" || c.risk_level === "critical",
  ).length;
  const avgScore =
    customers.length > 0
      ? Math.round(customers.reduce((s, c) => s + c.avg_risk_score, 0) / customers.length)
      : 0;

  if (selected) {
    return (
      <div className="space-y-6">
        {/* Back */}
        <button
          onClick={closeProfile}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-950 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to customers
        </button>

        {/* Profile header */}
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <User className="h-6 w-6 text-slate-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-semibold text-slate-950 font-mono">
                {selected.user_account_id}
              </h2>
              <Badge variant={riskVariant(selected.risk_level)}>
                {selected.risk_level.toUpperCase()} RISK
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              First seen {formatDate(selected.first_seen)} · Last seen {formatDate(selected.last_seen)}
            </p>
          </div>
        </div>

        {/* Risk score bar */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Max Risk Score</span>
              <span className="text-lg font-bold text-slate-950">{selected.max_risk_score}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  selected.max_risk_score >= 80
                    ? "bg-rose-500"
                    : selected.max_risk_score >= 60
                      ? "bg-orange-500"
                      : selected.max_risk_score >= 35
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                }`}
                style={{ width: `${selected.max_risk_score}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 text-center">
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-lg font-bold text-slate-950">{selected.total_transactions}</div>
                <div className="text-xs text-slate-400">Transactions</div>
              </div>
              <div className="rounded-lg bg-rose-50 p-3">
                <div className="text-lg font-bold text-rose-600">{selected.declined_count}</div>
                <div className="text-xs text-slate-400">Declined</div>
              </div>
              <div className="rounded-lg bg-amber-50 p-3">
                <div className="text-lg font-bold text-amber-600">{selected.review_count}</div>
                <div className="text-xs text-slate-400">Under review</div>
              </div>
              <div className="rounded-lg bg-sky-50 p-3">
                <div className="text-lg font-bold text-sky-600">
                  {formatCurrency(selected.total_amount)}
                </div>
                <div className="text-xs text-slate-400">Total spend</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signals */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4" /> Geographic signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold text-slate-950">{selected.country_count}</span>
                <span className="text-sm text-slate-500">countries</span>
                {selected.country_count > 3 && (
                  <Badge variant="warning">Multi-country</Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selected.countries.map((c) => (
                  <span
                    key={c}
                    className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Monitor className="h-4 w-4" /> Network signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold text-slate-950">{selected.ip_count}</span>
                <span className="text-sm text-slate-500">unique IPs</span>
                {selected.ip_count > 5 && (
                  <Badge variant="danger">IP velocity</Badge>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {selected.ip_count <= 2
                  ? "Normal — consistent IP usage."
                  : selected.ip_count <= 5
                    ? "Moderate — some IP variation detected."
                    : "High — suspicious IP rotation pattern."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction timeline */}
        {detailLoading ? (
          <p className="text-sm text-slate-400">Loading transaction history...</p>
        ) : detail ? (
          <>
            {detail.cases.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" /> Fraud cases
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {detail.cases.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm"
                    >
                      <span className="font-mono text-slate-600 text-xs">{c.id.slice(0, 8)}…</span>
                      <Badge
                        variant={
                          c.status === "confirmed_fraud"
                            ? "danger"
                            : c.status === "open" || c.status === "investigating"
                              ? "warning"
                              : "default"
                        }
                      >
                        {c.status.replace("_", " ")}
                      </Badge>
                      <Badge
                        variant={
                          c.priority === "critical"
                            ? "danger"
                            : c.priority === "high"
                              ? "warning"
                              : "default"
                        }
                      >
                        {c.priority}
                      </Badge>
                      <span className="text-xs text-slate-400">{formatDate(c.created_at)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Transaction history
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-400 border-b">
                        <th className="pb-2 pr-4">Date</th>
                        <th className="pb-2 pr-4">Amount</th>
                        <th className="pb-2 pr-4">Status</th>
                        <th className="pb-2 pr-4">Risk Score</th>
                        <th className="pb-2 pr-4">Method</th>
                        <th className="pb-2">Country</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {detail.transactions.map((t) => (
                        <tr key={t.id} className="text-slate-600">
                          <td className="py-2.5 pr-4 text-xs whitespace-nowrap">
                            {formatDate(t.created_at)}
                          </td>
                          <td className="py-2.5 pr-4 font-medium text-slate-950">
                            {formatCurrency(t.amount, t.currency)}
                          </td>
                          <td className="py-2.5 pr-4">
                            <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                          </td>
                          <td className="py-2.5 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    t.risk_score >= 80
                                      ? "bg-rose-500"
                                      : t.risk_score >= 60
                                        ? "bg-orange-400"
                                        : t.risk_score >= 35
                                          ? "bg-amber-400"
                                          : "bg-emerald-400"
                                  }`}
                                  style={{ width: `${t.risk_score}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium">{t.risk_score}</span>
                            </div>
                          </td>
                          <td className="py-2.5 pr-4 capitalize text-xs">{t.payment_method_type}</td>
                          <td className="py-2.5 text-xs">{t.billing_country ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Customer Risk Profiles</h2>
          <p className="text-sm text-slate-500">
            Per-account transaction history, risk scoring, and fraud timeline.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Users className="h-3.5 w-3.5" /> Total customers
          </div>
          <div className="text-2xl font-bold text-slate-950">{customers.length}</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <AlertTriangle className="h-3.5 w-3.5" /> High / Critical risk
          </div>
          <div className="text-2xl font-bold text-rose-600">{highRiskCount}</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Shield className="h-3.5 w-3.5" /> Avg risk score
          </div>
          <div className="text-2xl font-bold text-slate-950">{avgScore}</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <XCircle className="h-3.5 w-3.5" /> Declined accounts
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {customers.filter((c) => c.declined_count > 0).length}
          </div>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user ID…"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      {/* Customer list */}
      <Card>
        <CardHeader>
          <CardTitle>All customers · sorted by risk</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : customers.length === 0 ? (
            <p className="text-sm text-slate-400">No customers found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b">
                    <th className="pb-2 pr-4">User ID</th>
                    <th className="pb-2 pr-4">Risk Level</th>
                    <th className="pb-2 pr-4">Max Score</th>
                    <th className="pb-2 pr-4">Txns</th>
                    <th className="pb-2 pr-4">Declined</th>
                    <th className="pb-2 pr-4">Countries</th>
                    <th className="pb-2 pr-4">IPs</th>
                    <th className="pb-2 pr-4">Total Spend</th>
                    <th className="pb-2">Last Seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customers.map((c) => (
                    <tr
                      key={c.user_account_id}
                      className="text-slate-600 hover:bg-slate-50 cursor-pointer transition"
                      onClick={() => openProfile(c)}
                    >
                      <td className="py-2.5 pr-4">
                        <span className="font-mono text-xs text-slate-800">
                          {c.user_account_id.length > 20
                            ? `${c.user_account_id.slice(0, 20)}…`
                            : c.user_account_id}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${RISK_LEVEL_COLORS[c.risk_level]}`}
                        >
                          {c.risk_level}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-14 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                c.max_risk_score >= 80
                                  ? "bg-rose-500"
                                  : c.max_risk_score >= 60
                                    ? "bg-orange-400"
                                    : c.max_risk_score >= 35
                                      ? "bg-amber-400"
                                      : "bg-emerald-400"
                              }`}
                              style={{ width: `${c.max_risk_score}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-700">{c.max_risk_score}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 text-center">{c.total_transactions}</td>
                      <td className="py-2.5 pr-4 text-center">
                        {c.declined_count > 0 ? (
                          <span className="font-medium text-rose-600">{c.declined_count}</span>
                        ) : (
                          <span className="text-slate-300">0</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 text-center">
                        {c.country_count > 3 ? (
                          <span className="font-medium text-amber-600">{c.country_count}</span>
                        ) : (
                          c.country_count
                        )}
                      </td>
                      <td className="py-2.5 pr-4 text-center">
                        {c.ip_count > 5 ? (
                          <span className="font-medium text-rose-600">{c.ip_count}</span>
                        ) : (
                          c.ip_count
                        )}
                      </td>
                      <td className="py-2.5 pr-4">
                        {formatCurrency(c.total_amount)}
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          {formatDate(c.last_seen)}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
