"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Activity,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Globe,
  Key,
  PlusCircle,
  Store,
  TrendingUp,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Merchant } from "@/lib/types/database";
import { formatDate } from "@/lib/utils/helpers";

interface MerchantStats {
  total: number;
  approved: number;
  declined: number;
  review: number;
  totalVolume: number;
  highRisk: number;
}

interface MerchantWithStats extends Merchant {
  stats?: MerchantStats;
  showKey?: boolean;
}

const defaultForm = { name: "", webhook_url: "" };

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<MerchantWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/merchants")
      .then((r) => r.json())
      .then(async (json: { success: boolean; data?: Merchant[] }) => {
        if (json.success && json.data) {
          const withStats: MerchantWithStats[] = json.data;
          setMerchants(withStats);
          // Fetch stats for each merchant in parallel
          const statsResults = await Promise.allSettled(
            json.data.map((m) =>
              fetch(`/api/merchants/${m.id}/stats`)
                .then((r) => r.json())
                .then((s: { success: boolean; data?: MerchantStats }) => ({
                  id: m.id,
                  stats: s.data,
                })),
            ),
          );
          setMerchants((prev) =>
            prev.map((m) => {
              const result = statsResults.find(
                (r) => r.status === "fulfilled" && r.value.id === m.id,
              );
              if (result && result.status === "fulfilled") {
                return { ...m, stats: result.value.stats };
              }
              return m;
            }),
          );
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openForm() {
    setForm(defaultForm);
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setError(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        webhook_url: form.webhook_url.trim() || null,
      };
      const res = await fetch("/api/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { success: boolean; data?: Merchant; error?: string };
      if (!res.ok || !json.success) throw new Error(json.error ?? "Failed to create merchant.");
      if (json.data) setMerchants((prev) => [{ ...json.data! }, ...prev]);
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(merchant: MerchantWithStats) {
    const newStatus = merchant.status === "active" ? "inactive" : "active";
    const res = await fetch(`/api/merchants/${merchant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setMerchants((prev) =>
        prev.map((m) => (m.id === merchant.id ? { ...m, status: newStatus } : m)),
      );
    }
  }

  function toggleKeyVisibility(id: string) {
    setMerchants((prev) =>
      prev.map((m) => (m.id === id ? { ...m, showKey: !m.showKey } : m)),
    );
  }

  async function copyKey(merchant: MerchantWithStats) {
    await navigator.clipboard.writeText(merchant.api_key_hash);
    setCopiedId(merchant.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const activeMerchants = merchants.filter((m) => m.status === "active").length;
  const totalVolume = merchants.reduce((sum, m) => sum + (m.stats?.totalVolume ?? 0), 0);
  const totalTransactions = merchants.reduce((sum, m) => sum + (m.stats?.total ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Merchants</h2>
          <p className="text-sm text-slate-500">
            Manage merchant integrations, API keys, and transaction volumes.
          </p>
        </div>
        <Button onClick={showForm ? closeForm : openForm}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {showForm ? "Cancel" : "Add merchant"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Store className="h-3.5 w-3.5" /> Total merchants
          </div>
          <div className="text-2xl font-bold text-slate-950">{merchants.length}</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Active
          </div>
          <div className="text-2xl font-bold text-emerald-600">{activeMerchants}</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Activity className="h-3.5 w-3.5" /> Total transactions
          </div>
          <div className="text-2xl font-bold text-slate-950">{totalTransactions.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <TrendingUp className="h-3.5 w-3.5" /> Total volume
          </div>
          <div className="text-2xl font-bold text-sky-600">
            ${totalVolume.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Add Merchant Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New merchant</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Merchant name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Acme Commerce"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL (optional)</Label>
                  <Input
                    id="webhookUrl"
                    value={form.webhook_url}
                    onChange={(e) => set("webhook_url", e.target.value)}
                    placeholder="https://yoursite.com/webhook"
                  />
                </div>
              </div>
              {error ? <p className="text-sm text-rose-700">{error}</p> : null}
              <div className="flex gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Creating..." : "Create merchant"}
                </Button>
                <Button type="button" variant="secondary" onClick={closeForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Merchant list */}
      {loading ? (
        <p className="text-sm text-slate-400">Loading merchants...</p>
      ) : merchants.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-slate-400">
            No merchants yet. Add your first merchant to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {merchants.map((merchant) => (
            <Card key={merchant.id}>
              <CardContent className="pt-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  {/* Left: identity */}
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                        <Store className="h-4 w-4 text-slate-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-950">{merchant.name}</span>
                          <Badge variant={merchant.status === "active" ? "success" : "secondary"}>
                            {merchant.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-400">
                          Added {formatDate(merchant.created_at)}
                        </div>
                      </div>
                    </div>

                    {/* API Key */}
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                      <Key className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <code className="flex-1 truncate text-xs text-slate-600">
                        {merchant.showKey
                          ? merchant.api_key_hash
                          : `${merchant.api_key_hash.slice(0, 12)}${"•".repeat(20)}`}
                      </code>
                      <button
                        onClick={() => toggleKeyVisibility(merchant.id)}
                        className="text-slate-400 hover:text-slate-600 transition"
                        title={merchant.showKey ? "Hide key" : "Reveal key"}
                      >
                        {merchant.showKey ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => copyKey(merchant)}
                        className="text-slate-400 hover:text-slate-600 transition"
                        title="Copy API key"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      {copiedId === merchant.id && (
                        <span className="text-xs text-emerald-600 font-medium">Copied!</span>
                      )}
                    </div>

                    {/* Webhook */}
                    {merchant.webhook_url && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{merchant.webhook_url}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: stats */}
                  <div className="flex flex-wrap gap-3">
                    {merchant.stats ? (
                      <>
                        <div className="rounded-lg border bg-white px-4 py-2 text-center min-w-[72px]">
                          <div className="text-lg font-bold text-slate-950">
                            {merchant.stats.total}
                          </div>
                          <div className="text-xs text-slate-400">Txns</div>
                        </div>
                        <div className="rounded-lg border bg-white px-4 py-2 text-center min-w-[72px]">
                          <div className="text-lg font-bold text-emerald-600">
                            {merchant.stats.approved}
                          </div>
                          <div className="text-xs text-slate-400">Approved</div>
                        </div>
                        <div className="rounded-lg border bg-white px-4 py-2 text-center min-w-[72px]">
                          <div className="text-lg font-bold text-rose-600">
                            {merchant.stats.declined}
                          </div>
                          <div className="text-xs text-slate-400">Declined</div>
                        </div>
                        <div className="rounded-lg border bg-white px-4 py-2 text-center min-w-[72px]">
                          <div className="text-lg font-bold text-amber-600">
                            {merchant.stats.highRisk}
                          </div>
                          <div className="text-xs text-slate-400">High Risk</div>
                        </div>
                        <div className="rounded-lg border bg-white px-4 py-2 text-center min-w-[88px]">
                          <div className="text-lg font-bold text-sky-600">
                            ${(merchant.stats.totalVolume / 1000).toFixed(1)}k
                          </div>
                          <div className="text-xs text-slate-400">Volume</div>
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-slate-400 self-center">Loading stats...</div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-3 border-t pt-3">
                  <button
                    onClick={() => toggleStatus(merchant)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      merchant.status === "active"
                        ? "text-rose-600 hover:bg-rose-50"
                        : "text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    {merchant.status === "active" ? (
                      <>
                        <XCircle className="h-4 w-4" /> Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Activate
                      </>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
