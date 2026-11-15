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
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Eye,
  Search,
  X,
  Sparkles,
} from "lucide-react";

import CopyButton from "./CopyButton";
import TEMPLATES from "@/data/templates-meta";
import TemplateIcon from "@/components/TemplateIcon";
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
      <div className="py-8 text-center text-xs text-ink-muted">
        Loading markdown preview...
      </div>
    ),
  }
);

const PAGE_SIZE = 10;

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

export default function HistoryClient({ historyList }: { historyList: HISTORY[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<HISTORY | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const deferredSearch = useDeferredValue(searchTerm);

  const listTopRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const templateMap = useMemo(
    () => new Map((TEMPLATES ?? []).map((t) => [t.slug, t])),
    []
  );

  const getTemplate = useCallback(
    (slug: string) => templateMap.get(slug),
    [templateMap]
  );

  const enriched = useMemo(() => {
    return historyList.map((item) => {
      const template = templateMap.get(item.templateSlug);
      const parsedDate = toDate(item.createdAt);
      const words = countWords(item.aiResponse);
      const plain = toPlainPreview(item.aiResponse);
      return {
        item,
        template,
        date: parsedDate,
        words,
        plainPreview: plain,
        haystack: [template?.name ?? "", item.templateSlug, item.aiResponse ?? ""]
          .join(" ")
          .toLowerCase(),
      };
    });
  }, [historyList, templateMap]);

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return enriched;
    return enriched.filter((row) => row.haystack.includes(q));
  }, [enriched, deferredSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

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
      previouslyFocused?.focus?.();
    };
  }, [selectedItem, closeModal]);

  const isFiltering = deferredSearch.trim().length > 0;

  return (
    <div className="space-y-4" ref={listTopRef}>
      {/* Search pill at the top */}
      {historyList.length > 0 && (
        <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-md">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim"
              aria-hidden="true"
              strokeWidth={1.5}
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
              placeholder="Search by template or content…"
              className="w-full rounded-full border border-border bg-surface py-2 pl-10 pr-9 text-xs text-ink placeholder:text-ink-dim focus:outline-none focus:border-action sm:text-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-ink-muted">
            <span className="tabular-nums">
              Showing{" "}
              <strong className="text-ink font-semibold">
                {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filtered.length)}
              </strong>{" "}
              of {filtered.length}
            </span>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Clock3 className="mb-3 h-10 w-10 text-ink-dim" strokeWidth={1.5} />
            <h3 className="text-base font-semibold text-ink">
              {isFiltering ? "No matching records found" : "No history records yet"}
            </h3>
            <p className="mt-1 max-w-sm text-xs text-ink-muted leading-relaxed">
              {isFiltering
                ? `No past generations match "${searchTerm}". Try a different keyword.`
                : "Your generated blogs, scripts, social posts, and code will be saved here automatically."}
            </p>
            {isFiltering ? (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="mt-4 rounded-full border border-border bg-surface-elevated px-4 py-1.5 text-xs font-medium text-ink hover:border-border-subtle transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-action px-4 py-2 text-xs font-medium text-action-ink hover:bg-action-hover transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>Explore Templates</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="History table">
              <thead className="border-b border-border bg-surface-elevated text-label text-ink-dim">
                <tr>
                  <th scope="col" className="px-5 py-3">Template</th>
                  <th scope="col" className="hidden sm:table-cell px-5 py-3">Preview</th>
                  <th scope="col" className="px-5 py-3">Words</th>
                  <th scope="col" className="px-5 py-3">Date</th>
                  <th scope="col" className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map((row) => {
                  const { item, template, date, words, plainPreview } = row;
                  const name = template?.name || item.templateSlug;
                  return (
                    <tr
                      key={item.id}
                      className="group transition-colors hover:bg-surface-elevated"
                    >
                      {/* Template Name & Icon */}
                      <td className="px-5 py-3.5 font-medium text-ink">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-border flex items-center justify-center shrink-0 text-ink-muted">
                            <TemplateIcon slug={item.templateSlug} className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="block truncate font-semibold text-ink">
                              {name}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-accent-cyan">
                              {template?.category || "AI Engine"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Snippet Preview */}
                      <td className="hidden sm:table-cell max-w-xs px-5 py-3.5 text-ink-muted">
                        <span className="line-clamp-1">{plainPreview || "—"}</span>
                      </td>

                      {/* Words count (tabular) */}
                      <td className="whitespace-nowrap px-5 py-3.5 tabular-nums text-ink-muted">
                        {words.toLocaleString()}
                      </td>

                      {/* Date (tabular) */}
                      <td className="whitespace-nowrap px-5 py-3.5 tabular-nums text-ink-muted">
                        <time dateTime={date?.toISOString()} title={formatFull(date)}>
                          {formatDate(date)}
                        </time>
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            aria-label={`View ${name}`}
                            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink hover:border-action hover:text-action transition-colors cursor-pointer"
                          >
                            <Eye className="h-3 w-3" strokeWidth={1.5} />
                            <span>View</span>
                          </button>
                          <CopyButton aiResponse={item.aiResponse || ""} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-ink-muted">
            <span className="tabular-nums">
              Page <strong className="text-ink font-semibold">{safePage}</strong> of{" "}
              <strong className="text-ink font-semibold">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage <= 1}
                aria-label="Previous page"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-ink-muted transition-colors hover:text-ink hover:bg-surface-elevated disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage >= totalPages}
                aria-label="Next page"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-ink-muted transition-colors hover:text-ink hover:bg-surface-elevated disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right-side Slide-Over Drawer (Plan v3 Section 5) */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={closeModal}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="w-screen max-w-xl bg-surface border-l border-border rounded-l-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-surface-elevated border border-border flex items-center justify-center shrink-0 text-ink-muted">
                    <TemplateIcon slug={selectedItem.templateSlug} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 id={titleId} className="font-semibold text-base text-ink truncate">
                      {selectedTemplate?.name || selectedItem.templateSlug}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-ink-muted tabular-nums">
                      <span>{(selectedRow?.words ?? countWords(selectedItem.aiResponse)).toLocaleString()} words</span>
                      <span>·</span>
                      <time dateTime={selectedRow?.date?.toISOString()}>
                        {formatDate(selectedRow?.date ?? null)}
                      </time>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CopyButton aiResponse={selectedItem.aiResponse || ""} />
                  <button
                    ref={closeBtnRef}
                    type="button"
                    onClick={closeModal}
                    aria-label="Close drawer"
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-elevated transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Drawer Body (Markdown preview) */}
              <div className="prose max-w-none flex-1 overflow-y-auto p-6 text-sm leading-relaxed text-ink dark:prose-invert">
                {selectedItem.aiResponse ? (
                  <DynamicMarkdownPreview content={selectedItem.aiResponse} />
                ) : (
                  <p className="italic text-ink-muted">No content recorded.</p>
                )}
              </div>

              {/* Drawer Footer with Re-run in Studio button */}
              <div className="flex items-center justify-between border-t border-border bg-surface-elevated px-6 py-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-full border border-border text-xs font-medium text-ink hover:bg-surface transition-colors cursor-pointer"
                >
                  Close
                </button>
                <Link
                  href={`/dashboard/content/${selectedItem.templateSlug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-action text-action-ink hover:bg-action-hover text-xs font-medium transition-colors shadow-xs"
                >
                  <span>Re-run in Studio</span>
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
