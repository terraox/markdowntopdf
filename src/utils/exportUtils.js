import { renderMarkdown } from "./markdownRenderer";

/** Styles HTML used only for PDF generation (not the in-app preview). */
const LIGHT_PDF_STYLES = `
  * { box-sizing: border-box; }
  @page {
    margin: 20mm;
    background-color: #ffffff;
  }
  html, body {
    margin: 0;
    padding: 0;
    background-color: #ffffff !important;
    color: #111827;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    font-size: 15px;
    line-height: 1.75;
    width: 100%;
    -webkit-font-smoothing: antialiased;
  }
  body > *:first-child { margin-top: 0; }
  h1, h2, h3, h4, h5, h6 { font-weight: 700; line-height: 1.25; color: #111827; }
  h1 { font-size: 2rem; margin: 0 0 0.75em; }
  h2 { font-size: 1.5rem; margin: 1.35em 0 0.5em; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.35em; }
  h3 { font-size: 1.25rem; margin: 1.25em 0 0.45em; }
  h4 { font-size: 1rem; margin: 1.1em 0 0.4em; }
  p { margin: 0.75em 0; }
  code {
    font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
    font-size: 0.875em;
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
    color: #111827;
  }
  pre {
    font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
    background: #f3f4f6;
    padding: 16px 20px;
    border-radius: 8px;
    overflow-x: auto;
    border: 1px solid #e5e7eb;
    font-size: 0.875rem;
    line-height: 1.6;
  }
  pre code { background: none; padding: 0; border-radius: 0; font-size: inherit; color: #111827; }
  blockquote {
    border-left: 3px solid #d1d5db;
    margin: 1em 0;
    padding: 4px 0 4px 16px;
    color: #6b7280;
    background: transparent;
  }
  img { max-width: 100%; border-radius: 4px; }
  table { border-collapse: collapse; width: 100%; margin: 1.15em 0; font-size: 0.9375rem; }
  th, td { border: 1px solid #e5e7eb; padding: 10px 14px; text-align: left; vertical-align: top; }
  th { background: #f3f4f6; font-weight: 600; color: #111827; }
  tbody tr:nth-child(even) { background: #fafafa; }
  tbody tr:nth-child(even) td { border-color: #e5e7eb; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 2em 0; }
  ul, ol { padding-left: 1.5em; margin: 0.75em 0; }
  li { margin: 0.25em 0; }
  a { color: #111827; text-decoration: underline; }
  .contains-task-list { list-style-type: none; padding-left: 0.5em; }
  .task-list-item { display: flex; align-items: center; gap: 8px; margin: 0.35em 0; }
  .task-list-item-checkbox { width: 15px; height: 15px; accent-color: #2563eb; }
  .katex-display-block { margin: 1.25em 0; padding: 12px; text-align: center; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
  .callout-card { margin: 1.25em 0; padding: 14px 18px; border-radius: 8px; border-left: 4px solid #3b82f6; background: #eff6ff; }
  .callout-header { font-weight: 600; font-size: 0.9rem; margin-bottom: 6px; color: #1e40af; }
  .callout-tip { border-left-color: #0ea5e9; background: #f0f9ff; }
  .callout-tip .callout-header { color: #0369a1; }
  .callout-note { border-left-color: #6366f1; background: #eef2ff; }
  .callout-note .callout-header { color: #4338ca; }
  .callout-warning { border-left-color: #f59e0b; background: #fffbeb; }
  .callout-warning .callout-header { color: #b45309; }
  .callout-important, .callout-caution { border-left-color: #ef4444; background: #fef2f2; }
  .callout-important .callout-header, .callout-caution .callout-header { color: #b91c1c; }
  .mermaid-wrapper { margin: 1.5em 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }
`;

/**
 * Pixel-identical layout to LIGHT_PDF_STYLES (same margins, box model, min-height) so pagination matches.
 * Only colors differ. Uses the same Puppeteer page margins as light — viewport width/height match → same wraps.
 * Note: Chromium still paints the PDF margin strip outside the viewport white; only the inner area is dark.
 */
