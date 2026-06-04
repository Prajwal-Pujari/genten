// ═══════════════════════════════════════════════════════════════
// Genten — YAML Frontmatter Read/Write
// ═══════════════════════════════════════════════════════════════

export interface Frontmatter {
  [key: string]: unknown
}

/**
 * Parse YAML frontmatter from a markdown file.
 * Returns { frontmatter, body } where frontmatter is the parsed
 * key-value pairs and body is the remaining content.
 */
export function parseFrontmatter(raw: string): {
  frontmatter: Frontmatter
  body: string
} {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) {
    return { frontmatter: {}, body: raw }
  }

  const fmRaw = match[1] ?? ''
  const body = match[2] ?? ''
  const frontmatter: Frontmatter = {}

  for (const line of fmRaw.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim()
      let val: unknown = line.slice(colonIdx + 1).trim()

      // Parse arrays: [a, b, c]
      if (typeof val === 'string' && val.startsWith('[') && val.endsWith(']')) {
        val = val.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean)
      }

      // Parse null
      if (val === 'null') val = null

      frontmatter[key] = val
    }
  }

  return { frontmatter, body }
}

/**
 * Serialize frontmatter + body back to a markdown string.
 */
export function serializeFrontmatter(
  frontmatter: Frontmatter,
  body: string
): string {
  const lines = ['---']

  for (const [key, val] of Object.entries(frontmatter)) {
    if (val === null || val === undefined) {
      lines.push(`${key}: null`)
    } else if (Array.isArray(val)) {
      lines.push(`${key}: [${val.join(', ')}]`)
    } else {
      lines.push(`${key}: ${val}`)
    }
  }

  lines.push('---')
  lines.push('')
  lines.push(body)

  return lines.join('\n')
}
