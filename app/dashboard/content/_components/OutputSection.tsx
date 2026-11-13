"use client";

import React, {
  Suspense,
  lazy,
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bold,
  Check,
  CheckSquare,
  ChevronDown,
  Code2,
  Copy,
  Download,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Quote,
  RotateCcw,
  RotateCw,
  Search,
  Square,
  Volume2,
  Wand2,
  X,
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

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface OutputSectionProps {
  aiOutput: string;
  title?: string;
  templateName?: string;
  onEdit?: (newContent: string) => void;
  loading?: boolean;
  onStop?: () => void;
  readOnly?: boolean;
  /** @deprecated Unused. Theming follows the Tailwind `dark:` class. */
  theme?: "light" | "dark";
  showWordCount?: boolean;
  /** @deprecated Unused. */
  isHTML?: boolean;
}

type ViewMode = "preview" | "edit" | "split" | "raw";
type FontSize = "sm" | "base" | "lg";
type ToastType = "info" | "success" | "warning" | "error";
type MenuId = "refine" | "copy" | "export";
type RefineAction =
  | "summarize"
  | "expand"
  | "professional"
  | "casual"
  | "bullet_points"
  | "fix_grammar"
  | "simplify"
  | "custom";

/* -------------------------------------------------------------------------- */
/*                                 Constants                                  */
/* -------------------------------------------------------------------------- */

const HISTORY_LIMIT = 100;
const HISTORY_DEBOUNCE_MS = 600;
const TOAST_MS = 2400;
const REMARK_PLUGINS = [remarkGfm];

const PROSE_SIZE: Record<FontSize, string> = {
  sm: "prose-sm",
  base: "prose-base",
  lg: "prose-lg",
};

const FONT_LABEL: Record<FontSize, string> = {
  sm: "Small",
  base: "Default",
  lg: "Large",
};

const REFINE_ACTIONS: { id: RefineAction; label: string }[] = [
  { id: "summarize", label: "Shorter" },
  { id: "expand", label: "Expand" },
  { id: "professional", label: "Professional" },
  { id: "casual", label: "Casual" },
  { id: "bullet_points", label: "Bullet points" },
  { id: "fix_grammar", label: "Fix grammar" },
];

const MODES: { id: ViewMode; label: string; editing?: boolean }[] = [
  { id: "preview", label: "Preview" },
  { id: "edit", label: "Edit", editing: true },
  { id: "split", label: "Split", editing: true },
  { id: "raw", label: "Raw" },
];

const iconBtn =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100";

const textBtn =
  "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white";

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Splits text into sentence-sized chunks. Browsers cut off long utterances. */
function splitForSpeech(text: string, max = 220): string[] {
  const sentences = text.match(/[^.!?\n]+[.!?]*\s*/g) ?? [];
  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    if ((current + s).length > max && current) {
      chunks.push(current.trim());
      current = "";
    }
    current += s;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/** Wraps search matches in <mark>, recursing through host elements. */
function highlight(children: React.ReactNode, re: RegExp | null): React.ReactNode {
  if (!re) return children;
  return React.Children.map(children, (child) => {
    if (typeof child === "string") {
      const parts = child.split(re);
      if (parts.length === 1) return child;
      return parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            className="rounded-sm bg-yellow-200 px-0.5 text-neutral-950 dark:bg-yellow-300/80"
          >
            {part}
          </mark>
        ) : (
          part
        )
      );
    }
    if (
      React.isValidElement(child) &&
      typeof child.type === "string" &&
      (child.props as any).children
    ) {
      return React.cloneElement(
        child as React.ReactElement<any>,
        undefined,
        highlight((child.props as any).children, re)
      );
    }
    return child;
  });
}

/* -------------------------------------------------------------------------- */
/*                               Code block (lazy)                            */
/* -------------------------------------------------------------------------- */

// The highlighter and theme are fetched only when a code block is first shown.
const LazyHighlighter = lazy(async () => {
  const [{ PrismAsyncLight }, { vscDarkPlus }] = await Promise.all([
    import("react-syntax-highlighter"),
    import("react-syntax-highlighter/dist/cjs/styles/prism"),
  ]);
  function Highlighter({ language, value }: { language: string; value: string }) {
    return (
      <PrismAsyncLight
        style={vscDarkPlus as any}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.8125rem",
          lineHeight: 1.65,
          background: "transparent",
        }}
      >
        {value}
      </PrismAsyncLight>
    );
  }
  return { default: Highlighter };
});

