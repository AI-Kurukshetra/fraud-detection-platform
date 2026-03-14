import { randomUUID } from "crypto";

import { fail, ok } from "@/lib/api/response";
import { demoDevices } from "@/lib/demo/data";
import { scoreDeviceRisk } from "@/lib/scoring/device";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { deviceFingerprintSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = deviceFingerprintSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Invalid device fingerprint payload.", 422, {
      issues: parsed.error.flatten(),
    });
  }

  const deviceRisk = scoreDeviceRisk({
    isBot: parsed.data.isBot,
    deviceAgeHours: 0,
    accountsSeen: Number(parsed.data.metadata?.accounts_seen ?? 1),
  });

  const supabase = createServiceRoleClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("devices")
      .upsert(
        {
          id: randomUUID(),
          fingerprint_hash: parsed.data.fingerprintHash,
          browser: parsed.data.browser ?? null,
          os: parsed.data.os ?? null,
          screen_resolution: parsed.data.screenResolution ?? null,
          timezone: parsed.data.timezone ?? null,
          language: parsed.data.language ?? null,
          webgl_hash: parsed.data.webglHash ?? null,
          canvas_hash: parsed.data.canvasHash ?? null,
          user_agent: parsed.data.userAgent ?? null,
          is_bot: parsed.data.isBot,
          risk_score: deviceRisk.score,
          metadata: parsed.data.metadata ?? {},
          last_seen_at: new Date().toISOString(),
        },
        {
          onConflict: "fingerprint_hash",
        },
      )
      .select()
      .maybeSingle();

    if (error) {
      return fail(error.message, 500);
    }

    return ok({
      device: data,
      scoring: deviceRisk,
    });
  }

  const device = demoDevices.find((item) => item.fingerprint_hash === parsed.data.fingerprintHash);
  return ok({
    device:
      device ??
      ({
        id: "demo-device",
        fingerprint_hash: parsed.data.fingerprintHash,
        risk_score: deviceRisk.score,
      } as const),
    scoring: deviceRisk,
  });
}
