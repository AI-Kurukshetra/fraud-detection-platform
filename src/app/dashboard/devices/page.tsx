"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/helpers";

interface Device {
  id: string;
  fingerprint_hash: string;
  browser: string | null;
  os: string | null;
  screen_resolution: string | null;
  timezone: string | null;
  language: string | null;
  user_agent: string | null;
  is_bot: boolean;
  risk_score: number;
  first_seen_at: string;
  last_seen_at: string;
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/devices")
      .then((r) => r.json())
      .then((j) => { if (j.success) setDevices(j.data ?? []); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950">Devices</h2>
        <p className="text-sm text-slate-500">
          Fingerprints, recent activity, and device-level risk indicators.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading devices...</p>
      ) : devices.length === 0 ? (
        <p className="text-sm text-slate-400">No devices found.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {devices.map((device) => (
            <Card key={device.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{device.browser ?? "Unknown browser"}</CardTitle>
                  <div className="flex gap-1.5">
                    {device.is_bot && <Badge variant="danger">Bot</Badge>}
                    <Badge
                      variant={
                        device.risk_score >= 80
                          ? "danger"
                          : device.risk_score >= 50
                          ? "warning"
                          : "success"
                      }
                    >
                      {device.risk_score}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5 text-sm text-slate-600">
                <p className="font-mono text-xs text-slate-400 truncate" title={device.fingerprint_hash}>
                  {device.fingerprint_hash.slice(0, 24)}…
                </p>
                <p>OS: {device.os ?? "—"}</p>
                <p>Resolution: {device.screen_resolution ?? "—"}</p>
                <p>Timezone: {device.timezone ?? "—"}</p>
                <p>Language: {device.language ?? "—"}</p>
                <p className="text-xs text-slate-400">First seen: {formatDate(device.first_seen_at)}</p>
                <p className="text-xs text-slate-400">Last seen: {formatDate(device.last_seen_at)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