function PlainCode({ value }: { value: string }) {
  return (
    <pre className="m-0 p-4 font-mono text-[13px] leading-relaxed text-neutral-200">
      {value}
    </pre>
  );
}

const CodeBlock = memo(function CodeBlock({
  language,
  value,
  plain,
}: {
  language: string;
  value: string;
  plain: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="not-prose my-5 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-950 dark:border-neutral-800">
      <div className="flex h-9 items-center justify-between border-b border-white/10 px-3 text-[11px] text-neutral-400">
        <span className="font-mono uppercase tracking-wider">
          {language || "text"}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:text-white"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        {plain ? (
          <PlainCode value={value} />
        ) : (
          <Suspense fallback={<PlainCode value={value} />}>
            <LazyHighlighter language={language || "text"} value={value} />
          </Suspense>
        )}
      </div>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*                                 Markdown                                   */
/* -------------------------------------------------------------------------- */

const HIGHLIGHT_TAGS = ["p", "li", "td", "th", "h1", "h2", "h3", "h4", "strong", "em"];

function buildComponents(re: RegExp | null, streaming: boolean): any {
  const components: Record<string, any> = {
    pre: ({ children }: any) => <>{children}</>,
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      const text = String(children).replace(/\n$/, "");
      const isBlock = !inline && (match || text.includes("\n"));
      if (isBlock) {
        return <CodeBlock language={match?.[1] ?? ""} value={text} plain={streaming} />;
      }
      return (
        <code
          className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.9em] font-normal text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
          {...props}
        >
          {children}
        </code>
      );
    },
    table: ({ node, ...props }: any) => (
      <div className="not-prose my-5 overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
        <table
          className="min-w-full divide-y divide-neutral-200 text-sm dark:divide-neutral-800"
          {...props}
        />
      </div>
    ),
    th: ({ node, children, ...props }: any) => (
      <th
        className="bg-neutral-50 px-4 py-2.5 text-left text-xs font-medium text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400"
        {...props}
      >
        {highlight(children, re)}
      </th>
    ),
    td: ({ node, children, ...props }: any) => (
      <td className="px-4 py-2.5 text-neutral-700 dark:text-neutral-300" {...props}>
        {highlight(children, re)}
      </td>
    ),
    a: ({ node, href, children, ...props }: any) => (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    ),
  };

  if (re) {
    for (const tag of HIGHLIGHT_TAGS) {
      if (tag === "th" || tag === "td") continue;
      components[tag] = ({ node, children, ...props }: any) =>
        React.createElement(tag, props, highlight(children, re));
    }
  }
  return components;
}

const MarkdownView = memo(function MarkdownView({
  content,
  query,
  streaming,
}: {
  content: string;
  query: string;
  streaming: boolean;
}) {
  const re = useMemo(() => {
    const q = query.trim();
    return q ? new RegExp(`(${escapeRegExp(q)})`, "gi") : null;
  }, [query]);
  const components = useMemo(() => buildComponents(re, streaming), [re, streaming]);
  return (
    <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={components}>
      {content}
    </ReactMarkdown>
  );
});

/* -------------------------------------------------------------------------- */
/*                               Small UI parts                               */
/* -------------------------------------------------------------------------- */

function IconButton({
  label,
  onClick,
  active,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`${iconBtn} ${
        active ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white" : ""
      }`}
    >
      {children}
    </button>
  );
}

