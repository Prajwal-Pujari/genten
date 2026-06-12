import { useState, useRef, useEffect } from 'react'
import { X, Zap, Send, Bot, Play, Folder as FolderIcon } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useNotesStore } from '../../store/notesStore'
import { invoke } from '../../lib/apiAdapter'

export function TarsWorkspace() {
  const visible = useUIStore(s => s.tarsVisible)
  const toggle = useUIStore(s => s.toggleTARS)

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{role: 'user'|'tars', content: string}[]>([
    { role: 'tars', content: 'Hello. I am TARS. What engineering or research goal would you like to achieve today?' }
  ])
  const [activeProject, setActiveProject] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadChat = async () => {
    try {
      const hist = await invoke<any[]>('get_tars_chat')
      if (hist && hist.length > 0) {
        setMessages(hist)
      }
    } catch(e) {}
  }

  const loadGoal = async () => {
    try {
      const goal = await invoke<any>('get_tars_goal')
      if (goal && goal.project_name) {
        setActiveProject(goal.project_name)
      }
    } catch(e) {}
  }

  useEffect(() => {
    if (visible) {
      loadChat()
      loadGoal()
      
      const interval = setInterval(() => {
        loadChat()
        loadGoal()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [visible])

  if (!visible) return null

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      await invoke('send_tars_message', { message: userMessage })
    } catch(e) {
      console.error(e)
    }
  }

  const launchGoal = async () => {
    // Generate a quick project name from the last message
    const lastMsg = messages[messages.length - 1]?.content || 'Project'
    const words = lastMsg.split(' ').slice(0, 3).join('_')
    const projectName = words.replace(/[^a-zA-Z0-9_]/g, '') || "TARS_Project"
    
    setActiveProject(projectName)
    setMessages(prev => [...prev, { role: 'tars', content: `Goal locked in. Initializing workspace for ${projectName}... Dispatching Sub-Agents.` }])
    try {
      await invoke('launch_tars_goal', { projectName })
    } catch (e) {
      console.error(e)
    }
  }

  const allNotes = useNotesStore(s => s.notes)
  const projectNotes = allNotes.filter(n => n.metadata.project === activeProject)
  const openNote = useNotesStore(s => s.openNote)

  return (
    <div className="fixed inset-0 z-[100] flex bg-bg-base animate-fade-in flex-col md:flex-row">
      
      {/* Left Panel: TARS Chat */}
      <div className="w-full md:w-[400px] flex flex-col border-b md:border-b-0 md:border-r border-border-subtle bg-surface-primary shadow-sm z-10">
        <div className="h-14 px-4 flex items-center justify-between border-b border-border-subtle bg-surface-high pt-2">
          <div className="flex items-center gap-2 text-accent-violet">
            <Zap size={18} className="fill-accent-violet/20" />
            <h2 className="font-ui text-sm font-semibold tracking-wide">TARS ORCHESTRATOR</h2>
          </div>
          <button onClick={toggle} className="md:hidden p-1 text-text-tertiary hover:text-text-primary">
            <X size={16} />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-prose text-sm">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${msg.role === 'tars' ? 'bg-accent-violet/10 text-accent-violet' : 'bg-surface-elevated text-text-secondary'}`}>
                {msg.role === 'tars' ? <Bot size={16} /> : <div className="font-bold text-xs">U</div>}
              </div>
              <div className={`px-4 py-2 rounded-lg max-w-[85%] ${msg.role === 'user' ? 'bg-surface-elevated text-text-primary' : 'bg-accent-violet/5 text-text-secondary border border-accent-violet/10'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Action Area */}
        <div className="p-4 border-t border-border-subtle bg-surface-high space-y-3">
          {!activeProject && messages.length > 2 && (
            <button 
              onClick={launchGoal}
              className="w-full flex items-center justify-center gap-2 py-2 bg-accent-violet hover:bg-accent-violet/90 text-white font-ui text-sm rounded-md shadow-sm transition-colors"
            >
              <Play size={14} className="fill-white" />
              COMMENCE GOAL
            </button>
          )}
          
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Message TARS..."
              disabled={!!activeProject}
              className="w-full bg-surface-primary border border-border-subtle rounded-md pl-3 pr-10 py-2.5 font-ui text-sm text-text-primary focus:border-accent-violet focus:outline-none disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || !!activeProject}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-text-tertiary hover:text-accent-violet disabled:opacity-50 transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Right Panel: Project Dashboard */}
      <div className="flex-1 flex flex-col bg-bg-base relative">
        <div className="h-14 px-4 flex items-center justify-between border-b border-border-subtle bg-surface-high pt-2">
          <div className="flex items-center gap-2">
            <FolderIcon size={16} className="text-text-tertiary" />
            <h2 className="font-ui text-sm font-medium text-text-secondary">
              {activeProject ? `Project: ${activeProject}` : 'No Active Project'}
            </h2>
          </div>
          <button onClick={toggle} className="hidden md:block p-1 text-text-tertiary hover:text-text-primary">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          {!activeProject ? (
            <div className="text-center text-text-tertiary max-w-sm">
              <FolderIcon size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-ui text-sm">Discuss your goal with TARS to initialize a new isolated project workspace.</p>
            </div>
          ) : (
            <div className="w-full max-w-2xl h-full flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full border-2 border-accent-violet border-t-transparent animate-spin" />
                <p className="font-ui text-sm text-accent-violet animate-pulse">TARS Sub-Agents are working in the background...</p>
              </div>
              
              <div className="flex-1 bg-surface-elevated border border-border-subtle rounded-lg p-4 overflow-y-auto">
                <h3 className="font-ui text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wider">Project Files</h3>
                {projectNotes.length === 0 ? (
                  <p className="font-prose text-sm text-text-tertiary italic">Waiting for TARS to generate the first file...</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {projectNotes.map(note => (
                      <div 
                        key={note.id} 
                        onClick={() => { toggle(); openNote(note.id); }}
                        className="flex items-center gap-3 p-3 bg-surface-primary hover:bg-surface-high border border-border-subtle rounded-md cursor-pointer transition-colors"
                      >
                        <FolderIcon size={16} className="text-accent-violet" />
                        <span className="font-ui text-sm text-text-primary">{note.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
        
    </div>
  )
}
