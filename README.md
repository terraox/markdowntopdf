# Markdown to PDF

> A self-hosted, project-based Markdown IDE with live preview and professional PDF export.

## Project Demo

<!-- Add your demo video here -->

## Features

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

# 3. Project Setup

Follow these steps to get the project running locally on your machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/markdown-to-pdf.git
cd markdown-to-pdf
```

### 2. Frontend Setup

Install the frontend dependencies and start the development server:

```bash
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 3. Backend Setup

Open a new terminal window, navigate to the `server` directory, install dependencies, and start the backend:

```bash
cd server
npm install
npm run dev
```

The backend server will start (usually on `http://localhost:3001` or as configured in `server.js`).

### 4. Open the App

Navigate to `http://localhost:5173` in your browser to start using the Markdown IDE.
