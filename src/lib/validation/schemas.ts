import { z } from "zod";

export const transactionSchema = z.object({
  merchantId: z.string().min(1),
  externalTransactionId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3),
  paymentMethodType: z.string().min(1),
  channel: z.enum(["web", "mobile", "api", "pos"]).optional(),
  billingCountry: z.string().length(2).optional().nullable(),
  shippingCountry: z.string().length(2).optional().nullable(),
  ipAddress: z.string().min(7),
  deviceId: z.string().optional().nullable(),
  userAccountId: z.string().min(1),
  cardBin: z.string().max(8).optional().nullable(),
  cardLast4: z.string().max(4).optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
  email: z.string().email().optional().nullable(),
  timezone: z.string().optional().nullable(),
});

export const deviceFingerprintSchema = z.object({
  fingerprintHash: z.string().min(3),
  browser: z.string().optional().nullable(),
  os: z.string().optional().nullable(),
  screenResolution: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
  webglHash: z.string().optional().nullable(),
  canvasHash: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
  isBot: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional(),
});

export const ruleSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional().nullable(),
  condition: z.record(z.unknown()),
  action: z.enum(["approve", "decline", "review", "flag"]),
  scoreImpact: z.number().int().min(-100).max(100),
  isActive: z.boolean().default(true),
  priority: z.number().int().min(1).max(100),
});

export const caseUpdateSchema = z.object({
  status: z
    .enum(["open", "investigating", "confirmed_fraud", "false_positive", "closed"])
    .optional(),
  assignedTo: z.string().optional().nullable(),
  note: z.string().min(3).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
});

export const webhookSchema = z.object({
  merchantId: z.string().min(1),
  webhookUrl: z.string().url(),
});
