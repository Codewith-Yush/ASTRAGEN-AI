import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse pb-12">
      {/* Top Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
        <div className="space-y-2">
          <div className="w-48 h-5 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          <div className="w-72 h-3.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/60" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 h-[420px] rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 p-6 space-y-4">
          <div className="w-36 h-4 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="w-full h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800/60" />
          <div className="w-full h-24 rounded-xl bg-neutral-100 dark:bg-neutral-800/60" />
          <div className="w-full h-11 rounded-xl bg-neutral-900/10 dark:bg-white/10" />
        </div>
        <div className="lg:col-span-7 h-[620px] rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 p-6 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <p className="text-xs font-medium text-neutral-400">Loading AI workspace...</p>
        </div>
      </div>
    </div>
  );
}
