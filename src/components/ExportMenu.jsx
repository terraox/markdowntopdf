import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Download, Archive, Files } from 'lucide-react'
import JSZip from 'jszip'
import { useWorkspaceStore } from '../store/workspaceStore'
import { buildPdfHtml, generatePdfBlob, downloadBlob, mdNameToPdf } from '../utils/exportUtils'

export function ExportMenu() {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(null) // null | 'exporting' | string (progress)
  const [theme, setTheme] = useState('light') // 'light' | 'dark' | 'both'
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
    const themesToExport = theme === 'both' ? ['light', 'dark'] : [theme]
    const content = getActiveContent()
    const fileName = activeFile ?? 'document.md'

    setStatus(`Exporting…`)
    
    // Generate PDFs in parallel for speed
    const generateTasks = themesToExport.map(async (t) => {
      const html = buildPdfHtml(content, t)
      const blob = await generatePdfBlob(html)
      return { t, blob }
    })
    
    const results = await Promise.all(generateTasks)
    
    // Download them sequentially but they were generated in parallel
    for (const { t, blob } of results) {
      const suffix = theme === 'both' ? `-${t}` : ''
      downloadBlob(blob, mdNameToPdf(fileName, suffix))
      if (themesToExport.length > 1) {
        await new Promise((r) => setTimeout(r, 300)) // slight gap to avoid browser blocking multiple downloads
      }
    }
  })

  // ── Option 2: all files → ZIP of PDFs ─────────────────────────
  const exportAllZip = () => withExporting(async () => {
    const entries = Object.entries(files)
    const zip = new JSZip()
    const themesToExport = theme === 'both' ? ['light', 'dark'] : [theme]

    for (let i = 0; i < entries.length; i++) {
      const [filename, content] = entries[i]
      setStatus(`Generating ${i + 1}/${entries.length}: ${filename}`)
      
      const generateTasks = themesToExport.map(async (t) => {
        const html = buildPdfHtml(content, t)
        const blob = await generatePdfBlob(html)
        return { t, blob }
      })
      
      const results = await Promise.all(generateTasks)
      
      for (const { t, blob } of results) {
        const suffix = theme === 'both' ? `-${t}` : ''
        zip.file(mdNameToPdf(filename, suffix), blob)
      }
    }
    setStatus('Building ZIP…')
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(zipBlob, `markdowntopdf-export${theme !== 'both' ? `-${theme}` : ''}.zip`)
  })

  // ── Option 3: all files → individual PDF downloads ────────────
  const exportAllIndividual = () => withExporting(async () => {
    const entries = Object.entries(files)
    const themesToExport = theme === 'both' ? ['light', 'dark'] : [theme]

    for (let i = 0; i < entries.length; i++) {
      const [filename, content] = entries[i]
      setStatus(`Downloading ${i + 1}/${entries.length}: ${filename}`)
      
      const generateTasks = themesToExport.map(async (t) => {
        const html = buildPdfHtml(content, t)
        const blob = await generatePdfBlob(html)
        return { t, blob }
      })
      
      const results = await Promise.all(generateTasks)
      
      for (const { t, blob } of results) {
        const suffix = theme === 'both' ? `-${t}` : ''
        downloadBlob(blob, mdNameToPdf(filename, suffix))
        await new Promise((r) => setTimeout(r, 300))
      }
    }
  })

  const busy = isExporting

  return (
    <div className="export-menu" ref={menuRef}>
      <button
        className={`export-btn-main ${busy ? 'export-btn-group--busy' : ''}`}
        onClick={() => !busy && setOpen((o) => !o)}
        disabled={busy}
        title="Export options"
        style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
      >
        <Download size={13} />
        {busy ? (status ?? 'Exporting…') : 'Export PDF'}
        <ChevronDown size={13} className={open ? 'rotate-180' : ''} style={{ marginLeft: '4px' }}/>
      </button>

      {open && (
        <div className="export-dropdown">
          <div style={{ padding: '8px 12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Theme:</label>
            <select 
              value={theme} 
              onChange={e => setTheme(e.target.value)}
              style={{
                flex: 1, padding: '4px', borderRadius: '4px', border: '1px solid var(--border)', 
                fontSize: '13px', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none'
              }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="both">Both (Light & Dark)</option>
            </select>
          </div>
          <div className="export-divider" />
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
