import { useMemo } from 'react'
import { useWorkspaceStore } from '../store/workspaceStore'
import { renderMarkdown } from '../utils/markdownRenderer'

export function PreviewPanel() {
  const content = useWorkspaceStore((s) => s.getActiveContent())
  const html = useMemo(() => renderMarkdown(content), [content])

  return (
    <div className="preview-panel">
      <div className="panel-header">
        <span className="panel-label">Preview</span>
      </div>
      <div
        className="preview-body markdown-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
