"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RiskRule } from "@/lib/types/database";

const CONDITION_FIELDS = [
  "amount",
  "currency",
  "country",
  "ip_address",
  "device_age_hours",
  "transaction_count_1h",
  "card_bin",
  "email_domain",
  "country_mismatch",
  "ip_blacklisted",
  "user_whitelisted",
  "local_hour",
];

const OPERATORS = ["eq", "neq", "gt", "gte", "lt", "lte", "in", "not_in", "contains"] as const;
const ACTIONS = ["approve", "decline", "review", "flag"] as const;

const selectClass =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400";

function parseConditionValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed.includes(",")) return trimmed.split(",").map((s) => s.trim());
  const n = Number(trimmed);
  if (!Number.isNaN(n) && trimmed !== "") return n;
  return trimmed;
}

const defaultForm = {
  name: "",
  description: "",
  conditionField: "amount",
  conditionOperator: "gt" as (typeof OPERATORS)[number],
  conditionValue: "",
  action: "review" as (typeof ACTIONS)[number],
  scoreImpact: 10,
  priority: 50,
  isActive: true,
};

export default function RulesPage() {
  const [rules, setRules] = useState<RiskRule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    fetch("/api/rules")
      .then((res) => res.json())
      .then((json: { success: boolean; data?: RiskRule[] }) => {
        if (json.success && json.data) setRules(json.data);
      })
      .catch(() => undefined);
  }, []);

  function set(key: string, value: unknown) {
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
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          condition: {
            field: form.conditionField,
            operator: form.conditionOperator,
            value: parseConditionValue(form.conditionValue),
          },
          action: form.action,
          scoreImpact: Number(form.scoreImpact),
          isActive: form.isActive,
          priority: Number(form.priority),
        }),
      });

      const json = (await res.json()) as { success: boolean; data?: RiskRule; error?: string };

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to create rule.");
      }

      if (json.data) {
        setRules((prev) => [...prev, json.data!]);
      }
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Risk rules</h2>
          <p className="text-sm text-slate-500">
            CRUD-ready rules inventory for configurable fraud logic.
          </p>
        </div>
        <Button onClick={showForm ? closeForm : openForm}>
          {showForm ? "Cancel" : "Add rule"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New rule</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ruleName">Name</Label>
                  <Input
                    id="ruleName"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="High amount transaction"
                    required
                    minLength={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ruleDesc">Description</Label>
                  <Input
                    id="ruleDesc"
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Optional description"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="condField">Condition field</Label>
                  <select
                    id="condField"
                    value={form.conditionField}
                    onChange={(e) => set("conditionField", e.target.value)}
                    className={selectClass}
                  >
                    {CONDITION_FIELDS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condOp">Operator</Label>
                  <select
                    id="condOp"
                    value={form.conditionOperator}
                    onChange={(e) => set("conditionOperator", e.target.value)}
                    className={selectClass}
                  >
                    {OPERATORS.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condVal">Value</Label>
                  <Input
                    id="condVal"
                    value={form.conditionValue}
                    onChange={(e) => set("conditionValue", e.target.value)}
                    placeholder="e.g. 5000 or true or a,b,c"
                    required
                  />
                  <p className="text-xs text-slate-400">
                    Comma-separate for arrays. Use true/false for booleans.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="ruleAction">Action</Label>
                  <select
                    id="ruleAction"
                    value={form.action}
                    onChange={(e) => set("action", e.target.value)}
                    className={selectClass}
                  >
                    {ACTIONS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scoreImpact">Score impact (−100 to 100)</Label>
                  <Input
                    id="scoreImpact"
                    type="number"
                    min={-100}
                    max={100}
                    value={form.scoreImpact}
                    onChange={(e) => set("scoreImpact", e.target.valueAsNumber)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority (1–100)</Label>
                  <Input
                    id="priority"
                    type="number"
                    min={1}
                    max={100}
                    value={form.priority}
                    onChange={(e) => set("priority", e.target.valueAsNumber)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => set("isActive", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <Label htmlFor="isActive">Active immediately</Label>
              </div>

              {error ? <p className="text-sm text-rose-700">{error}</p> : null}

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save rule"}
                </Button>
                <Button type="button" variant="secondary" onClick={closeForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>{rule.name}</CardTitle>
                <p className="text-sm text-slate-500">{rule.description}</p>
              </div>
              <Badge variant={rule.is_active ? "success" : "default"}>
                {rule.is_active ? "Active" : "Inactive"}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600">
              <code className="rounded-lg bg-slate-100 px-3 py-2">
                {JSON.stringify(rule.condition)}
              </code>
              <div>Action: {rule.action}</div>
              <div>Score impact: +{rule.score_impact}</div>
              <div>Priority: {rule.priority}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
