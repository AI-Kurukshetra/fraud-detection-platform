import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSummary } from "@/lib/demo/data";

export default function ReportsPage() {
  const summary = getSummary();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Reports</h2>
        <p className="text-sm text-slate-500">
          Compliance and operational reporting snapshot for the MVP.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Daily transaction volume", value: summary.totalToday },
          { label: "Fraud rate", value: `${summary.fraudRate}%` },
          { label: "Average risk", value: summary.avgRisk },
          { label: "False positive rate", value: `${summary.falsePositiveRate}%` },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardTitle>{item.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-slate-950">{item.value}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
