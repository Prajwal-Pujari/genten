// ═══════════════════════════════════════════════════════════════
// Genten — Graph Types
// ═══════════════════════════════════════════════════════════════

import type { NoteType } from './note'

export interface GraphNode {
  id: string
  title: string
  note_type: NoteType
  link_count: number
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

export interface GraphEdge {
  id: string
  source: string | GraphNode
  target: string | GraphNode
  link_type: 'explicit' | 'semantic'
  strength: number
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphEdge[]
}

export interface GraphFilter {
  noteTypes: NoteType[]
  showSemanticLinks: boolean
  minLinkStrength: number
}
