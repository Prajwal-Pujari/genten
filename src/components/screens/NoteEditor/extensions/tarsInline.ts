import { StateField, StateEffect } from '@codemirror/state'
import { Decoration, DecorationSet, EditorView, WidgetType, keymap } from '@codemirror/view'
import { chatWithTARS } from '../../../../lib/tars/ollama'

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
    
    if (!this.text) {
      span.innerHTML = '<span class="tars-blinking-cursor">|</span>'
    } else {
      span.innerText = this.text
      const cursor = document.createElement('span')
      cursor.className = 'tars-blinking-cursor'
      cursor.innerText = '|'
      span.appendChild(cursor)
    }
    
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

export const tarsInlineKeymap = keymap.of([
  {
    key: 'Enter',
    run: (view) => {
      const pos = view.state.selection.main.head
      const line = view.state.doc.lineAt(pos)
      const text = line.text

      if (text.trim().startsWith('@tars')) {
        const prompt = text.replace('@tars', '').trim()
        
        // Keep the full line including @tars, and add newlines for the response
        view.dispatch({
          changes: { from: line.from, to: line.to, insert: text + '\n\n' }
        })
        
        const outputLineFrom = line.from + text.length + 2
        
        // Show initial thinking widget
        view.dispatch({
          effects: insertTarsInline.of({ pos: outputLineFrom, text: '' })
        })

        let currentText = ''
        
        chatWithTARS([{ role: 'user', content: prompt }], (chunk) => {
          currentText += chunk
          // Update the streaming widget
          view.dispatch({
            effects: insertTarsInline.of({ pos: outputLineFrom, text: currentText })
          })
        }).then(() => {
          view.dispatch({ effects: clearTarsInline.of() })
          
          const formattedText = currentText.trim() + '\n\n'
          
          view.dispatch({
            changes: { from: outputLineFrom, insert: formattedText },
            selection: { anchor: outputLineFrom + formattedText.length }
          })
        }).catch(err => {
          view.dispatch({ effects: clearTarsInline.of() })
          view.dispatch({
            changes: { from: outputLineFrom, insert: `❌ Error: ${err.message}\n` }
          })
        })
        
        return true
      }
      return false
    }
  }
])

export const tarsInlinePlugin = [tarsInlineField, tarsInlineKeymap]
