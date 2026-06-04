// ═══════════════════════════════════════════════════════════════
// Genten — Settings Screen
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import { useSettingsStore } from '../../../store/settingsStore'
import { Server, Cpu, Database, CheckCircle2, AlertCircle } from 'lucide-react'
import { SyncPanel } from './SyncPanel'

export function SettingsScreen() {
  const settings = useSettingsStore()
  
  const [endpoint, setEndpoint] = useState(settings.llmEndpoint)
  const [model, setModel] = useState(settings.llmModel)
  const [codeModel, setCodeModel] = useState(settings.llmCodeModel)
  const [visionModel, setVisionModel] = useState(settings.llmVisionModel)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  
  const [availableModels, setAvailableModels] = useState<string[]>([])

  // Fetch available models from Ollama
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const url = new URL('/api/tags', endpoint).toString()
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          if (data.models) {
            setAvailableModels(data.models.map((m: any) => m.name))
          }
        }
      } catch (e) {
        // Silently fail if endpoint is invalid or unreachable yet
      }
    }
    const timer = setTimeout(fetchModels, 500)
    return () => clearTimeout(timer)
  }, [endpoint])

  const handleSave = () => {
    settings.updateLLMConfig(endpoint, model, codeModel, visionModel)
  }

  const testConnection = async () => {
    setTestStatus('testing')
    try {
      const url = new URL('/api/tags', endpoint).toString()
      const res = await fetch(url)
      if (res.ok) {
        setTestStatus('success')
        handleSave() // Save if successful
      } else {
        setTestStatus('error')
      }
    } catch (e) {
      setTestStatus('error')
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-bg-base">
      <div className="max-w-[860px] mx-auto py-16 px-8">
        <h1 className="font-ui text-2xl font-medium text-text-primary mb-12">Settings</h1>

        <datalist id="ollama-models">
          {availableModels.map(m => <option key={m} value={m} />)}
        </datalist>

        <div className="space-y-10">
          
          {/* AI Connection Settings */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Server size={18} className="text-accent-violet" />
              <h2 className="font-ui text-lg font-medium text-text-primary">Local LLM Connection</h2>
            </div>
            <p className="font-prose text-sm text-text-tertiary mb-6">
              Genten is built to run 100% locally. Connect to an Ollama server running on your machine or network.
            </p>

            <div className="bg-surface-elevated border border-border-subtle rounded-xl p-6 space-y-6 shadow-sm">
              <div>
                <label className="block font-ui text-xs uppercase tracking-wider text-text-secondary mb-2">
                  Ollama Endpoint
                </label>
                <input
                  type="text"
                  value={endpoint}
                  onChange={e => {
                    setEndpoint(e.target.value)
                    setTestStatus('idle')
                  }}
                  placeholder="http://localhost:11434"
                  className="w-full bg-surface border border-border-subtle rounded px-4 py-2 font-code text-sm text-text-primary focus:border-accent-violet focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block font-ui text-xs uppercase tracking-wider text-text-secondary mb-2">
                  General Model
                </label>
                <input
                  type="text"
                  list="ollama-models"
                  value={model}
                  onChange={e => {
                    setModel(e.target.value)
                    setTestStatus('idle')
                  }}
                  placeholder="e.g. gemma:2b"
                  className="w-full bg-surface border border-border-subtle rounded px-4 py-2 font-code text-sm text-text-primary focus:border-accent-violet focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block font-ui text-xs uppercase tracking-wider text-text-secondary mb-2">
                  Coding Model
                </label>
                <input
                  type="text"
                  list="ollama-models"
                  value={codeModel}
                  onChange={e => {
                    setCodeModel(e.target.value)
                    setTestStatus('idle')
                  }}
                  placeholder="e.g. deepseek-coder-v2"
                  className="w-full bg-surface border border-border-subtle rounded px-4 py-2 font-code text-sm text-text-primary focus:border-accent-violet focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block font-ui text-xs uppercase tracking-wider text-text-secondary mb-2">
                  Vision Model
                </label>
                <input
                  type="text"
                  list="ollama-models"
                  value={visionModel}
                  onChange={e => {
                    setVisionModel(e.target.value)
                    setTestStatus('idle')
                  }}
                  placeholder="e.g. llama3.2-vision:11b"
                  className="w-full bg-surface border border-border-subtle rounded px-4 py-2 font-code text-sm text-text-primary focus:border-accent-violet focus:outline-none transition-colors"
                />
                <p className="font-prose text-xs text-text-tertiary mt-2 italic">
                  Start typing to see models installed on your Ollama server.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={testConnection}
                  disabled={testStatus === 'testing'}
                  className="flex items-center gap-2 px-6 py-2 bg-text-primary text-surface font-ui text-sm rounded hover:bg-text-secondary transition-colors disabled:opacity-50"
                >
                  <Cpu size={16} />
                  {testStatus === 'testing' ? 'Testing...' : 'Test & Save'}
                </button>

                {testStatus === 'success' && (
                  <span className="flex items-center gap-1.5 text-accent-green font-ui text-sm">
                    <CheckCircle2 size={16} /> Connected!
                  </span>
                )}
                {testStatus === 'error' && (
                  <span className="flex items-center gap-1.5 text-accent-red font-ui text-sm">
                    <AlertCircle size={16} /> Connection failed
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Database Info */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Database size={18} className="text-text-secondary" />
              <h2 className="font-ui text-lg font-medium text-text-primary">Vault Storage</h2>
            </div>
            
            <div className="bg-surface-elevated border border-border-subtle rounded-xl p-6 shadow-sm space-y-6">
              <div>
                <label className="block font-ui text-xs uppercase tracking-wider text-text-secondary mb-2">
                  Vault Directory
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-surface border border-border-subtle rounded px-4 py-2 font-code text-sm text-text-primary overflow-x-auto whitespace-nowrap">
                    {settings.config.vault_path || "Not configured"}
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        const { open } = await import('@tauri-apps/plugin-dialog')
                        const selected = await open({
                          directory: true,
                          multiple: false,
                          title: 'Select Vault Directory'
                        })
                        if (selected && typeof selected === 'string') {
                          const { invoke } = await import('@tauri-apps/api/core')
                          await invoke('set_vault_path', { path: selected })
                          await invoke('create_vault_folders', { vaultPath: selected })
                          
                          // Update settings store
                          const newConfig = { ...settings.config, vault_path: selected }
                          await settings.completeSetup(newConfig)
                        }
                      } catch (err) {
                        alert("Failed to select folder: " + err)
                      }
                    }}
                    className="px-4 py-2 bg-text-primary text-surface font-ui text-sm rounded hover:bg-text-secondary transition-colors whitespace-nowrap"
                  >
                    Browse...
                  </button>
                </div>
                <p className="font-prose text-xs text-text-tertiary mt-2">
                  This is where all your notes, images, and attachments are physically stored.
                </p>
              </div>

              <div>
                <label className="block font-ui text-xs uppercase tracking-wider text-text-secondary mb-2">
                  SQLite Database Path
                </label>
                <div className="w-full bg-surface border border-border-subtle rounded px-4 py-2 font-code text-sm text-text-tertiary">
                  Managed securely by Tauri in local AppData.
                </div>
              </div>
            </div>
          </section>

          {/* Sync Engine */}
          <SyncPanel />

        </div>
      </div>
    </div>
  )
}
