import type {
  ApiResponse,
  FraudCasePriority,
  FraudCaseStatus,
  RiskLevel,
  ScoringResult,
  TransactionDecision,
  TransactionInput,
} from "@/lib/types/api";
import type { Device, FraudCase, Merchant, RiskRule, TransactionRecord } from "@/lib/types/database";

const now = Date.now();

function iso(hoursAgo: number) {
  return new Date(now - hoursAgo * 60 * 60 * 1000).toISOString();
}

export const demoMerchants: Merchant[] = [
  {
    id: "merchant-atlas",
    name: "Atlas Commerce",
    api_key_hash: "demo_atlas_hash",
    webhook_url: "https://merchant.example.com/webhooks/fraud",
    status: "active",
    created_at: iso(720),
  },
  {
    id: "merchant-nova",
    name: "Nova Tickets",
    api_key_hash: "demo_nova_hash",
    webhook_url: null,
    status: "active",
    created_at: iso(640),
  },
  {
    id: "merchant-lumen",
    name: "Lumen Digital Goods",
    api_key_hash: "demo_lumen_hash",
    webhook_url: "https://lumen.example.com/hooks",
    status: "inactive",
    created_at: iso(580),
  },
];

export const demoDevices: Device[] = [
  {
    id: "dev_001",
    fingerprint_hash: "fp_001",
    browser: "Chrome 134",
    os: "macOS",
    screen_resolution: "1728x1117",
    timezone: "America/New_York",
    language: "en-US",
    webgl_hash: "wg_001",
    canvas_hash: "cv_001",
    user_agent: "Mozilla/5.0",
    is_bot: false,
    risk_score: 18,
    first_seen_at: iso(360),
    last_seen_at: iso(1),
    metadata: { accounts_seen: 1 },
  },
  {
    id: "dev_002",
    fingerprint_hash: "fp_002",
    browser: "Chrome 134",
    os: "Windows",
    screen_resolution: "1920x1080",
    timezone: "Asia/Tokyo",
    language: "en-US",
    webgl_hash: "wg_002",
    canvas_hash: "cv_002",
    user_agent: "Mozilla/5.0",
    is_bot: true,
    risk_score: 77,
    first_seen_at: iso(10),
    last_seen_at: iso(0.5),
    metadata: { headless: true, accounts_seen: 5 },
  },
  {
    id: "dev_003",
    fingerprint_hash: "fp_003",
    browser: "Safari 17",
    os: "iOS",
    screen_resolution: "1179x2556",
    timezone: "Europe/London",
    language: "en-GB",
    webgl_hash: "wg_003",
    canvas_hash: "cv_003",
    user_agent: "Mozilla/5.0",
    is_bot: false,
    risk_score: 29,
    first_seen_at: iso(80),
    last_seen_at: iso(3),
    metadata: { accounts_seen: 2 },
  },
];

const transactionSeed: Array<
  Pick<
    TransactionRecord,
    | "id"
    | "merchant_id"
    | "external_transaction_id"
    | "amount"
    | "currency"
    | "payment_method_type"
    | "card_bin"
    | "card_last4"
    | "billing_country"
    | "shipping_country"
    | "ip_address"
    | "device_id"
    | "user_account_id"
    | "risk_score"
    | "risk_level"
    | "status"
    | "metadata"
  >
