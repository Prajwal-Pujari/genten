// ═══════════════════════════════════════════════════════════════
// Genten — Solution Area (CodeMirror)
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { gentenTheme } from '../NoteEditor/extensions/gentenTheme'
import type { Note } from '../../../types/note'

export function SolutionArea({ note }: { note: Note }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Extract everything after "## Solution"
    const parts = note.content.split(/##\s+Solution/i)
    const solutionText = parts.length > 1 ? parts.slice(1).join('## Solution').trim() : ''

    const startState = EditorState.create({
      doc: solutionText,
      extensions: [
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        gentenTheme,
      ],
    })

    const view = new EditorView({
      state: startState,
      parent: containerRef.current,
    })

    return () => view.destroy()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id]) // Intentionally not listening to content changes for this basic implementation

  return (
    <div>
      <h2 className="font-ui text-sm font-medium text-text-tertiary uppercase tracking-widest mb-4">
        Your Solution
      </h2>
      <div ref={containerRef} className="editor-container" />
    </div>
  )
}
