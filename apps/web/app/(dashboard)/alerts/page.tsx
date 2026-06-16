import { createServerSupabase } from "@/lib/supabase/server";
import { getProjects, getPlan } from "@/lib/data";
import { usd } from "@/lib/format";
import { AlertForm } from "./alert-form";
import { deleteAlertAction } from "./actions";
import { UpgradeGate } from "@/components/upgrade";

interface AlertRow {
  id: string;
  project_id: string;
  name: string;
  tag_key: string;
  tag_value: string | null;
  period: string;
  threshold_usd: number;
  notify_email: string | null;
  webhook_url: string | null;
  last_triggered_at: string | null;
}

function periodStart(period: string): Date {
  const now = new Date();
  if (period === "day") {
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
  }
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export default async function AlertsPage() {
  const plan = await getPlan();
  if (plan !== "pro") {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-xl font-semibold">Budget alerts</h1>
          <p className="text-sm text-neutral-500">
            Krijg een mail of webhook voordat je rekening ontploft.
          </p>
        </div>
        <UpgradeGate
          feature="Budget alerts"
          description="Stel drempels in per project, klant, feature of team en word gewaarschuwd vóór de rekening komt — via e-mail of webhook."
        />
      </div>
    );
  }

  const projects = await getProjects();
  const sb = await createServerSupabase();
  const projName = new Map(projects.map((p) => [p.id, p.name]));

  const { data: alertsData } = await sb
    .from("budget_alerts")
    .select(
      "id,project_id,name,tag_key,tag_value,period,threshold_usd,notify_email,webhook_url,last_triggered_at"
    )
    .order("created_at", { ascending: false });
  const alerts = (alertsData as AlertRow[] | null) ?? [];

  // huidige spend per alert (parallel)
  const spends = await Promise.all(
    alerts.map((a) =>
      sb
        .rpc("alert_current_spend", {
          p_project: a.project_id,
          p_tag_key: a.tag_key,
          p_tag_value: a.tag_value,
          p_since: periodStart(a.period).toISOString(),
        })
        .then((r) => Number(r.data ?? 0))
    )
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold">Budget alerts</h1>
        <p className="text-sm text-neutral-500">
          Krijg een mail of webhook zodra de spend van een project, klant,
          feature of team je drempel overschrijdt — vóór de rekening komt.
        </p>
      </div>

      <AlertForm projects={projects} />

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl divide-y divide-neutral-800">
        {alerts.length === 0 ? (
          <p className="text-sm text-neutral-500 p-5">Nog geen alerts.</p>
        ) : (
          alerts.map((a, i) => {
            const spend = spends[i];
            const pct = Math.min(
              (spend / Number(a.threshold_usd)) * 100,
              100
            );
            const over = spend >= Number(a.threshold_usd);
            const scope =
              a.tag_key === "project" || !a.tag_value
                ? "Hele project"
                : `${a.tag_key}=${a.tag_value}`;
            return (
              <div key={a.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium flex items-center gap-2">
                      {a.name}
                      {over && (
                        <span className="text-xs rounded-full bg-red-950 text-red-300 px-2 py-0.5">
                          over budget
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5">
                      {projName.get(a.project_id) ?? "?"} · {scope} ·{" "}
                      {a.period === "day" ? "per dag" : "per maand"}
                      {a.notify_email ? " · ✉" : ""}
                      {a.webhook_url ? " · webhook" : ""}
                    </div>
                  </div>
                  <form action={deleteAlertAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <button className="text-xs text-neutral-500 hover:text-red-400">
                      Verwijderen
                    </button>
                  </form>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-neutral-400 mb-1 tabular-nums">
                    <span>
                      {usd(spend)} / {usd(a.threshold_usd)}
                    </span>
                    <span>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className={`h-full ${
                        over ? "bg-red-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
