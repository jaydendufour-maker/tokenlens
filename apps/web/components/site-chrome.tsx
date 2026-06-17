import Link from "next/link";
import { GITHUB_URL as GITHUB } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-900">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight text-lg">
          TokenLens
        </Link>
        <nav className="flex items-center gap-5 text-sm text-neutral-400">
          <Link href="/pricing" className="hover:text-neutral-100">
            Pricing
          </Link>
          <Link href="/alternatives" className="hover:text-neutral-100">
            Alternatives
          </Link>
          <Link href="/blog" className="hover:text-neutral-100">
            Blog
          </Link>
          <a href={GITHUB} className="hover:text-neutral-100">
            GitHub
          </a>
          <Link
            href="/login"
            className="rounded-md bg-white text-neutral-900 font-medium px-3.5 py-1.5 hover:bg-neutral-200"
          >
            Get your free API key
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-900 mt-20">
      <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-neutral-500 flex-wrap gap-3">
        <span>© TokenLens — FinOps for your LLM bill</span>
        <div className="flex gap-5">
          <Link href="/pricing" className="hover:text-neutral-300">
            Pricing
          </Link>
          <Link href="/alternatives" className="hover:text-neutral-300">
            Alternatives
          </Link>
          <Link href="/blog" className="hover:text-neutral-300">
            Blog
          </Link>
          <a href={GITHUB} className="hover:text-neutral-300">
            GitHub
          </a>
          <Link href="/login" className="hover:text-neutral-300">
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}

/** Herbruikbare call-to-action onderaan content-pagina's. */
export function CtaBanner() {
  return (
    <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/10 p-6 text-center">
      <h3 className="font-semibold">Stop guessing what your LLM calls cost.</h3>
      <p className="text-sm text-neutral-400 mt-1.5 max-w-md mx-auto">
        TokenLens tracks real cost per customer, feature and team — and alerts
        you before the bill blows up.
      </p>
      <Link
        href="/login"
        className="inline-block mt-4 rounded-md bg-white text-neutral-900 font-medium px-5 py-2 hover:bg-neutral-200"
      >
        Get your free API key
      </Link>
    </div>
  );
}
