import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const endpoints = [
  {
    method: "POST",
    path: "/api/transactions",
    description: "Submit a transaction for real-time fraud scoring.",
  },
  {
    method: "GET",
    path: "/api/transactions/:id",
    description: "Fetch stored scoring results for a transaction.",
  },
  {
    method: "POST",
    path: "/api/devices",
    description: "Register or lookup a device fingerprint.",
  },
  {
    method: "GET",
    path: "/api/reports/summary",
    description: "Return KPI summary data for dashboards or merchants.",
  },
  {
    method: "POST",
    path: "/api/webhooks",
    description: "Register merchant webhook callbacks.",
  },
];

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="max-w-3xl space-y-3">
        <h1 className="text-4xl font-semibold text-slate-950">API Documentation</h1>
        <p className="text-slate-600">
          Use the merchant API key in the `x-api-key` header. All responses follow the
          envelope `{` success, data, error, meta `}`.
        </p>
      </div>

      <div className="mt-10 grid gap-4">
        {endpoints.map((endpoint) => (
          <Card key={endpoint.path}>
            <CardHeader>
              <CardTitle className="font-mono text-base">
                {endpoint.method} {endpoint.path}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">{endpoint.description}</CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
