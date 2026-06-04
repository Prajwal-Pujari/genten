// ═══════════════════════════════════════════════════════════════
// Genten — System Design Canvas
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  MarkerType,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { NoteNode, GentenNoteNode } from './NoteNode'
import { DefaultEdge } from './DefaultEdge'
import { useNotesStore } from '../../../store/notesStore'
import { useConnectionStore } from '../../../store/connectionStore'
import { Plus, Maximize, Zap } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

const nodeTypes = { noteNode: NoteNode }
const edgeTypes = { defaultEdge: DefaultEdge }

export function Canvas() {
  const activeNote = useNotesStore(s => s.activeNote)
  const saveNote = useNotesStore(s => s.saveNote)
  const isAIConnected = useConnectionStore(s => s.effectiveState)() === 'connected'
  const { fitView } = useReactFlow()

  const [nodes, setNodes] = useState<GentenNoteNode[]>([])
  const [edges, setEdges] = useState<Edge[]>([])

  // Parse state from markdown frontmatter on mount
  useEffect(() => {
    if (!activeNote) return
    try {
      const match = activeNote.content.match(/```json:canvas\n([\s\S]*?)\n```/)
      if (match && match[1]) {
        const state = JSON.parse(match[1])
        setNodes(state.nodes || [])
        setEdges(state.edges || [])
        setTimeout(() => fitView({ padding: 0.2 }), 100)
      } else if (nodes.length === 0) {
        // Initial setup for empty canvas
        const initNode: GentenNoteNode = {
          id: uuidv4(),
          type: 'noteNode',
          position: { x: 250, y: 250 },
          data: { title: 'Main System', note_type: 'system_design' }
        }
        setNodes([initNode])
      }
    } catch (e) {
      console.error("Failed to parse canvas state", e)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNote?.id])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds) as GentenNoteNode[]),
    []
  )
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  )
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params, 
      type: 'defaultEdge',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#C4BDB0' }
    }, eds)),
    []
  )

  // Auto-save debounce
  useEffect(() => {
    if (!activeNote || nodes.length === 0) return
    const timer = setTimeout(() => {
      const canvasState = { nodes, edges }
      const jsonStr = `\n\n\`\`\`json:canvas\n${JSON.stringify(canvasState, null, 2)}\n\`\`\``
      
      // Strip old canvas block and append new one
      const cleanContent = activeNote.content.replace(/\n\n```json:canvas\n[\s\S]*?\n```/, '')
      saveNote({
        id: activeNote.id,
        content: cleanContent + jsonStr
      })
    }, 2000)

    return () => clearTimeout(timer)
  }, [nodes, edges, activeNote, saveNote])

  const addNode = () => {
    const newNode: GentenNoteNode = {
      id: uuidv4(),
      type: 'noteNode',
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      data: { title: 'New Component', note_type: 'diagram' }
    }
    setNodes(nds => [...nds, newNode])
  }

  return (
    <div className="w-full h-full relative">
      {/* Floating Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-surface-elevated p-1.5 rounded-lg border border-border-subtle shadow-modal">
        <button onClick={addNode} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface hover:bg-surface-high font-ui text-xs text-text-primary transition-state border border-border-subtle">
          <Plus size={14} /> Add Component
        </button>
        <button onClick={() => fitView({ duration: 800 })} className="p-1.5 rounded text-text-tertiary hover:text-text-primary transition-state">
          <Maximize size={16} />
        </button>
        {isAIConnected && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-accent-violet/10 hover:bg-accent-violet/20 font-ui text-xs text-accent-violet transition-state border border-accent-violet/30 ml-2">
            <Zap size={14} /> Suggest Components
          </button>
        )}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-[#F5F0E8]"
        defaultEdgeOptions={{
          type: 'defaultEdge',
          markerEnd: { type: MarkerType.ArrowClosed, color: '#C4BDB0' }
        }}
      >
        <Background 
          color="#D8D2C8" 
          gap={24} 
          size={2}
        />
        <Controls showInteractive={false} className="!bg-surface-high !border-border-subtle !shadow-sm !text-text-primary" />
      </ReactFlow>
    </div>
  )
}
