"use client";

import { useActionState } from "react";
import { createProjectAction, type CreateState } from "./actions";

const initial: CreateState = {};

export function NewProjectForm() {
  const [state, action, pending] = useActionState(createProjectAction, initial);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      <h3 className="text-sm font-medium text-neutral-300 mb-4">
        Nieuw project
      </h3>
      <form action={action} className="flex gap-2">
        <input
          name="name"
          placeholder="bv. JARVIS, Trading-bot"
          className="flex-1 rounded-md bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-neutral-600"
        />
        <button
          disabled={pending}
          className="rounded-md bg-white text-neutral-900 text-sm font-medium px-4 py-2 hover:bg-neutral-200 disabled:opacity-50"
        >
          {pending ? "…" : "Maken"}
        </button>
      </form>

      {state.error && (
        <p className="text-sm text-red-400 mt-3">{state.error}</p>
      )}

      {state.key && (
        <div className="mt-4 rounded-md border border-emerald-800 bg-emerald-950/30 p-4">
          <p className="text-sm text-emerald-300 font-medium">
            Bewaar deze API-key nu — hij wordt maar één keer getoond:
          </p>
          <code className="block mt-2 text-sm bg-neutral-950 border border-neutral-800 rounded px-3 py-2 break-all">
            {state.key}
          </code>
        </div>
      )}
    </div>
  );
}
