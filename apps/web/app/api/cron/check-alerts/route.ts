import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendAlertEmail, sendWebhook, type AlertPayload } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AlertRow {
  id: string;
  project_id: string;
  name: string;
  tag_key: string;
  tag_value: string | null;
  period: string;
  threshold_usd: number;
  webhook_url: string | null;
  notify_email: string | null;
  last_triggered_at: string | null;
  projects: { name: string } | null;
}

/** Start van de huidige periode (UTC). */
function periodStart(period: string): Date {
  const now = new Date();
  if (period === "day") {
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
  }
  // default: month
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // niet geconfigureerd → dicht
  const fromHeader = (req.headers.get("authorization") ?? "").replace(
    /^Bearer\s+/i,
    ""
  );
  return fromHeader === secret;
}

async function run(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: alerts, error } = await admin
    .from("budget_alerts")
    .select(
      "id,project_id,name,tag_key,tag_value,period,threshold_usd,webhook_url,notify_email,last_triggered_at,projects(name)"
    )
    .returns<AlertRow[]>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let checked = 0;
  let triggered = 0;
  let deliveryFailed = 0;

  for (const a of alerts ?? []) {
    checked++;
    const start = periodStart(a.period);

    const { data: spend, error: spendErr } = await admin.rpc(
      "alert_current_spend",
      {
        p_project: a.project_id,
        p_tag_key: a.tag_key,
        p_tag_value: a.tag_value,
        p_since: start.toISOString(),
      }
    );
    if (spendErr) continue;

    const spendUsd = Number(spend ?? 0);
    const overBudget = spendUsd >= Number(a.threshold_usd);
    const alreadyFiredThisPeriod =
      a.last_triggered_at != null && new Date(a.last_triggered_at) >= start;

    if (!overBudget || alreadyFiredThisPeriod) continue;

    const scope =
      a.tag_key === "project" || !a.tag_value
        ? "whole project"
        : `${a.tag_key}=${a.tag_value}`;
    const payload: AlertPayload = {
      alert: a.name,
      project: a.projects?.name ?? a.project_id,
      scope,
      period: a.period,
      spendUsd,
      thresholdUsd: Number(a.threshold_usd),
    };

    const deliveries: boolean[] = [];
    if (a.webhook_url) deliveries.push(await sendWebhook(a.webhook_url, payload));
    if (a.notify_email) deliveries.push(await sendAlertEmail(a.notify_email, payload));
    if (deliveries.length === 0 || !deliveries.some(Boolean)) {
      deliveryFailed++;
      continue;
    }

    await admin
      .from("budget_alerts")
      .update({ last_triggered_at: new Date().toISOString() })
      .eq("id", a.id);

    triggered++;
  }

  return NextResponse.json({ ok: true, checked, triggered, deliveryFailed });
}

export const GET = run;
export const POST = run;
