// ═══════════════════════════════════════════════════════════════
// Genten — CodeMirror 6 Wikilink Plugin
// ═══════════════════════════════════════════════════════════════
// Decorates [[Note Title]] as clickable wikilinks in the editor.

import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from '@codemirror/view'

class WikilinkWidget extends WidgetType {
  constructor(readonly title: string) {
    super()
  }

  toDOM(): HTMLElement {
    const span = document.createElement('span')
    span.className = 'cm-wikilink cursor-pointer hover:underline text-brand-primary'
    span.textContent = this.title
    span.title = `Open: ${this.title}`
    
    span.addEventListener('mousedown', (e) => {
      e.preventDefault()
      e.stopPropagation()
      span.dispatchEvent(new CustomEvent('genten:open-wikilink', {
        detail: { title: this.title },
        bubbles: true,
      }))
    })

    return span
  }

  eq(other: WikilinkWidget): boolean {
    return this.title === other.title
  }
}

function findWikilinks(view: EditorView): DecorationSet {
  const decorations: Array<{ from: number; to: number; decoration: Decoration }> = []
  const doc = view.state.doc

  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i)
    const text = line.text
    const regex = /\[\[([^\]]+)\]\]/g
    let match

    while ((match = regex.exec(text)) !== null) {
      const from = line.from + match.index
      const to = from + match[0].length
      const title = match[1]!

      decorations.push({
        from,
        to,
        decoration: Decoration.replace({
          widget: new WikilinkWidget(title),
        }),
      })
    }
  }

  return Decoration.set(
    decorations
      .sort((a, b) => a.from - b.from)
      .map(d => d.decoration.range(d.from, d.to))
  )
}

export const wikilinkPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = findWikilinks(view)
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = findWikilinks(update.view)
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
)
