import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, prism } from "react-syntax-highlighter/dist/cjs/styles/prism";
import {
  Copy,
  CheckCircle,
  Download,
  Maximize2,
  Minimize2,
  PenLine,
  ChevronDown,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import PropTypes from "prop-types";
import { debounce } from "lodash";

// Utility functions extracted to a separate file
const sanitizeHTML = (html: string): string => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(
      /onerror|onclick|onload|onmouseover|onmouseout|onmousedown|onmouseup|onfocus|onblur|onkeydown|onkeypress|onkeyup/gi,
      ""
    );
};

const convertMarkdownToHTML = (markdown: string): string => {
  const lines = markdown.split("\n");
  let html = lines
    .map((line) => {
      if (/^### (.*)$/.test(line)) return `<h3>${line.replace(/^### (.*)$/, "$1")}</h3>`;
      if (/^## (.*)$/.test(line)) return `<h2>${line.replace(/^## (.*)$/, "$1")}</h2>`;
      if (/^# (.*)$/.test(line)) return `<h1>${line.replace(/^# (.*)$/, "$1")}</h1>`;
      if (/\*\*(.*)\*\*/.test(line)) return line.replace(/\*\*(.*)\*\*/g, "<strong>$1</strong>");
      if (/\*(.*)\*/.test(line)) return line.replace(/\*(.*)\*/g, "<em>$1</em>");
      if (/```([^`]+)```/.test(line)) return `<pre><code>${line.replace(/```([^`]+)```/, "$1")}</code></pre>`;
      if (/`([^`]+)`/.test(line)) return line.replace(/`([^`]+)`/g, "<code>$1</code>");
      if (/$$ ([^ $$]+)\]$$ ([^)]+) $$/.test(line)) return line.replace(/$$ ([^ $$]+)\]$$ ([^)]+) $$/g, '<a href="$2">$1</a>');
      if (/^- (.*)$/.test(line)) return `<li>${line.replace(/^- (.*)$/, "$1")}</li>`;
      if (/^\d+\. (.*)$/.test(line)) return `<li>${line.replace(/^\d+\. (.*)$/, "$1")}</li>`;
      return line.trim() ? `<p>${line}</p>` : "<br>";
    })
    .join("\n");

  // Wrap lists appropriately
  html = html.replace(/(<li>.*<\/li>)+/g, (match) => {
    const isOrdered = match.includes("1. ");
    return `<${isOrdered ? "ol" : "ul"} class="list-disc pl-6 my-4 space-y-2">${match}</${isOrdered ? "ol" : "ul"}>`;
  });

  return html;
};

const downloadFile = (
  content: string,
  extension: string,
  mimeType: string,
  fileName: string
) => {
  try {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Download failed. Please try again.");
  }
};

// Interfaces
interface WordCount {
  words: number;
  chars: number;
}

interface OutputSectionProps {
  aiOutput: string;
  title?: string;
  onEdit?: (newContent: string) => void;
  readOnly?: boolean;
  theme?: "light" | "dark";
  showWordCount?: boolean;
  isHTML?: boolean;
}

// Markdown component types
interface MarkdownComponentProps {
  children: React.ReactNode;
  className?: string;
  node?: any;
  inline?: boolean;
}

// Common styles
const MARKDOWN_CLASSES = `
  prose max-w-none
  prose-headings:font-semibold
  prose-h1:text-2xl prose-h1:font-bold prose-h1:mt-6 prose-h1:mb-4 prose-h1:pb-1 prose-h1:border-b
  prose-h2:text-xl prose-h2:font-bold prose-h2:mt-5 prose-h2:mb-3
  prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-4 prose-h3:mb-2
  prose-p:leading-relaxed prose-p:mb-4
  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
  prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4
  prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4 prose-ul:space-y-2
  prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4 prose-ol:space-y-2
  prose-li:mb-1
  prose-table:min-w-full prose-table:my-6 prose-table:border prose-table:rounded-md
  prose-thead:bg-gray-50
  prose-tbody:divide-y
  prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:text-xs prose-th:font-medium prose-th:text-gray-500 prose-th:uppercase prose-th:tracking-wider
  prose-td:px-4 prose-td:py-3 prose-td:text-sm prose-td:text-gray-800
  prose-tr:hover:bg-gray-50
`;

