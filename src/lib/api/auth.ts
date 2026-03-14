import { createHash } from "crypto";
import { headers } from "next/headers";

import { demoMerchants } from "@/lib/demo/data";
import { createServiceRoleClient } from "@/lib/supabase/server";

function hashApiKey(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function authenticateMerchant() {
  const requestHeaders = await headers();
  const apiKey = requestHeaders.get("x-api-key");
  const merchantId = requestHeaders.get("x-merchant-id");

  if (!apiKey) {
    return null;
  }

  const hashedKey = hashApiKey(apiKey);
  const supabase = createServiceRoleClient();

  if (supabase) {
    let query = supabase
      .from("merchants")
      .select("*")
      .or(`api_key_hash.eq.${hashedKey},api_key_hash.eq.${apiKey}`)
      .eq("status", "active");

    if (merchantId) {
      query = query.eq("id", merchantId);
    }

    const { data } = await query.maybeSingle();
    if (data) {
      return data;
    }
  }

  return (
    demoMerchants.find(
      (merchant) =>
        merchant.status === "active" &&
        (merchant.api_key_hash === apiKey || merchant.api_key_hash === hashedKey) &&
        (!merchantId || merchant.id === merchantId),
    ) ?? null
  );
}
