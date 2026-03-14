import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function RegisterPage() {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/dashboard");
    }
  }

  return (
    <main className="grid-pattern flex min-h-screen items-center justify-center px-6 py-12">
      <div className="space-y-6">
        <AuthForm mode="register" />
        <p className="text-center text-sm text-slate-500">
          Already have access?{" "}
          <Link className="font-medium text-sky-700" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
