import type { TransactionInput } from "@/lib/types/api";
import { clampScore } from "@/lib/utils/helpers";

export interface BehavioralSignalsInput {
  avgKeyIntervalMs?: number;
  mouseJitter?: number;
  touchPressureVar?: number;
  pastSessionsAnomalyScore?: number;
}

export function extractBehavioralSignals(
  input: TransactionInput,
): BehavioralSignalsInput {
  const meta = (input.metadata ?? {}) as Record<string, unknown>;
  const behavior = (meta.behavior ?? {}) as Record<string, unknown>;

  return {
    avgKeyIntervalMs: Number(behavior.avgKeyIntervalMs ?? 0) || undefined,
    mouseJitter: Number(behavior.mouseJitter ?? 0) || undefined,
    touchPressureVar: Number(behavior.touchPressureVar ?? 0) || undefined,
    pastSessionsAnomalyScore:
      Number(behavior.pastSessionsAnomalyScore ?? 0) || undefined,
  };
}

export function scoreBehavioralSignals(
  signals: BehavioralSignalsInput,
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (
    typeof signals.avgKeyIntervalMs === "number" &&
    signals.avgKeyIntervalMs < 40
  ) {
    score += 18;
    reasons.push("Unusually fast typing cadence detected.");
  }

  if (
    typeof signals.mouseJitter === "number" &&
    signals.mouseJitter > 0.8
  ) {
    score += 14;
    reasons.push("Mouse movement pattern appears automated or erratic.");
  }

  if (
    typeof signals.touchPressureVar === "number" &&
    signals.touchPressureVar < 0.05
  ) {
    score += 10;
    reasons.push("Touch interactions show low variance, indicating possible bot.");
  }

  if (
    typeof signals.pastSessionsAnomalyScore === "number" &&
    signals.pastSessionsAnomalyScore > 0.7
  ) {
    score += 20;
    reasons.push("Historical behavioral profile deviates from baseline.");
  }

  return {
    score: clampScore(score),
    reasons,
  };
}


