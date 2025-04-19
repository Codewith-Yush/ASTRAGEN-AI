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
  FileText,
  Bold,
  Italic,
  List,
  Link,
  Undo,
  Redo,
  Search,
  Image,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import PropTypes from "prop-types";
import { debounce } from "lodash";
import html2canvas from "html2canvas";

// Utility functions
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
      if (/$$   ([^   $$]+)\]$$   ([^)]+)   $$/.test(line)) return line.replace(/$$   ([^   $$]+)\]$$   ([^)]+)   $$/g, '<a href="$2">$1</a>');
      if (/^- (.*)$/.test(line)) return `<li>${line.replace(/^- (.*)$/, "$1")}</li>`;
      if (/^\d+\. (.*)$/.test(line)) return `<li>${line.replace(/^\d+\. (.*)$/, "$1")}</li>`;
      return line.trim() ? `<p>${line}</p>` : "<br>";
    })
    .join("\n");

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

interface MarkdownComponentProps {
  children: React.ReactNode;
  className?: string;
  node?: any;
  inline?: boolean;
}

interface ContentAreaProps {
  isEditing: boolean;
  content: string;
  contentType: "html" | "markdown";
  theme: "light" | "dark";
  isFullscreen: boolean;
  handleChange: (e: ContentEditableEvent) => void;
  toggleEditMode: () => void;
  editorRef: React.RefObject<HTMLElement>;
  contentRef: React.RefObject<HTMLDivElement>;
  onSave?: (newContent: string) => void;
  undo: () => void;
  redo: () => void;
  history: string[];
  historyIndex: number;
  showFindReplace: boolean;
  toggleFindReplace: () => void;
  handleFindReplace: (find: string, replace: string) => void;
  autosaveStatus: "idle" | "saving" | "saved";
}

// Common styles
const MARKDOWN_CLASSES = `
  prose max-w-none
  prose-headings:font-semibold
  prose-h1:text-3xl prose-h1:font-bold prose-h1:mt-8 prose-h1:mb-4
  prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-3
  prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-4 prose-h3:mb-2
  prose-p:leading-relaxed prose-p:mb-4 prose-p:text-gray-700 dark:prose-p:text-gray-200
  prose-a:text-teal-500 prose-a:no-underline hover:prose-a:underline
  prose-blockquote:border-l-4 prose-blockquote:border-teal-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4
  prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4 prose-ul:space-y-2
  prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4 prose-ol:space-y-2
  prose-li:mb-1
  prose-table:min-w-full prose-table:my-6 prose-table:border prose-table:rounded-lg
  prose-thead:bg-gray-100 dark:prose-thead:bg-gray-800
  prose-tbody:divide-y
  prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:text-xs prose-th:font-medium prose-th:text-gray-500 dark:prose-th:text-gray-400 prose-th:uppercase
  prose-td:px-4 prose-td:py-3 prose-td:text-sm prose-td:text-gray-800 dark:prose-td:text-gray-200
  prose-tr:hover:bg-gray-50 dark:prose-tr:hover:bg-gray-800/50
`;

