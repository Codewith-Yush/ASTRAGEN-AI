"use client";

import React, {
  Suspense,
  lazy,
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
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
  ChevronUp,
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

/* Design tokens: Builder.io action system */
const ACCENT = "var(--action)";

const iconBtn =
  "inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-elevated hover:text-ink active:scale-95 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40";

const textBtn =
  "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-elevated hover:text-ink active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40";

const divider = "border-border";

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

/* ------------------- In-page find (CSS Custom Highlight API) ------------------- */

const FIND_ALL = "astragen-find";
const FIND_CURRENT = "astragen-find-current";
const FIND_BLOCKS = "p,li,h1,h2,h3,h4,h5,h6,td,th,pre,blockquote,div";
const FIND_MAX = 2000;

/** Chrome, Edge, Safari 17.2+ and Firefox 140+. Older browsers fall back to <mark>. */
function supportsFindHighlight(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof (window as any).Highlight !== "undefined" &&
    typeof CSS !== "undefined" &&
    !!(CSS as any).highlights
  );
}

/**
 * Returns a DOM Range for every case-insensitive match of the query under root.
 * Text nodes inside one block (e.g. the token spans of a highlighted code line)
 * are joined first, so a phrase that crosses several spans is still found.
 */
function collectMatchRanges(root: HTMLElement, query: string): Range[] {
  const q = query.toLowerCase();
  if (!q) return [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!node.nodeValue || !parent || parent.closest("textarea,script,style")) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const groups: Text[][] = [];
  let lastBlock: Element | null = null;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const block = (n.parentElement as Element).closest(FIND_BLOCKS);
    if (!groups.length || block !== lastBlock) {
      groups.push([]);
      lastBlock = block;
    }
    groups[groups.length - 1].push(n as Text);
  }

  const ranges: Range[] = [];
  for (const nodes of groups) {
    const starts: number[] = [];
    let full = "";
    for (const n of nodes) {
      starts.push(full.length);
      full += n.nodeValue;
    }
    const lower = full.toLowerCase();
    const locate = (pos: number, isEnd: boolean) => {
      for (let k = nodes.length - 1; k >= 0; k--) {
        const len = (nodes[k].nodeValue as string).length;
        const inside = isEnd
          ? starts[k] < pos && pos <= starts[k] + len
          : starts[k] <= pos && pos < starts[k] + len;
        if (inside) return { node: nodes[k], offset: pos - starts[k] };
      }
      return null;
    };
    for (let from = 0; ; ) {
      const i = lower.indexOf(q, from);
      if (i === -1) break;
      const a = locate(i, false);
      const b = locate(i + q.length, true);
      if (a && b) {
        const r = document.createRange();
        r.setStart(a.node, a.offset);
        r.setEnd(b.node, b.offset);
        ranges.push(r);
        if (ranges.length >= FIND_MAX) return ranges;
      }
      from = i + q.length;
    }
  }
  return ranges;
}

