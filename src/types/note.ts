// ═══════════════════════════════════════════════════════════════
// Genten — Note Types
// ═══════════════════════════════════════════════════════════════

export type NoteType =
  | 'study'
  | 'problem'
  | 'system_design'
  | 'diagram'
  | 'canvas'
  | 'capture'
  | 'daily'
  | 'expense'

export interface Note {
  id: string                    // UUID
  title: string
  content: string               // raw markdown/html
  note_type: NoteType
  file_path: string             // absolute path on disk
  file_format: 'md' | 'html'
  metadata: NoteMetadata
  content_hash: string          // for change detection
  word_count: number
  created_at: string            // ISO 8601
  updated_at: string
  needs_embedding: boolean
}

export interface NoteMetadata {
  subject?: string
  topic?: string
  source?: string
  tags: string[]
  links: string[]               // UUIDs of explicitly linked notes
  // Problem-specific
  difficulty?: 'easy' | 'medium' | 'hard'
  status?: 'attempted' | 'solved' | 'mastered'
  platform?: string
  code_blocks?: CodeBlock[]
  concepts?: string[]           // UUIDs of linked study notes
  spaced_rep?: SpacedRepData
  // System design specific
  canvas?: CanvasState
}

export interface CodeBlock {
  language: string
  code: string
  notes: string
}

export interface SpacedRepData {
  last_reviewed: string         // ISO 8601
  next_review: string           // ISO 8601
  interval_days: number
  review_count: number
}

export interface CanvasState {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  viewport: { x: number; y: number; zoom: number }
}

export interface CanvasNode {
  id: string
  label: string
  type: NoteType | 'component'
  linked_note_id: string | null
  x: number
  y: number
  width: number
  height: number
}

export interface CanvasEdge {
  id: string
  source_id: string
  target_id: string
  label: string
}

export interface Link {
  id: string
  source_id: string
  target_id: string
  link_type: 'explicit' | 'semantic'
  strength: number              // 1.0 explicit, 0-1 semantic
  created_at: string
}

/** Note type display info */
export const NOTE_TYPE_INFO: Record<NoteType, { label: string; folder: string; color: string }> = {
  study:         { label: 'Study',         folder: 'Study',          color: '#5B8DD9' },
  problem:       { label: 'Problem',       folder: 'Problems',       color: '#D4853A' },
  system_design: { label: 'System Design', folder: 'System Design',  color: '#7B5CE7' },
  diagram:       { label: 'Diagram',       folder: 'Diagrams',       color: '#3A8A82' },
  canvas:        { label: 'Canvas',        folder: 'Canvas',         color: '#C4626A' },
  daily:         { label: 'Daily',         folder: 'Daily',          color: '#9B9590' },
  capture:       { label: 'Capture',       folder: 'Captures',       color: '#C4BDB0' },
  expense:       { label: 'Expenses',      folder: 'Expenses',       color: '#85BB65' },
}
