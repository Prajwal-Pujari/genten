import { EditorView } from '@codemirror/view'
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3, 
  Code, 
  Quote, 
  List, 
  ListOrdered, 
  CheckSquare
} from 'lucide-react'

interface EditorToolbarProps {
  view: EditorView | null
}

export function EditorToolbar({ view }: EditorToolbarProps) {
  const applyInlineFormat = (prefix: string, suffix: string = prefix) => {
    if (!view) return
    const selection = view.state.selection.main
    const text = view.state.sliceDoc(selection.from, selection.to)
    
    view.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: `${prefix}${text}${suffix}`
      },
      selection: {
        anchor: selection.from + prefix.length,
        head: selection.from + prefix.length + text.length
      }
    })
    view.focus()
  }

  const applyLineStart = (prefix: string) => {
    if (!view) return
    const selection = view.state.selection.main
    const line = view.state.doc.lineAt(selection.from)
    
    view.dispatch({
      changes: {
        from: line.from,
        insert: `${prefix} `
      }
    })
    view.focus()
  }

  const buttons = [
    { icon: <Bold size={14} />, label: 'Bold', action: () => applyInlineFormat('**') },
    { icon: <Italic size={14} />, label: 'Italic', action: () => applyInlineFormat('*') },
    { type: 'separator' },
    { icon: <Heading1 size={14} />, label: 'H1', action: () => applyLineStart('#') },
    { icon: <Heading2 size={14} />, label: 'H2', action: () => applyLineStart('##') },
    { icon: <Heading3 size={14} />, label: 'H3', action: () => applyLineStart('###') },
    { type: 'separator' },
    { icon: <Quote size={14} />, label: 'Quote', action: () => applyLineStart('>') },
    { icon: <Code size={14} />, label: 'Code', action: () => applyInlineFormat('`') },
    { type: 'separator' },
    { icon: <List size={14} />, label: 'Bullet List', action: () => applyLineStart('-') },
    { icon: <ListOrdered size={14} />, label: 'Number List', action: () => applyLineStart('1.') },
    { icon: <CheckSquare size={14} />, label: 'Task List', action: () => applyLineStart('- [ ]') },
  ]

  return (
    <div className="flex items-center gap-1 py-2 px-1 mb-2 border-b border-border-subtle/50 overflow-x-auto no-scrollbar">
      {buttons.map((btn, i) => {
        if (btn.type === 'separator') {
          return <div key={`sep-${i}`} className="w-px h-4 bg-border-subtle mx-1 flex-shrink-0" />
        }
        return (
          <button
            key={btn.label}
            onClick={btn.action}
            title={btn.label}
            className="w-7 h-7 flex items-center justify-center rounded text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors flex-shrink-0 cursor-pointer"
          >
            {btn.icon}
          </button>
        )
      })}
    </div>
  )
}
