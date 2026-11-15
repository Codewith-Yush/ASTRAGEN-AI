"use client";

import React, { useMemo, useState } from "react";
import TEMPLATES, { TEMPLATE } from "@/data/templates-meta";
import TemplateCard from "./TemplateCard";
import TemplateIcon from "@/components/TemplateIcon";
import { RotateCcw, SearchX, LayoutGrid, List, ChevronRight } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  "All",
  "Blog",
  "YouTube",
  "Social Media",
  "Coding",
  "Marketing",
  "Education",
];

function TemplateListSection({ userSearchInput }: { userSearchInput: string }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const query = userSearchInput.trim().toLowerCase();

  const searchMatches = useMemo(() => {
    return (TEMPLATES as TEMPLATE[]).filter((item) => {
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

  const hasFilters = selectedCategory !== "All";

  const viewBtn = (active: boolean) =>
    `flex h-6 w-6 items-center justify-center rounded-[5px] transition-colors cursor-pointer ${
      active ? "bg-surface text-ink shadow-xs" : "text-ink-dim hover:text-ink"
    }`;

  return (
    <section className="space-y-5 pb-16">
      {/* Tabs + tools */}
      <div className="flex flex-col gap-3 border-b border-border sm:flex-row sm:items-end sm:justify-between">
        <div
          role="tablist"
          aria-label="Template categories"
          className="-mb-px flex w-full items-center gap-5 overflow-x-auto [scrollbar-width:none] sm:w-auto [&::-webkit-scrollbar]:hidden"
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
                className={`inline-flex flex-shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap border-b-2 pb-2.5 pt-1 text-[13px] transition-colors ${
                  isSelected
                    ? "border-ink font-medium text-ink"
                    : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                <span>{category}</span>
                <span className="font-mono text-[11px] tabular-nums text-ink-dim">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-3 self-end pb-2 text-[12px] text-ink-muted sm:self-auto">
          {hasFilters && (
            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              className="inline-flex cursor-pointer items-center gap-1 text-ink-muted transition-colors hover:text-ink"
            >
              <RotateCcw className="h-3 w-3" strokeWidth={1.5} />
              <span>Reset</span>
            </button>
          )}

          <span className="font-mono tabular-nums">
            {templateList.length} {templateList.length === 1 ? "template" : "templates"}
          </span>

          <div className="flex items-center gap-0.5 rounded-[6px] border border-border bg-surface-elevated p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
              className={viewBtn(viewMode === "grid")}
            >
              <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
              className={viewBtn(viewMode === "list")}
            >
              <List className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {templateList.length > 0 ? (
        viewMode === "grid" ? (
          <div className="ed-wrap">
            <div className="ed-grid">
              {templateList.map((item: TEMPLATE, i: number) => (
                <TemplateCard key={item.slug} {...item} index={i} />
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border overflow-hidden rounded-[8px] border border-border bg-surface animate-in fade-in duration-200">
            {templateList.map((item: TEMPLATE, i: number) => (
              <Link
                key={`list-${item.slug}`}
                href={`/dashboard/content/${item.slug}`}
                className="group flex items-center justify-between gap-3 px-3.5 py-2.5 transition-colors hover:bg-surface-elevated focus-visible:bg-surface-elevated focus-visible:outline-none"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-6 shrink-0 font-mono text-[11px] tabular-nums text-ink-dim">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-border bg-surface-elevated text-ink-muted transition-colors group-hover:text-ink">
                    <TemplateIcon slug={item.slug} className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-[13px] font-medium text-ink">{item.name}</h3>
                    <p className="line-clamp-1 text-[12px] text-ink-muted">{item.desc}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 pl-3">
                  <span className="hidden font-mono text-[10.5px] uppercase tracking-wider text-ink-dim sm:inline">
                    {item.category}
                  </span>
                  <ChevronRight
                    className="h-4 w-4 text-ink-dim transition duration-150 group-hover:translate-x-0.5 group-hover:text-ink"
                    strokeWidth={1.5}
                  />
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-4 rounded-[8px] border border-dashed border-border bg-surface px-6 py-14 text-center">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-[6px] border border-border bg-surface-elevated text-ink-muted">
            <SearchX className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <h3 className="text-[14px] font-medium text-ink">No matching templates</h3>
            <p className="mx-auto max-w-sm text-[12.5px] leading-relaxed text-ink-muted">
              {userSearchInput.trim()
                ? <>Nothing matches &quot;{userSearchInput}&quot;. Try another keyword or category.</>
                : <>Nothing in this category yet.</>}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedCategory("All")}
            className="h-8 cursor-pointer rounded-[6px] border border-border bg-surface px-3 text-[13px] text-ink transition-colors hover:border-border-subtle hover:bg-surface-elevated"
          >
            Show all templates
          </button>
        </div>
      )}
    </section>
  );
}

export default React.memo(TemplateListSection);