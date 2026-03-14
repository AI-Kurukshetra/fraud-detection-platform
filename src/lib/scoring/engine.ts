import { demoDevices, demoLists, demoRules, demoTransactions } from "@/lib/demo/data";
import { scoreDeviceRisk } from "@/lib/scoring/device";
import { analyzeGeo } from "@/lib/scoring/geo";
import { extractBehavioralSignals, scoreBehavioralSignals } from "@/lib/scoring/behavior";
import { evaluateRules } from "@/lib/scoring/rules";
import { calculateVelocitySnapshot, scoreVelocity } from "@/lib/scoring/velocity";
import type { ScoringResult, TransactionDecision, TransactionInput } from "@/lib/types/api";
import { clampScore } from "@/lib/utils/helpers";

function mapRiskLevel(score: number) {
  if (score <= 25) return "low" as const;
  if (score <= 50) return "medium" as const;
  if (score <= 75) return "high" as const;
  return "critical" as const;
}

function mapDecision(score: number): TransactionDecision {
  if (score < 30) return "approved";
  if (score <= 70) return "review";
  return "declined";
}

async function scoreWithAi(input: TransactionInput, hints: string[]) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      score: heuristicModel(input, hints),
      reasons: ["OpenAI API key is not configured. Used heuristic scoring fallback."],
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "You are a fraud scoring assistant. Return strict JSON with fields score (0-100) and reasons (string array).",
          },
          {
            role: "user",
            content: JSON.stringify({ transaction: input, hints }),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "fraud_score",
            schema: {
              type: "object",
              properties: {
                score: { type: "number" },
                reasons: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["score", "reasons"],
              additionalProperties: false,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI request failed");
    }

    const payload = (await response.json()) as {
      output_text?: string;
    };
    const parsed = JSON.parse(payload.output_text ?? "{}") as { score?: number; reasons?: string[] };

    return {
      score: clampScore(parsed.score ?? heuristicModel(input, hints)),
      reasons: parsed.reasons ?? ["AI response missing reasons; fallback applied."],
    };
  } catch {
    return {
      score: heuristicModel(input, hints),
      reasons: ["OpenAI scoring unavailable. Used heuristic fallback."],
    };
  }
}

function heuristicModel(input: TransactionInput, hints: string[]) {
  let score = 10;

  if (input.amount >= 5000) score += 30;
  if (input.amount >= 1000) score += 10;
  if (input.email?.endsWith("throwawaymail.com")) score += 20;
  if (hints.some((item) => item.includes("mismatch"))) score += 12;
  if (hints.some((item) => item.includes("Velocity"))) score += 14;

  return clampScore(score);
}

export async function scoreTransaction(input: TransactionInput): Promise<ScoringResult> {
  const velocitySnapshot = calculateVelocitySnapshot(input, demoTransactions);
  const velocity = scoreVelocity(velocitySnapshot);

  const deviceRecord = demoDevices.find((item) => item.id === input.deviceId);
  const isBlacklisted = demoLists.some(
    (item) =>
      item.list_type === "blacklist" &&
      ((item.entity_type === "device" && item.entity_value === input.deviceId) ||
        (item.entity_type === "ip" && item.entity_value === input.ipAddress)),
  );

  const device = scoreDeviceRisk({
    isBot: deviceRecord?.is_bot ?? false,
    isBlacklisted,
    deviceAgeHours: deviceRecord
      ? (Date.now() - new Date(deviceRecord.first_seen_at).getTime()) / 3_600_000
      : 0,
    accountsSeen: Number(deviceRecord?.metadata?.accounts_seen ?? 1),
  });

  const geo = await analyzeGeo(input, demoTransactions);

  const behavioralSignals = extractBehavioralSignals(input);
  const behavioral = scoreBehavioralSignals(behavioralSignals);

  const ruleContext = {
    amount: input.amount,
    currency: input.currency,
    country: geo.insight.countryCode,
    ip_address: input.ipAddress,
    device_age_hours: deviceRecord
      ? (Date.now() - new Date(deviceRecord.first_seen_at).getTime()) / 3_600_000
      : 0,
    transaction_count_1h: velocitySnapshot.user1h,
    card_bin: input.cardBin,
    email_domain: input.email?.split("@")[1],
    country_mismatch: geo.insight.countryMismatch,
  };
  const rules = evaluateRules(demoRules, input, ruleContext);

  const ai = await scoreWithAi(input, [
    ...velocity.reasons,
    ...device.reasons,
    ...geo.reasons,
    ...behavioral.reasons,
    ...rules.reasons,
  ]);

  const overallScore = clampScore(
    velocity.score * 0.25 +
      device.score * 0.2 +
      behavioral.score * 0.15 +
      geo.score * 0.1 +
      rules.score * 0.15 +
      ai.score * 0.15,
  );
  const riskLevel = mapRiskLevel(overallScore);
  const decision = mapDecision(overallScore);

  return {
    overallScore,
    riskLevel,
    decision,
    breakdown: {
      velocityScore: velocity.score,
      deviceScore: device.score,
      geoScore: geo.score,
      ruleScore: rules.score,
      mlScore: ai.score,
      behavioralScore: behavioral.score,
    },
    triggeredRules: rules.triggeredRules,
    reasons: [...velocity.reasons, ...device.reasons, ...geo.reasons, ...rules.reasons, ...ai.reasons],
  };
}
