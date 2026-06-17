import Link from "next/link";
import type { Metadata } from "next";
import { COMPETITORS } from "@/lib/competitors";
import { SiteHeader, SiteFooter, CtaBanner } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "LLM cost-tracking alternatives — Helicone, Langfuse, LangSmith & more",
  description:
    "Comparing tools to track and attribute LLM cost? How TokenLens stacks up against Helicone, Langfuse, LangSmith, Portkey, Datadog and the provider dashboard — including when to pick them instead.",
};

export default function AlternativesIndex() {
  return (
    <div className="flex-1 bg-neutral-950 text-neutral-100">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">
          TokenLens vs the alternatives
        </h1>
        <p className="mt-4 text-neutral-300 leading-relaxed">
          Most LLM tools are built around <em>traces</em> — what each request did.
          TokenLens is built around <em>cost</em> — who and what spent it. These
          pages compare honestly, including when another tool is the better pick.
        </p>

        <div className="mt-10 grid gap-3">
          {COMPETITORS.map((c) => (
            <Link
              key={c.slug}
              href={`/alternatives/${c.slug}`}
              className="group rounded-xl border border-neutral-800 bg-neutral-900 p-5 hover:border-neutral-600"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-medium group-hover:text-white">
                  {c.name} alternative
                </h2>
                <span className="text-xs text-neutral-500">{c.category}</span>
              </div>
              <p className="mt-1.5 text-sm text-neutral-400 line-clamp-2">
                {c.whatItIs}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-12">
          <CtaBanner />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
