import mermaid from "mermaid";

let currentTheme = null;

export function initMermaid(isDark = false) {
  const theme = isDark ? "dark" : "default";
  if (currentTheme === theme) return;

  mermaid.initialize({
    startOnLoad: false,
    theme: theme,
    securityLevel: "loose",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    fontSize: 15,
    flowchart: {
      useMaxWidth: false,
      htmlLabels: true,
      curve: "basis",
      nodeSpacing: 45,
      rankSpacing: 45,
      padding: 15,
    },
    themeVariables: isDark
      ? {
          darkMode: true,
          background: "transparent",
          mainBkg: "#1e293b",
          nodeBorder: "#475569",
          nodeTextColor: "#f8fafc",
          primaryColor: "#1e293b",
          primaryTextColor: "#f8fafc",
          primaryBorderColor: "#475569",
          lineColor: "#94a3b8",
          secondaryColor: "#334155",
          tertiaryColor: "#0f172a",
          edgeLabelBackground: "#1e293b",
          clusterBkg: "#0f172a",
          titleColor: "#f8fafc",
        }
      : {
          darkMode: false,
          background: "transparent",
          mainBkg: "#ffffff",
          nodeBorder: "#cbd5e1",
          nodeTextColor: "#0f172a",
          primaryColor: "#f8fafc",
          primaryTextColor: "#0f172a",
          primaryBorderColor: "#cbd5e1",
          lineColor: "#64748b",
          secondaryColor: "#f1f5f9",
          tertiaryColor: "#ffffff",
          edgeLabelBackground: "#ffffff",
          clusterBkg: "#f8fafc",
          titleColor: "#0f172a",
        },
  });

  currentTheme = theme;
}

let counter = 0;

/**
 * Render all .mermaid elements within a container element.
 * @param {HTMLElement} container
 * @param {boolean} isDark
 */
export async function renderMermaidDiagrams(container, isDark = false) {
  if (!container) return;

  initMermaid(isDark);

  const mermaidNodes = container.querySelectorAll(".mermaid");
  if (!mermaidNodes.length) return;

  for (const node of mermaidNodes) {
    // If already rendered, skip unless theme changed
    if (node.dataset.rendered === "true" && node.dataset.theme === (isDark ? "dark" : "light")) {
      continue;
    }

    const rawCode = node.dataset.rawCode || node.textContent.trim();
    if (!rawCode) continue;

    node.dataset.rawCode = rawCode;
    node.dataset.theme = isDark ? "dark" : "light";

    const id = `mermaid-svg-${Date.now()}-${counter++}`;
    try {
      const { svg } = await mermaid.render(id, rawCode);
      node.innerHTML = svg;
      
      // Enhance SVG attributes for responsive, readable scaling
      const svgEl = node.querySelector("svg");
      if (svgEl) {
        svgEl.removeAttribute("height");
        // Ensure max-width doesn't artificially shrink the diagram
        if (svgEl.style.maxWidth) {
          svgEl.style.maxWidth = "100%";
        }
      }
      
      node.dataset.rendered = "true";
    } catch (err) {
      console.warn("Mermaid render error:", err);
      const tempEl = document.getElementById(id) || document.getElementById(`d${id}`);
      if (tempEl) tempEl.remove();

      node.innerHTML = `<div class="mermaid-error">Diagram error: ${err?.message || "Invalid syntax"}</div><pre class="mermaid-raw"><code>${rawCode}</code></pre>`;
      node.dataset.rendered = "error";
    }
  }
}
