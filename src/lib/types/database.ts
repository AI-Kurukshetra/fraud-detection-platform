import type {
  FraudCasePriority,
  FraudCaseStatus,
  RiskLevel,
  Role,
  TransactionDecision,
} from "@/lib/types/api";

export interface UserProfile {
  id: string;
  full_name: string | null;
  role: Role;
  organization_id: string | null;
  created_at: string;
}

export interface Merchant {
  id: string;
  name: string;
  api_key_hash: string;
  webhook_url: string | null;
  status: "active" | "inactive";
  created_at: string;
}

export interface Device {
  id: string;
  fingerprint_hash: string;
  browser: string | null;
  os: string | null;
  screen_resolution: string | null;
  timezone: string | null;
  language: string | null;
  webgl_hash: string | null;
  canvas_hash: string | null;
  user_agent: string | null;
  is_bot: boolean;
  risk_score: number;
  first_seen_at: string;
  last_seen_at: string;
  metadata: Record<string, unknown> | null;
}

export interface TransactionRecord {
  id: string;
  merchant_id: string;
  external_transaction_id: string;
  amount: number;
  currency: string;
  payment_method_type: string;
  card_bin: string | null;
  card_last4: string | null;
  billing_country: string | null;
  shipping_country: string | null;
  ip_address: string;
  device_id: string | null;
  user_account_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  status: TransactionDecision;
  metadata: Record<string, unknown> | null;
  scored_at: string;
  created_at: string;
}

export interface RiskRule {
  id: string;
  name: string;
  description: string | null;
  condition: Record<string, unknown>;
  action: "approve" | "decline" | "review" | "flag";
  score_impact: number;
  is_active: boolean;
  priority: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FraudCase {
  id: string;
  transaction_id: string;
  status: FraudCaseStatus;
  assigned_to: string | null;
  priority: FraudCasePriority;
  notes: Array<Record<string, unknown>>;
  resolution: string | null;
  created_at: string;
  updated_at: string;
}
