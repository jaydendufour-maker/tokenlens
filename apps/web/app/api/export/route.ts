import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getPlan } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_RANGES = new Set([7, 30, 90, 365]);
const ROW_CAP = 50_000;

interface EventRow {
  ts: string;
  provider: string | null;
  model: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_usd: number | null;
  latency_ms: number | null;
  customer: string | null;
  feature: string | null;
  team: string | null;
}

const COLUMNS: (keyof EventRow)[] = [
  "ts",
  "provider",
  "model",
  "input_tokens",
  "output_tokens",
  "cost_usd",
  "latency_ms",
  "customer",
  "feature",
  "team",
];

/** Escape één CSV-veld (RFC 4180). */
function csvCell(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: NextRequest) {
  // Export = Pro-feature (de breakdown is óók Pro-only in het dashboard).
  const plan = await getPlan();
  if (plan !== "pro") {
    return NextResponse.json({ error: "pro_required" }, { status: 402 });
  }

  const url = new URL(req.url);
  const projectId = url.searchParams.get("project");
  if (!projectId) {
    return NextResponse.json({ error: "missing_project" }, { status: 400 });
  }
  // Custom range (from/to in YYYY-MM-DD) heeft voorrang op de presets.
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const isCustom = !!(from && to && isoDate.test(from) && isoDate.test(to));

  let since: string;
  let until: string | null;
  let rangeTag: string;
  if (isCustom) {
    since = new Date(`${from}T00:00:00Z`).toISOString();
    until = new Date(`${to}T23:59:59.999Z`).toISOString();
    rangeTag = `${from}_${to}`;
  } else {
    const days = Number(url.searchParams.get("range") ?? 30);
    const range = ALLOWED_RANGES.has(days) ? days : 30;
    since = new Date(Date.now() - range * 24 * 3600 * 1000).toISOString();
    until = null;
    rangeTag = `${range}d`;
  }

  const sb = await createServerSupabase();

  // RLS zorgt dat alleen eigen projecten zichtbaar zijn → 404 bij vreemd project.
  const { data: project } = await sb
    .from("projects")
    .select("id,name")
    .eq("id", projectId)
    .maybeSingle();
  if (!project) {
    return NextResponse.json({ error: "project_not_found" }, { status: 404 });
  }

  let query = sb
    .from("usage_events")
    .select(
      "ts,provider,model,input_tokens,output_tokens,cost_usd,latency_ms,customer,feature,team"
    )
    .eq("project_id", projectId)
    .gte("ts", since);
  if (until) query = query.lt("ts", until);
  const { data, error } = await query
    .order("ts", { ascending: true })
    .limit(ROW_CAP)
    .returns<EventRow[]>();

  if (error) {
    return NextResponse.json({ error: "query_failed" }, { status: 500 });
  }

  const rows = data ?? [];
  const lines = [COLUMNS.join(",")];
  for (const r of rows) {
    lines.push(COLUMNS.map((c) => csvCell(r[c])).join(","));
  }
  const csv = lines.join("\r\n") + "\r\n";

  const safeName = project.name.replace(/[^a-z0-9._-]+/gi, "_").slice(0, 40);
  const filename = `tokenlens_${safeName}_${rangeTag}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