function DropMenu({
  open,
  onToggle,
  label,
  icon,
  width = "w-52",
  children,
}: {
  open: boolean;
  onToggle: () => void;
  label: string;
  icon: React.ReactNode;
  width?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative" data-menu>
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`${textBtn} ${open ? "bg-neutral-100 dark:bg-neutral-800" : ""}`}
      >
        {icon}
        <span>{label}</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute right-0 top-full z-30 mt-1.5 ${width} rounded-lg border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  onClick,
  hint,
  children,
}: {
  onClick: () => void;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left text-xs text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
    >
      <span>{children}</span>
      {hint && <span className="text-[10px] text-neutral-400">{hint}</span>}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

function OutputSection({
  aiOutput,
  title = "Output",
  templateName,
  onEdit,
  loading = false,
  onStop,
  readOnly = false,
  showWordCount = true,
}: OutputSectionProps) {
  const canEdit = !!onEdit && !readOnly;
  const hasOutput = !!aiOutput;

  // View
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("base");
  const [menu, setMenu] = useState<MenuId | null>(null);

  // Search
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Refine
  const [isRefining, setIsRefining] = useState(false);
  const [refineBackup, setRefineBackup] = useState<string | null>(null);
  const [refinePrompt, setRefinePrompt] = useState("");
  const refineAbortRef = useRef<AbortController | null>(null);

  // Speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const speechTokenRef = useRef(0);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Heavy derived work runs on a deferred copy so streaming/typing stays smooth.
  const deferredOutput = useDeferredValue(aiOutput);
  const deferredQuery = useDeferredValue(searchQuery);

  const stats = useMemo(() => calculateReadingStats(deferredOutput), [deferredOutput]);

  const matchCount = useMemo(() => {
    const q = deferredQuery.trim();
    if (!q || !deferredOutput) return 0;
    return deferredOutput.match(new RegExp(escapeRegExp(q), "gi"))?.length ?? 0;
  }, [deferredQuery, deferredOutput]);

  const fileBaseName = useMemo(() => {
    const slug = (templateName || title || "astragen-content")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return slug || "astragen-output";
  }, [templateName, title]);

  /* ------------------------------- Feedback -------------------------------- */

  const notify = useCallback((message: string, type: ToastType = "info") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  /* ------------------------------- History --------------------------------- */

  const historyRef = useRef<string[]>([]);
  const indexRef = useRef(-1);
  const pendingRef = useRef<string | null>(null);
  const historyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncHistoryFlags = () => {
    setCanUndo(indexRef.current > 0);
    setCanRedo(indexRef.current < historyRef.current.length - 1);
  };

  const pushHistory = (value: string) => {
    const base = historyRef.current.slice(0, indexRef.current + 1);
    if (base[base.length - 1] === value) return;
    base.push(value);
    if (base.length > HISTORY_LIMIT) base.shift();
    historyRef.current = base;
    indexRef.current = base.length - 1;
    syncHistoryFlags();
  };

  const resetHistory = (value: string) => {
    historyRef.current = [value];
    indexRef.current = 0;
    pendingRef.current = null;
    if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
    syncHistoryFlags();
  };

  const flushPending = () => {
    if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
    if (pendingRef.current !== null) {
      pushHistory(pendingRef.current);
      pendingRef.current = null;
    }
  };

  // Keystrokes are coalesced into a single undo step.
  const handleContentChange = (value: string) => {
    if (!canEdit) return;
    onEdit!(value);
    pendingRef.current = value;
    if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
    historyTimerRef.current = setTimeout(flushPending, HISTORY_DEBOUNCE_MS);
  };

  const handleUndo = () => {
    flushPending();
    if (indexRef.current > 0 && onEdit) {
      indexRef.current -= 1;
      onEdit(historyRef.current[indexRef.current]);
      syncHistoryFlags();
    }
  };

  const handleRedo = () => {
    flushPending();
    if (indexRef.current < historyRef.current.length - 1 && onEdit) {
      indexRef.current += 1;
      onEdit(historyRef.current[indexRef.current]);
      syncHistoryFlags();
    }
  };

  // Snapshot the AI draft once each generation finishes.
  const [originalSnapshot, setOriginalSnapshot] = useState("");
  const wasLoadingRef = useRef(loading);
  useEffect(() => {
    if (!loading && aiOutput && (wasLoadingRef.current || !originalSnapshot)) {
      setOriginalSnapshot(aiOutput);
      resetHistory(aiOutput);
    }
    wasLoadingRef.current = loading;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, aiOutput, originalSnapshot]);

  const isModified = hasOutput && !!originalSnapshot && aiOutput !== originalSnapshot && !loading;

  const handleResetToOriginal = () => {
    if (!originalSnapshot || !onEdit) return;
    flushPending();
    onEdit(originalSnapshot);
    pushHistory(originalSnapshot); // undoable, so no confirm dialog needed
    notify("Reverted to the original draft", "success");
  };

  /* ------------------------------ Global events ---------------------------- */

  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery("");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inside =
        isFullscreen || containerRef.current?.contains(document.activeElement);
      if (!inside) return;
      if (e.key === "Escape") {
        if (menu) setMenu(null);
        else if (showSearch) closeSearch();
        else if (isFullscreen) setIsFullscreen(false);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f" && aiOutput) {
        e.preventDefault();
        setShowSearch((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen, menu, showSearch, aiOutput]);

  // Outside-click listener only exists while a menu is open.
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest("[data-menu]")) setMenu(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [menu]);

  useEffect(() => {
    if (!isFullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isFullscreen]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
      refineAbortRef.current?.abort();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    },
    []
  );

  /* -------------------------------- Speech --------------------------------- */

  const speak = (rate: number) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const chunks = splitForSpeech(stripMarkdown(aiOutput));
    if (!chunks.length) {
      notify("Nothing readable to play", "warning");
      return;
    }
    const token = ++speechTokenRef.current;
    setIsSpeaking(true);
    setIsPaused(false);
    chunks.forEach((text, i) => {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate;
      u.onend = () => {
        if (token === speechTokenRef.current && i === chunks.length - 1) {
          setIsSpeaking(false);
        }
      };
      u.onerror = (e) => {
        if (token !== speechTokenRef.current) return;
        if (e.error === "canceled" || e.error === "interrupted") return;
        setIsSpeaking(false);
        setIsPaused(false);
      };
      synth.speak(u);
    });
  };

  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      notify("Speech is not supported in this browser", "warning");
      return;
    }
    const synth = window.speechSynthesis;
    if (isSpeaking && !isPaused) {
      synth.pause();
      setIsPaused(true);
    } else if (isSpeaking && isPaused) {
      synth.resume();
      setIsPaused(false);
    } else {
      speak(speechRate);
    }
  };

  const handleStopSpeech = () => {
    speechTokenRef.current += 1;
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handleCycleRate = () => {
    const next = speechRate === 1 ? 1.25 : speechRate === 1.25 ? 1.5 : speechRate === 1.5 ? 0.8 : 1;
    setSpeechRate(next);
    if (isSpeaking) speak(next);
  };

  /* ------------------------------ Copy / export ---------------------------- */

  const getRenderedHtml = () =>
    previewRef.current?.innerHTML ?? `<pre>${escapeHtml(aiOutput)}</pre>`;

  const copyText = async (text: string, okMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify(okMessage, "success");
    } catch {
      notify("Copy failed", "error");
    }
    setMenu(null);
  };

  const handleCopyRich = async () => {
    try {
      const ok = await copyRichHtml(getRenderedHtml(), stripMarkdown(aiOutput));
      notify(ok ? "Copied. Paste into Docs or Word." : "Copied as plain text", ok ? "success" : "info");
    } catch {
      notify("Copy failed", "error");
    }
    setMenu(null);
  };

  const handleDownload = (kind: "md" | "txt" | "html") => {
    if (kind === "md") downloadFile(aiOutput, `${fileBaseName}.md`, "text/markdown");
    else if (kind === "txt") downloadFile(stripMarkdown(aiOutput), `${fileBaseName}.txt`, "text/plain");
    else downloadFile(generateHtmlDocument(title, getRenderedHtml()), `${fileBaseName}.html`, "text/html");
    notify(`Downloaded ${fileBaseName}.${kind}`, "success");
    setMenu(null);
  };

  const handlePrint = () => {
    printDocument(title, getRenderedHtml());
    setMenu(null);
  };

  const handleShare = async () => {
    setMenu(null);
    const shared = await shareContent(title, stripMarkdown(aiOutput));
    if (shared) notify("Shared", "success");
    else copyText(aiOutput, "Copied Markdown to clipboard");
  };

  /* --------------------------------- Refine -------------------------------- */

  const handleRefine = async (action: RefineAction, customInstruction?: string) => {
    if (!aiOutput || !onEdit || isRefining) return;

    flushPending();
    const before = aiOutput;
    const controller = new AbortController();
    refineAbortRef.current = controller;
    setIsRefining(true);
    setMenu(null);

    let acc = "";
    let raf = 0;

    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: before, action, customPrompt: customInstruction }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to refine content");
      }
      if (!res.body) throw new Error("Streaming is not supported");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      // Batch UI updates to one per frame instead of one per network chunk.
      const flush = () => {
        raf = 0;
        onEdit(acc);
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        if (!raf) raf = requestAnimationFrame(flush);
      }
      acc += decoder.decode();
      if (raf) cancelAnimationFrame(raf);
      if (!acc.trim()) throw new Error("Refinement returned no content");

      onEdit(acc);
      pushHistory(acc);
      setRefineBackup(before);
      setRefinePrompt("");
      notify("Refinement applied", "success");
    } catch (err: any) {
      if (raf) cancelAnimationFrame(raf);
      onEdit(before);
      if (err?.name !== "AbortError") {
        console.error("Refine error:", err);
        notify(err?.message || "Refinement failed", "error");
      }
    } finally {
      setIsRefining(false);
      refineAbortRef.current = null;
    }
  };

  const handleUndoRefine = () => {
    if (refineBackup === null || !onEdit) return;
    onEdit(refineBackup);
    pushHistory(refineBackup);
    setRefineBackup(null);
  };

  /* -------------------------------- Editing -------------------------------- */

  const handleInsertFormat = (prefix: string, suffix = "") => {
    const ta = textareaRef.current;
    if (!ta || !canEdit) return;
    const { selectionStart: start, selectionEnd: end, value } = ta;
    let next: string;
    let selStart: number;
    let selEnd: number;

    if (suffix) {
      const selected = value.slice(start, end) || "text";
      next = value.slice(0, start) + prefix + selected + suffix + value.slice(end);
      selStart = start + prefix.length;
      selEnd = selStart + selected.length;
    } else {
      // Line-level formats (headings, lists, quotes) go at the start of the line.
      const lineStart = start === 0 ? 0 : value.lastIndexOf("\n", start - 1) + 1;
      next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
      selStart = start + prefix.length;
      selEnd = end + prefix.length;
    }

    handleContentChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(selStart, selEnd);
    });
  };

  /* --------------------------------- Render -------------------------------- */

  const visibleModes = MODES.filter((m) => canEdit || !m.editing);
  const effectiveMode: ViewMode =
    !canEdit && (viewMode === "edit" || viewMode === "split") ? "preview" : viewMode;
  const busy = loading || isRefining;
  const streamingMarkdown = loading || isRefining;

  const proseClass = `prose ${PROSE_SIZE[fontSize]} prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:underline-offset-4 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-transparent prose-pre:p-0`;

  const textareaClass = `h-full min-h-[420px] w-full resize-none rounded-lg border border-neutral-200 bg-transparent p-4 font-mono leading-relaxed text-neutral-800 outline-none transition-colors focus:border-neutral-400 dark:border-neutral-800 dark:text-neutral-200 dark:focus:border-neutral-600 ${
    fontSize === "sm" ? "text-xs" : fontSize === "lg" ? "text-base" : "text-sm"
  }`;

  const fmtBtn = "inline-flex h-7 w-7 items-center justify-center rounded text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white";

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className={`relative flex flex-col bg-white outline-none dark:bg-neutral-950 ${
        isFullscreen
          ? "fixed inset-0 z-50"
          : "h-full min-h-[560px] rounded-xl border border-neutral-200 dark:border-neutral-800"
      }`}
    >
      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute bottom-14 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="flex items-center gap-2 rounded-full bg-neutral-900 px-3.5 py-1.5 text-xs text-white shadow-lg dark:bg-white dark:text-neutral-900">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                toast.type === "success"
                  ? "bg-emerald-400"
                  : toast.type === "error"
                  ? "bg-rose-400"
                  : toast.type === "warning"
                  ? "bg-amber-400"
                  : "bg-neutral-400"
              }`}
            />
            {toast.message}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">
        <div className="flex min-w-0 items-center gap-3">
          <h2 className="max-w-[14rem] truncate text-sm font-medium text-neutral-900 dark:text-white">
            {title}
          </h2>

          {hasOutput && (
            <div className="flex items-center gap-0.5" role="group" aria-label="View mode">
              {visibleModes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={effectiveMode === m.id}
                  onClick={() => setViewMode(m.id)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    effectiveMode === m.id
                      ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          {loading && onStop && (
            <button type="button" onClick={onStop} className={`${textBtn} text-rose-600 dark:text-rose-400`}>
              <Square className="h-3 w-3 fill-current" />
              Stop
            </button>
          )}

          {hasOutput && (
            <>
              <IconButton
                label={isSpeaking ? (isPaused ? "Resume audio" : "Pause audio") : "Listen"}
                onClick={handleToggleSpeech}
                active={isSpeaking}
              >
                {isSpeaking ? (
                  isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </IconButton>
              {isSpeaking && (
                <>
                  <IconButton label="Stop audio" onClick={handleStopSpeech}>
                    <Square className="h-3.5 w-3.5" />
                  </IconButton>
                  <button
                    type="button"
                    onClick={handleCycleRate}
                    title="Playback speed"
                    className="h-8 rounded-md px-1.5 font-mono text-[11px] text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  >
                    {speechRate}x
                  </button>
                </>
              )}

              <IconButton
                label="Find (Ctrl+F)"
                onClick={() => (showSearch ? closeSearch() : setShowSearch(true))}
                active={showSearch}
              >
                <Search className="h-4 w-4" />
              </IconButton>

              {canEdit && (
                <DropMenu
                  open={menu === "refine"}
                  onToggle={() => {
                    if (isRefining) refineAbortRef.current?.abort();
                    else setMenu((m) => (m === "refine" ? null : "refine"));
                  }}
                  label={isRefining ? "Stop" : "Refine"}
                  icon={
                    isRefining ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="h-3.5 w-3.5" />
                    )
                  }
                  width="w-64"
                >
                  {REFINE_ACTIONS.map((a) => (
                    <MenuItem key={a.id} onClick={() => handleRefine(a.id)}>
                      {a.label}
                    </MenuItem>
                  ))}
                  <div className="mt-1 flex gap-1 border-t border-neutral-100 p-1.5 pt-2 dark:border-neutral-800">
                    <input
                      type="text"
                      value={refinePrompt}
                      onChange={(e) => setRefinePrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && refinePrompt.trim()) {
                          handleRefine("custom", refinePrompt.trim());
                        }
                      }}
                      placeholder="Custom instruction"
                      className="min-w-0 flex-1 rounded-md border border-neutral-200 bg-transparent px-2 py-1 text-xs text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-700 dark:text-white"
                    />
                    <button
                      type="button"
                      disabled={!refinePrompt.trim()}
                      onClick={() => handleRefine("custom", refinePrompt.trim())}
                      className="rounded-md bg-neutral-900 px-2.5 text-xs font-medium text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
                    >
                      Go
                    </button>
                  </div>
                </DropMenu>
              )}

              <DropMenu
                open={menu === "copy"}
                onToggle={() => setMenu((m) => (m === "copy" ? null : "copy"))}
                label="Copy"
                icon={<Copy className="h-3.5 w-3.5" />}
              >
                <MenuItem onClick={() => copyText(aiOutput, "Copied Markdown")} hint="MD">
                  Markdown
                </MenuItem>
                <MenuItem onClick={handleCopyRich} hint="Docs, Word">
                  Rich text
                </MenuItem>
                <MenuItem onClick={() => copyText(stripMarkdown(aiOutput), "Copied plain text")} hint="TXT">
                  Plain text
                </MenuItem>
              </DropMenu>

              <DropMenu
                open={menu === "export"}
                onToggle={() => setMenu((m) => (m === "export" ? null : "export"))}
                label="Export"
                icon={<Download className="h-3.5 w-3.5" />}
              >
                <MenuItem onClick={() => handleDownload("md")} hint=".md">
                  Markdown
                </MenuItem>
                <MenuItem onClick={() => handleDownload("txt")} hint=".txt">
                  Plain text
                </MenuItem>
                <MenuItem onClick={() => handleDownload("html")} hint=".html">
                  Web page
                </MenuItem>
                <MenuItem onClick={handlePrint} hint="PDF">
                  Print
                </MenuItem>
                <MenuItem onClick={handleShare}>Share…</MenuItem>
              </DropMenu>

              <IconButton
                label={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
                onClick={() => setIsFullscreen((v) => !v)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </IconButton>
            </>
          )}
        </div>
      </header>

      {/* Progress hairline */}
      <div className="h-px w-full overflow-hidden bg-transparent">
        {busy && <div className="h-full w-full animate-pulse bg-neutral-900 dark:bg-white" />}
      </div>

      {/* Refine undo notice */}
      {refineBackup !== null && !isRefining && (
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-1.5 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          <span>Refinement applied.</span>
          <span className="flex items-center gap-3">
            <button type="button" onClick={handleUndoRefine} className="font-medium text-neutral-900 hover:underline dark:text-white">
              Undo
            </button>
            <button type="button" onClick={() => setRefineBackup(null)} className="hover:text-neutral-900 dark:hover:text-white">
              Dismiss
            </button>
          </span>
        </div>
      )}

      {/* Search */}
      {showSearch && hasOutput && (
        <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-2 dark:border-neutral-800">
          <Search className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find in content"
            className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white"
          />
          {searchQuery && (
            <span className="font-mono text-xs text-neutral-500">
              {matchCount} {matchCount === 1 ? "match" : "matches"}
            </span>
          )}
          <button type="button" onClick={closeSearch} aria-label="Close search" className="rounded p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Formatting toolbar */}
      {canEdit && hasOutput && (effectiveMode === "edit" || effectiveMode === "split") && (
        <div className="flex items-center justify-between gap-2 overflow-x-auto border-b border-neutral-200 px-3 py-1.5 dark:border-neutral-800">
          <div className="flex items-center gap-0.5">
            <button type="button" className={fmtBtn} title="Bold" aria-label="Bold" onClick={() => handleInsertFormat("**", "**")}>
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button type="button" className={fmtBtn} title="Italic" aria-label="Italic" onClick={() => handleInsertFormat("*", "*")}>
              <Italic className="h-3.5 w-3.5" />
            </button>
            <button type="button" className={fmtBtn} title="Inline code" aria-label="Inline code" onClick={() => handleInsertFormat("`", "`")}>
              <Code2 className="h-3.5 w-3.5" />
            </button>
            <button type="button" className={fmtBtn} title="Code block" aria-label="Code block" onClick={() => handleInsertFormat("```\n", "\n```")}>
              <span className="font-mono text-[11px]">{"{}"}</span>
            </button>
            <span className="mx-1 h-3.5 w-px bg-neutral-200 dark:bg-neutral-800" />
            <button type="button" className={fmtBtn} title="Heading 2" aria-label="Heading 2" onClick={() => handleInsertFormat("## ")}>
              <Heading2 className="h-3.5 w-3.5" />
            </button>
            <button type="button" className={fmtBtn} title="Heading 3" aria-label="Heading 3" onClick={() => handleInsertFormat("### ")}>
              <Heading3 className="h-3.5 w-3.5" />
            </button>
            <button type="button" className={fmtBtn} title="Bullet list" aria-label="Bullet list" onClick={() => handleInsertFormat("- ")}>
              <List className="h-3.5 w-3.5" />
            </button>
            <button type="button" className={fmtBtn} title="Numbered list" aria-label="Numbered list" onClick={() => handleInsertFormat("1. ")}>
              <ListOrdered className="h-3.5 w-3.5" />
            </button>
            <button type="button" className={fmtBtn} title="Checklist" aria-label="Checklist" onClick={() => handleInsertFormat("- [ ] ")}>
              <CheckSquare className="h-3.5 w-3.5" />
            </button>
            <button type="button" className={fmtBtn} title="Quote" aria-label="Quote" onClick={() => handleInsertFormat("> ")}>
              <Quote className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-0.5">
            <button type="button" className={fmtBtn} title="Undo" aria-label="Undo" disabled={!canUndo} onClick={handleUndo}>
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button type="button" className={fmtBtn} title="Redo" aria-label="Redo" disabled={!canRedo} onClick={handleRedo}>
              <RotateCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading && !hasOutput ? (
          <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-5 p-8 text-center">
            <div className="w-full max-w-xs space-y-2.5" aria-hidden>
              <div className="mx-auto h-2.5 w-3/4 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
              <div className="mx-auto h-2.5 w-full animate-pulse rounded-full bg-neutral-200 [animation-delay:150ms] dark:bg-neutral-800" />
              <div className="mx-auto h-2.5 w-5/6 animate-pulse rounded-full bg-neutral-200 [animation-delay:300ms] dark:bg-neutral-800" />
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Generating…</p>
            {onStop && (
              <button type="button" onClick={onStop} className={textBtn}>
                Cancel
              </button>
            )}
          </div>
        ) : hasOutput ? (
          <>
            {effectiveMode === "preview" && (
              <div className="mx-auto w-full max-w-3xl px-6 py-8">
                <div ref={previewRef} className={proseClass}>
                  <MarkdownView
                    content={deferredOutput}
                    query={deferredQuery}
                    streaming={streamingMarkdown}
                  />
                  {loading && (
                    <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-neutral-900 align-middle dark:bg-white" />
                  )}
                </div>
              </div>
            )}

            {effectiveMode === "edit" && (
              <div className="mx-auto h-full w-full max-w-3xl p-4">
                <textarea
                  ref={textareaRef}
                  value={aiOutput}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Edit your Markdown…"
                  aria-label="Markdown editor"
                  className={textareaClass}
                />
              </div>
            )}

            {effectiveMode === "split" && (
              <div className="grid h-full min-h-[420px] grid-cols-1 lg:grid-cols-2">
                <div className="p-4">
                  <textarea
                    ref={textareaRef}
                    value={aiOutput}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Edit your Markdown…"
                    aria-label="Markdown editor"
                    className={textareaClass}
                  />
                </div>
                <div className="overflow-y-auto border-t border-neutral-200 p-6 dark:border-neutral-800 lg:border-l lg:border-t-0">
                  <div ref={previewRef} className={proseClass}>
                    <MarkdownView content={deferredOutput} query="" streaming={streamingMarkdown} />
                  </div>
                </div>
              </div>
            )}

            {effectiveMode === "raw" && (
              <div className="mx-auto w-full max-w-3xl p-4">
                <pre
                  className={`whitespace-pre-wrap break-words rounded-lg border border-neutral-200 p-4 font-mono leading-relaxed text-neutral-800 dark:border-neutral-800 dark:text-neutral-200 ${
                    fontSize === "sm" ? "text-xs" : fontSize === "lg" ? "text-base" : "text-sm"
                  }`}
                >
                  {aiOutput}
                </pre>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-1.5 p-8 text-center">
            <p className="text-sm font-medium text-neutral-900 dark:text-white">Nothing here yet</p>
            <p className="max-w-xs text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              Fill in the template and choose Generate. Your content will stream in here.
            </p>
          </div>
        )}
      </div>

      {/* Status bar */}
      {showWordCount && hasOutput && (
        <footer className="flex items-center justify-between gap-3 border-t border-neutral-200 px-4 py-2 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          <div className="flex min-w-0 items-center gap-2 font-mono">
            <span>{stats.words.toLocaleString()} words</span>
            <span aria-hidden>·</span>
            <span className="hidden sm:inline">{stats.charsWithSpaces.toLocaleString()} chars</span>
            <span className="hidden sm:inline" aria-hidden>·</span>
            <span>{stats.readingTimeString}</span>
            <span className="hidden md:inline" aria-hidden>·</span>
            <span className="hidden md:inline">{stats.speakingTimeString}</span>
          </div>
          <div className="flex items-center gap-3">
            {isModified && canEdit && (
              <button type="button" onClick={handleResetToOriginal} className="hover:text-neutral-900 dark:hover:text-white">
                Edited · Reset
              </button>
            )}
            <button
              type="button"
              onClick={() => setFontSize((p) => (p === "sm" ? "base" : p === "base" ? "lg" : "sm"))}
              title={`Text size: ${FONT_LABEL[fontSize]}`}
              aria-label={`Text size: ${FONT_LABEL[fontSize]}. Click to change.`}
              className="font-medium hover:text-neutral-900 dark:hover:text-white"
            >
              Aa
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}

export default memo(OutputSection);