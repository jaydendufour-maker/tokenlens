import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/content";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: "TokenLens blog — LLM cost & FinOps",
  description:
    "Practical guides on tracking, attributing and cutting your OpenAI and Anthropic bill.",
};

export default function BlogIndex() {
  const posts = getAllPosts();
  return (
    <div className="flex-1 bg-neutral-950 text-neutral-100">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
        <p className="mt-3 text-neutral-400">
          Tracking, attributing and cutting your LLM bill.
        </p>

        <div className="mt-8 divide-y divide-neutral-800 border-y border-neutral-800">
          {posts.length === 0 ? (
            <p className="py-6 text-sm text-neutral-500">Nog geen artikelen.</p>
          ) : (
            posts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="block py-5 group"
              >
                <div className="text-xs text-neutral-500">{p.date}</div>
                <h2 className="mt-1 text-lg font-medium group-hover:text-emerald-400">
                  {p.title}
                </h2>
                <p className="mt-1 text-sm text-neutral-400">{p.description}</p>
              </Link>
            ))
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
