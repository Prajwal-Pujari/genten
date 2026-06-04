// ═══════════════════════════════════════════════════════════════
// Genten — Ollama API Hook
// ═══════════════════════════════════════════════════════════════

import { useCallback } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import type {
  OllamaGenerateRequest,
  OllamaGenerateResponse,
  OllamaEmbeddingResponse,
  OllamaModel,
} from '../types/tars'

/**
 * Hook for making Ollama API calls.
 * All calls go through the configured llm_base_url.
 */
export function useOllama() {
  const tarsConfig = useSettingsStore(s => s.config.tars)

  const baseUrl = tarsConfig?.llm_base_url ?? ''

  const generate = useCallback(async (
    request: OllamaGenerateRequest
  ): Promise<OllamaGenerateResponse> => {
    if (!baseUrl) throw new Error('TARS not configured')

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...request, stream: false }),
    })

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`)
    }

    return response.json() as Promise<OllamaGenerateResponse>
  }, [baseUrl])

  const embed = useCallback(async (
    text: string,
    model?: string
  ): Promise<number[]> => {
    if (!baseUrl) throw new Error('TARS not configured')

    const embedModel = model
      ?? tarsConfig?.models.embeddings
      ?? 'nomic-embed-text'

    const response = await fetch(`${baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: embedModel, prompt: text }),
    })

    if (!response.ok) {
      throw new Error(`Embedding error: ${response.status}`)
    }

    const data = await response.json() as OllamaEmbeddingResponse
    return data.embedding
  }, [baseUrl, tarsConfig])

  const listModels = useCallback(async (): Promise<OllamaModel[]> => {
    if (!baseUrl) return []

    const response = await fetch(`${baseUrl}/api/tags`)
    if (!response.ok) return []

    const data = await response.json() as { models?: OllamaModel[] }
    return data.models ?? []
  }, [baseUrl])

  return {
    generate,
    embed,
    listModels,
    isConfigured: !!baseUrl,
  }
}
