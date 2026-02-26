## Purpose

This `AGENTS.md` file tells AI assistants how to work effectively in the `markdown-to-pdf` project. The goal is to preserve the app’s design philosophy—**minimal, fast, project-based Markdown IDE with professional PDF export**—while making high‑quality, targeted changes.

---

## Project Overview (for AI)

- **What this is**: A premium Markdown workspace with:
  - Live preview using `markdown-it` (+ `highlight.js`)
  - A CodeMirror 6 editor
  - Multi-file / folder-based projects
  - PDF export via a Node/Express + Puppeteer backend
  - Optional ZIP exports with `JSZip`
- **Frontend stack**:
  - React + TypeScript
  - Vite
  - CodeMirror 6
  - Tailwind CSS
  - Zustand for state
- **Backend stack**:
  - Node.js
  - Express
  - Puppeteer for PDF generation

Always favor **performance, simplicity, and clean UX** over adding lots of new features.

---

## Installed Skills (for AI)

When writing or reviewing code in this repo, reference these skills where relevant:

- **`frontend-design`** (`anthropics/skills`) – Use this when:
  - Designing or refining React/Tailwind UI, layouts, or interactions.
  - Choosing typography, color systems, and motion that feel distinctive and non‑generic.
  - You need guidance on creating **bold, production-grade frontends** that avoid “AI slop” aesthetics.  
  Source: [`https://skills.sh/anthropics/skills/frontend-design`](https://skills.sh/anthropics/skills/frontend-design)

- **`find-skills`** (`vercel-labs/skills`) – Use this when:
  - The user asks “is there a skill for X?” or wants to extend capabilities.
  - You suspect a specialized skill might exist (e.g., deployment, testing, docs).  
  Source: [`https://skills.sh/vercel-labs/skills/find-skills`](https://skills.sh/vercel-labs/skills/find-skills)

- **`react-best-practices`** (`vercel-labs/agent-skills`, published on Skills as `vercel-react-best-practices`) – Use this when:
  - Implementing or refactoring React components.
  - Optimizing performance, bundle size, or render behavior.
  - Reviewing code for React/Next.js best practices and performance pitfalls.  
  Source: [`https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices`](https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices)

Whenever you work on **UI/UX**, **React logic**, or **performance-sensitive code**, first align your approach with these skills and then apply the project-specific guidance below.

---

## How the User Wants to Use AI

When helping in this repo, **optimize for being a strong pair‑programmer and architect**, not just a code generator:

- **Clarify by restating**: Briefly restate the task in your own words before doing work.
- **Default to action**: If requirements are reasonably clear, implement the change instead of only explaining it.
- **Stay concise**: Use short, information‑dense answers. Avoid long essays unless explicitly requested.
- **Prefer small, safe steps**: Make minimal, coherent changes that are easy to review.
- **Explain the “why”**: When you change behavior or architecture, give a short rationale.

Examples of how the user might ask you to help:

- “Add a word count indicator to the editor header.”
- “Improve PDF styling for code blocks.”
- “Let me select which `.md` files to include in the export ZIP.”
- “Refactor the file tree store; it’s getting messy.”

Respond with a clear plan plus concrete changes.

---

## Repository & Runtime Expectations

- **Assume**:
  - Frontend served by Vite dev server (default `http://localhost:5173`).
  - Backend PDF service at `http://localhost:5000` (`server/server.js`).
- **Key commands** (do not change these without explicit user approval):
  - `npm install` – install frontend deps
  - `npm run dev` – start Vite
  - `cd server && npm install` – install backend deps
  - `cd server && node server.js` – run PDF service
- When suggesting new scripts or commands, **add them non‑destructively** and mention them briefly.

---

## Code & Architecture Guidelines

### Frontend (React + TS + Vite)

- **TypeScript**:
  - Prefer explicit types for public APIs, hooks, and store functions.
  - Use `unknown` instead of `any` unless there is a strong reason.
- **Components**:
  - Keep components **presentational** where possible; push logic into hooks and stores (`src/hooks`, `src/store`).
  - Favor small, composable components over large “god” components.
- **State (Zustand)**:
  - Centralize **file tree, open tabs, settings, and layout** state in `store`.
  - Keep store actions **pure and predictable**; avoid hidden side effects.

### Editor & Preview

- Editor uses **CodeMirror 6**:
  - Integrations and extensions should be modular and configurable (line numbers, keymaps, etc.).
  - Avoid heavy, custom logic inside view plugins unless necessary for UX.
- Preview uses **markdown-it**:
  - Prefer configuring markdown-it and its plugins rather than post‑processing HTML.
  - If you add syntax support, ensure it still matches **CommonMark** expectations unless user says otherwise.

### Styling & Layout

- Use **Tailwind CSS** utility classes; don’t introduce a new styling system.
- Preserve existing layout patterns:
  - Command bar on top
  - Sidebar for file tree
  - Resizable editor/preview panes
- Respect **dark / light mode** and any existing theme tokens.

### Backend (Express + Puppeteer)

- Keep the backend **stateless and focused** on:
  - Receiving HTML and options
  - Rendering via Puppeteer
  - Returning PDFs or errors
- When extending:
  - Validate input payloads defensively.
  - Keep configuration (margins, page size, fonts) in well‑named constants or config objects.

---

## Working with Files & Structure

- Follow the structure from `README.md`:
  - `src/components` – UI components
  - `src/hooks` – business logic / custom hooks
  - `src/store` – shared state
  - `src/utils` – helpers and rendering utilities
  - `server` – PDF generation service
- When adding new files:
  - Place them in the most specific existing folder (`components`, `hooks`, `store`, `utils`).
  - Use descriptive, consistent names (`MarkdownPreview`, `useFileTreeStore`, etc.).
  - Keep imports relative and neat.

---

## How to Use AI Effectively (Prompt Patterns)

### 1. Implement a Feature

When you want to add/change behavior, include:

- **What you want** (user‑facing behavior).
- **Where** it should live (editor, preview, sidebar, export flow, backend).
- **Constraints** (performance, no new dependencies, etc.).

Example prompt:

> “Add the ability to toggle line wrapping in the editor. Use existing state management patterns. Show me where you wired the setting into CodeMirror and how to save it in the store.”

What the AI should do:

- Propose a short plan.
- Implement changes in the most relevant `store`, `hook`, and `component` files.
- Explain how to use the new feature in 2–3 sentences.

### 2. Debug / Fix a Bug

When you see a bug:

- Include **error messages, stack traces, and repro steps**.
- Mention **which browser / environment** if relevant.

Example prompt:

> “The PDF export fails when a project has nested folders with the same name. Here’s the error stack: […]. Help me debug and fix this.”

The AI should:

- Trace the flow through `store`/`utils`/`server` as needed.
- Propose a minimal fix plus any defensive checks.

### 3. Refactor / Improve Code

When code feels messy:

- Point to **specific files or modules**.
- Describe **what feels wrong** (too many responsibilities, hard to test, etc.).

Example prompt:

> “Refactor the file tree state management so it’s easier to support ‘recent files’ later. Focus on readability and testability; don’t change behavior.”

The AI should:

- Preserve behavior.
- Improve structure and naming.
- Call out any subtle behavior changes explicitly.

### 4. Design & UX Adjustments

For UI/UX changes, provide:

- **Goal** (e.g., reduce clutter, improve focus mode).
- **Scope** (which screens/components).

Example prompt:

> “Polish the preview typography for print‑like reading: headings, paragraphs, blockquotes, and code blocks. Keep styles minimal and readable in both light and dark mode.”

The AI should:

- Modify existing Tailwind or CSS in a minimal way.
- Show before/after rationale at a high level.

---

## Quality & Safety Checks for AI

Whenever you make changes in this repo, you should:

- **Run or recommend running**:
  - `npm run dev` (frontend)
  - `node server/server.js` (backend) or existing backend command
- **Verify**:
  - Markdown editing and preview still work.
  - File/folder management still behaves correctly.
  - PDF export works on at least one non‑trivial document.
- **Avoid**:
  - Introducing new heavy dependencies without a clear reason.
  - Changing the high‑level design philosophy (minimal, focused, fast) without explicit user request.

If you are unsure among multiple viable approaches, briefly list trade‑offs and pick one, indicating why it suits this project.

---

## When in Doubt

- Re‑read `README.md` to align with project goals.
- Prefer **small, incremental improvements** over sweeping rewrites.
- Ask the user (briefly) whether they prefer:
  - A quick, minimal patch, or
  - A more thorough refactor/feature implementation.

Your job as an AI in this repo is to be a **thoughtful, fast collaborator** that respects the project’s philosophy and the user’s time.
