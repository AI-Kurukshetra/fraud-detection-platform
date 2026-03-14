import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard({
  title,
  value,
  change,
  direction = "up",
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  direction?: "up" | "down";
  icon: LucideIcon;
}) {
  const TrendIcon = direction === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        <Icon className="h-4 w-4 text-slate-400" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold text-slate-950">{value}</div>
        <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
          <TrendIcon className="h-4 w-4 text-emerald-600" />
          {change}
        </div>
      </CardContent>
    </Card>
  );
}