const DARK_PDF_STYLES = `
  * { box-sizing: border-box; }
  @page {
    margin: 20mm;
    background-color: #0a0a0a;
  }
  html, body {
    margin: 0;
    padding: 0;
    background-color: #0a0a0a !important;
    color: #f5f5f5;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    font-size: 15px;
    line-height: 1.75;
    width: 100%;
    -webkit-font-smoothing: antialiased;
  }
  @media print {
    html, body {
      background-color: #0a0a0a !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
  body > *:first-child { margin-top: 0; }
  h1, h2, h3, h4, h5, h6 { font-weight: 700; line-height: 1.25; color: #f5f5f5; }
  h1 { font-size: 2rem; margin: 0 0 0.75em; }
  h2 { font-size: 1.5rem; margin: 1.35em 0 0.5em; border-bottom: 1px solid #404040; padding-bottom: 0.35em; }
  h3 { font-size: 1.25rem; margin: 1.25em 0 0.45em; }
  h4 { font-size: 1rem; margin: 1.1em 0 0.4em; }
  p { margin: 0.75em 0; }
  code {
    font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
    font-size: 0.875em;
    background: #262626;
    padding: 2px 6px;
    border-radius: 4px;
    color: #f5f5f5;
  }
  pre {
    font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
    background: #262626;
    padding: 16px 20px;
    border-radius: 8px;
    overflow-x: auto;
    border: 1px solid #404040;
    font-size: 0.875rem;
    line-height: 1.6;
  }
  pre code { background: none; padding: 0; border-radius: 0; font-size: inherit; color: #f5f5f5; }
  blockquote {
    border-left: 3px solid #525252;
    margin: 1em 0;
    padding: 4px 0 4px 16px;
    color: #a3a3a3;
    background: transparent;
  }
  img { max-width: 100%; border-radius: 4px; }
  table { border-collapse: collapse; width: 100%; margin: 1.15em 0; font-size: 0.9375rem; }
  th, td { border: 1px solid #404040; padding: 10px 14px; text-align: left; vertical-align: top; }
  th { background: #262626; font-weight: 600; color: #f5f5f5; }
  tbody tr:nth-child(even) { background: #141414; }
  tbody tr:nth-child(even) td { border-color: #404040; }
  hr { border: none; border-top: 1px solid #404040; margin: 2em 0; }
  ul, ol { padding-left: 1.5em; margin: 0.75em 0; }
  li { margin: 0.25em 0; }
  a { color: #f5f5f5; text-decoration: underline; }
  .contains-task-list { list-style-type: none; padding-left: 0.5em; }
  .task-list-item { display: flex; align-items: center; gap: 8px; margin: 0.35em 0; }
  .task-list-item-checkbox { width: 15px; height: 15px; accent-color: #3b82f6; }
  .katex-display-block { margin: 1.25em 0; padding: 12px; text-align: center; background: #18181b; border-radius: 8px; border: 1px solid #27272a; }
  .callout-card { margin: 1.25em 0; padding: 14px 18px; border-radius: 8px; border-left: 4px solid #3b82f6; background: rgba(59, 130, 246, 0.12); }
  .callout-header { font-weight: 600; font-size: 0.9rem; margin-bottom: 6px; color: #60a5fa; }
  .callout-tip { border-left-color: #38bdf8; background: rgba(56, 189, 248, 0.12); }
  .callout-tip .callout-header { color: #38bdf8; }
  .callout-note { border-left-color: #818cf8; background: rgba(129, 140, 248, 0.12); }
  .callout-note .callout-header { color: #818cf8; }
  .callout-warning { border-left-color: #fbbf24; background: rgba(251, 191, 36, 0.12); }
  .callout-warning .callout-header { color: #fbbf24; }
  .callout-important, .callout-caution { border-left-color: #f87171; background: rgba(248, 113, 113, 0.12); }
  .callout-important .callout-header, .callout-caution .callout-header { color: #f87171; }
  .mermaid-wrapper { margin: 1.5em 0; background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 16px; text-align: center; }
`;

const FONT_LINKS = `<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin /><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" /><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />`;

/** Same printable box for every export — required so light/dark PDFs paginate identically. */
export function getPdfGenerationOptions() {
  // Use zero margins in Puppeteer to ensure background colors fill the page.
  // The actual document margins are handled in CSS via @page { margin: 20mm }.
  return {
    printBackground: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  };
}

export function buildPdfHtml(markdownContent, theme = 'light', title = 'Document') {
  const body = renderMarkdown(markdownContent);
  const styles = theme === 'dark' ? DARK_PDF_STYLES : LIGHT_PDF_STYLES;
  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${title}</title>${FONT_LINKS}<style>${styles}</style></head><body>${body}</body></html>`;
}

export async function generatePdfBlob(html, pdfOptions = {}) {
  const res = await fetch("http://localhost:6001/api/generate-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html, options: pdfOptions }),
  });
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return res.blob();
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function mdNameToPdf(filename, suffix = '') {
  return filename.replace(/\.mdx?$/, "") + suffix + ".pdf";
}
