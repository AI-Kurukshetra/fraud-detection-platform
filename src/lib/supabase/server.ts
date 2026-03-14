import { cookies } from "next/headers";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";

import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  hasSupabaseEnv,
} from "@/lib/supabase/env";

export async function createServerSupabaseClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const cookieStore = await cookies();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
  };

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: cookieMethods,
  });
}

export function createServiceRoleClient() {
  if (!hasSupabaseEnv() || !getSupabaseServiceRoleKey()) {
    return null;
  }

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return [];
    },
  };

  return createServerClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    cookies: cookieMethods,
  });
}