> = [
  {
    id: "txn_001",
    merchant_id: "merchant-atlas",
    external_transaction_id: "AT-1001",
    amount: 82.45,
    currency: "USD",
    payment_method_type: "card",
    card_bin: "424242",
    card_last4: "4242",
    billing_country: "US",
    shipping_country: "US",
    ip_address: "24.32.10.11",
    device_id: "dev_001",
    user_account_id: "user_001",
    risk_score: 14,
    risk_level: "low",
    status: "approved",
    metadata: { email: "sam@example.com" },
  },
  {
    id: "txn_002",
    merchant_id: "merchant-nova",
    external_transaction_id: "NV-2019",
    amount: 5600,
    currency: "USD",
    payment_method_type: "card",
    card_bin: "545454",
    card_last4: "2201",
    billing_country: "US",
    shipping_country: "JP",
    ip_address: "103.22.14.1",
    device_id: "dev_002",
    user_account_id: "user_002",
    risk_score: 89,
    risk_level: "critical",
    status: "declined",
    metadata: { email: "risk@throwawaymail.com", flagged: "country_mismatch" },
  },
  {
    id: "txn_003",
    merchant_id: "merchant-atlas",
    external_transaction_id: "AT-1002",
    amount: 1240,
    currency: "USD",
    payment_method_type: "wallet",
    card_bin: null,
    card_last4: null,
    billing_country: "GB",
    shipping_country: "GB",
    ip_address: "81.19.24.8",
    device_id: "dev_003",
    user_account_id: "user_003",
    risk_score: 58,
    risk_level: "high",
    status: "review",
    metadata: { email: "mia@example.co.uk", velocity_1h: 4 },
  },
  {
    id: "txn_004",
    merchant_id: "merchant-lumen",
    external_transaction_id: "LM-8821",
    amount: 19.99,
    currency: "USD",
    payment_method_type: "card",
    card_bin: "400012",
    card_last4: "1111",
    billing_country: "US",
    shipping_country: "US",
    ip_address: "44.89.32.11",
    device_id: "dev_001",
    user_account_id: "user_001",
    risk_score: 22,
    risk_level: "low",
    status: "approved",
    metadata: { email: "sam@example.com" },
  },
  {
    id: "txn_005",
    merchant_id: "merchant-nova",
    external_transaction_id: "NV-2020",
    amount: 850,
    currency: "USD",
    payment_method_type: "card",
    card_bin: "601100",
    card_last4: "9381",
    billing_country: "US",
    shipping_country: "US",
    ip_address: "103.22.14.1",
    device_id: "dev_002",
    user_account_id: "user_004",
    risk_score: 74,
    risk_level: "high",
    status: "declined",
    metadata: { email: "bulkbuyer@example.net", velocity_1h: 8 },
  },
  {
    id: "txn_006",
    merchant_id: "merchant-atlas",
    external_transaction_id: "AT-1003",
    amount: 215,
    currency: "USD",
    payment_method_type: "bank",
    card_bin: null,
    card_last4: null,
    billing_country: "CA",
    shipping_country: "CA",
    ip_address: "64.22.120.55",
    device_id: "dev_003",
    user_account_id: "user_005",
    risk_score: 37,
    risk_level: "medium",
    status: "review",
    metadata: { email: "finance@north.ca" },
  },
];

export const demoTransactions: TransactionRecord[] = transactionSeed.map((transaction, index) => ({
  ...transaction,
  scored_at: iso(index + 1),
  created_at: iso(index + 1.2),
}));

export const demoRules: RiskRule[] = [
  {
    id: "rule_001",
    name: "High amount transaction",
    description: "Flag transactions over 5000 USD",
    condition: { field: "amount", operator: "gt", value: 5000 },
    action: "review",
    score_impact: 30,
    is_active: true,
    priority: 10,
    created_by: null,
    created_at: iso(300),
    updated_at: iso(2),
  },
  {
    id: "rule_002",
    name: "New device",
    description: "Increase score for devices seen in last 24 hours",
    condition: { field: "device_age_hours", operator: "lt", value: 24 },
    action: "flag",
    score_impact: 15,
    is_active: true,
    priority: 20,
    created_by: null,
    created_at: iso(300),
    updated_at: iso(5),
  },
  {
    id: "rule_003",
    name: "Country mismatch",
    description: "Billing and shipping mismatch with IP country",
    condition: { field: "country_mismatch", operator: "eq", value: true },
    action: "review",
    score_impact: 25,
    is_active: true,
    priority: 15,
    created_by: null,
    created_at: iso(300),
    updated_at: iso(5),
  },
  {
    id: "rule_004",
    name: "Velocity over 5 per hour",
    description: "Triggers when an account exceeds five transactions in one hour",
    condition: { field: "transaction_count_1h", operator: "gt", value: 5 },
    action: "review",
    score_impact: 20,
    is_active: true,
    priority: 12,
    created_by: null,
    created_at: iso(300),
    updated_at: iso(4),
  },
];

