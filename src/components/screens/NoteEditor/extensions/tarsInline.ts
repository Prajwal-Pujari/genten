import { StateField, StateEffect } from '@codemirror/state'
import { Decoration, DecorationSet, EditorView, WidgetType, keymap } from '@codemirror/view'
import { chatWithTARS } from '../../../../lib/tars/ollama'
import { useNotesStore } from '../../../../store/notesStore'
import { useSettingsStore } from '../../../../store/settingsStore'
import { readFile } from '@tauri-apps/plugin-fs'

function arrayBufferToBase64(buffer: Uint8Array) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i] as number);
  }
  return window.btoa(binary);
}

async function gatherContext(rootText: string) {
  const visited = new Set<string>();
  const images = new Set<string>();
  let combinedText = "--- CURRENT NOTE ---\n" + rootText + "\n";
  
  const notesStore = useNotesStore.getState();
  const settings = useSettingsStore.getState();
  
  async function parseText(text: string) {
    // 1. Extract Images
    const imgRegex = /!\[.*?\]\((.*?)\)/g;
    let match;
    while ((match = imgRegex.exec(text)) !== null) {
      const imgPath = match[1];
      if (settings.config?.vault_path && imgPath) {
        const relUrl = imgPath.startsWith('/') ? imgPath.slice(1) : imgPath;
        const absPath = `${settings.config.vault_path}/${relUrl}`;
        try {
          const bytes = await readFile(absPath);
          const b64 = arrayBufferToBase64(bytes);
          images.add(b64);
        } catch(e) {
          console.warn("Failed to read image for TARS context:", absPath);
        }
      }
    }
    
    // 2. Extract Wikilinks recursively
    const linkRegex = /\[\[(.*?)\]\]/g;
    while ((match = linkRegex.exec(text)) !== null) {
      const title = match[1];
      if (title && !visited.has(title)) {
        visited.add(title);
        const note = notesStore.notes.find(n => n.title === title);
        if (note) {
           combinedText += `\n--- LINKED NOTE: ${title} ---\n${note.content}\n`;
           await parseText(note.content);
        }
      }
    }
  }
  
  await parseText(rootText);
  return {
    text: combinedText,
    images: Array.from(images)
  };
}

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
        
        ;(async () => {
          try {
            const contextData = await gatherContext(view.state.doc.toString());
            
            const messages: any[] = [
              { role: 'system', content: `You are TARS. You are an inline AI assistant inside a Markdown note editor. Use the following context of the current note and connected notes to accurately answer the user's prompt. \n\n${contextData.text}` }
            ];
            
            if (contextData.images.length > 0) {
              messages.push({ role: 'user', content: prompt, images: contextData.images });
            } else {
              messages.push({ role: 'user', content: prompt });
            }

            await chatWithTARS(messages, (chunk) => {
              currentText += chunk
              view.dispatch({
                effects: insertTarsInline.of({ pos: outputLineFrom, text: currentText })
              })
            });
            
            view.dispatch({ effects: clearTarsInline.of() })
            const formattedText = currentText.trim() + '\n\n'
            view.dispatch({
              changes: { from: outputLineFrom, insert: formattedText },
              selection: { anchor: outputLineFrom + formattedText.length }
            })
          } catch (err: any) {
            view.dispatch({ effects: clearTarsInline.of() })
            view.dispatch({
              changes: { from: outputLineFrom, insert: `❌ Error: ${err.message}\n` }
            })
          }
        })();
        
        return true
      }
      return false
    }
  }
])

export const tarsInlinePlugin = [tarsInlineField, tarsInlineKeymap]
