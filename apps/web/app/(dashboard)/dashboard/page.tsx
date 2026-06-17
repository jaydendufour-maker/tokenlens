import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { getProjects, getPlan } from "@/lib/data";
import { usd, num } from "@/lib/format";
import { LockedBreakdown } from "@/components/upgrade";

interface DimRow {
  label: string;
  cost: number;
  events: number;
}

function DimTable({ title, rows }: { title: string; rows: DimRow[] }) {
  const max = Math.max(...rows.map((r) => Number(r.cost)), 0.000001);
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      <h3 className="text-sm font-medium text-neutral-300 mb-4">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-neutral-500">Nog geen data.</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="truncate text-neutral-200">{r.label}</span>
                <span className="text-neutral-400 tabular-nums">
                  {usd(r.cost)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${(Number(r.cost) / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      <div className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      <div className="text-2xl font-semibold mt-1 tabular-nums">{value}</div>
    </div>
  );
}

const RANGES: { days: number; label: string; short: string }[] = [
  { days: 7, label: "Laatste 7 dagen", short: "7d" },
  { days: 30, label: "Laatste 30 dagen", short: "30d" },
  { days: 90, label: "Laatste 90 dagen", short: "90d" },
  { days: 365, label: "Laatste 12 maanden", short: "1j" },
];

export default async function Overview({
  searchParams,
}: {
  searchParams: Promise<{
    project?: string;
    range?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const {
    project: projectParam,
    range: rangeParam,
    from: fromParam,
    to: toParam,
  } = await searchParams;
  const projects = await getProjects();

  if (projects.length === 0) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-10 text-center">
        <h2 className="text-lg font-medium">Nog geen project</h2>
        <p className="text-sm text-neutral-400 mt-2">
          Maak een project aan om je API-key te krijgen en kosten te tracken.
        </p>
        <Link
          href="/projects"
          className="inline-block mt-5 rounded-md bg-white text-neutral-900 text-sm font-medium px-4 py-2 hover:bg-neutral-200"
        >
          Project maken
        </Link>
      </div>
    );
  }

  const project =
    projects.find((p) => p.id === projectParam) ?? projects[0];

  // Custom range (from/to in YYYY-MM-DD) heeft voorrang op de presets.
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  const customFrom = fromParam && isoDate.test(fromParam) ? fromParam : null;
  const customTo = toParam && isoDate.test(toParam) ? toParam : null;
  const isCustom = Boolean(customFrom && customTo);

  const activeRange =
    RANGES.find((r) => String(r.days) === rangeParam) ?? RANGES[1];

  let since: string;
  let until: string | null;
  let rangeLabel: string;
  let rangeShort: string;
  if (isCustom) {
    since = new Date(`${customFrom}T00:00:00Z`).toISOString();
    until = new Date(`${customTo}T23:59:59.999Z`).toISOString();
    rangeLabel = `${customFrom} – ${customTo}`;
    rangeShort = "custom";
  } else {
    // eslint-disable-next-line react-hooks/purity -- server component: huidige tijd is bedoeld
    since = new Date(
      Date.now() - activeRange.days * 24 * 3600 * 1000
    ).toISOString();
    until = null; // RPC's gebruiken now() als bovengrens
    rangeLabel = activeRange.label;
    rangeShort = activeRange.short;
  }

  // Querystring die de huidige tijdsweergave bewaart (preset of custom).
  const viewQs = isCustom
    ? `from=${customFrom}&to=${customTo}`
    : `range=${activeRange.days}`;

  const sb = await createServerSupabase();
  const plan = await getPlan();
  const isPro = plan === "pro";

  // KPI's + grafiek zijn gratis (de teaser). De breakdown is Pro-only.
  const [summary, ts] = await Promise.all([
    sb.rpc("cost_summary", { p_project: project.id, p_since: since, p_until: until }),
    sb.rpc("cost_timeseries", {
      p_project: project.id,
      p_since: since,
      p_until: until,
    }),
  ]);

  const [byCustomer, byFeature, byModel] = isPro
    ? await Promise.all([
        sb.rpc("cost_by_dimension", {
          p_project: project.id,
          p_since: since,
          p_until: until,
          p_dim: "customer",
        }),
        sb.rpc("cost_by_dimension", {
          p_project: project.id,
          p_since: since,
          p_until: until,
          p_dim: "feature",
        }),
        sb.rpc("cost_by_dimension", {
          p_project: project.id,
          p_since: since,
          p_until: until,
          p_dim: "model",
        }),
      ])
    : [null, null, null];

  const s = (summary.data?.[0] as
    | { total_cost: number; total_events: number; total_tokens: number }
    | undefined) ?? { total_cost: 0, total_events: 0, total_tokens: 0 };
  const series = (ts.data as { day: string; cost: number }[] | null) ?? [];
  const maxDay = Math.max(...series.map((d) => Number(d.cost)), 0.000001);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">{project.name}</h1>
          <p className="text-sm text-neutral-500">{rangeLabel}</p>
        </div>
        {projects.length > 1 && (
          <nav className="flex gap-2 flex-wrap">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard?project=${p.id}&${viewQs}`}
                className={`text-xs rounded-full px-3 py-1 border ${
                  p.id === project.id
                    ? "bg-neutral-100 text-neutral-900 border-neutral-100"
                    : "border-neutral-700 text-neutral-400 hover:text-neutral-100"
                }`}
              >
                {p.name}
              </Link>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <nav className="flex gap-1.5 flex-wrap items-center">
          {RANGES.map((r) => (
            <Link
              key={r.days}
              href={`/dashboard?project=${project.id}&range=${r.days}`}
              className={`text-xs rounded-md px-2.5 py-1 border ${
                !isCustom && r.days === activeRange.days
                  ? "bg-neutral-100 text-neutral-900 border-neutral-100"
                  : "border-neutral-700 text-neutral-400 hover:text-neutral-100"
              }`}
            >
              {r.short}
            </Link>
          ))}
          <form method="get" action="/dashboard" className="flex items-center gap-1.5 ml-1">
            <input type="hidden" name="project" value={project.id} />
            <input
              type="date"
              name="from"
              defaultValue={customFrom ?? ""}
              className="text-xs rounded-md bg-neutral-900 border border-neutral-700 px-2 py-1 text-neutral-300"
            />
            <span className="text-neutral-600 text-xs">–</span>
            <input
              type="date"
              name="to"
              defaultValue={customTo ?? ""}
              className="text-xs rounded-md bg-neutral-900 border border-neutral-700 px-2 py-1 text-neutral-300"
            />
            <button
              type="submit"
              className={`text-xs rounded-md px-2.5 py-1 border ${
                isCustom
                  ? "bg-neutral-100 text-neutral-900 border-neutral-100"
                  : "border-neutral-700 text-neutral-400 hover:text-neutral-100"
              }`}
            >
              Pas toe
            </button>
          </form>
        </nav>
        {isPro && (
          <a
            href={`/api/export?project=${project.id}&${viewQs}`}
            className="text-xs rounded-md px-3 py-1 border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500"
          >
            ↓ Export CSV
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Kpi label={`Kosten (${rangeShort})`} value={usd(s.total_cost)} />
        <Kpi label="Calls" value={num(s.total_events)} />
        <Kpi label="Tokens" value={num(s.total_tokens)} />
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <h3 className="text-sm font-medium text-neutral-300 mb-4">
          Kosten per dag
        </h3>
        {series.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Nog geen events — stuur je eerste call via de SDK.
          </p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {series.map((d) => (
              <div
                key={d.day}
                title={`${d.day}: ${usd(d.cost)}`}
                className="flex-1 bg-emerald-500/80 hover:bg-emerald-400 rounded-t"
                style={{
                  height: `${Math.max((Number(d.cost) / maxDay) * 100, 2)}%`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {isPro ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DimTable
            title="Top klanten"
            rows={(byCustomer?.data as DimRow[] | null) ?? []}
          />
          <DimTable
            title="Top features"
            rows={(byFeature?.data as DimRow[] | null) ?? []}
          />
          <DimTable
            title="Per model"
            rows={(byModel?.data as DimRow[] | null) ?? []}
          />
        </div>
      ) : (
        <LockedBreakdown />
      )}
    </div>
  );
}
