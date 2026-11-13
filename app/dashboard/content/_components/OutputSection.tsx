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
  Sparkles,
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

const DOC_SIZE: Record<FontSize, string> = {
  sm: "text-[15px]",
  base: "text-[17px]",
  lg: "text-[19.5px]",
};

const FONT_LABEL: Record<FontSize, string> = {
  sm: "Small",
  base: "Default",
  lg: "Large",
};

const REFINE_ACTIONS: { id: RefineAction; label: string; hint: string }[] = [
  { id: "summarize", label: "Make shorter", hint: "Condense" },
  { id: "expand", label: "Expand", hint: "Add depth" },
  { id: "professional", label: "Professional", hint: "Tone" },
  { id: "casual", label: "Casual", hint: "Tone" },
  { id: "bullet_points", label: "Bullet points", hint: "Format" },
  { id: "fix_grammar", label: "Fix grammar", hint: "Polish" },
  { id: "simplify", label: "Simplify", hint: "Clarity" },
];

const MODES: { id: ViewMode; label: string; editing?: boolean }[] = [
  { id: "preview", label: "Preview" },
  { id: "edit", label: "Edit", editing: true },
  { id: "split", label: "Split", editing: true },
  { id: "raw", label: "Raw" },
];

/* Design tokens: warm paper palette with a terracotta accent. */
const ACCENT = "#c96442";

