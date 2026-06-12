// ═══════════════════════════════════════════════════════════════
// Genten — Notes Store (Zustand)
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand'
import { invoke } from '../lib/apiAdapter'
import { v4 as uuidv4 } from 'uuid'
import type { Note, NoteType, NoteMetadata } from '../types/note'
import { NOTE_TYPE_INFO } from '../types/note'
import type { GraphData } from '../types/graph'
import { eventBus } from '../utils/eventBus'
import { slugify } from '../utils/slugify'
import { useSettingsStore } from './settingsStore'

interface NotesStore {
  notes: Note[]
  activeNote: Note | null
  recentNotes: Note[]

  // Actions
  loadVault: () => Promise<void>
  listenForLiveUpdates: () => void
  openNote: (id: string) => Promise<void>
  saveNote: (note: Partial<Note> & { id: string }) => Promise<void>
  createNote: (type: NoteType, title: string) => Promise<Note>
  deleteNote: (id: string) => Promise<void>
  searchNotes: (query: string) => Note[]
  getLinkedNotes: (id: string) => Note[]
  getBacklinks: (id: string) => Note[]
  getGraphData: () => GraphData
  setActiveNote: (note: Note | null) => void
}

function buildDefaultMetadata(): NoteMetadata {
  return {
    tags: [],
    links: [],
  }
}

