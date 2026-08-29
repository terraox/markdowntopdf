import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import taskLists from "markdown-it-task-lists";
import katex from "katex";

/**
 * KaTeX Math Plugin for markdown-it
 * Supports:
 *   - Inline math: $...$
 *   - Block/Display math: $$...$$
 */
function mathPlugin(md) {
  // Inline math rule ($...$)
  md.inline.ruler.after("escape", "math_inline", (state, silent) => {
    if (state.src.charCodeAt(state.pos) !== 0x24 /* $ */) {
      return false;
    }

    // Check if double $$ (block math handled separately or fallback)
    if (state.src.charCodeAt(state.pos + 1) === 0x24) {
      return false;
    }

    const start = state.pos + 1;
    let match = start;
    let pos = start;

    while ((match = state.src.indexOf("$", pos)) !== -1) {
      // Check for escaped \$
      let backslashes = 0;
      let check = match - 1;
      while (check >= 0 && state.src.charCodeAt(check) === 0x5c /* \ */) {
        backslashes++;
        check--;
      }
      if (backslashes % 2 === 0) {
        break;
      }
      pos = match + 1;
    }

    if (match === -1) {
      return false;
    }

    if (match - start === 0) {
      return false;
    }

    const content = state.src.slice(start, match);

    // Guard against currency amounts like $20 to $30
    if (/^\s/.test(content) || /\s$/.test(content)) {
      // TeX rule: inline math should not have leading/trailing whitespace
      // But allow if enclosed properly
    }

    if (!silent) {
      const token = state.push("math_inline", "math", 0);
      token.markup = "$";
      token.content = content.trim();
    }

    state.pos = match + 1;
    return true;
  });

  // Block math rule ($$...$$)
  md.block.ruler.after("blockquote", "math_block", (state, startLine, endLine, silent) => {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];

    if (pos + 2 > max) return false;
    if (state.src.charCodeAt(pos) !== 0x24 || state.src.charCodeAt(pos + 1) !== 0x24) {
      return false;
    }

    pos += 2;
    let firstLine = state.src.slice(pos, max);

    if (silent) return true;

    let haveEndMarker = false;
    let nextLine = startLine;

    // Check if closing $$ is on the same line
    if (firstLine.trim().endsWith("$$") && firstLine.trim().length > 2) {
      firstLine = firstLine.trim().slice(0, -2);
      haveEndMarker = true;
    }

    let lines = [];
    if (firstLine.trim()) {
      lines.push(firstLine);
    }

    if (!haveEndMarker) {
      for (;;) {
        nextLine++;
        if (nextLine >= endLine) break;

        pos = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];
        const lineText = state.src.slice(pos, max);

        if (lineText.trim().startsWith("$$") || lineText.trim().endsWith("$$")) {
          const contentPart = lineText.trim().replace(/^\$\$|\$\$$/g, "");
          if (contentPart) lines.push(contentPart);
          haveEndMarker = true;
          break;
        }

        lines.push(lineText);
      }
    }

    state.line = nextLine + 1;

    const token = state.push("math_block", "math", 0);
    token.block = true;
    token.content = lines.join("\n").trim();
    token.map = [startLine, state.line];
    token.markup = "$$";

    return true;
  });

  md.renderer.rules.math_inline = (tokens, idx) => {
    const content = tokens[idx].content;
    try {
      return katex.renderToString(content, {
        displayMode: false,
        throwOnError: false,
      });
    } catch (err) {
      return `<span class="katex-error" title="${md.utils.escapeHtml(err.message)}">${md.utils.escapeHtml(content)}</span>`;
    }
  };

  md.renderer.rules.math_block = (tokens, idx) => {
    const content = tokens[idx].content;
    try {
      return `<div class="katex-display-block">${katex.renderToString(content, {
        displayMode: true,
        throwOnError: false,
      })}</div>`;
    } catch (err) {
      return `<div class="katex-error-block" title="${md.utils.escapeHtml(err.message)}">${md.utils.escapeHtml(content)}</div>`;
    }
  };
}

