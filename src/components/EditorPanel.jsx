import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language'
import { oneDark } from '@codemirror/theme-one-dark'
import { useWorkspaceStore } from '../store/workspaceStore'

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

// ── Dark theme overrides ───────────────────────────────────────
const darkTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '14px',
    fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
  },
  '.cm-line': { padding: '0 20px' },
  '.cm-content': { padding: '16px 0' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { overflow: 'auto' },
}, { dark: true })

function buildExtensions(isDark, onUpdate) {
  return [
    isDark ? [oneDark, darkTheme] : [lightTheme, syntaxHighlighting(defaultHighlightStyle)],
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
  const isDarkRef = useRef(document.documentElement.classList.contains('dark'))

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

  return (
    <div className="editor-panel">
      <div className="panel-header">
        <span className="panel-label">Editor</span>
      </div>
      <div className="editor-cm-container" ref={containerRef} />
    </div>
  )
}
