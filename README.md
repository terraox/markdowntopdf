# Markdown to PDF

> A self-hosted, project-based Markdown IDE with live preview and professional PDF export.

Unlike cloud-based converters, this tool runs entirely on your own machine. Your files never leave your device. There are no upload limits, no subscriptions, and no third-party servers involved. Just clone the repo, run the two commands below, and you have a complete Markdown workspace running locally.

---

## vs. markdowntopdf.com

**markdowntopdf.com** is a single-page file-upload converter. You drop a `.md` file in, get a PDF out, and you're done.

**This product** is a full Markdown IDE — a multi-file workspace with a live editor, real-time preview, project management, and professional PDF/ZIP export. It's not a tool; it's an environment.

### Feature Comparison

| Feature | **This Product** | markdowntopdf.com |
|---|---|---|
| **Live Editor** | CodeMirror 6 with full syntax highlighting | No editor — upload-only |
| **Real-time Preview** | Instant side-by-side preview as you type | No preview at all |
| **Multi-file Support** | Open and manage multiple `.md` files at once | Single file per conversion |
| **Project / Folder Support** | Upload entire folders, browse file tree in sidebar | Not supported |
| **Multi-tab Workspace** | Multiple tabs, unsaved indicator, fast switching | Not supported |
| **PDF Export Quality** | Puppeteer-rendered, print-grade A4 PDF with background, margins, code blocks | Basic conversion, no styling control |
| **ZIP Export** | Export full project as ZIP (preserving folder structure) | Not supported |
| **Drag & Drop** | Drag files or folders directly into the workspace | Single file upload only |
| **GitHub-Flavored Markdown** | Full GFM support via markdown-it + highlight.js | Basic Markdown rendering |
| **Code Syntax Highlighting** | highlight.js in editor + preview | Not supported |
| **Dark / Light Mode** | Animated theme toggle, persisted preference | No theme support |
| **Resizable Panes** | Editor and preview panels are fully resizable | No layout controls |
| **Animations & UI Polish** | Framer Motion transitions, hover effects, micro-interactions | Static, plain UI |
| **Typography** | Inter + JetBrains Mono (Google Fonts) | Browser defaults |
| **Accessibility** | WCAG AA compliant, keyboard navigable, ARIA roles (via Radix UI) | Not documented |
| **Self-hosted** | Runs entirely on your machine — no cloud dependency | Files uploaded to third-party servers |
| **File Privacy** | No cloud upload required | Files sent to external servers |
| **State Persistence** | Zustand-powered state: open tabs, theme, sidebar, dirty tracking | No state — page reloads reset everything |
| **Tech Stack** | React + TypeScript, Vite, Tailwind, CodeMirror 6, Puppeteer | Laravel + Vue (basic upload form) |

### Key Differentiators

#### 1. It's a full IDE, not a converter
markdowntopdf.com requires you to already have a finished `.md` file. This product lets you create, edit, and organize your Markdown from scratch — with syntax highlighting, live preview, and multi-tab management.

#### 2. Project-level thinking
Supports entire folder-based projects. Write documentation across multiple files, navigate them via a collapsible sidebar file tree, and export them all — individually or as a ZIP. markdowntopdf.com has no concept of a folder or project.

#### 3. PDF quality is night and day
PDFs are rendered by **Puppeteer** (headless Chromium), which means pixel-perfect output with proper code block styling, print backgrounds, typeset headings, and margin control. markdowntopdf.com performs a basic HTML-to-PDF conversion with no style customisation.

#### 4. Privacy-first and self-hosted
The entire stack runs locally. Your Markdown content never leaves your machine unless you choose to export it. markdowntopdf.com requires you to upload your file to their servers — a non-starter for sensitive or proprietary documentation.

#### 5. Premium UX
A genuinely modern interface with dark/light mode, smooth animations, resizable panels, and clean typography. markdowntopdf.com is a plain upload form with no design.

---

# Markdown to PDF — Technical Implementation Specification

## 1. Project Overview

Markdown to PDF is a project-based Markdown IDE with:

- Live Markdown editor
- Real-time preview
- Multi-file workspace
- Folder upload & file tree
- PDF export (single file)
- ZIP export (project level)
- Premium UI with dark/light theme

This document defines the exact tools, libraries, and external components used for each feature.

---

# 2. Tech Stack Overview

## Frontend Core
- React (TypeScript)
- Vite
- Tailwind CSS

## State Management
- Zustand

## Backend
- Node.js
- Express
- Puppeteer (PDF generation)

---

# 3. Feature → Library / Component Mapping

## 3.1 Markdown Editor

Feature:
- Advanced Markdown editing
- Syntax highlighting
- Large file handling

Library:
- @codemirror/state
- @codemirror/view
- @codemirror/lang-markdown

Component:
- Custom `EditorPanel` wrapper component

---

## 3.2 Live Markdown Preview

