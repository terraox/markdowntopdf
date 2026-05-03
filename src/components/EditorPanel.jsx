import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  HighlightStyle,
} from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { oneDarkHighlightStyle } from '@codemirror/theme-one-dark'
import { useWorkspaceStore } from '../store/workspaceStore'

// Match tools like markdowntopdf.com: ATX heading lines are visibly underlined in the editor.
const markdownEditorHighlight = HighlightStyle.define([
  ...defaultHighlightStyle.specs,
  {
    tag: tags.heading,
    fontWeight: '600',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
    textDecorationSkipInk: 'none',
  },
])

// Minimalist dark highlight style that matches the app's premium aesthetic and the preview panel.
const darkMarkdownEditorHighlight = HighlightStyle.define([
  { tag: tags.heading, fontWeight: '700', color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: '3px' },
  { tag: tags.keyword, color: '#c678dd' }, // Subtle purple for keywords
  { tag: tags.atom, color: '#d19a66' },    // Muted orange
  { tag: tags.number, color: '#d19a66' },
  { tag: tags.string, color: '#98c379' },  // Sage green
  { tag: tags.variableName, color: 'var(--text)' },
  { tag: tags.comment, color: 'var(--text-muted)', fontStyle: 'italic' },
  { tag: tags.meta, color: 'var(--text-muted)' },
  { tag: tags.link, color: 'var(--text)', textDecoration: 'underline' },
  { tag: tags.url, color: 'var(--text-muted)' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strong, fontWeight: '700' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
])

// ── Light theme ────────────────────────────────────────────────
const lightTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '14px',
    fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
    background: 'var(--bg)',
    color: 'var(--text)',
  },
  '.cm-scroller': { overflow: 'auto' },
  '.cm-content': { caretColor: 'var(--text)', padding: '16px 0' },
  '.cm-line': { padding: '0 20px' },
  '.cm-gutters': {
    background: 'var(--bg)',
    color: 'var(--text-muted)',
    border: 'none',
    minWidth: '40px',
  },
  '.cm-gutter': { background: 'var(--bg)' },
  '.cm-gutterElement': { padding: '0 8px 0 4px' },
  '.cm-lineNumbers .cm-gutterElement': { minWidth: '28px', textAlign: 'right' },
  '.cm-activeLineGutter': { background: 'var(--surface-raised)', color: 'var(--text)' },
  '.cm-activeLine': { background: 'var(--surface-raised)' },
  '.cm-selectionBackground, ::selection': { background: 'rgba(0, 0, 0, 0.15) !important' },
  '.cm-cursor': { borderLeftColor: 'var(--text)' },
  '&.cm-focused': { outline: 'none' },
}, { dark: false })

// ── Dark: same surface colors as the preview (see index.css :root.dark) — not One Dark’s gray/blue panel
const darkEditorTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '14px',
    fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
    background: 'var(--bg)',
    color: 'var(--text)',
  },
  '.cm-scroller': { overflow: 'auto' },
  '.cm-content': { caretColor: 'var(--text)', padding: '16px 0' },
  '.cm-line': { padding: '0 20px' },
  '.cm-gutters': {
    background: 'var(--bg)',
    color: 'var(--text-muted)',
    border: 'none',
    minWidth: '40px',
  },
  '.cm-gutter': { background: 'var(--bg)' },
  '.cm-gutterElement': { padding: '0 8px 0 4px' },
  '.cm-lineNumbers .cm-gutterElement': { minWidth: '28px', textAlign: 'right' },
  '.cm-activeLineGutter': { background: 'var(--surface-raised)', color: 'var(--text)' },
  '.cm-activeLine': { background: 'var(--surface-raised)' },
  '.cm-selectionBackground, ::selection': {
    background: 'rgba(255, 255, 255, 0.12) !important',
  },
  '.cm-cursor': { borderLeftColor: 'var(--text)' },
  '&.cm-focused': { outline: 'none' },
}, { dark: true })

