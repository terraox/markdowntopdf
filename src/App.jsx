import './App.css'
import { useRef } from 'react'
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
                      <SidebarMenuButton tooltip="New File" onClick={newFile}>
                        <FilePlus size={15} />
                        <span>New File</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip="Open File" onClick={handleOpenFile}>
                        <FileText size={15} />
                        <span>Open File</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip="Open Folder" disabled>
                        <FolderOpen size={15} />
                        <span>Open Folder</span>
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