// Memoized Header Component
const Header: React.FC<{
  title: string;
  showWordCount: boolean;
  wordCount: WordCount;
  theme: "light" | "dark";
  toggleWordCount: () => void;
}> = memo(({ title, showWordCount, wordCount, theme, toggleWordCount }) => (
  <div
    className={`flex justify-between items-center px-4 py-3 transition-colors ${
      theme === "dark" ? "bg-gray-900" : "bg-white"
    }`}
  >
    <div className="flex items-center gap-2">
      <FileText className="w-5 h-5 text-teal-500" />
      <h2 className="text-lg font-semibold truncate max-w-[50vw]">
        {title}
        {showWordCount && (
          <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
            {wordCount.words} words • {wordCount.chars} chars
          </span>
        )}
      </h2>
    </div>
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleWordCount}
      title={showWordCount ? "Hide word count" : "Show word count"}
      className={`${
        theme === "dark"
          ? "text-gray-400 hover:text-teal-400 hover:bg-gray-800"
          : "text-gray-600 hover:text-teal-500 hover:bg-gray-100"
      } rounded-full`}
    >
      <FileText className="w-4 h-4" />
    </Button>
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
  toggleTheme: () => void;
  toggleFindReplace: () => void;
  handleExportImage: () => void;
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
    toggleTheme,
    toggleFindReplace,
    handleExportImage,
  }) => (
    <div className="flex gap-1 items-center">
      {!isEditing && !readOnly && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleEditMode}
          title="Edit content"
          className={`${
            theme === "dark"
              ? "text-gray-400 hover:text-teal-400 hover:bg-gray-800"
              : "text-gray-600 hover:text-teal-500 hover:bg-gray-100"
          } transition-colors rounded-full`}
        >
          <PenLine className="w-4 h-4" />
        </Button>
      )}
      {isEditing && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFindReplace}
          title="Find and replace"
          className={`${
            theme === "dark"
              ? "text-gray-400 hover:text-teal-400 hover:bg-gray-800"
              : "text-gray-600 hover:text-teal-500 hover:bg-gray-100"
          } transition-colors rounded-full`}
        >
          <Search className="w-4 h-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        title="Copy content"
        className={`${
          theme === "dark"
            ? "text-gray-400 hover:text-teal-400 hover:bg-gray-800"
            : "text-gray-600 hover:text-teal-500 hover:bg-gray-100"
        } transition-colors rounded-full`}
      >
        {copied ? (
          <CheckCircle className="w-4 h-4 text-teal-500 animate-pulse" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleExportImage}
        title="Export as image"
        className={`${
          theme === "dark"
            ? "text-gray-400 hover:text-teal-400 hover:bg-gray-800"
            : "text-gray-600 hover:text-teal-500 hover:bg-gray-100"
        } transition-colors rounded-full`}
      >
        <Image className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
        className={`${
          theme === "dark"
            ? "text-gray-400 hover:text-teal-400 hover:bg-gray-800"
            : "text-gray-600 hover:text-teal-500 hover:bg-gray-100"
        } transition-colors rounded-full`}
      >
        <Palette className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleFullscreen}
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        className={`${
          theme === "dark"
            ? "text-gray-400 hover:text-teal-400 hover:bg-gray-800"
            : "text-gray-600 hover:text-teal-500 hover:bg-gray-100"
        } transition-colors rounded-full`}
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
          size="icon"
          onClick={toggleDownloadOptions}
          title="Download options"
          className={`flex items-center ${
            theme === "dark"
              ? "text-gray-400 hover:text-teal-400 hover:bg-gray-800"
              : "text-gray-600 hover:text-teal-500 hover:bg-gray-100"
          } transition-colors rounded-full`}
        >
          <Download className="w-4 h-4" />
        </Button>
        {showDownloadOptions && (
          <div
            className={`absolute right-0 top-full mt-2 rounded-lg shadow-lg z-50 w-40 overflow-hidden transform transition-all duration-200 ease-in-out ${
              theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-100"
            } ${showDownloadOptions ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
          >
            <button
              className={`flex items-center w-full px-3 py-2 text-sm text-left transition-colors ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={handleDownloadMarkdown}
            >
              {contentType === "html" ? "HTML" : "Markdown"}
            </button>
            <button
              className={`flex items-center w-full px-3 py-2 text-sm text-left transition-colors ${
                theme === "dark"
                  ? "text-gray-300 hover:bg-gray-700 border-t border-gray-700"
                  : "text-gray-700 hover:bg-gray-100 border-t border-gray-100"
              }`}
              onClick={handleDownloadPDF}
            >
              PDF
            </button>
          </div>
        )}
      </div>
    );
  }
);

