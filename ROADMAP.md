# Markdown to PDF – Feature Parity & Enhancement Roadmap

This document outlines the architectural specifications, required dependencies, and implementation steps to achieve complete feature parity with the target product design (Mermaid diagrams, KaTeX math formulas, task checklists, rich formatting toolbar, typography selector, theme palettes, and high-fidelity PDF export).

---

## 📋 Table of Contents
1. [Overview & Target Architecture](#overview--target-architecture)
2. [Feature Breakdown & Technical Requirements](#feature-breakdown--technical-requirements)
   - [1. Mermaid Diagrams & Flowcharts](#1-mermaid-diagrams--flowcharts)
   - [2. LaTeX / KaTeX Math Equations](#2-latex--katex-math-equations)
   - [3. Interactive Checklists & Task Lists](#3-interactive-checklists--task-lists)
   - [4. Rich Editor Formatting Toolbar](#4-rich-editor-formatting-toolbar)
   - [5. Typography & Font Pairing Selector](#5-typography--font-pairing-selector)
   - [6. Color Palettes & Fine-Tuning Styling](#6-color-palettes--fine-tuning-styling)
   - [7. Callouts & Admonitions (Tip / Warning / Note)](#7-callouts--admonitions)
   - [8. High-Fidelity PDF & DOCX Export](#8-high-fidelity-pdf--docx-export)
3. [Component & Directory Structure Updates](#component--directory-structure-updates)
4. [Step-by-Step Implementation Plan](#step-by-step-implementation-plan)

---

## 🏗️ Overview & Target Architecture

The application will be structured around a clean, modern **3-column / flexible layout**:
- **Left Panel (Collapsible / Sidebar)**: File management, workspace tabs, open/save.
- **Center-Left (Editor Panel)**: CodeMirror 6 with a rich formatting toolbar, keyboard shortcuts, syntax highlighting, and sync-scroll.
- **Center-Right (Preview Panel)**: Real-time rendering with KaTeX math equations, Mermaid SVG diagrams, interactive task lists, and styled callout boxes.
- **Right Panel (Design & Typography Sidebar)**: Real-time typeface switcher (Google Fonts), font category filters (All, Sans, Serif, Mono), curated color palettes, fine-tuning controls, and a persistent one-click export button.

---

## 🚀 Feature Breakdown & Technical Requirements

### 1. Mermaid Diagrams & Flowcharts
* **Objective**: Render ````mermaid blocks into dynamic vector SVG flowcharts, sequence diagrams, Gantt charts, class diagrams, etc.
* **Dependencies**: `mermaid`
* **Implementation Details**:
  - Integrate a custom `markdown-it` rule or pre/post-processing step for `code_block` and `fence` matching language `mermaid`.
  - In Preview: Render via `mermaid.render()` into responsive SVGs with light/dark theme adaptation.
  - In PDF Export: Embed generated SVGs inline directly into the HTML payload sent to Puppeteer, ensuring diagrams print crisply in vector format without missing web fonts or external dependencies.

### 2. LaTeX / KaTeX Math Equations
* **Objective**: Render inline math (`$E = mc^2$`) and display/block math (`$$\int_0^1 x^2 dx = \frac{1}{3}$$`).
* **Dependencies**: `katex`, `markdown-it-katex` (or custom math delimiters plugin with `katex`)
* **Implementation Details**:
  - Parse `$...$` and `$$...$$` syntax.
  - Include KaTeX CSS stylesheet in both the main web preview and `exportUtils.js` (for Puppeteer PDF export).
  - Handle error boundaries gracefully (display raw equation in red or fallback if syntax is malformed).

### 3. Interactive Checklists & Task Lists
* **Objective**: Render `- [ ]` and `- [x]` syntax as stylized checkboxes.
* **Dependencies**: `markdown-it-task-lists`
* **Implementation Details**:
  - Configure `markdown-it-task-lists` with `{ enabled: true, label: true, labelAfter: true }`.
  - Add custom CSS styling for checkboxes in both light and dark themes with smooth transitions.

### 4. Rich Editor Formatting Toolbar & Syntax Issue Banner
* **Objective**: Provide an intuitive formatting bar and real-time issue detection above the CodeMirror editor:
  - **Text Formatting**: Bold (`B` / `**`), Italic (`I` / `*`), Underline (`U` / `<u>`), Strikethrough (`S` / `~~`), Inline Code (`` ` ``).
  - **Headings**: H1 (`#`), H2 (`##`), H3 (`###`).
  - **Blocks**: Blockquote (`""` / `>`), Bullet List (`-`), Numbered List (`1.`), Checklist (`- [ ]`), Code Block (`<>` / ```` ``` ````).
  - **Inserts**: Link (`[text](url)`), Image (`![alt](url)`), Table generator (`| Col 1 | Col 2 |`), Horizontal Rule (`---`).
  - **Real-Time Issue Banner**:
    - Displays an inline pill banner: `1 Markdown issue [Fix]` when syntax mistakes are detected.
    - Quick-fix button instantly resolves the detected issues.
  - **Smart Utility Actions (Top Right of Toolbar)**:
    - **`✓ Fix` (Syntax & Markup Auto-Repair)**:
      - Automatically detects and repairs common Markdown syntax issues.
      - Normalizes mismatched list numbering, fixes broken table delimiters, closes unclosed markdown formatting tags (`**`, `_`, `<code>`, `<u>`), and repairs malformed links/images.
    - **`✨ Beautify` (Intelligent Markdown Formatter)**:
      - Formats and aligns Markdown tables (equalizing column widths and pipe alignments).
      - Standardizes list indentations (2 or 4 spaces).
      - Cleans up irregular blank lines, trims trailing whitespace, and beautifies code fences.

### 5. Typography & Font Pairing Selector (Right Sidebar)
* **Objective**: Right sidebar offering instant switching between curated Google Fonts, active custom style summaries, and export actions:
  - **Custom Styles Active Card (Top)**:
    - Displays `Custom Styles` header with a green `CUSTOM` badge when active.
    - Subtitle: *`Tap to edit fonts, colours & layout >`* (re-opens the Fine-tune modal).
  - **Summary Breakdown Sections (When Custom Styles Active)**:
    - **TYPOGRAPHY**: Lists active font for Body and each heading level (H1, H2, H3, H4, H5, H6).
    - **COLOURS**: Lists active color swatches and hex codes (Body, H1–H6, Links).
    - **PAGE LAYOUT**: Lists Paper size (`A4`), Margins (`Normal`), Orientation (`Portrait`), and Page numbers status (`Off` / `On`).
  - **Curated Typeface Selector**:
    - **Category Filter Tabs**: `All`, `Sans`, `Serif`, `Mono`.
    - **Curated Typeface Cards**: Roboto, Montserrat, Lato, Libre Baskerville, IBM Plex Sans, Playfair Display, Source Serif Pro, Inter, PT Serif, Crimson Text, Raleway, Open Sans, Fira Sans.
  - **Curated Color Palettes**: Dual-swatch circular pills for instant preset application.
  - **Action Controls**:
    - "Fine-tune styles" trigger card (with `Body, headings & link colours` subtitle).
    - Sticky high-visibility "Download PDF" button.

### 6. "Fine-Tune Styles" Modal & Live Customizer
* **Objective**: A comprehensive modal allowing live customization of document styling, typography, colors, and print layout with a side-by-side live mini-preview:
  - **Header Bar**:
    - Title: "Fine-tune styles" with a green `CUSTOM` badge when modified.
    - Subtitle: *"Customise fonts, colours, and page layout. Changes apply live."* (or *"Custom styles are active. Reset anytime to restore the curated look."*).
    - Action Buttons: `Reset to defaults` (reverts all customizations) + `Done` (saves and closes).
  - **Styling Controls (Left Pane)**:
    - **BODY**:
      - Font selector dropdown opening a 2-column searchable/scrollable font grid (Alegreya, Alegreya Sans, Anonymous Pro, Archivo Narrow, Arvo, Baloo 2, BioRhyme, Bitter, etc.) with live "Aa" preview.
      - Body text color picker button (`COLOUR`) with full HSL/RGB/HEX color picker widget (gradient canvas, hue slider, eye-dropper tool, RGB input boxes).
    - **LINKS**:
      - Hyperlink accent color picker button (`COLOUR`) with full color picker popover.
    - **HEADINGS**:
      - Mode toggle: `All the same` vs `Each level`.
      - In `All the same` mode: Unified font selector and color picker for all headings.
      - In `Each level` mode: Individual rows for `H1`, `H2`, `H3`, `H4`, `H5`, and `H6`, each having its own font selector pill and `COLOUR` picker.
    - **PAGE LAYOUT**:
      - **Paper size** dropdown: `A4`, `Letter`, `Legal`, `A3`, `A5`.
      - **Margins** dropdown: `Normal` (20mm), `Compact` (10mm), `Wide` (30mm), `None`.
      - **Orientation** dropdown: `Portrait`, `Landscape`.
      - **Page numbers** toggle: `[✓] Page numbers` (renders footer page numbering in export).
  - **Live Mini-Preview (Right Pane)**:
    - Live-rendered document page card demonstrating the exact font pairings, colors, heading hierarchy, margins, and paper aspect ratio in real time as values change.

### 7. Callouts & Admonitions
* **Objective**: Parse `> Tip:`, `> Note:`, `> Warning:`, `> Important:` blockquotes into distinct styled alert cards with icons.
* **Implementation Details**:
  - Custom `markdown-it` container plugin or regex post-processor.
  - Render with distinct soft background colors, accent borders, and Lucide icons.

### 8. High-Fidelity PDF & DOCX Export
* **Objective**: Pixel-perfect export matching the selected typography, theme, diagrams, and math formulas.
* **Implementation Details**:
  - Update `buildPdfHtml()` in `exportUtils.js` to bundle:
    - Selected font `@import` or `<link>`.
    - KaTeX CSS.
    - Inlined Mermaid SVGs.
    - Custom color variables.
  - DOCX export option using `docx` or client-side conversion.

---

## 📁 Component & Directory Structure Updates

```
src/
├── components/
│   ├── EditorPanel.jsx          # CodeMirror + Toolbar integration
│   ├── EditorToolbar.jsx        # [NEW] Rich formatting action buttons
│   ├── PreviewPanel.jsx         # Live preview with KaTeX & Mermaid support
│   ├── StyleSidebar.jsx         # [NEW] Right sidebar: Fonts, Categories, Palettes
│   ├── FontCard.jsx             # [NEW] Font preview selection card
│   ├── ColorPalettePicker.jsx   # [NEW] Theme palette swatches
│   ├── FineTuneDialog.jsx       # [NEW] Modal for margins, sizes, line heights
│   ├── TabBar.jsx               # Tab management
│   ├── ExportMenu.jsx           # Download PDF / DOCX
│   └── ui/                      # Radix UI primitives & styled components
├── store/
│   ├── workspaceStore.js        # File & workspace tabs state
│   └── styleStore.js            # [NEW] Selected font, palette, sizes, margins
├── utils/
│   ├── markdownRenderer.js      # Markdown-it + KaTeX + TaskLists + Callouts
│   ├── markdownFormatter.js     # [NEW] Fix & Beautify logic (table align, syntax repair)
│   ├── mermaidRenderer.js       # [NEW] Client-side SVG rendering for Mermaid
│   ├── fontLoader.js            # [NEW] Dynamic Google Fonts loader
│   └── exportUtils.js           # PDF HTML compilation (Fonts + CSS + SVGs)
```

---

## 📅 Step-by-Step Implementation Plan

| Phase | Milestone | Key Deliverables |
| :--- | :--- | :--- |
| **Phase 1** | **Core Rendering Engines** | • Install `mermaid`, `katex`, `markdown-it-katex`, `markdown-it-task-lists`<br>• Configure `markdownRenderer.js` and `mermaidRenderer.js`<br>• Add KaTeX & task list CSS |
| **Phase 2** | **Editor Toolbar & Formatters** | • Create `EditorToolbar.jsx`<br>• Implement CodeMirror selection-insertion commands<br>• Add buttons for formatting, lists, tables, code, and math blocks<br>• Implement `markdownFormatter.js` (`✓ Fix` auto-repair & `✨ Beautify` table/markdown alignment) |
| **Phase 3** | **Style & Typography Sidebar** | • Create `styleStore.js` for theme & typography state<br>• Build `StyleSidebar.jsx`, `FontCard.jsx`, and font category filter tabs<br>• Add Google Fonts dynamic loading and preview CSS bindings |
| **Phase 4** | **Color Palettes & Callouts** | • Add palette swatches (Light, Dark, Slate, Indigo, Emerald, Sepia, etc.)<br>• Add custom tip/warning/note callout styling in `markdownRenderer.js` |
| **Phase 5** | **PDF Export Synchronization** | • Update `exportUtils.js` to bundle selected fonts, KaTeX styles, and SVG diagrams<br>• Verify end-to-end PDF generation via Puppeteer server |
| **Phase 6** | **Polish & Verification** | • Responsive 3-pane layout adjustments<br>• Keyboard shortcuts testing & verification |
