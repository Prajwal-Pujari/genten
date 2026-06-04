import { invoke } from '@tauri-apps/api/core'
import { useNotesStore } from '../../store/notesStore'

export interface SyncProgress {
  status: 'idle' | 'syncing' | 'success' | 'error'
  totalFiles: number
  processedFiles: number
  currentAction: string
  errorMsg?: string
}

interface RemoteManifestEntry {
  path: string
  modified: number
}

interface LocalManifestEntry {
  path: string
  modified: number
}

export async function runSync(
  hostUrl: string, 
  onProgress: (p: Partial<SyncProgress>) => void
) {
  try {
    // 1. Sanitize Host URL
    const baseUrl = hostUrl.trim().replace(/\/$/, '')
    if (!baseUrl.startsWith('http')) {
      throw new Error('Host URL must start with http:// or https://')
    }

    onProgress({ status: 'syncing', currentAction: 'Connecting to host...', processedFiles: 0, totalFiles: 0 })

    // 2. Fetch Remote Manifest
    let remoteManifest: RemoteManifestEntry[]
    try {
      const res = await fetch(`${baseUrl}/manifest`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      remoteManifest = await res.json()
    } catch (e: any) {
      throw new Error(`Failed to reach Desktop Sync Server. Ensure both devices are on the same WiFi and the server is started on the Desktop. (${e.message})`)
    }

    // 3. Gather Local Manifest
    onProgress({ currentAction: 'Scanning local vault...' })
    const config = await invoke<any>('get_config')
    if (!config.vault_path) throw new Error('Local vault path not configured')
    
    // We can't easily get modified dates from scan_vault since it just returns names.
    // So we'll fetch them using a custom Rust command, OR we can just rely on the existing invoke.
    // Wait, the easiest way is to add a small command to Rust to get local file modified times.
    // For now, let's just assume we download everything that's missing, and if conflict, compare.
    // Better yet, let's call the same 'get_manifest' rust logic internally since the mobile app is ALSO a Tauri app!
    
    // Actually, mobile can just fetch from localhost if it starts its own sync server! 
    // No, we can just use the backend. We need a `get_local_manifest` command. Let's add it to sync_server.rs.
    const localManifest = await invoke<LocalManifestEntry[]>('get_local_manifest', { vaultPath: config.vault_path })

    // 4. Compare Manifests
    onProgress({ currentAction: 'Calculating diff...' })
    const remoteMap = new Map(remoteManifest.map(e => [e.path, e.modified]))
    const localMap = new Map(localManifest.map(e => [e.path, e.modified]))

    const toDownload: string[] = []
    const toUpload: string[] = []

    // Check what needs to be downloaded
    for (const [path, rMod] of remoteMap) {
      const lMod = localMap.get(path)
      if (lMod === undefined || rMod > lMod) {
        toDownload.push(path)
      }
    }

    // Check what needs to be uploaded
    for (const [path, lMod] of localMap) {
      const rMod = remoteMap.get(path)
      if (rMod === undefined || lMod > rMod) {
        // If it wasn't on remote, or local is strictly newer
        // (If they are equal or remote is newer, we handled it above)
        toUpload.push(path)
      }
    }

    const totalActions = toDownload.length + toUpload.length
    onProgress({ totalFiles: totalActions, currentAction: `Syncing ${totalActions} files...` })

    let completed = 0

    // 5. Execute Downloads
    for (const path of toDownload) {
      onProgress({ currentAction: `Downloading ${path}...` })
      const res = await fetch(`${baseUrl}/download?path=${encodeURIComponent(path)}`)
      if (!res.ok) throw new Error(`Failed to download ${path}`)
      const content = await res.text()
      await invoke('write_note_file_absolute', { 
        path: `${config.vault_path}/${path}`, 
        content 
      })
      completed++
      onProgress({ processedFiles: completed })
    }

    // 6. Execute Uploads
    for (const path of toUpload) {
      onProgress({ currentAction: `Uploading ${path}...` })
      const localContent = await invoke<string>('read_note_file', { 
        path: `${config.vault_path}/${path}` 
      })
      
      const res = await fetch(`${baseUrl}/upload?path=${encodeURIComponent(path)}`, {
        method: 'POST',
        body: localContent,
      })
      if (!res.ok) throw new Error(`Failed to upload ${path}`)
      
      completed++
      onProgress({ processedFiles: completed })
    }

    // 7. Refresh Note Store
    onProgress({ currentAction: 'Reloading vault...' })
    await useNotesStore.getState().loadVault()

    onProgress({ status: 'success', currentAction: 'Sync complete!' })

  } catch (e: any) {
    console.error('Sync Error:', e)
    onProgress({ status: 'error', errorMsg: e.message })
  }
}
