// ═══════════════════════════════════════════════════════════════
// Genten — TARS Tab (Right Panel)
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react'
import { useNotesStore } from '../../../../store/notesStore'
import { chatWithTARS, ChatMessage } from '../../../../lib/tars/ollama'
import { Send, Zap, BrainCircuit, Bot } from 'lucide-react'

export function TARSTab() {
  const activeNote = useNotesStore(s => s.activeNote)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello. I am TARS. How can I assist your thinking today?' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [includeContext, setIncludeContext] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (text: string = input, forceIncludeContext?: boolean) => {
    const shouldIncludeContext = forceIncludeContext ?? includeContext
    if (!text.trim() && !shouldIncludeContext) return
    
    const userMsg = text.trim() || (shouldIncludeContext ? 'Please analyze my current note.' : '')
    setInput('')
    
    // Prepare conversation
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setIsTyping(true)

    // Build robust system prompt
    const apiMessages: ChatMessage[] = [
      { 
        role: 'system', 
        content: `You are TARS, the user's local AI knowledge assistant. 
You HAVE full access to the user's private notes.
CRITICAL RULES:
1. Always base your answers on the provided CONTEXT block below.
2. Keep answers concise, insightful, and well-formatted in Markdown.
3. If the context does not contain the answer, say so clearly.
4. ABSOLUTELY NO EMOJIS ALLOWED IN YOUR RESPONSES. DO NOT USE A SINGLE EMOJI.`
      }
    ]

    if (shouldIncludeContext) {
      let contextContent = ''
      
      // 1. Always include the active note if there is one
      if (activeNote) {
        // Use real-time CodeMirror content if available to bypass save debounce delay
        // @ts-ignore - global var defined in EditorArea
        const realTimeContent = window._gentenGetRealtimeNoteContent ? window._gentenGetRealtimeNoteContent() : activeNote.content
        contextContent += `ACTIVE NOTE (${activeNote.title}):\n${realTimeContent}\n\n`
      }

      // 2. Do a fast keyword search across the vault to find related notes
      const allNotes = useNotesStore.getState().notes
      // Extract keywords from user prompt (naive split)
      const keywords = userMsg.toLowerCase().split(/\s+/).filter(w => w.length > 3)
      
      if (keywords.length > 0) {
        const relatedNotes = allNotes
          .filter(n => n.id !== activeNote?.id)
          .map(n => {
            const score = keywords.reduce((acc, kw) => 
              acc + (n.content.toLowerCase().includes(kw) ? 1 : 0) + (n.title.toLowerCase().includes(kw) ? 2 : 0), 0)
            return { note: n, score }
          })
          .filter(x => x.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3) // Top 3 most relevant

        if (relatedNotes.length > 0) {
          contextContent += `OTHER RELEVANT NOTES FROM VAULT:\n`
          for (const { note } of relatedNotes) {
            contextContent += `--- Title: ${note.title} ---\n${note.content.substring(0, 1500)}\n\n`
          }
        }
      }

      if (contextContent) {
        apiMessages.push({
          role: 'system',
          content: `CONTEXT:\n${contextContent}`
        })
      }
    }

    apiMessages.push(...newMessages)

    try {
      // Add empty assistant message to stream into
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])
      
      let finalContent = ''
      await chatWithTARS(apiMessages, (chunk) => {
        finalContent = chunk
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1]!.content = chunk
          return updated
        })
      })

      // Automatically replace active note content if "redesign" is requested
      if (userMsg.toLowerCase().includes('redesign') && activeNote) {
        useNotesStore.getState().saveNote({ id: activeNote.id, content: finalContent })
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: '*I have successfully redesigned and updated your note content directly.*' 
        }])
      }

    } catch (e: any) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1]!.content = `**Error:** ${e.message}`
        return updated
      })
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-surface-primary">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-text-primary">
          <Bot size={16} className="text-accent-violet" />
          <span className="font-ui text-sm font-medium">TARS Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
          <span className="font-ui text-[10px] text-text-tertiary uppercase tracking-wider">Local</span>
        </div>
      </div>

      {/* Quick Actions (only if note active) */}
      {activeNote && (
        <div className="px-4 py-2 border-b border-border-subtle flex gap-2 shrink-0 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => handleSend('Summarize the key points of this note.', true)}
            className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-border-subtle hover:border-accent-violet/50 font-ui text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            <BrainCircuit size={12} /> Summarize Note
          </button>
          <button 
            onClick={() => handleSend('What are some related concepts or tags I should explore based on this?', true)}
            className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-border-subtle hover:border-accent-violet/50 font-ui text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            <Zap size={12} /> Suggest Links
          </button>
        </div>
      )}

      {/* Chat History */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div 
              className={`
                max-w-[85%] rounded-lg px-3 py-2 font-prose text-sm leading-relaxed
                ${msg.role === 'user' 
                  ? 'bg-accent-espresso text-[#F5F0E8]' 
                  : 'bg-surface-elevated border border-border-subtle text-text-secondary'}
              `}
            >
              {msg.content || <span className="animate-pulse">...</span>}
            </div>
            {msg.role === 'assistant' && (
              <span className="font-ui text-[10px] text-text-tertiary mt-1 ml-1">TARS</span>
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border-subtle bg-surface-primary shrink-0">
        <div className="relative">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Ask TARS..."
            rows={2}
            className="w-full bg-surface border border-border-subtle rounded-lg pl-3 pr-10 py-2 font-prose text-sm text-text-primary placeholder:italic resize-none focus:border-accent-violet focus:outline-none transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 bottom-2 p-1.5 rounded text-text-tertiary hover:text-accent-violet hover:bg-accent-violet/10 disabled:opacity-50 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="font-ui text-[10px] text-text-tertiary">Shift+Enter for newline</span>
          {activeNote && (
            <label className="flex items-center gap-1.5 cursor-pointer group">
              <input 
                type="checkbox" 
                className="accent-accent-violet" 
                checked={includeContext}
                onChange={e => setIncludeContext(e.target.checked)}
              />
              <span className="font-ui text-[10px] text-text-tertiary group-hover:text-text-primary transition-colors">Include Note Context</span>
            </label>
          )}
        </div>
      </div>
    </div>
  )
}
