"use client";

import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Eye,
  FileText,
  Search,
  X,
} from "lucide-react";

import CopyButton from "./CopyButton";
import Templates from "@/app/(data)/Templates";
import type { HISTORY } from "../page";

const DynamicMarkdownPreview = dynamic(
  () =>
    Promise.all([import("react-markdown"), import("remark-gfm")]).then(
      ([markdownMod, gfmMod]) => {
        const Component = markdownMod.default;
        const gfm = gfmMod.default;
        return function PreviewMarkdown({ content }: { content: string }) {
          return <Component remarkPlugins={[gfm]}>{content}</Component>;
        };
      }
    ),
  {
    ssr: false,
    loading: () => (
      <div className="py-8 text-center text-xs text-neutral-400">
        Loading markdown preview...
      </div>
    ),
  }
);

const PAGE_SIZE = 10;

/* ----------------------------- helpers ----------------------------- */

const toDate = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDate = (d: Date | null, withYear = true) =>
  d
    ? d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(withYear && { year: "numeric" }),
      })
    : "—";

const formatFull = (d: Date | null) =>
  d ? d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : undefined;

const countWords = (text: string | null | undefined): number =>
  text ? text.trim().split(/\s+/).filter(Boolean).length : 0;

// Strip common markdown syntax so list previews read as plain text instead of "## **Title**".
const toPlainPreview = (md: string | null | undefined): string =>
  (md || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/* ----------------------------- component ----------------------------- */

export default function HistoryClient({ historyList }: { historyList: HISTORY[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<HISTORY | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Keeps typing snappy even when searching long AI responses.
  const deferredSearch = useDeferredValue(searchTerm);

  const listTopRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // O(1) template lookup instead of a linear scan per row.
  const templateMap = useMemo(
    () => new Map((Templates ?? []).map((t) => [t.slug, t])),
    []
  );
  const getTemplate = useCallback((slug: string) => templateMap.get(slug), [templateMap]);

  // Precompute everything that's expensive once per data change, not per keystroke/render.
  const enriched = useMemo(
    () =>
      historyList.map((item) => {
        const template = templateMap.get(item.templateSlug);
        return {
          item,
          template,
          date: toDate(item.createdAt as string | Date),
          words: countWords(item.aiResponse),
          preview: toPlainPreview(item.aiResponse),
          haystack: [template?.name ?? "", item.templateSlug, item.aiResponse ?? ""]
            .join("\n")
            .toLowerCase(),
        };
      }),
    [historyList, templateMap]
  );

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return q ? enriched.filter((row) => row.haystack.includes(q)) : enriched;
  }, [enriched, deferredSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages); // clamp if data/filter shrinks

  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectedRow = useMemo(
    () => (selectedItem ? enriched.find((r) => r.item.id === selectedItem.id) : null),
    [enriched, selectedItem]
  );
  const selectedTemplate = selectedRow?.template ?? (selectedItem ? getTemplate(selectedItem.templateSlug) : undefined);

  /* ---------------- modal: focus, escape, scroll lock, focus trap ---------------- */
  const closeModal = useCallback(() => setSelectedItem(null), []);

  useEffect(() => {
    if (!selectedItem) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.(); // return focus to the "View" button
    };
  }, [selectedItem, closeModal]);

  const isFiltering = deferredSearch.trim().length > 0;

  return (
    <div className="space-y-4" ref={listTopRef}>
      {/* Search & filter header */}
      {historyList.length > 0 && (
        <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-md">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape" && searchTerm) {
                  e.preventDefault();
                  handleSearchChange("");
                }
              }}
              aria-label="Search history"
              placeholder="Search by template or content..."
              className="w-full rounded-xl border border-neutral-200/90 bg-white py-2 pl-10 pr-9 text-xs text-neutral-900 shadow-xs transition-all [appearance:textfield] placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400/15 dark:border-neutral-800/90 dark:bg-[#121418] dark:text-white dark:focus:border-neutral-600 sm:text-sm [&::-webkit-search-cancel-button]:hidden"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-neutral-400 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40 dark:hover:text-neutral-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <span
            className="self-end text-xs font-medium text-neutral-500 dark:text-neutral-400 sm:self-auto"
            role="status"
            aria-live="polite"
          >
            Showing{" "}
            <strong className="text-neutral-900 dark:text-white">{filtered.length}</strong> of{" "}
            {historyList.length} {historyList.length === 1 ? "draft" : "drafts"}
          </span>
        </div>
      )}

      {/* Table container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 shadow-sm backdrop-blur-md dark:border-slate-800/90 dark:bg-[#0C0E14]/90">
        {filtered.length > 0 ? (
          <>
            <div
              className="hidden grid-cols-12 gap-4 border-b border-slate-200/80 bg-slate-50/80 px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800/80 dark:bg-slate-900/60 dark:text-slate-500 md:grid"
              aria-hidden="true"
            >
              <span className="col-span-3">Engine / Template</span>
              <span className="col-span-4">Draft Preview</span>
              <span className="col-span-2">Created</span>
              <span className="col-span-1">Length</span>
              <span className="col-span-2 text-right">Actions</span>
            </div>

            <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginated.map(({ item, template, date, words, preview }) => {
                const name = template?.name || item.templateSlug;
                return (
                  <li
                    key={item.id}
                    className="space-y-2 p-4 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30 sm:p-5 md:grid md:grid-cols-12 md:items-center md:gap-4 md:space-y-0 md:px-6 md:py-4"
                  >
                    {/* Template */}
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-100 p-2 shadow-2xs dark:border-slate-700/80 dark:bg-slate-800/80">
                        {template?.icon ? (
                          <Image
                            src={template.icon}
                            width={22}
                            height={22}
                            alt=""
                            className="object-contain"
                          />
                        ) : (
                          <FileText className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="line-clamp-1 block text-sm font-semibold text-slate-900 dark:text-white">
                          {name}
                        </span>
                        <span className="block text-[11px] text-slate-400 md:hidden">
                          <time dateTime={date?.toISOString()}>{formatDate(date, false)}</time> ·{" "}
                          {words.toLocaleString()} words
                        </span>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="col-span-4 line-clamp-2 text-xs font-normal leading-relaxed text-slate-600 dark:text-slate-300">
                      {preview || (
                        <span className="italic text-slate-400">No output generated</span>
                      )}
                    </div>

                    {/* Date */}
                    <div className="col-span-2 hidden text-xs font-medium text-slate-500 dark:text-slate-400 md:block">
                      <time dateTime={date?.toISOString()} title={formatFull(date)}>
                        {formatDate(date)}
                      </time>
                    </div>

                    {/* Words */}
                    <div className="col-span-1 hidden font-mono text-xs font-medium text-slate-500 dark:text-slate-400 md:block">
                      {words.toLocaleString()}w
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center justify-end gap-1.5 pt-1 md:pt-0">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        aria-label={`View full draft: ${name}`}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>View</span>
                      </button>

                      <Link
                        href={`/dashboard/content/${item.templateSlug}`}
                        aria-label={`Open template: ${name}`}
                        title="Open template"
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>

                      <CopyButton aiResponse={item.aiResponse || ""} />
                    </div>
                  </li>
                );
              })}
            </ul>

            {totalPages > 1 && (
              <nav
                aria-label="History pagination"
                className="flex items-center justify-between border-t border-neutral-200/80 bg-neutral-50/50 px-4 py-3 text-xs dark:border-neutral-800/80 dark:bg-neutral-900/30 sm:px-6"
              >
                <span className="text-neutral-500 dark:text-neutral-400">
                  Page <strong className="text-neutral-900 dark:text-white">{safePage}</strong> of{" "}
                  <strong className="text-neutral-900 dark:text-white">{totalPages}</strong>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage === 1}
                    aria-label="Previous page"
                    className="inline-flex items-center gap-1 rounded-lg border border-neutral-200/80 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 shadow-xs transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800/80 dark:bg-[#121418] dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage >= totalPages}
                    aria-label="Next page"
                    className="inline-flex items-center gap-1 rounded-lg border border-neutral-200/80 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 shadow-xs transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800/80 dark:bg-[#121418] dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </nav>
            )}
          </>
        ) : (
          <div className="space-y-3 p-12 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800">
              <Clock3 className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              {isFiltering ? "No matching history" : "No history yet"}
            </h3>
            <p className="mx-auto max-w-sm text-xs text-neutral-500 dark:text-neutral-400">
              {isFiltering
                ? `No drafts match "${deferredSearch.trim()}". Try another search term.`
                : "You haven't generated any content yet. Choose a template to start drafting!"}
            </p>
            {isFiltering ? (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-700 shadow-xs transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Clear search
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs transition-opacity hover:opacity-90 dark:bg-white dark:text-neutral-900"
              >
                <span>Explore Templates</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Full content modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          onMouseDown={(e) => {
            // Close only when the backdrop itself is clicked, not when a drag ends on it.
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl animate-in zoom-in-95 duration-150 dark:border-neutral-800 dark:bg-[#121418]"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4 dark:border-neutral-800 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 p-1.5 dark:bg-neutral-800">
                  {selectedTemplate?.icon ? (
                    <Image
                      src={selectedTemplate.icon}
                      width={20}
                      height={20}
                      alt=""
                      className="object-contain"
                    />
                  ) : (
                    <FileText className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3
                    id={titleId}
                    className="line-clamp-1 text-sm font-semibold text-neutral-900 dark:text-white"
                  >
                    {selectedTemplate?.name || selectedItem.templateSlug}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                    <span>{(selectedRow?.words ?? countWords(selectedItem.aiResponse)).toLocaleString()} words</span>
                    <span aria-hidden="true">·</span>
                    <time
                      dateTime={selectedRow?.date?.toISOString()}
                      title={formatFull(selectedRow?.date ?? null)}
                    >
                      {formatDate(selectedRow?.date ?? null)}
                    </time>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <CopyButton aiResponse={selectedItem.aiResponse || ""} />
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={closeModal}
                  aria-label="Close"
                  className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="prose max-w-none flex-1 overflow-y-auto p-5 text-xs leading-relaxed text-neutral-800 dark:prose-invert dark:text-neutral-200 sm:p-6 sm:text-sm">
              {selectedItem.aiResponse ? (
                <DynamicMarkdownPreview content={selectedItem.aiResponse} />
              ) : (
                <p className="italic text-neutral-400">No content generated</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/50 px-5 py-3 dark:border-neutral-800 dark:bg-neutral-900/30 sm:px-6">
              <Link
                href={`/dashboard/content/${selectedItem.templateSlug}`}
                className="inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-neutral-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40 dark:text-neutral-300"
              >
                <span>Open in Studio</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/50 dark:bg-white dark:text-neutral-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}