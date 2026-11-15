"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";
import TEMPLATES, { TEMPLATE } from "@/data/templates-meta";
import TemplateIcon from "@/components/TemplateIcon";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return (TEMPLATES as TEMPLATE[]).slice(0, 8);
    return (TEMPLATES as TEMPLATE[])
      .filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.desc.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query]);

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    router.push(`/dashboard/content/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? Math.max(0, filtered.length - 1) : prev - 1
      );
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex].slug);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-xl rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center border-b border-border px-4">
          <Search className="w-4 h-4 text-ink-muted mr-3" strokeWidth={1.5} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search templates or type a goal…"
            aria-label="Quick search templates"
            className="w-full py-4 text-sm bg-transparent text-ink placeholder:text-ink-dim focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-ink-muted hover:text-ink p-1 cursor-pointer"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          ) : (
            <kbd className="px-2 py-0.5 text-[10px] font-mono text-ink-dim bg-surface-elevated rounded-full border border-border">
              ESC
            </kbd>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-ink-muted">
              No matching templates found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => handleSelect(item.slug)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-surface-elevated text-ink"
                      : "text-ink-muted hover:text-ink hover:bg-surface-elevated"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 text-ink-muted">
                      <TemplateIcon slug={item.slug} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block font-medium text-xs text-ink truncate">
                        {item.name}
                      </span>
                      <span className="block text-[11px] text-ink-dim truncate">
                        {item.desc}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-2">
                    <span className="text-[10px] uppercase tracking-wider text-accent-cyan px-2 py-0.5 rounded-full bg-surface border border-border font-medium">
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-ink-dim" strokeWidth={1.5} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="border-t border-border bg-surface-elevated px-4 py-2 flex items-center justify-between text-[11px] text-ink-dim">
          <span>Navigate with ↑ ↓ keys</span>
          <span>Press Enter to launch</span>
        </div>
      </div>
    </div>
  );
}
