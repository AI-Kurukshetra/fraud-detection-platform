import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoLists } from "@/lib/demo/data";
import { formatDate } from "@/lib/utils/helpers";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Settings</h2>
        <p className="text-sm text-slate-500">
          Whitelist and blacklist management plus platform-level controls.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Entity lists</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {demoLists.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4">
              <div>
                <div className="font-medium text-slate-950">{item.entity_value}</div>
                <div className="text-sm text-slate-500">
                  {item.entity_type} · {item.reason}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={item.list_type === "blacklist" ? "danger" : "success"}>
                  {item.list_type}
                </Badge>
                <span className="text-sm text-slate-500">{formatDate(item.created_at)}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
