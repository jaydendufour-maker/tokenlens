import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPost } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { SiteHeader, SiteFooter, CtaBanner } from "@/components/site-chrome";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: `${post.title} — TokenLens`,
    description: post.description,
    keywords: post.keywords,
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    keywords: post.keywords.join(", "),
  };

  return (
    <div className="flex-1 bg-neutral-950 text-neutral-100">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <nav className="text-sm text-neutral-500">
          <Link href="/blog" className="hover:text-neutral-300">
            Blog
          </Link>
        </nav>
        <article className="mt-3">
          <div className="text-xs text-neutral-500">{post.date}</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {post.title}
          </h1>
          <div
            className="mt-6"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
          />
        </article>

        <div className="mt-12">
          <CtaBanner />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
