import { create } from "zustand";

const DEFAULT_CONTENT = `<u>underlined text</u>

# Markdown to PDF

### Paste AI output, notes, or a README — download a polished PDF.

Beautiful Markdown PDFs in one click — **no CSS**, no DIY styling. Use *emphasis*, ~~strikethrough~~, \`inline code\`, and [links](https://www.markdowntopdf.com).

## Get started

1. Type or paste Markdown here
2. Pick a typeface — preview updates live
3. Click **Download PDF** (or DOCX)

## Why people use it

* Export **ChatGPT / Claude / Gemini** answers to PDF
* Turn **Cursor** notes and specs into shareable docs
* Build a **Markdown resume** or status report
* Keep diagrams, math, and code looking clean in print

## Checklist

- [x] Headings, lists, and tables
- [x] Syntax-highlighted code
- [x] Mermaid diagrams
- [x] LaTeX / KaTeX math
- [ ] Your document next

## Code

\`\`\`javascript
function hello(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Table

| Use case | Why Markdown |
| :--- | :--- |
| AI chats | Copy → paste → PDF |
| Resumes | Plain text you can version |
| Reports | Fast structure, clean export |

## Diagram (Mermaid)

\`\`\`mermaid
flowchart LR
  A[Paste Markdown] --> B[Live preview]
  B --> C[Download PDF]
  C --> D[Share]
\`\`\`

## Math (LaTeX / KaTeX)

Inline: $E = mc^2$

$$\\int_0^1 x^2 \\, dx = \\frac{1}{3}$$

## Nested list

* Structure
  * Headings and paragraphs
  * Bullet, numbered, and task lists
* Media
  * Images and links
  * Blockquotes

> Tip: Downloads include a watermark. Create a free account to save Markdown in Workspace. Upgrade to Pro to remove the watermark, share public preview links, and unlock everything.

---

Visit [https://www.markdowntopdf.com](https://www.markdowntopdf.com) — edit this sample, then export.
`;

export const useWorkspaceStore = create((set, get) => ({
  // ── File state ──────────────────────────────────────────────
  files: {
    "untitled.md": DEFAULT_CONTENT,
  },
  activeFile: "untitled.md",
  openTabs: ["untitled.md"],
  dirtyFiles: new Set(),

  // ── Layout state ─────────────────────────────────────────────
  sidebarOpen: true,
  syncScroll: false,

  // ── Export state ─────────────────────────────────────────────
  isExporting: false,

  // ── Getters ──────────────────────────────────────────────────
  getActiveContent: () => {
    const { files, activeFile } = get();
    return files[activeFile] ?? "";
  },

  // ── Actions ──────────────────────────────────────────────────
  setContent: (content) => {
    const { activeFile, files, dirtyFiles } = get();
    set({
      files: { ...files, [activeFile]: content },
      dirtyFiles: new Set([...dirtyFiles, activeFile]),
    });
  },

  setActiveFile: (filename) => {
    const { openTabs } = get();
    set({
      activeFile: filename,
      openTabs: openTabs.includes(filename)
        ? openTabs
        : [...openTabs, filename],
    });
  },

  openFile: (filename, content) => {
    const { files, openTabs } = get();
    set({
      files: { ...files, [filename]: content },
      activeFile: filename,
      openTabs: openTabs.includes(filename)
        ? openTabs
        : [...openTabs, filename],
    });
  },

  closeTab: (filename) => {
    const { openTabs, activeFile, files, dirtyFiles } = get();
    const nextTabs = openTabs.filter((t) => t !== filename);
    const nextActive =
      activeFile === filename
        ? (nextTabs[nextTabs.length - 1] ?? null)
        : activeFile;
    const nextDirty = new Set(dirtyFiles);
    nextDirty.delete(filename);
    const nextFiles = { ...files };
    if (nextTabs.length === 0) delete nextFiles[filename];
    set({
      openTabs: nextTabs,
      activeFile: nextActive,
      dirtyFiles: nextDirty,
      files: nextFiles,
    });
  },

  markSaved: (filename) => {
    const { dirtyFiles } = get();
    const next = new Set(dirtyFiles);
    next.delete(filename);
    set({ dirtyFiles: next });
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setIsExporting: (val) => set({ isExporting: val }),
  toggleSyncScroll: () => set((state) => ({ syncScroll: !state.syncScroll })),

  newFile: () => {
    const { files, openTabs } = get();
    // Generate a unique filename
    let n = 1;
    while (files[`untitled-${n}.md`]) n++;
    const filename = `untitled-${n}.md`;
    set({
      files: { ...files, [filename]: "" },
      activeFile: filename,
      openTabs: [...openTabs, filename],
    });
  },
}));
