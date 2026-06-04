// ═══════════════════════════════════════════════════════════════
// Genten — Markdown Parser (unified + remark + rehype)
// ═══════════════════════════════════════════════════════════════

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

/**
 * Parse markdown content to HTML.
 * Uses the unified/remark/rehype pipeline.
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown)

  return String(result)
}

/**
 * Extract wikilinks [[Note Title]] from markdown content.
 * Returns an array of linked note titles.
 */
export function extractWikilinks(content: string): string[] {
  const matches = content.matchAll(/\[\[([^\]]+)\]\]/g)
  return Array.from(matches, m => m[1]!).filter(Boolean)
}

/**
 * Extract @tars triggers from markdown content.
 */
export function extractTARSTriggers(content: string): string[] {
  const matches = content.matchAll(/@tars\s+(.*?)(?:\n|$)/gi)
  return Array.from(matches, m => m[1]!.trim()).filter(Boolean)
}
