// ═══════════════════════════════════════════════════════════════
// Genten — Settings Types
// ═══════════════════════════════════════════════════════════════

export interface AppConfig {
  vault_path: string
  file_format: 'md' | 'html'
  db_path: string
  postgres: PostgresConfig | null
  tars: TARSConfig | null
  appearance: AppearanceConfig
}

export interface TARSConfig {
  enabled: boolean
  llm_base_url: string          // e.g. http://192.168.1.100:11434
  router_url: string            // e.g. http://192.168.1.100:8080
  models: ModelConfig
  humor_level: number           // 0.0 to 1.0, default 0.75
  vision_enabled: boolean
}

export interface ModelConfig {
  reasoning: string             // gemma4:26b
  coding: string                // deepseek-coder-v2:16b
  vision?: string               // llama3.2-vision:11b
  fast: string                  // gemma4:e4b
  embeddings: string            // bge-m3
  embeddings_fallback: string   // nomic-embed-text
}

export interface PostgresConfig {
  connection_string: string
}

export interface AppearanceConfig {
  editor_font: 'lora' | 'inter' | 'system'
  code_font: 'geist-mono' | 'jetbrains-mono' | 'fira-code'
  editor_width: 'narrow' | 'comfortable' | 'wide' | 'full'
}

export const DEFAULT_CONFIG: AppConfig = {
  vault_path: '',
  file_format: 'md',
  db_path: '',
  postgres: null,
  tars: null,
  appearance: {
    editor_font: 'lora',
    code_font: 'geist-mono',
    editor_width: 'comfortable',
  },
}

export const DEFAULT_TARS_CONFIG: TARSConfig = {
  enabled: true,
  llm_base_url: 'http://192.168.1.100:11434',
  router_url: 'http://192.168.1.100:8080',
  models: {
    reasoning: 'gemma4:26b',
    coding: 'deepseek-coder-v2:16b',
    fast: 'gemma4:e4b',
    embeddings: 'bge-m3',
    embeddings_fallback: 'nomic-embed-text',
  },
  humor_level: 0.75,
  vision_enabled: true,
}
