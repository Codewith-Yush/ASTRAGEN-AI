"use client";

import React, { useMemo, useState } from "react";
import Templates from "@/app/(data)/Templates";
import TemplateCard from "./TemplateCard";
import {
  RotateCcw,
  SearchX,
  LayoutGrid,
  List,
  Sparkles,
  Flame,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export interface TEMPLATE {
  name: string;
  desc: string;
  icon: string;
  category: string;
  slug: string;
  aiPrompt: string;
  form?: FORM[];
}

export interface FORM {
  label: string;
  field: string;
  name: string;
  required?: boolean;
}

const CATEGORIES = [
  "All",
  "Blog",
  "YouTube",
  "Social Media",
  "Coding",
  "Marketing",
  "Writing",
  "Education",
  "Language",
  "Professional",
  "Academic",
  "AI Tools",
];

const FEATURED_SLUGS = new Set([
  "blog-content-creator",
  "youtube-shorts-script-generator",
  "code-generator",
]);

function TemplateListSection({ userSearchInput }: { userSearchInput: string }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const query = userSearchInput.trim().toLowerCase();

  // Templates matching the search only (used for per-category counts)
  const searchMatches = useMemo(() => {
    return (Templates as TEMPLATE[]).filter((item) => {
      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    });
  }, [query]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: searchMatches.length };
    for (const item of searchMatches) {
      const key = item.category.toLowerCase();
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  }, [searchMatches]);

  const templateList = useMemo(() => {
    if (selectedCategory === "All") return searchMatches;
    return searchMatches.filter(
      (item) => item.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [searchMatches, selectedCategory]);

  const featuredTemplates = useMemo(() => {
    return (Templates as TEMPLATE[]).filter((t) => FEATURED_SLUGS.has(t.slug));
  }, []);

  const hasFilters = selectedCategory !== "All" || query.length > 0;
  const isInitialAllView = selectedCategory === "All" && !query;

  return (
    <section className="space-y-8 pb-16 pt-2">
      {/* Featured / Trending Star Engines (Hero Row) */}
      {isInitialAllView && featuredTemplates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Flame className="w-4 h-4 fill-current" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Featured Star Engines
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                Trending
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Hand-picked for highest output quality
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {featuredTemplates.map((item) => (
              <TemplateCard key={`featured-${item.slug}`} {...item} featured={true} />
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs & View Switcher Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
        {/* Scrollable Tabs */}
        <div
          role="tablist"
          aria-label="Template categories"
          className="-mx-1 flex w-full items-center gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:w-auto [&::-webkit-scrollbar]:hidden"
        >
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            const count = counts[category === "All" ? "All" : category.toLowerCase()] ?? 0;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategory(category)}
                className={`inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <span>{category}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isSelected
                      ? "bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900 font-bold"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Tools: View Mode Toggle & Reset */}
        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>
            <strong className="text-slate-800 dark:text-slate-200 font-semibold">{templateList.length}</strong>{" "}
            {templateList.length === 1 ? "engine" : "engines"}
          </span>

          {hasFilters && (
            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {/* Grid vs List toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main List Section */}
      {templateList.length > 0 ? (
        viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {templateList.map((item: TEMPLATE) => (
              <TemplateCard key={item.slug} {...item} />
            ))}
          </div>
        ) : (
          /* Dense List View for productivity */
          <div className="space-y-2">
            {templateList.map((item: TEMPLATE) => (
              <Link
                key={`list-${item.slug}`}
                href={`/dashboard/content/${item.slug}`}
                className="group flex items-center justify-between p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-2xs transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-1.5 shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 pl-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hidden sm:inline-block">
                    {item.category}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-500 group-hover:text-white text-slate-400 flex items-center justify-center transition-all">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        /* Empty State */
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mx-auto">
            <SearchX className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No matching engines found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              We couldn&apos;t find any engines matching &quot;{userSearchInput}&quot;. Try exploring other categories or clearing your search.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedCategory("All")}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white hover:opacity-95 shadow-sm shadow-indigo-500/25 transition-opacity cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </section>
  );
}

export default React.memo(TemplateListSection);
