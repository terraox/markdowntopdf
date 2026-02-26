import { createContext, useContext, useState, useCallback, Children, isValidElement } from 'react'
import { PanelLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ── Context ──────────────────────────────────────────────── */
const SidebarContext = createContext(null)

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used inside <SidebarProvider>')
  return ctx
}

/* ── Provider ─────────────────────────────────────────────── */
export function SidebarProvider({ defaultOpen = true, open: controlledOpen, onOpenChange, children, className, style, ...props }) {
  const [_open, _setOpen] = useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : _open

  const setOpen = useCallback((val) => {
    if (!isControlled) _setOpen(val)
    onOpenChange?.(val)
  }, [isControlled, onOpenChange])

  const toggleSidebar = useCallback(() => setOpen(!open), [open, setOpen])
  const state = open ? 'expanded' : 'collapsed'

  return (
    <SidebarContext.Provider value={{ open, setOpen, toggleSidebar, state }}>
      {children}
    </SidebarContext.Provider>
  )
}

/* ── Sidebar ──────────────────────────────────────────────── */
export function Sidebar({ collapsible = 'icon', className, children, ...props }) {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'

  return (
    <aside
      data-state={state}
      data-collapsible={collapsible}
      className={cn(
        'group relative flex h-full flex-col shrink-0 overflow-hidden transition-[width] duration-200 ease-linear',
        'bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] text-[hsl(var(--sidebar-foreground))]',
        collapsed ? 'w-[var(--sidebar-width-icon)]' : 'w-[var(--sidebar-width)]',
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  )
}

/* ── SidebarTrigger ────────────────────────────────────────── */
export function SidebarTrigger({ className, ...props }) {
  const { toggleSidebar, state } = useSidebar()
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
      className={cn(
        'inline-flex items-center justify-center w-7 h-7 rounded-md',
        'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]',
        'hover:bg-[hsl(var(--sidebar-border))] transition-all duration-150',
        'opacity-70 hover:opacity-100',
        className,
      )}
      {...props}
    >
      <PanelLeft
        size={13}
        strokeWidth={1.75}
        className={cn('transition-transform duration-200', state === 'collapsed' && 'rotate-180')}
      />
    </button>
  )
}

/* ── SidebarHeader ─────────────────────────────────────────── */
export function SidebarHeader({ className, children, ...props }) {
  const { state } = useSidebar()
  return (
    <div
      data-sidebar="header"
      className={cn(
        'flex items-center shrink-0 px-3 py-2.5 border-b border-[hsl(var(--sidebar-border))]',
        state === 'collapsed' ? 'justify-center' : 'justify-between',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* ── SidebarContent ────────────────────────────────────────── */
export function SidebarContent({ className, children, ...props }) {
  return (
    <div
      data-sidebar="content"
      className={cn('flex flex-col flex-1 overflow-y-auto overflow-x-hidden py-2', className)}
      {...props}
    >
      {children}
    </div>
  )
}

/* ── SidebarFooter ─────────────────────────────────────────── */
export function SidebarFooter({ className, children, ...props }) {
  return (
    <div
      data-sidebar="footer"
      className={cn(
        'shrink-0 px-3 py-2 border-t border-[hsl(var(--sidebar-border))]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* ── SidebarGroup ──────────────────────────────────────────── */
export function SidebarGroup({ className, children, ...props }) {
  return (
    <div data-sidebar="group" className={cn('px-2 py-1', className)} {...props}>
      {children}
    </div>
  )
}

/* ── SidebarGroupLabel ─────────────────────────────────────── */
export function SidebarGroupLabel({ className, children, ...props }) {
  const { state } = useSidebar()
  if (state === 'collapsed') return null
  return (
    <div
      data-sidebar="group-label"
      className={cn(
        'px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-[hsl(var(--sidebar-foreground))] opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* ── SidebarGroupContent ───────────────────────────────────── */
export function SidebarGroupContent({ className, children, ...props }) {
  return (
    <div data-sidebar="group-content" className={cn('space-y-0.5', className)} {...props}>
      {children}
    </div>
  )
}

/* ── SidebarMenu ───────────────────────────────────────────── */
export function SidebarMenu({ className, children, ...props }) {
  return (
    <ul data-sidebar="menu" className={cn('list-none m-0 p-0 space-y-0.5', className)} {...props}>
      {children}
    </ul>
  )
}

/* ── SidebarMenuItem ───────────────────────────────────────── */
export function SidebarMenuItem({ className, children, ...props }) {
  return (
    <li data-sidebar="menu-item" className={cn('', className)} {...props}>
      {children}
    </li>
  )
}

/* ── SidebarMenuButton ─────────────────────────────────────── */
export function SidebarMenuButton({ isActive, tooltip, className, children, ...props }) {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'

  // When collapsed, hide text spans and shortcut hints, keep only icons
  const visibleChildren = collapsed
    ? Children.toArray(children).filter(
        (child) => !isValidElement(child) || child.type !== 'span',
      )
    : children

  const btn = (
    <button
      type="button"
      data-active={isActive || undefined}
      title={collapsed && tooltip ? tooltip : undefined}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium',
        'text-[hsl(var(--sidebar-foreground))] transition-colors',
        'hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]',
        isActive && 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]',
        collapsed && 'justify-center px-0 w-full',
        className,
      )}
      {...props}
    >
      {visibleChildren}
    </button>
  )

  return btn
}