function countWords(content: string): number {
  return content.trim().split(/\s+/).filter(Boolean).length
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  activeNote: null,
  recentNotes: [],

  loadVault: async () => {
    const config = useSettingsStore.getState().config
    if (!config.vault_path) return

    try {
      const entries = await invoke<Array<{
        name: string
        path: string
        is_dir: boolean
        children: unknown[] | null
      }>>('scan_vault', { vaultPath: config.vault_path })

      // Flatten file entries and load note files
      const noteFiles: string[] = []
      const flatten = (items: typeof entries) => {
        for (const item of items) {
          if (item.is_dir && item.children) {
            flatten(item.children as typeof entries)
          } else if (
            item.name.endsWith('.md') || item.name.endsWith('.html')
          ) {
            noteFiles.push(item.path)
          }
        }
      }
      flatten(entries)

      // Load each note file and parse it
      const notes: Note[] = []
      for (const filePath of noteFiles) {
        try {
          const content = await invoke<string>('read_note_file', { path: filePath })
          const note = parseNoteFromFile(filePath, content)
          if (note) notes.push(note)
        } catch (err) {
          console.warn(`[Notes] Failed to load ${filePath}:`, err)
        }
      }

      set({ notes })
    } catch (err) {
      console.error('[Notes] Failed to load vault:', err)
    }
  },

  listenForLiveUpdates: () => {
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
    if (isTauri) return; // Desktop app uses other methods or doesn't need this
    
    // Prevent multiple connections
    if ((window as any).__SSE_CONNECTED) return;
    (window as any).__SSE_CONNECTED = true;
    
    console.log('[Notes] Starting SSE live sync...');
    const url = window.location.protocol === 'http:' || window.location.protocol === 'https:' 
      ? `${window.location.protocol}//${window.location.host}/api/events`
      : 'http://127.0.0.1:8000/api/events';
    const source = new EventSource(url);
    source.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'FILE_CHANGED' && data.path) {
          const content = await invoke<string>('read_note_file', { path: data.path });
          const note = parseNoteFromFile(data.path, content);
          if (note) {
            set((state) => {
              const idx = state.notes.findIndex(n => n.id === note.id);
              if (idx !== -1) {
                const newNotes = [...state.notes];
                newNotes[idx] = note;
                return { notes: newNotes };
              } else {
                return { notes: [...state.notes, note] };
              }
            });
          }
        } else if (data.type === 'FILE_DELETED' && data.path) {
          set((state) => ({
            notes: state.notes.filter(n => n.file_path !== data.path)
          }));
        }
      } catch (err) {
        // Ignore JSON parse errors or network drops
      }
    };
  },

  openNote: async (id) => {
    const note = get().notes.find(n => n.id === id) ?? null
    if (note) {
      set((state) => ({
        activeNote: note,
        recentNotes: [
          note,
          ...state.recentNotes.filter(n => n.id !== id),
        ].slice(0, 5),
      }))
      eventBus.emit('note:opened', note)
    }
  },

  saveNote: async (partial) => {
    const notes = get().notes
    const idx = notes.findIndex(n => n.id === partial.id)
    if (idx === -1) return

    const existing = notes[idx]!
    const updated: Note = {
      ...existing,
      ...partial,
      updated_at: new Date().toISOString(),
      word_count: partial.content
        ? countWords(partial.content)
        : existing.word_count,
    }

    // Compute hash
    if (partial.content) {
      updated.content_hash = await invoke<string>('compute_content_hash', {
        content: partial.content,
      })
    }

    // Write to disk
    try {
      const fileContent = serializeNote(updated)
      await invoke('write_note_file', {
        path: updated.file_path,
        content: fileContent,
      })
    } catch (err) {
      console.error('[Notes] Failed to save:', err)
      throw err
    }

    const newNotes = [...notes]
    newNotes[idx] = updated
    set({
      notes: newNotes,
      activeNote: get().activeNote?.id === updated.id ? updated : get().activeNote,
    })
    eventBus.emit('note:saved', updated)
  },

  createNote: async (type, title) => {
    const config = useSettingsStore.getState().config
    const folder = NOTE_TYPE_INFO[type].folder
    const ext = config.file_format
    const fileName = `${slugify(title)}.${ext}`
    const filePath = `${config.vault_path}/${folder}/${fileName}`

    const now = new Date().toISOString()
    const note: Note = {
      id: uuidv4(),
      title,
      content: '',
      note_type: type,
      file_path: filePath,
      file_format: ext,
      metadata: buildDefaultMetadata(),
      content_hash: '',
      word_count: 0,
      created_at: now,
      updated_at: now,
      needs_embedding: true,
    }

    // Write to disk
    const fileContent = serializeNote(note)
    await invoke('write_note_file', { path: filePath, content: fileContent })

    set((state) => ({
      notes: [...state.notes, note],
      activeNote: note,
      recentNotes: [note, ...state.recentNotes].slice(0, 5),
    }))

    return note
  },

  deleteNote: async (id) => {
    const note = get().notes.find(n => n.id === id)
    if (!note) return

    await invoke('delete_note_file', { path: note.file_path })

    set((state) => ({
      notes: state.notes.filter(n => n.id !== id),
      activeNote: state.activeNote?.id === id ? null : state.activeNote,
      recentNotes: state.recentNotes.filter(n => n.id !== id),
    }))
    eventBus.emit('note:deleted', { id })
  },

  searchNotes: (query) => {
    const q = query.toLowerCase()
    return get().notes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.metadata.tags.some(t => t.toLowerCase().includes(q))
    )
  },

  getLinkedNotes: (id) => {
    const note = get().notes.find(n => n.id === id)
    if (!note) return []
    
    // Extract [[Title]] links from content
    const regex = /\[\[([^\]]+)\]\]/g
    const linkedTitles = new Set<string>()
    let match
    while ((match = regex.exec(note.content)) !== null) {
      linkedTitles.add(match[1]!.toLowerCase())
    }

    return get().notes.filter(n => 
      note.metadata.links.includes(n.id) || linkedTitles.has(n.title.toLowerCase())
    )
  },

  getBacklinks: (id) => {
    const targetNote = get().notes.find(n => n.id === id)
    if (!targetNote) return []
    
    const targetTitle = targetNote.title.toLowerCase()
    const regex = new RegExp(`\\[\\[${targetTitle}\\]\\]`, 'i')

    return get().notes.filter(n => {
      if (n.id === id) return false
      return n.metadata.links.includes(id) || regex.test(n.content)
    })
  },

  getGraphData: () => {
    const notes = get().notes
    const nodes = notes.map(n => ({
      id: n.id,
      title: n.title,
      note_type: n.note_type,
      link_count: n.metadata.links.length,
    }))

    // Also dynamically extract explicit links from content
    const links = notes.flatMap(n => {
      const explicitLinks: any[] = []
      
      // Frontmatter links
      n.metadata.links.forEach(targetId => {
        if (notes.some(t => t.id === targetId)) {
          explicitLinks.push({
            id: `${n.id}-${targetId}`,
            source: n.id,
            target: targetId,
            link_type: 'explicit' as const,
            strength: 1.0,
          })
        }
      })

      // Content wikilinks
      const regex = /\[\[([^\]]+)\]\]/g
      let match
      while ((match = regex.exec(n.content)) !== null) {
        const title = match[1]!.toLowerCase()
        const targetNode = notes.find(t => t.title.toLowerCase() === title)
        if (targetNode && !explicitLinks.some(l => l.target === targetNode.id)) {
          explicitLinks.push({
            id: `${n.id}-${targetNode.id}`,
            source: n.id,
            target: targetNode.id,
            link_type: 'explicit' as const,
            strength: 1.0,
          })
        }
      }
      return explicitLinks
    })

    return { nodes, links }
  },

  setActiveNote: (note) => set({ activeNote: note }),
}))

// ── File Parsing Helpers ────────────────────────────────────────

function parseNoteFromFile(filePath: string, content: string): Note | null {
  const ext = filePath.endsWith('.html') ? 'html' : 'md'

  if (ext === 'md') {
    return parseMdNote(filePath, content)
  }
  return parseHtmlNote(filePath, content)
}

