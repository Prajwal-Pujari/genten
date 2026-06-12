import { invoke } from '../apiAdapter'
import { useNotesStore } from '../../store/notesStore'
import { useSettingsStore } from '../../store/settingsStore'

export interface SyncProgress {
  status: 'idle' | 'syncing' | 'error' | 'success'
  totalFiles: number
  processedFiles: number
  currentAction: string
  errorMsg?: string
}

export interface RemoteManifestEntry {
  path: string
  modified: number
}

function isTextFile(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase()
  return ext === 'md' || ext === 'html'
}

export async function runSync(hostUrl: string, onProgress: (p: Partial<SyncProgress>) => void) {
  try {
    onProgress({ status: 'syncing', processedFiles: 0, totalFiles: 0, currentAction: 'Connecting...', errorMsg: undefined })
    
    const baseUrl = hostUrl.trim().replace(/\/$/, '')
    if (!baseUrl.startsWith('http')) {
      throw new Error('Host URL must start with http:// or https://')
    }

    // 1. Get Desktop Vault Path to know where to save
    const config: any = await invoke('get_config')

    // 2. Fetch Remote Manifest
    let remoteManifest: RemoteManifestEntry[]
    try {
      remoteManifest = await invoke<RemoteManifestEntry[]>('fetch_remote_manifest', { url: `${baseUrl}/manifest` })
    } catch (e: any) {
      throw new Error(`Failed to reach Desktop Sync Server. Ensure both devices are on the same WiFi and the server is started on the Desktop. (${e})`)
    }

    // 3. Gather Local Manifest
    onProgress({ currentAction: 'Gathering local files...' })
    const localManifest = await invoke<RemoteManifestEntry[]>('get_local_manifest', { vaultPath: config.vault_path })
    
    const localMap = new Map<string, number>()
    localManifest.forEach(e => localMap.set(e.path, e.modified))

    const remoteMap = new Map<string, number>()
    remoteManifest.forEach(e => remoteMap.set(e.path, e.modified))

    // 4. Calculate Diffs
    const toDownload: string[] = []
    const toUpload: string[] = []

    for (const remote of remoteManifest) {
      const localTime = localMap.get(remote.path)
      if (!localTime || remote.modified > localTime) {
        toDownload.push(remote.path)
      }
    }

    for (const local of localManifest) {
      const remoteTime = remoteMap.get(local.path)
      if (!remoteTime || local.modified > remoteTime) {
        toUpload.push(local.path)
      }
    }

    const total = toDownload.length + toUpload.length
    onProgress({ totalFiles: total, currentAction: 'Syncing...' })

    let completed = 0

    // 5. Execute Downloads
    for (const path of toDownload) {
      onProgress({ currentAction: `Downloading ${path}...` })
      
      const absolutePath = `${config.vault_path}/${path}`
      
      if (isTextFile(path)) {
        const bytes = await invoke<number[]>('fetch_remote_file', { url: `${baseUrl}/download?path=${encodeURIComponent(path)}` })
        const content = new TextDecoder().decode(new Uint8Array(bytes))
        await invoke('write_note_file_absolute', { path: absolutePath, content })
      } else {
        await invoke('download_remote_file_to_disk', { 
          url: `${baseUrl}/download?path=${encodeURIComponent(path)}`,
          absolutePath 
        })
      }
      completed++
      onProgress({ processedFiles: completed })
    }

    // 6. Execute Uploads
    for (const path of toUpload) {
      onProgress({ currentAction: `Uploading ${path}...` })
      const absolutePath = `${config.vault_path}/${path}`
      
      if (isTextFile(path)) {
        const text = await invoke<string>('read_note_file', { path: absolutePath })
        const bytes = Array.from(new TextEncoder().encode(text))
        await invoke('upload_remote_file', { 
          url: `${baseUrl}/upload?path=${encodeURIComponent(path)}`,
          bytes
        })
      } else {
        await invoke('upload_local_file_to_remote', { 
          absolutePath,
          url: `${baseUrl}/upload?path=${encodeURIComponent(path)}`
        })
      }
      
      completed++
      onProgress({ processedFiles: completed })
    }

    // 7. Refresh Store
    onProgress({ currentAction: 'Refreshing UI...' })
    useSettingsStore.getState().completeSetup(config)
    await useNotesStore.getState().loadVault()

    // Notify the host that sync is finished so it can refresh its UI too
    try {
      await invoke('fetch_remote_file', { url: `${baseUrl}/sync_complete` })
    } catch (e) {
      // ignore
    }

    onProgress({ status: 'success', currentAction: 'Sync Complete' })

  } catch (e: any) {
    onProgress({ status: 'error', errorMsg: e.message || String(e) })
  }
}
