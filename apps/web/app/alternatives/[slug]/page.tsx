import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COMPETITORS, competitorBySlug } from "@/lib/competitors";
import { SiteHeader, SiteFooter, CtaBanner } from "@/components/site-chrome";

const Check = () => <span className="text-emerald-400">●</span>;
const Dash = () => <span className="text-neutral-600">—</span>;

function comparisonRow(label: string, tokenlens: React.ReactNode, them: React.ReactNode) {
  return (
    <tr className="divide-x divide-neutral-800">
      <td className="px-4 py-3 text-neutral-400">{label}</td>
      <td className="px-4 py-3 text-center">{tokenlens}</td>
      <td className="px-4 py-3 text-center">{them}</td>
    </tr>
  );
}

export function generateStaticParams() {
  return COMPETITORS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = competitorBySlug(slug);
  if (!c) return { title: "Alternative not found" };
  return {
    title: `${c.name} alternative for LLM cost attribution — TokenLens`,
    description: `Looking for a ${c.name} alternative focused on LLM cost per customer, feature and team? How TokenLens compares — and when to stick with ${c.name}.`,
  };
}

export default async function Alternative({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = competitorBySlug(slug);
  if (!c) notFound();

  return (
    <div className="flex-1 bg-neutral-950 text-neutral-100">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <nav className="text-sm text-neutral-500">
          <Link href="/alternatives" className="hover:text-neutral-300">
            Alternatives
          </Link>{" "}
          / {c.name}
        </nav>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          A {c.name} alternative, focused on cost
        </h1>
        <p className="mt-4 text-neutral-300 leading-relaxed">
          {c.name} is a solid {c.category}. {c.whatItIs} TokenLens solves a
          narrower problem: <strong>attributing LLM spend</strong> to a customer,
          feature or team — with budget alerts that fire before the invoice does.
        </p>

        <h2 className="mt-10 text-lg font-medium">What {c.name} is good at</h2>
        <ul className="mt-3 space-y-1.5 text-neutral-300">
          {c.strengths.map((s) => (
            <li key={s} className="flex gap-2">
              <span className="text-neutral-600">•</span>
              {s}
            </li>
          ))}
        </ul>

        <h2 className="mt-10 text-lg font-medium">The gap TokenLens fills</h2>
        <p className="mt-3 text-neutral-300 leading-relaxed">{c.gap}</p>

        <div className="mt-8 overflow-hidden rounded-xl border border-neutral-800">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900 text-neutral-400">
              <tr className="divide-x divide-neutral-800">
                <th className="text-left font-medium px-4 py-3"> </th>
                <th className="font-medium px-4 py-3">TokenLens</th>
                <th className="font-medium px-4 py-3">{c.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {comparisonRow("Cost per customer / feature / team", <Check />, <Dash />)}
              {comparisonRow("Budget alerts (email + webhook)", <Check />, <Dash />)}
              {comparisonRow("Zero-dependency SDK (TS + Python)", <Check />, <Dash />)}
              {comparisonRow(
                "Full request tracing / evals",
                <Dash />,
                <Check />
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-neutral-600">
          A focused tool vs a broader one — this table shows the difference in
          scope, not a quality score. Pick the one that matches the job.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-5">
            <h3 className="text-sm font-medium text-emerald-300">
              Switch to TokenLens if
            </h3>
            <ul className="mt-3 space-y-1.5 text-sm text-neutral-300">
              {c.switchIf.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="text-emerald-500">→</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
            <h3 className="text-sm font-medium text-neutral-300">
              Stay with {c.name} if
            </h3>
            <ul className="mt-3 space-y-1.5 text-sm text-neutral-400">
              {c.stayIf.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="text-neutral-600">→</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12">
          <CtaBanner />
        </div>

        <div className="mt-10">
          <h3 className="text-sm font-medium text-neutral-400">
            Other alternatives
          </h3>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {COMPETITORS.filter((o) => o.slug !== c.slug).map((o) => (
              <Link
                key={o.slug}
                href={`/alternatives/${o.slug}`}
                className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 hover:border-neutral-600"
              >
                {o.name} alternative
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
