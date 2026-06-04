// ═══════════════════════════════════════════════════════════════
// Genten — TARS (AI) Types
// ═══════════════════════════════════════════════════════════════

export type TARSRole = 'user' | 'tars' | 'system'

export interface TARSMessage {
  id: string
  role: TARSRole
  content: string
  timestamp: string
  model?: string
  note_context?: string[]       // note IDs used as context
}

export interface TARSConversation {
  id: string
  messages: TARSMessage[]
  note_id?: string              // if conversation is attached to a note
  created_at: string
}

export interface OllamaModel {
  name: string
  size: number
  modified_at: string
}

export interface OllamaGenerateRequest {
  model: string
  prompt: string
  system?: string
  context?: number[]
  stream?: boolean
  options?: {
    temperature?: number
    top_p?: number
    num_predict?: number
  }
}

export interface OllamaGenerateResponse {
  model: string
  response: string
  done: boolean
  context?: number[]
  total_duration?: number
  load_duration?: number
  eval_count?: number
  eval_duration?: number
}

export interface OllamaEmbeddingRequest {
  model: string
  prompt: string
}

export interface OllamaEmbeddingResponse {
  embedding: number[]
}

export interface TARSInlineResponse {
  noteId: string
  trigger: string
  response: string
}
