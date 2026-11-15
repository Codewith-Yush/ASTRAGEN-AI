import React from "react";

export default function HistoryLoading() {
  return (
    <div className="space-y-6 pb-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-44 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
            <div className="h-5 w-16 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
          </div>
          <div className="h-4 w-72 bg-neutral-100 dark:bg-neutral-800/60 rounded-md" />
        </div>
        <div className="h-9 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="h-10 w-full max-w-md bg-surface border border-border rounded-full shadow-xs" />

      {/* Table Skeleton */}
      <div className="border border-border rounded-2xl bg-surface shadow-xs divide-y divide-border">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-14 w-full flex items-center justify-between px-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-elevated" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-32 bg-surface-elevated rounded" />
                <div className="h-2.5 w-48 bg-surface-elevated rounded" />
              </div>
            </div>
            <div className="h-7 w-16 bg-surface-elevated rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
