"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FileText,
  Search,
  X,
  ExternalLink,
  Eye,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CopyButton from "./CopyButton";
import Templates from "@/app/(data)/Templates";
import type { HISTORY } from "../page";

export default function HistoryClient({
  historyList,
}: {
  historyList: HISTORY[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<HISTORY | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const getTemplate = (slug: string) => {
    return Templates?.find((item) => item.slug === slug);
  };

  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) return historyList;
    const lower = searchTerm.toLowerCase();
    return historyList.filter((item) => {
      const template = getTemplate(item.templateSlug);
      const nameMatch = template?.name.toLowerCase().includes(lower);
      const slugMatch = item.templateSlug.toLowerCase().includes(lower);
      const contentMatch = (item.aiResponse || "").toLowerCase().includes(lower);
      return nameMatch || slugMatch || contentMatch;
    });
  }, [historyList, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / pageSize));

  // Reset page when search term changes
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredHistory.slice(startIndex, startIndex + pageSize);
  }, [filteredHistory, currentPage, pageSize]);

  const countWords = (text: string | null): number => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const selectedTemplate = selectedItem
    ? getTemplate(selectedItem.templateSlug)
    : null;

  return (
    <div className="space-y-5">
      {/* Search & Filter Header */}
      {historyList.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Filter drafts by template or keywords..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400 self-end sm:self-auto font-medium">
            Showing <strong className="text-slate-900 dark:text-white">{filteredHistory.length}</strong> of {historyList.length} drafts
          </span>
        </div>
      )}

      {/* Main Table / Card Container */}
      <div className="bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
        {filteredHistory.length > 0 ? (
          <>
            {/* Desktop Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <span className="col-span-3">Template</span>
              <span className="col-span-4">Output Preview</span>
              <span className="col-span-2">Date</span>
              <span className="col-span-1">Words</span>
              <span className="col-span-2 text-right">Actions</span>
            </div>

            {/* List Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {paginatedHistory.map((item) => {
                const template = getTemplate(item.templateSlug);
                const date =
                  typeof item.createdAt === "string"
                    ? new Date(item.createdAt)
                    : item.createdAt;

                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 md:px-6 md:py-4 md:grid md:grid-cols-12 md:gap-4 md:items-center hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors space-y-3 md:space-y-0"
                  >
                    {/* Template Info */}
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-2 flex-shrink-0">
                        {template?.icon ? (
                          <Image
                            src={template.icon}
                            width={22}
                            height={22}
                            alt={`${template.name || "template"} icon`}
                            className="object-contain"
                          />
                        ) : (
                          <FileText className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1 block">
                          {template?.name || item.templateSlug}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block md:hidden">
                          {date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })} · {countWords(item.aiResponse)}w
                        </span>
                      </div>
                    </div>

                    {/* AI Preview */}
                    <div className="col-span-4 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.aiResponse || "No content generated"}
                    </div>

                    {/* Date */}
                    <div className="col-span-2 text-xs text-slate-500 dark:text-slate-400 hidden md:block">
                      {date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>

                    {/* Word Count */}
                    <div className="col-span-1 hidden md:block">
                      <span className="inline-block text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {countWords(item.aiResponse)}w
                      </span>
                    </div>

                    {/* Actions: View Full & Copy */}
                    <div className="col-span-2 flex items-center justify-end gap-1.5 pt-1 md:pt-0">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                        title="View Full Content"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      <Link
                        href={`/dashboard/content/${item.templateSlug}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Open Template"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <CopyButton aiResponse={item.aiResponse || ""} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-3.5 bg-slate-50/70 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Page <strong className="text-slate-900 dark:text-white">{currentPage}</strong> of{" "}
                  <strong className="text-slate-900 dark:text-white">{totalPages}</strong>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0E131F] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium shadow-xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0E131F] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium shadow-xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mx-auto">
              <Clock3 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {searchTerm ? "No matching history" : "No history found"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchTerm
                ? `No drafts match "${searchTerm}". Try searching for another keyword.`
                : "You haven't generated any content yet. Choose a template to start drafting with AI!"}
            </p>
            {!searchTerm && (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
              >
                <span>Explore Templates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Full Content View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-2 flex-shrink-0">
                  {selectedTemplate?.icon ? (
                    <Image
                      src={selectedTemplate.icon}
                      width={22}
                      height={22}
                      alt="Template Icon"
                      className="object-contain"
                    />
                  ) : (
                    <FileText className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">
                    {selectedTemplate?.name || selectedItem.templateSlug}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>
                      {countWords(selectedItem.aiResponse)} words
                    </span>
                    <span>·</span>
                    <span>
                      {typeof selectedItem.createdAt === "string"
                        ? new Date(selectedItem.createdAt).toLocaleDateString()
                        : selectedItem.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CopyButton aiResponse={selectedItem.aiResponse || ""} />
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedItem.aiResponse || "No content generated"}
              </ReactMarkdown>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <Link
                href={`/dashboard/content/${selectedItem.templateSlug}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>Open in Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 transition-colors"
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
