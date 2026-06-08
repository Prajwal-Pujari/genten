// ═══════════════════════════════════════════════════════════════
// Genten — CodeMirror 6 Inline Image Renderer
// ═══════════════════════════════════════════════════════════════

import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from '@codemirror/view'

import { convertFileSrc } from '@tauri-apps/api/core'
import { useSettingsStore } from '../../../../store/settingsStore'

class ImageWidget extends WidgetType {
  constructor(readonly url: string, readonly alt: string) {
    super()
  }

  toDOM(): HTMLElement {
    const container = document.createElement('div')
    container.className = 'cm-image-widget-container'
    container.style.display = 'inline-block'
    container.style.maxWidth = '100%'
    container.style.overflow = 'hidden'
    container.style.resize = 'both'
    
    const img = document.createElement('img')
    img.alt = this.alt
    img.className = 'cm-image-widget'
    img.style.width = '100%'
    img.style.height = '100%'
    img.style.objectFit = 'contain'
    
    // Check if it's a web URL or data URI
    if (this.url.startsWith('http://') || this.url.startsWith('https://') || this.url.startsWith('data:')) {
      img.src = this.url
      container.appendChild(img)
    } else {
      // It's a local file in the vault
      const config = useSettingsStore.getState().config
      const vaultPath = config ? config.vault_path : null
      
      if (vaultPath) {
        // Strip leading slash from url if present
        const relUrl = this.url.startsWith('/') ? this.url.slice(1) : this.url
        img.src = convertFileSrc(`${vaultPath}/${relUrl}`)
        container.appendChild(img)
      } else {
        container.innerText = '⚠️ Vault path not configured'
      }
    }

    return container
  }

  eq(other: ImageWidget): boolean {
    return this.url === other.url && this.alt === other.alt
  }
}

function findImages(view: EditorView): DecorationSet {
  const decorations: Array<{ from: number; to: number; decoration: Decoration }> = []
  const doc = view.state.doc

  for (let i = 1; i <= doc.lines; i++) {
    const line = doc.line(i)
    const text = line.text
    const regex = /!\[([^\]]*)\]\(([^)]+)\)/g
    let match

    while ((match = regex.exec(text)) !== null) {
      const from = line.from + match.index
      const to = from + match[0].length
      const alt = match[1] || ''
      const url = match[2]!

      decorations.push({
        from: from,
        to: to,
        decoration: Decoration.replace({
          widget: new ImageWidget(url, alt),
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

export const imageRenderPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = findImages(view)
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = findImages(update.view)
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
)