const iconBtn =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6b6a63] transition-all duration-150 hover:bg-[#f0eee6] hover:text-[#141413] active:scale-95 disabled:pointer-events-none disabled:opacity-40 dark:text-[#9c9a92] dark:hover:bg-[#3a3936] dark:hover:text-[#faf9f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c96442]/40";

const textBtn =
  "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 font-sans text-[13px] font-medium text-[#55534b] transition-all duration-150 hover:bg-[#f0eee6] hover:text-[#141413] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 dark:text-[#c2c0b6] dark:hover:bg-[#3a3936] dark:hover:text-[#faf9f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c96442]/40";

const divider = "border-[#e8e6dc] dark:border-[#3d3d3a]";

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
            className="rounded-[3px] bg-[#f5d9a0] px-0.5 text-[#141413] ring-1 ring-[#e8b95c]/60 dark:bg-[#e8b95c]/80"
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
          padding: "1.1rem 1.25rem",
          fontSize: "0.8125rem",
          lineHeight: 1.7,
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
    <pre className="m-0 px-5 py-4 font-mono text-[13px] leading-[1.7] text-[#d6d3c9]">
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
    <div className="not-prose group/code my-6 overflow-hidden rounded-xl border border-[#2f2e2b] bg-[#1f1e1d] shadow-[0_1px_2px_rgba(20,20,19,0.08)]">
      <div className="flex h-10 items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 font-sans text-[11px] text-[#9c9a92]">
        <span className="font-mono uppercase tracking-[0.12em]">{language || "text"}</span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
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

const HEAD =
  "font-serif font-medium tracking-[-0.015em] text-[#141413] first:mt-0 dark:text-[#faf9f5]";
const BODY = "text-[#3d3929] dark:text-[#d6d3c9]";

/** Builds a styled element that also highlights search matches. */
function el(tag: string, base: string, re: RegExp | null) {
  return ({ node, className, children, ...props }: any) =>
    React.createElement(
      tag,
      { ...props, className: `${base} ${className ?? ""}`.trim() },
      highlight(children, re)
    );
}

function buildComponents(re: RegExp | null, streaming: boolean): any {
  return {
    h1: el("h1", `${HEAD} mb-5 mt-14 text-[1.9em] leading-[1.15]`, re),
    h2: el("h2", `${HEAD} mb-3 mt-11 text-[1.45em] leading-[1.25]`, re),
    h3: el("h3", `${HEAD} mb-2 mt-8 text-[1.17em] leading-[1.35]`, re),
    h4: el("h4", `${HEAD} mb-2 mt-6 text-[1em]`, re),
    p: el("p", `my-[1.1em] leading-[1.8] ${BODY}`, re),
    strong: el("strong", "font-semibold text-[#141413] dark:text-[#faf9f5]", re),
    em: el("em", "italic", re),
    ul: ({ node, className, children, ...props }: any) => (
      <ul
        {...props}
        className={`my-5 space-y-2 ${
          String(className).includes("contains-task-list")
            ? "list-none pl-0"
            : "list-disc pl-6 marker:text-[#c96442]/70"
        }`}
      >
        {children}
      </ul>
    ),
    ol: ({ node, children, ...props }: any) => (
      <ol
        {...props}
        className="my-5 list-decimal space-y-2 pl-6 marker:font-sans marker:text-sm marker:font-medium marker:text-[#c96442]/80"
      >
        {children}
      </ol>
    ),
    li: el("li", `pl-1.5 leading-[1.75] ${BODY}`, re),
    blockquote: ({ node, children, ...props }: any) => (
      <blockquote
        {...props}
        className="my-7 rounded-r-lg border-l-[3px] border-[#c96442]/60 bg-[#f5f4ed] py-1 pl-5 pr-4 italic text-[#55534b] dark:bg-[#2b2a27] dark:text-[#b8b6ac] [&>p]:my-2"
      >
        {children}
      </blockquote>
    ),
    hr: () => (
      <hr className="my-12 h-px border-0 bg-gradient-to-r from-transparent via-[#d6d3c9] to-transparent dark:via-[#4a4945]" />
    ),
    input: ({ node, ...props }: any) => (
      <input
        {...props}
        className="mr-2.5 h-3.5 w-3.5 translate-y-[1px] rounded accent-[#c96442]"
      />
    ),
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
          className="rounded-md border border-[#e8e6dc] bg-[#f5f4ed] px-1.5 py-0.5 font-mono text-[0.84em] text-[#a8452a] dark:border-[#3d3d3a] dark:bg-[#2b2a27] dark:text-[#e8967a]"
          {...props}
        >
          {children}
        </code>
      );
    },
    table: ({ node, ...props }: any) => (
      <div className="my-7 overflow-x-auto rounded-xl border border-[#e8e6dc] bg-white shadow-[0_1px_2px_rgba(20,20,19,0.04)] dark:border-[#3d3d3a] dark:bg-[#2b2a27]">
        <table
          className="min-w-full divide-y divide-[#e8e6dc] font-sans text-sm dark:divide-[#3d3d3a]"
          {...props}
        />
      </div>
    ),
    th: el(
      "th",
      "bg-[#f5f4ed] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#6b6a63] dark:bg-[#33322f] dark:text-[#9c9a92]",
      re
    ),
    td: el("td", `border-t border-[#efede4] px-4 py-3 dark:border-[#3a3936] ${BODY}`, re),
    a: ({ node, href, children, ...props }: any) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-[#a8452a] underline decoration-[#c96442]/40 decoration-[1.5px] underline-offset-[3px] transition-colors hover:decoration-[#c96442] dark:text-[#e8967a]"
        {...props}
      >
        {children}
      </a>
    ),
  };
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
        active ? "bg-[#f0eee6] !text-[#c96442] dark:bg-[#3a3936] dark:!text-[#e8967a]" : ""
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
  width = "w-56",
  accent,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  label: string;
  icon: React.ReactNode;
  width?: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative" data-menu>
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`${textBtn} ${open ? "bg-[#f0eee6] dark:bg-[#3a3936]" : ""} ${
          accent ? "!text-[#a8452a] dark:!text-[#e8967a]" : ""
        }`}
      >
        {icon}
        <span>{label}</span>
        <ChevronDown
          className={`h-3 w-3 opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute right-0 top-full z-30 mt-2 ${width} origin-top-right animate-[menuIn_140ms_ease-out] rounded-xl border border-[#e8e6dc] bg-white p-1.5 shadow-[0_8px_30px_rgba(20,20,19,0.12)] dark:border-[#3d3d3a] dark:bg-[#30302e] dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)]`}
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
      className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left font-sans text-[13px] text-[#3d3929] transition-colors hover:bg-[#f5f4ed] dark:text-[#d6d3c9] dark:hover:bg-[#3a3936]"
    >
      <span>{children}</span>
      {hint && <span className="text-[10.5px] text-[#9c9a92]">{hint}</span>}
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
  const [progress, setProgress] = useState(0);
  const [quickCopied, setQuickCopied] = useState(false);

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
  const quickCopyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollRafRef = useRef(0);

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

  /* ------------------------------ Scroll progress -------------------------- */

  const handleScroll = () => {
    if (scrollRafRef.current) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = 0;
      const node = scrollRef.current;
      if (!node) return;
      const max = node.scrollHeight - node.clientHeight;
      setProgress(max > 0 ? Math.min(100, (node.scrollTop / max) * 100) : 0);
    });
  };

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
      const inside = isFullscreen || containerRef.current?.contains(document.activeElement);
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
      if (quickCopyTimerRef.current) clearTimeout(quickCopyTimerRef.current);
      if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
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

  const handleQuickCopy = async () => {
    try {
      await navigator.clipboard.writeText(aiOutput);
      setQuickCopied(true);
      if (quickCopyTimerRef.current) clearTimeout(quickCopyTimerRef.current);
      quickCopyTimerRef.current = setTimeout(() => setQuickCopied(false), 1800);
    } catch {
      notify("Copy failed", "error");
    }
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

  const proseClass = `font-serif ${DOC_SIZE[fontSize]} antialiased [text-rendering:optimizeLegibility]`;

  const monoSize = fontSize === "sm" ? "text-xs" : fontSize === "lg" ? "text-base" : "text-sm";

  const textareaClass = `h-full min-h-[420px] w-full resize-none rounded-xl border border-[#e8e6dc] bg-white p-5 font-mono leading-[1.75] text-[#3d3929] outline-none transition-all placeholder:text-[#9c9a92] focus:border-[#c96442]/50 focus:ring-4 focus:ring-[#c96442]/10 dark:border-[#3d3d3a] dark:bg-[#30302e] dark:text-[#d6d3c9] dark:focus:border-[#c96442]/60 ${monoSize}`;

  const fmtBtn =
    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#6b6a63] transition-all hover:bg-[#f0eee6] hover:text-[#141413] active:scale-90 disabled:opacity-30 dark:text-[#9c9a92] dark:hover:bg-[#3a3936] dark:hover:text-[#faf9f5]";

  const toastDot =
    toast?.type === "success"
      ? "bg-emerald-400"
      : toast?.type === "error"
      ? "bg-rose-400"
      : toast?.type === "warning"
      ? "bg-amber-400"
      : "bg-[#c96442]";

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className={`relative flex flex-col bg-[#faf9f5] text-[#141413] outline-none dark:bg-[#262624] dark:text-[#faf9f5] ${
        isFullscreen
          ? "fixed inset-0 z-50"
          : "h-full min-h-[560px] overflow-hidden rounded-2xl border border-[#e8e6dc] shadow-[0_1px_3px_rgba(20,20,19,0.04),0_8px_24px_-12px_rgba(20,20,19,0.08)] dark:border-[#3d3d3a]"
      }`}
    >
      <style>{`
        @keyframes menuIn { from { opacity: 0; transform: translateY(-4px) scale(0.98); } to { opacity: 1; transform: none; } }
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes caret { 0%, 100% { opacity: 1; } 50% { opacity: 0.15; } }
        @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute bottom-16 left-1/2 z-50 -translate-x-1/2 animate-[toastIn_200ms_ease-out]"
        >
          <div className="flex items-center gap-2.5 rounded-full bg-[#141413] px-4 py-2 font-sans text-[13px] font-medium text-[#faf9f5] shadow-[0_8px_24px_rgba(20,20,19,0.25)] dark:bg-[#faf9f5] dark:text-[#141413]">
            <span className={`h-1.5 w-1.5 rounded-full ${toastDot}`} />
            {toast.message}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="relative z-20 flex min-h-[52px] flex-wrap items-center justify-between gap-2 border-b border-[#e8e6dc] bg-[#faf9f5]/90 px-3.5 py-2 font-sans backdrop-blur dark:border-[#3d3d3a] dark:bg-[#262624]/90">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-white"
              style={{ background: ACCENT }}
              aria-hidden
            >
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <h2 className="max-w-[14rem] truncate font-serif text-[15px] font-medium tracking-tight text-[#141413] dark:text-[#faf9f5]">
              {title}
            </h2>
          </div>

          {hasOutput && (
            <div
              className="flex items-center gap-0.5 rounded-xl bg-[#f0eee6] p-0.5 dark:bg-[#1f1e1d]"
              role="group"
              aria-label="View mode"
            >
              {visibleModes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={effectiveMode === m.id}
                  onClick={() => setViewMode(m.id)}
                  className={`rounded-[10px] px-3 py-1 text-[12.5px] font-medium transition-all duration-200 ${
                    effectiveMode === m.id
                      ? "bg-white text-[#141413] shadow-[0_1px_2px_rgba(20,20,19,0.1)] dark:bg-[#3a3936] dark:text-[#faf9f5]"
                      : "text-[#6b6a63] hover:text-[#141413] dark:text-[#9c9a92] dark:hover:text-[#faf9f5]"
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
            <button
              type="button"
              onClick={onStop}
              className={`${textBtn} !text-rose-600 hover:!bg-rose-50 dark:!text-rose-400 dark:hover:!bg-rose-950/40`}
            >
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
                    className="h-8 rounded-lg px-1.5 font-mono text-[11px] text-[#6b6a63] hover:bg-[#f0eee6] dark:text-[#9c9a92] dark:hover:bg-[#3a3936]"
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

              <span className="mx-1 hidden h-4 w-px bg-[#e8e6dc] dark:bg-[#3d3d3a] sm:block" />

              {canEdit && (
                <DropMenu
                  open={menu === "refine"}
                  accent
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
                  width="w-72"
                >
                  <div className="px-2.5 pb-1 pt-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-[#9c9a92]">
                    Quick refine
                  </div>
                  {REFINE_ACTIONS.map((a) => (
                    <MenuItem key={a.id} onClick={() => handleRefine(a.id)} hint={a.hint}>
                      {a.label}
                    </MenuItem>
                  ))}
                  <div className="mt-1.5 border-t border-[#efede4] p-1.5 pt-2.5 dark:border-[#3a3936]">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={refinePrompt}
                        onChange={(e) => setRefinePrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && refinePrompt.trim()) {
                            handleRefine("custom", refinePrompt.trim());
                          }
                        }}
                        placeholder="Tell it what to change…"
                        className="min-w-0 flex-1 rounded-lg border border-[#e8e6dc] bg-[#faf9f5] px-2.5 py-1.5 text-[13px] text-[#141413] outline-none transition-all placeholder:text-[#9c9a92] focus:border-[#c96442]/50 focus:ring-2 focus:ring-[#c96442]/15 dark:border-[#4a4945] dark:bg-[#262624] dark:text-[#faf9f5]"
                      />
                      <button
                        type="button"
                        disabled={!refinePrompt.trim()}
                        onClick={() => handleRefine("custom", refinePrompt.trim())}
                        className="rounded-lg px-3 text-[13px] font-medium text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-40"
                        style={{ background: ACCENT }}
                      >
                        Go
                      </button>
                    </div>
                  </div>
                </DropMenu>
              )}

              <button
                type="button"
                onClick={handleQuickCopy}
                className={`${textBtn} ${quickCopied ? "!text-emerald-600 dark:!text-emerald-400" : ""}`}
                aria-label="Copy Markdown"
              >
                {quickCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{quickCopied ? "Copied" : "Copy"}</span>
              </button>

              <DropMenu
                open={menu === "copy"}
                onToggle={() => setMenu((m) => (m === "copy" ? null : "copy"))}
                label=""
                icon={<span className="sr-only">Copy formats</span>}
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

      {/* Progress hairline: generation activity, otherwise reading progress */}
      <div className="relative h-[2px] w-full overflow-hidden bg-transparent">
        {busy ? (
          <div
            className="h-full w-full animate-[shimmer_1.4s_linear_infinite]"
            style={{
              background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
              backgroundSize: "200% 100%",
            }}
          />
        ) : (
          hasOutput &&
          effectiveMode === "preview" && (
            <div
              className="h-full transition-[width] duration-100 ease-out"
              style={{ width: `${progress}%`, background: ACCENT }}
            />
          )
        )}
      </div>

      {/* Refine undo notice */}
      {refineBackup !== null && !isRefining && (
        <div className="flex items-center justify-between gap-3 border-b border-[#e8e6dc] bg-[#f5f4ed] px-4 py-2 font-sans text-[13px] text-[#55534b] animate-[fadeUp_200ms_ease-out] dark:border-[#3d3d3a] dark:bg-[#2b2a27] dark:text-[#b8b6ac]">
          <span className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Refinement applied
          </span>
          <span className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleUndoRefine}
              className="font-medium text-[#a8452a] hover:underline dark:text-[#e8967a]"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={() => setRefineBackup(null)}
              className="hover:text-[#141413] dark:hover:text-[#faf9f5]"
            >
              Dismiss
            </button>
          </span>
        </div>
      )}

      {/* Search */}
      {showSearch && hasOutput && (
        <div className="flex items-center gap-2.5 border-b border-[#e8e6dc] bg-white/60 px-4 py-2 font-sans animate-[fadeUp_160ms_ease-out] dark:border-[#3d3d3a] dark:bg-[#2b2a27]/60">
          <Search className="h-3.5 w-3.5 shrink-0 text-[#9c9a92]" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find in content"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#141413] outline-none placeholder:text-[#9c9a92] dark:text-[#faf9f5]"
          />
          {searchQuery && (
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[11px] ${
                matchCount
                  ? "bg-[#f5d9a0]/60 text-[#7a5a14] dark:bg-[#e8b95c]/20 dark:text-[#e8b95c]"
                  : "bg-[#f0eee6] text-[#9c9a92] dark:bg-[#3a3936]"
              }`}
            >
              {matchCount} {matchCount === 1 ? "match" : "matches"}
            </span>
          )}
          <button
            type="button"
            onClick={closeSearch}
            aria-label="Close search"
            className="rounded-md p-1 text-[#9c9a92] transition-colors hover:bg-[#f0eee6] hover:text-[#141413] dark:hover:bg-[#3a3936] dark:hover:text-[#faf9f5]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Formatting toolbar */}
      {canEdit && hasOutput && (effectiveMode === "edit" || effectiveMode === "split") && (
        <div className="flex items-center justify-between gap-2 overflow-x-auto border-b border-[#e8e6dc] px-3 py-1.5 dark:border-[#3d3d3a]">
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
            <span className={`mx-1.5 h-4 w-px border-l ${divider}`} />
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
      <div ref={scrollRef} onScroll={handleScroll} className="min-h-0 flex-1 overflow-y-auto scroll-smooth">
        {loading && !hasOutput ? (
          <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-6 p-8 text-center font-sans">
            <div className="w-full max-w-sm space-y-3" aria-hidden>
              {[75, 100, 88, 60].map((w, i) => (
                <div
                  key={i}
                  className="mx-auto h-3 animate-[shimmer_1.6s_linear_infinite] rounded-full"
                  style={{
                    width: `${w}%`,
                    animationDelay: `${i * 120}ms`,
                    backgroundImage:
                      "linear-gradient(90deg, rgba(201,100,66,0.10) 25%, rgba(201,100,66,0.24) 50%, rgba(201,100,66,0.10) 75%)",
                    backgroundSize: "200% 100%",
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-[#6b6a63] dark:text-[#9c9a92]">
              <Sparkles className="h-4 w-4 animate-pulse" style={{ color: ACCENT }} />
              Writing your content…
            </div>
            {onStop && (
              <button type="button" onClick={onStop} className={textBtn}>
                Cancel
              </button>
            )}
          </div>
        ) : hasOutput ? (
          <>
            {effectiveMode === "preview" && (
              <div className="mx-auto w-full max-w-[44rem] px-6 py-12 sm:px-10">
                <div ref={previewRef} className={proseClass}>
                  <MarkdownView
                    content={deferredOutput}
                    query={deferredQuery}
                    streaming={streamingMarkdown}
                  />
                  {loading && (
                    <span
                      className="ml-0.5 inline-block h-[1.1em] w-[3px] animate-[caret_1s_ease-in-out_infinite] rounded-full align-middle"
                      style={{ background: ACCENT }}
                    />
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
                <div className="overflow-y-auto border-t border-[#e8e6dc] bg-white/50 p-7 dark:border-[#3d3d3a] dark:bg-[#2b2a27]/40 lg:border-l lg:border-t-0">
                  <div ref={previewRef} className={proseClass}>
                    <MarkdownView content={deferredOutput} query="" streaming={streamingMarkdown} />
                  </div>
                </div>
              </div>
            )}

            {effectiveMode === "raw" && (
              <div className="mx-auto w-full max-w-3xl p-4">
                <pre
                  className={`whitespace-pre-wrap break-words rounded-xl border border-[#e8e6dc] bg-white p-5 font-mono leading-[1.75] text-[#3d3929] dark:border-[#3d3d3a] dark:bg-[#30302e] dark:text-[#d6d3c9] ${monoSize}`}
                >
                  {aiOutput}
                </pre>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-3 p-8 text-center font-sans">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c96442]/10 ring-1 ring-[#c96442]/20">
              <Sparkles className="h-5 w-5" style={{ color: ACCENT }} />
            </div>
            <div className="space-y-1">
              <p className="font-serif text-lg font-medium text-[#141413] dark:text-[#faf9f5]">
                Nothing here yet
              </p>
              <p className="max-w-xs text-[13px] leading-relaxed text-[#6b6a63] dark:text-[#9c9a92]">
                Fill in the template and choose Generate. Your content will stream in here.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      {showWordCount && hasOutput && (
        <footer className="flex items-center justify-between gap-3 border-t border-[#e8e6dc] bg-[#faf9f5]/90 px-4 py-2 font-sans text-xs text-[#6b6a63] backdrop-blur dark:border-[#3d3d3a] dark:bg-[#262624]/90 dark:text-[#9c9a92]">
          <div className="flex min-w-0 items-center gap-2">
            <span className="font-medium text-[#3d3929] dark:text-[#d6d3c9]">
              {stats.words.toLocaleString()} words
            </span>
            <span aria-hidden className="opacity-40">·</span>
            <span className="hidden sm:inline">{stats.charsWithSpaces.toLocaleString()} chars</span>
            <span className="hidden opacity-40 sm:inline" aria-hidden>·</span>
            <span>{stats.readingTimeString}</span>
            <span className="hidden opacity-40 md:inline" aria-hidden>·</span>
            <span className="hidden md:inline">{stats.speakingTimeString}</span>
          </div>
          <div className="flex items-center gap-2">
            {isModified && canEdit && (
              <button
                type="button"
                onClick={handleResetToOriginal}
                className="rounded-full bg-[#f0eee6] px-2.5 py-0.5 font-medium transition-colors hover:text-[#a8452a] dark:bg-[#3a3936] dark:hover:text-[#e8967a]"
              >
                Edited · Reset
              </button>
            )}
            <button
              type="button"
              onClick={() => setFontSize((p) => (p === "sm" ? "base" : p === "base" ? "lg" : "sm"))}
              title={`Text size: ${FONT_LABEL[fontSize]}`}
              aria-label={`Text size: ${FONT_LABEL[fontSize]}. Click to change.`}
              className="rounded-md px-1.5 py-0.5 font-serif text-sm font-medium transition-colors hover:bg-[#f0eee6] hover:text-[#141413] dark:hover:bg-[#3a3936] dark:hover:text-[#faf9f5]"
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