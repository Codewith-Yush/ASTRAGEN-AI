"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Search,
  X,
  Sparkles,
  Command,
  BookOpen,
  Video,
  Code2,
  Share2,
  TrendingUp,
  GraduationCap,
  Layers,
  Zap,
} from "lucide-react";

interface SearchSectionProps {
  onSearchInput: (value: string) => void;
}

const CATEGORY_CHIPS = [
  { name: "All", icon: Layers },
  { name: "Blog", icon: BookOpen },
  { name: "YouTube", icon: Video },
  { name: "Social Media", icon: Share2 },
  { name: "Coding", icon: Code2 },
  { name: "Marketing", icon: TrendingUp },
  { name: "Education", icon: GraduationCap },
];

function SearchSection({ onSearchInput }: SearchSectionProps) {
  const { user } = useUser();
  const [searchText, setSearchText] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [greeting, setGreeting] = useState("Welcome back");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

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
      }, 160);
    }
  };

  const handleTagClick = (tag: string) => {
    setActiveTag(tag);
    handleSearchChange(tag, true);
  };

  const handleClear = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setSearchText("");
    setActiveTag("All");
    onSearchInput("");
    inputRef.current?.focus();
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

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

  const userName = user?.firstName || "Creator";

  return (
    <div className="relative pt-2 pb-6 max-w-4xl mx-auto text-center space-y-6 px-2">
      {/* Decorative ambient background flare */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-36 bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-violet-500/15 blur-2xl rounded-full pointer-events-none -z-10" />

      {/* Greeting & Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span>{greeting}, {userName}</span>
          <span className="w-1 h-1 rounded-full bg-indigo-400" />
          <span className="text-slate-500 dark:text-slate-400 font-normal">Next-Gen Studio</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          What will you{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400">
            create today?
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
          Select an AI engine below or search by keywords to craft publication-ready blogs, YouTube scripts, social posts, and production code.
        </p>
      </div>

      {/* High-tech Command Search Bar */}
      <div className="pt-1 max-w-2xl mx-auto w-full">
        <div className="relative flex items-center bg-white/90 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-md shadow-indigo-500/5 focus-within:ring-4 focus-within:ring-indigo-500/15 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 transition-all duration-200">
          <div className="pl-4 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Search className="w-4.5 h-4.5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchText}
            onChange={(e) => {
              setActiveTag("All");
              handleSearchChange(e.target.value);
            }}
            placeholder="Search engines (e.g. blog title, youtube script, bug fixer, instagram)..."
            className="w-full py-3.5 px-3 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none font-medium"
          />
          {searchText ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="pr-3 hidden sm:flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/70 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Category Filter Pills */}
      <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
        {CATEGORY_CHIPS.map((chip) => {
          const isSelected =
            activeTag === chip.name ||
            (chip.name === "All" && !searchText) ||
            (chip.name !== "All" && searchText.toLowerCase() === chip.name.toLowerCase());
          const Icon = chip.icon;

          return (
            <button
              key={chip.name}
              type="button"
              onClick={() => handleTagClick(chip.name)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/25 scale-105"
                  : "bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{chip.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(SearchSection);