export const demoCases: FraudCase[] = [
  {
    id: "case_001",
    transaction_id: "txn_002",
    status: "open",
    assigned_to: "analyst_001",
    priority: "critical",
    notes: [{ by: "system", message: "Auto-created from critical decline.", at: iso(0.8) }],
    resolution: null,
    created_at: iso(0.8),
    updated_at: iso(0.5),
  },
  {
    id: "case_002",
    transaction_id: "txn_003",
    status: "investigating",
    assigned_to: "analyst_002",
    priority: "high",
    notes: [{ by: "analyst_002", message: "Requested merchant verification.", at: iso(2) }],
    resolution: null,
    created_at: iso(2.5),
    updated_at: iso(2),
  },
  {
    id: "case_003",
    transaction_id: "txn_006",
    status: "false_positive",
    assigned_to: "analyst_003",
    priority: "medium",
    notes: [{ by: "analyst_003", message: "Customer identity verified.", at: iso(8) }],
    resolution: "Verified legitimate repeat customer.",
    created_at: iso(10),
    updated_at: iso(8),
  },
];

export const demoAlerts = [
  {
    id: "alert_001",
    type: "transaction_declined",
    severity: "critical",
    title: "Critical decline detected",
    message: "Nova Tickets transaction NV-2019 was auto-declined.",
    transaction_id: "txn_002",
    is_read: false,
    created_at: iso(0.6),
  },
  {
    id: "alert_002",
    type: "case_created",
    severity: "warning",
    title: "New case added to queue",
    message: "Case case_002 requires analyst review.",
    transaction_id: "txn_003",
    is_read: false,
    created_at: iso(1.8),
  },
  {
    id: "alert_003",
    type: "velocity_spike",
    severity: "warning",
    title: "Velocity spike from shared IP",
    message: "IP 103.22.14.1 exceeded hourly threshold.",
    transaction_id: "txn_005",
    is_read: true,
    created_at: iso(4),
  },
];

export const demoLists = [
  {
    id: "list_001",
    entity_type: "ip",
    entity_value: "103.22.14.1",
    list_type: "blacklist",
    reason: "Repeat chargeback cluster",
    expires_at: null,
    created_at: iso(72),
  },
  {
    id: "list_002",
    entity_type: "email_domain",
    entity_value: "trustedcorp.com",
    list_type: "whitelist",
    reason: "Verified enterprise account",
    expires_at: null,
    created_at: iso(120),
  },
];

export function getSummary() {
  const totalToday = demoTransactions.length;
  const flagged = demoTransactions.filter((item) => item.risk_score >= 50);
  const review = demoTransactions.filter((item) => item.status === "review");
  const avgRisk = Math.round(
    demoTransactions.reduce((sum, item) => sum + item.risk_score, 0) / demoTransactions.length,
  );
  const falsePositive = demoCases.filter((item) => item.status === "false_positive").length;

  return {
    totalToday,
    fraudRate: Number(((flagged.length / totalToday) * 100).toFixed(1)),
    reviewCount: review.length,
    avgRisk,
    falsePositiveRate: Number(((falsePositive / demoCases.length) * 100).toFixed(1)),
  };
}

export function getTransactionDistribution() {
  const levels: RiskLevel[] = ["low", "medium", "high", "critical"];
  return levels.map((level) => ({
    level,
    value: demoTransactions.filter((item) => item.risk_level === level).length,
  }));
}

export function getVolumeSeries() {
  return Array.from({ length: 7 }).map((_, index) => ({
    day: `D-${6 - index}`,
    volume: Math.max(18, 80 - index * 7 + (index % 2) * 8),
    fraudRate: Math.max(6, 18 - index + (index % 3) * 2),
  }));
}

export function getRuleHits() {
  return [
    { name: "Country mismatch", hits: 18 },
    { name: "High amount", hits: 13 },
    { name: "Velocity > 5/h", hits: 11 },
    { name: "New device", hits: 8 },
  ];
}

export function makeTransactionResponse(
  result: ScoringResult,
  input: TransactionInput,
): ApiResponse<{
  transaction: TransactionInput;
  scoring: ScoringResult;
}> {
  return {
    success: true,
    data: {
      transaction: input,
      scoring: result,
    },
    error: null,
  };
}

export function inferCasePriority(score: number): FraudCasePriority {
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export function inferCaseStatus(decision: TransactionDecision): FraudCaseStatus {
  if (decision === "declined") return "open";
  if (decision === "review") return "investigating";
  return "closed";
}
