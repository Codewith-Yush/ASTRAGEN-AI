/**
 * Utility helpers for the Astragen AI Output Section
 */

export interface ReadingStats {
  words: number;
  charsWithSpaces: number;
  charsNoSpaces: number;
  paragraphs: number;
  lines: number;
  readingTimeMinutes: number;
  readingTimeString: string;
  speakingTimeString: string;
}

/**
 * Strips Markdown syntax to obtain pure readable plain text
 * Ideal for text-to-speech reading and plain text exports.
 */
export function stripMarkdown(markdown: string): string {
  if (!markdown) return "";
  return markdown
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, (match) => {
      return match.replace(/```[a-z]*\n?/gi, "").replace(/```/g, "");
    })
    // Remove inline code
    .replace(/`([^`]+)`/g, "$1")
    // Remove images
    .replace(/!\[(.*?)\]\(.*?\)/g, "$1")
    // Remove links
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    // Remove headers
    .replace(/^#{1,6}\s+/gm, "")
    // Remove bold/italics
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    // Remove strikethrough
    .replace(/~~(.*?)~~/g, "$1")
    // Remove blockquotes
    .replace(/^\s*>\s+/gm, "")
    // Remove task list checkboxes
    .replace(/^\s*-\s*\[[ xX]\]\s+/gm, "")
    // Remove list bullets
    .replace(/^\s*[-*+]\s+/gm, "")
    // Remove numbered lists markers
    .replace(/^\s*\d+\.\s+/gm, "")
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, "")
    // Condense excessive newlines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Calculates in-depth reading, speaking, and text metrics
 */
export function calculateReadingStats(text: string): ReadingStats {
  if (!text || !text.trim()) {
    return {
      words: 0,
      charsWithSpaces: 0,
      charsNoSpaces: 0,
      paragraphs: 0,
      lines: 0,
      readingTimeMinutes: 0,
      readingTimeString: "< 1 min read",
      speakingTimeString: "< 1 min speech",
    };
  }

  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const charsWithSpaces = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const paragraphs = text
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0).length;
  const lines = text.split(/\n/).length;

  // Average reading speed: 200 words per minute
  const readingMinutes = Math.ceil(words / 200);
  const readingTimeString =
    readingMinutes <= 1 ? "1 min read" : `${readingMinutes} mins read`;

  // Average speaking speed: 130 words per minute
  const speakingMinutes = Math.ceil(words / 130);
  const speakingTimeString =
    speakingMinutes <= 1 ? "1 min speech" : `${speakingMinutes} mins speech`;

  return {
    words,
    charsWithSpaces,
    charsNoSpaces,
    paragraphs,
    lines,
    readingTimeMinutes: readingMinutes,
    readingTimeString,
    speakingTimeString,
  };
}

/**
 * Copies rich formatted HTML to the user's clipboard so they can paste
 * directly into rich-text destinations (Google Docs, Microsoft Word, Gmail, Notion).
 */
export async function copyRichHtml(
  htmlContent: string,
  plainText: string
): Promise<boolean> {
  try {
    if (
      typeof window !== "undefined" &&
      typeof ClipboardItem !== "undefined" &&
      navigator.clipboard?.write
    ) {
      const htmlBlob = new Blob([htmlContent], { type: "text/html" });
      const textBlob = new Blob([plainText], { type: "text/plain" });

      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": htmlBlob,
          "text/plain": textBlob,
        }),
      ]);
      return true;
    } else {
      await navigator.clipboard.writeText(plainText);
      return true;
    }
  } catch (err) {
    console.warn("ClipboardItem write failed, using writeText fallback:", err);
    try {
      await navigator.clipboard.writeText(plainText);
      return true;
    } catch (fallbackErr) {
      console.error("All copy attempts failed:", fallbackErr);
      return false;
    }
  }
}

/**
 * Downloads a string as a client-side file
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
) {
  try {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("File download error:", err);
  }
}

/**
 * Formats Markdown or rendered HTML into an elegant standalone HTML document
 */
export function generateHtmlDocument(
  title: string,
  renderedHtml: string
): string {
  const docTitle = title || "Astragen AI Output";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${docTitle}</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #ffffff;
      --text: #0f172a;
      --accent: #4f46e5;
      --code-bg: #0f172a;
      --border: #e2e8f0;
      --quote-bg: #f8fafc;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0b0f19;
        --text: #f1f5f9;
        --border: #1e293b;
        --quote-bg: #131b2e;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.68;
      max-width: 820px;
      margin: 40px auto;
      padding: 0 24px;
    }
    h1, h2, h3, h4 { color: inherit; font-weight: 700; line-height: 1.3; margin-top: 1.8em; margin-bottom: 0.6em; }
    h1 { font-size: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 0.4em; }
    h2 { font-size: 1.5rem; }
    h3 { font-size: 1.25rem; }
    p, ul, ol { margin: 1em 0; }
    ul, ol { padding-left: 1.6em; }
    li { margin: 0.35em 0; }
    blockquote {
      border-left: 4px solid var(--accent);
      background-color: var(--quote-bg);
      margin: 1.5em 0;
      padding: 12px 18px;
      border-radius: 0 8px 8px 0;
      font-style: italic;
    }
    pre {
      background: var(--code-bg);
      color: #f8fafc;
      padding: 16px;
      border-radius: 10px;
      overflow-x: auto;
      font-size: 0.88rem;
    }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.9em;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1.8em 0;
      font-size: 0.92rem;
    }
    th, td {
      border: 1px solid var(--border);
      padding: 10px 14px;
      text-align: left;
    }
    th {
      background-color: rgba(79, 70, 229, 0.08);
      font-weight: 600;
    }
    tr:nth-child(even) {
      background-color: rgba(0, 0, 0, 0.02);
    }
    hr {
      border: none;
      border-top: 1px solid var(--border);
      margin: 2em 0;
    }
    .footer {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
      font-size: 0.8rem;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
  <header style="margin-bottom: 2rem;">
    <div style="font-size: 0.85rem; font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: 0.05em;">Generated by Astragen AI</div>
    <h1 style="margin-top: 0.3em;">${docTitle}</h1>
  </header>
  <main>
    ${renderedHtml}
  </main>
  <footer class="footer">
    Generated with Astragen AI Studio
  </footer>
</body>
</html>`;
}

/**
 * Triggers browser print formatted specifically for clean PDF export / hardcopy
 */
export function printDocument(title: string, renderedHtml: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to print or export PDF.");
    return;
  }

  const content = generateHtmlDocument(title, renderedHtml);
  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();

  // Wait for resources/styles to settle then trigger print
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 350);
}

/**
 * Uses Web Share API if supported, falls back to boolean false
 */
export async function shareContent(
  title: string,
  text: string
): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: title || "Astragen AI Output",
        text: text,
      });
      return true;
    } catch (err: any) {
      if (err.name === "AbortError") return false;
      console.warn("Web Share API failed:", err);
      return false;
    }
  }
  return false;
}
