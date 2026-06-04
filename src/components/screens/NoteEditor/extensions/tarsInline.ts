// ═══════════════════════════════════════════════════════════════
// Genten — CodeMirror 6 Inline TARS Extension
// ═══════════════════════════════════════════════════════════════

import { keymap } from '@codemirror/view'
import { StateCommand } from '@codemirror/state'
import { chatWithTARS, ChatMessage } from '../../../../lib/tars/ollama'
import { useNotesStore } from '../../../../store/notesStore'
import { useSettingsStore } from '../../../../store/settingsStore'

let isGenerating = false

export const handleTarsEnter: StateCommand = (target) => {
  if (isGenerating) return false

  const state = target.state
  const selection = state.selection.main
  if (!selection.empty) return false

  const line = state.doc.lineAt(selection.from)
  const text = line.text

  const tarsIndex = text.indexOf('@tars')
  if (tarsIndex === -1) return false
  
  if (selection.from !== line.to) return false // Must be at end of line

  const promptText = text.slice(tarsIndex + 5).trim()
  if (!promptText) return false

  isGenerating = true

  // Unique invisible marker so we can safely find our insertion point
  // using Zero-width space (\u200B) and Zero-width non-joiner (\u200C)
  const invisibleId = Array.from({length: 8}, () => Math.random() > 0.5 ? '\u200B' : '\u200C').join('')
  const startMarker = `\u200B${invisibleId}\u200B`
  const initialText = `\n\n>  Thinking... [ ] \n`
  const initialMarker = startMarker + initialText

  target.dispatch(target.state.update({
    changes: { from: line.to, insert: initialMarker },
    selection: { anchor: line.to + initialMarker.length }
  }))

  let currentInsertionLength = initialText.length

  // Start CMD Loader Animation
  const loaderFrames = ['-', '\\', '|', '/']
  let frameIdx = 0
  const loaderInterval = setInterval(() => {
    const docText = target.state.doc.toString()
    const startPos = docText.indexOf(startMarker)
    if (startPos !== -1) {
      const frame = loaderFrames[frameIdx % loaderFrames.length]
      const searchStr = `Thinking... [`
      // Search only within our inserted text
      const blockText = docText.substring(startPos + startMarker.length, startPos + startMarker.length + currentInsertionLength)
      const thinkIdx = blockText.indexOf(searchStr)
      if (thinkIdx !== -1) {
        const absoluteIdx = startPos + startMarker.length + thinkIdx
        target.dispatch(target.state.update({
          changes: { 
            from: absoluteIdx + searchStr.length, 
            to: absoluteIdx + searchStr.length + 1, 
            insert: frame 
          }
        }))
      }
      frameIdx++
    } else {
      clearInterval(loaderInterval)
    }
  }, 100)

  // Start generation
  ;(async () => {
    try {
      const activeNote = useNotesStore.getState().activeNote
      const apiMessages: ChatMessage[] = [
        { 
          role: 'system', 
          content: 'You are TARS. Answer the user\'s prompt inline within their notes. Follow their length requirements exactly. Do NOT wrap your answer in blockquotes, just provide raw text. ABSOLUTELY NO EMOJIS ALLOWED IN YOUR RESPONSES. DO NOT USE A SINGLE EMOJI.' 
        }
      ]

      if (activeNote) {
        let visionContext = ''
        const imageRegex = /!\[.*?\]\((.+?)\)/g
        let match
        
        while ((match = imageRegex.exec(activeNote.content)) !== null) {
          const imagePath = match[1]
          if (imagePath) {
            try {
              const vaultPath = useSettingsStore.getState().config.vault_path
              const { invoke } = await import('@tauri-apps/api/core')
              const { analyzeImageWithVision } = await import('../../../../lib/tars/ollama')
              
              const base64 = await invoke<string>('read_image_base64', { 
                vaultPath, 
                relativePath: imagePath 
              })
              const analysis = await analyzeImageWithVision(base64)
              visionContext += `\n[Image Analysis for ${imagePath}]:\n${analysis}\n`
            } catch (err) {
              console.warn("Failed to process image:", err)
            }
          }
        }

        let contextContent = `CONTEXT:\nTitle: ${activeNote.title}\n---\n${activeNote.content}`
        if (visionContext) {
          contextContent += `\n\n--- VISION ANALYSIS (Images found in note) ---\n${visionContext}`
        }

        apiMessages.push({
          role: 'system',
          content: contextContent
        })
      }

      apiMessages.push({ role: 'user', content: promptText })

      let isFirstChunk = true
      let charQueue = ''

      // The interval that consumes the queue
      const typeWriterInterval = setInterval(() => {
        if (charQueue.length > 0) {
          // Dynamic typing speed: if the queue gets large, type faster to catch up!
          let charsToTake = 3
          if (charQueue.length > 20) charsToTake = 6
          if (charQueue.length > 50) charsToTake = 12
          if (charQueue.length > 150) charsToTake = 24

          const chunkToType = charQueue.slice(0, charsToTake)
          charQueue = charQueue.slice(charsToTake)

          const docText = target.state.doc.toString()
          const startPos = docText.indexOf(startMarker)
          if (startPos === -1) return

          target.dispatch(target.state.update({
            changes: { 
              from: startPos + startMarker.length + currentInsertionLength, 
              insert: chunkToType
            }
          }))
          currentInsertionLength += chunkToType.length
        }
      }, 15) // Typewriter speed (ms per tick)

      await chatWithTARS(apiMessages, (chunk) => {
        const docText = target.state.doc.toString()
        const startPos = docText.indexOf(startMarker)
        if (startPos === -1) return // Marker got deleted by user, abort

        let formattedDelta = chunk.replace(/\n/g, '\n> ')

        if (isFirstChunk) {
          clearInterval(loaderInterval)
          isFirstChunk = false

          formattedDelta = `\n\n> ` + formattedDelta
          
          target.dispatch(target.state.update({
            changes: { 
              from: startPos + startMarker.length, 
              to: startPos + startMarker.length + currentInsertionLength, 
              insert: formattedDelta
            }
          }))
          currentInsertionLength = formattedDelta.length
        } else {
          // Add to the queue instead of instantly inserting
          charQueue += formattedDelta
        }
      })
      
      // Wait for queue to empty before finishing
      await new Promise<void>((resolve) => {
        const check = setInterval(() => {
          if (charQueue.length === 0) {
            clearInterval(check)
            clearInterval(typeWriterInterval)
            resolve()
          }
        }, 50)
      })

      // Clean up start marker at the very end
      const finalDocText = target.state.doc.toString()
      const finalStartPos = finalDocText.indexOf(startMarker)
      if (finalStartPos !== -1) {
        target.dispatch(target.state.update({
          changes: { from: finalStartPos, to: finalStartPos + startMarker.length, insert: '' }
        }))
      }
      
    } catch (e: any) {
      clearInterval(loaderInterval)
      // Note: We use a specific variable inside try to clear typeWriterInterval, 
      // but because setInterval returns NodeJS.Timeout, it's safer to clear all intervals if needed, 
      // or we just trust the queue check to clear itself since charQueue stops growing.
      
      const docText = target.state.doc.toString()
      const startPos = docText.indexOf(startMarker)
      if (startPos !== -1) {
        const errorText = `\n\n> [Error]: ${e.message}\n`
        target.dispatch(target.state.update({
          changes: { 
            from: startPos + startMarker.length, 
            to: startPos + startMarker.length + currentInsertionLength, 
            insert: errorText
          }
        }))
        currentInsertionLength = errorText.length
        
        // Remove invisible marker
        target.dispatch(target.state.update({
          changes: { from: startPos, to: startPos + startMarker.length, insert: '' }
        }))
      }
    } finally {
      clearInterval(loaderInterval)
      isGenerating = false
    }
  })()

  return true
}

export const tarsInlinePlugin = keymap.of([
  { key: 'Enter', run: handleTarsEnter }
])
