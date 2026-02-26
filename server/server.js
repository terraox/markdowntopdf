const express = require("express");
const cors = require("cors");
const generatePdfRouter = require("./routes/generatePdf");

const app = express();
const PORT = process.env.PORT || 6001;

// ── Middleware ──────────────────────────────────────────────────
app.use(
  cors({
    origin: ["http://localhost:6000", "http://127.0.0.1:6000"],
    methods: ["GET", "POST"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Routes ──────────────────────────────────────────────────────
app.use("/api", generatePdfRouter);

// ── Health check ────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 fallback ────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Error handler ───────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[server error]", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// ── Start ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✓ PDF service running on http://localhost:${PORT}`);
});
