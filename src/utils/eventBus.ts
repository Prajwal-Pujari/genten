// ═══════════════════════════════════════════════════════════════
// Genten — Type-safe Event Bus (Singleton)
// ═══════════════════════════════════════════════════════════════

import type { ConnectionState } from '../types/connection'
import type { Note, NoteType } from '../types/note'
import type { AppConfig } from '../types/settings'
import type { GraphNode } from '../types/graph'

type ScreenId =
  | 'setup' | 'home' | 'editor' | 'problem'
  | 'sysdesign' | 'graph' | 'settings'

export interface ToastConfig {
  type: 'sync' | 'error' | 'info' | 'success'
  line1: string
  line2?: string
  duration?: number             // default 4000ms
}

// All events and their payload types
export interface EventMap {
  'connection:changed':     ConnectionState
  'screen:changed':         ScreenId
  'note:opened':            Note
  'note:saved':             Note
  'note:deleted':           { id: string }
  'tars:message':           { content: string; role: 'user' | 'tars' }
  'tars:inline':            { noteId: string; trigger: string; response: string }
  'toast:show':             ToastConfig
  'config:changed':         Partial<AppConfig>
  'sync:started':           void
  'sync:completed':         { synced: number; connections: number }
  'graph:node:selected':    GraphNode
  'graph:node:created':     { title: string; type: NoteType }
  'vault:file:changed':     { path: string; event: 'create' | 'modify' | 'delete' }
}

type EventHandler<T> = (payload: T) => void

class EventBus {
  private listeners: Map<string, Set<EventHandler<unknown>>> = new Map()

  on<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    const handlers = this.listeners.get(event)!
    handlers.add(handler as EventHandler<unknown>)

    // Return unsubscribe function
    return () => {
      handlers.delete(handler as EventHandler<unknown>)
      if (handlers.size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload)
        } catch (err) {
          console.error(`[EventBus] Error in handler for "${event}":`, err)
        }
      })
    }
  }

  off<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      handlers.delete(handler as EventHandler<unknown>)
    }
  }

  /** Remove all listeners for an event */
  clear(event?: keyof EventMap): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }
}

// Singleton instance
export const eventBus = new EventBus()
