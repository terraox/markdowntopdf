import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Download, Archive, Files } from 'lucide-react'
import JSZip from 'jszip'
import { useWorkspaceStore } from '../store/workspaceStore'
import { buildPdfHtml, generatePdfBlob, downloadBlob, mdNameToPdf } from '../utils/exportUtils'

export function ExportMenu() {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(null) // null | 'exporting' | string (progress)
  const menuRef = useRef(null)

  const { isExporting, setIsExporting, getActiveContent, activeFile, files } = useWorkspaceStore()

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const withExporting = async (fn) => {
    setIsExporting(true)
    setOpen(false)
    try {
      await fn()
    } catch (err) {
      alert(`Export failed: ${err.message}\n\nMake sure the PDF server is running:\ncd server && node server.js`)
    } finally {
      setIsExporting(false)
      setStatus(null)
    }
  }

  // ── Option 1: current file → PDF ──────────────────────────────
  const exportCurrent = () => withExporting(async () => {
    const html = buildPdfHtml(getActiveContent())
    const blob = await generatePdfBlob(html)
    downloadBlob(blob, mdNameToPdf(activeFile ?? 'document.md'))
  })

  // ── Option 2: all files → ZIP of PDFs ─────────────────────────
  const exportAllZip = () => withExporting(async () => {
    const entries = Object.entries(files)
    const zip = new JSZip()
    for (let i = 0; i < entries.length; i++) {
      const [filename, content] = entries[i]
      setStatus(`Generating ${i + 1}/${entries.length}: ${filename}`)
      const html = buildPdfHtml(content)
      const blob = await generatePdfBlob(html)
      zip.file(mdNameToPdf(filename), blob)
    }
    setStatus('Building ZIP…')
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(zipBlob, 'markdowntopdf-export.zip')
  })

  // ── Option 3: all files → individual PDF downloads ────────────
  const exportAllIndividual = () => withExporting(async () => {
    const entries = Object.entries(files)
    for (let i = 0; i < entries.length; i++) {
      const [filename, content] = entries[i]
      setStatus(`Downloading ${i + 1}/${entries.length}: ${filename}`)
      const html = buildPdfHtml(content)
      const blob = await generatePdfBlob(html)
      downloadBlob(blob, mdNameToPdf(filename))
      // Small gap so browser doesn't block multiple downloads
      await new Promise((r) => setTimeout(r, 300))
    }
  })

  const busy = isExporting

  return (
    <div className="export-menu" ref={menuRef}>
      <div className={`export-btn-group ${busy ? 'export-btn-group--busy' : ''}`}>
        <button
          className="export-btn-main"
          onClick={exportCurrent}
          disabled={busy}
          title="Export current file as PDF"
        >
          <Download size={13} />
          {busy ? (status ?? 'Exporting…') : 'Export PDF'}
        </button>
        <button
          className="export-btn-arrow"
          onClick={() => !busy && setOpen((o) => !o)}
          disabled={busy}
          aria-label="More export options"
        >
          <ChevronDown size={13} className={open ? 'rotate-180' : ''} />
        </button>
      </div>

      {open && (
        <div className="export-dropdown">
          <button className="export-option" onClick={exportCurrent}>
            <Download size={14} />
            <span>
              <strong>Current file</strong>
              <span className="export-option-sub">Export active tab as PDF</span>
            </span>
          </button>
          <div className="export-divider" />
          <button className="export-option" onClick={exportAllZip}>
            <Archive size={14} />
            <span>
              <strong>All files — ZIP</strong>
              <span className="export-option-sub">Bundle all PDFs into one .zip</span>
            </span>
          </button>
          <button className="export-option" onClick={exportAllIndividual}>
            <Files size={14} />
            <span>
              <strong>All files — Individual</strong>
              <span className="export-option-sub">Download each file as a PDF</span>
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
