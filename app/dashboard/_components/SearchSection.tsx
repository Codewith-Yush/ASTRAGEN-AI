"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  BookOpen,
  Video,
  Code2,
  Share2,
  TrendingUp,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import HeroBackdrop from "./HeroBackdrop";

interface SearchSectionProps {
  onSearchInput: (value: string) => void;
}

const CAPABILITY_PILLS = [
  { name: "All", label: "All Templates" },
  { name: "Blog", label: "Blog", icon: BookOpen },
  { name: "YouTube", label: "YouTube", icon: Video },
  { name: "Code", label: "Code", icon: Code2 },
  { name: "Social", label: "Social", icon: Share2 },
  { name: "Marketing", label: "Marketing", icon: TrendingUp },
  { name: "Education", label: "Education", icon: GraduationCap },
];

function SearchSection({ onSearchInput }: SearchSectionProps) {
  const [searchText, setSearchText] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (value: string, immediate: boolean = false) => {
    const val = value === "All" ? "" : value;
    setSearchText(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (immediate) {
      onSearchInput(val);
    } else {
      debounceTimerRef.current = setTimeout(() => {
        onSearchInput(val);
      }, 150);
    }
  };

  const handleTagClick = (name: string) => {
    setActiveTag(name);
    if (name === "All") {
      handleSearchChange("", true);
    } else if (name === "Code") {
      handleSearchChange("Coding", true);
    } else if (name === "Social") {
      handleSearchChange("Social Media", true);
    } else {
      handleSearchChange(name, true);
    }
  };

  const handleClear = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setSearchText("");
    setActiveTag("All");
    onSearchInput("");
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section className="relative isolate -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 md:-mx-8 md:-mt-6">
      <HeroBackdrop />

      <div className="relative z-10 mx-auto max-w-3xl space-y-6 px-4 pb-10 pt-14 text-center sm:pt-16">
        {/* Eyebrow + title */}
        <div className="space-y-2.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-accent-cyan">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span>AI Content Studio</span>
          </span>
          <h1 className="text-page-title font-semibold tracking-tight text-ink">
            Find a template or type your goal
          </h1>
        </div>

        {/* Search */}
        <div className="mx-auto w-full max-w-2xl">
          <div className="relative flex items-center rounded-[10px] border border-border bg-surface/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-md transition-colors focus-within:border-action focus-within:ring-[3px] focus-within:ring-action/15">
            <div className="flex shrink-0 items-center justify-center pl-3.5 pr-2 text-ink-dim">
              <Search className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchText}
              onChange={(e) => {
                setActiveTag("All");
                handleSearchChange(e.target.value);
              }}
              placeholder="Search templates or type a goal (e.g. blog title, code, tweet)..."
              aria-label="Search templates"
              className="w-full bg-transparent px-1 py-3 text-[14px] text-ink placeholder:text-ink-dim focus:outline-none"
            />
            {searchText ? (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search query"
                className="cursor-pointer pr-3.5 text-ink-dim transition-colors hover:text-ink"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            ) : (
              <div className="hidden items-center pr-3 sm:flex">
                <kbd className="rounded-[4px] border border-border bg-surface-elevated px-1.5 py-0.5 font-mono text-[10px] text-ink-dim">
                  ⌘K
                </kbd>
              </div>
            )}
          </div>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          {CAPABILITY_PILLS.map((pill) => {
            const isSelected = activeTag === pill.name;
            const Icon = pill.icon;

            return (
              <button
                key={pill.name}
                type="button"
                onClick={() => handleTagClick(pill.name)}
                aria-pressed={isSelected}
                className={`inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-[6px] border px-2.5 text-[12px] transition-colors ${
                  isSelected
                    ? "border-ink bg-ink font-medium text-canvas"
                    : "border-border bg-surface/70 text-ink-muted backdrop-blur-sm hover:border-border-subtle hover:text-ink"
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />}
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default React.memo(SearchSection);