Feature:
- Real-time rendering
- GitHub-flavored Markdown
- Code syntax highlighting

Library:
- markdown-it
- highlight.js

Component:
- Custom `PreviewPanel` component

---

## 3.3 Theme System (Light / Dark)

Feature:
- Animated theme toggle
- Persisted theme
- System preference detection

External Component:
- Magic UI Theme Toggle (component)

Supporting Libraries:
- Tailwind CSS (dark mode via class strategy)
- next-themes (or custom theme context if not using Next)

---

## 3.4 Sidebar (File Tree + Controls)

Feature:
- Collapsible sidebar
- Folder structure
- File navigation
- Icon-only collapsed state

External Component:
- shadcn/ui Sidebar component

Supporting Libraries:
- @radix-ui/react-collapsible
- lucide-react (icons)

For File Tree:
- Recursive custom tree component
- Optional: @mui/x-tree-view (if advanced tree control required)

---

## 3.5 Multi-Tab System

Feature:
- Multiple open files
- Switch between files
- Unsaved indicator

External Components:
- shadcn/ui Tabs component
- Radix UI Tabs primitive

State:
- Zustand store (file state, active file, dirty tracking)

---

## 3.6 File & Folder Upload

Feature:
- Open single file
- Drag & drop file
- Upload full folder
- Recursive `.md` detection

Libraries:
- Native File System Access API
- react-dropzone (drag & drop)
- webkitdirectory input fallback

Component:
- Custom `FileImporter` module

---

## 3.7 Export — Single File (PDF)

Feature:
- High-quality A4 PDF
- Print background
- Margin control

Backend:
- Puppeteer

Frontend:
- shadcn/ui Button (Export button)
- Loading spinner (lucide-react + animated icon)

---

## 3.8 Export — Project (ZIP)

Feature:
- Export all `.md` files
- Preserve folder structure
- Optional include PDFs

Library:
- JSZip

Component:
- Export dropdown (Radix UI DropdownMenu)

---

## 3.9 Layout & Structure

Feature:
- Top App Bar
- Sidebar
- Editor panel
- Preview panel
- Resizable split view

Libraries:
- shadcn/ui Layout primitives
- @radix-ui/react-separator
- react-resizable-panels (for split layout)

---

## 3.10 Animations & Micro-Interactions

Feature:
- Sidebar collapse animation
- Theme transition animation
- Button hover elevation
- Panel mount animations

Library:
- Framer Motion

---

## 3.11 Icons

Library:
- lucide-react

Used for:
- Sidebar toggle
- File icons
- Folder icons
- Theme icon
- Export icon

---

## 3.12 Typography

Fonts:
- Inter (UI)
- JetBrains Mono (code)

Source:
- Google Fonts or local self-hosted

---

## 3.13 Accessibility

Libraries:
- Radix UI primitives (accessible by default)
- shadcn/ui components

Compliance:
- WCAG AA contrast
- Keyboard navigable
- ARIA roles

---

# 4. Application Modules

## 4.1 Core Modules

- EditorModule (CodeMirror integration)
- PreviewModule (Markdown rendering)
- FileTreeModule (Folder parsing + sidebar rendering)
- TabsModule (Multi-file management)
- ExportModule (PDF + ZIP handling)
- ThemeModule (Magic UI toggle integration)
- WorkspaceStore (Zustand state management)

---

# 5. State Management (Zustand)

Global Store Handles:

- File tree structure
- Active file
- Open tabs
- File content
- Dirty state
- Theme state
- Sidebar state
- Export loading state

---

# 6. Folder Structure (Frontend)

src/
  components/
    Editor/
    Preview/
    Sidebar/
    Tabs/
    TopBar/
  modules/
    FileImporter/
    Export/
    Theme/
  store/
    workspaceStore.ts
  utils/
    markdownRenderer.ts

---

# 7. Backend Structure

server/
  server.js
  routes/
    generatePdf.js

Dependencies:
- express
- puppeteer
- cors

---

# 8. Performance Targets

- Markdown render < 40ms
- File switch < 30ms
- PDF generation < 3s
- ZIP export < 2s (10 files)
- Smooth animation transitions (150–250ms)

---

# 9. Summary of External Components Used

Editor:
- CodeMirror 6

Preview:
- markdown-it
- highlight.js

Theme Toggle:
- Magic UI Theme Toggle

Sidebar:
- shadcn/ui Sidebar
- Radix Collapsible

Tabs:
- shadcn/ui Tabs
- Radix Tabs

Icons:
- lucide-react

Split Layout:
- react-resizable-panels

Animations:
- Framer Motion

Export:
- Puppeteer (backend)
- JSZip (frontend)

State:
- Zustand

Styling:
- Tailwind CSS

---

# 10. Core Product Identity

Markdown to PDF is:

- A structured Markdown IDE
- A multi-file workspace
- A project-based documentation tool
- A professional export system

It is not a simple Markdown converter.

It is a complete Markdown project environment.