// Memoized Header Component
const Header: React.FC<{
  title: string;
  showWordCount: boolean;
  wordCount: WordCount;
  theme: "light" | "dark";
}> = memo(({ title, showWordCount, wordCount, theme }) => (
  <div
    className={`flex justify-between items-center px-4 py-3 border-b transition-colors ${
      theme === "dark" ? "bg-gray-800" : "bg-gray-50"
    }`}
  >
    <div className="flex items-center gap-2">
      <FileText className="w-5 h-5 text-blue-500" />
      <h2
        className="text-lg font-semibold truncate"
        style={{ maxWidth: "50vw" }}
      >
        {title}
        {showWordCount && (
          <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
            {wordCount.words} words • {wordCount.chars} characters
          </span>
        )}
      </h2>
    </div>
  </div>
));

// Memoized ActionButtons Component
const ActionButtons: React.FC<{
  isEditing: boolean;
  readOnly: boolean;
  copied: boolean;
  isFullscreen: boolean;
  theme: "light" | "dark";
  toggleEditMode: () => void;
  handleCopy: () => void;
  toggleFullscreen: () => void;
}> = memo(
  ({
    isEditing,
    readOnly,
    copied,
    isFullscreen,
    theme,
    toggleEditMode,
    handleCopy,
    toggleFullscreen,
  }) => (
    <div className="flex gap-2 items-center">
      {!isEditing && !readOnly && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleEditMode}
          title="Edit content"
          aria-label="Edit content"
          className={`${
            theme === "dark"
              ? "text-gray-400 hover:text-gray-100"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <PenLine className="w-4 h-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        title="Copy content"
        aria-label="Copy content"
        className={`${
          theme === "dark"
            ? "text-gray-400 hover:text-gray-100"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        {copied ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleFullscreen}
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        className={`${
          theme === "dark"
            ? "text-gray-400 hover:text-gray-100"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        {isFullscreen ? (
          <Minimize2 className="w-4 h-4" />
        ) : (
          <Maximize2 className="w-4 h-4" />
        )}
      </Button>
    </div>
  )
);

// Memoized DownloadMenu Component
const DownloadMenu: React.FC<{
  showDownloadOptions: boolean;
  contentType: "html" | "markdown";
  theme: "light" | "dark";
  toggleDownloadOptions: () => void;
  handleDownloadMarkdown: () => void;
  handleDownloadPDF: () => void;
}> = memo(
  ({
    showDownloadOptions,
    contentType,
    theme,
    toggleDownloadOptions,
    handleDownloadMarkdown,
    handleDownloadPDF,
  }) => {
    const downloadOptionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          showDownloadOptions &&
          downloadOptionsRef.current &&
          !downloadOptionsRef.current.contains(event.target as Node)
        ) {
          toggleDownloadOptions();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showDownloadOptions, toggleDownloadOptions]);

    return (
      <div className="relative" ref={downloadOptionsRef}>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDownloadOptions}
          title="Download options"
          aria-label="Download options"
          className={`flex items-center ${
            theme === "dark"
              ? "text-gray-400 hover:text-gray-100"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Download className="w-4 h-4" />
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
        {showDownloadOptions && (
          <div
            className={`absolute right-0 top-full mt-1 rounded-md shadow-lg z-50 border w-40 overflow-hidden ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <button
              className={`flex items-center w-full px-3 py-2 text-sm text-left ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={handleDownloadMarkdown}
            >
              {contentType === "html" ? "HTML (.html)" : "Markdown (.md)"}
            </button>
            <button
              className={`flex items-center w-full px-3 py-2 text-sm text-left border-t ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-gray-700 border-gray-700"
                  : "text-gray-700 hover:bg-gray-100 border-gray-200"
              }`}
              onClick={handleDownloadPDF}
            >
              PDF (.pdf)
            </button>
          </div>
        )}
      </div>
    );
  }
);

// Memoized ContentArea Component
const ContentArea: React.FC<{
  isEditing: boolean;
  content: string;
  contentType: "html" | "markdown";
  theme: "light" | "dark";
  isFullscreen: boolean;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  toggleEditMode: () => void;
  editorRef: React.RefObject<HTMLTextAreaElement>;
}> = memo(
  ({
    isEditing,
    content,
    contentType,
    theme,
    isFullscreen,
    handleChange,
    toggleEditMode,
    editorRef,
  }) => {
    const markdownComponents: Record<string, React.FC<MarkdownComponentProps>> = {
      code: ({ node, className, children, inline }) => {
        const match = /language-(\w+)/.exec(className || "");
        return !inline && match ? (
          <div className="relative group mb-6 mt-4">
            <div
              className={`flex items-center justify-between px-4 py-1 text-xs rounded-t-md border-t border-r border-l ${
                theme === "dark"
                  ? "bg-gray-800 text-gray-300 border-gray-700"
                  : "bg-gray-100 text-gray-600 border-gray-200"
              }`}
            >
              <span>{match[1]}</span>
              <button
                className={`p-1 rounded transition-colors ${
                  theme === "dark"
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-200"
                }`}
                onClick={() => navigator.clipboard.writeText(String(children))}
                aria-label="Copy code"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <SyntaxHighlighter
              style={theme === "dark" ? vscDarkPlus : prism}
              language={match[1]}
              PreTag="div"
              className="rounded-t-none rounded-b-md mt-0 pt-4 pb-4 border-r border-b border-l border-gray-200 dark:border-gray-700"
              customStyle={{ margin: 0, fontSize: "0.9rem" }}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          </div>
        ) : (
          <code
            className={`px-1 py-0.5 rounded text-sm ${
              theme === "dark" ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            {children}
          </code>
        );
      },
      blockquote: ({ children }) => (
        <blockquote
          className={`border-l-4 border-blue-500 pl-4 italic my-4 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {children}
        </blockquote>
      ),
      ul: ({ children }) => (
        <ul className="list-disc pl-6 my-4 space-y-2">{children}</ul>
      ),
      ol: ({ children }) => (
        <ol className="list-decimal pl-6 my-4 space-y-2">{children}</ol>
      ),
      li: ({ children }) => <li className="mb-1">{children}</li>,
      h1: ({ children }) => (
        <h1
          className={`text-2xl font-bold mt-6 mb-4 pb-1 border-b ${
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>
      ),
      table: ({ children }) => (
        <div className="overflow-x-auto my-6 rounded-md border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            {children}
          </table>
        </div>
      ),
      thead: ({ children }) => (
        <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>
      ),
      tbody: ({ children }) => (
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {children}
        </tbody>
      ),
      tr: ({ children }) => (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
          {children}
        </tr>
      ),
      th: ({ children }) => (
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
          {children}
        </td>
      ),
    };

    return (
      <div
        className={`${
          isFullscreen
            ? "h-[calc(100vh-120px)]"
            : "h-auto max-h-[calc(100vh-200px)] min-h-[200px]"
        } transition-all duration-300`}
      >
        {isEditing ? (
          <div className="p-1 h-full">
            <Textarea
              ref={editorRef}
              value={content}
              onChange={handleChange}
              placeholder="Edit content here..."
              className={`w-full h-[calc(100%-2.5rem)] p-4 font-mono text-sm resize-none focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                theme === "dark"
                  ? "bg-gray-900 text-gray-100 border-gray-700"
                  : "bg-white text-gray-800 border-gray-200"
              }`}
            />
            <div className="flex justify-end mt-2 px-4 pb-2">
              <Button
                size="sm"
                variant="outline"
                onClick={toggleEditMode}
                aria-label="Finish editing"
                className="text-gray-600 border-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                Done Editing
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={`overflow-auto h-full ${
              theme === "dark" ? "bg-gray-950" : "bg-gray-50"
            } transition-colors`}
          >
            <div
              className={`p-4 sm:p-6 m-2 rounded-lg shadow-sm border ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-100"
              }`}
            >
              {contentType === "html" ? (
                <div
                  className={`${MARKDOWN_CLASSES} ${
                    theme === "dark" ? "prose-invert" : ""
                  }`}
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }}
                />
              ) : (
                <div
                  className={`${MARKDOWN_CLASSES} ${
                    theme === "dark" ? "prose-invert" : ""
                  }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

const OutputSection: React.FC<OutputSectionProps> = ({
  aiOutput,
  title = "AI Output",
  onEdit,
  readOnly = false,
  theme = "light",
  showWordCount = false,
  isHTML = false,
}) => {
  const [content, setContent] = useState(aiOutput);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [wordCount, setWordCount] = useState<WordCount>({ words: 0, chars: 0 });
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [contentType, setContentType] = useState<"html" | "markdown">(
    "markdown"
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Determine content type
  const determineContentType = useCallback(
    (content: string): "html" | "markdown" => {
      return isHTML || /<\/?[a-z][\s\S]*>/i.test(content) ? "html" : "markdown";
    },
    [isHTML]
  );

  // Calculate word count
  const calculateWordCount = useCallback(
    (content: string, type: "html" | "markdown") => {
      if (!showWordCount) return { words: 0, chars: 0 };

      let cleanText = content;
      if (type === "html") {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = content;
        cleanText = tempDiv.textContent || tempDiv.innerText || "";
      } else {
        cleanText = content
          .replace(/```[\s\S]*?```/g, "")
          .replace(/\*\*|__|\*|_|~~|`/g, "");
      }

      const words = cleanText.trim().split(/\s+/).filter((word) => word.length > 0).length || 0;
      const chars = cleanText.replace(/\s/g, "").length || 0;
      return { words, chars };
    },
    [showWordCount]
  );

  // Memoized file name
  const getFileName = useMemo(
    () =>
      `${title.toLowerCase().replace(/\s+/g, "-")}-${new Date()
        .toISOString()
        .slice(0, 10)}`,
    [title]
  );

  // Initialize content
  useEffect(() => {
    setContent(aiOutput);
    const type = determineContentType(aiOutput);
    setContentType(type);
    setWordCount(calculateWordCount(aiOutput, type));
  }, [aiOutput, determineContentType, calculateWordCount]);

  // Handle fullscreen mode
  useEffect(() => {
    document.body.style.overflow = isFullscreen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isFullscreen]);

  // Focus editor when editing
  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.focus();
    }
  }, [isEditing]);

  // Event handlers
  const handleChange = useMemo(
    () =>
      debounce((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setContent(newContent);
        if (onEdit) onEdit(newContent);
        setWordCount(calculateWordCount(newContent, contentType));
      }, 300),
    [onEdit, calculateWordCount, contentType]
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy content:", err);
      alert("Failed to copy content.");
    }
  }, [content]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditing((prev) => !prev);
  }, []);

  const toggleDownloadOptions = useCallback(() => {
    setShowDownloadOptions((prev) => !prev);
  }, []);

  const handleDownloadMarkdown = useCallback(() => {
    downloadFile(
      content,
      contentType === "html" ? "html" : "md",
      contentType === "html" ? "text/html" : "text/markdown",
      getFileName
    );
    setShowDownloadOptions(false);
  }, [content, contentType, getFileName]);

  const handleDownloadPDF = useCallback(() => {
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please enable pop-ups to download PDF.");
        return;
      }

      const htmlContent =
        contentType === "html"
          ? sanitizeHTML(content)
          : convertMarkdownToHTML(content);

      printWindow.document.open();
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
            }
            h1, h2, h3 { margin-top: 1.5em; margin-bottom: 0.5em; }
            h1 { font-size: 2em; }
            h2 { font-size: 1.5em; }
            h3 { font-size: 1.2em; }
            p { margin-bottom: 1em; }
            pre {
              background: #f5f5f5;
              padding: 1em;
              border-radius: 4px;
              overflow-x: auto;
              font-family: monospace;
            }
            code {
              background: #f5f5f5;
              padding: 0.2em 0.4em;
              border-radius: 3px;
              font-family: monospace;
            }
            ul, ol { padding-left: 2em; }
            @media print {
              body { font-size: 12pt; }
              @page { margin: 1.5cm; }
            }
            @media screen and (max-width: 640px) {
              body { padding: 10px; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div id="content">${htmlContent}</div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                document.title = "${getFileName}";
                window.print();
              }, 500);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("PDF generation failed. Please try again.");
    }
    setShowDownloadOptions(false);
  }, [content, contentType, title, getFileName]);

  return (
    <div
      ref={containerRef}
      className={`bg-background border rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 m-1 sm:m-2" : "w-full"
      } ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
    >
      <Header
        title={title}
        showWordCount={showWordCount}
        wordCount={wordCount}
        theme={theme}
      />
      <div className="flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-gray-800">
        <div />
        <div className="flex gap-2">
          <DownloadMenu
            showDownloadOptions={showDownloadOptions}
            contentType={contentType}
            theme={theme}
            toggleDownloadOptions={toggleDownloadOptions}
            handleDownloadMarkdown={handleDownloadMarkdown}
            handleDownloadPDF={handleDownloadPDF}
          />
          <ActionButtons
            isEditing={isEditing}
            readOnly={readOnly}
            copied={copied}
            isFullscreen={isFullscreen}
            theme={theme}
            toggleEditMode={toggleEditMode}
            handleCopy={handleCopy}
            toggleFullscreen={toggleFullscreen}
          />
        </div>
      </div>
      <ContentArea
        isEditing={isEditing}
        content={content}
        contentType={contentType}
        theme={theme}
        isFullscreen={isFullscreen}
        handleChange={handleChange}
        toggleEditMode={toggleEditMode}
        editorRef={editorRef}
      />
    </div>
  );
};

// PropTypes for runtime validation
OutputSection.propTypes = {
  aiOutput: PropTypes.string.isRequired,
  title: PropTypes.string,
  onEdit: PropTypes.func,
  readOnly: PropTypes.bool,
  theme: PropTypes.oneOf(["light", "dark"]),
  showWordCount: PropTypes.bool,
  isHTML: PropTypes.bool,
};

export default OutputSection;