"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Sparkles } from "lucide-react";

interface SearchSectionProps {
  onSearchInput: (value: string) => void;
}

const QUICK_TAGS = [
  "Blog",
  "YouTube",
  "Instagram",
  "Coding",
  "Email",
  "SEO",
];

function SearchSection({ onSearchInput }: SearchSectionProps) {
  const [searchText, setSearchText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    onSearchInput(value);
  };

  const handleClear = () => {
    setSearchText("");
    onSearchInput("");
    inputRef.current?.focus();
  };

  // Keyboard shortcut: Cmd+K / Ctrl+K to focus search input
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
    <div className="py-6 sm:py-8 md:py-10 max-w-3xl mx-auto text-center space-y-4 px-2">
      {/* Badge & Title */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
        <Sparkles className="w-3.5 h-3.5" />
        <span>50+ AI Content Engines</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          What would you like to create today?
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Select a template below or type keywords to generate high-converting blog posts, social captions, code, and copy.
        </p>
      </div>

      {/* Modern Minimalist Search Input */}
      <div className="pt-2 max-w-xl mx-auto w-full">
        <div className="relative flex items-center bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-200">
          <Search className="w-4 h-4 ml-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search templates (e.g. blog, youtube, instagram, code)..."
            className="w-full py-3 sm:py-3.5 px-3 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          {searchText ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="mr-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="mr-4 hidden sm:flex items-center gap-1 text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
              <span>⌘K</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap pt-3 text-[11px]">
          <span className="text-slate-400 hidden sm:inline">Try:</span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleSearchChange(tag)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SearchSection;