function buildExtensions(isDark, onUpdate) {
  return [
    isDark
      ? [darkEditorTheme, syntaxHighlighting(darkMarkdownEditorHighlight)]
      : [lightTheme, syntaxHighlighting(markdownEditorHighlight)],
    lineNumbers(),
    highlightActiveLine(),
    highlightActiveLineGutter(),
    drawSelection(),
    history(),
    bracketMatching(),
    markdown({ base: markdownLanguage, codeLanguages: languages }),
    keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onUpdate(update.state.doc.toString())
      }
    }),
    EditorView.lineWrapping,
  ]
}

export function EditorPanel() {
  const containerRef = useRef(null)
  const viewRef = useRef(null)
  const content = useWorkspaceStore((s) => s.getActiveContent())
  const setContent = useWorkspaceStore((s) => s.setContent)
  const syncScroll = useWorkspaceStore((s) => s.syncScroll)
  const isDarkRef = useRef(document.documentElement.classList.contains('dark'))
  const isScrollingRef = useRef(false)

  // Create / recreate editor when theme changes
  useEffect(() => {
    const mount = () => {
      if (viewRef.current) {
        viewRef.current.destroy()
        viewRef.current = null
      }

      const isDark = document.documentElement.classList.contains('dark')
      isDarkRef.current = isDark

      const state = EditorState.create({
        doc: content,
        extensions: buildExtensions(isDark, setContent),
      })

      viewRef.current = new EditorView({ state, parent: containerRef.current })
    }

    mount()

    const observer = new MutationObserver(() => {
      const nowDark = document.documentElement.classList.contains('dark')
      if (nowDark !== isDarkRef.current) {
        isDarkRef.current = nowDark
        // Save cursor position
        const currentDoc = viewRef.current?.state.doc.toString() ?? content
        if (viewRef.current) viewRef.current.destroy()

        const state = EditorState.create({
          doc: currentDoc,
          extensions: buildExtensions(nowDark, setContent),
        })
        viewRef.current = new EditorView({ state, parent: containerRef.current })
      }
    })

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      observer.disconnect()
      if (viewRef.current) {
        viewRef.current.destroy()
        viewRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync external content changes (file switch) into the editor
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (current !== content) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: content },
      })
    }
  }, [content])

  // Sync scroll between editor and preview
  useEffect(() => {
    if (!syncScroll) return

    const handleScroll = () => {
      const view = viewRef.current
      if (!view || isScrollingRef.current) return
      
      isScrollingRef.current = true
      const scroller = view.scrollDOM
      const scrollPercent = scroller.scrollTop / (scroller.scrollHeight - scroller.clientHeight)
      
      window.dispatchEvent(new CustomEvent('editor-scroll', { 
        detail: { scrollPercent } 
      }))

      setTimeout(() => {
        isScrollingRef.current = false
      }, 50)
    }

    const view = viewRef.current
    if (view) {
      const scroller = view.scrollDOM
      scroller.addEventListener('scroll', handleScroll)
      return () => scroller.removeEventListener('scroll', handleScroll)
    }
  }, [syncScroll])

  useEffect(() => {
    if (!syncScroll) return

    const handlePreviewScroll = (e) => {
      const view = viewRef.current
      if (!view || isScrollingRef.current) return
      
      isScrollingRef.current = true
      const { scrollPercent } = e.detail
      const scroller = view.scrollDOM
      const maxScroll = scroller.scrollHeight - scroller.clientHeight
      scroller.scrollTop = scrollPercent * maxScroll

      setTimeout(() => {
        isScrollingRef.current = false
      }, 50)
    }

    window.addEventListener('preview-scroll', handlePreviewScroll)
    return () => window.removeEventListener('preview-scroll', handlePreviewScroll)
  }, [syncScroll])

  return (
    <div className="editor-panel">
      <div className="panel-header">
        <span className="panel-label">Editor</span>
      </div>
      <div className="editor-cm-container" ref={containerRef} />
    </div>
  )
}