function parseMdNote(filePath: string, raw: string): Note | null {
  // Parse YAML frontmatter
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!fmMatch) {
    // No frontmatter — create basic note
    const title = filePath.split('/').pop()?.replace('.md', '') ?? 'Untitled'
    return {
      id: uuidv4(),
      title,
      content: raw,
      note_type: 'capture',
      file_path: filePath,
      file_format: 'md',
      metadata: buildDefaultMetadata(),
      content_hash: '',
      word_count: countWords(raw),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      needs_embedding: true,
    }
  }

  const frontmatter = fmMatch[1] ?? ''
  const body = fmMatch[2] ?? ''

  // Simple YAML parsing (key: value)
  const fm: Record<string, string> = {}
  for (const line of frontmatter.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim()
      const val = line.slice(colonIdx + 1).trim()
      fm[key] = val
    }
  }

  const tags = (fm['tags'] ?? '[]')
    .replace(/[\[\]]/g, '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)

  const links = (fm['links'] ?? '[]')
    .replace(/[\[\]]/g, '')
    .split(',')
    .map(l => l.trim())
    .filter(Boolean)

  return {
    id: fm['id'] ?? uuidv4(),
    title: fm['title'] ?? 'Untitled',
    content: body,
    note_type: (fm['type'] as NoteType) ?? 'capture',
    file_path: filePath,
    file_format: 'md',
    metadata: {
      subject: fm['subject'] || undefined,
      topic: fm['topic'] || undefined,
      tags,
      links,
      difficulty: fm['difficulty'] as 'easy' | 'medium' | 'hard' | undefined,
      status: fm['status'] as 'attempted' | 'solved' | 'mastered' | undefined,
      platform: fm['platform'] || undefined,
    },
    content_hash: '',
    word_count: countWords(body),
    created_at: fm['created'] ?? new Date().toISOString(),
    updated_at: fm['updated'] ?? new Date().toISOString(),
    needs_embedding: true,
  }
}

function parseHtmlNote(filePath: string, raw: string): Note | null {
  // Extract meta tags from HTML
  const getMeta = (name: string): string | undefined => {
    const match = raw.match(new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`, 'i'))
    return match?.[1]
  }

  const titleMatch = raw.match(/<title>([^<]*)<\/title>/i)
  const bodyMatch = raw.match(/<article[^>]*>([\s\S]*?)<\/article>/i)

  return {
    id: getMeta('genten-id') ?? uuidv4(),
    title: titleMatch?.[1] ?? 'Untitled',
    content: bodyMatch?.[1] ?? raw,
    note_type: (getMeta('genten-type') as NoteType) ?? 'capture',
    file_path: filePath,
    file_format: 'html',
    metadata: {
      tags: (getMeta('genten-tags') ?? '').split(',').filter(Boolean),
      links: (getMeta('genten-links') ?? '').split(',').filter(Boolean),
    },
    content_hash: '',
    word_count: countWords(bodyMatch?.[1] ?? ''),
    created_at: getMeta('genten-created') ?? new Date().toISOString(),
    updated_at: getMeta('genten-updated') ?? new Date().toISOString(),
    needs_embedding: true,
  }
}

function serializeNote(note: Note): string {
  if (note.file_format === 'html') {
    return serializeHtmlNote(note)
  }
  return serializeMdNote(note)
}

function serializeMdNote(note: Note): string {
  const lines = [
    '---',
    `id: ${note.id}`,
    `title: ${note.title}`,
    `type: ${note.note_type}`,
  ]

  if (note.metadata.subject) lines.push(`subject: ${note.metadata.subject}`)
  if (note.metadata.topic) lines.push(`topic: ${note.metadata.topic}`)
  if (note.metadata.tags.length) {
    lines.push(`tags: [${note.metadata.tags.join(', ')}]`)
  }
  if (note.metadata.links.length) {
    lines.push(`links: [${note.metadata.links.join(', ')}]`)
  }
  lines.push(`created: ${note.created_at}`)
  lines.push(`updated: ${note.updated_at}`)

  if (note.metadata.difficulty) lines.push(`difficulty: ${note.metadata.difficulty}`)
  if (note.metadata.status) lines.push(`status: ${note.metadata.status}`)
  if (note.metadata.platform) lines.push(`platform: ${note.metadata.platform}`)

  lines.push('---')
  lines.push('')
  lines.push(note.content)

  return lines.join('\n')
}

function serializeHtmlNote(note: Note): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="genten-id" content="${note.id}">
  <meta name="genten-type" content="${note.note_type}">
  <meta name="genten-created" content="${note.created_at}">
  <meta name="genten-updated" content="${note.updated_at}">
  <meta name="genten-tags" content="${note.metadata.tags.join(',')}">
  <meta name="genten-links" content="${note.metadata.links.join(',')}">
  <title>${note.title}</title>
</head>
<body>
  <article class="genten-note">
    ${note.content}
  </article>
</body>
</html>`
}
