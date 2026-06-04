// ═══════════════════════════════════════════════════════════════
// Genten — TARS Local Ollama Integration
// ═══════════════════════════════════════════════════════════════

import { useSettingsStore } from '../../store/settingsStore'
import { routePrompt } from './router'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function chatWithTARS(messages: ChatMessage[], onChunk?: (chunk: string) => void): Promise<string> {
  const { llmEndpoint } = useSettingsStore.getState()
  
  // Find the last user message to determine routing
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || ''
  const selectedModel = routePrompt(lastUserMessage)
  
  // Format messages for Ollama API
  const url = new URL('/api/chat', llmEndpoint).toString()
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: selectedModel,
        messages: messages,
        stream: !!onChunk,
      }),
    })

    if (!response.ok) {
      let errorDetail = response.statusText
      try {
        const errorBody = await response.json()
        if (errorBody.error) errorDetail = errorBody.error
      } catch (e) {}
      throw new Error(`Ollama Error (${selectedModel}): ${errorDetail}`)
    }

    if (onChunk && response.body) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        
        const chunkStr = decoder.decode(value, { stream: true })
        // Ollama streams back ndjson
        const lines = chunkStr.split('\n').filter(Boolean)
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            if (data.message?.content) {
              fullResponse += data.message.content
              onChunk(data.message.content)
            }
          } catch (e) {
            // ignore parse errors for partial chunks
          }
        }
      }
      return fullResponse
    } else {
      const data = await response.json()
      return data.message?.content || ''
    }
  } catch (error: any) {
    console.error("TARS Chat Error:", error)
    if (error.message && error.message.includes('Ollama Error')) {
      throw error // Re-throw the detailed error we threw above
    }
    throw new Error(`Failed to communicate with local LLM (Model: ${selectedModel}). Error: ${error.message}`)
  }
}

export async function analyzeImageWithVision(base64Image: string): Promise<string> {
  const { llmEndpoint, llmVisionModel } = useSettingsStore.getState()
  
  const url = new URL('/api/generate', llmEndpoint).toString()
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: llmVisionModel,
        prompt: 'You are an expert OCR and image analysis system. Extract all text, code, and explain what is in this image in extreme detail.',
        images: [base64Image],
        stream: false,
      }),
    })

    if (!response.ok) {
      let errorDetail = response.statusText
      try {
        const errorBody = await response.json()
        if (errorBody.error) errorDetail = errorBody.error
      } catch (e) {}
      throw new Error(`Vision Model Error (${llmVisionModel}): ${errorDetail}`)
    }

    const data = await response.json()
    return data.response || ''
  } catch (error: any) {
    console.error("Vision Analysis Error:", error)
    throw new Error(`Failed to analyze image with Vision Model (${llmVisionModel}). Error: ${error.message}`)
  }
}
