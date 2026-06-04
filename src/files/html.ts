// ═══════════════════════════════════════════════════════════════
// Genten — HTML Note Parser
// ═══════════════════════════════════════════════════════════════

/**
 * Extract metadata from HTML note meta tags.
 */
export function extractHtmlMeta(html: string): Record<string, string> {
  const meta: Record<string, string> = {}
  const regex = /<meta\s+name="(genten-[^"]*?)"\s+content="([^"]*?)"\s*\/?>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    const key = match[1]!.replace('genten-', '')
    meta[key] = match[2]!
  }
  return meta
}

/**
 * Extract the article body from an HTML note.
 */
export function extractHtmlBody(html: string): string {
  const match = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
  return match?.[1]?.trim() ?? ''
}
