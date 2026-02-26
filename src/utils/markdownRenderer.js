import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

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
      } catch (_) {
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

/**
 * Render a Markdown string to an HTML string.
 * @param {string} markdown
 * @returns {string}
 */
export function renderMarkdown(markdown) {
  return md.render(markdown ?? "");
}
