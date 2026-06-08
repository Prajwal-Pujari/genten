import { useState, useEffect } from 'react'
import { Smartphone, RefreshCw, Server as ServerIcon, QrCode } from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import { runSync, SyncProgress } from '../../../lib/sync/syncEngine'

export function SyncPanel() {
  const [isMobile, setIsMobile] = useState(false)
  
  // Host state (Desktop)
  const [isHosting, setIsHosting] = useState(false)
  const [hostPort, setHostPort] = useState('1425')
  const [localIp, setLocalIp] = useState('')

  // Client state (Mobile)
  const [remoteHostUrl, setRemoteHostUrl] = useState('')
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    status: 'idle',
    totalFiles: 0,
    processedFiles: 0,
    currentAction: ''
  })

  useEffect(() => {
    // Detect if running on Android
    // A simple heuristic for Tauri Android: userAgent contains "Android"
    const isAndroid = navigator.userAgent.toLowerCase().includes('android')
    setIsMobile(isAndroid)
  }, [])

  const startHosting = async () => {
    try {
      const config = await invoke<any>('get_config')
      await invoke('start_sync_server', { vaultPath: config.vault_path, port: parseInt(hostPort) })
      setIsHosting(true)
      
      setLocalIp(`http://<YOUR_LAPTOP_IP>:${hostPort}`)
    } catch (e: any) {
      alert(`Failed to start server: ${e}`)
    }
  }

  const stopHosting = async () => {
    try {
      await invoke('stop_sync_server')
      setIsHosting(false)
    } catch (e: any) {
      alert(`Failed to stop server: ${e}`)
    }
  }

  const triggerSync = async () => {
    if (!remoteHostUrl) {
      alert('Please enter the Desktop Sync Server URL')
      return
    }
    await runSync(remoteHostUrl, (progress) => {
      setSyncProgress(prev => ({ ...prev, ...progress }))
    })
  }

  return (
    <section className="mt-12">
      <div className="flex items-center gap-2 mb-4">
        <Smartphone size={18} className="text-accent-blue" />
        <h2 className="font-ui text-lg font-medium text-text-primary">Device Sync (P2P)</h2>
      </div>
      <p className="font-prose text-sm text-text-tertiary mb-6">
        Sync notes securely between your Laptop and Mobile phone over your Local WiFi Network. No cloud required.
      </p>

      <div className="bg-surface-elevated border border-border-subtle rounded-xl p-6 shadow-sm">
        
        {!isMobile ? (
          // DESKTOP VIEW: Act as HOST
          <div className="space-y-6">
            <h3 className="font-ui text-sm font-semibold text-text-primary">Desktop Sync Host</h3>
            <p className="font-prose text-sm text-text-secondary">
              Start the sync server on your laptop, then connect to it from your phone.
            </p>
            
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block font-ui text-xs uppercase tracking-wider text-text-secondary mb-2">
                  Port
                </label>
                <input
                  type="text"
                  value={hostPort}
                  onChange={e => setHostPort(e.target.value)}
                  disabled={isHosting}
                  className="w-full bg-surface border border-border-subtle rounded px-4 py-2 font-code text-sm text-text-primary disabled:opacity-50"
                />
              </div>
              <button
                onClick={isHosting ? stopHosting : startHosting}
                className={`px-6 py-2 font-ui text-sm rounded transition-colors flex items-center gap-2 ${
                  isHosting ? 'bg-accent-red text-white' : 'bg-text-primary text-surface'
                }`}
              >
                <ServerIcon size={16} />
                {isHosting ? 'Stop Hosting' : 'Start Hosting'}
              </button>
            </div>

            {isHosting && (
              <div className="p-4 bg-surface border border-accent-blue/30 rounded-lg">
                <p className="font-prose text-sm text-accent-blue font-medium mb-2 flex items-center gap-2">
                  <QrCode size={16} /> Server is running!
                </p>
                <p className="font-code text-xs text-text-secondary">
                  Open the Genten Mobile App, go to Settings, and enter your laptop's local IP address:
                  <br/><br/>
                  <span className="font-bold text-text-primary">{localIp}</span>
                </p>
              </div>
            )}
          </div>
        ) : (
          // MOBILE VIEW: Act as CLIENT
          <div className="space-y-6">
            <h3 className="font-ui text-sm font-semibold text-text-primary">Connect to Desktop</h3>
            <p className="font-prose text-sm text-text-secondary">
              Enter the Sync Server URL displayed on your Laptop to synchronize your vault.
            </p>

            <div>
              <label className="block font-ui text-xs uppercase tracking-wider text-text-secondary mb-2">
                Desktop Server URL
              </label>
              <input
                type="text"
                value={remoteHostUrl}
                onChange={e => setRemoteHostUrl(e.target.value)}
                placeholder="http://192.168.1.X:1425"
                className="w-full bg-surface border border-border-subtle rounded px-4 py-2 font-code text-sm text-text-primary focus:border-accent-violet focus:outline-none transition-colors"
              />
            </div>

            <button
              onClick={triggerSync}
              disabled={syncProgress.status === 'syncing'}
              className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-text-primary text-surface font-ui text-sm rounded hover:bg-text-secondary transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={syncProgress.status === 'syncing' ? 'animate-spin' : ''} />
              {syncProgress.status === 'syncing' ? 'Syncing...' : 'Sync Now'}
            </button>

            {syncProgress.status !== 'idle' && (
              <div className={`p-4 rounded-lg font-code text-xs ${
                syncProgress.status === 'error' ? 'bg-accent-red/10 text-accent-red' : 'bg-surface text-text-secondary'
              }`}>
                {syncProgress.errorMsg ? (
                  <p>{syncProgress.errorMsg}</p>
                ) : (
                  <>
                    <p className="font-bold text-text-primary mb-1">{syncProgress.currentAction}</p>
                    {syncProgress.totalFiles > 0 && (
                      <p>Progress: {syncProgress.processedFiles} / {syncProgress.totalFiles} files</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  )
}