function scrollRangeIntoView(root: HTMLElement, range: Range) {
  const r = range.getBoundingClientRect();
  const c = root.getBoundingClientRect();
  root.scrollTo({
    top: root.scrollTop + (r.top - c.top) - root.clientHeight / 2,
    behavior: "smooth",
  });
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
            className="rounded-[3px] bg-action/20 px-0.5 text-ink ring-1 ring-action/40"
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
    <pre className="m-0 px-5 py-4 font-mono text-[13px] leading-[1.7] text-zinc-300">
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
    <div className="not-prose group/code my-6 overflow-hidden rounded-xl border border-border bg-[#151515] shadow-xs">
      <div className="flex h-10 items-center justify-between border-b border-border bg-[#1A1A1A] px-4 font-sans text-xs text-ink-muted">
        <span className="font-mono text-[11px] uppercase tracking-wider">{language || "text"}</span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-ink-muted hover:text-ink bg-surface-elevated border border-border hover:border-border-subtle transition-colors"
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

const HEAD = "font-sans font-semibold tracking-tight text-ink first:mt-0";
const BODY = "font-sans text-ink";

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
    strong: el("strong", "font-semibold text-ink", re),
    em: el("em", "italic text-ink", re),
    ul: ({ node, className, children, ...props }: any) => (
      <ul
        {...props}
        className={`my-5 space-y-2 ${
          String(className).includes("contains-task-list")
            ? "list-none pl-0"
            : "list-disc pl-6 marker:text-action"
        }`}
      >
        {children}
      </ul>
    ),
    ol: ({ node, children, ...props }: any) => (
      <ol
        {...props}
        className="my-5 list-decimal space-y-2 pl-6 marker:font-sans marker:text-sm marker:font-medium marker:text-action"
      >
        {children}
      </ol>
    ),
    li: el("li", `pl-1.5 leading-[1.75] ${BODY}`, re),
    blockquote: ({ node, children, ...props }: any) => (
      <blockquote
        {...props}
        className="my-7 rounded-r-lg border-l-[3px] border-action bg-surface-elevated py-1 pl-5 pr-4 italic text-ink-muted [&>p]:my-2"
      >
        {children}
      </blockquote>
    ),
    hr: () => (
      <hr className="my-12 h-px border-0 bg-border" />
    ),
    input: ({ node, ...props }: any) => (
      <input
        {...props}
        className="mr-2.5 h-3.5 w-3.5 translate-y-[1px] rounded accent-action"
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
          className="rounded-md border border-border bg-surface-elevated px-1.5 py-0.5 font-mono text-[0.84em] text-action"
          {...props}
        >
          {children}
        </code>
      );
    },
    table: ({ node, ...props }: any) => (
      <div className="my-7 overflow-x-auto rounded-xl border border-border bg-surface shadow-xs">
        <table
          className="min-w-full divide-y divide-border font-sans text-sm"
          {...props}
        />
      </div>
    ),
    th: el(
      "th",
      "bg-surface-elevated px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-muted",
      re
    ),
    td: el("td", `border-t border-border px-4 py-3 ${BODY}`, re),
    a: ({ node, href, children, ...props }: any) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-action underline decoration-action/40 decoration-[1.5px] underline-offset-[3px] transition-colors hover:decoration-action"
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
        active ? "bg-surface-elevated !text-action" : ""
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
  const menuRef = useRef<HTMLDivElement>(null);
  const [alignLeft, setAlignLeft] = useState(false);

  // The menu opens right-aligned. If that would push it past the left edge of the
  // output panel (which clips overflow), flip it to open left-aligned instead.
  useLayoutEffect(() => {
    if (!open) {
      setAlignLeft(false);
      return;
    }
    const menu = menuRef.current;
    const root = menu?.closest("[data-output-root]") as HTMLElement | null;
    if (!menu || !root) return;
    if (menu.getBoundingClientRect().left < root.getBoundingClientRect().left + 8) {
      setAlignLeft(true);
    }
  }, [open]);

  return (
    <div className="relative" data-menu>
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`${textBtn} ${open ? "bg-surface-elevated" : ""} ${
          accent ? "!text-action" : ""
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
          ref={menuRef}
          role="menu"
          className={`absolute ${alignLeft ? "left-0 origin-top-left" : "right-0 origin-top-right"} top-full z-30 mt-2 ${width} max-w-[calc(100vw-1.5rem)] animate-[menuIn_140ms_ease-out] rounded-xl border border-border bg-surface p-1.5 shadow-xl`}
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
      className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left font-sans text-[13px] text-ink transition-colors hover:bg-surface-elevated"
    >
      <span>{children}</span>
      {hint && <span className="text-[10.5px] text-ink-muted">{hint}</span>}
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
  const [matchTotal, setMatchTotal] = useState(0);
  const [matchIndex, setMatchIndex] = useState(0);
  const rangesRef = useRef<Range[]>([]);
  const canHighlight = useMemo(() => supportsFindHighlight(), []);

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

  // Number shown in the search bar: exact DOM matches when supported, text count otherwise.
  const searchTotal = canHighlight ? matchTotal : matchCount;

  // Highlight every match without touching React's DOM, so it also works inside
  // code blocks, bold text, links and tables.
  useEffect(() => {
    if (!canHighlight) return;
    const registry = (CSS as any).highlights;
    const root = scrollRef.current;
    const q = deferredQuery.trim();
    registry.delete(FIND_ALL);
    registry.delete(FIND_CURRENT);
    if (!root || !q || !showSearch || !hasOutput) {
      rangesRef.current = [];
      setMatchTotal(0);
      setMatchIndex(0);
      return;
    }
    const ranges = collectMatchRanges(root, q);
    rangesRef.current = ranges;
    setMatchTotal(ranges.length);
    setMatchIndex(0);
    if (ranges.length) {
      registry.set(FIND_ALL, new (window as any).Highlight(...ranges));
      if (!streamingMarkdown) scrollRangeIntoView(root, ranges[0]);
    }
    return () => {
      registry.delete(FIND_ALL);
      registry.delete(FIND_CURRENT);
    };
  }, [canHighlight, deferredQuery, deferredOutput, effectiveMode, showSearch, hasOutput, streamingMarkdown]);

  // The match you are on gets a stronger colour.
  useEffect(() => {
    if (!canHighlight) return;
    const registry = (CSS as any).highlights;
    const range = rangesRef.current[matchIndex];
    registry.delete(FIND_CURRENT);
    if (!range) return;
    registry.set(FIND_CURRENT, new (window as any).Highlight(range));
    return () => {
      registry.delete(FIND_CURRENT);
    };
  }, [canHighlight, matchIndex, matchTotal]);

  const goToMatch = (dir: 1 | -1) => {
    const n = rangesRef.current.length;
    const root = scrollRef.current;
    if (!n || !root) return;
    const next = (matchIndex + dir + n) % n;
    setMatchIndex(next);
    scrollRangeIntoView(root, rangesRef.current[next]);
  };

  const proseClass = `font-serif ${DOC_SIZE[fontSize]} antialiased [text-rendering:optimizeLegibility]`;

  const monoSize = fontSize === "sm" ? "text-xs" : fontSize === "lg" ? "text-base" : "text-sm";

  const textareaClass = `h-full min-h-[420px] w-full resize-none rounded-xl border border-border bg-surface p-5 font-mono leading-[1.75] text-ink outline-none transition-all placeholder:text-ink-dim focus:border-action focus:ring-4 focus:ring-action/10 ${monoSize}`;

  const fmtBtn =
    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-muted transition-all hover:bg-surface-elevated hover:text-ink active:scale-90 disabled:opacity-30";

  const toastDot =
    toast?.type === "success"
      ? "bg-emerald-400"
      : toast?.type === "error"
      ? "bg-rose-400"
      : toast?.type === "warning"
      ? "bg-amber-400"
      : "bg-action";

  return (
    <div
      ref={containerRef}
      data-output-root
      tabIndex={-1}
      className={`relative flex flex-col bg-surface text-ink outline-none ${
        isFullscreen
          ? "fixed inset-0 z-50"
          : "h-[calc(100dvh-8rem)] min-h-[560px] overflow-hidden rounded-2xl border border-border lg:sticky lg:top-4"
      }`}
    >
      <style>{`
        @keyframes menuIn { from { opacity: 0; transform: translateY(-4px) scale(0.98); } to { opacity: 1; transform: none; } }
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        ::highlight(astragen-find) { background-color: #fde68a; color: #1a1a1a; }
        ::highlight(astragen-find-current) { background-color: #f59e0b; color: #000000; }
        @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute bottom-16 left-1/2 z-50 -translate-x-1/2 animate-[toastIn_200ms_ease-out]"
        >
          <div className="flex items-center gap-2.5 rounded-full bg-surface-elevated border border-border px-4 py-2 font-sans text-xs font-medium text-ink shadow-md">
            <span className={`h-1.5 w-1.5 rounded-full ${toastDot}`} />
            {toast.message}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="relative z-20 flex min-h-[52px] flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-4 py-2 font-sans">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-action text-action-ink"
              aria-hidden
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
            <h2 className="max-w-[14rem] truncate text-sm font-semibold tracking-tight text-ink">
              {title}
            </h2>
          </div>

          {hasOutput && (
            <div
              className="flex items-center gap-0.5 rounded-full bg-surface-elevated border border-border p-0.5"
              role="group"
              aria-label="View mode"
            >
              {visibleModes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={effectiveMode === m.id}
                  onClick={() => setViewMode(m.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    effectiveMode === m.id
                      ? "bg-surface text-ink shadow-xs"
                      : "text-ink-muted hover:text-ink"
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
                    className="h-8 rounded-full px-2 font-mono text-[11px] text-ink-muted hover:bg-surface-elevated hover:text-ink"
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

              <span className="mx-1 hidden h-4 w-px bg-border sm:block" />

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
                  <div className="px-2.5 pb-1 pt-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-accent-cyan">
                    Quick refine
                  </div>
                  {REFINE_ACTIONS.map((a) => (
                    <MenuItem key={a.id} onClick={() => handleRefine(a.id)} hint={a.hint}>
                      {a.label}
                    </MenuItem>
                  ))}
                  <div className="mt-1.5 border-t border-border p-1.5 pt-2.5">
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
                        className="min-w-0 flex-1 rounded-lg border border-border bg-surface-elevated px-2.5 py-1.5 text-[13px] text-ink outline-none transition-all placeholder:text-ink-dim focus:border-action focus:ring-2 focus:ring-action/20"
                      />
                      <button
                        type="button"
                        disabled={!refinePrompt.trim()}
                        onClick={() => handleRefine("custom", refinePrompt.trim())}
                        className="rounded-full px-3 text-[13px] font-medium bg-action text-action-ink hover:bg-action-hover transition-all active:scale-95 disabled:opacity-40"
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
        <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-elevated px-4 py-2 font-sans text-[13px] text-ink-muted animate-[fadeUp_200ms_ease-out]">
          <span className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            Refinement applied
          </span>
          <span className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleUndoRefine}
              className="font-medium text-action hover:underline"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={() => setRefineBackup(null)}
              className="hover:text-ink"
            >
              Dismiss
            </button>
          </span>
        </div>
      )}

      {/* Search */}
      {showSearch && hasOutput && (
        <div className="flex items-center gap-2.5 border-b border-border bg-surface-elevated/80 px-4 py-2 font-sans animate-[fadeUp_160ms_ease-out]">
          <Search className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                goToMatch(e.shiftKey ? -1 : 1);
              }
            }}
            placeholder="Find in content"
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-dim"
          />
          {searchQuery && (
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[11px] ${
                searchTotal
                  ? "bg-action/20 text-action"
                  : "bg-surface-elevated text-ink-muted"
              }`}
            >
              {canHighlight && searchTotal > 0
                ? matchIndex + 1 + " / " + searchTotal
                : searchTotal + " " + (searchTotal === 1 ? "match" : "matches")}
            </span>
          )}
          {canHighlight && searchTotal > 1 && (
            <>
              <button
                type="button"
                onClick={() => goToMatch(-1)}
                aria-label="Previous match"
                title="Previous (Shift+Enter)"
                className="rounded-md p-1 text-ink-muted transition-colors hover:bg-surface-elevated hover:text-ink"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => goToMatch(1)}
                aria-label="Next match"
                title="Next (Enter)"
                className="rounded-md p-1 text-ink-muted transition-colors hover:bg-surface-elevated hover:text-ink"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={closeSearch}
            aria-label="Close search"
            className="rounded-md p-1 text-ink-muted transition-colors hover:bg-surface-elevated hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Formatting toolbar */}
      {canEdit && hasOutput && (effectiveMode === "edit" || effectiveMode === "split") && (
        <div className="flex items-center justify-between gap-2 overflow-x-auto border-b border-border px-3 py-1.5">
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
                      "linear-gradient(90deg, var(--glow) 25%, var(--action) 50%, var(--glow) 75%)",
                    backgroundSize: "200% 100%",
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <Sparkles className="h-4 w-4 animate-pulse text-action" />
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
                    query={canHighlight ? "" : deferredQuery}
                    streaming={streamingMarkdown}
                  />
                  {loading && (
                    <span
                      className="ml-1 inline-block h-[1.1em] w-[8px] bg-action cursor-blink rounded-xs align-middle"
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
                <div className="overflow-y-auto border-t border-border bg-surface-elevated/40 p-7 lg:border-l lg:border-t-0">
                  <div ref={previewRef} className={proseClass}>
                    <MarkdownView content={deferredOutput} query="" streaming={streamingMarkdown} />
                  </div>
                </div>
              </div>
            )}

            {effectiveMode === "raw" && (
              <div className="mx-auto w-full max-w-3xl p-4">
                <pre
                  className={`whitespace-pre-wrap break-words rounded-xl border border-border bg-surface p-5 font-mono leading-[1.75] text-ink ${monoSize}`}
                >
                  {aiOutput}
                </pre>
              </div>
            )}
          </>
        ) : (
          <div className="relative flex h-full min-h-[420px] flex-col items-center justify-center gap-3 p-8 text-center font-sans">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-24 rounded-full pointer-events-none -z-10 blur-3xl opacity-75"
              style={{ background: "var(--glow)" }}
            />
            <div className="w-12 h-12 rounded-full bg-surface-elevated border border-border text-action flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-action" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-ink">
                Ready to generate
              </p>
              <p className="max-w-xs text-xs text-ink-muted leading-relaxed">
                Fill in the template parameters and choose Generate. Your content will stream in here.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      {showWordCount && hasOutput && (
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-surface px-4 py-2 font-sans text-xs text-ink-muted">
          <div className="flex min-w-0 items-center gap-2 tabular-nums">
            <span className="font-medium text-ink">
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
                className="rounded-full bg-surface-elevated border border-border px-2.5 py-0.5 font-medium text-ink-muted hover:text-ink transition-colors"
              >
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={() => setFontSize((p) => (p === "sm" ? "base" : p === "base" ? "lg" : "sm"))}
              title={`Text size: ${FONT_LABEL[fontSize]}`}
              aria-label={`Text size: ${FONT_LABEL[fontSize]}. Click to change.`}
              className="rounded-full border border-border px-2 py-0.5 text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface-elevated transition-colors"
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