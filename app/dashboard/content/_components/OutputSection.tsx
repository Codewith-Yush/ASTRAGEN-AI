"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import dynamic from "next/dynamic";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import {
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
  PenLine,
  Eye,
  Sparkles,
  FileText,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Square,
  Search,
  X,
  Columns,
  Share2,
  Printer,
  RotateCcw,
  RotateCw,
  Wand2,
  ListOrdered,
  List,
  CheckSquare,
  Type,
  ChevronDown,
  ExternalLink,
  Clock,
  Mic,
  FileCode,
  Trash2,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  Table,
  Loader2,
  Sliders,
  ChevronUp,
} from "lucide-react";
import {
  stripMarkdown,
  calculateReadingStats,
  copyRichHtml,
  downloadFile,
  generateHtmlDocument,
  printDocument,
  shareContent,
} from "./outputUtils";

const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((mod) => mod.Prism),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 bg-slate-900 text-slate-300 font-mono text-xs">
        Loading code syntax...
      </div>
    ),
  }
);

interface OutputSectionProps {
  aiOutput: string;
  title?: string;
  templateName?: string;
  onEdit?: (newContent: string) => void;
  loading?: boolean;
  onStop?: () => void;
  readOnly?: boolean;
  theme?: "light" | "dark";
  showWordCount?: boolean;
  isHTML?: boolean;
}

type ViewMode = "preview" | "edit" | "split" | "raw";
type FontSize = "sm" | "base" | "lg";

interface ToastState {
  message: string;
  type?: "info" | "success" | "warning" | "error";
}

// Code Block with macOS styling, language badge, and dedicated copy button
function CodeBlockComponent({
  language,
  value,
}: {
  language: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy code snippet:", e);
    }
  };

  return (
    <div className="rounded-xl overflow-hidden my-4 border border-slate-700/60 bg-[#141824] shadow-md group">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0B0F19] border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="font-mono text-slate-400 font-semibold uppercase text-[11px] ml-1 tracking-wider">
            {language || "code"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopyCode}
          aria-label="Copy code block"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 opacity-70" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="overflow-x-auto text-xs md:text-sm">
        <SyntaxHighlighter
          style={vscDarkPlus as any}
          language={language || "text"}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: "1rem",
            fontSize: "0.85rem",
            lineHeight: "1.6",
            background: "transparent",
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

