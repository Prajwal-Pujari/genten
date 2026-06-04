// ═══════════════════════════════════════════════════════════════
// Genten — Problem Statement (Read-only view)
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react'
import type { Note } from '../../../types/note'
import { markdownToHtml } from '../../../files/markdown'

export function ProblemStatement({ note }: { note: Note }) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    // Extract everything before the first "## Solution" or similar marker
    const statementMarkdown = note.content.split(/##\s+Solution/i)[0] || note.content
    markdownToHtml(statementMarkdown).then(setHtml)
  }, [note.content])

  return (
    <div>
      <h2 className="font-ui text-sm font-medium text-text-tertiary uppercase tracking-widest mb-4">
        Problem Statement
      </h2>
      <div 
        className="prose prose-sm genten-prose max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
