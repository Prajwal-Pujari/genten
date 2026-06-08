import { StateField, StateEffect } from '@codemirror/state'
import { Decoration, DecorationSet, EditorView, WidgetType } from '@codemirror/view'

export const insertTarsInline = StateEffect.define<{ pos: number, text: string }>()
export const clearTarsInline = StateEffect.define<void>()

class TarsStreamingWidget extends WidgetType {
  constructor(readonly text: string) {
    super()
  }

  toDOM() {
    const span = document.createElement('span')
    span.className = 'tars-streaming'
    
    // Add glowing animation for TARS
    span.style.color = '#6B5CE7'
    span.style.backgroundColor = 'rgba(107, 92, 231, 0.1)'
    span.style.padding = '2px 4px'
    span.style.borderRadius = '4px'
    span.style.fontWeight = '500'
    span.style.wordBreak = 'break-word'
    span.style.whiteSpace = 'pre-wrap'
    span.style.boxShadow = '0 0 8px rgba(107, 92, 231, 0.3)'
    span.innerText = this.text || 'TARS is thinking...'
    
    return span
  }
}

export const tarsInlineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(decorations, tr) {
    decorations = decorations.map(tr.changes)
    
    for (const e of tr.effects) {
      if (e.is(clearTarsInline)) {
        decorations = Decoration.none
      } else if (e.is(insertTarsInline)) {
        const deco = Decoration.widget({
          widget: new TarsStreamingWidget(e.value.text),
          side: 1
        })
        decorations = Decoration.set([deco.range(e.value.pos)])
      }
    }
    return decorations
  },
  provide: f => EditorView.decorations.from(f)
})

export const tarsInlinePlugin = [tarsInlineField]
