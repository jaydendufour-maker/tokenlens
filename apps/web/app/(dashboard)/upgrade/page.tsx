import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { getPlan } from "@/lib/data";
import { LS_CHECKOUT_URL } from "@/lib/site";
import { UpgradeOptions } from "./upgrade-options";

export default async function UpgradePage() {
  const plan = await getPlan();

  if (plan === "pro") {
    return (
      <div className="max-w-2xl space-y-4">
        <h1 className="text-xl font-semibold">Je zit op Pro 🎉</h1>
        <p className="text-sm text-neutral-400">
          Volledige kosten-breakdown en budget-alerts staan open.
        </p>
        <Link
          href="/dashboard"
          className="inline-block rounded-md bg-white text-neutral-900 text-sm font-medium px-4 py-2 hover:bg-neutral-200"
        >
          Naar dashboard
        </Link>
      </div>
    );
  }

  const sb = await createServerSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  const cardUrl =
    LS_CHECKOUT_URL && user
      ? `${LS_CHECKOUT_URL}?checkout[custom][user_id]=${user.id}`
      : "";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Upgrade naar Pro — $29/mo</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Kosten-breakdown per klant, feature &amp; team + budget-alerts
          (email/webhook). Geen proefperiode, maandelijks opzegbaar.
        </p>
      </div>

      <UpgradeOptions cardUrl={cardUrl} />

      <ul className="text-sm text-neutral-400 space-y-1.5 border-t border-neutral-800 pt-5">
        <li>· Wie/wat je LLM-rekening opvreet — per klant, feature en team</li>
        <li>· Budget-alerts via e-mail en webhook</li>
        <li>· Onbeperkt events &amp; projecten</li>
      </ul>
    </div>
  );
}
