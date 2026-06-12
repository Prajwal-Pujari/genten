import { EditorView } from '@codemirror/view'
import { invoke } from '../../../../lib/apiAdapter'

// Helper to convert File to an array of bytes for Rust
async function fileToBytes(file: File): Promise<number[]> {
  const arrayBuffer = await file.arrayBuffer()
  return Array.from(new Uint8Array(arrayBuffer))
}

// Handle file drop or paste
export async function handleImageFile(view: EditorView, file: File, pos: number) {
  if (!file.type.startsWith('image/')) return false

  try {
    const { useSettingsStore } = await import('../../../../store/settingsStore')
    const vaultPath = useSettingsStore.getState().config.vault_path
    
    if (!vaultPath) {
      alert("Vault path is not configured! Please go to Settings and set a Vault Directory first.")
      return false
    }

    const bytes = await fileToBytes(file)
    const relativePath: string = await invoke('save_attachment', {
      vaultPath: vaultPath,
      filename: file.name || 'pasted-image.png',
      bytes: bytes
    })

    const markdownImage = `\n![${file.name || 'image'}](${relativePath})\n`

    view.dispatch({
      changes: { from: pos, insert: markdownImage },
      selection: { anchor: pos + markdownImage.length }
    })
    
    return true
  } catch (error) {
    console.error('Failed to save image attachment:', error)
    return false
  }
}

export const imageDropPlugin = EditorView.domEventHandlers({
  drop(event, view) {
    if (!event.dataTransfer?.files?.length) return false
    
    const file = event.dataTransfer.files[0]
    if (!file || !file.type.startsWith('image/')) return false

    event.preventDefault()
    
    // Get cursor position at drop coordinates
    const pos = view.posAtCoords({ x: event.clientX, y: event.clientY })
    if (pos === null) return false

    handleImageFile(view, file, pos)
    return true
  },
  
  paste(event, view) {
    if (!event.clipboardData) {
      return false
    }

    let file: File | null = null

    // First try items
    if (event.clipboardData.items) {
      for (let i = 0; i < event.clipboardData.items.length; i++) {
        const item = event.clipboardData.items[i]
        if (item && item.type.startsWith('image/')) {
          file = item.getAsFile()
          break
        }
      }
    }
    
    // Fallback to files
    if (!file && event.clipboardData.files && event.clipboardData.files.length > 0) {
      file = event.clipboardData.files[0] || null
    }

    if (!file) {
      // Not an image (probably text), fail silently so default paste works
      return false
    }

    if (!file.type.startsWith('image/')) {
      return false
    }

    event.preventDefault()
    
    const pos = view.state.selection.main.head
    handleImageFile(view, file, pos).catch(e => alert("Error saving image: " + e))
    return true
  }
})
