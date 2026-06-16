import Link from "next/link";

const PRICE = "$29/mo";

/** Volledige upgrade-gate voor een Pro-only feature (bv. alerts). */
export function UpgradeGate({
  feature,
  description,
}: {
  feature: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/10 p-10 text-center">
      <div className="text-2xl">🔒</div>
      <h2 className="mt-3 text-lg font-medium">{feature} is een Pro-feature</h2>
      <p className="mt-2 text-sm text-neutral-400 max-w-md mx-auto">
        {description}
      </p>
      <Link
        href="/pricing"
        className="inline-block mt-5 rounded-md bg-white text-neutral-900 text-sm font-medium px-5 py-2 hover:bg-neutral-200"
      >
        Upgrade naar Pro — {PRICE}
      </Link>
      <p className="mt-2 text-xs text-neutral-600">Geen proefperiode. Maandelijks opzegbaar.</p>
    </div>
  );
}

/** Geblurde teaser van de kosten-breakdown voor Free-users. */
export function LockedBreakdown() {
  const fake = [
    ["acme-inc", 72],
    ["globex", 48],
    ["initech", 27],
    ["umbrella", 14],
  ] as const;
  const card = (title: string) => (
    <div className="relative bg-neutral-900 border border-neutral-800 rounded-xl p-5 overflow-hidden">
      <h3 className="text-sm font-medium text-neutral-300 mb-4">{title}</h3>
      <ul className="space-y-2.5 blur-sm select-none" aria-hidden>
        {fake.map(([label, w]) => (
          <li key={label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-neutral-200">{label}</span>
              <span className="text-neutral-400">$••.••</span>
            </div>
            <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${w}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {card("Top klanten")}
        {card("Top features")}
        {card("Per model")}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-xl border border-emerald-800/60 bg-neutral-950/80 backdrop-blur-sm p-6 text-center max-w-sm">
          <div className="text-xl">🔒</div>
          <h3 className="mt-2 font-medium">
            Zie wie je rekening opvreet
          </h3>
          <p className="mt-1.5 text-sm text-neutral-400">
            De breakdown per klant, feature en model is een Pro-feature.
          </p>
          <Link
            href="/pricing"
            className="inline-block mt-4 rounded-md bg-white text-neutral-900 text-sm font-medium px-5 py-2 hover:bg-neutral-200"
          >
            Upgrade naar Pro — {PRICE}
          </Link>
        </div>
      </div>
    </div>
  );
}
