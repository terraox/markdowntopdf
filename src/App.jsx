import './App.css'
import { useRef, useEffect } from 'react'
import { AnimatedThemeToggler } from './components/AnimatedThemeToggler'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from './components/ui/sidebar'
import { FolderOpen, FileText, FilePlus } from 'lucide-react'
import { Logo } from './components/Logo'
import { EditorPanel } from './components/EditorPanel'
import { PreviewPanel } from './components/PreviewPanel'
import { TabBar } from './components/TabBar'
import { ExportMenu } from './components/ExportMenu'
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels'
import { useWorkspaceStore } from './store/workspaceStore'

function App() {
  const { newFile } = useWorkspaceStore()
  const fileInputRef = useRef(null)

  // Detect operating system
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const modKey = isMac ? '⌘' : 'Ctrl'
  
  const handleOpenFile = () => fileInputRef.current?.click()

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      useWorkspaceStore.getState().openFile(file.name, ev.target.result)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const metaKey = isMac ? e.metaKey : e.ctrlKey

      // Cmd/Ctrl + N -> New File
      if (metaKey && e.key === 'n' && !e.shiftKey) {
        e.preventDefault()
        newFile()
      }
      // Cmd/Ctrl + O -> Open File
      else if (metaKey && e.key === 'o' && !e.shiftKey) {
        e.preventDefault()
        handleOpenFile()
      }
      // Cmd/Ctrl + Shift + O -> Open Folder (placeholder for future)
      else if (metaKey && e.shiftKey && e.key === 'O') {
        e.preventDefault()
        // TODO: Implement open folder functionality
        console.log('Open Folder shortcut - feature not yet implemented')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [newFile])

  return (
    <SidebarProvider>
      <div className="app-shell">
        {/* ── Header ── */}
        <header className="app-header">
          <div className="app-header-left">
            <Logo size={42} />
            <span className="app-title">markdowntopdf</span>
          </div>
          <div className="app-header-right">
            <AnimatedThemeToggler />
            <ExportMenu />
          </div>
        </header>

        {/* ── Body ── */}
        <div className="app-body">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {/* Sidebar */}
          <Sidebar collapsible="icon">
            <SidebarHeader>
              <SidebarTrigger />
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Files</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip={`New File (${modKey}+N)`} onClick={newFile}>
                        <FilePlus size={15} />
                        <span>New File</span>
                        <span className="shortcut-hint">{modKey}+N</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip={`Open File (${modKey}+O)`} onClick={handleOpenFile}>
                        <FileText size={15} />
                        <span>Open File</span>
                        <span className="shortcut-hint">{modKey}+O</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip={`Open Folder (${modKey}+Shift+O)`} disabled>
                        <FolderOpen size={15} />
                        <span>Open Folder</span>
                        <span className="shortcut-hint">{modKey}+⇧+O</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          {/* ── Panels ── */}
          <main className="editor-layout">
            <TabBar />
            <PanelGroup direction="horizontal" style={{ flex: 1, minHeight: 0 }}>
              <Panel defaultSize={50} minSize={20}>
                <EditorPanel />
              </Panel>
              <PanelResizeHandle className="resize-handle" />
              <Panel defaultSize={50} minSize={20}>
                <PreviewPanel />
              </Panel>
            </PanelGroup>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default App
