import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashApiKey } from "@/lib/api-key";

export const runtime = "nodejs";

interface IncomingEvent {
  ts?: string;
  provider?: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  latencyMs?: number;
  tags?: Record<string, string | number | undefined>;
}

function bearer(req: NextRequest): string | null {
  const h = req.headers.get("authorization") ?? "";
  return h.startsWith("Bearer ") ? h.slice(7).trim() : null;
}

export async function POST(req: NextRequest) {
  const key = bearer(req);
  if (!key) {
    return NextResponse.json({ error: "missing_api_key" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: project, error: projErr } = await admin
    .from("projects")
    .select("id")
    .eq("api_key_hash", hashApiKey(key))
    .single();

  if (projErr || !project) {
    return NextResponse.json({ error: "invalid_api_key" }, { status: 401 });
  }

  let body: { events?: IncomingEvent[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const events = Array.isArray(body.events) ? body.events : [];
  if (events.length === 0) {
    return NextResponse.json({ inserted: 0 });
  }
  if (events.length > 1000) {
    return NextResponse.json({ error: "batch_too_large" }, { status: 413 });
  }

  const rows = events.map((e) => {
    const tags = e.tags ?? {};
    const str = (v: unknown) => (v == null ? null : String(v));
    return {
      project_id: project.id,
      ts: e.ts ?? new Date().toISOString(),
      provider: e.provider ?? "unknown",
      model: e.model ?? "unknown",
      input_tokens: Math.max(0, Math.round(e.inputTokens ?? 0)),
      output_tokens: Math.max(0, Math.round(e.outputTokens ?? 0)),
      cost_usd: Number.isFinite(e.costUsd) ? e.costUsd : 0,
      latency_ms: e.latencyMs ?? null,
      customer: str(tags.customer),
      feature: str(tags.feature),
      team: str(tags.team),
      tags,
    };
  });

  const { error: insErr } = await admin.from("usage_events").insert(rows);
  if (insErr) {
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }

  return NextResponse.json({ inserted: rows.length });
}