// Text Highlighter for in-preview search matches
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query || !query.trim() || !text) return <>{text}</>;
  const cleanQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${cleanQuery})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <mark
            key={i}
            className="bg-amber-300 dark:bg-amber-400/80 text-slate-950 font-medium px-1 rounded-sm shadow-sm"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function OutputSection({
  aiOutput,
  title = "AI Output",
  templateName,
  onEdit,
  loading = false,
  onStop,
  readOnly = false,
  theme = "light",
  showWordCount = true,
}: OutputSectionProps) {
  // Modes & View state
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("base");

  // History for manual edits & original AI snapshot
  const [originalSnapshot, setOriginalSnapshot] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isInternalChangeRef = useRef(false);

  // Dropdown menus
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showRefineMenu, setShowRefineMenu] = useState(false);
  const [showStatsDrawer, setShowStatsDrawer] = useState(false);

  // Search in output
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [matchCount, setMatchCount] = useState(0);

  // AI Refine state
  const [isRefining, setIsRefining] = useState(false);
  const [refineCustomPrompt, setRefineCustomPrompt] = useState("");
  const [lastRefinedSnapshot, setLastRefinedSnapshot] = useState<string | null>(
    null
  );

  // Text to Speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1);

  // Toast feedback
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dom references
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Store original AI output when first generated
  useEffect(() => {
    if (aiOutput && !originalSnapshot && !loading) {
      setOriginalSnapshot(aiOutput);
      setHistory([aiOutput]);
      setHistoryIndex(0);
    }
  }, [aiOutput, originalSnapshot, loading]);

  // Capture original snapshot only when generation completes, not on every streaming token
  const wasLoadingRef = useRef(false);
  useEffect(() => {
    if (wasLoadingRef.current && !loading && aiOutput) {
      setOriginalSnapshot(aiOutput);
      setHistory([aiOutput]);
      setHistoryIndex(0);
    }
    wasLoadingRef.current = loading;
  }, [loading, aiOutput]);

  // Esc key to exit fullscreen or search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showSearch) {
          setShowSearch(false);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        if (aiOutput) {
          e.preventDefault();
          setShowSearch((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, showSearch, aiOutput]);

  // Toast trigger helper
  const showToast = useCallback(
    (message: string, type: ToastState["type"] = "info") => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      setToast({ message, type });
      toastTimeoutRef.current = setTimeout(() => {
        setToast(null);
      }, 2600);
    },
    []
  );

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-menu-container]")) {
        setShowCopyMenu(false);
        setShowExportMenu(false);
        setShowRefineMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute text & reading statistics
  const stats = useMemo(() => {
    return calculateReadingStats(aiOutput);
  }, [aiOutput]);

  // Count search query matches
  useEffect(() => {
    if (!searchQuery.trim() || !aiOutput) {
      setMatchCount(0);
      return;
    }
    try {
      const clean = searchQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(clean, "gi");
      const matches = aiOutput.match(regex);
      setMatchCount(matches ? matches.length : 0);
    } catch {
      setMatchCount(0);
    }
  }, [searchQuery, aiOutput]);

  // Content change handler with undo/redo stack
  const handleContentChange = useCallback(
    (newVal: string) => {
      if (!onEdit) return;
      onEdit(newVal);

      // Record to undo stack if user-driven
      if (!isInternalChangeRef.current) {
        setHistory((prev) => {
          const upToCurrent = prev.slice(0, historyIndex + 1);
          return [...upToCurrent, newVal];
        });
        setHistoryIndex((prev) => prev + 1);
      }
    },
    [onEdit, historyIndex]
  );

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      isInternalChangeRef.current = true;
      onEdit?.(history[newIdx]);
      setHistoryIndex(newIdx);
      setTimeout(() => {
        isInternalChangeRef.current = false;
      }, 50);
      showToast("Undone", "info");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      isInternalChangeRef.current = true;
      onEdit?.(history[newIdx]);
      setHistoryIndex(newIdx);
      setTimeout(() => {
        isInternalChangeRef.current = false;
      }, 50);
      showToast("Redone", "info");
    }
  };

  const handleResetToOriginal = () => {
    if (!originalSnapshot) return;
    if (window.confirm("Revert content to the original AI generated version?")) {
      handleContentChange(originalSnapshot);
      showToast("Reverted to original AI draft", "success");
    }
  };

  // Text insertion / formatting helper in editor
  const handleInsertFormat = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea || !onEdit) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const selected = current.substring(start, end);

    const replacement = `${prefix}${selected || "text"}${suffix}`;
    const nextContent =
      current.substring(0, start) + replacement + current.substring(end);

    handleContentChange(nextContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected ? selected.length : 4)
      );
    }, 20);
  };

  // Text-to-Speech handler
  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      showToast("Speech synthesis not supported in this browser.", "warning");
      return;
    }
    const synth = window.speechSynthesis;

    if (isSpeaking && !isPaused) {
      synth.pause();
      setIsPaused(true);
      showToast("Audio paused", "info");
      return;
    }

    if (isSpeaking && isPaused) {
      synth.resume();
      setIsPaused(false);
      showToast("Audio resumed", "info");
      return;
    }

    synth.cancel();
    const plainText = stripMarkdown(aiOutput);
    if (!plainText) {
      showToast("No readable text found to play", "warning");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = speechRate;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      showToast("Playing audio readout...", "info");
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    synth.speak(utterance);
  };

  const handleStopSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    showToast("Audio stopped", "info");
  };

  const handleCycleSpeechRate = () => {
    const nextRate =
      speechRate === 1 ? 1.25 : speechRate === 1.25 ? 1.5 : speechRate === 1.5 ? 0.8 : 1;
    setSpeechRate(nextRate);
    if (isSpeaking) {
      handleStopSpeech();
      setTimeout(handleToggleSpeech, 100);
    }
    showToast(`Speech rate: ${nextRate}x`, "info");
  };

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Copy Handlers
  const handleCopyMarkdown = async () => {
    if (!aiOutput) return;
    try {
      await navigator.clipboard.writeText(aiOutput);
      showToast("Copied Markdown to clipboard!", "success");
      setShowCopyMenu(false);
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  const handleCopyPlainText = async () => {
    if (!aiOutput) return;
    try {
      const clean = stripMarkdown(aiOutput);
      await navigator.clipboard.writeText(clean);
      showToast("Copied clean plain text!", "success");
      setShowCopyMenu(false);
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  const handleCopyRichHtml = async () => {
    if (!aiOutput) return;
    try {
      const htmlContent = previewRef.current?.innerHTML || `<p>${aiOutput}</p>`;
      const plainText = stripMarkdown(aiOutput);
      const success = await copyRichHtml(htmlContent, plainText);
      if (success) {
        showToast("Copied Rich Text! Paste directly into Docs or Word.", "success");
      } else {
        showToast("Copied plain text fallback", "info");
      }
      setShowCopyMenu(false);
    } catch {
      showToast("Failed to copy rich text", "error");
    }
  };

  // Download Handlers
  const fileBaseName = useMemo(() => {
    const slug = (templateName || title || "astragen-content")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return slug || "astragen-output";
  }, [templateName, title]);

  const handleDownloadMarkdown = () => {
    if (!aiOutput) return;
    downloadFile(aiOutput, `${fileBaseName}.md`, "text/markdown");
    showToast(`Downloaded ${fileBaseName}.md`, "success");
    setShowExportMenu(false);
  };

  const handleDownloadText = () => {
    if (!aiOutput) return;
    const clean = stripMarkdown(aiOutput);
    downloadFile(clean, `${fileBaseName}.txt`, "text/plain");
    showToast(`Downloaded ${fileBaseName}.txt`, "success");
    setShowExportMenu(false);
  };

  const handleDownloadHtml = () => {
    if (!aiOutput) return;
    const innerHtml = previewRef.current?.innerHTML || `<pre>${aiOutput}</pre>`;
    const fullHtml = generateHtmlDocument(title, innerHtml);
    downloadFile(fullHtml, `${fileBaseName}.html`, "text/html");
    showToast(`Downloaded ${fileBaseName}.html`, "success");
    setShowExportMenu(false);
  };

  const handlePrintPdf = () => {
    if (!aiOutput) return;
    const innerHtml = previewRef.current?.innerHTML || `<pre>${aiOutput}</pre>`;
    printDocument(title, innerHtml);
    setShowExportMenu(false);
    showToast("Opening Print / Save as PDF dialog...", "info");
  };

  const handleShare = async () => {
    if (!aiOutput) return;
    const plain = stripMarkdown(aiOutput);
    const shared = await shareContent(title, plain);
    if (shared) {
      showToast("Shared successfully", "success");
    } else {
      handleCopyMarkdown();
    }
  };

  // AI Refine actions
  const handleRefine = async (
    action:
      | "summarize"
      | "expand"
      | "professional"
      | "casual"
      | "bullet_points"
      | "fix_grammar"
      | "simplify"
      | "custom",
    customInstruction?: string
  ) => {
    if (!aiOutput || !onEdit || isRefining) return;

    setLastRefinedSnapshot(aiOutput);
    setIsRefining(true);
    setShowRefineMenu(false);
    showToast("Astragen AI is refining your content...", "info");

    try {
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: aiOutput,
          action,
          customPrompt: customInstruction,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to refine content");
      }

      if (!response.body) {
        throw new Error("Streaming refinement not supported");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        onEdit(accumulated);
      }

      setHistory((prev) => [...prev, accumulated]);
      setHistoryIndex((prev) => prev + 1);
      showToast("AI Refinement complete!", "success");
    } catch (err: any) {
      console.error("Refine error:", err);
      showToast(err.message || "Refinement failed", "error");
      if (lastRefinedSnapshot) {
        onEdit(lastRefinedSnapshot);
      }
    } finally {
      setIsRefining(false);
    }
  };

  const handleUndoRefine = () => {
    if (!lastRefinedSnapshot || !onEdit) return;
    onEdit(lastRefinedSnapshot);
    setLastRefinedSnapshot(null);
    showToast("Reverted AI refinement", "info");
  };

  // Typography font size class
  const fontSizeClass =
    fontSize === "sm"
      ? "text-xs md:text-sm"
      : fontSize === "lg"
      ? "text-base md:text-lg"
      : "text-sm md:text-base";

  return (
    <div
      ref={containerRef}
      className={`
        bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-sm flex flex-col transition-all duration-200 relative
        ${
          isFullscreen
            ? "fixed inset-0 z-50 rounded-none shadow-2xl overflow-hidden bg-white dark:bg-[#0A0E17]"
            : "min-h-[620px] h-full"
        }
      `}
    >
      {/* Toast Notification */}
      {toast && (
        <div className="absolute top-4 right-4 z-50 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`
              flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-lg backdrop-blur-md border
              ${
                toast.type === "success"
                  ? "bg-emerald-500/95 text-white border-emerald-400"
                  : toast.type === "warning"
                  ? "bg-amber-500/95 text-slate-950 border-amber-400"
                  : toast.type === "error"
                  ? "bg-rose-500/95 text-white border-rose-400"
                  : "bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 border-slate-700 dark:border-slate-300"
              }
            `}
          >
            {toast.type === "success" && <Check className="w-4 h-4" />}
            {toast.type === "warning" && <Sliders className="w-4 h-4" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Top Header Toolbar */}
      <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 flex-wrap bg-slate-50/50 dark:bg-slate-900/40 rounded-t-2xl">
        {/* Left: Title & Mode Toggles */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block line-clamp-1">
                {title}
              </span>
            </div>
          </div>

          {/* Mode Switcher */}
          {aiOutput && (
            <div className="flex items-center rounded-xl bg-slate-200/70 dark:bg-slate-800/80 p-0.5 border border-slate-300/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                title="Rich Preview"
                className={`
                  flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all
                  ${
                    viewMode === "preview"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }
                `}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("edit")}
                title="Editor Mode"
                className={`
                  flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all
                  ${
                    viewMode === "edit"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }
                `}
              >
                <PenLine className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("split")}
                title="Split Side-by-Side View"
                className={`
                  flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all
                  ${
                    viewMode === "split"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }
                `}
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Split</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("raw")}
                title="Plain Raw Text"
                className={`
                  flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all
                  ${
                    viewMode === "raw"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }
                `}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Raw</span>
              </button>
            </div>
          )}

          {/* Revert / Edit Indicator */}
          {aiOutput && originalSnapshot && aiOutput !== originalSnapshot && (
            <button
              type="button"
              onClick={handleResetToOriginal}
              title="Reset content to the original AI generated version"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Original</span>
            </button>
          )}

          {/* Active Live Streaming Indicator */}
          {loading && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>Streaming AI response...</span>
            </div>
          )}
        </div>

        {/* Right Action Tools Toolbar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {aiOutput ? (
            <>
              {/* Stop Generation Button when streaming */}
              {loading && onStop && (
                <button
                  type="button"
                  onClick={onStop}
                  title="Stop Generating Content"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors shadow-sm"
                >
                  <Square className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>Stop</span>
                </button>
              )}

              {/* Text-to-Speech Controls */}
              <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-0.5">
                <button
                  type="button"
                  onClick={handleToggleSpeech}
                  title={
                    isSpeaking
                      ? isPaused
                        ? "Resume Audio"
                        : "Pause Audio"
                      : "Listen (Text-to-Speech)"
                  }
                  aria-label="Text to speech toggle"
                  className={`
                    p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5
                    ${
                      isSpeaking
                        ? "bg-indigo-600 text-white"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }
                  `}
                >
                  {isSpeaking ? (
                    isPaused ? (
                      <Play className="w-3.5 h-3.5" />
                    ) : (
                      <Pause className="w-3.5 h-3.5" />
                    )
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline text-[11px] font-semibold">
                    {isSpeaking ? (isPaused ? "Resume" : "Pause") : "Listen"}
                  </span>
                </button>

                {isSpeaking && (
                  <>
                    <button
                      type="button"
                      onClick={handleStopSpeech}
                      title="Stop Audio Readout"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 transition-colors"
                    >
                      <Square className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCycleSpeechRate}
                      title="Cycle speed: 1x, 1.25x, 1.5x, 0.8x"
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                    >
                      {speechRate}x
                    </button>
                  </>
                )}
              </div>

              {/* Search Toggle */}
              <button
                type="button"
                onClick={() => setShowSearch((prev) => !prev)}
                title="Find in Output (Ctrl+F)"
                className={`
                  p-2 rounded-xl text-xs font-medium border transition-colors
                  ${
                    showSearch
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
                      : "bg-slate-100 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200"
                  }
                `}
              >
                <Search className="w-3.5 h-3.5" />
              </button>

              {/* AI Refine Dropdown */}
              <div className="relative" data-menu-container>
                <button
                  type="button"
                  onClick={() => setShowRefineMenu((prev) => !prev)}
                  title="Refine with AI (Summarize, Polish, Change Tone)"
                  disabled={isRefining}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 shadow-sm
                    ${
                      isRefining
                        ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-400 border-indigo-300 cursor-wait"
                        : showRefineMenu
                        ? "bg-indigo-600 text-white border-indigo-700"
                        : "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 hover:border-indigo-400"
                    }
                  `}
                >
                  {isRefining ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5" />
                  )}
                  <span>Refine</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {/* Refine Dropdown Menu */}
                {showRefineMenu && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#121827] border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2">
                    <div className="px-2 py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        Quick AI Refinement
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Transform or polish current content with Gemini AI
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleRefine("summarize")}
                        className="px-2.5 py-2 text-left rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        ⚡ Shorter
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRefine("expand")}
                        className="px-2.5 py-2 text-left rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        📖 Expand
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRefine("professional")}
                        className="px-2.5 py-2 text-left rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        💼 Professional
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRefine("casual")}
                        className="px-2.5 py-2 text-left rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        ☕ Casual
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRefine("bullet_points")}
                        className="px-2.5 py-2 text-left rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        📌 Bullet Points
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRefine("fix_grammar")}
                        className="px-2.5 py-2 text-left rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        ✨ Fix Grammar
                      </button>
                    </div>

                    {/* Custom Instruction Box */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={refineCustomPrompt}
                          onChange={(e) => setRefineCustomPrompt(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && refineCustomPrompt.trim()) {
                              handleRefine("custom", refineCustomPrompt);
                            }
                          }}
                          placeholder="Custom: e.g. Add key metrics..."
                          className="flex-1 px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          disabled={!refineCustomPrompt.trim()}
                          onClick={() =>
                            handleRefine("custom", refineCustomPrompt)
                          }
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold disabled:opacity-40 transition-colors"
                        >
                          Go
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Copy Dropdown */}
              <div className="relative" data-menu-container>
                <button
                  type="button"
                  onClick={() => setShowCopyMenu((prev) => !prev)}
                  title="Copy options"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 transition-colors shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {showCopyMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#121827] border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                    <button
                      type="button"
                      onClick={handleCopyMarkdown}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <FileCode className="w-3.5 h-3.5 text-indigo-500" />
                      <div>
                        <div className="font-semibold">Copy Markdown</div>
                        <div className="text-[10px] text-slate-400">
                          Raw markdown with formatting
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyRichHtml}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      <div>
                        <div className="font-semibold">Copy Rich Text</div>
                        <div className="text-[10px] text-slate-400">
                          Ready for Docs, Word & Gmail
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyPlainText}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <div>
                        <div className="font-semibold">Copy Clean Text</div>
                        <div className="text-[10px] text-slate-400">
                          Stripped of all markdown symbols
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Export / Download Dropdown */}
              <div className="relative" data-menu-container>
                <button
                  type="button"
                  onClick={() => setShowExportMenu((prev) => !prev)}
                  title="Export & Download options"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#121827] border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                    <button
                      type="button"
                      onClick={handleDownloadMarkdown}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <FileCode className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Download Markdown (.md)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadText}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Download Plain Text (.txt)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadHtml}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Download Web Page (.html)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrintPdf}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <Printer className="w-3.5 h-3.5 text-purple-500" />
                      <span>Print / Save as PDF</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Share */}
              <button
                type="button"
                onClick={handleShare}
                title="Share Output"
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>

              {/* Font Size Toggle */}
              <button
                type="button"
                onClick={() =>
                  setFontSize((prev) =>
                    prev === "sm" ? "base" : prev === "base" ? "lg" : "sm"
                  )
                }
                title={`Font Size: ${
                  fontSize === "sm" ? "Small" : fontSize === "lg" ? "Large" : "Default"
                }`}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 transition-colors"
              >
                <Type className="w-3.5 h-3.5" />
              </button>

              {/* Fullscreen */}
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Mode"}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 transition-colors"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium px-2 py-1">
              {loading ? "Generating..." : "Awaiting prompt inputs"}
            </span>
          )}
        </div>
      </div>

      {/* Undo Refine Banner */}
      {lastRefinedSnapshot && (
        <div className="px-5 py-2 bg-indigo-50/80 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>AI Refinement applied to content.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndoRefine}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Undo Refinement
            </button>
            <span className="text-slate-400">|</span>
            <button
              type="button"
              onClick={() => setLastRefinedSnapshot(null)}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* In-Output Search Bar */}
      {showSearch && aiOutput && (
        <div className="px-5 py-2.5 bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-900/50 flex items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find in content..."
              className="w-full bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="flex items-center gap-3 text-xs">
            {searchQuery && (
              <span className="font-mono text-amber-800 dark:text-amber-300 font-semibold">
                {matchCount} {matchCount === 1 ? "match" : "matches"}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
              }}
              className="p-1 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Markdown Editing Helper Toolbar (Only shown in Edit or Split mode) */}
      {(viewMode === "edit" || viewMode === "split") && aiOutput && !readOnly && (
        <div className="px-4 py-2 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/20 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleInsertFormat("**", "**")}
              title="Bold (**text**)"
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleInsertFormat("*", "*")}
              title="Italic (*text*)"
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-3.5 bg-slate-300 dark:bg-slate-700 mx-1" />
            <button
              type="button"
              onClick={() => handleInsertFormat("## ")}
              title="Heading 2 (## Heading)"
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleInsertFormat("### ")}
              title="Heading 3 (### Heading)"
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-3.5 bg-slate-300 dark:bg-slate-700 mx-1" />
            <button
              type="button"
              onClick={() => handleInsertFormat("- ")}
              title="Bullet list (- item)"
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleInsertFormat("1. ")}
              title="Numbered list (1. item)"
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleInsertFormat("- [ ] ")}
              title="Task checklist (- [ ] task)"
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-3.5 bg-slate-300 dark:bg-slate-700 mx-1" />
            <button
              type="button"
              onClick={() => handleInsertFormat("> ")}
              title="Blockquote (> quote)"
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleInsertFormat("`", "`")}
              title="Inline Code (`code`)"
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <FileCode className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleInsertFormat("```\n", "\n```")}
              title="Code Block"
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo edit"
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo edit"
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 p-5 md:p-6 overflow-y-auto min-h-[460px]">
        {loading && !aiOutput ? (
          // Thinking / Generating Initial State
          <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center p-8 space-y-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/25 animate-pulse">
                <Sparkles className="w-8 h-8 animate-spin [animation-duration:6s]" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
              </span>
            </div>

            <div className="space-y-2 max-w-sm">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Astragen AI is drafting your content...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Formulating structured headings, crisp explanations, and tailored
                responses using Google Gemini AI.
              </p>
            </div>

            {/* Shimmering Skeleton Lines */}
            <div className="w-full max-w-md space-y-2.5 pt-2">
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4 mx-auto animate-pulse" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-full mx-auto animate-pulse [animation-delay:0.15s]" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-5/6 mx-auto animate-pulse [animation-delay:0.3s]" />
            </div>

            {onStop && (
              <button
                type="button"
                onClick={onStop}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Cancel Generation</span>
              </button>
            )}
          </div>
        ) : aiOutput ? (
          // Content Present
          <>
            {/* 1. Preview Mode */}
            {viewMode === "preview" && (
              <div
                ref={previewRef}
                className={`prose dark:prose-invert max-w-none ${fontSizeClass} text-slate-800 dark:text-slate-200 leading-relaxed`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || "");
                      const codeString = String(children).replace(/\n$/, "");

                      if (!inline && match) {
                        return (
                          <CodeBlockComponent
                            language={match[1]}
                            value={codeString}
                          />
                        );
                      }

                      return (
                        <code
                          className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-md text-[0.88em] font-mono border border-indigo-200/50 dark:border-indigo-800/50 font-medium"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    table({ node, ...props }: any) {
                      return (
                        <div className="overflow-x-auto my-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
                          <table
                            className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm"
                            {...props}
                          />
                        </div>
                      );
                    },
                    thead({ node, ...props }: any) {
                      return (
                        <thead
                          className="bg-slate-100/80 dark:bg-slate-800/80"
                          {...props}
                        />
                      );
                    },
                    th({ node, ...props }: any) {
                      return (
                        <th
                          className="px-4 py-3 text-left font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider"
                          {...props}
                        />
                      );
                    },
                    td({ node, ...props }: any) {
                      return (
                        <td
                          className="px-4 py-3 text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/70"
                          {...props}
                        />
                      );
                    },
                    blockquote({ node, ...props }: any) {
                      return (
                        <blockquote
                          className="border-l-4 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 px-5 py-3.5 my-4 rounded-r-2xl italic text-slate-700 dark:text-slate-300"
                          {...props}
                        />
                      );
                    },
                    h1({ node, children, ...props }: any) {
                      return (
                        <h1
                          className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-6 mb-3 pb-2 border-b border-slate-200/80 dark:border-slate-800/80 tracking-tight"
                          {...props}
                        >
                          {typeof children === "string" && searchQuery ? (
                            <HighlightText
                              text={children}
                              query={searchQuery}
                            />
                          ) : (
                            children
                          )}
                        </h1>
                      );
                    },
                    h2({ node, children, ...props }: any) {
                      return (
                        <h2
                          className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-5 mb-2.5 pb-1 border-b border-slate-100 dark:border-slate-800/60"
                          {...props}
                        >
                          {typeof children === "string" && searchQuery ? (
                            <HighlightText
                              text={children}
                              query={searchQuery}
                            />
                          ) : (
                            children
                          )}
                        </h2>
                      );
                    },
                    h3({ node, children, ...props }: any) {
                      return (
                        <h3
                          className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mt-4 mb-2"
                          {...props}
                        >
                          {typeof children === "string" && searchQuery ? (
                            <HighlightText
                              text={children}
                              query={searchQuery}
                            />
                          ) : (
                            children
                          )}
                        </h3>
                      );
                    },
                    p({ node, children, ...props }: any) {
                      return (
                        <p className="my-3 leading-relaxed" {...props}>
                          {typeof children === "string" && searchQuery ? (
                            <HighlightText
                              text={children}
                              query={searchQuery}
                            />
                          ) : (
                            children
                          )}
                        </p>
                      );
                    },
                    ul({ node, ...props }: any) {
                      return (
                        <ul
                          className="list-disc list-outside ml-6 space-y-1.5 my-3"
                          {...props}
                        />
                      );
                    },
                    ol({ node, ...props }: any) {
                      return (
                        <ol
                          className="list-decimal list-outside ml-6 space-y-1.5 my-3"
                          {...props}
                        />
                      );
                    },
                    li({ node, ...props }: any) {
                      return (
                        <li
                          className="leading-relaxed marker:text-indigo-500"
                          {...props}
                        />
                      );
                    },
                    a({ node, href, children, ...props }: any) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold"
                          {...props}
                        >
                          <span>{children}</span>
                          <ExternalLink className="w-3 h-3 inline-block" />
                        </a>
                      );
                    },
                    hr({ node, ...props }: any) {
                      return (
                        <hr
                          className="my-6 border-slate-200 dark:border-slate-800"
                          {...props}
                        />
                      );
                    },
                  }}
                >
                  {aiOutput}
                </ReactMarkdown>

                {/* Blinking streaming cursor */}
                {loading && (
                  <span className="inline-block w-2.5 h-5 ml-1 bg-indigo-600 dark:bg-indigo-400 animate-pulse rounded-sm align-middle" />
                )}
              </div>
            )}

            {/* 2. Editor Mode */}
            {viewMode === "edit" && (
              <div className="h-full min-h-[460px] flex flex-col">
                <textarea
                  ref={textareaRef}
                  value={aiOutput}
                  readOnly={readOnly}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className={`w-full flex-1 min-h-[440px] p-4 font-mono ${fontSizeClass} bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200/80 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed resize-none`}
                  placeholder="Edit your markdown content here..."
                />
              </div>
            )}

            {/* 3. Split View (Editor on Left, Live Preview on Right) */}
            {viewMode === "split" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-full min-h-[460px]">
                {/* Left: Editor */}
                <div className="flex flex-col h-full min-h-[420px]">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center justify-between">
                    <span>Markdown Source</span>
                    <span>Live Sync</span>
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={aiOutput}
                    readOnly={readOnly}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className={`w-full flex-1 min-h-[400px] p-3.5 font-mono ${fontSizeClass} bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200/80 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed resize-none`}
                    placeholder="Edit markdown source..."
                  />
                </div>

                {/* Right: Live Preview */}
                <div className="flex flex-col h-full min-h-[420px] border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-slate-800/80 lg:pl-5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center justify-between">
                    <span>Live Rendered</span>
                    <span className="text-emerald-500 font-semibold">Active</span>
                  </div>
                  <div
                    ref={previewRef}
                    className={`flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-200/60 dark:border-slate-800/60 prose dark:prose-invert max-w-none ${fontSizeClass} text-slate-800 dark:text-slate-200 leading-relaxed`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || "");
                          const codeString = String(children).replace(/\n$/, "");
                          if (!inline && match) {
                            return (
                              <CodeBlockComponent
                                language={match[1]}
                                value={codeString}
                              />
                            );
                          }
                          return (
                            <code
                              className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-1 py-0.5 rounded text-[0.88em] font-mono"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {aiOutput}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Raw Text View */}
            {viewMode === "raw" && (
              <div className="h-full min-h-[440px]">
                <pre
                  className={`p-4 bg-slate-900 text-slate-200 rounded-xl font-mono ${fontSizeClass} overflow-x-auto whitespace-pre-wrap leading-relaxed`}
                >
                  {aiOutput}
                </pre>
              </div>
            )}
          </>
        ) : (
          // Default Empty State
          <div className="h-full min-h-[440px] flex flex-col items-center justify-center text-center p-8 space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Your AI Output Workspace
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Fill in the template parameters on the left and click{" "}
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  Generate Content
                </span>{" "}
                to stream AI-generated text in real time.
              </p>
            </div>

            {/* Capability Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm pt-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
                ⚡ Real-time Streaming
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
                🎙️ Voice Text-to-Speech
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
                📑 Split View & PDF
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
                ✨ One-Click AI Refinement
              </span>
            </div>
          </div>
        )}
      </div>

      {/* In-depth Stats Drawer (Collapsible) */}
      {showStatsDrawer && aiOutput && (
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in slide-in-from-bottom-2 duration-150">
          <div className="space-y-0.5">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">
              Words
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {stats.words.toLocaleString()}
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">
              Characters
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {stats.charsWithSpaces.toLocaleString()}
              <span className="text-[11px] font-normal text-slate-400 ml-1">
                ({stats.charsNoSpaces.toLocaleString()} no spaces)
              </span>
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">
              Reading Time
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>{stats.readingTimeString}</span>
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">
              Speaking Time
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
              <Mic className="w-3.5 h-3.5 text-purple-500" />
              <span>{stats.speakingTimeString}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Status Bar */}
      {showWordCount && aiOutput && (
        <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0E131F] rounded-b-2xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowStatsDrawer((prev) => !prev)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 font-mono font-medium flex items-center gap-1.5 transition-colors"
              title="Click to view full text metrics"
            >
              <span>{stats.words} words</span>
              <span>·</span>
              <span>{stats.charsWithSpaces} chars</span>
              <span>·</span>
              <span>{stats.readingTimeString}</span>
              {showStatsDrawer ? (
                <ChevronDown className="w-3 h-3 rotate-180 transition-transform" />
              ) : (
                <ChevronUp className="w-3 h-3 transition-transform" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="hidden sm:inline text-slate-400">
              Astragen AI Studio
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
              {viewMode} Mode
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default OutputSection;
