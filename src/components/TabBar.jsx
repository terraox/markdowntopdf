import { X, FileText } from 'lucide-react'
import { useWorkspaceStore } from '../store/workspaceStore'

export function TabBar() {
  const openTabs = useWorkspaceStore((s) => s.openTabs)
  const activeFile = useWorkspaceStore((s) => s.activeFile)
  const dirtyFiles = useWorkspaceStore((s) => s.dirtyFiles)
  const setActiveFile = useWorkspaceStore((s) => s.setActiveFile)
  const closeTab = useWorkspaceStore((s) => s.closeTab)

  if (openTabs.length === 0) return null

  return (
    <div className="tab-bar">
      {openTabs.map((filename) => {
        const isActive = filename === activeFile
        const isDirty = dirtyFiles.has(filename)
        return (
          <div
            key={filename}
            className={`tab-item ${isActive ? 'tab-item--active' : ''}`}
            onClick={() => setActiveFile(filename)}
          >
            <FileText size={12} className="tab-icon" />
            <span className="tab-name">{filename}</span>
            {isDirty && <span className="tab-dirty" title="Unsaved changes">●</span>}
            <button
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation()
                closeTab(filename)
              }}
              title="Close tab"
            >
              <X size={11} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
