import { useMemo, useRef, useEffect, useState } from 'react'
import { useWorkspaceStore } from '../store/workspaceStore'
import { renderMarkdown } from '../utils/markdownRenderer'
import { renderMermaidDiagrams } from '../utils/mermaidRenderer'
import { ArrowUpDown } from 'lucide-react'

export function PreviewPanel() {
  const content = useWorkspaceStore((s) => s.getActiveContent())
  const syncScroll = useWorkspaceStore((s) => s.syncScroll)
  const toggleSyncScroll = useWorkspaceStore((s) => s.toggleSyncScroll)
  const html = useMemo(() => renderMarkdown(content), [content])
  const previewRef = useRef(null)
  const isScrollingRef = useRef(false)
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  // Listen for dark mode class changes on <html>
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Render Mermaid diagrams whenever HTML or theme changes
  useEffect(() => {
    if (previewRef.current) {
      renderMermaidDiagrams(previewRef.current, isDark)
    }
  }, [html, isDark])

  // Sync scroll from preview to editor
  useEffect(() => {
    if (!syncScroll) return

    const handleScroll = (e) => {
      if (isScrollingRef.current) return
      isScrollingRef.current = true

      const scrollPercent = e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight)
      
      window.dispatchEvent(new CustomEvent('preview-scroll', { 
        detail: { scrollPercent } 
      }))

      setTimeout(() => {
        isScrollingRef.current = false
      }, 50)
    }

    const previewEl = previewRef.current
    if (previewEl) {
      previewEl.addEventListener('scroll', handleScroll)
      return () => previewEl.removeEventListener('scroll', handleScroll)
    }
  }, [syncScroll])

  // Sync scroll from editor to preview
  useEffect(() => {
    if (!syncScroll) return

    const handleEditorScroll = (e) => {
      if (isScrollingRef.current) return
      isScrollingRef.current = true

      const { scrollPercent } = e.detail
      const previewEl = previewRef.current
      if (previewEl) {
        const maxScroll = previewEl.scrollHeight - previewEl.clientHeight
        previewEl.scrollTop = scrollPercent * maxScroll
      }

      setTimeout(() => {
        isScrollingRef.current = false
      }, 50)
    }

    window.addEventListener('editor-scroll', handleEditorScroll)
    return () => window.removeEventListener('editor-scroll', handleEditorScroll)
  }, [syncScroll])

  return (
    <div className="preview-panel">
      <div className="panel-header">
        <span className="panel-label">Preview</span>
        <button
          className={`sync-scroll-btn ${syncScroll ? 'active' : ''}`}
          onClick={toggleSyncScroll}
          title={syncScroll ? "Sync scroll enabled" : "Sync scroll disabled"}
        >
          <ArrowUpDown size={15} />
          <span className="sync-label">Sync Scroll</span>
        </button>
      </div>
      <div
        ref={previewRef}
        className="preview-body markdown-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
