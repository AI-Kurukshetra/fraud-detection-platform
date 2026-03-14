import type { TransactionInput } from "@/lib/types/api";
import type { RiskRule } from "@/lib/types/database";
import { clampScore } from "@/lib/utils/helpers";

type Operator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "not_in" | "contains";

function compare(left: unknown, operator: Operator, right: unknown) {
  switch (operator) {
    case "eq":
      return left === right;
    case "neq":
      return left !== right;
    case "gt":
      return Number(left) > Number(right);
    case "gte":
      return Number(left) >= Number(right);
    case "lt":
      return Number(left) < Number(right);
    case "lte":
      return Number(left) <= Number(right);
    case "in":
      return Array.isArray(right) && right.includes(left);
    case "not_in":
      return Array.isArray(right) && !right.includes(left);
    case "contains":
      return String(left ?? "").includes(String(right ?? ""));
    default:
      return false;
  }
}

export function evaluateRules(
  rules: RiskRule[],
  input: TransactionInput,
  context: Record<string, unknown>,
) {
  let score = 0;
  const triggeredRules: string[] = [];
  const reasons: string[] = [];

  for (const rule of rules.filter((item) => item.is_active).sort((a, b) => a.priority - b.priority)) {
    const field = String(rule.condition.field ?? "");
    const operator = String(rule.condition.operator ?? "eq") as Operator;
    const expected = rule.condition.value;
    const source =
      field in context ? context[field] : field in input ? input[field as keyof TransactionInput] : undefined;

    if (compare(source, operator, expected)) {
      score += rule.score_impact;
      triggeredRules.push(rule.name);
      reasons.push(`${rule.name} triggered.`);
    }
  }

  return {
    score: clampScore(score),
    triggeredRules,
    reasons,
  };
}
