// ═══════════════════════════════════════════════════════════════
// Genten — TARS Local Ollama Integration
// ═══════════════════════════════════════════════════════════════

import { useSettingsStore } from '../../store/settingsStore'
import { routePrompt } from './router'
import { invoke } from '../apiAdapter';
import { listen } from '@tauri-apps/api/event';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  images?: string[]
}

export async function chatWithTARS(messages: ChatMessage[], onChunk?: (chunk: string) => void): Promise<string> {
  const { llmEndpoint } = useSettingsStore.getState()
  const reqId = Date.now().toString() + Math.random().toString(36).substring(7)
  
  // Find the last user message to determine routing
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || ''
  const selectedModel = routePrompt(lastUserMessage)
  
  try {
    let unlisten: (() => void) | undefined;
    
    if (onChunk) {
      unlisten = await listen<string>(`ollama-chunk-${reqId}`, (event) => {
        onChunk(event.payload);
      });
    }

    const fullResponse: string = await invoke('generate_ollama_chat', {
      endpoint: llmEndpoint,
      model: selectedModel,
      messages: messages,
      reqId: reqId
    });

    if (unlisten) unlisten();
    return fullResponse;
    
  } catch (error: any) {
    console.error("TARS Chat Error:", error)
    const errorMessage = error.message || String(error)
    throw new Error(`Failed to communicate with local LLM (Model: ${selectedModel}). Error: ${errorMessage}`)
  }
}

export async function analyzeImageWithVision(base64Image: string): Promise<string> {
  const { llmEndpoint, llmVisionModel } = useSettingsStore.getState()
  
  try {
    const response: string = await invoke('analyze_vision_image', {
      endpoint: llmEndpoint,
      model: llmVisionModel,
      imageBase64: base64Image
    });
    return response;
  } catch (error: any) {
    console.error("Vision Analysis Error:", error)
    throw new Error(`Failed to analyze image with Vision Model (${llmVisionModel}). Error: ${error.message || String(error)}`)
  }
}
