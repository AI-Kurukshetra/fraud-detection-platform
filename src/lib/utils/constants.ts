import type { NavItem, RiskLevel } from "@/lib/types/api";

export const DASHBOARD_NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/transactions", label: "Transactions" },
  { href: "/dashboard/merchants", label: "Merchants" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/devices", label: "Devices" },
  { href: "/dashboard/cases", label: "Cases" },
  { href: "/dashboard/rules", label: "Rules" },
  { href: "/dashboard/alerts", label: "Alerts" },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/settings", label: "Settings" }, // Whitelist/Blacklist
];

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  low: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-rose-100 text-rose-800",
};

export const DECISION_THRESHOLDS = {
  approve: 30,
  review: 70,
};
