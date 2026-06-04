// ═══════════════════════════════════════════════════════════════
// Genten — Slugify (Title → Filename)
// ═══════════════════════════════════════════════════════════════

/**
 * Convert a note title to a safe filename.
 * "Binary Search Trees" → "binary-search-trees"
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')        // remove non-word chars
    .replace(/[\s_]+/g, '-')         // spaces/underscores → hyphens
    .replace(/-+/g, '-')             // collapse multiple hyphens
    .replace(/^-+|-+$/g, '')         // trim leading/trailing hyphens
    || 'untitled'
}

/**
 * Generate a unique filename if the base slug already exists.
 * "binary-search-trees" → "binary-search-trees-2"
 */
export function uniqueSlug(slug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(slug)) return slug
  let counter = 2
  while (existingSlugs.includes(`${slug}-${counter}`)) {
    counter++
  }
  return `${slug}-${counter}`
}
