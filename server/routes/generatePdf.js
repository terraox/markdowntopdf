const express = require("express");
const puppeteer = require("puppeteer");

const router = express.Router();

// ── Persistent browser (launch once, reuse across requests) ────
let browser = null;

async function getBrowser() {
  if (browser && browser.connected) return browser;
  browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  browser.on("disconnected", () => { browser = null; });
  return browser;
}

// ── POST /api/generate-pdf ──────────────────────────────────────
// Body: { html: string, options?: { format, margin, printBackground } }
// Returns: application/pdf binary
router.post("/generate-pdf", async (req, res) => {
  const { html, options = {} } = req.body;

  if (!html || typeof html !== "string") {
    return res.status(400).json({ error: "`html` string is required" });
  }

  const {
    format = "A4",
    printBackground = true,
    margin = { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
  } = options;

  let page;
  try {
    const b = await getBrowser();
    page = await b.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfData = await page.pdf({ format, printBackground, margin });

    // Puppeteer v21+ returns Uint8Array — normalise to Buffer
    const pdfBuffer = Buffer.isBuffer(pdfData) ? pdfData : Buffer.from(pdfData);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="document.pdf"',
      "Content-Length": pdfBuffer.length,
    });

    res.end(pdfBuffer);
  } catch (err) {
    console.error("[generate-pdf error]", err);
    res.status(500).json({ error: err.message || "PDF generation failed" });
  } finally {
    if (page && !page.isClosed()) await page.close();
  }
});

module.exports = router;

