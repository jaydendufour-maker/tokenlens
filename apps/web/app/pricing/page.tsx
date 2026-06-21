import Link from "next/link";
import type { Metadata } from "next";
import { MODELS, COMPARISONS, perMillion, modelBySlug } from "@/lib/models";
import { SiteHeader, SiteFooter, CtaBanner } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "LLM pricing — OpenAI & Anthropic cost per 1M tokens (2026)",
  description:
    "Pricing for GPT-5.5, GPT-5.4, Claude Opus 4.8, Sonnet 4.6 and legacy models. Input/output cost per 1M tokens with a free calculator.",
};

export default function PricingIndex() {
  return (
    <div className="flex-1 bg-neutral-950 text-neutral-100">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">LLM pricing</h1>
        <p className="mt-3 text-neutral-400">
          Input / output cost per 1M tokens for the most-used models. Click a
          model for a calculator. Prices change — verify with the provider.
        </p>
        <p className="mt-2 text-xs text-neutral-600">
          Standard API rates verified 21 June 2026. Cached, batch, priority and
          regional pricing can differ.
        </p>

        <div className="mt-8 overflow-hidden rounded-xl border border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900 text-neutral-400">
              <tr>
                <th className="text-left font-medium px-4 py-3">Model</th>
                <th className="text-left font-medium px-4 py-3">Provider</th>
                <th className="text-right font-medium px-4 py-3">Input /1M</th>
                <th className="text-right font-medium px-4 py-3">Output /1M</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {MODELS.map((m) => (
                <tr key={m.slug} className="hover:bg-neutral-900/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/pricing/${m.slug}`}
                      className="font-medium hover:text-emerald-400"
                    >
                      {m.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{m.provider}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {perMillion(m.in)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {perMillion(m.out)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-12 text-xl font-semibold">Popular comparisons</h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {COMPARISONS.map(([a, b]) => {
            const ma = modelBySlug(a);
            const mb = modelBySlug(b);
            if (!ma || !mb) return null;
            return (
              <Link
                key={`${a}-${b}`}
                href={`/compare/${a}-vs-${b}`}
                className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm hover:border-neutral-600"
              >
                {ma.name} <span className="text-neutral-500">vs</span> {mb.name}
              </Link>
            );
          })}
        </div>

        <div className="mt-12">
          <CtaBanner />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
