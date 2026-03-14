import Link from "next/link";
import { ArrowRight, ShieldAlert, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  "Real-time transaction scoring",
  "Configurable fraud rules engine",
  "Device fingerprinting and geo analysis",
  "Case management, alerts, and merchant APIs",
];

export default function HomePage() {
  return (
    <main className="grid-pattern min-h-screen">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center gap-8 px-6 py-20">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center rounded-full border bg-white/70 px-4 py-1 text-sm text-sky-700 shadow-sm backdrop-blur">
            Fraud ops for real-time transaction defense
          </div>
          <h1 className="text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            Detect suspicious payments before they become chargebacks.
          </h1>
          <p className="max-w-2xl text-lg text-slate-600">
            A Next.js and Supabase platform for scoring transactions, tracing device
            behavior, managing fraud queues, and exposing merchant-friendly APIs.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Open dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/docs">API docs</Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-glow">
            <CardHeader>
              <ShieldAlert className="h-5 w-5 text-sky-700" />
              <CardTitle>Risk-first workflows</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Cases, alerts, and scoring explanations stay aligned for analyst review.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Zap className="h-5 w-5 text-emerald-700" />
              <CardTitle>Fast merchant integration</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Score transactions through REST APIs with consistent, explainable responses.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Included in this MVP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              {features.map((feature) => (
                <div key={feature} className="rounded-lg bg-slate-50 px-3 py-2">
                  {feature}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
