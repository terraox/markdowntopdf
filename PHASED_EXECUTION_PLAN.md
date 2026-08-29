# Phased Execution Plan & Test Specification

This document breaks down the implementation into incremental, testable phases. Each phase has a specific scope, implementation tasks, and concrete test cases with sample Markdown inputs to verify expected outputs before moving on to the next phase.

---

## 🗺️ Phase Overview

```
┌──────────────────────────────┐
│ Phase 1: Rendering Engines   │ ➔ Mermaid, KaTeX, Task Lists, Callouts
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│ Phase 2: Editor Toolbar      │ ➔ Formatting Bar, Issue Pill, Fix & Beautify
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│ Phase 3: Style Sidebar       │ ➔ Google Fonts Selector, Categories, Color Palettes
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│ Phase 4: Fine-Tune Modal     │ ➔ Granular H1-H6, Layout Settings, Live Mini-Preview
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│ Phase 5: PDF Export Sync     │ ➔ Server-side vector SVGs, KaTeX, Fonts & Layouts
└──────────────────────────────┘
```

---

## 🚀 Phase 1: Core Rendering Engines `[✅ COMPLETED & VERIFIED]`

### 🎯 Goal
Upgrade `markdownRenderer.js` and `PreviewPanel.jsx` to render Mermaid diagrams, KaTeX math equations, interactive checkboxes, HTML underlines, and styled callout boxes.

### 🛠️ Tasks
- [x] **Dependencies**: Installed `katex`, `mermaid`, `markdown-it-task-lists`.
- [x] **KaTeX Integration**: Added inline math (`$...$`) and display math (`$$...$$`) parsing with KaTeX and imported KaTeX CSS stylesheet.
- [x] **Mermaid Integration**: Intercept ````mermaid code blocks, render them into responsive SVGs with theme-aware styling (light / dark mode support) and clean scaling.
- [x] **Task Lists & HTML Underlines**: Enabled `markdown-it-task-lists` for `- [ ]` and `- [x]` and styled interactive/styled checkboxes; verified `<u>underlined text</u>`.
- [x] **Callout / Admonition Boxes**: Styled `> Tip:`, `> Note:`, `> Warning:` blockquotes as distinct card boxes with soft backgrounds and icons.

### 🧪 Test Cases (Phase 1) - `[ALL PASSED]`

#### Test Case 1.1: KaTeX Math Equations
* **Input Markdown**:
  ```markdown
  Inline formula: $E = mc^2$ and $\sqrt{a^2 + b^2} = c$.

  Display equation:
  $$\int_0^1 x^2 \, dx = \frac{1}{3}$$
  ```
* **Expected Output**:
  - $E = mc^2$ renders with proper italic mathematical symbols.
  - The integral displays centered with properly sized integral sign, fraction bar, and superscript/subscript.

#### Test Case 1.2: Mermaid Diagram / Flowchart
* **Input Markdown**:
  ````markdown
  ```mermaid
  flowchart LR
    A[Paste Markdown] --> B[Live preview]
    B --> C[Download PDF]
    C --> D[Share]
  ```
  ````
* **Expected Output**:
  - Renders as a clean horizontal flowchart with 4 boxes connected by arrows.
  - Adapts node background and line colors based on current theme.

#### Test Case 1.3: Task Lists / Checklists
* **Input Markdown**:
  ```markdown
  - [x] Mermaid diagrams
  - [x] LaTeX / KaTeX math
  - [ ] Your document next
  ```
* **Expected Output**:
  - First two items display checked blue checkboxes.
  - Third item displays an unchecked checkbox.

#### Test Case 1.4: Callout / Tip Box
* **Input Markdown**:
  ```markdown
  > Tip: Downloads include high-resolution vector diagrams and math equations.
  ```
* **Expected Output**:
  - Renders in a light blue/tinted rounded card with a left accent border and tip icon.

---

## 🎛️ Phase 2: Rich Editor Toolbar, Fix & Beautify

### 🎯 Goal
Provide the full formatting toolbar above CodeMirror, the real-time Markdown issue detection pill, and one-click `Fix` & `Beautify` formatters.

### 🛠️ Tasks
1. **Toolbar Component (`EditorToolbar.jsx`)**:
   - Text buttons: `B` (Bold), `I` (Italic), `U` (Underline), `S` (Strikethrough), `<>` (Code).
   - Heading dropdown/buttons: `H1`, `H2`, `H3`.
   - List buttons: Bullet list, Numbered list, Checklist (`- [ ]`), Blockquote (`""`).
   - Insert buttons: Link (`[text](url)`), Image (`![alt](url)`), Table generator, Horizontal Rule (`---`).
