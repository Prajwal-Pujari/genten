// ═══════════════════════════════════════════════════════════════
// Genten — TARS Router
// ═══════════════════════════════════════════════════════════════

import { useSettingsStore } from '../../store/settingsStore'

const CODE_KEYWORDS = [
  'function', 'class', 'impl', 'const', 'let', 'var', 'async',
  'await', 'public', 'private', 'struct', 'enum', 'interface',
  'type', 'react', 'typescript', 'javascript', 'rust', 'python',
  'html', 'css', 'tailwind', 'component', 'algorithm', 'data structure',
  'database', 'sql', 'query', 'code', 'debug', 'error', 'exception',
  'api', 'endpoint', 'json', 'yaml', 'xml', 'docker', 'kubernetes'
]

export function routePrompt(prompt: string): string {
  const settings = useSettingsStore.getState()
  
  // Very naive heuristic: if the prompt contains a lot of backticks
  // or a lot of coding keywords, route to the code model.
  
  const backtickCount = (prompt.match(/`/g) || []).length
  if (backtickCount >= 2) {
    return settings.llmCodeModel || settings.llmModel
  }

  const lowerPrompt = prompt.toLowerCase()
  let matchCount = 0
  
  for (const keyword of CODE_KEYWORDS) {
    if (lowerPrompt.includes(keyword)) {
      matchCount++
      if (matchCount >= 2) {
        return settings.llmCodeModel || settings.llmModel
      }
    }
  }

  return settings.llmModel
}
