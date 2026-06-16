import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COMPARISONS, modelBySlug, perMillion, calcCost } from "@/lib/models";
import { SiteHeader, SiteFooter, CtaBanner } from "@/components/site-chrome";

export function generateStaticParams() {
  return COMPARISONS.map(([a, b]) => ({ slug: `${a}-vs-${b}` }));
}

function parse(slug: string) {
  const [a, b] = slug.split("-vs-");
  const ma = a ? modelBySlug(a) : undefined;
  const mb = b ? modelBySlug(b) : undefined;
  return ma && mb ? { ma, mb } : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = parse(slug);
  if (!p) return { title: "Comparison not found" };
  return {
    title: `${p.ma.name} vs ${p.mb.name} — pricing & cost comparison`,
    description: `Compare ${p.ma.name} and ${p.mb.name} on input/output cost per 1M tokens, with a real-world monthly estimate.`,
  };
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n < 1 ? 4 : 2,
  }).format(n);

export default async function Compare({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = parse(slug);
  if (!p) notFound();
  const { ma, mb } = p;

  // voorbeeld: 100k calls, 1000 in / 500 out
  const calls = 100000;
  const costA = calcCost(ma, 1000, 500) * calls;
  const costB = calcCost(mb, 1000, 500) * calls;
  const cheaper = costA < costB ? ma : mb;
  const ratio = (Math.max(costA, costB) / Math.min(costA, costB)).toFixed(1);

  const row = (label: string, va: string, vb: string) => (
    <tr className="divide-x divide-neutral-800">
      <td className="px-4 py-3 text-neutral-400">{label}</td>
      <td className="px-4 py-3 text-right tabular-nums">{va}</td>
      <td className="px-4 py-3 text-right tabular-nums">{vb}</td>
    </tr>
  );

  return (
    <div className="flex-1 bg-neutral-950 text-neutral-100">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <nav className="text-sm text-neutral-500">
          <Link href="/pricing" className="hover:text-neutral-300">
            Pricing
          </Link>{" "}
          / compare
        </nav>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {ma.name} vs {mb.name}
        </h1>
        <p className="mt-3 text-neutral-400">
          Cost comparison per 1M tokens, plus a real-world monthly estimate.
        </p>

        <div className="mt-8 overflow-hidden rounded-xl border border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900 text-neutral-400">
              <tr className="divide-x divide-neutral-800">
                <th className="text-left font-medium px-4 py-3"> </th>
                <th className="text-right font-medium px-4 py-3">{ma.name}</th>
                <th className="text-right font-medium px-4 py-3">{mb.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {row("Provider", ma.provider, mb.provider)}
              {row("Input / 1M", perMillion(ma.in), perMillion(mb.in))}
              {row("Output / 1M", perMillion(ma.out), perMillion(mb.out))}
              {row(
                "100k calls/mo*",
                fmt(costA),
                fmt(costB)
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-neutral-600">
          * estimate: 100,000 calls, 1,000 input + 500 output tokens each.
          Prices change — verify with the provider.
        </p>

        <p className="mt-6 text-neutral-300">
          On this workload <strong>{cheaper.name}</strong> is the cheaper option
          — about <strong>{ratio}×</strong> cheaper. But list price rarely
          equals your real bill: the mix of customers and features decides it.
        </p>

        <div className="mt-10">
          <CtaBanner />
        </div>

        <div className="mt-10 flex gap-3 text-sm">
          <Link
            href={`/pricing/${ma.slug}`}
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 hover:border-neutral-600"
          >
            {ma.name} pricing →
          </Link>
          <Link
            href={`/pricing/${mb.slug}`}
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 hover:border-neutral-600"
          >
            {mb.name} pricing →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