2. **CodeMirror Integration**:
   - Connect toolbar buttons to CodeMirror 6 transactions to wrap selected text or insert snippet at cursor.
3. **Syntax Issue Detection Banner**:
   - Analyze editor content for common issues (unclosed tags, broken tables, inconsistent lists).
   - Display `1 Markdown issue [Fix]` pill banner above the editor.
4. **Markdown Fix & Beautify Engine (`markdownFormatter.js`)**:
   - **`✓ Fix`**: Auto-closes dangling tags (`**`, `_`, `<u>`, `<code>`), repairs malformed table rows and list numbering.
   - **`✨ Beautify`**: Formats and aligns Markdown table columns with equal padding, normalizes indentation, and cleans redundant blank lines.

### 🧪 Test Cases (Phase 2)

#### Test Case 2.1: Toolbar Text Wrapping
* **Action**: Select the word `hello` in editor and click the `B` button.
* **Expected Output**: Selection becomes `**hello**` and preview updates immediately.

#### Test Case 2.2: Table Generator
* **Action**: Click the Table toolbar button.
* **Expected Output**: Inserts a sample 3x3 formatted Markdown table at cursor position.

#### Test Case 2.3: Table Auto-Alignment (`✨ Beautify`)
* **Input Markdown**:
  ```markdown
  |Use case|Why Markdown|
  |---|---|
  |AI chats|Copy -> paste -> PDF|
  |Resumes|Plain text you can version|
  ```
* **Action**: Click `✨ Beautify`.
* **Expected Output**:
  ```markdown
  | Use case | Why Markdown                |
  | -------- | --------------------------- |
  | AI chats | Copy -> paste -> PDF        |
  | Resumes  | Plain text you can version  |
  ```

#### Test Case 2.4: Syntax Auto-Repair (`✓ Fix`)
* **Input Markdown**:
  ```markdown
  This is **unclosed bold and <u>unclosed underline
  ```
* **Action**: Click `✓ Fix` or the issue banner button.
* **Expected Output**: Content is repaired to `This is **unclosed bold** and <u>unclosed underline</u>`.

---

## 🎨 Phase 3: Style & Typography Sidebar

### 🎯 Goal
Implement the right sidebar with Google Fonts typography cards, font category filters, color palette presets, and state management.

### 🛠️ Tasks
1. **Style Store (`styleStore.js`)**:
   - State for selected font family, active color palette, layout settings, and custom overrides.
2. **Dynamic Google Fonts Loader (`fontLoader.js`)**:
   - Dynamically load requested font families on demand via Google Fonts API.
3. **Typography Cards (`StyleSidebar.jsx`, `FontCard.jsx`)**:
   - Category filter tabs: `All`, `Sans`, `Serif`, `Mono`.
   - 13 Curated cards: Roboto, Montserrat, Lato, Libre Baskerville, IBM Plex Sans, Playfair Display, Source Serif Pro, Inter, PT Serif, Crimson Text, Raleway, Open Sans, Fira Sans.
   - Each card displays font name, subtitle description, and live "Aa" specimen.
4. **Color Palette Swatches (`ColorPalettePicker.jsx`)**:
   - Dual-swatch circular pills (Light/Dark, Slate, Indigo, Emerald, Amber, Sepia, Rose, etc.).
5. **Live Preview CSS Synchronization**:
   - Apply selected font family and CSS variables directly to `.markdown-body`.

### 🧪 Test Cases (Phase 3)

#### Test Case 3.1: Category Filtering
* **Action**: Click the `Serif` tab in the right sidebar.
* **Expected Output**: Only serif fonts (Libre Baskerville, Playfair Display, Source Serif Pro, PT Serif, Crimson Text) are shown.

#### Test Case 3.2: Instant Font Switching
* **Action**: Click the `Playfair Display` font card.
* **Expected Output**: The live preview font immediately switches to Playfair Display without page reload.

#### Test Case 3.3: Preset Palette Selection
* **Action**: Click the `Emerald` color palette swatch.
* **Expected Output**: Document headings, links, and accent borders switch to emerald green tones.

---

## ⚙️ Phase 4: "Fine-Tune Styles" Modal & Live Customizer