// Find and Replace Component
const FindReplace: React.FC<{
  theme: "light" | "dark";
  handleFindReplace: (find: string, replace: string) => void;
  toggleFindReplace: () => void;
}> = ({ theme, handleFindReplace, toggleFindReplace }) => {
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  const handleSubmit = () => {
    if (findText) {
      handleFindReplace(findText, replaceText);
      setFindText("");
      setReplaceText("");
    }
  };

  return (
    <div
      className={`flex gap-2 p-2 border-b ${
        theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <input
        type="text"
        value={findText}
        onChange={(e) => setFindText(e.target.value)}
        placeholder="Find..."
        className={`flex-1 p-2 text-sm rounded-lg outline-none ${
          theme === "dark"
            ? "bg-gray-800 text-gray-200 border-gray-600"
            : "bg-gray-100 text-gray-800 border-gray-200"
        } border focus:ring-2 focus:ring-teal-500`}
      />
      <input
        type="text"
        value={replaceText}
        onChange={(e) => setReplaceText(e.target.value)}
        placeholder="Replace with..."
        className={`flex-1 p-2 text-sm rounded-lg outline-none ${
          theme === "dark"
            ? "bg-gray-800 text-gray-200 border-gray-600"
            : "bg-gray-100 text-gray-800 border-gray-200"
        } border focus:ring-2 focus:ring-teal-500`}
      />
      <Button
        variant="default"
        size="sm"
        onClick={handleSubmit}
        className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
      >
        Replace
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={toggleFindReplace}
        className="text-gray-600 border-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800"
      >
        Close
      </Button>
    </div>
  );
};

// Toolbar Component
const EditorToolbar: React.FC<{
  editorRef: React.RefObject<HTMLElement>;
  theme: "light" | "dark";
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  autosaveStatus: "idle" | "saving" | "saved";
}> = ({ editorRef, theme, undo, redo, canUndo, canRedo, autosaveStatus }) => {
  const applyFormatting = (prefix: string, suffix: string) => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    if (!selectedText) return;

    const newText = `${prefix}${selectedText}${suffix}`;
    document.execCommand("insertText", false, newText);
    selection.removeAllRanges();
  };

  const insertList = (type: "ul" | "ol") => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const listItem = type === "ul" ? "- Item\n" : "1. Item\n";
    document.execCommand("insertText", false, listItem);
  };

  const insertLink = () => {
    const url = prompt("Enter the URL:");
    if (url) {
      const linkText = prompt("Enter the link text:") || "Link";
      document.execCommand("insertText", false, `[${linkText}](${url})`);
    }
  };

  return (
    <div
      className={`flex gap-1 p-2 sticky top-0 z-10 items-center ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      }`}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={undo}
        disabled={!canUndo}
        title="Undo"
        className={`${
          theme === "dark"
            ? "text-gray-400 hover:text-teal-400 hover:bg-gray-800"
            : "text-gray-600 hover:text-teal-500 hover:bg-gray-100"
        } rounded-full ${!canUndo ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <Undo className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={redo}
        disabled={!canRedo}
        title="Redo"
        className={`${
          theme === "dark"
            ? "text-gray-400 hover:text-teal-400 hover:bg-gray-800"
            : "text-gray-600 hover:text-teal-500 hover:bg-gray-100"
        } rounded-full ${!canRedo ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <Redo className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => applyFormatting("**", "**")}
        title="Bold"
        className={`${
          theme === "dark"
            ? "text-gray-400 hover:text-teal-400 hover:bg-gray-800"
            : "text-gray-600 hover:text-teal-500 hover:bg-gray-100"
        } rounded-full`}
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => applyFormatting("*", "*")}
        title="Italic"
        className={`${
          theme === "dark"
            ? "text-gray-400 hover:text-teal-400 hover:bg-gray-800"
            : "text-gray-600 hover:text-teal-500 hover:bg-gray-100"
        } rounded-full`}
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => insertList("ul")}
        title="Bullet List"
        className={`${
          theme === "dark"
            ? "text-gray-400 hover:text-teal-400 hover:bg-gray-800"
            : "text-gray-600 hover:text-teal-500 hover:bg-gray-100"
        } rounded-full`}
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={insertLink}
        title="Insert Link"
        className={`${
          theme === "dark"
            ? "text-gray-400 hover:text-teal-400 hover:bg-gray-800"
            : "text-gray-600 hover:text-teal-500 hover:bg-gray-100"
        } rounded-full`}
      >
        <Link className="w-4 h-4" />
      </Button>
      <span
        className={`ml-auto text-xs ${
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        } ${
          autosaveStatus === "saving"
            ? "text-yellow-500"
            : autosaveStatus === "saved"
            ? "text-teal-500"
            : ""
        }`}
      >
        {autosaveStatus === "saving"
          ? "Saving..."
          : autosaveStatus === "saved"
          ? "Saved"
          : ""}
      </span>
    </div>
  );
};

// Memoized ContentArea Component
const ContentArea: React.FC<ContentAreaProps> = memo(
  ({
    isEditing,
    content,
    contentType,
    theme,
    isFullscreen,
    handleChange,
    toggleEditMode,
    editorRef,
    contentRef,
    onSave,
    undo,
    redo,
    history,
    historyIndex,
    showFindReplace,
    toggleFindReplace,
    handleFindReplace,
    autosaveStatus,
  }) => {
    const markdownComponents: Record<string, React.FC<MarkdownComponentProps>> = {
      code: ({ node, className, children, inline }) => {
        const match = /language-(\w+)/.exec(className || "");
        return !inline && match ? (
          <div className="relative group mb-6 mt-4">
            <div
              className={`flex items-center justify-between px-4 py-1 text-xs rounded-t-lg ${
                theme === "dark"
                  ? "bg-gray-800 text-gray-300"
                  : "bg-gray-100 text-gray-600"
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
              className="rounded-b-lg mt-0 pt-4 pb-4"
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
          className={`border-l-4 border-teal-500 pl-4 italic my-4 ${
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
        <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="text-xl font-semibold mt-4 mb-2">{children}</h3>
      ),
      table: ({ children }) => (
        <div className="overflow-x-auto my-6 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            {children}
          </table>
        </div>
      ),
      thead: ({ children }) => (
        <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>
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

    const handleSave = () => {
      if (onSave) {
        onSave(content);
      }
      toggleEditMode();
    };

    return (
      <div
        className={`${
          isFullscreen ? "h-[calc(100vh-100px)]" : "h-auto min-h-[400px]"
        } transition-all duration-300 flex flex-col font-sans`}
      >
        {isEditing ? (
          <>
            {showFindReplace && (
              <FindReplace
                theme={theme}
                handleFindReplace={handleFindReplace}
                toggleFindReplace={toggleFindReplace}
              />
            )}
            <EditorToolbar
              editorRef={editorRef}
              theme={theme}
              undo={undo}
              redo={redo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              autosaveStatus={autosaveStatus}
            />
            <div className="flex-1 flex overflow-hidden">
              <div className="w-1/2 p-4 overflow-auto">
                <ContentEditable
                  innerRef={editorRef}
                  html={content}
                  onChange={handleChange}
                  disabled={false}
                  className={`w-full h-full p-4 font-mono text-sm outline-none focus:ring-2 focus:ring-teal-500 rounded-lg ${
                    theme === "dark"
                      ? "bg-gray-900 text-gray-100"
                      : "bg-white text-gray-800"
                  }`}
                />
              </div>
              <div className="w-1/2 p-4 overflow-auto">
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
              </div>
            </div>
            <div
              className={`flex justify-end gap-2 p-4 sticky bottom-0 z-20 ${
                theme === "dark" ? "bg-gray-900" : "bg-white"
              }`}
            >
              <Button
                variant="outline"
                onClick={toggleEditMode}
                className="px-4 py-2 text-gray-600 border-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSave}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
              >
                Save
              </Button>
            </div>
          </>
        ) : (
          <div
            className={`flex-1 overflow-auto ${
              theme === "dark" ? "bg-gray-900" : "bg-white"
            } transition-colors`}
            ref={contentRef}
          >
            <div className={`p-6 m-2 rounded-lg ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
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
  theme: initialTheme = "light",
  showWordCount: initialShowWordCount = false,
  isHTML = false,
}) => {
  const [content, setContent] = useState(aiOutput);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [wordCount, setWordCount] = useState<WordCount>({ words: 0, chars: 0 });
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [contentType, setContentType] = useState<"html" | "markdown">(
    isHTML ? "html" : "markdown"
  );
  const [history, setHistory] = useState<string[]>([aiOutput]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [theme, setTheme] = useState<"light" | "dark">(initialTheme);
  const [showWordCount, setShowWordCount] = useState(initialShowWordCount);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
    []
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
    setHistory([aiOutput]);
    setHistoryIndex(0);
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

  // Autosave effect
  useEffect(() => {
    if (isEditing && autosaveStatus === "saving" && onEdit) {
      const timer = setTimeout(() => {
        onEdit(content);
        setAutosaveStatus("saved");
        setTimeout(() => setAutosaveStatus("idle"), 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autosaveStatus, content, isEditing, onEdit]);

  // Event handlers
  const handleChange = useMemo(
    () =>
      debounce((e: ContentEditableEvent) => {
        const newContent = e.target.value;
        setContent(newContent);
        setWordCount(calculateWordCount(newContent, contentType));
        setHistory((prev) => {
          const newHistory = prev.slice(0, historyIndex + 1);
          return [...newHistory, newContent].slice(-50); // Limit history to 50 entries
        });
        setHistoryIndex((prev) => prev + 1);
        setAutosaveStatus("saving");
      }, 500),
    [calculateWordCount, contentType, historyIndex]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setContent(history[historyIndex - 1]);
      setWordCount(calculateWordCount(history[historyIndex - 1], contentType));
    }
  }, [history, historyIndex, contentType, calculateWordCount]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setContent(history[historyIndex + 1]);
      setWordCount(calculateWordCount(history[historyIndex + 1], contentType));
    }
  }, [history, historyIndex, contentType, calculateWordCount]);

  const handleFindReplace = useCallback(
    (find: string, replace: string) => {
      const newContent = content.replace(new RegExp(find, "g"), replace);
      setContent(newContent);
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        return [...newHistory, newContent].slice(-50);
      });
      setHistoryIndex((prev) => prev + 1);
      setWordCount(calculateWordCount(newContent, contentType));
      setAutosaveStatus("saving");
    },
    [content, historyIndex, contentType, calculateWordCount]
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
    setShowFindReplace(false);
  }, []);

  const toggleDownloadOptions = useCallback(() => {
    setShowDownloadOptions((prev) => !prev);
  }, []);

  const toggleFindReplace = useCallback(() => {
    setShowFindReplace((prev) => !prev);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const toggleWordCount = useCallback(() => {
    setShowWordCount((prev) => !prev);
  }, []);

  const handleExportImage = useCallback(async () => {
    if (!contentRef.current) return;
    try {
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: theme === "dark" ? "#1F2937" : "#FFFFFF",
        scale: 2,
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${getFileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export image:", err);
      alert("Failed to export image.");
    }
  }, [getFileName, theme]);

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
              font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
            }
            h1 { font-size: 2em; margin: 1.5em 0 0.5em; }
            h2 { font-size: 1.5em; margin: 1.2em 0 0.4em; }
            h3 { font-size: 1.2em; margin: 1em 0 0.3em; }
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
            ul, ol { padding-left: 2em; margin: 1em 0; }
            @media print {
              body { font-size: 12pt; }
              @page { margin: 1.5cm; }
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
      className={`rounded-xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 m-2" : "w-full"
      } ${theme === "dark" ? "bg-gray-900" : "bg-white"} shadow-lg`}
    >
      <Header
        title={title}
        showWordCount={showWordCount}
        wordCount={wordCount}
        theme={theme}
        toggleWordCount={toggleWordCount}
      />
      <div className="flex justify-end items-center px-4 py-2">
        <div className="flex gap-1">
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
            toggleTheme={toggleTheme}
            toggleFindReplace={toggleFindReplace}
            handleExportImage={handleExportImage}
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
        contentRef={contentRef}
        onSave={onEdit}
        undo={undo}
        redo={redo}
        history={history}
        historyIndex={historyIndex}
        showFindReplace={showFindReplace}
        toggleFindReplace={toggleFindReplace}
        handleFindReplace={handleFindReplace}
        autosaveStatus={autosaveStatus}
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