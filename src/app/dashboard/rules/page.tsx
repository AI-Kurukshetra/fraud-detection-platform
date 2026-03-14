import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoRules } from "@/lib/demo/data";

export default function RulesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Risk rules</h2>
          <p className="text-sm text-slate-500">
            CRUD-ready rules inventory for configurable fraud logic.
          </p>
        </div>
        <Button>Add rule</Button>
      </div>
      <div className="grid gap-4">
        {demoRules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>{rule.name}</CardTitle>
                <p className="text-sm text-slate-500">{rule.description}</p>
              </div>
              <Badge variant={rule.is_active ? "success" : "default"}>
                {rule.is_active ? "Active" : "Inactive"}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600">
              <code className="rounded-lg bg-slate-100 px-3 py-2">
                {JSON.stringify(rule.condition)}
              </code>
              <div>Action: {rule.action}</div>
              <div>Score impact: +{rule.score_impact}</div>
              <div>Priority: {rule.priority}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
