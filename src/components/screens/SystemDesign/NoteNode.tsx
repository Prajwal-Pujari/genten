// ═══════════════════════════════════════════════════════════════
// Genten — System Design Note Node
// ═══════════════════════════════════════════════════════════════

import { Handle, Position, NodeProps, Node } from '@xyflow/react'
import { TypeDot } from '../../shared/TypeDot'
import { useNotesStore } from '../../../store/notesStore'
import { useUIStore } from '../../../store/uiStore'
import { NoteType } from '../../../types/note'
import { useState } from 'react'

export type NoteNodeData = {
  title: string
  subtitle?: string
  note_type: NoteType
  linked_note_id?: string
}

export type GentenNoteNode = Node<NoteNodeData, 'noteNode'>

export function NoteNode({ data, selected }: NodeProps<GentenNoteNode>) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(data.title)
  const openNote = useNotesStore(s => s.openNote)
  const navigate = useUIStore(s => s.navigate)

  const handleDoubleClick = () => {
    setEditing(true)
  }

  const handleBlur = () => {
    setEditing(false)
    data.title = title // In a real app we'd dispatch a ReactFlow update here
  }

  const handleClick = (e: React.MouseEvent) => {
    // Only navigate on click if not editing, and linked note exists
    if (!editing && data.linked_note_id && !e.defaultPrevented) {
      openNote(data.linked_note_id)
      navigate('editor')
    }
  }

  return (
    <div 
      className={`
        bg-[#F8F3EB] border rounded-lg shadow-sm w-48 transition-colors
        ${selected ? 'border-[#6B5CE7] ring-1 ring-[#6B5CE7]/20' : 'border-[#D8D2C8] hover:border-[#C4BDB0]'}
      `}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-[#C4BDB0] !border-none" />
      
      <div className="px-3 py-2 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <TypeDot type={data.note_type} size={8} />
          {data.linked_note_id && (
            <span className="font-label text-[9px] text-[#9B9590] uppercase tracking-widest">Linked</span>
          )}
        </div>
        
        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={e => e.key === 'Enter' && handleBlur()}
            className="w-full bg-transparent border-b border-[#6B5CE7] font-ui text-sm font-medium text-text-primary focus:outline-none"
          />
        ) : (
          <div className="font-ui text-sm font-medium text-text-primary leading-tight">
            {title}
          </div>
        )}

        {data.subtitle && !editing && (
          <div className="font-prose text-xs text-text-tertiary italic line-clamp-2">
            {data.subtitle}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-[#C4BDB0] !border-none" />
    </div>
  )
}
