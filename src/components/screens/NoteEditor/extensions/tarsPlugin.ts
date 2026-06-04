// ═══════════════════════════════════════════════════════════════
// Genten — CodeMirror 6 TARS Trigger Plugin
// ═══════════════════════════════════════════════════════════════
// Decorates @tars triggers as styled inline markers.

import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view'

const tarsMark = Decoration.mark({ class: 'cm-tars-trigger' })

function findTARSTriggers(view: EditorView): DecorationSet {
  const decorations: Array<{ from: number; to: number }> = []
  const doc = view.state.doc

  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i)
    const text = line.text
    const regex = /@tars\b/gi
    let match

    while ((match = regex.exec(text)) !== null) {
      const from = line.from + match.index
      const to = from + match[0].length

      decorations.push({ from, to })
    }
  }

  return Decoration.set(
    decorations
      .sort((a, b) => a.from - b.from)
      .map(d => tarsMark.range(d.from, d.to))
  )
}

export const tarsPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = findTARSTriggers(view)
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = findTARSTriggers(update.view)
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
)
