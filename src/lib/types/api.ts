import type { Route } from "next";

export type Role = "admin" | "analyst" | "viewer";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type TransactionDecision = "approved" | "declined" | "review";
export type FraudCaseStatus =
  | "open"
  | "investigating"
  | "confirmed_fraud"
  | "false_positive"
  | "closed";
export type FraudCasePriority = "low" | "medium" | "high" | "critical";

export interface NavItem {
  href: Route;
  label: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  meta?: Record<string, unknown>;
}

export interface TransactionInput {
  merchantId: string;
  externalTransactionId: string;
  amount: number;
  currency: string;
  paymentMethodType: string;
  channel?: "web" | "mobile" | "api" | "pos";
  billingCountry?: string | null;
  shippingCountry?: string | null;
  ipAddress: string;
  deviceId?: string | null;
  userAccountId: string;
  cardBin?: string | null;
  cardLast4?: string | null;
  metadata?: Record<string, unknown>;
  email?: string | null;
  timezone?: string | null;
}

export interface ScoreBreakdown {
  velocityScore: number;
  deviceScore: number;
  geoScore: number;
  ruleScore: number;
  mlScore: number;
  behavioralScore: number;
}

export interface ScoringResult {
  overallScore: number;
  riskLevel: RiskLevel;
  decision: TransactionDecision;
  breakdown: ScoreBreakdown;
  triggeredRules: string[];
  reasons: string[];
}
