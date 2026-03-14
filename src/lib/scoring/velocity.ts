import type { TransactionInput } from "@/lib/types/api";
import type { TransactionRecord } from "@/lib/types/database";
import { clampScore } from "@/lib/utils/helpers";

export interface VelocitySnapshot {
  ip1h: number;
  ip6h: number;
  ip24h: number;
  device1h: number;
  device6h: number;
  device24h: number;
  user1h: number;
  user6h: number;
  user24h: number;
  userAmount24h: number;
}

export function calculateVelocitySnapshot(
  input: TransactionInput,
  history: TransactionRecord[],
): VelocitySnapshot {
  const now = Date.now();

  const inWindow = (createdAt: string, hours: number) =>
    now - new Date(createdAt).getTime() <= hours * 60 * 60 * 1000;

  const filterCount = (predicate: (item: TransactionRecord) => boolean, hours: number) =>
    history.filter((item) => predicate(item) && inWindow(item.created_at, hours)).length;

  const filterAmount = (predicate: (item: TransactionRecord) => boolean, hours: number) =>
    history
      .filter((item) => predicate(item) && inWindow(item.created_at, hours))
      .reduce((sum, item) => sum + item.amount, 0);

  return {
    ip1h: filterCount((item) => item.ip_address === input.ipAddress, 1),
    ip6h: filterCount((item) => item.ip_address === input.ipAddress, 6),
    ip24h: filterCount((item) => item.ip_address === input.ipAddress, 24),
    device1h: filterCount((item) => item.device_id === input.deviceId, 1),
    device6h: filterCount((item) => item.device_id === input.deviceId, 6),
    device24h: filterCount((item) => item.device_id === input.deviceId, 24),
    user1h: filterCount((item) => item.user_account_id === input.userAccountId, 1),
    user6h: filterCount((item) => item.user_account_id === input.userAccountId, 6),
    user24h: filterCount((item) => item.user_account_id === input.userAccountId, 24),
    userAmount24h: filterAmount((item) => item.user_account_id === input.userAccountId, 24),
  };
}

export function scoreVelocity(snapshot: VelocitySnapshot) {
  let score = 0;
  const reasons: string[] = [];

  if (snapshot.ip1h >= 5) {
    score += 22;
    reasons.push(`IP has ${snapshot.ip1h} transactions in the last hour.`);
  }

  if (snapshot.device1h >= 4) {
    score += 18;
    reasons.push(`Device has ${snapshot.device1h} transactions in the last hour.`);
  }

  if (snapshot.user1h >= 3) {
    score += 14;
    reasons.push(`User account has ${snapshot.user1h} transactions in the last hour.`);
  }

  if (snapshot.userAmount24h >= 4000) {
    score += 24;
    reasons.push(`User account spent ${snapshot.userAmount24h.toFixed(2)} in 24 hours.`);
  }

  return {
    score: clampScore(score),
    reasons,
  };
}
