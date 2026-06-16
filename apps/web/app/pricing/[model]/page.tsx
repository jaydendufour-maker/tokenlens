import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  MODELS,
  modelBySlug,
  perMillion,
  calcCost,
} from "@/lib/models";
import { SiteHeader, SiteFooter, CtaBanner } from "@/components/site-chrome";
import { CostCalculator } from "@/components/cost-calculator";

export function generateStaticParams() {
  return MODELS.map((m) => ({ model: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ model: string }>;
}): Promise<Metadata> {
  const { model } = await params;
  const m = modelBySlug(model);
  if (!m) return { title: "Model not found" };
  return {
    title: `${m.name} pricing — cost per 1M tokens (${m.provider})`,
    description: `${m.name} costs ${perMillion(m.in)} per 1M input tokens and ${perMillion(
      m.out
    )} per 1M output tokens. Free calculator + how to track real ${m.name} spend.`,
  };
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n < 1 ? 4 : 2,
  }).format(n);

export default async function ModelPricing({
  params,
}: {
  params: Promise<{ model: string }>;
}) {
  const { model } = await params;
  const m = modelBySlug(model);
  if (!m) notFound();

  const others = MODELS.filter((x) => x.slug !== m.slug).slice(0, 4);
  const example = calcCost(m, 1000, 500);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${m.name} (${m.provider})`,
    description: m.blurb,
    offers: [
      {
        "@type": "Offer",
        name: "Input tokens (per 1M)",
        price: m.in,
        priceCurrency: "USD",
      },
      {
        "@type": "Offer",
        name: "Output tokens (per 1M)",
        price: m.out,
        priceCurrency: "USD",
      },
    ],
  };

  return (
    <div className="flex-1 bg-neutral-950 text-neutral-100">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <nav className="text-sm text-neutral-500">
          <Link href="/pricing" className="hover:text-neutral-300">
            Pricing
          </Link>{" "}
          / {m.name}
        </nav>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {m.name} pricing
        </h1>
        <p className="mt-3 text-neutral-400">{m.blurb}</p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="text-xs uppercase tracking-wide text-neutral-500">
              Input / 1M tokens
            </div>
            <div className="text-2xl font-semibold mt-1 tabular-nums">
              {perMillion(m.in)}
            </div>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="text-xs uppercase tracking-wide text-neutral-500">
              Output / 1M tokens
            </div>
            <div className="text-2xl font-semibold mt-1 tabular-nums">
              {perMillion(m.out)}
            </div>
          </div>
        </div>

        <p className="mt-6 text-neutral-300">
          A typical call with 1,000 input and 500 output tokens costs{" "}
          <strong className="tabular-nums">{fmt(example)}</strong> on {m.name}.
          At 100,000 calls/month that is{" "}
          <strong className="tabular-nums">{fmt(example * 100000)}</strong>.
        </p>

        <div className="mt-8">
          <CostCalculator model={m} />
        </div>

        <h2 className="mt-12 text-xl font-semibold">
          How to track real {m.name} cost
        </h2>
        <p className="mt-3 text-neutral-400">
          The list price is the easy part. The hard question is{" "}
          <em>which customer or feature</em> is driving your {m.name} bill.
          TokenLens attributes every call so you can see and cap it:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm">
          <code>{`import { track } from "tokenlens-sdk";

await track(
  { customer: "acme", feature: "chat", team: "growth" },
  () => openai.chat.completions.create({ model: "${m.slug}", ... })
);`}</code>
        </pre>

        <div className="mt-10">
          <CtaBanner />
        </div>

        <h2 className="mt-12 text-xl font-semibold">Other models</h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {others.map((o) => (
            <Link
              key={o.slug}
              href={`/pricing/${o.slug}`}
              className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm hover:border-neutral-600"
            >
              <span>{o.name}</span>
              <span className="text-neutral-500 tabular-nums">
                {perMillion(o.in)} / {perMillion(o.out)}
              </span>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
