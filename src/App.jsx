import './App.css'
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
import { FolderOpen, FileText } from 'lucide-react'
import { Logo } from './components/Logo'

function App() {
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
            <button className="export-button" type="button">Export</button>
          </div>
        </header>

        {/* ── Body ── */}
        <div className="app-body">
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
                      <SidebarMenuButton tooltip="Open File">
                        <FileText size={15} />
                        <span>Open File</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip="Open Folder">
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
            <section className="editor-panel">
              <div className="panel-inner">
                <span className="panel-label">Markdown Editor</span>
              </div>
            </section>
            <section className="preview-panel">
              <div className="panel-inner">
                <span className="panel-label">Live Preview</span>
              </div>
            </section>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default App
