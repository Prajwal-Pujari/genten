// ═══════════════════════════════════════════════════════════════
// Genten — Editor Area (CodeMirror wrapper)
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, placeholder } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'

import { useNotesStore } from '../../../store/notesStore'
import { gentenTheme } from './extensions/gentenTheme'
import { wikilinkPlugin } from './extensions/wikilinkPlugin'
import { tarsPlugin } from './extensions/tarsPlugin'
import { tarsInlinePlugin } from './extensions/tarsInline'
import { imageDropPlugin, handleImageFile } from './extensions/imageDropPlugin'
import { imageRenderPlugin } from './extensions/imageRenderPlugin'
import { eventBus } from '../../../utils/eventBus'
import { EditorFooter } from './EditorFooter'

export function EditorArea() {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved')

  const handleMobileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !viewRef.current) return
    const view = viewRef.current
    const pos = view.state.selection.main.head
    handleImageFile(view, file, pos).catch(console.error)
    e.target.value = ''
  }

  const activeNote = useNotesStore(s => s.activeNote)
  const saveNote = useNotesStore(s => s.saveNote)
  const openNoteTitle = useNotesStore(s => {
    // Helper to find and open a note by title (used by wikilinks)
    return (title: string) => {
      const target = s.notes.find(n => n.title.toLowerCase() === title.toLowerCase())
      if (target) s.openNote(target.id)
    }
  })

  // Set up editor
  useEffect(() => {
    if (!containerRef.current || !activeNote) return

    const startState = EditorState.create({
      doc: activeNote.content,
      extensions: [
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        placeholder('Start writing...'),
        gentenTheme,
        wikilinkPlugin,
        tarsPlugin,
        tarsInlinePlugin,
        imageDropPlugin,
        imageRenderPlugin,
        // Optional line numbers (can toggle based on user pref later)
        // lineNumbers(), 
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setSaveStatus('saving')
            // Debounced save
            clearTimeout(window._gentenSaveTimer)
            window._gentenSaveTimer = setTimeout(() => {
              saveNote({
                id: activeNote.id,
                content: update.state.doc.toString()
              }).then(() => setSaveStatus('saved'))
            }, 1000)
          }
        }),
      ],
    })

    const view = new EditorView({
      state: startState,
      parent: containerRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNote?.id]) // Only recreate on ID change

  // Handle custom events from CM6 plugins
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleWikilink = (e: Event) => {
      const title = (e as CustomEvent).detail.title
      openNoteTitle(title)
    }

    el.addEventListener('genten:open-wikilink', handleWikilink)
    return () => el.removeEventListener('genten:open-wikilink', handleWikilink)
  }, [openNoteTitle])

  if (!activeNote) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="font-prose text-text-tertiary italic">Select or create a note</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Title Editor */}
      <div className="px-4 md:px-[60px] pt-4 md:pt-[40px] pb-4 flex-shrink-0">
        <div className="max-w-[680px] mx-auto flex flex-col">
          <div className="flex items-center justify-between mb-4 md:hidden">
            <button 
              className="flex items-center gap-1 text-text-tertiary hover:text-text-primary font-ui text-sm transition-colors"
              onClick={() => useNotesStore.getState().setActiveNote(null)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Files
            </button>
            <button 
              className="flex items-center gap-1 text-text-tertiary hover:text-text-primary font-ui text-sm transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              Image
            </button>
          </div>
          <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleMobileImageUpload} />
          <input
            type="text"
            value={activeNote.title}
            onChange={(e) => {
              setSaveStatus('saving')
              saveNote({ id: activeNote.id, title: e.target.value })
                .then(() => setSaveStatus('saved'))
            }}
            placeholder="Untitled"
            className="w-full bg-transparent border-none font-ui text-3xl font-semibold text-text-primary placeholder:text-text-tertiary focus:outline-none tracking-[-0.02em]"
          />
        </div>
      </div>

      {/* Editor Scroller */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {/* The 680px constraint is handled by CM6 theming or wrapper */}
        <div className="max-w-[680px] mx-auto px-4 md:px-[60px] h-full">
          <div ref={containerRef} className="h-full editor-container" />
        </div>
      </div>

      {/* Footer */}
      <EditorFooter note={activeNote} status={saveStatus} />
    </div>
  )
}

declare global {
  interface Window {
    _gentenSaveTimer: ReturnType<typeof setTimeout>
  }
}