/**
 * Callouts / Admonitions Plugin
 * Detects blockquotes starting with:
 *   - > [!TIP] or > Tip:
 *   - > [!NOTE] or > Note:
 *   - > [!WARNING] or > Warning:
 *   - > [!IMPORTANT] or > Important:
 *   - > [!CAUTION] or > Caution:
 */
function calloutsPlugin(md) {
  const defaultBlockquoteOpen = md.renderer.rules.blockquote_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
  const defaultBlockquoteClose = md.renderer.rules.blockquote_close || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

  md.core.ruler.after("block", "callouts_processor", (state) => {
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === "blockquote_open") {
        // Look inside blockquote for paragraph_open followed by inline
        const nextIdx = i + 1;
        if (nextIdx < tokens.length && tokens[nextIdx].type === "paragraph_open") {
          const inlineIdx = nextIdx + 1;
          if (inlineIdx < tokens.length && tokens[inlineIdx].type === "inline") {
            const inlineToken = tokens[inlineIdx];
            const text = inlineToken.content;
            
            const match = text.match(/^(?:\[!(TIP|NOTE|WARNING|IMPORTANT|CAUTION)\]|(?:\*\*)?(Tip|Note|Warning|Important|Caution)(?:\*\*)?:\s*)/i);
            if (match) {
              const type = (match[1] || match[2]).toLowerCase();
              tokens[i].meta = { isCallout: true, calloutType: type };
              
              // Remove the prefix from the first inline content
              const prefixLen = match[0].length;
              if (inlineToken.children && inlineToken.children.length > 0) {
                const firstChild = inlineToken.children[0];
                if (firstChild.type === "text") {
                  firstChild.content = firstChild.content.slice(prefixLen).trimStart();
                }
              }
              inlineToken.content = inlineToken.content.slice(prefixLen).trimStart();
            }
          }
        }
      }
    }
  });

  md.renderer.rules.blockquote_open = (tokens, idx, options, env, self) => {
    if (tokens[idx].meta?.isCallout) {
      const type = tokens[idx].meta.calloutType;
      const titles = {
        tip: "Tip",
        note: "Note",
        warning: "Warning",
        important: "Important",
        caution: "Caution",
      };
      const title = titles[type] || "Tip";
      return `<div class="callout-card callout-${type}"><div class="callout-header"><span class="callout-icon"></span><span class="callout-title">${title}</span></div><div class="callout-body">`;
    }
    return defaultBlockquoteOpen(tokens, idx, options, env, self);
  };

  md.renderer.rules.blockquote_close = (tokens, idx, options, env, self) => {
    // Check corresponding open token
    let openIdx = idx - 1;
    let count = 0;
    while (openIdx >= 0) {
      if (tokens[openIdx].type === "blockquote_close") count++;
      if (tokens[openIdx].type === "blockquote_open") {
        if (count === 0) break;
        count--;
      }
      openIdx--;
    }
    if (openIdx >= 0 && tokens[openIdx].meta?.isCallout) {
      return `</div></div>`;
    }
    return defaultBlockquoteClose(tokens, idx, options, env, self);
  };
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          `<pre class="hljs-pre"><code class="hljs language-${lang}">` +
          hljs.highlight(code, { language: lang, ignoreIllegals: true }).value +
          "</code></pre>"
        );
      } catch {
        /* fall through */
      }
    }
    return (
      '<pre class="hljs-pre"><code class="hljs">' +
      md.utils.escapeHtml(code) +
      "</code></pre>"
    );
  },
});

// Explicit fence rule for mermaid to prevent it from being wrapped in <pre><code>
const defaultFence = md.renderer.rules.fence;
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const info = token.info ? token.info.trim().split(/\s+/)[0] : "";

  if (info === "mermaid") {
    return `<div class="mermaid-wrapper"><div class="mermaid">${md.utils.escapeHtml(token.content)}</div></div>\n`;
  }

  return defaultFence(tokens, idx, options, env, self);
};

// Register plugins
md.use(taskLists, { enabled: true, label: true, labelAfter: true });
md.use(mathPlugin);
md.use(calloutsPlugin);

/**
 * Render a Markdown string to an HTML string with KaTeX, Mermaid, TaskLists & Callouts.
 * @param {string} markdown
 * @returns {string}
 */
export function renderMarkdown(markdown) {
  return md.render(markdown ?? "");
}
