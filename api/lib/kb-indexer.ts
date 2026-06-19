// @ts-nocheck
/**
 * Zero-cost markdown Knowledge Base auto-indexer.
 * Scans /kb/ directory at runtime, indexes all .md files with frontmatter.
 * No database needed — pure filesystem + memory cache.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, basename, extname } from "path";

export interface KBArticle {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  excerpt: string;
  content: string;
  date: string;
  updatedAt: string;
  author: string;
  readingTime: number;
}

interface Frontmatter {
  title?: string;
  category?: string;
  tags?: string[];
  date?: string;
  author?: string;
  excerpt?: string;
}

function parseFrontmatter(raw: string): { frontmatter: Frontmatter; content: string } {
  const frontmatter: Frontmatter = {};
  let content = raw;

  if (raw.startsWith("---")) {
    const end = raw.indexOf("---", 3);
    if (end !== -1) {
      const fmBlock = raw.slice(3, end).trim();
      content = raw.slice(end + 3).trim();

      for (const line of fmBlock.split("\n")) {
        const colonIdx = line.indexOf(":");
        if (colonIdx === -1) continue;
        const key = line.slice(0, colonIdx).trim();
        let value = line.slice(colonIdx + 1).trim();

        if (key === "tags") {
          frontmatter.tags = value.split(",").map((t: string) => t.trim()).filter(Boolean);
        } else if (key === "date") {
          frontmatter.date = value;
        } else {
          frontmatter[key as keyof Frontmatter] = value;
        }
      }
    }
  }

  return { frontmatter, content };
}

function slugify(name: string): string {
  return name
    .replace(/\.md$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).filter((w) => w.length > 0).length;
  return Math.max(1, Math.ceil(words / 200));
}

// In-memory cache with TTL
let kbCache: KBArticle[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 30000; // 30 seconds

export function indexKnowledgeBase(kbDir: string = join(process.cwd(), "kb")): KBArticle[] {
  const now = Date.now();
  if (kbCache && cacheTimestamp + CACHE_TTL_MS > now) {
    return kbCache;
  }

  const articles: KBArticle[] = [];

  try {
    const entries = readdirSync(kbDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;

      const filePath = join(kbDir, entry.name);
      const raw = readFileSync(filePath, "utf-8");
      const { frontmatter, content } = parseFrontmatter(raw);
      const stats = statSync(filePath);

      const slug = slugify(entry.name);
      const firstPara = content.split("\n\n").find((p) => p.trim().length > 20) || "";

      articles.push({
        slug,
        title: frontmatter.title || basename(entry.name, ".md").replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        category: frontmatter.category || "General",
        tags: frontmatter.tags || [],
        excerpt: frontmatter.excerpt || firstPara.slice(0, 200).trim(),
        content,
        date: frontmatter.date || stats.mtime.toISOString().split("T")[0],
        updatedAt: stats.mtime.toISOString(),
        author: frontmatter.author || "Virtus Team",
        readingTime: estimateReadingTime(content),
      });
    }
  } catch (err) {
    console.log("[KB] No knowledge base directory found, returning empty");
  }

  // Sort by date descending
  articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  kbCache = articles;
  cacheTimestamp = now;
  return articles;
}

export function getArticle(slug: string, kbDir?: string): KBArticle | null {
  const articles = indexKnowledgeBase(kbDir);
  return articles.find((a) => a.slug === slug) || null;
}

export function searchArticles(query: string, kbDir?: string): KBArticle[] {
  const articles = indexKnowledgeBase(kbDir);
  const lower = query.toLowerCase();
  return articles.filter(
    (a) =>
      a.title.toLowerCase().includes(lower) ||
      a.content.toLowerCase().includes(lower) ||
      a.tags.some((t) => t.toLowerCase().includes(lower)) ||
      a.category.toLowerCase().includes(lower)
  );
}

export function getCategories(kbDir?: string): string[] {
  const articles = indexKnowledgeBase(kbDir);
  const cats = new Set(articles.map((a) => a.category));
  return Array.from(cats).sort();
}

export function invalidateCache(): void {
  kbCache = null;
  cacheTimestamp = 0;
}
