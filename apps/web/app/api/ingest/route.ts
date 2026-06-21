import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashApiKey } from "@/lib/api-key";
import { MAX_BODY_BYTES, parseIngestBody } from "@/lib/ingest-validation";

export const runtime = "nodejs";

function bearer(req: NextRequest): string | null {
  const h = req.headers.get("authorization") ?? "";
  return h.startsWith("Bearer ") ? h.slice(7).trim() : null;
}

export async function POST(req: NextRequest) {
  const key = bearer(req);
  if (!key) {
    return NextResponse.json({ error: "missing_api_key" }, { status: 401 });
  }
  if (key.length > 128) {
    return NextResponse.json({ error: "invalid_api_key" }, { status: 401 });
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

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = parseIngestBody(raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }
  if (parsed.events.length === 0) {
    return NextResponse.json({ inserted: 0 });
  }
  const rows = parsed.events.map((event) => ({ project_id: project.id, ...event }));

  const { error: insErr } = await admin.from("usage_events").insert(rows);
  if (insErr) {
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }

  return NextResponse.json({ inserted: rows.length });
}
