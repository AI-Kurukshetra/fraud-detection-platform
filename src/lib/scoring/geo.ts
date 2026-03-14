import type { TransactionInput } from "@/lib/types/api";
import type { TransactionRecord } from "@/lib/types/database";
import { clampScore } from "@/lib/utils/helpers";

export interface GeoInsight {
  countryCode: string | null;
  countryMismatch: boolean;
  timezoneMismatch: boolean;
  impossibleTravel: boolean;
  raw?: Record<string, unknown>;
}

export async function lookupIpGeo(ipAddress: string) {
  try {
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,countryCode,timezone,lat,lon,city`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as Record<string, unknown>;
    if (payload.status !== "success") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function analyzeGeo(input: TransactionInput, history: TransactionRecord[]) {
  const geo = await lookupIpGeo(input.ipAddress);
  const lastUserTransaction = history
    .filter((item) => item.user_account_id === input.userAccountId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  const countryCode = typeof geo?.countryCode === "string" ? geo.countryCode : null;
  const ipTimezone = typeof geo?.timezone === "string" ? geo.timezone : null;
  const countryMismatch =
    Boolean(countryCode) &&
    Boolean(input.billingCountry) &&
    input.billingCountry !== countryCode &&
    input.shippingCountry !== countryCode;

  const timezoneMismatch =
    Boolean(ipTimezone) && Boolean(input.timezone) && input.timezone !== ipTimezone;

  const impossibleTravel =
    Boolean(lastUserTransaction) &&
    lastUserTransaction.billing_country !== null &&
    lastUserTransaction.billing_country !== countryCode &&
    nowMinus(lastUserTransaction.created_at) < 2;

  const insight: GeoInsight = {
    countryCode,
    countryMismatch,
    timezoneMismatch,
    impossibleTravel,
    raw: geo ?? undefined,
  };

  let score = 0;
  const reasons: string[] = [];

  if (countryMismatch) {
    score += 25;
    reasons.push("IP country does not match billing or shipping country.");
  }

  if (timezoneMismatch) {
    score += 12;
    reasons.push("Device timezone differs from IP geolocation timezone.");
  }

  if (impossibleTravel) {
    score += 20;
    reasons.push("Recent account activity suggests impossible travel.");
  }

  return {
    insight,
    score: clampScore(score),
    reasons,
  };
}

function nowMinus(value: string) {
  return (Date.now() - new Date(value).getTime()) / (60 * 60 * 1000);
}
