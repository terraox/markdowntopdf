import { renderMarkdown } from "./markdownRenderer";

const PDF_STYLES = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 40px; line-height: 1.7; color: #111; }
  h1,h2,h3,h4 { margin-top: 1.5em; margin-bottom: 0.5em; }
  h1 { font-size: 2em; } h2 { font-size: 1.5em; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3em; }
  code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-family: 'JetBrains Mono', monospace; color: #111; }
  pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; }
  pre code { background: none; padding: 0; color: #111; }
  blockquote { border-left: 4px solid #d1d5db; margin: 0; padding: 0 16px; color: #6b7280; }
  img { max-width: 100%; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #d1d5db; padding: 8px 12px; }
  th { background: #f9fafb; font-weight: 600; }
  hr { border: none; border-top: 1px solid #e5e7eb; }
  ul, ol { padding-left: 1.5em; }
  a { color: #111; }
`;

export function buildPdfHtml(markdownContent) {
  const body = renderMarkdown(markdownContent);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PDF_STYLES}</style></head><body>${body}</body></html>`;
}

export async function generatePdfBlob(html) {
  const res = await fetch("http://localhost:3001/api/generate-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html }),
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

export function mdNameToPdf(filename) {
  return filename.replace(/\.mdx?$/, "") + ".pdf";
}
