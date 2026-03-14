import { ok } from "@/lib/api/response";

export async function GET() {
  return ok({
    message:
      "Supabase SSR auth is handled through client/server helpers and middleware. This route exists as an integration placeholder.",
  });
}
