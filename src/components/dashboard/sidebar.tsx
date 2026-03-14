"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  CreditCard,
  FileText,
  LayoutDashboard,
  ShieldAlert,
  SlidersHorizontal,
  Smartphone,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DASHBOARD_NAV } from "@/lib/utils/constants";

const iconMap = {
  Overview: LayoutDashboard,
  Transactions: CreditCard,
  Devices: Smartphone,
  Cases: ShieldAlert,
  Rules: SlidersHorizontal,
  Alerts: AlertTriangle,
  Reports: BarChart3,
  Settings: UsersRound,
};

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full max-w-72 flex-col border-r bg-white/80 p-4 backdrop-blur">
      <Link href="/dashboard" className="flex items-center gap-3 rounded-xl bg-slate-950 px-4 py-3 text-white">
        <div className="rounded-lg bg-white/10 p-2">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold">Fraud Detection</div>
          <div className="text-xs text-slate-300">Operations Console</div>
        </div>
      </Link>

      <div className="mt-6 flex-1 space-y-1">
        {DASHBOARD_NAV.map((item) => {
          const Icon = iconMap[item.label as keyof typeof iconMap] ?? LayoutDashboard;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-950",
                active && "bg-sky-50 text-sky-900",
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              {item.label === "Alerts" ? <Badge variant="warning">2</Badge> : null}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
