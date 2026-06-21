import Link from "next/link";
import { GITHUB_URL } from "@/lib/site";

const CODE = `import { track } from "tokenlens-sdk";

// wrap any LLM call — that's it
const res = await track(
  { customer: "acme-inc", feature: "chat", team: "growth" },
  () => openai.chat.completions.create({ ... })
);`;

function Check() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="mt-0.5 shrink-0 text-emerald-400"
      aria-hidden
    >
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Landing() {
  return (
    <div className="flex-1 bg-neutral-950 text-neutral-100">
      {/* Nav */}
      <header className="border-b border-neutral-900">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-semibold tracking-tight text-lg">TokenLens</span>
          <nav className="flex items-center gap-5 text-sm text-neutral-400">
            <Link href="/pricing" className="hover:text-neutral-100">
              Pricing
            </Link>
            <Link href="/blog" className="hover:text-neutral-100">
              Blog
            </Link>
            <a href={GITHUB_URL} className="hover:text-neutral-100">
              GitHub
            </a>
            <Link href="/login" className="hover:text-neutral-100">
              Sign in
            </Link>
            <Link
              href="/login"
              className="rounded-md bg-white text-neutral-900 font-medium px-3.5 py-1.5 hover:bg-neutral-200"
            >
              Get your free API key
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="text-sm font-medium text-emerald-400 mb-4">
          FinOps for your LLM bill
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
          See which customer is eating
          <br className="hidden sm:block" /> your OpenAI bill.
        </h1>
        <p className="mt-6 text-lg text-neutral-400 max-w-2xl mx-auto">
          Your AI bill is a black box. TokenLens breaks it down by customer,
          feature and team — and alerts you{" "}
          <span className="text-neutral-200">before</span> it blows up, not after
          the invoice lands.
        </p>
        <p className="mt-3 text-sm text-neutral-500">
          Metadata only: TokenLens never stores your prompts or responses.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/login"
            className="rounded-md bg-white text-neutral-900 font-medium px-5 py-2.5 hover:bg-neutral-200"
          >
            Get your free API key
          </Link>
          <a
            href={GITHUB_URL}
            className="rounded-md border border-neutral-700 font-medium px-5 py-2.5 hover:bg-neutral-900"
          >
            Star on GitHub
          </a>
        </div>
        <p className="mt-4 text-xs text-neutral-600">
          Free tier · open-source SDK · no credit card
        </p>
      </section>

      {/* Code */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 h-9 border-b border-neutral-800">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
            <span className="ml-2 text-xs text-neutral-500">npm i tokenlens-sdk</span>
          </div>
          <pre className="p-5 text-sm leading-relaxed overflow-x-auto text-neutral-300 font-mono">
            {CODE}
          </pre>
        </div>
        <p className="text-center text-sm text-neutral-500 mt-4">
          One wrapper. Every call attributed. Zero changes to your provider.
        </p>
      </section>

      {/* Value props */}
      <section className="max-w-5xl mx-auto px-6 pb-20 grid gap-6 md:grid-cols-3">
        {[
          {
            t: "Cost attribution without prompt logging",
            d: "Send token counts, model, cost and your business tags. Prompts and responses stay inside your application.",
          },
          {
            t: "Budget alerts before the bill",
            d: "Set a threshold per customer, feature or team. Get a webhook or email the moment spend crosses the line.",
          },
          {
            t: "Provider-agnostic SDK",
            d: "OpenAI, Anthropic, anything. TokenLens measures your calls — it never proxies them or sees your keys.",
          },
        ].map((f) => (
          <div
            key={f.t}
            className="rounded-xl border border-neutral-800 bg-neutral-900 p-6"
          >
            <h3 className="font-medium">{f.t}</h3>
            <p className="mt-2 text-sm text-neutral-400 leading-relaxed">{f.d}</p>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-semibold tracking-tight text-center">
          Free until it pays for itself
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="text-sm text-neutral-400">Free</div>
            <div className="text-3xl font-semibold mt-1">$0</div>
            <p className="mt-2 text-xs text-neutral-500">
              See that you have a problem.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-neutral-300">
              {[
                "Total LLM spend dashboard",
                "Cost-per-day chart",
                "Open-source SDK",
              ].map((x) => (
                <li key={x} className="flex gap-2">
                  <Check />
                  {x}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-6 block text-center rounded-md border border-neutral-700 font-medium py-2 hover:bg-neutral-900"
            >
              Start free
            </Link>
          </div>
          <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/10 p-6">
            <div className="text-sm text-emerald-400">Pro</div>
            <div className="text-3xl font-semibold mt-1">
              $29
              <span className="text-base font-normal text-neutral-500">/mo</span>
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              See who&apos;s causing it — and stop it.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-neutral-300">
              {[
                "Cost breakdown by customer, feature & team",
                "Budget alerts (email + webhook)",
                "CSV usage export",
              ].map((x) => (
                <li key={x} className="flex gap-2">
                  <Check />
                  {x}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-6 block text-center rounded-md bg-white text-neutral-900 font-medium py-2 hover:bg-neutral-200"
            >
              Get started
            </Link>
            <p className="mt-2 text-center text-xs text-neutral-600">
              No trial. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-neutral-500 flex-wrap gap-3">
          <span>© TokenLens</span>
          <div className="flex gap-5">
            <Link href="/pricing" className="hover:text-neutral-300">
              Pricing
            </Link>
            <Link href="/blog" className="hover:text-neutral-300">
              Blog
            </Link>
            <a
              href={GITHUB_URL}
              className="hover:text-neutral-300"
            >
              GitHub
            </a>
            <Link href="/login" className="hover:text-neutral-300">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
