"use client";

import { Bell, LogOut, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";

export function DashboardTopbar() {
  const { user, role, isDemoMode } = useAuth();

  async function onLogout() {
    if (isDemoMode) {
      window.location.href = "/login";
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b bg-white/70 px-6 py-4 backdrop-blur">
      <div>
        <h1 className="text-xl font-semibold text-slate-950">Fraud Operations Console</h1>
        <p className="text-sm text-slate-500">
          Monitor transactions, investigate cases, and manage rules in one place.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="rounded-xl border bg-white px-4 py-2">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            {user?.email ?? "demo@fraudops.local"}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <Badge variant="info">{role}</Badge>
            {isDemoMode ? <span>Demo mode</span> : <span>Supabase auth</span>}
          </div>
        </div>
        <Button variant="ghost" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
