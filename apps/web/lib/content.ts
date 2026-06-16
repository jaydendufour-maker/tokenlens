import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Blog-loader. Eén `.md`-bestand in content/blog/ = één artikel.
 * Dat is de eenheid voor de dagelijkse groei-loop: drop een file → live.
 * Frontmatter bovenaan tussen --- regels:
 *
 *   ---
 *   title: ...
 *   description: ...
 *   date: 2026-06-16
 *   keywords: a, b, c
 *   ---
 *   # body in markdown
 */

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  keywords: string[];
}

export interface Post extends PostMeta {
  body: string;
}

const BLOG_DIR = join(process.cwd(), "content", "blog");

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const meta: Record<string, string> = {};
  if (!raw.startsWith("---")) return { meta, body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { meta, body: raw };
  const fm = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).replace(/^\s*\n/, "");
  for (const line of fm.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { meta, body };
}

function readPost(file: string): Post {
  const slug = file.replace(/\.md$/, "");
  const raw = readFileSync(join(BLOG_DIR, file), "utf8");
  const { meta, body } = parseFrontmatter(raw);
  return {
    slug,
    title: meta.title ?? slug,
    description: meta.description ?? "",
    date: meta.date ?? "1970-01-01",
    keywords: (meta.keywords ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    body,
  };
}

function listFiles(): string[] {
  try {
    return readdirSync(BLOG_DIR).filter(
      (f) => f.endsWith(".md") && !f.startsWith("_")
    );
  } catch {
    return [];
  }
}

export function getAllPosts(): Post[] {
  return listFiles()
    .map(readPost)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}
