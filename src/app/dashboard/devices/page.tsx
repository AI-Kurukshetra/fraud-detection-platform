import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoDevices } from "@/lib/demo/data";
import { formatDate } from "@/lib/utils/helpers";

export default function DevicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Devices</h2>
        <p className="text-sm text-slate-500">
          Fingerprints, recent activity, and device-level risk indicators.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {demoDevices.map((device) => (
          <Card key={device.id}>
            <CardHeader>
              <CardTitle>{device.browser}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p>Fingerprint: {device.fingerprint_hash}</p>
              <p>OS: {device.os}</p>
              <p>Timezone: {device.timezone}</p>
              <p>Risk score: {device.risk_score}</p>
              <p>Bot signals: {device.is_bot ? "Detected" : "None"}</p>
              <p>Last seen: {formatDate(device.last_seen_at)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
