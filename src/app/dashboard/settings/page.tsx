"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EntityList, EntityType, ListType } from "@/lib/types/database";
import { formatDate } from "@/lib/utils/helpers";

const ENTITY_TYPES: EntityType[] = ["ip", "device", "user", "card_bin", "email", "email_domain"];
const LIST_TYPES: ListType[] = ["blacklist", "whitelist"];

const selectClass =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400";

const defaultForm = {
  entity_type: "ip" as EntityType,
  entity_value: "",
  list_type: "blacklist" as ListType,
  reason: "",
  expires_at: "",
};

type Filter = "all" | ListType;

export default function SettingsPage() {
  const [entries, setEntries] = useState<EntityList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    fetch("/api/lists")
      .then((r) => r.json())
      .then((json: { success: boolean; data?: EntityList[] }) => {
        if (json.success && json.data) setEntries(json.data);
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
        entity_type: form.entity_type,
        entity_value: form.entity_value.trim(),
        list_type: form.list_type,
        reason: form.reason.trim() || null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      };

      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { success: boolean; data?: EntityList; error?: string };

      if (!res.ok || !json.success) throw new Error(json.error ?? "Failed to add entry.");
      if (json.data) setEntries((prev) => [json.data!, ...prev]);
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: string) {
    const res = await fetch(`/api/lists/${id}`, { method: "DELETE" });
    if (res.ok) setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const visible = filter === "all" ? entries : entries.filter((e) => e.list_type === filter);
  const blacklistCount = entries.filter((e) => e.list_type === "blacklist").length;
  const whitelistCount = entries.filter((e) => e.list_type === "whitelist").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Whitelist &amp; Blacklist</h2>
          <p className="text-sm text-slate-500">
            Manage trusted and blocked IPs, devices, users, card BINs, and email domains.
          </p>
        </div>
        <Button onClick={showForm ? closeForm : openForm}>
          {showForm ? "Cancel" : "Add entry"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-2xl font-bold text-slate-950">{entries.length}</div>
          <div className="text-sm text-slate-500">Total entries</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-2xl font-bold text-rose-600">{blacklistCount}</div>
          <div className="text-sm text-slate-500">Blacklisted</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-2xl font-bold text-emerald-600">{whitelistCount}</div>
          <div className="text-sm text-slate-500">Whitelisted</div>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="entityType">Entity type</Label>
                  <select
                    id="entityType"
                    value={form.entity_type}
                    onChange={(e) => set("entity_type", e.target.value)}
                    className={selectClass}
                  >
                    {ENTITY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entityValue">Value</Label>
                  <Input
                    id="entityValue"
                    value={form.entity_value}
                    onChange={(e) => set("entity_value", e.target.value)}
                    placeholder="e.g. 185.220.101.45"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="listType">List type</Label>
                  <select
                    id="listType"
                    value={form.list_type}
                    onChange={(e) => set("list_type", e.target.value)}
                    className={selectClass}
                  >
                    {LIST_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    value={form.reason}
                    onChange={(e) => set("reason", e.target.value)}
                    placeholder="Why is this entity listed?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expires at (optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={(e) => set("expires_at", e.target.value)}
                  />
                </div>
              </div>

              {error ? <p className="text-sm text-rose-700">{error}</p> : null}

              <div className="flex gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Add to list"}
                </Button>
                <Button type="button" variant="secondary" onClick={closeForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "blacklist", "whitelist"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              filter === f
                ? "bg-slate-950 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {f === "all" ? `All (${entries.length})` : f === "blacklist" ? `Blacklist (${blacklistCount})` : `Whitelist (${whitelistCount})`}
          </button>
        ))}
      </div>

      {/* Entries list */}
      <Card>
        <CardHeader>
          <CardTitle>Entity lists</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : visible.length === 0 ? (
            <p className="text-sm text-slate-400">No entries found.</p>
          ) : (
            visible.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-slate-950">
                      {item.entity_value}
                    </span>
                    <Badge variant={item.list_type === "blacklist" ? "danger" : "success"}>
                      {item.list_type}
                    </Badge>
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700">
                      {item.entity_type}
                    </span>
                    {item.reason ? <span className="ml-2">{item.reason}</span> : null}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
                    <span>Added {formatDate(item.created_at)}</span>
                    {item.expires_at ? (
                      <span className="text-amber-600">
                        Expires {formatDate(item.expires_at)}
                      </span>
                    ) : (
                      <span>No expiry</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="rounded-lg px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 transition"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
