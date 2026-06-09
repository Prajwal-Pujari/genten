// ═══════════════════════════════════════════════════════════════
// Genten — CodeMirror 6 Custom Theme
// ═══════════════════════════════════════════════════════════════

import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

/**
 * Genten editor theme — warm ivory, prose-first, minimal chrome.
 * Matches the design system: Literata for prose, Geist Mono for code,
 * violet accents for cursor/selection.
 */
export const gentenEditorTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
    color: '#1A1714',
    fontSize: '15px',
    fontFamily: "'Literata', Georgia, 'Times New Roman', serif",
    lineHeight: '1.6',
  },
  '.cm-content': {
    caretColor: '#6B5CE7',
    padding: '0',
    fontFamily: "'Literata', Georgia, 'Times New Roman', serif",
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#6B5CE7',
    borderLeftWidth: '2px',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'rgba(107, 92, 231, 0.15)',
  },
  '.cm-activeLine': {
    backgroundColor: 'transparent',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
  },
  '.cm-gutters': {
    display: 'none',
  },
  '.cm-line': {
    padding: '2px 0',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-scroller': {
    fontFamily: "'Literata', Georgia, 'Times New Roman', serif",
    lineHeight: '1.6',
    overflow: 'auto',
  },
  // Placeholder styling
  '.cm-placeholder': {
    color: '#9B9590',
    fontStyle: 'italic',
  },
  // Search match highlighting
  '.cm-searchMatch': {
    backgroundColor: 'rgba(212, 133, 58, 0.2)',
    outline: '1px solid rgba(212, 133, 58, 0.4)',
    borderRadius: '2px',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'rgba(212, 133, 58, 0.35)',
  },
  // Fold placeholder
  '.cm-foldPlaceholder': {
    backgroundColor: 'rgba(107, 92, 231, 0.08)',
    border: '1px solid #D8D2C8',
    borderRadius: '4px',
    padding: '0 4px',
    color: '#9B9590',
    fontSize: '12px',
  },
  // Tooltip
  '.cm-tooltip': {
    backgroundColor: '#EDE8DF',
    border: '1px solid #D8D2C8',
    borderRadius: '6px',
    boxShadow: '0 24px 80px rgba(26,23,20,0.25)',
    fontSize: '13px',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  '.cm-tooltip-autocomplete': {
    '& > ul > li': {
      padding: '4px 8px',
    },
    '& > ul > li[aria-selected]': {
      backgroundColor: 'rgba(107, 92, 231, 0.1)',
      color: '#1A1714',
    },
  },
})

/**
 * Syntax highlighting colors for Genten.
 * Warm palette, minimal color noise.
 */
export const gentenHighlightStyle = HighlightStyle.define([
  // Headings — espresso, bold
  { tag: tags.heading1, fontWeight: '600', fontSize: '24px', lineHeight: '1.3', letterSpacing: '-0.02em', color: '#1A1714' },
  { tag: tags.heading2, fontWeight: '600', fontSize: '20px', lineHeight: '1.35', color: '#1A1714' },
  { tag: tags.heading3, fontWeight: '600', fontSize: '17px', lineHeight: '1.4', color: '#1A1714' },
  { tag: [tags.heading4, tags.heading5, tags.heading6], fontWeight: '600', fontSize: '15px', color: '#2D2522' },

  // Emphasis
  { tag: tags.emphasis, fontStyle: 'italic', color: '#1A1714' },
  { tag: tags.strong, fontWeight: '600', color: '#1A1714' },
  { tag: tags.strikethrough, textDecoration: 'line-through', color: '#9B9590' },

  // Code
  { tag: tags.monospace, fontFamily: "'Geist Mono', 'Fira Code', monospace", fontSize: '13px', backgroundColor: 'rgba(45, 37, 34, 0.06)', padding: '1px 4px', borderRadius: '3px', color: '#2D2522' },

  // Links
  { tag: tags.link, color: '#6B5CE7', textDecoration: 'none' },
  { tag: tags.url, color: '#6B5CE7', textDecoration: 'underline' },

  // Quotes (used for TARS output highlight)
  { tag: tags.quote, color: '#2D2522', fontStyle: 'normal', backgroundColor: 'rgba(107, 92, 231, 0.08)', borderLeft: '3px solid #6B5CE7', paddingLeft: '8px', paddingRight: '4px', borderRadius: '2px' },

  // Lists
  { tag: tags.list, color: '#1A1714' },

  // Meta (frontmatter markers, HR)
  { tag: tags.meta, color: '#9B9590' },
  { tag: tags.processingInstruction, color: '#9B9590' },

  // Comments (HTML comments in markdown)
  { tag: tags.comment, color: '#C4BDB0', fontStyle: 'italic' },

  // Punctuation (markdown syntax like *, **, #)
  { tag: tags.punctuation, color: '#C4BDB0' },
  { tag: tags.bracket, color: '#C4BDB0' },
])

/**
 * Combined Genten theme extension — theme + syntax highlighting.
 */
export const gentenTheme = [
  gentenEditorTheme,
  syntaxHighlighting(gentenHighlightStyle),
  EditorView.lineWrapping,
]
