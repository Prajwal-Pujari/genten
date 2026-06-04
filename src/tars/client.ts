// ═══════════════════════════════════════════════════════════════
// Genten — TARS Ollama HTTP Client
// ═══════════════════════════════════════════════════════════════

import type { OllamaGenerateResponse, OllamaModel } from '../types/tars'

/**
 * Low-level Ollama API client.
 * Uses native fetch — no axios or wrappers.
 */
export class TARSClient {
  constructor(private baseUrl: string) {}

  async generate(
    model: string,
    prompt: string,
    system?: string
  ): Promise<OllamaGenerateResponse> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        system,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`TARS generate error: ${response.status}`)
    }

    return response.json() as Promise<OllamaGenerateResponse>
  }

  async embed(model: string, text: string): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt: text }),
    })

    if (!response.ok) {
      throw new Error(`TARS embed error: ${response.status}`)
    }

    const data = await response.json() as { embedding: number[] }
    return data.embedding
  }

  async listModels(): Promise<OllamaModel[]> {
    const response = await fetch(`${this.baseUrl}/api/tags`)
    if (!response.ok) return []
    const data = await response.json() as { models?: OllamaModel[] }
    return data.models ?? []
  }

  async ping(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch {
      return false
    }
  }
}
