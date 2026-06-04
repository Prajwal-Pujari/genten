// ═══════════════════════════════════════════════════════════════
// Genten — UI Store (Zustand)
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand'

export type ScreenId =
  | 'setup' | 'home' | 'editor' | 'problem'
  | 'sysdesign' | 'graph' | 'settings'

interface MenuItem {
  label: string
  icon?: string
  action: () => void
  danger?: boolean
  divider?: boolean
}

interface ContextMenuState {
  x: number
  y: number
  items: MenuItem[]
}

interface UIStore {
  activeScreen: ScreenId
  quickOpenVisible: boolean
  tarsVisible: boolean
  settingsVisible: boolean
  contextMenu: ContextMenuState | null
  activeEditorTab: 'links' | 'tars' | 'similar'
  editorMode: 'edit' | 'canvas' | 'split'
  sidebarCollapsed: boolean
  focusMode: boolean
  newNoteModalVisible: boolean

  // Actions
  navigate: (screen: ScreenId) => void
  toggleQuickOpen: () => void
  toggleTARS: () => void
  toggleSettings: () => void
  toggleNewNoteModal: () => void
  showContextMenu: (x: number, y: number, items: MenuItem[]) => void
  hideContextMenu: () => void
  setActiveEditorTab: (tab: 'links' | 'tars' | 'similar') => void
  setEditorMode: (mode: 'edit' | 'canvas' | 'split') => void
  toggleSidebar: () => void
  toggleFocusMode: () => void
  closeTopmost: () => boolean
}

export const useUIStore = create<UIStore>((set, get) => ({
  activeScreen: 'home',
  quickOpenVisible: false,
  tarsVisible: false,
  settingsVisible: false,
  contextMenu: null,
  activeEditorTab: 'links',
  editorMode: 'edit',
  sidebarCollapsed: false,
  focusMode: false,
  newNoteModalVisible: false,

  navigate: (screen) => set({ activeScreen: screen }),

  toggleQuickOpen: () => set((s) => ({
    quickOpenVisible: !s.quickOpenVisible,
    contextMenu: null,
  })),

  toggleTARS: () => set((s) => ({
    tarsVisible: !s.tarsVisible,
    contextMenu: null,
  })),

  toggleSettings: () => set((s) => ({
    settingsVisible: !s.settingsVisible,
    contextMenu: null,
  })),

  toggleNewNoteModal: () => set((s) => ({
    newNoteModalVisible: !s.newNoteModalVisible,
    contextMenu: null,
  })),

  showContextMenu: (x, y, items) => set({ contextMenu: { x, y, items } }),

  hideContextMenu: () => set({ contextMenu: null }),

  setActiveEditorTab: (tab) => set({ activeEditorTab: tab }),

  setEditorMode: (mode) => set({ editorMode: mode }),

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),

  closeTopmost: () => {
    const state = get()
    if (state.contextMenu) {
      set({ contextMenu: null })
      return true
    }
    if (state.newNoteModalVisible) {
      set({ newNoteModalVisible: false })
      return true
    }
    if (state.quickOpenVisible) {
      set({ quickOpenVisible: false })
      return true
    }
    if (state.tarsVisible) {
      set({ tarsVisible: false })
      return true
    }
    if (state.settingsVisible) {
      set({ settingsVisible: false })
      return true
    }
    return false
  },
}))
