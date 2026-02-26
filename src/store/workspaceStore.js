import { create } from "zustand";

const DEFAULT_CONTENT = `# Welcome to markdowntopdf

Start writing your document here. The preview updates **live** as you type.

## Features

- Live Markdown preview
- Syntax highlighted code blocks
- PDF export
- Dark & light themes

## Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`
}
\`\`\`

## Blockquote

> "The best documentation is the one that exists."

---

Happy writing!
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
      files: { ...files, [filename]: '' },
      activeFile: filename,
      openTabs: [...openTabs, filename],
    });
  },
}))