### 🎯 Goal
Build the comprehensive "Fine-Tune Styles" modal with granular H1–H6 controls, body/link color pickers, page layout settings, and the live mini-preview.

### 🛠️ Tasks
1. **Modal Shell (`FineTuneDialog.jsx`)**:
   - Header with `Fine-tune styles`, `CUSTOM` badge, `Reset to defaults`, and `Done`.
2. **Body & Link Customization**:
   - 2-Column font picker dropdown grid (Alegreya, Anonymous Pro, Archivo Narrow, Arvo, Baloo 2, Bitter, etc.).
   - Full RGB/HSL/HEX color picker widget with saturation canvas and hue slider.
3. **Granular Headings Control**:
   - Toggle: `All the same` vs `Each level`.
   - In `Each level` mode: Individual rows for `H1`, `H2`, `H3`, `H4`, `H5`, and `H6` with separate font pills and color pickers.
4. **Page Layout Settings**:
   - Paper size: `A4`, `Letter`, `Legal`, `A3`, `A5`.
   - Margins: `Normal` (20mm), `Compact` (10mm), `Wide` (30mm), `None`.
   - Orientation: `Portrait`, `Landscape`.
   - Page numbers: Toggle checkbox.
5. **Live Mini-Preview Pane**:
   - Embedded preview pane on the right side of the modal reflecting all custom changes in real-time.
6. **Sidebar Summary Breakdown**:
   - When custom styles are saved, update the right sidebar to display the `Custom Styles [CUSTOM]` active summary (Typography list, Color hexes, and Page layout details).

### 🧪 Test Cases (Phase 4)

#### Test Case 4.1: Granular Headings (`Each level`)
* **Action**: In modal, switch Headings to `Each level`, set `H1` to `Playfair Display` (#0f172a) and `H2` to `Inter` (#0f766e).
* **Expected Output**: H1 titles in the preview render in Playfair Display while H2 subtitles render in green Inter.

#### Test Case 4.2: Page Margin & Orientation Adjustment
* **Action**: Select `Orientation: Landscape` and `Margins: Compact`.
* **Expected Output**: The preview card updates to landscape aspect ratio with tighter 10mm padding.

#### Test Case 4.3: Reset to Defaults
* **Action**: Click `Reset to defaults`.
* **Expected Output**: All custom fonts, colors, and layout options reset to the active curated theme; the `CUSTOM` badge disappears.

---

## 📄 Phase 5: High-Fidelity PDF Export Synchronization

### 🎯 Goal
Ensure exported PDFs match 100% of the styling, Google Fonts, KaTeX formulas, vector Mermaid diagrams, margins, paper sizes, and page numbers.

### 🛠️ Tasks
1. **Server-Side Payload Builder (`exportUtils.js`)**:
   - Inject Google Font `<link>` / `@import` tags matching selected body and heading fonts.
   - Embed pre-rendered Mermaid vector SVGs directly into the HTML payload.
   - Include KaTeX stylesheet and CSS variables for colors, margins, and paper orientation.
2. **Page Numbers & Pagination**:
   - Pass Puppeteer options for page formatting, margin mm values, and header/footer templates.
3. **One-Click Export**:
   - Wire the prominent sticky "Download PDF" button in the right sidebar to trigger generation.

### 🧪 Test Cases (Phase 5)

#### Test Case 5.1: Vector Diagram & Formula Export
* **Action**: Open document containing Mermaid flowchart and KaTeX formula, click "Download PDF".
* **Expected Output**: The generated PDF contains crisp vector SVG diagrams (zoomable without pixelation) and rendered mathematical symbols.

#### Test Case 5.2: Custom Typography & Color Fidelity
* **Action**: Apply a custom font pairing and export to PDF.
* **Expected Output**: The exported PDF renders in the exact custom Google Fonts and custom colors configured in the app.

---

## 🏁 Summary Checklist

- [x] **Phase 1: Core Rendering Engines** (Mermaid, KaTeX, Task Lists, Callouts) — `✅ COMPLETED & VERIFIED`
- [ ] **Phase 2: Editor Toolbar & Syntax Tools** (Formatting buttons, Fix, Beautify) — `⏳ UP NEXT`
- [ ] **Phase 3: Style & Typography Sidebar** (Google Fonts cards, Categories, Palettes)
- [ ] **Phase 4: Fine-Tune Modal** (Granular H1–H6, Color Pickers, Mini-Preview)
- [ ] **Phase 5: PDF Export Sync** (High-fidelity vector PDF generation)
