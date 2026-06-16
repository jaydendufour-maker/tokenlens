"use client";

import { useActionState, useState } from "react";
import { createAlertAction, type AlertFormState } from "./actions";
import type { Project } from "@/lib/data";

const initial: AlertFormState = {};

const inputCls =
  "w-full rounded-md bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-neutral-600";

export function AlertForm({ projects }: { projects: Project[] }) {
  const [state, action, pending] = useActionState(createAlertAction, initial);
  const [tagKey, setTagKey] = useState("project");

  if (projects.length === 0) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 text-sm text-neutral-400">
        Maak eerst een project aan om alerts in te stellen.
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      <h3 className="text-sm font-medium text-neutral-300 mb-4">Nieuwe alert</h3>
      <form action={action} className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-neutral-500">Project</span>
            <select name="project_id" className={inputCls} required>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-neutral-500">Naam</span>
            <input
              name="name"
              placeholder="bv. Maandbudget Acme"
              className={inputCls}
              required
            />
          </label>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="text-xs text-neutral-500">Scope</span>
            <select
              name="tag_key"
              value={tagKey}
              onChange={(e) => setTagKey(e.target.value)}
              className={inputCls}
            >
              <option value="project">Hele project</option>
              <option value="customer">Klant</option>
              <option value="feature">Feature</option>
              <option value="team">Team</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-neutral-500">
              {tagKey === "project" ? "—" : "Waarde"}
            </span>
            <input
              name="tag_value"
              disabled={tagKey === "project"}
              placeholder={tagKey === "project" ? "n.v.t." : `bv. acme-inc`}
              className={`${inputCls} disabled:opacity-40`}
            />
          </label>
          <label className="block">
            <span className="text-xs text-neutral-500">Periode</span>
            <select name="period" className={inputCls} defaultValue="month">
              <option value="month">Per maand</option>
              <option value="day">Per dag</option>
            </select>
          </label>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="text-xs text-neutral-500">Drempel (USD)</span>
            <input
              name="threshold_usd"
              type="number"
              step="0.01"
              min="0"
              placeholder="100"
              className={inputCls}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs text-neutral-500">E-mail (optioneel)</span>
            <input
              name="notify_email"
              type="email"
              placeholder="jij@mail.com"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="text-xs text-neutral-500">Webhook (optioneel)</span>
            <input
              name="webhook_url"
              type="url"
              placeholder="https://…"
              className={inputCls}
            />
          </label>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            disabled={pending}
            className="rounded-md bg-white text-neutral-900 text-sm font-medium px-4 py-2 hover:bg-neutral-200 disabled:opacity-50"
          >
            {pending ? "…" : "Alert maken"}
          </button>
          {state.error && (
            <span className="text-sm text-red-400">{state.error}</span>
          )}
          {state.ok && (
            <span className="text-sm text-emerald-400">Alert opgeslagen.</span>
          )}
        </div>
      </form>
    </div>
  );
}
